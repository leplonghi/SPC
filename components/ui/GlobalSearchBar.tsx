import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Landmark,
  Compass,
  BookOpen,
  FileText,
  ArrowRight,
  Download,
  X
} from 'lucide-react';
import { BENS_TOMBADOS, DECRETOS_PDF } from '../../data/bensTombados';
import { MAPAS_HISTORICOS } from '../../data/mapasHistoricos';
import { PUBLIC_LEGAL_DOCUMENTS } from '../../data/publicLegalDocuments';

const SERVICOS_BUSCA = [
  { id: 's1', title: 'Autorização para Intervenção / Obra em Imóvel Tombado', dept: 'DPHAP', keywords: 'obra reforma pintura restauracao alvara fachada' },
  { id: 's2', title: 'Certidão de Limites de Poligonal e Tombamento', dept: 'DPHAP', keywords: 'certidao poligonal limites entorno terreno imovel' },
  { id: 's3', title: 'Autorização para Engenhos Publicitários (Placas e Letreiros)', dept: 'DPHAP', keywords: 'placa letreiro toldo propaganda publicidade fachada' },
  { id: 's4', title: 'Solicitação de Registro de Patrimônio Cultural Imaterial', dept: 'DPI', keywords: 'imaterial saberes celebracoes festa registro salvaguarda' },
  { id: 's5', title: 'Consulta Técnica Prévia de Projetos e Restauro', dept: 'DPE', keywords: 'projeto restauro arquitetura duvida tecnica consulta' }
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

interface GlobalSearchBarProps {
  placeholder?: string;
  className?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  placeholder = 'O que você procura? Ex.: Alcântara, reforma, Decreto 10.089, Viana...',
  className = ''
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (q.length < 2) return null;

    const bens = BENS_TOMBADOS.filter((b) =>
      norm(`${b.id} ${b.nome} ${b.municipio} ${b.local ?? ''} ${b.decreto.numero}`).includes(q)
    ).slice(0, 4);

    const mapas = MAPAS_HISTORICOS.filter((m) =>
      norm(`${m.titulo} ${m.municipio} ${m.ano} ${m.categoria} ${m.epocaLabel}`).includes(q)
    ).slice(0, 3);

    const leis = PUBLIC_LEGAL_DOCUMENTS.filter((d) =>
      norm(`${d.title} ${d.description} ${d.scope} ${d.category} ${d.tags.join(' ')} ${d.date}`).includes(q)
    ).slice(0, 3);

    const servicos = SERVICOS_BUSCA.filter((s) =>
      norm(`${s.title} ${s.dept} ${s.keywords}`).includes(q)
    ).slice(0, 3);

    const total = bens.length + mapas.length + leis.length + servicos.length;
    return { bens, mapas, leis, servicos, total };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      navigate('/bens-tombados');
      return;
    }
    setOpen(false);
    if (results && results.bens.length > 0) {
      navigate(`/bens-tombados?q=${encodeURIComponent(q)}`);
    } else if (results && results.mapas.length > 0) {
      navigate(`/mapa?mapa=${encodeURIComponent(results.mapas[0].id)}`);
    } else if (results && results.leis.length > 0) {
      navigate(`/legislacao?q=${encodeURIComponent(q)}`);
    } else if (results && results.servicos.length > 0) {
      navigate(`/servicos?servico=${encodeURIComponent(results.servicos[0].id)}`);
    } else {
      navigate(`/bens-tombados?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div ref={boxRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} role="search" className="relative flex items-center">
        <label htmlFor="global-search-input" className="sr-only">
          Busca global em bens tombados, mapas, legislações e serviços
        </label>
        <Search
          size={19}
          className="absolute left-4 text-slate-500 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="global-search-input"
          type="search"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full min-h-[54px] rounded-2xl bg-white/95 backdrop-blur-md pl-12 pr-28 py-3.5 text-sm sm:text-base font-medium text-[#071D33] placeholder:text-slate-500 shadow-2xl border border-white/80 focus:outline-none focus:ring-4 focus:ring-[#E9B44C]/60"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            aria-label="Limpar busca"
            className="absolute right-24 p-1.5 text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1.5 min-h-[42px] px-4 sm:px-5 rounded-xl bg-[#071D33] hover:bg-[#B94734] text-white text-xs sm:text-sm font-bold transition-colors shadow-md"
        >
          Buscar
        </button>
      </form>

      {/* Sugestões rápidas quando vazio e focado */}
      {open && !results && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-white border border-[#E5DDD5] shadow-2xl p-4 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Buscas frequentes em todo o portal
          </p>
          <div className="flex flex-wrap gap-2">
            {['São Luís', 'Alcântara', 'Viana', 'Caxias', 'Carolina', 'Obra', '10.089', 'Engenhos'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  setOpen(true);
                }}
                className="min-h-[34px] px-3 py-1 rounded-full bg-brand-surface border border-[#E5DDD5] text-xs font-semibold text-brand-navy hover:border-brand-terracotta hover:text-brand-terracotta transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resultados Instantâneos Agrupados por Domínio */}
      {open && results && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-[70vh] overflow-y-auto rounded-2xl bg-white border border-[#E5DDD5] shadow-2xl p-3 sm:p-4 text-left space-y-4">
          {results.total === 0 ? (
            <p className="text-sm text-slate-600 py-4 text-center">
              Nenhum resultado para <strong>“{query}”</strong>. Tente um município (ex.: Alcântara), número de decreto ou serviço.
            </p>
          ) : (
            <>
              {results.bens.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 mb-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-brand-blue-dark flex items-center gap-1.5">
                      <Landmark size={13} /> Bens Tombados
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        navigate(`/bens-tombados?q=${encodeURIComponent(query)}`);
                      }}
                      className="text-[11px] font-bold text-brand-navy hover:text-brand-terracotta underline"
                    >
                      Ver todos →
                    </button>
                  </div>
                  <div className="space-y-1">
                    {results.bens.map((bem) => (
                      <button
                        key={bem.id}
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          navigate(`/bens-tombados?q=${encodeURIComponent(bem.id)}`);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-brand-surface transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-brand-navy truncate">{bem.nome}</p>
                          <p className="text-[11px] text-slate-500">
                            #{bem.id} · {bem.municipio} · Dec. {bem.decreto.numero}
                          </p>
                        </div>
                        {DECRETOS_PDF[bem.decreto.numero] && (
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-brand-sage/15 text-brand-sage-dark">
                            PDF
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.mapas.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between px-2 mb-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-brand-terracotta flex items-center gap-1.5">
                      <Compass size={13} /> Mapas & Poligonais
                    </span>
                  </div>
                  <div className="space-y-1">
                    {results.mapas.map((m) => (
                      <div
                        key={m.id}
                        className="px-3 py-2 rounded-xl hover:bg-brand-surface transition-colors flex items-center justify-between gap-2"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            navigate(`/mapa?mapa=${encodeURIComponent(m.id)}`);
                          }}
                          className="text-left min-w-0 flex-1"
                        >
                          <p className="text-xs sm:text-sm font-bold text-brand-navy truncate">{m.titulo}</p>
                          <p className="text-[11px] text-slate-500">{m.categoria} · {m.municipio} · {m.ano}</p>
                        </button>
                        <a
                          href={m.downloadUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-navy text-white text-[11px] font-bold hover:bg-brand-terracotta"
                        >
                          <Download size={11} /> Baixar
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.leis.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between px-2 mb-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-brand-sage-dark flex items-center gap-1.5">
                      <BookOpen size={13} /> Legislação
                    </span>
                  </div>
                  <div className="space-y-1">
                    {results.leis.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          navigate(`/legislacao?q=${encodeURIComponent(doc.title)}`);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-surface transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-brand-navy truncate">{doc.title}</p>
                          <p className="text-[11px] text-slate-500">{doc.scope} · {doc.category}</p>
                        </div>
                        <ArrowRight size={13} className="text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.servicos.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between px-2 mb-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
                      <FileText size={13} /> Serviços & Formulários
                    </span>
                  </div>
                  <div className="space-y-1">
                    {results.servicos.map((srv) => (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          navigate(`/servicos?servico=${encodeURIComponent(srv.id)}`);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-brand-surface transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-brand-navy truncate">{srv.title}</p>
                          <p className="text-[11px] text-slate-500">Setor: {srv.dept}</p>
                        </div>
                        <ArrowRight size={13} className="text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
