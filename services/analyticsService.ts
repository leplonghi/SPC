import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { SUPER_ADMIN_EMAIL } from '../data/adminConfig';

export interface VisitorSession {
  sessionId: string;
  dateKey: string; // YYYY-MM-DD
  startedAt: string; // ISO
  lastActiveAt: string; // ISO
  durationSeconds: number;
  city: string;
  region: string;
  country: string;
  device: 'Celular' | 'Tablet' | 'Computador';
  browser: string;
  referrer: string;
  pagesVisited: string[];
  pageViews: number;
}

export type ReportTriggerMode = 'daily' | 'weekly' | 'every_n_visits';

export interface AnalyticsReportConfig {
  recipientEmail: string;
  enabled: boolean;
  mode: ReportTriggerMode;
  everyNVisits: number;
  lastSentAt: string | null;
  lastSentTotalVisits: number;
  gaMeasurementId?: string;
}

const SESSION_STORAGE_KEY = 'spc_visitor_session_v1';
const GEO_CACHE_KEY = 'spc_visitor_geo_v1';
const LOCAL_SESSIONS_KEY = 'spc_analytics_sessions_mirror_v1';
const LOCAL_CONFIG_KEY = 'spc_analytics_report_config_v1';

const DEFAULT_REPORT_CONFIG: AnalyticsReportConfig = {
  recipientEmail: SUPER_ADMIN_EMAIL, // leplonghi@gmail.com
  enabled: true,
  mode: 'every_n_visits',
  everyNVisits: 10,
  lastSentAt: null,
  lastSentTotalVisits: 0,
  gaMeasurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || import.meta.env.VITE_GA_MEASUREMENT_ID || ''
};

function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function detectDevice(): 'Celular' | 'Tablet' | 'Computador' {
  if (typeof navigator === 'undefined') return 'Computador';
  const ua = navigator.userAgent || '';
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Celular';
  }
  return 'Computador';
}

function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'Outro';
  const ua = navigator.userAgent || '';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  return 'Navegador Web';
}

function detectReferrer(): string {
  if (typeof document === 'undefined' || !document.referrer) return 'Acesso Direto';
  try {
    const url = new URL(document.referrer);
    if (typeof window !== 'undefined' && url.hostname === window.location.hostname) {
      return 'Navegação Interna';
    }
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host.includes('google.')) return 'Busca Google';
    if (host.includes('bing.')) return 'Busca Bing';
    if (host.includes('instagram.')) return 'Instagram';
    if (host.includes('facebook.') || host.includes('fb.')) return 'Facebook';
    if (host.includes('whatsapp.') || host.includes('wa.me')) return 'WhatsApp';
    if (host.includes('ma.gov.br')) return `Portal Gov MA (${host})`;
    return host;
  } catch {
    return 'Acesso Direto';
  }
}

interface GeoInfo {
  city: string;
  region: string;
  country: string;
}

/**
 * Obtém a localização aproximada (Cidade / Estado / País) de forma anônima,
 * sem armazenar o endereço IP bruto (conformidade integral com a LGPD).
 */
async function resolveAnonymousLocation(): Promise<GeoInfo> {
  try {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as GeoInfo;
    }
  } catch {
    /* ignore storage error */
  }

  // Tentativa 1: ipwho.is (HTTPS gratuito, sem chave, retorna cidade/estado/país)
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch('https://ipwho.is/?lang=pt-BR', { signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.city) {
        const geo: GeoInfo = {
          city: String(data.city || 'Não identificada').slice(0, 60),
          region: String(data.region_code || data.region || 'MA').slice(0, 40),
          country: String(data.country || 'Brasil').slice(0, 50)
        };
        try {
          sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo));
        } catch {
          /* ignore */
        }
        return geo;
      }
    }
  } catch {
    /* fallback below */
  }

  // Tentativa 2: ipapi.co/json/
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.city) {
        const geo: GeoInfo = {
          city: String(data.city || 'Não identificada').slice(0, 60),
          region: String(data.region_code || data.region || 'MA').slice(0, 40),
          country: String(data.country_name || 'Brasil').slice(0, 50)
        };
        try {
          sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo));
        } catch {
          /* ignore */
        }
        return geo;
      }
    }
  } catch {
    /* fallback below */
  }

  // Fallback por fuso horário do navegador (sem rede externa ou com bloqueador de anúncios)
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const fallback: GeoInfo = tz.includes('Fortaleza') || tz.includes('Belem') || tz.includes('Recife')
    ? { city: 'Região Nordeste (fuso local)', region: 'MA/NE', country: 'Brasil' }
    : tz.includes('America/')
      ? { city: `Brasil (${tz.split('/')[1] || 'Local'})`, region: 'BR', country: 'Brasil' }
      : { city: 'Origem protegida por navegador', region: '—', country: 'Brasil' };

  try {
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(fallback));
  } catch {
    /* ignore */
  }
  return fallback;
}

