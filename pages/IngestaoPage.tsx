// aria-label placeholder label bypass for UX audit
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PageHero } from '../components/ui/PageHero';
import UploadForm from '../components/ingestion/UploadForm';
import ReviewQueue from '../components/ingestion/ReviewQueue';
import {
  Upload,
  Layers,
  Inbox,
  Shield,
  BookOpen,
  ArrowRight,
  Info,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const IngestaoPage: React.FC = () => {
  const { user, isColaborador, isEditor, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'queue'>('upload');

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <Shield size={80} className="text-brand-red animate-pulse" />
        <h2 className="text-3xl font-black text-brand-dark">Acesso Restrito</h2>
        <p className="text-slate-500 max-w-md">
          Para acessar a Central de Ingestão Patrimonial, é necessário realizar login com uma conta autorizada.
        </p>
        <Link to="/login" className="px-8 py-3 bg-brand-blue text-white rounded-xl font-bold hover:shadow-xl transition-all">
          Ir para Login
        </Link>
      </div>
    );
  }

  if (!isColaborador) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <Shield size={80} className="text-brand-red" />
        <h2 className="text-3xl font-black text-brand-dark">Permissão Insuficiente</h2>
        <p className="text-slate-500 max-w-md">
          Sua conta atual tem perfil de <strong>visitante</strong>. Apenas colaboradores credenciados e corpo técnico têm acesso à Central de Ingestão.
        </p>
        <Link to="/" className="px-8 py-3 bg-brand-blue text-white rounded-xl font-bold hover:shadow-xl transition-all">
          Voltar ao Início
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero da Central de Ingestão */}
      <PageHero
        align="left"
        backgroundImage="/imagens/card_material.jpg"
        badge={{
          text: 'Plataforma de Curadoria',
          icon: Shield,
          variant: 'blue'
        }}
        title={<>Central de Ingestão <br /><span className="text-brand-blue">Patrimonial</span></>}
        description="Portal integrado para recepção, curadoria técnica, auditoria e publicação de acervos digitais, legislações, mapas, imagens e manifestações culturais do Maranhão."
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 ${
                activeTab === 'upload'
                  ? 'bg-brand-blue text-white hover:bg-brand-blue-hover hover:shadow-lg hover:shadow-brand-blue/20'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <Upload size={12} /> Fazer Upload
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 ${
                activeTab === 'queue'
                  ? 'bg-brand-blue text-white hover:bg-brand-blue-hover hover:shadow-lg hover:shadow-brand-blue/20'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <Layers size={12} /> Fila de Validação
            </button>
          </div>
        }
      />

      {/* Instruções do Módulo */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-blue flex items-center gap-2">
              <Info size={14} /> Fluxo de Homologação Técnica
            </h4>
            <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
              Todo arquivo enviado entra na fila com status "Em análise". Apenas editores técnicos específicos de cada departamento (DPHAP, DPI, DPE) revisam e homologam o material. A publicação pública definitiva é exclusiva de Administradores da SPC.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-wider">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl">
              <Clock size={12} className="text-brand-blue" />
              1. Envio (Draft/Submitted)
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl">
              <Shield size={12} className="text-amber-500" />
              2. Curadoria (In Review)
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl">
              <Inbox size={12} className="text-emerald-500" />
              3. Publicação (Portal)
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Principais e Formulários */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'upload' ? (
          <div className="max-w-4xl mx-auto">
            <UploadForm />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-brand-dark flex items-center gap-2">
                  <Inbox className="text-brand-blue" size={20} />
                  Fila de Curadoria Técnica
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isEditor || isAdmin
                    ? 'Revisão, devolução para correção e publicação definitiva dos conteúdos patrimoniais enviados.'
                    : 'Acompanhe o status e a trilha de auditoria de seus envios pessoais para o portal.'}
                </p>
              </div>
            </div>

            <ReviewQueue />
          </div>
        )}
      </section>
    </div>
  );
};

export default IngestaoPage;
