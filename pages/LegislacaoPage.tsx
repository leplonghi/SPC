import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Gavel,
  Info,
  Landmark,
  LibraryBig,
  Scale,
  Search,
  ShieldCheck
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { usePageTitle } from '../hooks/usePageTitle';
import { PageHero } from '../components/ui/PageHero';
import { StatTile } from '../components/dataviz/StatTile';
import { ChartCard } from '../components/dataviz/ChartCard';
import { BarList } from '../components/dataviz/BarList';
import { ColumnChart } from '../components/dataviz/ColumnChart';
import { ShareBar } from '../components/dataviz/ShareBar';
import { ESFERA_COR } from '../components/dataviz/tokens';
import { db } from '../firebase';
import {
  LegalDocumentCategory,
  LegalDocumentScope,
  LegalSourceKind,
  PUBLIC_LEGAL_DOCUMENTS,
  PublicLegalDocument
} from '../data/publicLegalDocuments';

type SortMode = 'esfera' | 'recentes' | 'antigos' | 'titulo';

// Ordem padrão: o que vale no Maranhão vem primeiro; normas federais por último.
const SCOPE_ORDER: Record<LegalDocumentScope, number> = { Estadual: 0, SPC: 1, Municipal: 2, Federal: 3 };

const CATEGORIES: LegalDocumentCategory[] = [
  'Lei',
  'Decreto',
  'Portaria',
  'Instrução Normativa',
  'Resolução',
  'Diretriz',
  'Manual'
];

const SCOPES: LegalDocumentScope[] = ['Estadual', 'Federal', 'Municipal', 'SPC'];

const SOURCE_KINDS: LegalSourceKind[] = [
  'official-online',
  'official-gazette-copy',
  'institutional-copy',
  'institutional-guidance'
];

