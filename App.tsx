
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
  BookOpen
} from 'lucide-react';
import HomePage from './pages/HomePage';
import MapaPage from './pages/MapaPage';
import AdminDashboard from './pages/AdminDashboard';
import InstitucionalPage from './pages/InstitucionalPage';
import ServicosPage from './pages/ServicosPage';
import LegislacaoPage from './pages/LegislacaoPage';
import { UserRole, User as UserType } from './types';

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Início', path: '/', icon: <Home size={20} /> },
    { label: 'Mapa', path: '/mapa', icon: <MapIcon size={20} /> },
    { label: 'A SPC', path: '/institucional', icon: <Info size={20} /> },
    { label: 'Legislação', path: '/legislacao', icon: <Gavel size={20} /> },
    { label: 'Serviços', path: '/servicos', icon: <FileText size={20} /> },
    { label: 'Admin', path: '/admin', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-[#CC343A] rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform group-hover:scale-105">
              SPC
            </div>
            <div className="hidden sm:block">
              <span className="block font-extrabold text-[#2D2D2D] leading-tight text-sm md:text-base">Superintendência do Patrimônio</span>
              <span className="block text-[10px] font-bold text-[#5283A9] tracking-widest uppercase">Maranhão</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs lg:text-sm font-bold transition-all ${
                  location.pathname === item.path
                    ? 'bg-[#5283A9]/10 text-[#5283A9]'
                    : 'text-[#2D2D2D] hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <button 
            className="md:hidden p-2 text-[#2D2D2D]"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white py-4 shadow-xl">
          <div className="px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 p-3 rounded-xl text-[#2D2D2D] font-bold hover:bg-slate-50"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-[#2D2D2D] text-slate-400 py-16">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <h3 className="text-white font-black text-xl mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-[#CC343A] rounded flex items-center justify-center text-xs">SPC</span>
          SPC Maranhão
        </h3>
        <p className="text-sm max-w-sm mb-8 leading-relaxed">
          Órgão responsável pela preservação, salvaguarda e gestão do patrimônio cultural maranhense, assegurando a memória coletiva do nosso povo.
        </p>
        <div className="flex gap-4">
          <a href="mailto:contato@spc.ma.gov.br" className="p-3 bg-white/5 rounded-xl hover:bg-[#CC343A] text-white transition-all">
            <Mail size={18} />
          </a>
          <Link to="/ajuda" className="p-3 bg-white/5 rounded-xl hover:bg-[#5283A9] text-white transition-all">
            <HelpCircle size={18} />
          </Link>
        </div>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">Departamentos</h4>
        <ul className="space-y-4 text-sm font-medium">
          <li><Link to="/institucional" className="hover:text-[#5283A9] transition-colors">DPHAP (Material)</Link></li>
          <li><Link to="/institucional" className="hover:text-[#CC343A] transition-colors">DPI (Imaterial)</Link></li>
          <li><Link to="/institucional" className="hover:text-white transition-colors">DPE (Especiais)</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">Institucional</h4>
        <ul className="space-y-4 text-sm font-medium">
          <li><Link to="/institucional" className="hover:text-white transition-colors">Quem Somos</Link></li>
          <li><Link to="/servicos" className="hover:text-white transition-colors">Serviços ao Cidadão</Link></li>
          <li><Link to="/legislacao" className="hover:text-white transition-colors">Legislação</Link></li>
          <li><Link to="/transparencia" className="hover:text-white transition-colors">Transparência</Link></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/5 text-[10px] text-center flex flex-col md:flex-row justify-between items-center gap-4 uppercase tracking-widest font-bold">
      <p>© 2024 Superintendência do Patrimônio Cultural - Governo do Maranhão.</p>
      <div className="flex gap-6 opacity-40">
        <span>GIS v2.5.0</span>
        <span>Privacidade</span>
        <span>Acessibilidade</span>
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
      <div className="min-h-screen flex flex-col font-sans selection:bg-[#5283A9] selection:text-white">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mapa" element={<MapaPage />} />
            <Route path="/institucional" element={<InstitucionalPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/legislacao" element={<LegislacaoPage />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <ShieldAlert size={80} className="text-[#CC343A]" />
                <h2 className="text-3xl font-black text-[#2D2D2D]">Módulo em Atualização</h2>
                <p className="text-slate-500 max-w-md text-center">Estamos trabalhando para disponibilizar este conteúdo em breve seguindo as novas diretrizes.</p>
                <Link to="/" className="px-8 py-3 bg-[#5283A9] text-white rounded-xl font-bold hover:shadow-xl transition-all">Voltar ao Início</Link>
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
