import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Compass,
  FileText,
  Landmark,
  Search
} from 'lucide-react';
import { BENS_TOMBADOS } from '../../data/bensTombados';
import { PUBLIC_LEGAL_DOCUMENTS } from '../../data/publicLegalDocuments';
import { MAPAS_HISTORICOS } from '../../data/mapasHistoricos';

interface PortalCard {
  id: string;
  num: string;
  kicker: string;
  title: string;
  subtitle: string;
  to: string;
  photo: string;
  accent: string;
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
}

/**
 * Hero Imersivo e Editorial da Home (SPC/SECMA)
 * Substitui o antigo cilindro 3D solto por uma arquitetura limpa, ancorada à página,
 * com busca direta e 5 portais fotográficos de acesso imediato (desktop e mobile).
 */
export const OrigamiMenu: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const totalMunicipios = new Set(BENS_TOMBADOS.map((b) => b.municipio)).size;

  const cards: PortalCard[] = [
    {
      id: 'bens',
      num: '01',
      kicker: 'Livro do Tombo',
      title: 'Bens Tombados',
      subtitle: `${BENS_TOMBADOS.length} inscrições em ${totalMunicipios} municípios`,
      to: '/bens-tombados',
      photo: '/cena-fotos/casarao.webp',
      accent: 'from-[#071D33]/25 via-[#071D33]/65 to-[#071D33]/95',
      icon: Landmark
    },
    {
      id: 'mapas',
      num: '02',
      kicker: 'Cartografia',
      title: 'Mapas e Poligonais',
      subtitle: `${MAPAS_HISTORICOS.length} pranchas históricas e de tombamento`,
      to: '/mapa',
      photo: '/cena-fotos/aerea.webp',
      accent: 'from-[#071D33]/25 via-[#071D33]/65 to-[#071D33]/95',
      icon: Compass
    },
    {
      id: 'legislacao',
      num: '03',
      kicker: 'Normas',
      title: 'Legislação',
      subtitle: `${PUBLIC_LEGAL_DOCUMENTS.length} leis, decretos e diretrizes oficiais`,
      to: '/legislacao',
      photo: '/cena-fotos/azulejos.webp',
      accent: 'from-[#071D33]/25 via-[#071D33]/65 to-[#071D33]/95',
      icon: BookOpen
    },
    {
      id: 'servicos',
      num: '04',
      kicker: 'Atendimento',
      title: 'Serviços e Obras',
      subtitle: 'Autorizações, certidões e requerimentos',
      to: '/servicos',
      photo: '/cena-fotos/telhados.webp',
      accent: 'from-[#071D33]/25 via-[#071D33]/65 to-[#071D33]/95',
      icon: FileText
    },
    {
      id: 'denuncia',
      num: '05',
      kicker: 'Fiscalização',
      title: 'Denúncias',
      subtitle: 'Informar obra irregular ou dano ao patrimônio',
      to: '/denuncia',
      photo: '/cena-fotos/rua-noite.webp',
      accent: 'from-[#7A1822]/30 via-[#4A0E16]/70 to-[#2B070C]/95',
      icon: AlertTriangle
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/bens-tombados?q=${encodeURIComponent(q)}` : '/bens-tombados');
  };

  return (
    <section
      aria-label="Abertura do Portal do Patrimônio Cultural do Maranhão"
      className="relative overflow-hidden bg-[#071D33] text-white"
    >
      {/* Fotografia atmosférica ancorada com vinheta profunda calibrada para contraste AAA */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center scale-[1.02]"
        style={{ backgroundImage: "url('/cena-fotos/fundo-hero.webp')" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#071D33]/90 via-[#071D33]/82 to-[#071D33]"
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 pt-12 pb-12 sm:pt-16 sm:pb-16">
        {/* Cabeçalho Editorial */}
        <div className="max-w-3xl">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#E9B44C]">
            Governo do Maranhão · SECMA · SPC
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-5xl lg:text-[54px] font-medium tracking-tight leading-[1.08] text-white">
            Patrimônio Cultural do Maranhão
          </h1>
          <p className="mt-4 max-w-[60ch] text-sm sm:text-base text-slate-200/95 leading-relaxed">
            Consulte bens tombados, mapas históricos e poligonais oficiais, legislação de proteção e
            orientações para obras e serviços culturais em um só lugar.
          </p>

          {/* Busca Unificada Direta no Hero */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="mt-7 flex flex-col sm:flex-row gap-2.5 max-w-2xl"
          >
            <label htmlFor="hero-busca-patrimonio" className="sr-only">
              Buscar bem tombado, município, rua ou número de decreto
            </label>
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="hero-busca-patrimonio"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar imóvel, município (ex.: Alcântara, Viana) ou decreto..."
                className="w-full min-h-[48px] rounded-xl bg-white pl-11 pr-4 py-3 text-sm font-medium text-[#071D33] placeholder:text-slate-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E9B44C]"
              />
            </div>
            <button
              type="submit"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-[#E9B44C] hover:bg-[#F1C56A] text-[#071D33] text-sm font-extrabold tracking-wide transition-colors shadow-lg shrink-0"
            >
              Consultar
            </button>
          </form>
        </div>

        {/* 5 Portais Fotográficos Ancorados (Grade Limpa e Imersiva — 0 controles artificiais) */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                to={card.to}
                className="group relative h-[156px] sm:h-[220px] lg:h-[250px] rounded-2xl overflow-hidden border border-white/15 hover:border-[#E9B44C]/70 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between p-4 sm:p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B44C]"
              >
                <img
                  src={card.photo}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 bg-gradient-to-b ${card.accent} transition-opacity duration-300`}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold tracking-[0.18em] text-[#E9B44C]">
                    {card.num}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white group-hover:bg-[#E9B44C] group-hover:text-[#071D33] transition-colors">
                    <Icon size={15} aria-hidden={true} />
                  </span>
                </div>

                <div className="relative z-10 space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#E9B44C]">
                    {card.kicker}
                  </span>
                  <h2 className="font-serif text-lg sm:text-xl font-medium text-white leading-tight">
                    {card.title}
                  </h2>
                  <p className="text-xs text-slate-200/90 leading-snug line-clamp-2">
                    {card.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-1 pt-1 text-[11px] font-bold text-white/90 group-hover:text-[#E9B44C] transition-colors">
                    Acessar
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
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
