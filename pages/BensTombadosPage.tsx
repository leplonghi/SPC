import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, FileText, Info, Download, ArrowDown, X } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { AzulejoBand } from '../components/ui/Reveal';
import { StatTile } from '../components/dataviz/StatTile';
import { ChartCard } from '../components/dataviz/ChartCard';
import { BarList } from '../components/dataviz/BarList';
import { ColumnChart } from '../components/dataviz/ColumnChart';
import { ShareBar } from '../components/dataviz/ShareBar';
import { MunicipiosMap, SEDE_MUNICIPIO } from '../components/dataviz/MunicipiosMap';
import { HUE } from '../components/dataviz/tokens';
import {
  BENS_TOMBADOS,
  BemTombado,
  DECRETOS_PDF,
  FAIXAS_DECRETO,
  TIPOS_BEM,
  TIPO_POR_INSCRICAO,
  anoDoDecreto
} from '../data/bensTombados';
import { SITE_CONTACT } from '../data/siteContact';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const fmtData = (iso: string | null) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const MUNICIPIOS = Array.from(new Set(BENS_TOMBADOS.map((b) => b.municipio))).sort((a, b) => a.localeCompare(b, 'pt-BR'));

/** Cor da lateral da ficha por período do decreto (a mesma legenda usada nos cartões da Home). */
const corDaFicha = (b: BemTombado) => {
  const a = anoDoDecreto(b);
  if (a === null) return 'bg-slate-300';
  return a <= 1981 ? 'bg-brand-blue' : a <= 1988 ? 'bg-brand-sage' : a === 1990 ? 'bg-brand-terracotta' : 'bg-brand-red';
};

const Ficha: React.FC<{ bem: BemTombado }> = ({ bem }) => {
  const dataDecreto = fmtData(bem.decreto.data);
  const aConfirmar = bem.obs.some((o) => o.includes('a confirmar'));
  const pdf = DECRETOS_PDF[bem.decreto.numero];
  const decreto = `Decreto ${bem.decreto.numero}${dataDecreto ? `, ${dataDecreto}` : bem.decreto.ano ? `, ${bem.decreto.ano} (data a confirmar)` : ''}`;
  return (
    <li className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <h3 className="text-sm font-bold leading-snug text-brand-navy">{bem.nome}</h3>
        <p className="mt-0.5 text-xs text-slate-600">
          {bem.municipio}{bem.local ? `, ${bem.local}` : ''} · {decreto} · Livro do Tombo, folha {bem.livro.folha} · Inscrição {bem.id}
        </p>
        {aConfirmar && (
          <p className="mt-1 text-xs text-amber-900">Data ou número do decreto em conferência pela SPC.</p>
        )}
      </div>
      {pdf && (
        <a
          href={pdf.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded border border-brand-navy px-3 py-1.5 text-xs font-bold text-brand-navy hover:bg-brand-navy hover:text-white"
          aria-label={`Baixar o decreto nº ${bem.decreto.numero} (PDF) da inscrição ${bem.id}, ${bem.nome}`}
        >
          <Download size={12} aria-hidden="true" /> PDF
        </a>
      )}
    </li>
  );
};

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-xl font-extrabold text-brand-navy mb-3">{children}</h2>
);

type FiltroPdf = '' | 'com' | 'sem';
type Pular = 'municipio' | 'tipo' | 'periodo' | 'pdf' | null;

const ANOS = Array.from({ length: 1993 - 1979 + 1 }, (_, k) => 1979 + k);
const ordemMunicipios = Array.from(
  BENS_TOMBADOS.reduce((m, b) => m.set(b.municipio, (m.get(b.municipio) ?? 0) + 1), new Map<string, number>())
).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR')).map(([n]) => n);

