import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  Compass,
  FileText,
  Landmark
} from 'lucide-react';
import { BENS_TOMBADOS } from '../../data/bensTombados';
import { PUBLIC_LEGAL_DOCUMENTS } from '../../data/publicLegalDocuments';
import { MAPAS_HISTORICOS } from '../../data/mapasHistoricos';
import { GlobalSearchBar } from './GlobalSearchBar';

interface PortalShortcut {
  id: string;
  title: string;
  meta: string;
  to: string;
  accentBar: string;
  iconStyle: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
}

/**
 * Hero Limpo e Equilibrado + Barra de Portais sobre fundo neutro (#FAF8F5)
 * Elimina completamente a sobreposição de fotos sobre ilustração (zero poluição visual).
 */
export const OrigamiMenu: React.FC = () => {
  const totalMunicipios = new Set(BENS_TOMBADOS.map((b) => b.municipio)).size;

  const shortcuts: PortalShortcut[] = [
    {
      id: 'bens',
      title: 'Bens Tombados',
      meta: `${BENS_TOMBADOS.length} bens · ${totalMunicipios} cidades`,
      to: '/bens-tombados',
      accentBar: 'bg-[#2F5F78]',
      iconStyle: 'bg-[#2F5F78]/10 text-[#2F5F78]',
      icon: Landmark
    },
    {
      id: 'mapas',
      title: 'Mapas e Poligonais',
      meta: `${MAPAS_HISTORICOS.length} pranchas e PDFs`,
      to: '/mapa',
      accentBar: 'bg-[#071D33]',
      iconStyle: 'bg-[#071D33]/10 text-[#071D33]',
      icon: Compass
    },
    {
      id: 'legislacao',
      title: 'Legislação',
      meta: `${PUBLIC_LEGAL_DOCUMENTS.length} leis e decretos`,
      to: '/legislacao',
      accentBar: 'bg-[#256B58]',
      iconStyle: 'bg-[#256B58]/10 text-[#256B58]',
      icon: BookOpen
    },
    {
      id: 'servicos',
      title: 'Serviços e Obras',
      meta: 'Requerimento em 2 passos',
      to: '/servicos',
      accentBar: 'bg-[#B94734]',
      iconStyle: 'bg-[#B94734]/10 text-[#B94734]',
      icon: FileText
    },
    {
      id: 'denuncia',
      title: 'Denúncias',
      meta: 'Obra irregular ou dano',
      to: '/denuncia',
      accentBar: 'bg-[#C01B29]',
      iconStyle: 'bg-[#C01B29]/10 text-[#C01B29]',
      icon: AlertTriangle
    }
  ];

  return (
    <div className="bg-brand-surface">
      {/* 1. HERO ENQUADRADO: Apenas ilustração suavizada + Título + Busca Global */}
      <section
        aria-label="Abertura do Portal do Patrimônio Cultural do Maranhão"
        className="relative bg-[#071D33] text-white"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/cena-fotos/fundo-hero.webp')",
            filter: 'saturate(0.75) brightness(0.78)'
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(7, 29, 51, 0.72) 0%, rgba(7, 29, 51, 0.68) 55%, rgba(7, 29, 51, 0.90) 100%)'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-16 sm:pb-16 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#E9B44C]">
            Governo do Maranhão · SECMA · SPC
          </p>

          <h1 className="mt-3 font-serif text-3xl sm:text-5xl font-medium tracking-tight leading-[1.1] text-white">
            Patrimônio Cultural do Maranhão
          </h1>

          <p className="mt-3 mx-auto max-w-[52ch] text-sm sm:text-base text-slate-100/95 leading-relaxed">
            Consulte bens tombados, mapas de poligonal, legislação de proteção e serviços oficiais.
          </p>

          <div className="mt-7 max-w-2xl mx-auto">
            <GlobalSearchBar />
          </div>
        </div>
      </section>

      {/* 2. ATALHOS LIMPOS SOBRE FUNDO NEUTRO (#FAF8F5) — Zero foto sobre foto */}
      <section aria-label="Acesso rápido às áreas do portal" className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {shortcuts.map((item, idx) => {
            const Icon = item.icon;
            const spanLastOnMobile = idx === shortcuts.length - 1 ? 'col-span-2 sm:col-span-1' : '';
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`group relative overflow-hidden rounded-2xl bg-white border border-[#E5DDD5] hover:border-[#071D33]/40 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 ${spanLastOnMobile}`}
              >
                <span aria-hidden="true" className={`absolute top-0 left-0 right-0 h-1 ${item.accentBar}`} />
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.iconStyle}`}>
                  <Icon size={18} aria-hidden={true} />
                </span>
                <div>
                  <h2 className="font-display text-sm sm:text-base font-bold text-[#071D33] group-hover:text-[#B94734] transition-colors leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{item.meta}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