const SOURCE_KIND_CONFIG: Record<LegalSourceKind, { label: string; className: string }> = {
  'official-online': {
    label: 'Fonte oficial online',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  'official-gazette-copy': {
    label: 'Cópia do Diário Oficial',
    className: 'border-blue-200 bg-blue-50 text-blue-700'
  },
  'institutional-copy': {
    label: 'Cópia institucional',
    className: 'border-slate-300 bg-slate-100 text-slate-800'
  },
  'institutional-guidance': {
    label: 'Orientação institucional',
    className: 'border-amber-200 bg-amber-50 text-amber-800'
  }
};

const CATEGORY_CONFIG: Record<LegalDocumentCategory, {
  icon: React.ElementType;
  badge: string;
  iconBox: string;
}> = {
  Lei: {
    icon: Gavel,
    badge: 'bg-[#CC343A]/10 text-[#A92831] border-[#CC343A]/20',
    iconBox: 'bg-[#CC343A] text-white'
  },
  Decreto: {
    icon: ShieldCheck,
    badge: 'bg-brand-blue/10 text-brand-blue-dark border-brand-blue/20',
    iconBox: 'bg-brand-blue text-white'
  },
  Portaria: {
    icon: FileCheck2,
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    iconBox: 'bg-amber-600 text-white'
  },
  'Instrução Normativa': {
    icon: FileText,
    badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    iconBox: 'bg-cyan-700 text-white'
  },
  Resolução: {
    icon: Scale,
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    iconBox: 'bg-emerald-700 text-white'
  },
  Diretriz: {
    icon: BookOpen,
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
    iconBox: 'bg-teal-700 text-white'
  },
  Manual: {
    icon: LibraryBig,
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    iconBox: 'bg-brand-navy text-white'
  },
  Outro: {
    icon: FileText,
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    iconBox: 'bg-slate-600 text-white'
  }
};

const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const formatDate = (date: string) => {
  const parsed = new Date(date + 'T12:00:00');
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const isCategory = (value: unknown): value is LegalDocumentCategory =>
  typeof value === 'string' &&
  [...CATEGORIES, 'Outro'].includes(value as LegalDocumentCategory);

const isScope = (value: unknown): value is LegalDocumentScope =>
  typeof value === 'string' && SCOPES.includes(value as LegalDocumentScope);

const isSourceKind = (value: unknown): value is LegalSourceKind =>
  typeof value === 'string' && SOURCE_KINDS.includes(value as LegalSourceKind);

const mapPublishedDocument = (
  id: string,
  raw: Record<string, unknown>
): PublicLegalDocument | null => {
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const sourceUrl =
    typeof raw.sourceUrl === 'string'
      ? raw.sourceUrl.trim()
      : typeof raw.url === 'string'
        ? raw.url.trim()
        : '';
  const category = isCategory(raw.category) ? raw.category : null;

  if (!title || !sourceUrl || !category) return null;

  const rawTags = Array.isArray(raw.tags)
    ? raw.tags.filter((tag): tag is string => typeof tag === 'string')
    : [];

  const format =
    raw.format === 'PDF' ||
    raw.format === 'HTML' ||
    raw.format === 'Imagem' ||
    raw.format === 'Outro'
      ? raw.format
      : sourceUrl.toLowerCase().includes('.pdf')
        ? 'PDF'
        : 'HTML';

  return {
    id,
    title,
    category,
    scope: isScope(raw.scope) ? raw.scope : 'SPC',
    date: typeof raw.date === 'string' ? raw.date : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    issuer: typeof raw.issuer === 'string' ? raw.issuer : 'Superintendência do Patrimônio Cultural',
    sourceLabel: typeof raw.sourceLabel === 'string' ? raw.sourceLabel : 'SPC Maranhão',
    sourceUrl,
    sourceKind: isSourceKind(raw.sourceKind)
      ? raw.sourceKind
      : sourceUrl.startsWith('https://')
        ? 'official-online'
        : 'institutional-copy',
    alternateSourceLabel:
      typeof raw.alternateSourceLabel === 'string' ? raw.alternateSourceLabel : undefined,
    alternateSourceUrl:
      typeof raw.alternateSourceUrl === 'string' ? raw.alternateSourceUrl : undefined,
    format,
    tags: rawTags,
    officialPublication:
      typeof raw.officialPublication === 'string' ? raw.officialPublication : undefined,
    validationNote:
      typeof raw.validationNote === 'string' ? raw.validationNote : undefined,
    verifiedAt:
      typeof raw.verifiedAt === 'string'
        ? raw.verifiedAt
        : typeof raw.publishedAt === 'string'
          ? raw.publishedAt
          : '',
    featured: raw.featured === true,
    status: 'published'
  };
};

const LegislacaoPage: React.FC = () => {
  usePageTitle('Legislação');
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const urlQuery = searchParams.get('q');
  useEffect(() => {
    if (urlQuery !== null) setSearchTerm(urlQuery);
  }, [urlQuery]);
  const [activeCategory, setActiveCategory] = useState<'Todos' | LegalDocumentCategory>('Todos');
  const [activeScope, setActiveScope] = useState<'Todos' | LegalDocumentScope>('Todos');
  const [sortMode, setSortMode] = useState<SortMode>('esfera');
  const [activeIssuer, setActiveIssuer] = useState('Todos');
  const [activeDecade, setActiveDecade] = useState('Todos');
  const [activeTopic, setActiveTopic] = useState('Todos');
  const [activeSourceKind, setActiveSourceKind] = useState('Todos');
  const [onlyEssential, setOnlyEssential] = useState(false);
  const [publishedDocuments, setPublishedDocuments] = useState<PublicLegalDocument[]>([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState(true);

  useEffect(() => {
    const publicDocumentsQuery = query(
      collection(db, 'legislation'),
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(
      publicDocumentsQuery,
      snapshot => {
        const documents = snapshot.docs
          .map(item => mapPublishedDocument(item.id, item.data()))
          .filter((item): item is PublicLegalDocument => item !== null);
        setPublishedDocuments(documents);
        setIsCollectionLoading(false);
      },
      () => {
        setPublishedDocuments([]);
        setIsCollectionLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const allDocuments = useMemo(() => {
    const merged = new Map<string, PublicLegalDocument>();
    PUBLIC_LEGAL_DOCUMENTS.forEach(document => merged.set(document.id, document));
    publishedDocuments.forEach(document => merged.set(document.id, document));
    return Array.from(merged.values());
  }, [publishedDocuments]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<LegalDocumentCategory, number>();
    CATEGORIES.forEach(category => counts.set(category, 0));
    allDocuments.forEach(document =>
      counts.set(document.category, (counts.get(document.category) || 0) + 1)
    );
    return counts;
  }, [allDocuments]);

  const scopeCounts = useMemo(() => {
    const counts = new Map<LegalDocumentScope, number>();
    SCOPES.forEach(scope => counts.set(scope, 0));
    allDocuments.forEach(document =>
      counts.set(document.scope, (counts.get(document.scope) || 0) + 1)
    );
    return counts;
  }, [allDocuments]);

  const yearOf = (document: PublicLegalDocument) => {
    const year = Number((document.date || '').slice(0, 4));
    return Number.isNaN(year) || year === 0 ? null : year;
  };

  const issuerOptions = useMemo(() => {
    const counts = new Map<string, number>();
    allDocuments.forEach(document => counts.set(document.issuer, (counts.get(document.issuer) || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'));
  }, [allDocuments]);

  const decadeOptions = useMemo(() => {
    const counts = new Map<number, number>();
    allDocuments.forEach(document => {
      const year = yearOf(document);
      if (year === null) return;
      const decade = Math.floor(year / 10) * 10;
      counts.set(decade, (counts.get(decade) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => a[0] - b[0]);
  }, [allDocuments]);

  // Assuntos: só as etiquetas que aparecem em mais de um documento, para o filtro não ficar com opção de um item só.
  const topicOptions = useMemo(() => {
    const counts = new Map<string, number>();
    allDocuments.forEach(document =>
      Array.from(new Set(document.tags)).forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1))
    );
    return Array.from(counts.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'));
  }, [allDocuments]);

  const sourceKindCounts = useMemo(() => {
    const counts = new Map<LegalSourceKind, number>();
    allDocuments.forEach(document => counts.set(document.sourceKind, (counts.get(document.sourceKind) || 0) + 1));
    return counts;
  }, [allDocuments]);

  const essentialCount = useMemo(() => allDocuments.filter(document => document.featured).length, [allDocuments]);

  type Pular = 'category' | 'scope' | 'decade' | 'topic' | null;
  /** Aplica todos os filtros, menos o da dimensão "pular": cada gráfico mostra as opções que ainda existem ao redor da escolha dele. */
  const passes = (document: PublicLegalDocument, pular: Pular = null) => {
    const normalizedSearch = normalizeText(searchTerm);
    const searchableText = normalizeText([
      document.title,
      document.description,
      document.issuer,
      document.sourceLabel,
      document.officialPublication || '',
      document.validationNote || '',
      ...document.tags
    ].join(' '));
    const year = yearOf(document);
    return (
      (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
      (pular === 'category' || activeCategory === 'Todos' || document.category === activeCategory) &&
      (pular === 'scope' || activeScope === 'Todos' || document.scope === activeScope) &&
      (activeIssuer === 'Todos' || document.issuer === activeIssuer) &&
      (pular === 'decade' || activeDecade === 'Todos' ||
        (year !== null && Math.floor(year / 10) * 10 === Number(activeDecade))) &&
      (pular === 'topic' || activeTopic === 'Todos' || document.tags.includes(activeTopic)) &&
      (activeSourceKind === 'Todos' || document.sourceKind === activeSourceKind) &&
      (!onlyEssential || document.featured === true)
    );
  };

  const filteredDocuments = useMemo(() => {
    return allDocuments
      .filter(document => passes(document))
      .sort((a, b) => {
        if (sortMode === 'titulo') return a.title.localeCompare(b.title, 'pt-BR');
        const timeA = new Date(a.date + 'T12:00:00').getTime() || 0;
        const timeB = new Date(b.date + 'T12:00:00').getTime() || 0;
        if (sortMode === 'esfera') {
          const byScope = SCOPE_ORDER[a.scope] - SCOPE_ORDER[b.scope];
          return byScope !== 0 ? byScope : timeB - timeA;
        }
        return sortMode === 'antigos' ? timeA - timeB : timeB - timeA;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeScope, activeIssuer, activeDecade, activeTopic, activeSourceKind, onlyEssential, allDocuments, searchTerm, sortMode]);

  // Dados dos gráficos do painel (sempre calculados do que está publicado)
  const dash = useMemo(() => {
    const porCat = allDocuments.filter(d => passes(d, 'category'));
    const porEsf = allDocuments.filter(d => passes(d, 'scope'));
    const porDec = allDocuments.filter(d => passes(d, 'decade'));
    const porTop = allDocuments.filter(d => passes(d, 'topic'));
    const catsUsadas = ([...CATEGORIES, 'Outro'] as LegalDocumentCategory[])
      .map(c => ({ c, total: allDocuments.filter(d => d.category === c).length }))
      .filter(x => x.total > 0)
      .sort((a, b) => b.total - a.total);
    const anos = allDocuments.map(yearOf).filter((y): y is number => y !== null);
    const decMin = anos.length ? Math.floor(Math.min(...anos) / 10) * 10 : 2000;
    const decMax = anos.length ? Math.floor(Math.max(...anos) / 10) * 10 : 2020;
    const decadas = Array.from({ length: (decMax - decMin) / 10 + 1 }, (_, i) => decMin + i * 10).map(dec => ({
      key: String(dec),
      label: `${dec}`,
      short: `${String(dec).slice(2)}s`,
      parts: SCOPES.map(sc => ({
        id: sc,
        value: porDec.filter(d => { const y = yearOf(d); return y !== null && Math.floor(y / 10) * 10 === dec && d.scope === sc; }).length
      }))
    }));
    return {
      categorias: catsUsadas.map(({ c }) => ({ key: c, label: c === 'Outro' ? 'Outros' : c, value: porCat.filter(d => d.category === c).length })),
      esferas: SCOPES.map(sc => ({ id: sc, label: sc === 'SPC' ? 'SPC' : sc, value: porEsf.filter(d => d.scope === sc).length, color: ESFERA_COR[sc] })),
      decadas,
      assuntos: topicOptions.slice(0, 8).map(([t]) => ({ key: t, label: t, value: porTop.filter(d => d.tags.includes(t)).length })),
      maxCat: Math.max(1, ...catsUsadas.map(x => x.total)),
      maxTop: Math.max(1, ...topicOptions.slice(0, 8).map(([, n]) => n))
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeScope, activeIssuer, activeDecade, activeTopic, activeSourceKind, onlyEssential, allDocuments, searchTerm, topicOptions]);

  const copiasSpc = useMemo(() => allDocuments.filter(d => d.sourceUrl.startsWith('/')).length, [allDocuments]);

  const clearFilters = () => {
    setSearchTerm('');
    setActiveCategory('Todos');
    setActiveScope('Todos');
    setActiveIssuer('Todos');
    setActiveDecade('Todos');
    setActiveTopic('Todos');
    setActiveSourceKind('Todos');
    setOnlyEssential(false);
    setSortMode('esfera');
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    activeCategory !== 'Todos' ||
    activeScope !== 'Todos' ||
    activeIssuer !== 'Todos' ||
    activeDecade !== 'Todos' ||
    activeTopic !== 'Todos' ||
    activeSourceKind !== 'Todos' ||
    onlyEssential;

  return (
    <div className="min-h-screen bg-brand-cream">
      <PageHero
        tone="sage"
        align="center"
        backgroundImage="/imagens/1912 - justo jansen - mapa.jpg"
        title={<>Legislação</>}
        description="Leis, decretos, portarias e diretrizes sobre o patrimônio cultural, com a fonte de cada documento."
        actions={
          <div className="w-full max-w-2xl space-y-3 text-left">
            <label htmlFor="legal-search" className="sr-only">
              Buscar na biblioteca de normas
            </label>
            <div className="relative group">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-navy transition-colors"
                size={20}
                aria-hidden="true"
              />
              <input
                id="legal-search"
                type="search"
                placeholder="Busque por número, assunto, órgão ou palavra-chave"
                className="w-full pl-14 pr-6 py-4 bg-white text-brand-navy placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#E36B5D]/40"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
              />
            </div>
            <dl className="grid grid-cols-3 gap-4 border-t border-white/15 pt-5 text-left">
              <div><dt className="sr-only">Normas</dt><dd><StatTile label="Normas" value={allDocuments.length} /></dd></div>
              <div><dt className="sr-only">Origens</dt><dd><StatTile label="Origens" value={4} hint="federal, estadual, municipal e diretrizes da SPC" /></dd></div>
              <div><dt className="sr-only">Cópias no acervo da SPC</dt><dd><StatTile label="Cópias da SPC" value={copiasSpc} hint="disponíveis neste portal" /></dd></div>
            </dl>
          </div>
        }
      />

      {/* Painel */}
      <section className="relative z-20 -mt-10 px-4 sm:px-6" aria-label="Painel da biblioteca de normas">
        <div className="mx-auto grid max-w-[1200px] gap-5 lg:grid-cols-12">
          <ChartCard
            className="lg:col-span-12"
            title="Origem das normas"
            subtitle="Normas por origem: federal, estadual, municipal e diretrizes da SPC. Clique para filtrar."
            activeLabel={activeScope !== 'Todos' ? activeScope : null}
            onClear={() => setActiveScope('Todos')}
            table={{ head: ['Origem', 'Normas'], rows: dash.esferas.map(e => [e.label, e.value]) }}
            source="Biblioteca de normas deste portal, conforme o texto oficial de cada ato. A ficha de cada norma traz o link do documento de origem."
          >
            <ShareBar
              parts={dash.esferas}
              selected={activeScope !== 'Todos' ? activeScope : null}
              onSelect={id => setActiveScope((id ?? 'Todos') as 'Todos' | LegalDocumentScope)}
              unit="normas"
              ariaLabel="Normas por origem"
            />
          </ChartCard>

          <ChartCard
            className="lg:col-span-7"
            title="Em que época foram feitas"
            subtitle="Normas por década, com a origem de cada uma. Clique em uma década para filtrar."
            activeLabel={activeDecade !== 'Todos' ? `Anos ${activeDecade}` : null}
            onClear={() => setActiveDecade('Todos')}
            table={{ head: ['Década', ...SCOPES], rows: dash.decadas.map(c => [c.label, ...SCOPES.map(sc => c.parts.find(p => p.id === sc)?.value ?? 0)]) }}
            footer="A data considerada é a do ato (lei, decreto ou portaria). As cores seguem a barra de origens."
            source="Biblioteca de normas deste portal; data do ato conforme o documento de origem."
          >
            <ColumnChart
              cols={dash.decadas}
              series={SCOPES.map(sc => ({ id: sc, label: sc, color: ESFERA_COR[sc] }))}
              selected={activeDecade !== 'Todos' ? [activeDecade] : []}
              onSelect={k => setActiveDecade(activeDecade === k ? 'Todos' : k)}
              unit="normas"
              ariaLabel="Normas por década"
              height={170}
              emptyNote="Nenhuma norma desta década na biblioteca"
            />
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-700" aria-label="Legenda das origens">
              {SCOPES.map(sc => (
                <li key={sc} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="inline-block h-[10px] w-[10px] rounded-[3px]" style={{ background: ESFERA_COR[sc] }} /> {sc}
                </li>
              ))}
            </ul>
          </ChartCard>

          <ChartCard
            className="lg:col-span-5"
            title="Que tipo de norma"
            subtitle="Leis, decretos, portarias e outros. Clique para filtrar."
            activeLabel={activeCategory !== 'Todos' ? activeCategory : null}
            onClear={() => setActiveCategory('Todos')}
            table={{ head: ['Tipo', 'Normas'], rows: dash.categorias.map(c => [c.label, c.value]) }}
            source="Biblioteca de normas deste portal; tipo conforme a denominação do ato (lei, decreto, portaria etc.)."
          >
            <BarList
              items={dash.categorias}
              selected={activeCategory !== 'Todos' ? activeCategory : null}
              onSelect={k => setActiveCategory((k ?? 'Todos') as 'Todos' | LegalDocumentCategory)}
              unit="normas"
              ariaLabel="Normas por tipo"
              max={dash.maxCat}
            />
          </ChartCard>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <section className="mb-6" aria-labelledby="catalog-title">
          <h2 id="catalog-title" className="text-2xl font-bold text-brand-navy">Documentos</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">
            Esta lista não substitui o Diário Oficial nem o órgão competente para confirmar vigência e alterações.
          </p>
        </section>

        <details className="bg-white border border-slate-100 rounded-[2rem] p-5 md:p-6 shadow-sm mb-8">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-brand-blue-dark">
            <Filter size={16} aria-hidden="true" /> Mais filtros e ordenação
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            <SelectField
              label="Tipo"
              value={activeCategory}
              onChange={value => setActiveCategory(value as 'Todos' | LegalDocumentCategory)}
              options={[{ value: 'Todos', label: 'Todos os tipos' }, ...CATEGORIES.map(c => ({ value: c, label: c + ' (' + String(categoryCounts.get(c) || 0) + ')' }))]}
            />
            <SelectField
              label="Esfera"
              value={activeScope}
              onChange={value => setActiveScope(value as 'Todos' | LegalDocumentScope)}
              options={[
                { value: 'Todos', label: 'Todas as esferas' },
                ...SCOPES.map(scope => ({ value: scope, label: scope + ' (' + String(scopeCounts.get(scope) || 0) + ')' }))
              ]}
            />
            <SelectField
              label="Órgão emissor"
              value={activeIssuer}
              onChange={setActiveIssuer}
              options={[
                { value: 'Todos', label: 'Todos os órgãos' },
                ...issuerOptions.map(([issuer, count]) => ({ value: issuer, label: issuer + ' (' + String(count) + ')' }))
              ]}
            />
            <SelectField
              label="Período"
              value={activeDecade}
              onChange={setActiveDecade}
              options={[
                { value: 'Todos', label: 'Todos os períodos' },
                ...decadeOptions.map(([decade, count]) => ({ value: String(decade), label: 'Anos ' + String(decade) + ' (' + String(count) + ')' }))
              ]}
            />
            <SelectField
              label="Assunto"
              value={activeTopic}
              onChange={setActiveTopic}
              options={[
                { value: 'Todos', label: 'Todos os assuntos' },
                ...topicOptions.map(([topic, count]) => ({ value: topic, label: topic + ' (' + String(count) + ')' }))
              ]}
            />
            <SelectField
              label="Origem do texto"
              value={activeSourceKind}
              onChange={setActiveSourceKind}
              options={[
                { value: 'Todos', label: 'Todas as origens' },
                ...SOURCE_KINDS.filter(kind => (sourceKindCounts.get(kind) || 0) > 0).map(kind => ({
                  value: kind,
                  label: SOURCE_KIND_CONFIG[kind].label + ' (' + String(sourceKindCounts.get(kind) || 0) + ')'
                }))
              ]}
            />
            <SelectField
              label="Ordenar"
              value={sortMode}
              onChange={value => setSortMode(value as SortMode)}
              options={[
                { value: 'esfera', label: 'Estadual primeiro' },
                { value: 'recentes', label: 'Mais recentes' },
                { value: 'antigos', label: 'Mais antigos' },
                { value: 'titulo', label: 'Título de A a Z' }
              ]}
            />
          </div>
          <label className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-brand-navy">
            <input
              type="checkbox"
              checked={onlyEssential}
              onChange={event => setOnlyEssential(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Só referências essenciais ({essentialCount})
          </label>
        </details>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.17em] text-slate-500" aria-live="polite">
            {filteredDocuments.length}{' '}
            {filteredDocuments.length === 1 ? 'documento encontrado' : 'documentos encontrados'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-red hover:text-brand-navy transition-colors"
            >
              Limpar busca e filtros
            </button>
          )}
        </div>

        {filteredDocuments.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <section className="grid grid-cols-1 border-t border-slate-200" aria-label="Resultados da biblioteca">
            {filteredDocuments.map(document => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </section>
        )}

      </div>
    </div>
  );
};

const SummaryItem = ({
  icon: Icon,
  value,
  label,
  tone
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  tone: 'red' | 'blue' | 'green';
}) => {
  const toneClass = {
    red: 'bg-brand-red/10 text-brand-red',
    blue: 'bg-brand-blue/10 text-brand-blue',
    green: 'bg-emerald-50 text-emerald-700'
  }[tone];

  return (
    <div className="p-5 flex items-center gap-4 border-t first:border-t-0 sm:border-t-0 sm:border-r last:sm:border-r-0 border-slate-100">
      <div className={'w-11 h-11 rounded-2xl flex items-center justify-center ' + toneClass}>
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-black text-brand-navy leading-tight">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
};

const FilterButton = ({
  label,
  count,
  active,
  onClick
}: {
  key?: string;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={active
      ? 'px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all bg-brand-navy text-white border-brand-navy shadow-md'
      : 'px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all bg-slate-50 text-slate-600 border-slate-100 hover:border-brand-blue/40'}
  >
    {label} <span className="ml-1 opacity-70">{count}</span>
  </button>
);

const SelectField = ({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) => (
  <label className="space-y-2">
    <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
      {label}
    </span>
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-blue/10"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </label>
);

const DocumentCard = ({ document }: { key?: string; document: PublicLegalDocument }) => {
  const sourceAction = document.format === 'PDF' ? 'Abrir PDF' : document.format === 'Imagem' ? 'Ver documento' : 'Ver texto';
  const meta = [
    document.category,
    document.scope,
    document.date ? formatDate(document.date) : null,
    document.issuer
  ].filter(Boolean).join(' · ');

  return (
    <article className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <h2 className="text-sm font-bold leading-snug text-brand-navy">{document.title}</h2>
        <p className="mt-0.5 text-xs text-slate-600">{meta}</p>
        {document.validationNote && (
          <details className="mt-1 text-xs text-slate-600">
            <summary className="cursor-pointer underline">Observação sobre a fonte</summary>
            <p className="mt-1 max-w-3xl">{document.validationNote}</p>
          </details>
        )}
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <a
          href={document.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded border border-brand-navy px-3 py-1.5 text-xs font-bold text-brand-navy hover:bg-brand-navy hover:text-white"
          aria-label={sourceAction + ': ' + document.title + ' (' + document.sourceLabel + ', ' + document.format + ')'}
        >
          {sourceAction} <ExternalLink size={12} aria-hidden="true" />
        </a>
        <span className="text-[11px] text-slate-500">{document.sourceLabel}</span>
        {document.alternateSourceUrl && document.alternateSourceLabel && (
          <a href={document.alternateSourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] underline text-brand-navy">
            {document.alternateSourceLabel}
          </a>
        )}
      </div>
    </article>
  );
};

const EmptyState = ({ onClear }: { onClear: () => void }) => (
  <section className="rounded-[2rem] border border-slate-100 bg-white p-12 text-center">
    <BookOpen size={48} className="mx-auto text-slate-200" aria-hidden="true" />
    <h2 className="mt-5 text-xl font-black text-brand-navy">Nenhum documento encontrado</h2>
    <p className="mt-2 text-sm text-slate-500">Tente outra palavra ou consulte uma categoria diferente.</p>
    <button type="button" onClick={onClear} className="mt-6 rounded-xl bg-brand-navy px-5 py-3 text-[10px] font-black uppercase tracking-wider text-white">
      Ver toda a biblioteca
    </button>
  </section>
);

const PolicyCard = ({
  icon: Icon,
  title,
  text,
  dark = false
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  dark?: boolean;
}) => (
  <div className={dark ? 'rounded-3xl bg-brand-navy p-6 text-white' : 'rounded-3xl bg-white border border-slate-100 p-6'}>
    <Icon size={24} className={dark ? 'text-[#F08A7B]' : 'text-brand-blue'} aria-hidden="true" />
    <h3 className={dark ? 'mt-4 text-base font-black text-white' : 'mt-4 text-base font-black text-brand-navy'}>{title}</h3>
    <p className={dark ? 'mt-2 text-xs leading-relaxed text-slate-300' : 'mt-2 text-xs leading-relaxed text-slate-500'}>{text}</p>
  </div>
);

export default LegislacaoPage;
