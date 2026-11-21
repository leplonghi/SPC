import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  Download,
  ExternalLink,
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

const isCategory = (v: unknown): v is LegalDocumentCategory =>
  typeof v === 'string' && [...CATEGORIES, 'Outro'].includes(v as LegalDocumentCategory);
const isScope = (v: unknown): v is LegalDocumentScope =>
  typeof v === 'string' && SCOPES.includes(v as LegalDocumentScope);

const mapPublishedDocument = (id: string, raw: Record<string, unknown>): PublicLegalDocument | null => {
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const sourceUrl =
    typeof raw.sourceUrl === 'string' ? raw.sourceUrl.trim() : typeof raw.url === 'string' ? raw.url.trim() : '';
  const category = isCategory(raw.category) ? raw.category : null;
  if (!title || !sourceUrl || !category) return null;
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
    format: sourceUrl.toLowerCase().includes('.pdf') ? 'PDF' : 'HTML',
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === 'string') : [],
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
  const [publishedDocuments, setPublishedDocuments] = useState<PublicLegalDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string>(PUBLIC_LEGAL_DOCUMENTS[0].id);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const qRef = query(collection(db, 'legislation'), where('status', '==', 'published'));
    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const docs: PublicLegalDocument[] = [];
        snap.forEach((d) => {
          const m = mapPublishedDocument(d.id, d.data() as Record<string, unknown>);
          if (m) docs.push(m);
        });
        setPublishedDocuments(docs);
      },
      () => setPublishedDocuments([])
    );
    return () => unsub();
  }, []);

  const allDocuments = useMemo(() => {
    const map = new Map<string, PublicLegalDocument>();
    PUBLIC_LEGAL_DOCUMENTS.forEach((d) => map.set(d.id, d));
    publishedDocuments.forEach((d) => map.set(d.id, d));
    return Array.from(map.values());
  }, [publishedDocuments]);

  const filteredDocuments = useMemo(() => {
    const q = normalizeText(searchTerm);
    return allDocuments
      .filter((doc) => {
        if (activeScope !== 'Todos' && doc.scope !== activeScope) return false;
        if (activeCategory !== 'Todos' && doc.category !== activeCategory) return false;
        if (q) {
          const hay = normalizeText(
            `${doc.title} ${doc.description} ${doc.didacticExplanation ?? ''} ${doc.tags.join(' ')} ${doc.scope} ${doc.category} ${doc.date}`
          );
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => parseDateNum(a.date) - parseDateNum(b.date));
  }, [allDocuments, searchTerm, activeScope, activeCategory]);

  const activeDoc = useMemo(
    () => filteredDocuments.find((d) => d.id === selectedId) || filteredDocuments[0] || null,
    [filteredDocuments, selectedId]
  );

  const hasFilters = Boolean(searchTerm.trim() || activeScope !== 'Todos' || activeCategory !== 'Todos');
  const clearFilters = () => {
    setSearchTerm('');
    setActiveScope('Todos');
    setActiveCategory('Todos');
  };

  const copyCitation = (doc: PublicLegalDocument) => {
    navigator.clipboard.writeText(`${doc.title} (${doc.scope}, ${parseYear(doc.date)}). ${doc.issuer}. Fonte: ${doc.sourceLabel}.`);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const renderDocDetail = (doc: PublicLegalDocument) => {
    const isPdf = doc.format === 'PDF';
    return (
      <div className="space-y-5">
        <div className="space-y-2 pb-4 border-b border-[#E5DDD5]">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-0.5 rounded-md bg-[#256B58] text-white font-mono">{parseYear(doc.date)}</span>
            <span className="text-[#256B58]">{doc.scope}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">{doc.category}</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#071D33] leading-snug">
            {doc.title}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">{doc.description}</p>
        </div>

        {/* Botão Primário de Leitura / Download */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={doc.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#256B58] hover:bg-[#071D33] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
          >
            {isPdf ? <Download size={15} aria-hidden="true" /> : <ExternalLink size={15} aria-hidden="true" />}
            <span>{isPdf ? 'Baixar Texto Oficial (PDF)' : 'Abrir Texto Oficial'}</span>
          </a>

          <button
            type="button"
            onClick={() => copyCitation(doc)}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-[#E5DDD5] bg-[#FAF8F5] hover:border-[#256B58] px-4 py-2.5 text-xs font-bold text-[#071D33] transition-colors"
          >
            {copiedId === doc.id ? (
              <>
                <Check size={14} className="text-[#256B58]" />
                <span className="text-[#256B58]">Citação copiada</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copiar referência</span>
              </>
            )}
          </button>
        </div>

        {/* Explicação Didática e Aplicação Prática */}
        {(doc.didacticExplanation || doc.practicalApplication) && (
          <div className="rounded-2xl bg-[#FAF8F5] border border-[#E5DDD5] p-5 space-y-4 text-sm text-slate-700 leading-relaxed">
            {doc.didacticExplanation && (
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#256B58] flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={13} aria-hidden="true" />
                  O que determina esta norma
                </p>
                <p>{doc.didacticExplanation}</p>
              </div>
            )}
            {doc.practicalApplication && (
              <div className="pt-3.5 border-t border-[#E5DDD5]">
                <p className="text-xs font-black uppercase tracking-wider text-[#071D33] mb-1.5">
                  Aplicação prática no Maranhão
                </p>
                <p>{doc.practicalApplication}</p>
              </div>
            )}
          </div>
        )}

        {/* Metadados da Publicação */}
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
          {doc.date && (
            <div className="rounded-xl bg-white border border-[#E5DDD5] p-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Data do Ato</span>
              <p className="font-bold text-[#071D33] mt-0.5">{formatDate(doc.date)}</p>
            </div>
          )}
          <div className="rounded-xl bg-white border border-[#E5DDD5] p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Órgão / Fonte</span>
            <p className="font-bold text-[#071D33] mt-0.5">{doc.issuer}</p>
          </div>
          {doc.officialPublication && (
            <div className="sm:col-span-2 rounded-xl bg-white border border-[#E5DDD5] p-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Publicação Oficial</span>
              <p className="font-semibold text-[#071D33] mt-0.5">{doc.officialPublication}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-brand-surface text-slate-800 min-h-screen">
      {/* Cabeçalho com Identidade Própria: Verde Sálvia (#256B58) + Azulejos */}
      <header className="relative overflow-hidden bg-[#17483B] text-white py-9 sm:py-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-25 saturate-110"
          style={{ backgroundImage: "url('/cena-fotos/azulejos.webp')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0F3128]/95 via-[#17483B]/85 to-[#256B58]/70"
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E9B44C] flex items-center gap-1.5">
            <BookOpen size={14} aria-hidden="true" />
            <span>Biblioteca Normativa · {allDocuments.length} atos oficiais</span>
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Explorador de Legislação Patrimonial
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm sm:text-base text-slate-100 leading-relaxed">
            Selecione qualquer lei, decreto ou diretriz à esquerda para ler a explicação prática e baixar o texto oficial na mesma tela.
          </p>

          <div className="mt-5 max-w-2xl relative">
            <label htmlFor="legislacao-busca" className="sr-only">Buscar norma</label>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="legislacao-busca"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, ano ou tema (ex.: 10.089, obras, engenhos, imaterial)..."
              className="w-full min-h-[48px] rounded-xl bg-white pl-11 pr-4 py-3 text-sm font-medium text-[#071D33] placeholder:text-slate-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E9B44C]"
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Filtros em 1 Clique (Esfera + Tipo) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveScope('Todos')}
              className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeScope === 'Todos'
                  ? 'bg-[#256B58] text-white shadow-sm'
                  : 'bg-white border border-[#E5DDD5] text-[#071D33] hover:border-[#256B58]'
              }`}
            >
              Todas ({allDocuments.length})
            </button>
            {SCOPES.map((s) => {
              const count = allDocuments.filter((d) => d.scope === s).length;
              if (!count) return null;
              const selected = activeScope === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveScope(selected ? 'Todos' : s)}
                  className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selected
                      ? 'bg-[#256B58] text-white shadow-sm'
                      : 'bg-white border border-[#E5DDD5] text-[#071D33] hover:border-[#256B58]'
                  }`}
                >
                  {s} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filtrar por tipo de ato"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as 'Todos' | LegalDocumentCategory)}
              className="min-h-[38px] rounded-xl border border-[#E5DDD5] bg-white px-3 py-1.5 text-xs font-semibold text-[#071D33]"
            >
              <option value="Todos">Todos os tipos</option>
              <option value="Lei">Leis</option>
              <option value="Decreto">Decretos</option>
              <option value="Portaria">Portarias</option>
              <option value="Diretriz">Diretrizes</option>
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-[38px] inline-flex items-center gap-1 px-2.5 text-xs font-bold text-[#B94734] hover:underline"
              >
                <X size={13} /> Limpar
              </button>
            )}
          </div>
        </div>

        {/* LAYOUT EXPLORADOR (Split Master-Detail) */}
        {filteredDocuments.length === 0 ? (
          <div className="rounded-2xl border border-[#E5DDD5] bg-white p-10 text-center space-y-3">
            <p className="font-bold text-[#071D33]">Nenhuma norma encontrada para esta busca.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#256B58] text-white text-xs font-bold"
            >
              Mostrar todas as normas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5DDD5] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-[#FAF8F5] flex items-center justify-between text-xs">
                <span className="font-bold text-[#071D33]" role="status" aria-live="polite">
                  {filteredDocuments.length} {filteredDocuments.length === 1 ? 'norma' : 'normas'}
                </span>
                <span className="text-slate-500">Toque para ler</span>
              </div>

              <ul className="divide-y divide-slate-100 max-h-[68vh] lg:max-h-[72vh] overflow-y-auto">
                {filteredDocuments.map((doc) => {
                  const isSelected = activeDoc?.id === doc.id;
                  return (
                    <li key={doc.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(doc.id);
                          setMobileDrawerOpen(true);
                        }}
                        className={`w-full text-left px-4 py-3.5 transition-colors flex items-start justify-between gap-3 border-l-4 ${
                          isSelected
                            ? 'bg-[#256B58]/10 border-l-[#256B58]'
                            : 'bg-white border-l-transparent hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold">
                            <span className="font-mono text-[#256B58]">{parseYear(doc.date)}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-600">{doc.scope}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500 font-normal">{doc.category}</span>
                          </div>
                          <p className="text-sm font-bold text-[#071D33] leading-snug line-clamp-2">
                            {doc.title}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {doc.format}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="hidden lg:block lg:col-span-7 sticky top-20 bg-white rounded-2xl border border-[#E5DDD5] p-6 sm:p-7 shadow-sm">
              {activeDoc && renderDocDetail(activeDoc)}
            </aside>
          </div>
        )}
      </div>

      {/* Gaveta Deslizante Mobile */}
      {mobileDrawerOpen && activeDoc && (
        <div
          className="lg:hidden fixed inset-0 z-[180] bg-[#071D33]/60 backdrop-blur-xs flex items-end"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-full max-h-[86vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl animate-slide-in-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Leitura da Norma
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="min-h-[36px] min-w-[36px] rounded-full bg-slate-100 text-[#071D33] flex items-center justify-center"
                aria-label="Fechar leitura"
              >
                <X size={18} />
              </button>
            </div>
            {renderDocDetail(activeDoc)}
          </div>
        </div>
      )}
    </div>
  );
};

export default LegislacaoPage;
