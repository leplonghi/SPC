import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
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
  ShieldCheck,
  Sparkles,
  X,
  ArrowUpDown
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { usePageTitle } from '../hooks/usePageTitle';
import { PageHero } from '../components/ui/PageHero';
import { db } from '../firebase';
import {
  LegalDocumentCategory,
  LegalDocumentScope,
  LegalSourceKind,
  PUBLIC_LEGAL_DOCUMENTS,
  PublicLegalDocument
} from '../data/publicLegalDocuments';

type SortMode = 'criacao-asc' | 'criacao-desc' | 'esfera' | 'titulo';

const SCOPES: LegalDocumentScope[] = ['Estadual', 'Federal', 'Municipal', 'SPC'];

const CATEGORIES: LegalDocumentCategory[] = [
  'Lei',
  'Decreto',
  'Portaria',
  'Instrução Normativa',
  'Resolução',
  'Diretriz',
  'Manual'
];

const SPECIFIC_TOPICS = [
  'Todos',
  'Tombamento',
  'Centro Histórico de São Luís',
  'Patrimônio imaterial',
  'Intervenção',
  'Engenhos publicitários',
  'Patrimônio natural',
  'Fiscalização'
] as const;

const ESFERA_BADGE: Record<LegalDocumentScope, { label: string; className: string; border: string }> = {
  Estadual: {
    label: 'Maranhão (Estadual)',
    className: 'bg-brand-blue/10 text-brand-blue-dark border-brand-blue/30',
    border: 'border-l-brand-blue'
  },
  Federal: {
    label: 'Brasil (Federal)',
    className: 'bg-brand-navy/10 text-brand-navy border-brand-navy/30',
    border: 'border-l-brand-navy'
  },
  Municipal: {
    label: 'São Luís (Municipal)',
    className: 'bg-brand-sage/10 text-brand-sage-dark border-brand-sage/30',
    border: 'border-l-brand-sage'
  },
  SPC: {
    label: 'Norma SPC/DPHAP',
    className: 'bg-brand-terracotta/10 text-brand-terracotta border-brand-terracotta/30',
    border: 'border-l-brand-terracotta'
  }
};

const CATEGORY_CONFIG: Record<
  LegalDocumentCategory,
  {
    icon: React.ElementType;
    badge: string;
  }
