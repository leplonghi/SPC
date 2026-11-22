
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Link as L, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Home,
  Map as MapIcon,
  FileText,
  Settings,
  Info,
  Menu,
  X,
  ShieldAlert,
  ShieldCheck,
  Mail,
  HelpCircle,
  Users,
  Gavel,
  Scale,
  BookOpen,
  Library,
  Database,
  Upload
} from 'lucide-react';
import HomePage from './pages/HomePage';
import { ScrollProgress, PageTransition } from './components/ui/Motion';
import InstitucionalPage from './pages/InstitucionalPage';
import ServicosPage from './pages/ServicosPage';
import LoginPage from './pages/LoginPage';
import { UserRole, User as UserType } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LogOut, Accessibility, Clock, Compass, Landmark } from 'lucide-react';
import ContatoPage from './pages/ContatoPage';
import DenunciaPage from './pages/DenunciaPage';
import TransparenciaPage from './pages/TransparenciaPage';
import PrivacidadePage from './pages/PrivacidadePage';
import TermosPage from './pages/TermosPage';
import DepartamentoOficialPage from './pages/DepartamentoOficialPage';
import { SITE_CONTACT } from './data/siteContact';
import { usePageTitle } from './hooks/usePageTitle';
import { AzulejoBand } from './components/ui/Reveal';
import { recordPageVisit, recordSessionHeartbeat } from './services/analyticsService';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const IngestaoPage = lazy(() => import('./pages/IngestaoPage'));
const BensTombadosPage = lazy(() => import('./pages/BensTombadosPage'));
const LegislacaoPage = lazy(() => import('./pages/LegislacaoPage'));
const CartografiaPage = lazy(() => import('./pages/CartografiaPage'));

/** Perfis que podem abrir o Painel Administrativo (/admin). Administradores passam sempre. */
const ADMIN_PANEL_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN_SPC, UserRole.EDITOR_DPE, UserRole.EDITOR_DPHAP, UserRole.EDITOR_DPI];

/** Perfis que podem acessar a Central de Ingestão (/ingestao), incluindo Colaboradores. */
const EDITOR_ROLES: UserRole[] = [...ADMIN_PANEL_ROLES, UserRole.COLABORADOR];

const PrivateRoute = ({ children, roleRequired }: { children: React.ReactNode, roleRequired?: UserRole[] }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (roleRequired && !roleRequired.includes(user.role) && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
        <ShieldAlert size={80} className="text-brand-red" />
        <h2 className="text-3xl font-black text-brand-dark">Acesso Restrito</h2>
        <p className="text-slate-500 max-w-md">Você não tem permissão para acessar esta área. Entre em contato com a administração.</p>
        <L to="/" className="px-8 py-3 bg-brand-blue text-white rounded-xl font-bold">Voltar ao Início</L>
      </div>
    );
  }

  return <>{children}</>;
};

const HIGH_CONTRAST_KEY = 'spc-high-contrast';
const FONT_SCALE_KEY = 'spc-font-scale';
type FontScale = 'sm' | 'md' | 'lg';

/** Alto contraste: guarda a escolha do visitante e aplica a classe no body. */
const useHighContrast = () => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(HIGH_CONTRAST_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.body.classList.toggle('high-contrast', enabled);
    try {
      localStorage.setItem(HIGH_CONTRAST_KEY, enabled ? '1' : '0');
    } catch {
      /* armazenamento indisponível: a escolha vale só nesta visita */
    }
  }, [enabled]);

  return { enabled, toggle: () => setEnabled((v) => !v) };
};

/** Escala tipográfica (e-MAG: A-, A, A+): ajusta o tamanho-base (rem) do documento. */
const useFontScale = () => {
  const [scale, setScale] = useState<FontScale>(() => {
    try {
      const saved = localStorage.getItem(FONT_SCALE_KEY);
      if (saved === 'sm' || saved === 'md' || saved === 'lg') return saved;
      return 'md';
    } catch {
      return 'md';
    }
  });

  useEffect(() => {
    const pct = scale === 'lg' ? '112.5%' : scale === 'sm' ? '92.5%' : '100%';
    document.documentElement.style.fontSize = pct;
    try {
      localStorage.setItem(FONT_SCALE_KEY, scale);
    } catch {
      /* armazenamento indisponível */
    }
  }, [scale]);

  return { scale, setScale };
};

