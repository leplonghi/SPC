import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  Info,
  Search,
  Sparkles,
  X
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { usePageTitle } from '../hooks/usePageTitle';
import { db } from '../firebase';
import {
  LegalDocumentCategory,
  LegalDocumentScope,
  PUBLIC_LEGAL_DOCUMENTS,
  PublicLegalDocument
} from '../data/publicLegalDocuments';

type SortMode = 'criacao-asc' | 'criacao-desc' | 'titulo';

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

const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const formatDate = (date: string) => {
  if (!date) return 'Data da norma';
  const parsed = new Date(date + 'T12:00:00');
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const parseYear = (date: string) => (date ? date.slice(0, 4) : '—');

const parseDateNum = (d: string) => {
  if (!d) return 99999999;
  const parts = d.split('-').map(Number);
  return parts.length === 3 ? parts[0] * 10000 + parts[1] * 100 + parts[2] : Number(d) || 99999999;
};

const isCategory = (value: unknown): value is LegalDocumentCategory =>
  typeof value === 'string' && [...CATEGORIES, 'Outro'].includes(value as LegalDocumentCategory);

const isScope = (value: unknown): value is LegalDocumentScope =>
  typeof value === 'string' && SCOPES.includes(value as LegalDocumentScope);

const mapPublishedDocument = (id: string, raw: Record<string, unknown>): PublicLegalDocument | null => {
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
    format,
    tags: rawTags,
    officialPublication: typeof raw.officialPublication === 'string' ? raw.officialPublication : undefined,
    validationNote: typeof raw.validationNote === 'string' ? raw.validationNote : undefined,
    verifiedAt: typeof raw.verifiedAt === 'string' ? raw.verifiedAt : '',
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

  const [activeScope, setActiveScope] = useState<'Todos' | LegalDocumentScope>('Todos');
  const [activeCategory, setActiveCategory] = useState<'Todos' | LegalDocumentCategory>('Todos');
  const [sortMode, setSortMode] = useState<SortMode>('criacao-asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [publishedDocuments, setPublishedDocuments] = useState<PublicLegalDocument[]>([]);

  useEffect(() => {
    const publicDocumentsQuery = query(collection(db, 'legislation'), where('status', '==', 'published'));
    const unsubscribe = onSnapshot(
      publicDocumentsQuery,
      (snapshot) => {
        const docs: PublicLegalDocument[] = [];
        snapshot.forEach((docSnap) => {
          const mapped = mapPublishedDocument(docSnap.id, docSnap.data() as Record<string, unknown>);
          if (mapped) docs.push(mapped);
        });
        setPublishedDocuments(docs);
      },
      () => setPublishedDocuments([])
    );
    return () => unsubscribe();
  }, []);

  const allDocuments = useMemo(() => {
    const map = new Map<string, PublicLegalDocument>();
    PUBLIC_LEGAL_DOCUMENTS.forEach((d) => map.set(d.id, d));
    publishedDocuments.forEach((d) => map.set(d.id, d));
    return Array.from(map.values());
  }, [publishedDocuments]);

  const filteredDocuments = useMemo(() => {
    const q = normalizeText(searchTerm);
    const list = allDocuments.filter((doc) => {
      if (activeScope !== 'Todos' && doc.scope !== activeScope) return false;
      if (activeCategory !== 'Todos' && doc.category !== activeCategory) return false;
      if (q) {
        const hay = normalizeText(
          `${doc.title} ${doc.description} ${doc.didacticExplanation ?? ''} ${doc.tags.join(' ')} ${doc.scope} ${doc.category} ${doc.date}`
        );
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortMode === 'criacao-desc') return parseDateNum(b.date) - parseDateNum(a.date);
      if (sortMode === 'titulo') return a.title.localeCompare(b.title, 'pt-BR');
      return parseDateNum(a.date) - parseDateNum(b.date);
    });
  }, [allDocuments, searchTerm, activeScope, activeCategory, sortMode]);

  const hasActiveFilters = searchTerm.trim() !== '' || activeScope !== 'Todos' || activeCategory !== 'Todos';
  const clearFilters = () => {
    setSearchTerm('');
    setActiveScope('Todos');
    setActiveCategory('Todos');
  };

  const copyLegalCitation = (doc: PublicLegalDocument) => {
    const citation = `${doc.title} (${doc.scope}, ${parseYear(doc.date)}). ${doc.issuer}. Fonte: ${doc.sourceLabel}.`;
    navigator.clipboard.writeText(citation);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  return (
    <div className="bg-brand-surface text-slate-800 min-h-screen">
      {/* Cabeçalho Clean de Alto Contraste */}
      <header className="bg-brand-navy text-white py-9 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            Biblioteca Normativa · SPC/SECMA
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Legislação do Patrimônio Cultural
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm sm:text-base text-slate-200 leading-relaxed">
            Leis, decretos e portarias federais, estaduais e municipais com acesso direto ao texto oficial e explicação prática.
          </p>

          <div className="mt-6 max-w-2xl relative">
            <label htmlFor="legislacao-busca" className="sr-only">
              Buscar norma por número, ano ou assunto
            </label>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="legislacao-busca"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, ano ou tema (ex.: 10.089, tombamento, obras)..."
              className="w-full min-h-[48px] rounded-xl bg-white pl-11 pr-4 py-3 text-sm font-medium text-brand-navy placeholder:text-slate-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Barra Única e Intuitiva de Filtros */}
        <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveScope('Todos')}
              className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeScope === 'Todos'
                  ? 'bg-brand-navy text-white'
                  : 'bg-brand-surface text-slate-700 hover:bg-brand-sand/60'
              }`}
            >
              Todas ({allDocuments.length})
            </button>
            {SCOPES.map((scope) => {
              const count = allDocuments.filter((d) => d.scope === scope).length;
              if (count === 0) return null;
              const selected = activeScope === scope;
              return (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setActiveScope(selected ? 'Todos' : scope)}
                  className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selected
                      ? 'bg-brand-navy text-white'
                      : 'bg-brand-surface text-slate-700 hover:bg-brand-sand/60'
                  }`}
                >
                  {scope} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <label htmlFor="filtro-tipo" className="sr-only">Tipo de ato</label>
            <select
              id="filtro-tipo"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as 'Todos' | LegalDocumentCategory)}
              className="min-h-[38px] rounded-xl border border-[#E5DDD5] bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-blue"
            >
              <option value="Todos">Todos os tipos</option>
              <option value="Lei">Leis</option>
              <option value="Decreto">Decretos</option>
              <option value="Portaria">Portarias</option>
              <option value="Diretriz">Diretrizes</option>
            </select>

            <label htmlFor="filtro-ordem" className="sr-only">Ordenação</label>
            <select
              id="filtro-ordem"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="min-h-[38px] rounded-xl border border-[#E5DDD5] bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-blue"
            >
              <option value="criacao-asc">Cronológica (antigas → recentes)</option>
              <option value="criacao-desc">Mais recentes primeiro</option>
              <option value="titulo">Título (A–Z)</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-[38px] inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-terracotta hover:bg-brand-terracotta/10 transition-colors"
              >
                <X size={13} aria-hidden="true" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Contagem limpa */}
        <p className="text-xs font-semibold text-slate-600 px-1" role="status" aria-live="polite">
          <strong className="text-brand-navy">{filteredDocuments.length}</strong>{' '}
          {filteredDocuments.length === 1 ? 'norma encontrada' : 'normas encontradas'}
        </p>

        {/* Lista de Cards Ultra-Clean (Sem poluição visual; explicação didática sob demanda) */}
        {filteredDocuments.length === 0 ? (
          <div className="rounded-2xl border border-[#E5DDD5] bg-white p-10 text-center space-y-3">
            <Info size={28} className="mx-auto text-slate-400" />
            <p className="font-bold text-brand-navy">Nenhuma norma encontrada para esta busca.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-blue transition-colors"
            >
              Mostrar todas as normas
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => {
              const isExpanded = expandedId === doc.id;
              const year = parseYear(doc.date);
              const isPdf = doc.format === 'PDF';

              return (
                <article
                  key={doc.id}
                  className="rounded-2xl border border-[#E5DDD5] bg-white p-5 sm:p-6 shadow-sm hover:border-brand-navy/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <p className="text-xs font-bold text-slate-500 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-brand-navy">{year}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-brand-blue-dark">{doc.scope}</span>
                        <span aria-hidden="true">·</span>
                        <span>{doc.category}</span>
                      </p>

                      <h2 className="font-display text-base sm:text-lg font-bold text-brand-navy leading-snug">
                        {doc.title}
                      </h2>

                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {doc.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:pt-1">
                      <a
                        href={doc.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`min-h-[42px] inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                          isPdf
                            ? 'bg-brand-navy text-white hover:bg-brand-blue'
                            : 'border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white'
                        }`}
                      >
                        {isPdf ? <Download size={14} aria-hidden="true" /> : <ExternalLink size={14} aria-hidden="true" />}
                        <span>{isPdf ? 'Baixar PDF' : 'Ler texto oficial'}</span>
                      </a>
                    </div>
                  </div>

                  {/* Rodapé discreto */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                      className="inline-flex items-center gap-1.5 font-bold text-brand-blue-dark hover:text-brand-navy py-1"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      <span>{isExpanded ? 'Ocultar explicação e fonte' : 'Explicação prática e dados da fonte'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyLegalCitation(doc)}
                      className="inline-flex items-center gap-1.5 text-slate-500 hover:text-brand-navy font-semibold px-2.5 py-1 rounded-lg hover:bg-brand-surface transition-colors"
                    >
                      {copiedId === doc.id ? (
                        <>
                          <Check size={13} className="text-brand-sage-dark" />
                          <span className="text-brand-sage-dark font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copiar citação</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Explicação didática + metadados sob demanda */}
                  {isExpanded && (
                    <div className="mt-4 rounded-xl bg-brand-surface border border-[#E5DDD5] p-4 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {doc.didacticExplanation && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5 mb-1">
                            <Sparkles size={13} className="text-brand-terracotta" aria-hidden="true" />
                            O que determina esta norma
                          </p>
                          <p>{doc.didacticExplanation}</p>
                        </div>
                      )}
                      {doc.practicalApplication && (
                        <div className="pt-2.5 border-t border-[#E5DDD5]">
                          <p className="text-xs font-bold uppercase tracking-wider text-brand-blue-dark mb-1">
                            Aplicação prática no Maranhão
                          </p>
                          <p>{doc.practicalApplication}</p>
                        </div>
                      )}
                      <div className="pt-2.5 border-t border-[#E5DDD5] grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        {doc.date && <p><strong className="text-brand-navy">Data do ato:</strong> {formatDate(doc.date)}</p>}
                        {doc.issuer && <p><strong className="text-brand-navy">Órgão emissor:</strong> {doc.issuer}</p>}
                        {doc.officialPublication && <p className="sm:col-span-2"><strong className="text-brand-navy">Publicação oficial:</strong> {doc.officialPublication}</p>}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegislacaoPage;
