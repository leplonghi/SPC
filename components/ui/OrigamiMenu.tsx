import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Compass,
  FileText,
  Landmark
} from 'lucide-react';
import { BENS_TOMBADOS } from '../../data/bensTombados';
import { PUBLIC_LEGAL_DOCUMENTS } from '../../data/publicLegalDocuments';
import { MAPAS_HISTORICOS } from '../../data/mapasHistoricos';
import { GlobalSearchBar } from './GlobalSearchBar';

interface PortalCard {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  to: string;
  photo: string;
  barColor: string;
  iconBg: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
}

/**
 * Hero Vivo e Imersivo da Home (Opção 1A):
 * - Arte /cena-fotos/fundo-hero.webp luminosa e em plena saturação (sem véu escuro apagado)
 * - Busca Global Instantânea centralizada (Bens + Mapas + Legislações + Serviços)
 * - 5 Portais Fotográficos com identidade cromática própria ancorados na base
 */
export const OrigamiMenu: React.FC = () => {
  const totalMunicipios = new Set(BENS_TOMBADOS.map((b) => b.municipio)).size;

  const cards: PortalCard[] = [
    {
      id: 'bens',
      kicker: 'Livro do Tombo',
      title: 'Bens Tombados',
      subtitle: `${BENS_TOMBADOS.length} inscrições · ${totalMunicipios} municípios`,
      to: '/bens-tombados',
      photo: '/cena-fotos/casarao.webp',
      barColor: 'bg-[#3F7893]',
      iconBg: 'bg-[#3F7893]',
      icon: Landmark
    },
    {
      id: 'mapas',
      kicker: 'Cartografia',
      title: 'Mapas e Poligonais',
      subtitle: `${MAPAS_HISTORICOS.length} pranchas interativas e PDFs`,
      to: '/mapa',
      photo: '/cena-fotos/aerea.webp',
      barColor: 'bg-[#E9B44C]',
      iconBg: 'bg-[#071D33]',
      icon: Compass
    },
    {
      id: 'legislacao',
      kicker: 'Normas',
      title: 'Legislação',
      subtitle: `${PUBLIC_LEGAL_DOCUMENTS.length} leis, decretos e diretrizes`,
      to: '/legislacao',
      photo: '/cena-fotos/azulejos.webp',
      barColor: 'bg-[#2E7D68]',
      iconBg: 'bg-[#2E7D68]',
      icon: BookOpen
    },
    {
      id: 'servicos',
      kicker: 'Atendimento',
      title: 'Serviços e Formulários',
      subtitle: 'Obras, certidões e requerimento',
      to: '/servicos',
      photo: '/cena-fotos/telhados.webp',
      barColor: 'bg-[#B94734]',
      iconBg: 'bg-[#B94734]',
      icon: FileText
    },
    {
      id: 'denuncia',
      kicker: 'Fiscalização',
      title: 'Denúncias',
      subtitle: 'Obra irregular ou dano ao bem',
      to: '/denuncia',
      photo: '/cena-fotos/rua-noite.webp',
      barColor: 'bg-[#E63343]',
      iconBg: 'bg-[#C01B29]',
      icon: AlertTriangle
    }
  ];

  return (
    <section
      aria-label="Abertura do Portal do Patrimônio Cultural do Maranhão"
      className="relative overflow-x-clip bg-[#102E46] text-white"
    >
      {/* Arte de fundo VIVA e LUMINOSA — sem abafar as cores do Maranhão */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center saturate-[1.12] brightness-[0.95]"
        style={{ backgroundImage: "url('/cena-fotos/fundo-hero.webp')" }}
      />
      {/* Vinheta suave apenas nas bordas/atrás do texto para contraste nítido mantendo a ilustração vibrante */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#071D33]/65 via-[#071D33]/35 to-[#071D33]/92"
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-20 sm:pb-14">
        {/* Bloco Central: Título Editorial + Busca Global Instantânea */}
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#071D33]/75 backdrop-blur-md border border-[#E9B44C]/50 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E9B44C] shadow-md">
            Governo do Maranhão · SECMA · SPC
          </span>

          <h1
            className="mt-4 font-serif text-3xl sm:text-5xl lg:text-[56px] font-medium tracking-tight leading-[1.08] text-white"
            style={{ textShadow: '0 4px 24px rgba(7, 29, 51, 0.72)' }}
          >
            Patrimônio Cultural do Maranhão
          </h1>

          <p
            className="mt-3.5 mx-auto max-w-[56ch] text-sm sm:text-base text-white/95 font-medium leading-relaxed"
            style={{ textShadow: '0 2px 14px rgba(7, 29, 51, 0.85)' }}
          >
            Encontre em segundos bens tombados, mapas de poligonal, leis de proteção e formulários de atendimento.
          </p>

          {/* Busca Global Instantânea Centralizada */}
          <div className="mt-7 max-w-2xl mx-auto">
            <GlobalSearchBar />
          </div>
        </div>

        {/* 5 Portais Fotográficos com Identidade Cromática Própria */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                to={card.to}
                className="group relative h-[144px] sm:h-[205px] lg:h-[235px] rounded-2xl overflow-hidden border border-white/25 hover:border-white/80 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B44C]"
              >
                <img
                  src={card.photo}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradiente apenas na parte inferior para preservar a fotografia viva no topo */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#071D33]/95 via-[#071D33]/45 to-transparent"
                />
                {/* Faixa de cor identitária no topo do card */}
                <span aria-hidden="true" className={`absolute top-0 left-0 right-0 h-1.5 ${card.barColor}`} />

                <div className="relative z-10 flex justify-end">
                  <span className={`w-9 h-9 rounded-xl ${card.iconBg} text-white shadow-lg border border-white/25 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon size={16} aria-hidden={true} />
                  </span>
                </div>

                <div className="relative z-10 space-y-0.5 text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9B44C]">
                    {card.kicker}
                  </span>
                  <h2 className="font-serif text-lg sm:text-xl font-medium text-white leading-tight">
                    {card.title}
                  </h2>
                  <p className="text-xs text-slate-200 leading-snug line-clamp-1">
                    {card.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-1 pt-1 text-[11px] font-bold text-white group-hover:text-[#E9B44C] transition-colors">
                    Explorar
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