/** Widget oficial do VLibras (tradução para Libras), do Governo Federal. */
const VLibrasWidget = () => {
  useEffect(() => {
    if (document.getElementById('vlibras-plugin-script')) return;
    const script = document.createElement('script');
    script.id = 'vlibras-plugin-script';
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      try {
        new (window as any).VLibras.Widget('https://vlibras.gov.br/app');
      } catch (err) {
        console.warn('VLibras indisponível', err);
      }
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div {...{ vw: '' }} className="enabled">
      <div {...{ 'vw-access-button': '' }} className="active"></div>
      <div {...{ 'vw-plugin-wrapper': '' }}>
        <div className="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  );
};

/** Busca do topo: leva à biblioteca de legislação já filtrada pelo termo. */
const SiteSearch = ({ compact = false }: { compact?: boolean }) => {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/legislacao?q=${encodeURIComponent(q)}` : '/legislacao');
  };

  return (
    <form onSubmit={submit} role="search" className="flex items-center">
      <label htmlFor={compact ? 'busca-mobile' : 'busca-topo'} className="sr-only">Buscar na legislação</label>
      <input
        id={compact ? 'busca-mobile' : 'busca-topo'}
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Buscar na legislação"
        className={`bg-white/10 text-white placeholder-white/60 ${compact ? 'text-xs px-3 py-1.5 w-full' : 'text-[11px] px-2.5 py-0.5 w-40'} rounded-l-md border border-white/20 focus:outline-none focus:bg-white/20`}
      />
      <button type="submit" className={`bg-brand-terracotta hover:bg-brand-terracotta/90 text-white rounded-r-md font-bold transition-colors ${compact ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-0.5 text-[11px]'}`}>
        Buscar
      </button>
    </form>
  );
};

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { user, logout, isAdmin, isColaborador } = useAuth();
  const highContrast = useHighContrast();
  const fontScale = useFontScale();

  const navItems = [
    { label: 'A SPC', path: '/institucional', icon: <Info size={18} /> },
    { label: 'Serviços', path: '/servicos', icon: <FileText size={18} /> },
    { label: 'Bens tombados', path: '/bens-tombados', icon: <Landmark size={18} /> },
    { label: 'Mapas', path: '/mapa', icon: <MapIcon size={18} /> },
    { label: 'Legislação', path: '/legislacao', icon: <Scale size={18} /> },
    { label: 'Contato', path: '/contato', icon: <Mail size={18} /> },
  ];

  if (isColaborador) {
    navItems.push({ label: 'Ingestão', path: '/ingestao', icon: <Upload size={18} /> });
  }

  const adminItem = isAdmin ? { label: 'Admin', path: '/admin', icon: <Settings size={18} /> } : null;

  return (
    <>
      {/* Barra de acessibilidade com efeito Liquid Glass escuro */}
      <div className="liquid-glass-topbar text-white font-sans px-6 py-1 hidden md:block">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4 text-[11px] leading-none uppercase font-bold tracking-wider text-slate-200">
            <L to="/transparencia" className="hover:text-white transition-colors">Acesso à Informação</L>
            <span className="text-white/20" aria-hidden="true">|</span>
            <a href="https://cultura.ma.gov.br" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">SECMA<span className="sr-only"> (abre em nova aba)</span></a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1" role="group" aria-label="Tamanho da fonte">
              <button
                type="button"
                onClick={() => fontScale.setScale('sm')}
                aria-pressed={fontScale.scale === 'sm'}
                className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-colors ${
                  fontScale.scale === 'sm' ? 'bg-white text-brand-navy' : 'text-slate-300 hover:text-white'
                }`}
                title="Diminuir fonte (A-)"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => fontScale.setScale('md')}
                aria-pressed={fontScale.scale === 'md'}
                className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-colors ${
                  fontScale.scale === 'md' ? 'bg-white text-brand-navy' : 'text-slate-300 hover:text-white'
                }`}
                title="Fonte padrão (A)"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => fontScale.setScale('lg')}
                aria-pressed={fontScale.scale === 'lg'}
                className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-colors ${
                  fontScale.scale === 'lg' ? 'bg-white text-brand-navy' : 'text-slate-300 hover:text-white'
                }`}
                title="Aumentar fonte (A+)"
              >
                A+
              </button>
            </div>

            <span className="text-white/20" aria-hidden="true">|</span>

            <button
              type="button"
              aria-pressed={highContrast.enabled}
              onClick={highContrast.toggle}
              className="flex items-center gap-1.5 text-slate-200 hover:text-white font-bold uppercase tracking-wider text-[11px] leading-none"
            >
              <Accessibility size={13} className="text-brand-terracotta" aria-hidden="true" />
              Alto contraste
            </button>

            <span className="text-white/20" aria-hidden="true">|</span>

            <SiteSearch />
          </div>
        </div>
      </div>

      {/* Main Navigation Header com Liquid Glass de última geração */}
      <nav
        className={`fixed top-0 left-0 right-0 lg:sticky lg:top-0 z-[150] liquid-glass-header py-1.5 transition-all duration-300
        ${scrolled ? 'shadow-lg' : ''}`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center relative">
            <L to="/" className="flex items-center space-x-3 group relative z-10 text-decoration-none">
              <img
                src="/spc-logo-horizontal.png"
                alt="Superintendência do Patrimônio Cultural"
                className="h-8 w-auto sm:h-9"
              />
            </L>

            <div className="hidden lg:flex items-center gap-1.5">
              <div className="flex items-center bg-white/55 backdrop-blur-md border border-white/70 p-1 rounded-full shadow-inner">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <L
                      key={item.path}
                      to={item.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-[11px] uppercase tracking-wider font-extrabold transition-all duration-300 relative ${isActive
                        ? 'bg-brand-navy text-white shadow-md'
                        : 'text-slate-700 hover:bg-brand-terracotta/10 hover:text-brand-terracotta'
                        }`}
                    >
                      <span>{item.label}</span>
                    </L>
                  );
                })}

                {adminItem && (
                  <L
                    to={adminItem.path}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-[11px] uppercase tracking-wider font-extrabold transition-all duration-300 ml-1 ${location.pathname === adminItem.path
                      ? 'bg-brand-navy text-white shadow-md'
                      : 'text-brand-navy hover:bg-brand-navy/5'
                      }`}
                  >
                    <span>{adminItem.label}</span>
                  </L>
                )}
              </div>

              {/* Botão de Denúncias em destaque no Desktop */}
              <L
                to="/denuncia"
                aria-current={location.pathname === '/denuncia' ? 'page' : undefined}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-red text-white text-[11px] font-black uppercase tracking-wider hover:bg-[#B94734] transition-all shadow-sm"
              >
                <ShieldAlert size={14} aria-hidden="true" />
                <span>Denunciar</span>
              </L>

              <div className="h-6 w-px bg-slate-200 mx-1.5"></div>

              {user && (
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-slate-100 hover:bg-brand-terracotta/10 hover:text-brand-terracotta text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                  title={`Logado como ${user.name}`}
                >
                  <LogOut size={13} aria-hidden="true" /> Sair
                </button>
              )}

              <img
                src="/imagens/logo_governo.png"
                alt="Governo do Maranhão"
                className="h-8 w-auto object-contain ml-2"
              />
            </div>

            {/* Mobile: botão compacto de Denúncia no topo (navegação principal na barra inferior fixa) */}
            <L
              to="/denuncia"
              className="lg:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-red text-white text-[11px] font-black uppercase tracking-wider shadow-sm"
            >
              <ShieldAlert size={13} aria-hidden="true" />
              <span>Denunciar</span>
            </L>
          </div>
        </div>
      </nav>

      {/* Espaçador para compensar o header fixo no mobile/tablet (<lg) */}
      <div className="h-[46px] sm:h-[50px] lg:hidden shrink-0" aria-hidden="true" />

      {/* Gaveta "Mais" aberta pela barra inferior mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[155] bg-[#071D33]/50 backdrop-blur-xs flex items-end"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-24 shadow-2xl animate-slide-in-bottom space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-brand-navy">
                Mais opções do Portal
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-brand-navy"
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <L
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-brand-surface border border-[#E5DDD5] text-xs font-bold text-brand-navy"
              >
                <Home size={16} className="text-brand-blue-dark" aria-hidden="true" />
                <span>Início</span>
              </L>
              <L
                to="/institucional"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-brand-surface border border-[#E5DDD5] text-xs font-bold text-brand-navy"
              >
                <Info size={16} className="text-brand-blue-dark" aria-hidden="true" />
                <span>A SPC</span>
              </L>
              <L
                to="/contato"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-brand-surface border border-[#E5DDD5] text-xs font-bold text-brand-navy"
              >
                <Mail size={16} className="text-brand-terracotta" aria-hidden="true" />
                <span>Contato</span>
              </L>
              <L
                to="/transparencia"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-brand-surface border border-[#E5DDD5] text-xs font-bold text-brand-navy"
              >
                <ShieldCheck size={16} className="text-brand-sage-dark" aria-hidden="true" />
                <span>Transparência</span>
              </L>
              {isColaborador && (
                <L
                  to="/ingestao"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-brand-surface border border-[#E5DDD5] text-xs font-bold text-brand-navy"
                >
                  <Upload size={16} className="text-brand-navy" aria-hidden="true" />
                  <span>Ingestão</span>
                </L>
              )}
              {adminItem && (
                <L
                  to={adminItem.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-brand-navy text-xs font-bold text-white"
                >
                  <Settings size={16} aria-hidden="true" />
                  <span>Painel Admin</span>
                </L>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-pressed={highContrast.enabled}
                  onClick={highContrast.toggle}
                  className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand-surface border border-[#E5DDD5] text-xs font-bold text-brand-navy"
                >
                  <Accessibility size={15} aria-hidden="true" />
                  <span>Alto contraste</span>
                </button>
                <div className="flex items-center gap-1" role="group" aria-label="Tamanho da fonte">
                  {(['sm', 'md', 'lg'] as FontScale[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => fontScale.setScale(s)}
                      aria-pressed={fontScale.scale === s}
                      className={`min-h-[40px] px-3 py-1 rounded-xl text-xs font-black ${
                        fontScale.scale === s ? 'bg-brand-navy text-white' : 'bg-brand-surface text-brand-navy border border-[#E5DDD5]'
                      }`}
                    >
                      {s === 'sm' ? 'A-' : s === 'md' ? 'A' : 'A+'}
                    </button>
                  ))}
                </div>
              </div>

              {user && (
                <button
                  type="button"
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full min-h-[40px] flex items-center justify-center gap-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600"
                >
                  <LogOut size={15} aria-hidden="true" />
                  <span>Sair ({user.name})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dock Inferior Flutuante Liquid Glass (Mobile/Tablet < lg) */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[160] px-3 pb-3 pt-1 pointer-events-none print:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <nav
          aria-label="Navegação principal mobile"
          className="pointer-events-auto liquid-glass-dock rounded-[26px] max-w-md mx-auto px-1.5 py-1.5"
        >
          <div className="grid grid-cols-5 items-center">
            {[
              { label: 'Bens', path: '/bens-tombados', icon: Landmark },
              { label: 'Mapas', path: '/mapa', icon: MapIcon },
              { label: 'Legislação', path: '/legislacao', icon: Scale },
              { label: 'Serviços', path: '/servicos', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = location.pathname === tab.path;
              return (
                <L
                  key={tab.path}
                  to={tab.path}
                  onClick={() => setIsOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-[20px] transition-all duration-200 active:scale-95 ${
                    active
                      ? 'bg-brand-navy text-white shadow-md font-bold'
                      : 'text-slate-700 font-semibold hover:bg-brand-navy/5 hover:text-brand-navy'
                  }`}
                >
                  <Icon size={19} strokeWidth={active ? 2.3 : 1.9} aria-hidden="true" />
                  <span className="text-[10px] leading-none tracking-tight">{tab.label}</span>
                </L>
              );
            })}

            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Fechar mais opções' : 'Abrir mais opções'}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-[20px] transition-all duration-200 active:scale-95 ${
                isOpen
                  ? 'bg-brand-terracotta text-white shadow-md font-bold'
                  : 'text-slate-700 font-semibold hover:bg-brand-navy/5 hover:text-brand-navy'
              }`}
            >
              {isOpen ? <X size={19} strokeWidth={2.3} aria-hidden="true" /> : <Menu size={19} strokeWidth={1.9} aria-hidden="true" />}
              <span className="text-[10px] leading-none tracking-tight">Mais</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

const Footer = () => {
  const location = useLocation();

  if (location.pathname === '/mapa') return null;

  return (
    <footer className="bg-brand-navy text-slate-200 font-sans relative overflow-hidden">
      <AzulejoBand />
      <div className="max-w-[1200px] mx-auto px-5 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 items-center">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2.5 rounded-lg bg-white px-2.5 py-1.5 shadow-sm shrink-0">
            <img src="/spc-logo-completa.png" alt="Superintendência do Patrimônio Cultural" className="h-7 w-auto" />
            <span aria-hidden="true" className="h-5 w-px bg-slate-200" />
            <img src="/imagens/logo_governo.png" alt="Governo do Maranhão" className="h-7 w-auto" />
          </div>
          <p className="text-[11px] leading-snug text-slate-300">
            SPC · Secretaria de Estado da Cultura (SECMA)
          </p>
        </div>

        <nav aria-label="Links do rodapé" className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-slate-300 md:justify-center">
          <L to="/institucional" className="hover:text-white hover:underline">A SPC</L>
          <L to="/servicos" className="hover:text-white hover:underline">Serviços</L>
          <L to="/bens-tombados" className="hover:text-white hover:underline">Bens</L>
          <L to="/legislacao" className="hover:text-white hover:underline">Legislação</L>
          <L to="/transparencia" className="hover:text-white hover:underline">Transparência</L>
          <L to="/denuncia" className="hover:text-white hover:underline">Denúncias</L>
        </nav>

        <address className="not-italic text-[11px] leading-snug text-slate-300 md:text-right space-y-0.5">
          <p>{SITE_CONTACT.buildingName} · {SITE_CONTACT.addressLine}, {SITE_CONTACT.city}</p>
          <p>
            <a href={`mailto:${SITE_CONTACT.email}`} className="hover:text-white underline">{SITE_CONTACT.email}</a>
            {' · '}
            <L to="/contato" className="hover:text-white underline">Contato</L>
          </p>
        </address>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 pb-4 relative z-10">
        <div className="pt-3 border-t border-white/10 text-[11px] flex flex-wrap justify-between items-center gap-2 text-slate-400">
          <p>© {new Date().getFullYear()} Governo do Estado do Maranhão</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
            <L to="/privacidade" className="hover:text-white hover:underline">Privacidade</L>
            <L to="/termos" className="hover:text-white hover:underline">Termos</L>
            <L to="/login" className="hover:text-white hover:underline">Área restrita</L>
          </div>
        </div>
      </div>
    </footer>
  );
};

const ROUTE_BREADCRUMBS: Record<string, { label: string; parent?: { label: string; to: string } }> = {
  '/institucional': { label: 'A SPC (Institucional)' },
  '/servicos': { label: 'Carta de Serviços e Protocolo' },
  '/bens-tombados': { label: 'Bens Tombados (Livro do Tombo)' },
  '/mapa': { label: 'Cartografia Histórica e Mapas' },
  '/acervo-digital': { label: 'Cartografia Histórica e Acervo' },
  '/acervo': { label: 'Cartografia Histórica e Acervo' },
  '/legislacao': { label: 'Biblioteca de Legislação' },
  '/repositorio': { label: 'Biblioteca de Legislação e Repositório' },
  '/dphap': { label: 'DPHAP', parent: { label: 'A SPC', to: '/institucional' } },
  '/dpi': { label: 'DPI', parent: { label: 'A SPC', to: '/institucional' } },
  '/dpe': { label: 'DPE', parent: { label: 'A SPC', to: '/institucional' } },
  '/contato': { label: 'Canais de Atendimento' },
  '/denuncia': { label: 'Denúncia de Dano ao Patrimônio' },
  '/transparencia': { label: 'Transparência e Acesso à Informação (LAI)' },
  '/privacidade': { label: 'Política de Privacidade (LGPD)' },
  '/termos': { label: 'Termos de Uso' },
  '/login': { label: 'Acesso Restrito' },
  '/admin': { label: 'Painel Administrativo' },
  '/ingestao': { label: 'Central de Ingestão Documental' }
};

const BreadcrumbBar = () => {
  const { pathname } = useLocation();
  if (pathname === '/') return null;
  const current = ROUTE_BREADCRUMBS[pathname];
  if (!current) return null;

  return (
    <nav
      aria-label="Você está em"
      className="bg-[#F4EFEA] border-b border-brand-sand/70 text-xs text-slate-600 print:hidden"
    >
      <div className="max-w-[1240px] mx-auto px-6 py-2 flex flex-wrap items-center gap-1.5">
        <L to="/" className="font-bold text-brand-navy hover:underline">
          Início
        </L>
        <span aria-hidden="true" className="text-slate-400">/</span>
        {current.parent && (
          <>
            <L to={current.parent.to} className="font-bold text-brand-navy hover:underline">
              {current.parent.label}
            </L>
            <span aria-hidden="true" className="text-slate-400">/</span>
          </>
        )}
        <span aria-current="page" className="font-semibold text-slate-800">
          {current.label}
        </span>
      </div>
    </nav>
  );
};

/** Registra de forma anônima a visita, páginas navegadas e duração da sessão. */
const VisitorTracker = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    void recordPageVisit(pathname);
  }, [pathname]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void recordSessionHeartbeat(15);
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

  return null;
};

const NaoEncontrada = () => {
  usePageTitle('Página não encontrada');
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-6 text-center">
      <Compass size={56} className="text-brand-blue" aria-hidden="true" />
      <h1 className="text-3xl font-black text-brand-dark">Página não encontrada</h1>
      <p className="text-slate-600 max-w-md">O endereço pode ter mudado ou estar incorreto. Comece pelo início ou pela legislação.</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <L to="/" className="px-6 py-3 bg-brand-navy text-white rounded-xl font-bold">Voltar ao início</L>
        <L to="/contato" className="px-6 py-3 bg-white text-brand-navy border-2 border-brand-navy rounded-xl font-bold">Falar com a SPC</L>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col font-sans selection:bg-brand-blue selection:text-white max-w-full overflow-x-clip pb-24 lg:pb-0">
          <button
            type="button"
            onClick={() => document.getElementById('conteudo')?.focus()}
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-white focus:text-brand-navy focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
          >
            Ir para o conteúdo
          </button>
          <ScrollProgress />
          <VisitorTracker />
          <Navigation />
          <BreadcrumbBar />
          <main id="conteudo" tabIndex={-1} className="flex-grow outline-none max-w-full overflow-x-hidden">
            <PageTransition>
            <Suspense
              fallback={
                <div className="min-h-[50vh] flex items-center justify-center p-8" role="status" aria-live="polite">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-slate-600">Carregando módulo...</span>
                  </div>
                </div>
              }
            >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/mapa" element={<CartografiaPage />} />
              <Route path="/institucional" element={<InstitucionalPage />} />
              <Route path="/servicos" element={<ServicosPage />} />
              <Route path="/acervo-digital" element={<CartografiaPage />} />
              <Route path="/acervo" element={<CartografiaPage />} />
              <Route path="/repositorio" element={<LegislacaoPage />} />
              <Route path="/legislacao" element={<LegislacaoPage />} />
              <Route path="/bens-tombados" element={<BensTombadosPage />} />
              <Route path="/dphap" element={<DepartamentoOficialPage code="DPHAP" />} />
              <Route path="/dpi" element={<DepartamentoOficialPage code="DPI" />} />
              <Route path="/dpe" element={<DepartamentoOficialPage code="DPE" />} />
              <Route path="/contato" element={<ContatoPage />} />
              <Route path="/denuncia" element={<DenunciaPage />} />
              <Route path="/transparencia" element={<TransparenciaPage />} />
              <Route path="/privacidade" element={<PrivacidadePage />} />
              <Route path="/termos" element={<TermosPage />} />
              <Route path="/ajuda" element={<Navigate to="/contato" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/admin"
                element={
                  <PrivateRoute roleRequired={ADMIN_PANEL_ROLES}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ingestao"
                element={
                  <PrivateRoute roleRequired={EDITOR_ROLES}>
                    <IngestaoPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NaoEncontrada />} />
            </Routes>
            </Suspense>
            </PageTransition>
          </main>
          <Footer />
          <VLibrasWidget />
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
