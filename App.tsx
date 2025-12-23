
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Map as MapIcon,
  FileText,
  Settings,
  Info,
  Menu,
  X,
  ShieldAlert,
  Mail,
  HelpCircle,
  Users,
  Gavel,
  BookOpen,
  Library,
  Database
} from 'lucide-react';
import HomePage from './pages/HomePage';
import MapaPage from './pages/MapaPage';
import AdminDashboard from './pages/AdminDashboard';
import InstitucionalPage from './pages/InstitucionalPage';
import ServicosPage from './pages/ServicosPage';
import LegislacaoPage from './pages/LegislacaoPage';
import AcervoDigitalPage from './pages/AcervoDigitalPage';
import AcervoPage from './pages/AcervoPage';
import RepositorioPage from './pages/RepositorioPage';
import { UserRole, User as UserType } from './types';

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const navItems = [
    { label: 'A SPC', path: '/institucional', icon: <Info size={18} /> },
    { label: 'Serviços', path: '/servicos', icon: <FileText size={18} /> },
    { label: 'Acervo Digital', path: '/acervo-digital', icon: <Library size={18} /> },
    { label: 'Mapa', path: '/mapa', icon: <MapIcon size={18} /> },
    { label: 'Admin', path: '/admin', icon: <Settings size={18} /> },
  ];

  return (
    <nav
      className={`sticky top-0 z-[100] transition-all duration-500 ease-in-out border-b
      ${scrolled
          ? 'bg-white/95 backdrop-blur-xl border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-1.5'
          : 'bg-white/80 backdrop-blur-md border-transparent shadow-none py-2.5'
        }`}
    >
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex justify-between items-center relative">
          <Link to="/" className="flex items-center space-x-4 group relative z-10">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-blue to-brand-red rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
              <img
                src="/imagens/logo_spc.jpg"
                alt="SPC Logo"
                className="h-12 w-auto relative transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
              />
            </div>
            <div className={`hidden lg:block border-l pl-4 transition-all duration-500 ${scrolled ? 'border-slate-300' : 'border-slate-400/50'}`}>
              <span className="block font-black text-brand-dark leading-none text-base uppercase tracking-tight group-hover:text-brand-blue transition-colors">Superintendência do</span>
              <span className="block font-black text-brand-dark leading-none text-base uppercase mb-0.5 tracking-tight group-hover:text-brand-blue transition-colors">Patrimônio Cultural</span>
              <span className="block text-[10px] font-bold text-brand-blue uppercase tracking-[0.3em] group-hover:text-brand-red transition-colors">Governo do Maranhão</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center bg-slate-50/50 p-1 rounded-xl border border-slate-200/50 backdrop-blur-sm">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 relative group overflow-hidden ${location.pathname === item.path
                    ? 'text-brand-blue bg-white shadow-md shadow-brand-blue/10 scale-100 ring-1 ring-black/5'
                    : 'text-slate-600 hover:text-brand-blue hover:bg-white/60'
                    }`}
                >
                  <span className={`relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5 ${location.pathname === item.path ? 'text-brand-blue' : 'text-slate-400 group-hover:text-brand-blue'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                  {location.pathname !== item.path && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </Link>
              ))}
            </div>
            <div className="h-6 w-px bg-slate-200 mx-3"></div>
            <img
              src="/imagens/logo_governo.png"
              alt="Governo do Maranhão"
              className="h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </div>

          <button
            className="md:hidden p-2 rounded-lg bg-slate-100/50 text-brand-dark hover:bg-slate-200/50 transition-colors backdrop-blur-sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full border-t border-slate-100 bg-white/95 backdrop-blur-xl py-4 px-4 shadow-2xl safe-area-inset-bottom animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-xl font-bold transition-all ${location.pathname === item.path
                  ? 'bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white shadow-lg shadow-brand-blue/30 scale-[1.02]'
                  : 'text-slate-600 hover:bg-slate-50 active:scale-95'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <span className={`${location.pathname === item.path ? 'text-white' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-[#1e1e1e] text-slate-400 py-8 border-t border-white/5 font-sans relative overflow-hidden">
    {/* Decorative element */}
    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

    <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
      <div className="col-span-1 md:col-span-2 space-y-4">
        <h3 className="text-white font-black text-lg flex items-center gap-2.5 tracking-tight">
          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
            <img src="/imagens/logo_spc.jpg" alt="SPC" className="h-4 w-auto brightness-0 invert opacity-90" />
          </div>
          SPC Maranhão
        </h3>
        <p className="text-[11px] leading-relaxed opacity-60 font-medium max-w-sm">
          A Superintendência de Patrimônio Cultural do Maranhão trabalha para preservar, valorizar e difundir nossa memória e identidade cultural através da salvaguarda de bens materiais e imateriais.
        </p>
        <div className="flex gap-2 pt-1">
          <a href="mailto:contato@spc.ma.gov.br" className="p-2 bg-white/5 rounded-lg hover:bg-brand-red hover:text-white border border-white/5 hover:border-transparent transition-all hover:scale-105 active:scale-95 group">
            <Mail size={14} className="opacity-70 group-hover:opacity-100" />
          </a>
          <Link to="/ajuda" className="p-2 bg-white/5 rounded-lg hover:bg-brand-blue hover:text-white border border-white/5 hover:border-transparent transition-all hover:scale-105 active:scale-95 group">
            <HelpCircle size={14} className="opacity-70 group-hover:opacity-100" />
          </Link>
          <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white hover:text-brand-dark border border-white/5 hover:border-transparent transition-all hover:scale-105 active:scale-95 group">
            <Users size={14} className="opacity-70 group-hover:opacity-100" />
          </a>
        </div>
      </div>

      <div>
        <h4 className="text-white font-bold mb-3 text-[10px] uppercase tracking-[0.2em] border-l-2 border-brand-red pl-2.5">Departamentos</h4>
        <ul className="space-y-2 text-[11px] font-medium">
          <li>
            <Link to="/institucional" className="group flex items-center gap-2 hover:text-brand-blue transition-all">
              <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-brand-blue group-hover:w-1.5 transition-all"></span>
              DPHAP (Material)
            </Link>
          </li>
          <li>
            <Link to="/institucional" className="group flex items-center gap-2 hover:text-brand-red transition-all">
              <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-brand-red group-hover:w-1.5 transition-all"></span>
              DPI (Imaterial)
            </Link>
          </li>
          <li>
            <Link to="/institucional" className="group flex items-center gap-2 hover:text-white transition-all">
              <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-white group-hover:w-1.5 transition-all"></span>
              DPE (Especiais)
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-3 text-[10px] uppercase tracking-[0.2em] border-l-2 border-brand-blue pl-2.5">Institucional</h4>
        <ul className="space-y-2 text-[11px] font-medium">
          {['Quem Somos', 'Serviços ao Cidadão', 'Acervo Digital', 'Repositório', 'Legislação', 'Transparência'].map((item, idx) => (
            <li key={idx}>
              <Link to="/institucional" className="block hover:text-white hover:translate-x-1 transition-all duration-300">
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="max-w-[1440px] mx-auto px-6 mt-8 pt-6 border-t border-white/5 text-[9px] flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 font-semibold uppercase tracking-widest hover:opacity-100 transition-opacity duration-300">
      <p>© 2024 Governo do Estado do Maranhão</p>
      <div className="flex gap-6">
        <span className="hover:text-white cursor-pointer transition-colors">Política de Privacidade</span>
        <span className="hover:text-white cursor-pointer transition-colors">Termos de Uso</span>
        <span className="flex items-center gap-1.5"><Database size={9} /> v2.4.0</span>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [user] = useState<UserType | null>({
    id: 'u-1',
    name: 'Gestor SPC',
    role: UserRole.SUPER_ADMIN
  });

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col font-sans selection:bg-brand-blue selection:text-white">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mapa" element={<MapaPage />} />
            <Route path="/institucional" element={<InstitucionalPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/acervo-digital" element={<AcervoDigitalPage />} />
            <Route path="/acervo" element={<AcervoPage />} />
            <Route path="/repositorio" element={<RepositorioPage />} />
            <Route path="/legislacao" element={<LegislacaoPage />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <ShieldAlert size={80} className="text-brand-red" />
                <h2 className="text-3xl font-black text-brand-dark">Módulo em Atualização</h2>
                <p className="text-slate-500 max-w-md text-center">Estamos trabalhando para disponibilizar este conteúdo em breve seguindo as novas diretrizes.</p>
                <Link to="/" className="px-8 py-3 bg-brand-blue text-white rounded-xl font-bold hover:shadow-xl transition-all">Voltar ao Início</Link>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