> = {
  Lei: {
    icon: Gavel,
    badge: 'bg-[#CC343A]/10 text-[#A92831] border-[#CC343A]/20'
  },
  Decreto: {
    icon: ShieldCheck,
    badge: 'bg-brand-blue/10 text-brand-blue-dark border-brand-blue/20'
  },
  Portaria: {
    icon: FileCheck2,
    badge: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  'Instrução Normativa': {
    icon: FileText,
    badge: 'bg-cyan-50 text-cyan-800 border-cyan-200'
  },
  Resolução: {
    icon: Scale,
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  Diretriz: {
    icon: BookOpen,
    badge: 'bg-teal-50 text-teal-800 border-teal-200'
  },
  Manual: {
    icon: LibraryBig,
    badge: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  Outro: {
    icon: FileText,
    badge: 'bg-slate-100 text-slate-700 border-slate-200'
  }
};

const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const formatDate = (date: string) => {
  if (!date) return 'Data da norma';
  const parsed = new Date(date + 'T12:00:00');
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const parseYear = (date: string) => {
  if (!date) return '—';
  return date.slice(0, 4);
};

const parseDateNum = (d: string) => {
  if (!d) return 99999999;
  const parts = d.split('-').map(Number);
  if (parts.length === 3) {
    return parts[0] * 10000 + parts[1] * 100 + parts[2];
  }
  return Number(d) || 99999999;
};

const isCategory = (value: unknown): value is LegalDocumentCategory =>
  typeof value === 'string' && [...CATEGORIES, 'Outro'].includes(value as LegalDocumentCategory);

const isScope = (value: unknown): value is LegalDocumentScope =>
  typeof value === 'string' && SCOPES.includes(value as LegalDocumentScope);

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
    raw.format === 'PDF' || raw.format === 'HTML' || raw.format === 'Imagem' || raw.format === 'Outro'
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
    didacticExplanation: typeof raw.didacticExplanation === 'string' ? raw.didacticExplanation : undefined,
    practicalApplication: typeof raw.practicalApplication === 'string' ? raw.practicalApplication : undefined,
    issuer: typeof raw.issuer === 'string' ? raw.issuer : 'Superintendência do Patrimônio Cultural',
    sourceLabel: typeof raw.sourceLabel === 'string' ? raw.sourceLabel : 'SPC Maranhão',
    sourceUrl,
    sourceKind: sourceUrl.startsWith('https://') ? 'official-online' : 'institutional-copy',
    alternateSourceLabel:
      typeof raw.alternateSourceLabel === 'string' ? raw.alternateSourceLabel : undefined,
    alternateSourceUrl:
      typeof raw.alternateSourceUrl === 'string' ? raw.alternateSourceUrl : undefined,
    format,
    tags: rawTags,
    officialPublication:
      typeof raw.officialPublication === 'string' ? raw.officialPublication : undefined,
    validationNote: typeof raw.validationNote === 'string' ? raw.validationNote : undefined,
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

  // Filtros didáticos específicos
  const [activeScope, setActiveScope] = useState<'Todos' | LegalDocumentScope>('Todos');
  const [activeTopic, setActiveTopic] = useState<string>('Todos');
  const [activeCategory, setActiveCategory] = useState<'Todos' | LegalDocumentCategory>('Todos');
  const [activeFormat, setActiveFormat] = useState<'Todos' | 'PDF' | 'HTML'>('Todos');
  const [sortMode, setSortMode] = useState<SortMode>('criacao-asc'); // Padrão: por ordem cronológica de criação
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [publishedDocuments, setPublishedDocuments] = useState<PublicLegalDocument[]>([]);

  useEffect(() => {
    const publicDocumentsQuery = query(
      collection(db, 'legislation'),
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(
      publicDocumentsQuery,
      (snapshot) => {
        const documents = snapshot.docs
          .map((item) => mapPublishedDocument(item.id, item.data()))
          .filter((item): item is PublicLegalDocument => item !== null);
        setPublishedDocuments(documents);
      },
      () => {
        setPublishedDocuments([]);
      }
    );

    return () => unsubscribe();
  }, []);

  const allDocuments = useMemo(() => {
    const merged = new Map<string, PublicLegalDocument>();
    PUBLIC_LEGAL_DOCUMENTS.forEach((document) => merged.set(document.id, document));
    publishedDocuments.forEach((document) => merged.set(document.id, document));
    return Array.from(merged.values());
  }, [publishedDocuments]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const copyLegalCitation = (doc: PublicLegalDocument) => {
    const publication = doc.officialPublication ? ` (${doc.officialPublication})` : '';
    const citation = `${doc.title}${publication}. ${doc.description} Fonte oficial: ${doc.sourceLabel}. Disponível no Portal SPC Maranhão.`;
    navigator.clipboard.writeText(citation);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return allDocuments
      .filter((doc) => {
        if (normalizedSearch) {
          const searchable = normalizeText(
            [
              doc.title,
              doc.description,
              doc.didacticExplanation || '',
              doc.practicalApplication || '',
              doc.issuer,
              doc.sourceLabel,
              doc.officialPublication || '',
              ...doc.tags
            ].join(' ')
          );
          if (!searchable.includes(normalizedSearch)) return false;
        }

        if (activeScope !== 'Todos' && doc.scope !== activeScope) return false;
        if (activeCategory !== 'Todos' && doc.category !== activeCategory) return false;
        if (activeFormat !== 'Todos' && doc.format !== activeFormat) return false;
        if (activeTopic !== 'Todos') {
          const hasTag = doc.tags.some((t) => normalizeText(t).includes(normalizeText(activeTopic)));
          if (!hasTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortMode === 'criacao-asc') {
          return parseDateNum(a.date) - parseDateNum(b.date);
        }
        if (sortMode === 'criacao-desc') {
          return parseDateNum(b.date) - parseDateNum(a.date);
        }
        if (sortMode === 'esfera') {
          const SCOPE_ORDER: Record<LegalDocumentScope, number> = {
            Estadual: 0,
            SPC: 1,
            Municipal: 2,
            Federal: 3
          };
          const diff = SCOPE_ORDER[a.scope] - SCOPE_ORDER[b.scope];
          return diff !== 0 ? diff : parseDateNum(a.date) - parseDateNum(b.date);
        }
        if (sortMode === 'titulo') {
          return a.title.localeCompare(b.title, 'pt-BR');
        }
        return 0;
      });
  }, [allDocuments, searchTerm, activeScope, activeTopic, activeCategory, activeFormat, sortMode]);

  const clearFilters = () => {
    setSearchTerm('');
    setActiveScope('Todos');
    setActiveTopic('Todos');
    setActiveCategory('Todos');
    setActiveFormat('Todos');
    setSortMode('criacao-asc');
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    activeScope !== 'Todos' ||
    activeTopic !== 'Todos' ||
    activeCategory !== 'Todos' ||
    activeFormat !== 'Todos' ||
    sortMode !== 'criacao-asc';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800">
      {/* Hero Imersivo e Limpo (Sem clichês de contadores vazios) */}
      <PageHero
        tone="sage"
        align="center"
        backgroundImage="/imagens/1912 - justo jansen - mapa.jpg"
        title={<>Legislação do Patrimônio Cultural</>}
        description="Consulte as leis, decretos, portarias e diretrizes que fundamentam a preservação, o tombamento e a salvaguarda histórica no Maranhão."
        actions={
          <div className="w-full max-w-2xl text-left space-y-3">
            <label htmlFor="legal-search" className="sr-only">
              Buscar na biblioteca de normas
            </label>
            <div className="relative group">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-navy transition-colors"
                size={20}
                aria-hidden="true"
              />
              <input
                id="legal-search"
                type="search"
                placeholder="Busque por número da lei, assunto, órgão ou palavra-chave..."
                className="w-full pl-14 pr-6 py-4 bg-white text-brand-navy placeholder:text-slate-400 rounded-2xl text-sm font-semibold shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#E36B5D]/40"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <p className="text-xs text-white/80 text-center sm:text-left">
              Organizado em ordem cronológica de criação com explicação didática para cidadãos e técnicos. Em breve, novas legislações e decretos serão inseridos no acervo.
            </p>
          </div>
        }
      />

      {/* Conteúdo Principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-8">

        {/* Aviso Didático de Inserção Contínua de Novas Legislações */}
        <div className="rounded-2xl border border-brand-sand bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-brand-blue">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue-dark flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-brand-navy text-sm sm:text-base">Acervo em Expansão Contínua</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-terracotta/10 text-brand-terracotta border border-brand-terracotta/20">
                  Em breve novas legislações
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                A equipe técnica e jurídica da SPC/DPHAP está em fase permanente de levantamento, conferência e digitalização de decretos de tombamento, portarias e regulamentos complementares de patrimônio edificado e imaterial. Em breve, novas legislações estarão disponíveis para consulta pública direta.
              </p>
            </div>
          </div>
          <a
            href="mailto:dphapspc@gmail.com?subject=Sugest%C3%A3o%20ou%20Consulta%20de%20Norma%20-%20Legisla%C3%A7%C3%A3o%20SPC"
            className="whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold text-brand-navy border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs self-end sm:self-center"
          >
            Sugerir norma / Dúvida jurídica
          </a>
        </div>

        {/* Barra de Filtros Específicos & Didáticos */}
        <div className="rounded-2xl border border-brand-sand bg-white p-5 shadow-xs space-y-5">
          {/* 1. Esfera / Origem com Pills Rápidas */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Filtrar por Âmbito Legal:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveScope('Todos')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeScope === 'Todos'
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                Todas as Esferas ({allDocuments.length})
              </button>
              {SCOPES.map((scope) => {
                const count = allDocuments.filter((d) => d.scope === scope).length;
                if (count === 0) return null;
                const isSelected = activeScope === scope;
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setActiveScope(isSelected ? 'Todos' : scope)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      isSelected
                        ? ESFERA_BADGE[scope].className + ' shadow-xs font-extrabold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {ESFERA_BADGE[scope].label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Temas Práticos & Específicos */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              2. Assuntos e Aplicação Prática:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SPECIFIC_TOPICS.map((topic) => {
                const isSelected = activeTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setActiveTopic(isSelected && topic !== 'Todos' ? 'Todos' : topic)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-brand-terracotta text-white font-bold'
                        : 'bg-brand-light text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Linha de Controles: Tipo, Ordenação e Limpeza */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <label htmlFor="filtro-tipo" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Tipo de Ato
              </label>
              <select
                id="filtro-tipo"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value as 'Todos' | LegalDocumentCategory)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Todos">Todos os tipos de ato</option>
                <option value="Lei">Leis</option>
                <option value="Decreto">Decretos</option>
                <option value="Portaria">Portarias</option>
                <option value="Diretriz">Diretrizes Técnicas</option>
              </select>
            </div>

            <div>
              <label htmlFor="filtro-ordem" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Ordenação dos Documentos
              </label>
              <select
                id="filtro-ordem"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="criacao-asc">📅 Ordem de criação (1937 → 2026)</option>
                <option value="criacao-desc">📅 Mais recentes primeiro (2026 → 1937)</option>
                <option value="esfera">🏛️ Por âmbito (Estadual, SPC, Municipal, Federal)</option>
                <option value="titulo">🔤 Título da norma (A – Z)</option>
              </select>
            </div>

            <div className="flex items-end justify-between sm:justify-end gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-brand-red-dark hover:bg-brand-red/10 transition-colors"
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Status dos Resultados */}
        <div className="flex items-center justify-between text-xs px-1">
          <p className="font-bold text-brand-navy" role="status" aria-live="polite">
            Exibindo <span className="text-brand-terracotta">{filteredDocuments.length}</span>{' '}
            {filteredDocuments.length === 1 ? 'norma' : 'normas'}{' '}
            {sortMode === 'criacao-asc' && <span className="font-normal text-slate-500">(ordenadas cronologicamente por ano de criação)</span>}
          </p>
          <span className="text-slate-500 hidden sm:inline">
            Clique em "Explicar esta norma" para ver sua aplicação prática no Maranhão
          </span>
        </div>

        {/* Lista de Cards Menores, Imersivos e Didáticos */}
        {filteredDocuments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm space-y-3">
            <Info size={32} className="mx-auto text-slate-400" />
            <p className="font-bold text-brand-navy text-base">Nenhum documento encontrado com estes filtros.</p>
            <p className="text-slate-600 max-w-md mx-auto text-xs">
              Tente redefinir a busca por palavra-chave ou selecionar "Todas as Esferas" para ver o acervo completo.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-blue"
            >
              Restaurar Acervo de Legislação
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((doc) => {
              const CategoryIcon = CATEGORY_CONFIG[doc.category]?.icon || FileText;
              const isExpanded = expandedId === doc.id;
              const year = parseYear(doc.date);
              const isPdf = doc.format === 'PDF';
              const sphere = ESFERA_BADGE[doc.scope] || ESFERA_BADGE.SPC;

              return (
                <article
                  key={doc.id}
                  className={`rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between border-l-4 ${sphere.border}`}
                >
                  <div className="space-y-3">
                    {/* Header Compacto com Metadados Visuais */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {year !== '—' && (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                            <Calendar size={11} className="text-slate-500" />
                            {year}
                          </span>
                        )}
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${sphere.className}`}>
                          {doc.scope}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          <CategoryIcon size={11} />
                          {doc.category}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {doc.format}
                      </span>
                    </div>

                    {/* Título da Norma */}
                    <h3 className="font-display font-bold text-sm sm:text-base text-brand-navy leading-snug">
                      {doc.title}
                    </h3>

                    {/* Descrição / Ementa */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {doc.description}
                    </p>

                    {/* Bloco Didático Interativo: Explicação Didática e Impacto Prático */}
                    {(doc.didacticExplanation || doc.practicalApplication) && (
                      <div className="rounded-xl bg-brand-light/70 p-3 border border-slate-200/60 text-xs space-y-2">
                        {doc.didacticExplanation && (
                          <div>
                            <span className="font-bold text-brand-navy flex items-center gap-1 text-[11px] uppercase tracking-wider mb-0.5">
                              <Sparkles size={12} className="text-brand-terracotta" /> O que é esta norma?
                            </span>
                            <p className="text-slate-700 leading-relaxed text-[11px]">
                              {doc.didacticExplanation}
                            </p>
                          </div>
                        )}

                        {doc.practicalApplication && (
                          <div className="pt-1.5 border-t border-slate-200/50">
                            <span className="font-bold text-brand-blue-dark block text-[11px] uppercase tracking-wider mb-0.5">
                              🏛️ Aplicação no Maranhão:
                            </span>
                            <p className="text-slate-700 leading-relaxed text-[11px]">
                              {doc.practicalApplication}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Detalhes Expansíveis da Publicação */}
                    {isExpanded && (
                      <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 animate-fade-in">
                        {doc.officialPublication && (
                          <p>
                            <strong className="text-slate-800">Publicação Oficial:</strong> {doc.officialPublication}
                          </p>
                        )}
                        {doc.date && (
                          <p>
                            <strong className="text-slate-800">Data Formal do Ato:</strong> {formatDate(doc.date)}
                          </p>
                        )}
                        {doc.issuer && (
                          <p>
                            <strong className="text-slate-800">Órgão Emissor:</strong> {doc.issuer}
                          </p>
                        )}
                        {doc.validationNote && (
                          <p className="bg-amber-50 p-2 rounded-lg text-amber-900 border border-amber-200">
                            <strong>Nota da SPC:</strong> {doc.validationNote}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Card com Ações */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleExpand(doc.id)}
                      className="text-slate-500 hover:text-brand-navy font-semibold inline-flex items-center gap-1 py-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={13} /> Menos dados
                        </>
                      ) : (
                        <>
                          <ChevronDown size={13} /> Detalhes da fonte
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyLegalCitation(doc)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy transition-colors"
                        title="Copiar referência jurídica formatada"
                        aria-label={`Copiar citação de ${doc.title}`}
                      >
                        {copiedId === doc.id ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                            <Check size={12} /> Copiado!
                          </span>
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>

                      <a
                        href={doc.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          isPdf
                            ? 'bg-brand-sage-dark text-white hover:bg-brand-navy shadow-xs'
                            : 'border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white'
                        }`}
                        aria-label={`Acessar ${doc.title}`}
                      >
                        {isPdf ? <Download size={12} /> : <ExternalLink size={12} />}
                        <span>{isPdf ? 'Abrir PDF' : 'Texto Oficial'}</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Rodapé Informativo */}
        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 text-xs text-slate-600 space-y-2">
          <h4 className="font-bold text-brand-navy text-sm flex items-center gap-2">
            <Info size={16} className="text-brand-blue" />
            Orientações Jurídicas da Biblioteca de Normas
          </h4>
          <p className="leading-relaxed">
            As cópias e links reunidos neste portal têm finalidade didática e de transparência pública, direcionando o cidadão aos textos originais do Diário Oficial do Estado (DOE/MA), Diário Oficial da União (DOU) e acervos acadêmicos e institucionais.
          </p>
          <p className="leading-relaxed">
            <strong>Acervo em expansão:</strong> Decretos e normas complementares estão em processo permanente de inserção. Para certificação de vigência plena de leis e decretos em processos contenciosos, consulte sempre o órgão competente ou a Procuradoria-Geral do Estado do Maranhão (PGE/MA).
          </p>
        </section>

      </div>
    </div>
  );
};

export default LegislacaoPage;