
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  FilePlus,
  Users,
  History,
  BarChart,
  ChevronRight,
  Database,
  UploadCloud,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Search,
  MoreVertical,
  Shield,
  Save,
  Globe,
  Clock,
  Mail,
  Download,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { User, UserRole, Department } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BENS_TOMBADOS, DECRETOS_PDF } from '../data/bensTombados';
import { PUBLIC_LEGAL_DOCUMENTS } from '../data/publicLegalDocuments';
import { MAPAS_HISTORICOS } from '../data/mapasHistoricos';
import { SUPER_ADMIN_EMAIL } from '../data/adminConfig';
import {
  fetchVisitorSessions,
  getAnalyticsReportConfig,
  saveAnalyticsReportConfig,
  sendAnalyticsEmailReport,
  checkAndTriggerScheduledReport,
  buildAnalyticsSummaryText,
  formatDuration,
  initGoogleAnalytics,
  type VisitorSession,
  type AnalyticsReportConfig,
  type ReportTriggerMode
} from '../services/analyticsService';

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${color} text-white`}>
        <Icon size={16} />
      </div>
      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
        <ArrowUpRight size={10} /> {trend}
      </span>
    </div>
    <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">{label}</h4>
    <p className="text-xl font-black text-slate-900">{value}</p>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [tempRole, setTempRole] = useState<UserRole | null>(null);

  // Estados do módulo de Acessos e Visitantes (exclusivo Admin / leplonghi@gmail.com)
  const [visitorSessions, setVisitorSessions] = useState<VisitorSession[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [reportConfig, setReportConfig] = useState<AnalyticsReportConfig>({
    recipientEmail: SUPER_ADMIN_EMAIL,
    enabled: true,
    mode: 'every_n_visits',
    everyNVisits: 10,
    lastSentAt: null,
    lastSentTotalVisits: 0,
    gaMeasurementId: ''
  });
  const [reportStatusMsg, setReportStatusMsg] = useState<string | null>(null);
  const [sendingReport, setSendingReport] = useState(false);

  const loadAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const [sessions, cfg] = await Promise.all([
        fetchVisitorSessions(300),
        getAnalyticsReportConfig()
      ]);
      setVisitorSessions(sessions);
      setReportConfig(cfg);
      if (cfg.gaMeasurementId) {
        initGoogleAnalytics(cfg.gaMeasurementId);
      }
      const autoTriggered = await checkAndTriggerScheduledReport(sessions);
      if (autoTriggered) {
        setReportStatusMsg(autoTriggered);
      }
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (isAdmin && (activeTab === 'analytics' || activeTab === 'overview')) {
      void loadAnalyticsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdmin]);

  const handleSaveReportConfig = async (next: AnalyticsReportConfig) => {
    setReportConfig(next);
    await saveAnalyticsReportConfig(next);
    if (next.gaMeasurementId) {
      initGoogleAnalytics(next.gaMeasurementId);
    }
    setReportStatusMsg(`Configuração salva! Relatórios automáticos configurados para ${SUPER_ADMIN_EMAIL}.`);
  };

  const handleSendReportNow = async () => {
    setSendingReport(true);
    setReportStatusMsg(null);
    try {
      const res = await sendAnalyticsEmailReport(
        visitorSessions,
        `Disparo manual solicitado no Painel Administrativo por ${user?.email || SUPER_ADMIN_EMAIL}`
      );
      setReportStatusMsg(res.message);
      const updatedCfg = await getAnalyticsReportConfig();
      setReportConfig(updatedCfg);
    } finally {
      setSendingReport(false);
    }
  };

  const handleExportSessionsCsv = () => {
    const header = [
      'Sessao_ID',
      'Dia',
      'Inicio_DataHora',
      'Ultima_Atividade',
      'Duracao_Segundos',
      'Duracao_Formatada',
      'Cidade',
      'Estado_Regiao',
      'Pais',
      'Dispositivo',
      'Navegador',
      'Origem_Trafego',
      'Qtd_Paginas',
      'Paginas_Visitadas'
    ];
    const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = visitorSessions.map((s) =>
      [
        esc(s.sessionId),
        esc(s.dateKey),
        esc(new Date(s.startedAt).toLocaleString('pt-BR')),
        esc(new Date(s.lastActiveAt).toLocaleString('pt-BR')),
        esc(s.durationSeconds),
        esc(formatDuration(s.durationSeconds)),
        esc(s.city),
        esc(s.region),
        esc(s.country),
        esc(s.device),
        esc(s.browser),
        esc(s.referrer),
        esc(s.pageViews),
        esc((s.pagesVisited || []).join(' -> '))
      ].join(';')
    );
    const csv = '\uFEFF' + [header.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spc-acessos-visitantes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      fetchUsers();
    }
  }, [activeTab, isAdmin]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsersList(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingUser(null);
      setTempRole(null);
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Erro ao atualizar função do usuário.");
    }
  };

  // --- Import Feature Logic ---
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importLog, setImportLog] = useState<string[]>([]);
  const endOfLogRef = React.useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setImportLog(prev => [...prev, msg]);
    // Auto scroll
    setTimeout(() => endOfLogRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportLog([]);
      setImportProgress(0);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];

    // Simple CSV parser - assuming standard comma separation and minimal quoting for now
    // For robust parsing, a library is better, but this works for simple seeds.
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

    return lines.slice(1).map(line => {
      // Handle commas inside quotes with regex
      const values: string[] = [];
      let inQuote = false;
      let currentValue = '';

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          values.push(currentValue.trim().replace(/^"|"$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/^"|"$/g, ''));

      const obj: any = {};
      headers.forEach((h, i) => {
        let val = values[i] || '';
        // Map common headers to our schema if needed, or keep as is
        if (h === 'lat' || h === 'lng' || h === 'latitude' || h === 'longitude') {
          obj[h === 'latitude' ? 'lat' : h === 'longitude' ? 'lng' : h] = val ? parseFloat(val.replace(',', '.')) : 0;
        } else {
          obj[h] = val;
        }
      });

      // key mapping normalization
      return {
        titulo: obj.titulo || obj.title || obj.nome || obj.name || '',
        cidade: obj.cidade || obj.city || obj.municipio || '',
        localizacao: obj.localizacao || obj.endereco || obj.address || obj.location || '',
        tipologia: obj.tipologia || obj.type || obj.categoria || 'Outros',
        descricao: obj.descricao || obj.description || obj.desc || '',
        lat: obj.lat || obj.latitude || 0,
        lng: obj.lng || obj.longitude || obj.lon || 0,
        ...obj
      };
    });
  };

  const parsePDF = async (buffer: ArrayBuffer) => {
    try {
      // Import PDFJS dynamically to avoid load issues
      const pdfjs = await import('pdfjs-dist');

      // Configure worker
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const loadingTask = pdfjs.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;

      let items: any[] = [];

      addLog(`PDF carregado. ${pdf.numPages} páginas encontradas.`);

      for (let i = 1; i <= pdf.numPages; i++) {
        addLog(`Lendo página ${i}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Basic extraction: join items with space, split by newline
        // Better heuristic: group items by Y position (lines)
        // For this MVP, we take the strings and try to find "listing" patterns

        const strings = textContent.items.map((item: any) => item.str);

        // Simple heuristic: Treat every non-empty line as a potential item title for now
        // Enhancements could include strict regex for "Address - City"

        strings.forEach(str => {
          const cleanStr = str.trim();
          if (cleanStr.length > 5 && !cleanStr.match(/^\d+$/)) {
            items.push({
              titulo: cleanStr,
              cidade: 'Extraído de PDF',
              localizacao: 'A verificar',
              tipologia: 'PDF Import',
              lat: 0,
              lng: 0,
              descricao: `Importado de PDF (Pág ${i})`
            });
          }
        });
      }

      return items;
    } catch (e: any) {
      console.error("PDF Parsing error", e);
      throw new Error("Falha ao ler PDF: " + e.message);
    }
  };

  const handleUpload = async () => {
    if (!importFile) return;
    setImporting(true);
    addLog("Iniciando leitura do arquivo...");

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        let data: any[] = [];

        if (importFile.name.endsWith('.json')) {
          const text = e.target?.result as string;
          data = JSON.parse(text);
          addLog("Arquivo JSON interpretado.");
        } else if (importFile.name.endsWith('.csv')) {
          const text = e.target?.result as string;
          data = parseCSV(text);
          addLog("Arquivo CSV interpretado.");
        } else if (importFile.name.endsWith('.pdf')) {
          if (e.target?.result instanceof ArrayBuffer) {
            // PDF requires ArrayBuffer
            data = await parsePDF(e.target.result);
            addLog(`Extração de PDF concluída. ${data.length} itens encontrados.`);
          } else {
            throw new Error("Erro de leitura de arquivo (Buffer inválido)");
          }
        } else {
          throw new Error("Formato não suportado");
        }

        // Validate basic requirement
        if (!data.length) throw new Error("Arquivo vazio ou nenhum dado extraído");

        setImportTotal(data.length);
        addLog(`${data.length} itens detectados. Iniciando processamento...`);

        // Dynamically import service to avoid circular or early load issues
        const { geocodingService } = await import('../services/GeocodingService');

        await geocodingService.importSeed(data, (count) => {
          setImportProgress(count);
          // We could add more specific logs here via a modified service callback, 
          // but for now we trust the progress count.
          if (count % 5 === 0) addLog(`Processados: ${count}/${data.length}`);
        });

        addLog("Sucesso: Importação finalizada!");
        setTimeout(() => setImporting(false), 2000);

      } catch (err: any) {
        console.error(err);
        addLog(`Erro Crítico: ${err.message}`);
        setImporting(false);
      }
    };

    if (importFile.name.endsWith('.pdf')) {
      reader.readAsArrayBuffer(importFile);
    } else {
      reader.readAsText(importFile);
    }
  };

  // Permission check guarded by PrivateRoute in App.tsx, but good to have safety
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-slate-900 text-white px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center font-bold">SPC</div>
          <div>
            <span className="block text-sm font-bold">Painel Administrativo</span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest">Acesso: {user.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold">{user.name}</span>
            <span className="block text-[10px] text-slate-400">{user.department || 'Gestão Central'}</span>
          </div>
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
            <Users size={20} />
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 bg-white border-r border-slate-200 p-4 space-y-1">
          {[
            { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, role: 'any' },
            { id: 'analytics', label: 'Acessos & Visitantes', icon: BarChart, role: 'admin' },
            { id: 'assets', label: 'Bens Materiais', icon: MapIcon, role: 'any' },
            { id: 'intangible', label: 'Imaterial', icon: FilePlus, role: 'any' },
            { id: 'import', label: 'Importar Dados', icon: UploadCloud, role: 'any' },
            { id: 'users', label: 'Usuários', icon: Users, role: 'admin' },
            { id: 'logs', label: 'Audit Log', icon: History, role: 'admin' },
          ].map(item => {
            if (item.role === 'admin' && !isAdmin) return null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-grow p-6 space-y-6 max-w-6xl mx-auto w-full">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  label="Bens Tombados (DPHAP)"
                  value={String(BENS_TOMBADOS.length)}
                  trend="1979–1993"
                  icon={MapIcon}
                  color="bg-brand-blue"
                />
                <StatCard
                  label="Decretos com PDF"
                  value={String(Object.keys(DECRETOS_PDF).length)}
                  trend={`${BENS_TOMBADOS.filter((b) => DECRETOS_PDF[b.decreto.numero]).length} bens`}
                  icon={FilePlus}
                  color="bg-brand-red"
                />
                <StatCard
                  label="Normas Publicadas"
                  value={String(PUBLIC_LEGAL_DOCUMENTS.length)}
                  trend="Verificadas"
                  icon={Database}
                  color="bg-brand-dark"
                />
                <StatCard
                  label="Plantas Históricas"
                  value={String(MAPAS_HISTORICOS.length)}
                  trend="1698–1912"
                  icon={History}
                  color="bg-amber-500"
                />
              </div>

              {isAdmin && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400">
                      <BarChart size={14} /> Monitoramento de Audiência Ativo ({SUPER_ADMIN_EMAIL})
                    </span>
                    <h3 className="text-base font-bold">
                      {visitorSessions.length} {visitorSessions.length === 1 ? 'visita registrada' : 'visitas registradas'} •{' '}
                      {visitorSessions.reduce((acc, s) => acc + (s.pageViews || 1), 0)} páginas visualizadas
                    </h3>
                    <p className="text-xs text-slate-300">
                      Consulte de onde são os visitantes, os dias de maior acesso, a duração de cada sessão e dispare o relatório por e-mail.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className="px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-black uppercase tracking-wider shrink-0 transition"
                  >
                    Ver Acessos & Visitantes →
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <History size={18} className="text-brand-blue" /> Acervo Público Verificado
                  </h3>
                  <div className="space-y-3">
                    {BENS_TOMBADOS.slice(0, 4).map((bem) => (
                      <div key={bem.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-mono font-bold">
                          #{bem.id}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{bem.nome}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase">
                            {bem.municipio} • DECRETO Nº {bem.decreto.numero} • FOLHA {bem.livro.folha}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Database size={18} className="text-brand-red" /> Integridade do Catálogo Oficial
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-4">
                      <CheckCircle2 size={20} className="text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-green-900">
                          {BENS_TOMBADOS.length} inscrições conferidas com o Livro do Tombo
                        </p>
                        <p className="text-xs text-green-700">
                          Distribuídas em {new Set(BENS_TOMBADOS.map((b) => b.municipio)).size} municípios maranhenses, sem dados fictícios ou não verificados.
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-4">
                      <AlertCircle size={20} className="text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">
                          {BENS_TOMBADOS.filter((b) => !DECRETOS_PDF[b.decreto.numero]).length} bens com decreto apenas em arquivo físico
                        </p>
                        <p className="text-xs text-amber-700">
                          Utilize a Central de Ingestão (/ingestao) para submeter novas digitalizações de decretos do Diário Oficial.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'analytics' && isAdmin && (() => {
            const totalVisits = visitorSessions.length;
            const totalPageViews = visitorSessions.reduce((acc, s) => acc + (s.pageViews || 1), 0);
            const avgDurationSec =
              totalVisits > 0
                ? Math.round(visitorSessions.reduce((acc, s) => acc + (s.durationSeconds || 1), 0) / totalVisits)
                : 0;

            // Agrupamento por Dia
            const byDayMap = new Map<string, { count: number; totalSec: number; pageViews: number }>();
            // Agrupamento por Origem Geográfica (Cidade / Estado / País)
            const byGeoMap = new Map<string, { count: number; totalSec: number }>();
            // Agrupamento por Dispositivo
            const byDeviceMap = new Map<string, number>();

            for (const s of visitorSessions) {
              const d = byDayMap.get(s.dateKey) || { count: 0, totalSec: 0, pageViews: 0 };
              d.count += 1;
              d.totalSec += s.durationSeconds || 1;
              d.pageViews += s.pageViews || 1;
              byDayMap.set(s.dateKey, d);

              const geoKey = `${s.city} • ${s.region} (${s.country})`;
              const g = byGeoMap.get(geoKey) || { count: 0, totalSec: 0 };
              g.count += 1;
              g.totalSec += s.durationSeconds || 1;
              byGeoMap.set(geoKey, g);

              byDeviceMap.set(s.device, (byDeviceMap.get(s.device) || 0) + 1);
            }

            const daysList = Array.from(byDayMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
            const geoList = Array.from(byGeoMap.entries()).sort((a, b) => b[1].count - a[1].count);
            const maxDayCount = Math.max(1, ...daysList.map(([, v]) => v.count));
            const maxGeoCount = Math.max(1, ...geoList.map(([, v]) => v.count));

            const mailtoReportHref = `mailto:${SUPER_ADMIN_EMAIL}?subject=${encodeURIComponent(
              `[Portal SPC Maranhão] Relatório de Acessos (${totalVisits} visitas) — ${new Date().toLocaleDateString('pt-BR')}`
            )}&body=${encodeURIComponent(buildAnalyticsSummaryText(visitorSessions, 'Relatório exportado pelo Painel Administrativo'))}`;

            return (
              <div className="space-y-6">
                {/* Cabeçalho e Ações Rápidas */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-brand-blue">
                      <Globe size={14} /> Telemetria & Audiência do Portal (LGPD)
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      Painel de Acessos, Origem Geográfica e Duração
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visualização e relatórios configurados exclusivamente para <strong>{SUPER_ADMIN_EMAIL}</strong>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void loadAnalyticsData()}
                      disabled={loadingAnalytics}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                    >
                      <RefreshCw size={14} className={loadingAnalytics ? 'animate-spin' : ''} />
                      <span>Atualizar</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportSessionsCsv}
                      disabled={totalVisits === 0}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition disabled:opacity-40"
                    >
                      <Download size={14} className="text-emerald-700" />
                      <span>Exportar CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleSendReportNow()}
                      disabled={sendingReport}
                      className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                    >
                      <Mail size={14} />
                      <span>{sendingReport ? 'Enviando...' : `Enviar Relatório para ${SUPER_ADMIN_EMAIL}`}</span>
                    </button>

                    <a
                      href={mailtoReportHref}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <span>Abrir no E-mail</span>
                    </a>
                  </div>
                </div>

                {reportStatusMsg && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center justify-between gap-4">
                    <span>{reportStatusMsg}</span>
                    <button
                      type="button"
                      onClick={() => setReportStatusMsg(null)}
                      className="text-emerald-700 font-bold underline"
                    >
                      Fechar
                    </button>
                  </div>
                )}

                {/* 4 Indicadores Principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard
                    label="Total de Visitas (Sessões)"
                    value={String(totalVisits)}
                    trend={`${totalPageViews} págs vistas`}
                    icon={Users}
                    color="bg-brand-blue"
                  />
                  <StatCard
                    label="Duração Média por Visita"
                    value={formatDuration(avgDurationSec)}
                    trend="Tempo ativo"
                    icon={Clock}
                    color="bg-emerald-600"
                  />
                  <StatCard
                    label="Cidades / Regiões"
                    value={String(geoList.length)}
                    trend="Origens distintas"
                    icon={Globe}
                    color="bg-brand-red"
                  />
                  <StatCard
                    label="Dias com Acesso"
                    value={String(daysList.length)}
                    trend={daysList[0]?.[0] || 'Hoje'}
                    icon={BarChart}
                    color="bg-slate-900"
                  />
                </div>

                {/* Grade: Acessos por Dia + De Onde São os Visitantes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Coluna 1: Acessos por Dia e Duração Média */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <Clock size={16} className="text-brand-blue" /> Acessos por Dia & Duração Média
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">Histórico diário</span>
                    </div>

                    {daysList.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">Nenhum acesso registrado ainda.</p>
                    ) : (
                      <div className="space-y-3">
                        {daysList.slice(0, 14).map(([dateKey, info]) => {
                          const pct = Math.round((info.count / maxDayCount) * 100);
                          const avgDaySec = Math.round(info.totalSec / info.count);
                          const [y, m, d] = dateKey.split('-');
                          const fmtDay = d && m && y ? `${d}/${m}/${y}` : dateKey;
                          return (
                            <div key={dateKey} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-800">{fmtDay}</span>
                                <span className="text-slate-600">
                                  <strong>{info.count}</strong> {info.count === 1 ? 'visita' : 'visitas'} •{' '}
                                  {info.pageViews} págs • média <strong>{formatDuration(avgDaySec)}</strong>
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-brand-blue transition-all"
                                  style={{ width: `${Math.max(6, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Coluna 2: De onde são os visitantes (Cidade / Estado / País) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <Globe size={16} className="text-brand-red" /> De Onde São os Visitantes (Cidade / UF / País)
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">Localização aproximada</span>
                    </div>

                    {geoList.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">Nenhuma origem registrada ainda.</p>
                    ) : (
                      <div className="space-y-3">
                        {geoList.slice(0, 12).map(([geoLabel, info]) => {
                          const pct = Math.round((info.count / maxGeoCount) * 100);
                          const avgGeoSec = Math.round(info.totalSec / info.count);
                          return (
                            <div key={geoLabel} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-800 truncate max-w-[60%]">{geoLabel}</span>
                                <span className="text-slate-600">
                                  <strong>{info.count}</strong> ({Math.round((info.count / totalVisits) * 100)}%) •{' '}
                                  média {formatDuration(avgGeoSec)}
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-brand-red transition-all"
                                  style={{ width: `${Math.max(6, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Resumo rápido de Dispositivos */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Smartphone size={13} /> Dispositivos:
                      </span>
                      {Array.from(byDeviceMap.entries()).map(([dev, count]) => (
                        <span key={dev} className="px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                          {dev}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Configuração de Envio Automático para leplonghi@gmail.com + Google Analytics 4 */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <Mail size={16} className="text-brand-blue" /> Notificações Automáticas para {SUPER_ADMIN_EMAIL} & Google Analytics 4
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Configure a frequência dos relatórios automáticos enviados para o seu e-mail e, se desejar, vincule também o ID do Google Analytics (G-XXXXXXXXXX).
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      Destinatário fixo: {SUPER_ADMIN_EMAIL}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label htmlFor="report-mode" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Regra de Disparo Automático
                      </label>
                      <select
                        id="report-mode"
                        value={reportConfig.mode}
                        onChange={(e) =>
                          void handleSaveReportConfig({
                            ...reportConfig,
                            mode: e.target.value as ReportTriggerMode
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                      >
                        <option value="every_n_visits">A cada N novos acessos</option>
                        <option value="daily">Fechamento Diário (a cada 24h)</option>
                        <option value="weekly">Fechamento Semanal (a cada 7 dias)</option>
                      </select>
                    </div>

                    {reportConfig.mode === 'every_n_visits' ? (
                      <div>
                        <label htmlFor="report-every-n" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Disparar a cada quantos acessos?
                        </label>
                        <select
                          id="report-every-n"
                          value={reportConfig.everyNVisits}
                          onChange={(e) =>
                            void handleSaveReportConfig({
                              ...reportConfig,
                              everyNVisits: Number(e.target.value)
                            })
                          }
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                        >
                          <option value={5}>A cada 5 acessos</option>
                          <option value={10}>A cada 10 acessos (Padrão)</option>
                          <option value={25}>A cada 25 acessos</option>
                          <option value={50}>A cada 50 acessos</option>
                          <option value={100}>A cada 100 acessos</option>
                        </select>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        Último envio registrado:{' '}
                        <strong>
                          {reportConfig.lastSentAt
                            ? new Date(reportConfig.lastSentAt).toLocaleString('pt-BR')
                            : 'Ainda não disparado'}
                        </strong>
                      </div>
                    )}

                    <div>
                      <label htmlFor="ga4-id" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        ID Google Analytics 4 (Opcional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="ga4-id"
                          type="text"
                          placeholder="Ex.: G-XXXXXXXXXX"
                          value={reportConfig.gaMeasurementId || ''}
                          onChange={(e) => setReportConfig({ ...reportConfig, gaMeasurementId: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => void handleSaveReportConfig(reportConfig)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shrink-0"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabela Detalhada de Cada Visitante (Dia, Hora, Origem, Duração e Páginas) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Registro Individual de Visitantes ({visitorSessions.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Detalhamento de cada visita: dia/horário, de onde veio, dispositivo, tempo de permanência e páginas navegadas.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-[520px]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 uppercase font-bold sticky top-0">
                        <tr>
                          <th className="py-3 px-4">Dia & Horário</th>
                          <th className="py-3 px-4">Origem (Cidade / UF / País)</th>
                          <th className="py-3 px-4">Dispositivo & Canal</th>
                          <th className="py-3 px-4">Duração</th>
                          <th className="py-3 px-4">Páginas Visitadas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visitorSessions.map((s) => (
                          <tr key={s.sessionId} className="hover:bg-slate-50">
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900">{s.dateKey.split('-').reverse().join('/')}</div>
                              <div className="text-[11px] text-slate-500">
                                {new Date(s.startedAt).toLocaleTimeString('pt-BR')}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-brand-navy">{s.city}</div>
                              <div className="text-[11px] text-slate-500">
                                {s.region} • {s.country}
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-semibold text-slate-800">
                                {s.device} ({s.browser})
                              </div>
                              <div className="text-[11px] text-slate-500">{s.referrer}</div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold">
                                <Clock size={12} /> {formatDuration(s.durationSeconds)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">
                                {s.pageViews} {s.pageViews === 1 ? 'página' : 'páginas'}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-md" title={(s.pagesVisited || []).join(' → ')}>
                                {(s.pagesVisited || []).join(' → ')}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'assets' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Catálogo Oficial de Bens Tombados ({BENS_TOMBADOS.length})</h2>
                  <p className="text-xs text-slate-500 font-medium">Relação consolidada do Livro do Tombo Histórico e Artístico (DPHAP/SPC)</p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[520px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-bold sticky top-0">
                    <tr>
                      <th className="py-3 px-4">Inscrição</th>
                      <th className="py-3 px-4">Bem Tombado</th>
                      <th className="py-3 px-4">Município</th>
                      <th className="py-3 px-4">Decreto Estadual</th>
                      <th className="py-3 px-4">Livro / Folha</th>
                      <th className="py-3 px-4">PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {BENS_TOMBADOS.map((bem) => {
                      const pdf = DECRETOS_PDF[bem.decreto.numero];
                      return (
                        <tr key={bem.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-mono font-bold text-brand-navy">#{bem.id}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{bem.nome}</td>
                          <td className="py-2.5 px-4 text-slate-600">{bem.municipio}</td>
                          <td className="py-2.5 px-4 text-slate-600">Nº {bem.decreto.numero} ({bem.decreto.ano ?? 's/d'})</td>
                          <td className="py-2.5 px-4 text-slate-600">Fl. {bem.livro.folha}</td>
                          <td className="py-2.5 px-4">
                            {pdf ? (
                              <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-700 underline">
                                Digitalizado
                              </a>
                            ) : (
                              <span className="text-slate-400">Acervo físico</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && isAdmin && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Gestão de Usuários</h2>
                  <p className="text-xs text-slate-500 font-medium">Controle de acesso e permissões do sistema</p>
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Buscar usuário..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue w-64" />
                </div>
              </div>

              {loadingUsers ? (
                <div className="p-12 flex justify-center text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Usuário</th>
                        <th className="px-6 py-4">E-mail</th>
                        <th className="px-6 py-4">Função</th>
                        <th className="px-6 py-4">Departamento</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-xs font-bold text-slate-700">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">{u.id}</td> {/* Using ID as proxy for email/uid display if email not in User type, assume ID is relatable or add email to User type later */}
                          <td className="px-6 py-4">
                            {editingUser === u.id ? (
                              <select
                                className="text-xs p-1 border rounded"
                                value={tempRole || u.role}
                                onChange={(e) => setTempRole(e.target.value as UserRole)}
                              >
                                {Object.values(UserRole).filter(role => user.role === UserRole.SUPER_ADMIN || role !== UserRole.SUPER_ADMIN).map(role => (
                                  <option key={role} value={role}>{role}</option>
                                ))}
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border ${u.role === UserRole.SUPER_ADMIN ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                u.role === UserRole.ADMIN_SPC ? 'bg-red-50 text-red-700 border-red-100' :
                                  u.role.includes('Editor') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                <Shield size={10} className="mr-1" />
                                {u.role}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-500">
                            {u.department || '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {editingUser === u.id ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleRoleChange(u.id, tempRole || u.role)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingUser(null)}
                                  className="p-1 text-red-400 hover:bg-red-50 rounded"
                                >
                                  <AlertCircle size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingUser(u.id); setTempRole(u.role); }}
                                className="text-slate-400 hover:text-brand-blue"
                              >
                                <MoreVertical size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'import' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Assistente de Importação</h2>
                <p className="text-slate-500">Suba arquivos CSV (.csv), JSON (.json) ou PDF (.pdf) para atualizar o banco de dados do patrimônio.</p>
              </div>

              {!importing && !importFile && (
                <div
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-4 hover:border-brand-blue transition-colors group cursor-pointer relative"
                >
                  <input
                    type="file"
                    accept=".csv,.json,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="pointer-events-none">
                    <p className="text-sm text-slate-500 group-hover:text-brand-blue font-medium">Arraste seu arquivo aqui ou clique para selecionar</p>
                    <button className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold pointer-events-none">Selecionar Arquivo</button>
                    <p className="text-[10px] text-slate-400 mt-2">Suporta CSV, JSON e listas em PDF</p>
                  </div>
                </div>
              )}

              {importFile && !importing && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                      <FilePlus size={24} className="text-brand-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{importFile.name}</p>
                      <p className="text-xs text-slate-500">{(importFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={() => setImportFile(null)}
                      className="ml-auto text-slate-400 hover:text-red-500"
                    >
                      <MoreVertical size={20} className="rotate-90" /> {/* Using as close/clear for now, ideally X icon */}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setImportFile(null)}
                      className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleUpload}
                      className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20"
                    >
                      Iniciar Importação
                    </button>
                  </div>
                </div>
              )}

              {importing && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Processando...</span>
                      <span>{Math.round((importProgress / (importTotal || 1)) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-blue transition-all duration-300"
                        style={{ width: `${(importProgress / (importTotal || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center">
                      Processados {importProgress} de {importTotal} itens
                    </p>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] space-y-1">
                    {importLog.map((log, i) => (
                      <div key={i} className={`
                         ${log.includes('Erro') ? 'text-red-400' : 'text-slate-300'}
                         ${log.includes('Sucesso') ? 'text-green-400' : ''}
                       `}>
                        <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                        {log}
                      </div>
                    ))}
                    <div ref={endOfLogRef} />
                  </div>
                </div>
              )}

              {!importing && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Orientações</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
                      <span className="font-bold block mb-1">Formatos e Colunas</span>
                      Para CSV/JSON: <code>titulo</code>, <code>cidade</code>, <code>localizacao</code>. <br />
                      Para PDF: O sistema extrairá textos como lista. Ideal para diários oficiais.
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
                      <span className="font-bold block mb-1">Geocoding Automático</span>
                      Itens sem coordenadas (lat/lng) serão processados automaticamente pelo serviço de geocodificação. Isso pode levar algum tempo.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
