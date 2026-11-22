import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Sparkles,
  ArrowRight,
  Shield,
  Users,
  Building2,
  MapPin,
  Gavel,
  Hammer,
  Palette
} from 'lucide-react';
import { DEPARTMENTS, SITE_CONTACT } from '../data/siteContact';
import { usePageTitle } from '../hooks/usePageTitle';

type TabId = 'quem-somos' | 'estrutura' | 'competencias';

const TABS: { id: TabId; title: string; icon: React.ElementType }[] = [
  { id: 'quem-somos', title: 'Quem somos', icon: Users },
  { id: 'estrutura', title: 'Departamentos', icon: Building2 },
  { id: 'competencias', title: 'Atuação', icon: Gavel }
];

const DEPT_VISUAL: Record<string, { icon: React.ElementType; color: string; path: string }> = {
  DPHAP: { icon: History, color: 'text-brand-blue-dark', path: '/dphap' },
  DPE: { icon: Hammer, color: 'text-brand-navy', path: '/dpe' },
  DPI: { icon: Sparkles, color: 'text-brand-terracotta', path: '/dpi' }
};

const ATUACAO = [
  { title: 'Proteger', desc: 'Tombamento de bens e acompanhamento permanente das áreas protegidas.', icon: Shield },
  { title: 'Orientar', desc: 'Análise técnica e autorização prévia de reformas e obras em imóveis tombados.', icon: Hammer },
  { title: 'Valorizar', desc: 'Registro e salvaguarda de saberes, celebrações e formas de expressão cultural.', icon: Palette },
  { title: 'Fiscalizar', desc: 'Atuação diante de danos, obras irregulares e abandono de bens protegidos.', icon: MapPin }
];

const InstitucionalPage: React.FC = () => {
  usePageTitle('A SPC');
  const [activeTab, setActiveTab] = useState<TabId>('quem-somos');

  return (
    <div className="min-h-screen bg-brand-surface text-slate-800">
      {/* Cabeçalho Editorial */}
      <header className="bg-brand-navy text-white py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            Institucional · Governo do Maranhão · SECMA
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Superintendência do Patrimônio Cultural
          </h1>
          <p className="mt-2.5 max-w-[62ch] text-sm sm:text-base text-slate-200 leading-relaxed">
            Órgão vinculado à Secretaria de Estado da Cultura (SECMA), responsável pela proteção, conservação e salvaguarda do patrimônio cultural maranhense.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Seletor Limpo de Abas */}
        <div
          role="tablist"
          aria-label="Seções institucionais"
          className="inline-flex flex-wrap gap-1.5 rounded-2xl bg-white border border-[#E5DDD5] p-1.5 shadow-sm"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={active}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  active ? 'bg-brand-navy text-white' : 'text-slate-600 hover:text-brand-navy hover:bg-brand-surface'
                }`}
              >
                <tab.icon size={14} aria-hidden="true" />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'quem-somos' && (
          <div id="panel-quem-somos" role="tabpanel" aria-labelledby="tab-quem-somos" className="space-y-6">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5DDD5] shadow-sm space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
              <h2 className="font-serif text-2xl font-medium text-brand-navy">Quem somos</h2>
              <p className="max-w-[68ch]">
                A Superintendência do Patrimônio Cultural do Maranhão (SPC) é o órgão do Governo do Estado, vinculado à SECMA, responsável por proteger o patrimônio cultural material e imaterial maranhense.
              </p>
              <p className="max-w-[68ch]">
                Sua atuação organiza-se em três departamentos técnicos: Proteção do Patrimônio Histórico, Artístico, Arqueológico e Paisagístico (DPHAP), Projetos Especiais (DPE) e Patrimônio Imaterial (DPI).
              </p>
              <p className="max-w-[68ch] text-slate-600">
                <strong className="text-brand-navy">Sede:</strong> {SITE_CONTACT.buildingName}, {SITE_CONTACT.addressLine}, {SITE_CONTACT.city}.
              </p>
            </section>

            <section className="bg-white rounded-2xl border border-[#E5DDD5] shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center">
              <img
                src="/imagens/superintendente.jpg"
                className="w-36 h-44 sm:w-40 sm:h-48 object-cover rounded-xl border border-[#E5DDD5]"
                alt="Retrato de Eduardo Longhi, superintendente"
              />
              <div className="space-y-1.5 text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">Superintendente</p>
                <h2 className="font-serif text-2xl font-medium text-brand-navy">Eduardo Longhi</h2>
                <p className="text-sm text-slate-600">Superintendente do Patrimônio Cultural do Maranhão (SPC/SECMA).</p>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'estrutura' && (
          <div id="panel-estrutura" role="tabpanel" aria-labelledby="tab-estrutura" className="space-y-4">
            {DEPARTMENTS.map((dept) => {
              const v = DEPT_VISUAL[dept.code];
              return (
                <Link
                  to={v.path}
                  key={dept.code}
                  className="group bg-white rounded-2xl border border-[#E5DDD5] p-5 sm:p-6 shadow-sm hover:border-brand-navy/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-surface border border-[#E5DDD5] flex items-center justify-center shrink-0">
                      <v.icon size={22} className={v.color} aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs font-bold uppercase tracking-wider ${v.color}`}>{dept.code}</p>
                      <h3 className="font-display text-base sm:text-lg font-bold text-brand-navy group-hover:text-brand-terracotta transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-[60ch]">{dept.summary}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue-dark shrink-0">
                    Ver atribuições <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {activeTab === 'competencias' && (
          <div id="panel-competencias" role="tabpanel" aria-labelledby="tab-competencias" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ATUACAO.map((item) => (
                <div key={item.title} className="bg-white p-6 rounded-2xl border border-[#E5DDD5] shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-surface border border-[#E5DDD5] text-brand-navy flex items-center justify-center">
                    <item.icon size={20} aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-base font-bold text-brand-navy">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-brand-navy rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-medium">Precisa falar com a SPC?</h2>
                <p className="text-sm text-slate-300 mt-1">Consulte serviços, horários de atendimento ou envie sua solicitação.</p>
              </div>
              <div className="flex flex-wrap gap-2.5 shrink-0">
                <Link
                  to="/contato"
                  className="min-h-[44px] px-5 py-2.5 bg-brand-gold text-brand-navy rounded-xl font-bold hover:bg-[#F1C56A] transition-colors inline-flex items-center gap-2 text-xs"
                >
                  Falar com a SPC
                </Link>
                <Link
                  to="/servicos"
                  className="min-h-[44px] px-5 py-2.5 bg-white/10 text-white rounded-xl font-bold border border-white/25 hover:bg-white/20 transition-colors inline-flex items-center gap-2 text-xs"
                >
                  Ver serviços <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitucionalPage;
