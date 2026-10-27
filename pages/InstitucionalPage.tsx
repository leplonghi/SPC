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
import { PageHero } from '../components/ui/PageHero';
import { DEPARTMENTS, SITE_CONTACT } from '../data/siteContact';
import { usePageTitle } from '../hooks/usePageTitle';

type TabId = 'quem-somos' | 'estrutura' | 'competencias';

const TABS: { id: TabId; title: string; icon: React.ElementType }[] = [
  { id: 'quem-somos', title: 'Quem somos', icon: Users },
  { id: 'estrutura', title: 'Estrutura', icon: Building2 },
  { id: 'competencias', title: 'Atuação', icon: Gavel }
];

const DEPT_VISUAL: Record<string, { icon: React.ElementType; color: string; border: string; path: string }> = {
  DPHAP: { icon: History, color: 'text-brand-blue-dark', border: 'border-l-brand-blue', path: '/dphap' },
  DPE: { icon: Hammer, color: 'text-brand-dark', border: 'border-l-brand-dark', path: '/dpe' },
  DPI: { icon: Sparkles, color: 'text-brand-terracotta', border: 'border-l-brand-terracotta', path: '/dpi' }
};

/**
 * Atuação da SPC. Textos curtos, ligados ao que cada departamento faz.
 * Não publicar números, datas de criação, equipe ou citações sem fonte e aprovação.
 */
const ATUACAO = [
  { title: 'Proteger', desc: 'Tombamento de bens e acompanhamento das áreas protegidas.', icon: Shield, color: 'text-brand-terracotta bg-brand-red/10' },
  { title: 'Orientar', desc: 'Análise e autorização de reformas e obras em imóveis tombados.', icon: Hammer, color: 'text-brand-blue-dark bg-brand-blue/10' },
  { title: 'Valorizar', desc: 'Registro e salvaguarda de saberes, celebrações e formas de expressão.', icon: Palette, color: 'text-emerald-700 bg-emerald-50' },
  { title: 'Fiscalizar', desc: 'Atuação diante de danos, obras irregulares e abandono de bens protegidos.', icon: MapPin, color: 'text-brand-dark bg-brand-dark/10' }
];

const InstitucionalPage: React.FC = () => {
  usePageTitle('A SPC');
  const [activeTab, setActiveTab] = useState<TabId>('quem-somos');

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <PageHero
        tone="blue"
        align="center"
        backgroundImage="/imagens/CH 01.jpg"
        badge={{ text: 'Institucional', variant: 'red' }}
        title={<>Sobre a SPC</>}
        description="Órgão do Governo do Estado do Maranhão, vinculado à Secretaria de Estado da Cultura (SECMA), responsável pela proteção do patrimônio cultural maranhense."
      />

      <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div role="tablist" aria-label="Seções da página" className="flex flex-wrap justify-center p-2 gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-brand-navy text-white shadow-lg'
                  : 'text-slate-600 hover:text-brand-dark hover:bg-slate-100'
                  }`}
              >
                <tab.icon size={14} aria-hidden="true" />
                {tab.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {activeTab === 'quem-somos' && (
          <div id="panel-quem-somos" role="tabpanel" aria-labelledby="tab-quem-somos" className="space-y-10">
            <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 space-y-4 text-slate-700 leading-relaxed">
              <h2 className="text-2xl font-black text-brand-navy">Quem somos</h2>
              <p>
                A Superintendência do Patrimônio Cultural do Maranhão (SPC) é o órgão do Governo do Estado, vinculado à SECMA, responsável por proteger o patrimônio cultural maranhense.
              </p>
              <p>
                O trabalho é dividido em três departamentos: proteção do patrimônio histórico, artístico, arqueológico e paisagístico (DPHAP), projetos especiais (DPE) e patrimônio imaterial (DPI).
              </p>
              <p>
                A sede fica no {SITE_CONTACT.buildingName}, {SITE_CONTACT.addressLine}, {SITE_CONTACT.city}.
              </p>
            </section>

            <section className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
              <img
                src="/imagens/superintendente.jpg"
                className="w-48 h-60 object-cover rounded-2xl"
                alt="Retrato de Eduardo Longhi, superintendente"
              />
              <div className="space-y-2 text-center md:text-left">
                <p className="text-[11px] font-black uppercase tracking-widest text-brand-terracotta">Superintendente</p>
                <h2 className="text-2xl font-black text-brand-navy">Eduardo Longhi</h2>
                <p className="text-slate-600">Superintendente do Patrimônio Cultural do Maranhão.</p>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'estrutura' && (
          <div id="panel-estrutura" role="tabpanel" aria-labelledby="tab-estrutura" className="space-y-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl font-black text-brand-navy">Departamentos</h2>
              <p className="text-slate-600">Três departamentos dividem o trabalho da SPC.</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {DEPARTMENTS.map((dept) => {
                const v = DEPT_VISUAL[dept.code];
                return (
                  <Link
                    to={v.path}
                    key={dept.code}
                    className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all border-l-[8px] ${v.border} group`}
                  >
                    <div className="md:w-48 p-6 flex flex-col items-center justify-center text-center bg-slate-50">
                      <v.icon size={36} className={`${v.color} mb-2`} aria-hidden="true" />
                      <h3 className={`text-2xl font-black ${v.color}`}>{dept.code}</h3>
                    </div>
                    <div className="p-6 md:p-8 flex-grow space-y-2">
                      <h4 className="text-lg font-black text-brand-dark">{dept.name}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">{dept.summary}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'competencias' && (
          <div id="panel-competencias" role="tabpanel" aria-labelledby="tab-competencias" className="space-y-10">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl font-black text-brand-navy">O que a SPC faz</h2>
              <p className="text-slate-600">Atribuições da SPC em relação a imóveis históricos, manifestações culturais tradicionais e denúncias.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {ATUACAO.map((item) => (
                <div key={item.title} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${item.color}`}>
                    <item.icon size={24} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-black text-brand-dark mb-1">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-brand-navy rounded-3xl p-8 md:p-10 text-white space-y-5">
              <h2 className="text-2xl md:text-3xl font-black leading-tight">Precisa falar com a SPC?</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/contato" className="px-7 py-3 bg-white text-brand-navy rounded-xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-xs">
                  Falar com a SPC <Users size={16} aria-hidden="true" />
                </Link>
                <Link to="/servicos" className="px-7 py-3 bg-white/10 text-white rounded-xl font-black uppercase tracking-widest border border-white/40 hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-xs">
                  Ver serviços <ArrowRight size={16} aria-hidden="true" />
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