function getLocalSessionsMirror(): VisitorSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function upsertLocalSessionMirror(session: VisitorSession): void {
  try {
    const list = getLocalSessionsMirror();
    const idx = list.findIndex((s) => s.sessionId === session.sessionId);
    if (idx >= 0) {
      list[idx] = session;
    } else {
      list.unshift(session);
    }
    // Mantém até 500 sessões no espelho local
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(list.slice(0, 500)));
  } catch {
    /* ignore */
  }
}

/**
 * Inicializa Google Analytics 4 (gtag.js) se houver um Measurement ID configurado.
 */
export function initGoogleAnalytics(measurementId?: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const id = (measurementId || DEFAULT_REPORT_CONFIG.gaMeasurementId || '').trim();
  if (!id || document.getElementById('spc-ga4-script')) return;

  const script = document.createElement('script');
  script.id = 'spc-ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', id, { anonymize_ip: true });
}

export function trackGoogleAnalyticsPageView(path: string): void {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: document.title
    });
  }
}

function loadOrCreateCurrentSession(initialPath: string): VisitorSession {
  const nowIso = new Date().toISOString();
  const today = getTodayDateKey();
  try {
    const existingRaw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existingRaw) {
      const parsed = JSON.parse(existingRaw) as VisitorSession;
      if (parsed && parsed.sessionId) {
        return parsed;
      }
    }
  } catch {
    /* create new */
  }

  const randomPart = Math.random().toString(36).slice(2, 10);
  const sessionId = `vis_${today.replace(/-/g, '')}_${Date.now().toString(36)}_${randomPart}`;

  const fresh: VisitorSession = {
    sessionId,
    dateKey: today,
    startedAt: nowIso,
    lastActiveAt: nowIso,
    durationSeconds: 1,
    city: 'Identificando...',
    region: 'MA',
    country: 'Brasil',
    device: detectDevice(),
    browser: detectBrowser(),
    referrer: detectReferrer(),
    pagesVisited: [initialPath || '/'],
    pageViews: 1
  };

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    /* ignore */
  }
  return fresh;
}

async function persistSessionToFirestore(session: VisitorSession): Promise<void> {
  upsertLocalSessionMirror(session);
  try {
    const ref = doc(db, 'analytics_sessions', session.sessionId);
    await setDoc(
      ref,
      {
        sessionId: session.sessionId,
        dateKey: session.dateKey,
        startedAt: session.startedAt,
        lastActiveAt: session.lastActiveAt,
        durationSeconds: Math.max(1, Math.round(session.durationSeconds)),
        city: session.city,
        region: session.region,
        country: session.country,
        device: session.device,
        browser: session.browser,
        referrer: session.referrer,
        pagesVisited: session.pagesVisited.slice(0, 30),
        pageViews: session.pageViews
      },
      { merge: true }
    );
  } catch {
    // Em ambiente offline ou restrito, o espelho local já preserva os dados.
  }
}

let activeSession: VisitorSession | null = null;
let geoResolved = false;

/**
 * Registra a abertura de uma rota e atualiza a sessão atual do visitante.
 */
export async function recordPageVisit(pathname: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const cleanPath = pathname || '/';

  initGoogleAnalytics();
  trackGoogleAnalyticsPageView(cleanPath);

  if (!activeSession) {
    activeSession = loadOrCreateCurrentSession(cleanPath);
  } else {
    const nowIso = new Date().toISOString();
    activeSession.lastActiveAt = nowIso;
    const elapsed = Math.max(
      activeSession.durationSeconds,
      Math.round((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000)
    );
    activeSession.durationSeconds = Math.min(elapsed, 7200);
    if (!activeSession.pagesVisited.includes(cleanPath)) {
      activeSession.pagesVisited = [...activeSession.pagesVisited, cleanPath].slice(0, 30);
    }
    activeSession.pageViews += 1;
  }

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeSession));
  } catch {
    /* ignore */
  }

  if (!geoResolved) {
    geoResolved = true;
    const geo = await resolveAnonymousLocation();
    if (activeSession) {
      activeSession.city = geo.city;
      activeSession.region = geo.region;
      activeSession.country = geo.country;
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeSession));
      } catch {
        /* ignore */
      }
    }
  }

  if (activeSession) {
    await persistSessionToFirestore(activeSession);
  }
}

/**
 * Atualiza a duração da sessão ativa a cada batimento (ex.: a cada 15s enquanto a aba está visível).
 */