const BensTombadosPage: React.FC = () => {
  usePageTitle('Bens tombados');
  const [busca, setBusca] = useState('');
  // A Home leva para cá com ?municipio=Nome ou ?ano=1990; só vale se existir nos dados
  const [params] = useSearchParams();
  const municipioInicial = params.get('municipio') ?? '';
  const anoInicial = Number(params.get('ano'));
  const [municipio, setMunicipio] = useState(MUNICIPIOS.includes(municipioInicial) ? municipioInicial : '');
  const [tipo, setTipo] = useState('');
  const [faixa, setFaixa] = useState('');
  const [ano, setAno] = useState<number | null>(ANOS.includes(anoInicial) ? anoInicial : null);
  const [pdf, setPdf] = useState<FiltroPdf>('');

  const temPdf = (b: BemTombado) => Boolean(DECRETOS_PDF[b.decreto.numero]);

  /** Aplica todos os filtros, menos o da dimensão "pular": assim cada gráfico mostra as opções que ainda existem ao redor da escolha dele. */
  const passa = (b: BemTombado, pular: Pular = null) => {
    if (pular !== 'municipio' && municipio && b.municipio !== municipio) return false;
    if (pular !== 'tipo' && tipo && TIPO_POR_INSCRICAO[b.id] !== tipo) return false;
    if (pular !== 'periodo') {
      const a = anoDoDecreto(b);
      if (ano !== null && a !== ano) return false;
      const f = FAIXAS_DECRETO.find((x) => x.id === faixa);
      if (f && (a === null || a < f.de || a > f.ate)) return false;
    }
    if (pular !== 'pdf') {
      if (pdf === 'com' && !temPdf(b)) return false;
      if (pdf === 'sem' && temPdf(b)) return false;
    }
    const q = norm(busca.trim());
    if (q && !norm(`${b.nome} ${b.municipio} ${b.local ?? ''} ${b.decreto.numero} ${b.id}`).includes(q)) return false;
    return true;
  };

  const resultados = useMemo(
    () => BENS_TOMBADOS.filter((b) => passa(b)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busca, municipio, tipo, faixa, ano, pdf]
  );

  const g = useMemo(() => {
    const base = (p: Pular) => BENS_TOMBADOS.filter((b) => passa(b, p));
    const porMun = base('municipio');
    const porTipo = base('tipo');
    const porAno = base('periodo');
    const porPdf = base('pdf');
    return {
      municipios: ordemMunicipios.map((m) => ({ key: m, label: m, value: porMun.filter((b) => b.municipio === m).length })),
      tipos: TIPOS_BEM.map((t) => ({ key: t, label: t, value: porTipo.filter((b) => TIPO_POR_INSCRICAO[b.id] === t).length })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR')),
      anos: ANOS.map((y) => ({ key: String(y), label: String(y), short: `’${String(y).slice(2)}`, parts: [{ id: 'bens', value: porAno.filter((b) => anoDoDecreto(b) === y).length }] })),
      semAno: porAno.filter((b) => anoDoDecreto(b) === null).length,
      com: porPdf.filter(temPdf).length,
      sem: porPdf.filter((b) => !temPdf(b)).length
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, municipio, tipo, faixa, ano, pdf]);

  const totalSL = BENS_TOMBADOS.filter((b) => b.municipio === 'São Luís').length;
  const totalPdf = BENS_TOMBADOS.filter(temPdf).length;
  const faixaSel = FAIXAS_DECRETO.find((x) => x.id === faixa);
  const anosSelecionados = ano !== null ? [String(ano)] : faixaSel ? ANOS.filter((y) => y >= faixaSel.de && y <= faixaSel.ate).map(String) : [];
  const periodoLabel = ano !== null ? String(ano) : faixaSel ? faixaSel.label : null;

  const chips: { label: string; limpar: () => void }[] = [];
  if (busca.trim()) chips.push({ label: `Busca: ${busca.trim()}`, limpar: () => setBusca('') });
  if (municipio) chips.push({ label: municipio, limpar: () => setMunicipio('') });
  if (tipo) chips.push({ label: tipo, limpar: () => setTipo('') });
  if (periodoLabel) chips.push({ label: `Decreto de ${periodoLabel}`, limpar: () => { setAno(null); setFaixa(''); } });
  if (pdf) chips.push({ label: pdf === 'com' ? 'Com decreto digitalizado' : 'Decreto ainda não localizado', limpar: () => setPdf('') });
  const limparTudo = () => { setBusca(''); setMunicipio(''); setTipo(''); setFaixa(''); setAno(null); setPdf(''); };

  const contar = (fn: (b: BemTombado) => boolean) => BENS_TOMBADOS.filter(fn).length;
  const campo = 'w-full rounded-2xl border-2 border-slate-200 bg-white py-3 px-4 text-sm font-medium text-brand-dark focus:border-brand-blue focus:outline-none';
  const rotulo = 'block text-xs font-bold uppercase tracking-widest text-slate-600 mb-1';

  const pontos = MUNICIPIOS.filter((m) => SEDE_MUNICIPIO[m]).map((m) => ({
    nome: m,
    lat: SEDE_MUNICIPIO[m][0],
    lng: SEDE_MUNICIPIO[m][1],
    n: g.municipios.find((x) => x.key === m)?.value ?? 0
  }));

  return (
    <>
      {/* Entrada em formato de painel */}
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div aria-hidden="true" className="deco absolute -right-24 -top-24 h-[34rem] w-[34rem] glow-blue" />
        <div aria-hidden="true" className="deco absolute -left-32 bottom-0 h-[26rem] w-[26rem] glow-terracotta opacity-60" />
        <div className="relative mx-auto max-w-[1200px] px-6 pb-28 pt-12 md:pb-32 md:pt-16">

          <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h1 className="font-display text-3xl font-black leading-tight md:text-5xl">Bens tombados</h1>
              <p className="mt-3 max-w-xl text-base text-slate-200">
                Bens tombados pelo Estado do Maranhão, com decreto e dados do Livro do Tombo. Os gráficos funcionam como filtro.
              </p>
              <div className="mt-6 max-w-xl">
                <label htmlFor="bens-busca" className="sr-only">Nome, rua ou decreto</label>
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                  <input
                    id="bens-busca"
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome, rua ou decreto (ex.: 7.090)"
                    className="w-full rounded-2xl bg-white py-4 pl-11 pr-4 text-sm font-semibold text-brand-dark shadow-2xl placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-[#F3A99C]/50"
                  />
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="col-span-2">
                <dt className="sr-only">Total</dt>
                <dd><StatTile size="hero" label="Bens tombados" value={BENS_TOMBADOS.length} hint={`Decretos de 1979 a 1993. Não há tombamentos estaduais depois de 1993.`} /></dd>
              </div>
              <div><dt className="sr-only">Municípios</dt><dd><StatTile label="Municípios" value={MUNICIPIOS.length} /></dd></div>
              <div><dt className="sr-only">Decretos digitalizados</dt><dd><StatTile label="Decretos digitalizados" value={totalPdf} hint={`de ${BENS_TOMBADOS.length}`} /></dd></div>
            </dl>
          </div>
        </div>
        <AzulejoBand />
      </section>

      {/* Painel */}
      <div className="relative z-10 mx-auto -mt-20 max-w-[1200px] px-4 sm:px-6 md:-mt-24">
        <div className="grid gap-5 lg:grid-cols-12">
          <ChartCard
            className="lg:col-span-7 lg:row-span-2"
            title="Onde estão os bens"
            subtitle={`${totalSL} dos ${BENS_TOMBADOS.length} bens (${Math.round((totalSL / BENS_TOMBADOS.length) * 100)}%) ficam em São Luís. Clique em um município para ver só os bens dele.`}
            activeLabel={municipio || null}
            onClear={() => setMunicipio('')}
            table={{ head: ['Município', 'Bens'], rows: g.municipios.map((m) => [m.label, m.value]) }}
            footer="Cada círculo marca a sede do município e não a localização exata dos bens. Mapa base: OpenStreetMap."
            source="Relação de Bens Tombados (SPC/DPHAP), conferida com o texto dos decretos de tombamento e com o Livro do Tombo."
          >
            <div className="grid h-full min-w-0 gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
              <MunicipiosMap height="fill" points={pontos} selected={municipio || null} onSelect={(m) => setMunicipio(m ?? '')} />
              <BarList
                items={g.municipios}
                selected={municipio || null}
                onSelect={(k) => setMunicipio(k ?? '')}
                unit="bens"
                ariaLabel="Bens tombados por município"
                max={Math.max(...ordemMunicipios.map((m) => BENS_TOMBADOS.filter((b) => b.municipio === m).length))}
              />
            </div>
          </ChartCard>

          <ChartCard
            className="lg:col-span-5"
            title="Quando o Estado tombou"
            subtitle="Bens por ano do decreto. Clique em uma coluna para filtrar o ano."
            activeLabel={periodoLabel}
            onClear={() => { setAno(null); setFaixa(''); }}
            table={{ head: ['Ano do decreto', 'Bens'], rows: g.anos.map((c) => [c.label, c.parts[0].value]) }}
            source="Ano do decreto de tombamento, conforme o texto do decreto. Em três bens (inscrições 017, 031 e 055) o número do decreto consta na Relação, mas a data ainda está em conferência, e o ano usado é o da Relação."
            footer={<>Não há tombamentos estaduais depois de 1993.{g.semAno > 0 && ` ${g.semAno} ${g.semAno === 1 ? 'bem está' : 'bens estão'} com o ano a confirmar e não aparece${g.semAno === 1 ? '' : 'm'} no gráfico.`}</>}
          >
            <ColumnChart
              cols={g.anos}
              selected={anosSelecionados}
              onSelect={(k) => { const y = Number(k); setFaixa(''); setAno(ano === y ? null : y); }}
              unit="bens"
              ariaLabel="Bens tombados por ano do decreto"
              emptyNote="Nenhum tombamento neste ano"
              height={250}
              compactLabels
            />
          </ChartCard>

          <ChartCard
            className="lg:col-span-5"
            title="Decretos digitalizados"
            subtitle="Quantos bens têm cópia do decreto disponível neste portal. As demais cópias serão incluídas à medida que forem localizadas pela SPC."
            activeLabel={pdf ? (pdf === 'com' ? 'Com decreto' : 'Sem decreto') : null}
            onClear={() => setPdf('')}
            table={{ head: ['Situação', 'Bens'], rows: [['Decreto digitalizado', g.com], ['Decreto ainda não localizado', g.sem]] }}
            source="Arquivo de decretos da SPC; só entram cópias que foram lidas antes da publicação."
          >
            <ShareBar
              parts={[
                { id: 'com', label: 'Decreto digitalizado', value: g.com, color: HUE },
                { id: 'sem', label: 'Ainda não localizado', value: g.sem, color: '#8996A3' }
              ]}
              selected={pdf || null}
              onSelect={(id) => setPdf((id as FiltroPdf) ?? '')}
              unit="bens"
              ariaLabel="Situação do decreto digitalizado"
            />
            <button
              type="button"
              onClick={() => { setPdf(pdf === 'com' ? '' : 'com'); document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-sage-dark px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/30"
            >
              <Download size={14} aria-hidden="true" /> {pdf === 'com' ? 'Mostrar todos os bens' : 'Ver só os bens com decreto digitalizado'}
            </button>
          </ChartCard>

        </div>

        {/* Filtros por lista: a mesma coisa que os gráficos, para quem prefere formulário */}
        <details className="mt-5 rounded-3xl border border-brand-sand bg-white p-4 md:p-5">
          <summary className="cursor-pointer text-sm font-bold text-brand-blue-dark">Filtrar por lista</summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="bens-municipio" className={rotulo}>Município</label>
              <select id="bens-municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)} className={campo}>
                <option value="">Todos ({MUNICIPIOS.length})</option>
                {MUNICIPIOS.map((m) => (<option key={m} value={m}>{m} ({contar((b) => b.municipio === m)})</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="bens-faixa" className={rotulo}>Ano do decreto</label>
              <select id="bens-faixa" value={faixa} onChange={(e) => { setFaixa(e.target.value); setAno(null); }} className={campo}>
                <option value="">Todos os anos</option>
                {FAIXAS_DECRETO.map((f) => (
                  <option key={f.id} value={f.id}>{f.label} ({contar((b) => { const a = anoDoDecreto(b); return a !== null && a >= f.de && a <= f.ate; })})</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      </div>

      {/* Resultados */}
      <div id="resultados" className="mx-auto max-w-4xl scroll-mt-24 px-6 pb-12 pt-10">
        <div className="sticky top-[62px] z-20 -mx-2 mb-4 rounded-2xl border border-brand-sand bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <p role="status" aria-live="polite" className="mr-2 text-sm font-bold text-brand-navy">
              {resultados.length === 0
                ? 'Nenhum bem encontrado'
                : `${resultados.length} ${resultados.length === 1 ? 'bem' : 'bens'}`}
              <span className="font-medium text-slate-600">
                {resultados.length > 0 && ` · ${resultados.filter(temPdf).length} com decreto digitalizado`}
              </span>
            </p>
            {chips.map((c) => (
              <button key={c.label} type="button" onClick={c.limpar} className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-bold text-brand-blue-dark hover:bg-brand-blue/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" aria-label={`Remover filtro: ${c.label}`}>
                <span className="max-w-[12rem] truncate">{c.label}</span> <X size={12} aria-hidden="true" />
              </button>
            ))}
            {chips.length > 0 && (
              <button type="button" onClick={limparTudo} className="ml-auto text-xs font-bold uppercase tracking-widest text-brand-red-dark underline">Limpar tudo</button>
            )}
          </div>
        </div>

        {resultados.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm">
            <p className="font-bold text-brand-navy">Nenhum resultado não significa que o imóvel não tenha proteção.</p>
            <p className="mt-2">
              Ele pode estar dentro de um conjunto tombado (como um centro histórico), ou ter proteção federal ou municipal. Escreva para a SPC em{' '}
              <a className="font-bold text-brand-blue-dark underline break-all" href={`mailto:${SITE_CONTACT.email}?subject=Consulta%20de%20tombamento`}>{SITE_CONTACT.email}</a>{' '}
              informando o endereço completo.
            </p>
          </div>
        ) : (
          <ul className="border-t border-slate-200">
            {resultados.map((b) => (<Ficha key={b.id} bem={b} />))}
          </ul>
        )}

        <section className="mt-14 space-y-3 text-slate-700 leading-relaxed">
          <H2>Como ler esta lista</H2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Ela cobre os tombamentos estaduais feitos de 1979 a 1993. A SPC informa que não há tombamentos estaduais posteriores a 1993.</li>
            <li>
              Estar aqui significa proteção estadual. Qualquer obra, reforma ou pintura em bem tombado, ou em seu entorno, precisa de autorização prévia. Veja como pedir em{' '}
              <Link className="font-bold text-brand-blue-dark underline" to="/servicos">Serviços</Link>.
            </li>
            <li>
              Nas fichas com o botão "Baixar decreto", a SPC já tem o decreto digitalizado. As demais são incluídas à medida que as cópias são localizadas. Leis e decretos gerais estão na{' '}
              <Link className="font-bold text-brand-blue-dark underline" to="/legislacao">biblioteca de legislação</Link>.
            </li>
            <li>O filtro "Tipo de bem" agrupa os bens pelo nome e pelo uso, só para facilitar a busca. Não é uma categoria oficial do tombamento.</li>
            <li>As inscrições 020 e 021 aparecem como canceladas no Livro do Tombo e por isso não constam da lista. Nomes de proprietários particulares não são publicados.</li>
          </ul>
          <p className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <FileText size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>
              Fonte: Relação de Bens Tombados pelo Estado do Maranhão e Livro de Tombo, Departamento de Proteção do Patrimônio Histórico, Artístico, Arqueológico e Paisagístico (DPHAP). Em caso de divergência, vale o texto do decreto. Viu um erro?{' '}
              <a className="font-bold text-brand-blue-dark underline" href={`mailto:${SITE_CONTACT.email}?subject=Correção%20na%20lista%20de%20bens%20tombados`}>Avise a SPC</a>.
            </span>
          </p>

        </section>
      </div>
    </>
  );
};

export default BensTombadosPage;