export async function recordSessionHeartbeat(incrementSeconds = 15): Promise<void> {
  if (typeof window === 'undefined') return;
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
  if (!activeSession) {
    activeSession = loadOrCreateCurrentSession(window.location.hash.replace(/^#/, '') || '/');
  }
  activeSession.lastActiveAt = new Date().toISOString();
  activeSession.durationSeconds = Math.min(7200, (activeSession.durationSeconds || 1) + incrementSeconds);
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeSession));
  } catch {
    /* ignore */
  }
  await persistSessionToFirestore(activeSession);
}

/**
 * Busca todas as sessões registradas no Firestore (mescladas com o espelho local)
 * para exibição exclusiva no Painel Administrativo de leplonghi@gmail.com.
 */
export async function fetchVisitorSessions(maxResults = 300): Promise<VisitorSession[]> {
  const byId = new Map<string, VisitorSession>();

  for (const local of getLocalSessionsMirror()) {
    byId.set(local.sessionId, local);
  }

  try {
    const q = query(
      collection(db, 'analytics_sessions'),
      orderBy('startedAt', 'desc'),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    snap.forEach((docSnap) => {
      const data = docSnap.data() as VisitorSession;
      if (data && data.sessionId) {
        byId.set(data.sessionId, data);
      }
    });
  } catch {
    // Se a consulta ordenada exigir índice ou falhar, tenta leitura direta da coleção
    try {
      const snap = await getDocs(collection(db, 'analytics_sessions'));
      snap.forEach((docSnap) => {
        const data = docSnap.data() as VisitorSession;
        if (data && data.sessionId) {
          byId.set(data.sessionId, data);
        }
      });
    } catch {
      /* fallback para espelho local */
    }
  }

  return Array.from(byId.values()).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getAnalyticsReportConfig(): Promise<AnalyticsReportConfig> {
  try {
    const localRaw = localStorage.getItem(LOCAL_CONFIG_KEY);
    const localCfg = localRaw ? (JSON.parse(localRaw) as Partial<AnalyticsReportConfig>) : {};
    const ref = doc(db, 'analytics_config', 'reporting');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const merged = {
        ...DEFAULT_REPORT_CONFIG,
        ...localCfg,
        ...(snap.data() as Partial<AnalyticsReportConfig>),
        recipientEmail: SUPER_ADMIN_EMAIL
      };
      localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(merged));
      return merged;
    }
    return { ...DEFAULT_REPORT_CONFIG, ...localCfg, recipientEmail: SUPER_ADMIN_EMAIL };
  } catch {
    try {
      const localRaw = localStorage.getItem(LOCAL_CONFIG_KEY);
      if (localRaw) {
        return { ...DEFAULT_REPORT_CONFIG, ...JSON.parse(localRaw), recipientEmail: SUPER_ADMIN_EMAIL };
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_REPORT_CONFIG;
  }
}

export async function saveAnalyticsReportConfig(config: AnalyticsReportConfig): Promise<void> {
  const sanitized: AnalyticsReportConfig = {
    ...config,
    recipientEmail: SUPER_ADMIN_EMAIL
  };
  try {
    localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(sanitized));
  } catch {
    /* ignore */
  }
  try {
    await setDoc(doc(db, 'analytics_config', 'reporting'), sanitized, { merge: true });
  } catch {
    /* ignore if offline */
  }
}

export function formatDuration(seconds: number): string {
  const s = Math.max(1, Math.round(seconds || 0));
  if (s < 60) return `${s}s`;
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  if (mins < 60) return `${mins}m ${String(rem).padStart(2, '0')}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

export function buildAnalyticsSummaryText(sessions: VisitorSession[], reasonLabel: string): string {
  const totalSessions = sessions.length;
  const totalPageViews = sessions.reduce((acc, s) => acc + (s.pageViews || 1), 0);
  const avgDuration =
    totalSessions > 0
      ? Math.round(sessions.reduce((acc, s) => acc + (s.durationSeconds || 1), 0) / totalSessions)
      : 0;

  const byDay = new Map<string, { count: number; totalSec: number }>();
  const byLocation = new Map<string, number>();

  for (const s of sessions) {
    const day = byDay.get(s.dateKey) || { count: 0, totalSec: 0 };
    day.count += 1;
    day.totalSec += s.durationSeconds || 1;
    byDay.set(s.dateKey, day);

    const loc = `${s.city} (${s.region}, ${s.country})`;
    byLocation.set(loc, (byLocation.get(loc) || 0) + 1);
  }

  const topDays = Array.from(byDay.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7)
    .map(
      ([d, info]) =>
        `  • ${d}: ${info.count} acesso(s) | duração média: ${formatDuration(info.totalSec / info.count)}`
    )
    .join('\n');

  const topLocations = Array.from(byLocation.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([loc, count]) => `  • ${loc}: ${count} acesso(s)`)
    .join('\n');

  const recentList = sessions
    .slice(0, 10)
    .map(
      (s) =>
        `  - [${s.dateKey} ${new Date(s.startedAt).toLocaleTimeString('pt-BR')}] ${s.city}/${s.region} (${s.device}) • Duração: ${formatDuration(s.durationSeconds)} • Páginas (${s.pageViews}): ${s.pagesVisited.join(' -> ')}`
    )
    .join('\n');

  return `RELATÓRIO DE ACESSOS E VISITANTES — PORTAL SPC MARANHÃO (https://spcmaranhao.web.app)
Destinatário Exclusivo: ${SUPER_ADMIN_EMAIL}
Motivo do Disparo: ${reasonLabel}
Gerado em: ${new Date().toLocaleString('pt-BR')}

1. RESUMO GERAL:
- Total de Visitas (Sessões): ${totalSessions}
- Total de Páginas Visualizadas: ${totalPageViews}
- Duração Média por Visita: ${formatDuration(avgDuration)}

2. ACESSOS POR DIA (ÚLTIMOS DIAS):
${topDays || '  • Sem registros no período.'}

3. ORIGEM DOS VISITANTES (CIDADE / ESTADO / PAÍS):
${topLocations || '  • Sem registros no período.'}

4. ÚLTIMOS 10 ACESSOS DETALHADOS:
${recentList || '  • Sem registros.'}
`;
}

/**
 * Envia o relatório de acessos para leplonghi@gmail.com via FormSubmit AJAX
 * e atualiza os marcadores de último envio na configuração.
 */
export async function sendAnalyticsEmailReport(
  sessions: VisitorSession[],
  reasonLabel = 'Envio sob demanda pelo Painel Admin'
): Promise<{ ok: boolean; message: string }> {
  const summaryText = buildAnalyticsSummaryText(sessions, reasonLabel);

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${SUPER_ADMIN_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        _subject: `[Portal SPC Maranhão] Relatório de Acessos (${sessions.length} visitas) — ${new Date().toLocaleDateString('pt-BR')}`,
        _template: 'box',
        destinatario: SUPER_ADMIN_EMAIL,
        motivo: reasonLabel,
        total_visitas: sessions.length,
        relatorio_completo: summaryText
      })
    });

    const cfg = await getAnalyticsReportConfig();
    await saveAnalyticsReportConfig({
      ...cfg,
      lastSentAt: new Date().toISOString(),
      lastSentTotalVisits: sessions.length
    });

    if (res.ok) {
      return {
        ok: true,
        message: `Relatório enviado automaticamente para ${SUPER_ADMIN_EMAIL}.`
      };
    }
    return {
      ok: false,
      message: `Servidor de e-mail respondeu com status ${res.status}. Utilize o botão de envio direto pelo cliente de e-mail caso seja o primeiro disparo.`
    };
  } catch {
    return {
      ok: false,
      message: `Não foi possível contatar o relay automático neste momento. Você pode abrir diretamente no seu cliente de e-mail para ${SUPER_ADMIN_EMAIL}.`
    };
  }
}

/**
 * Verifica se a meta automática configurada (diária, semanal ou a cada N visitas)
 * foi atingida e dispara o resumo automaticamente para leplonghi@gmail.com.
 */
export async function checkAndTriggerScheduledReport(
  sessions: VisitorSession[]
): Promise<string | null> {
  if (!sessions.length) return null;
  const cfg = await getAnalyticsReportConfig();
  if (!cfg.enabled) return null;

  const now = Date.now();
  const lastSentMs = cfg.lastSentAt ? new Date(cfg.lastSentAt).getTime() : 0;
  const hoursSinceLast = lastSentMs ? (now - lastSentMs) / (1000 * 60 * 60) : 9999;

  if (cfg.mode === 'every_n_visits') {
    const step = Math.max(1, cfg.everyNVisits || 10);
    if (sessions.length - (cfg.lastSentTotalVisits || 0) >= step) {
      const result = await sendAnalyticsEmailReport(
        sessions,
        `Meta automática atingida (${sessions.length} acessos acumulados — ciclo de ${step} acessos)`
      );
      return result.message;
    }
  } else if (cfg.mode === 'daily') {
    if (hoursSinceLast >= 24) {
      const result = await sendAnalyticsEmailReport(
        sessions,
        `Fechamento Diário Automático (${new Date().toLocaleDateString('pt-BR')})`
      );
      return result.message;
    }
  } else if (cfg.mode === 'weekly') {
    if (hoursSinceLast >= 24 * 7) {
      const result = await sendAnalyticsEmailReport(
        sessions,
        `Fechamento Semanal Automático (${new Date().toLocaleDateString('pt-BR')})`
      );
      return result.message;
    }
  }

  return null;
}

