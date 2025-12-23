
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  FilePlus, 
  Users, 
  History, 
  BarChart, 
  ChevronRight,
  Database,
  UploadCloud,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User, UserRole, Department } from '../types';

interface AdminDashboardProps {
  user: User | null;
}

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} text-white`}>
        <Icon size={20} />
      </div>
      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
        <ArrowUpRight size={12} /> {trend}
      </span>
    </div>
    <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</h4>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || ![UserRole.SUPER_ADMIN, UserRole.ADMIN_SPC, UserRole.EDITOR_DPHAP, UserRole.EDITOR_DPE, UserRole.EDITOR_DPI].includes(user.role)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-red-600">Acesso Restrito</h2>
        <p className="text-slate-600">Você não tem permissões para acessar esta área.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold">SPC</div>
          <div>
            <span className="block text-sm font-bold">Painel Administrativo</span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest">Acesso: {user.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
             <span className="block text-xs font-bold">{user.name}</span>
             <span className="block text-[10px] text-slate-400">{user.department || 'Gestão Central'}</span>
           </div>
           <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
             <Users size={20} />
           </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 bg-white border-r border-slate-200 p-4 space-y-1">
          {[
            { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
            { id: 'assets', label: 'Bens Materiais', icon: MapIcon },
            { id: 'intangible', label: 'Imaterial', icon: FilePlus },
            { id: 'import', label: 'Importar Dados', icon: UploadCloud },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'logs', label: 'Audit Log', icon: History },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow p-8 space-y-8 max-w-6xl mx-auto w-full">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Tombamentos" value="2.451" trend="12%" icon={MapIcon} color="bg-blue-600" />
                <StatCard label="Registros DPI" value="38" trend="4%" icon={FilePlus} color="bg-red-600" />
                <StatCard label="Projetos Ativos" value="12" trend="0%" icon={Database} color="bg-slate-900" />
                <StatCard label="Solicitações" value="89" trend="24%" icon={History} color="bg-amber-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <History size={20} className="text-blue-600" /> Edições Recentes
                  </h3>
                  <div className="space-y-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">JD</div>
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-slate-800">João Silva atualizou "Palácio dos Leões"</p>
                          <p className="text-[10px] text-slate-400 font-medium">HÁ 2 HORAS • DEPARTAMENTO DPHAP</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Database size={20} className="text-red-600" /> Integridade de Dados
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-4">
                      <AlertCircle size={20} className="text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">12 registros sem coordenadas</p>
                        <p className="text-xs text-amber-700">Imóveis importados de Caxias estão com erro no GeoJSON.</p>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-4">
                      <CheckCircle2 size={20} className="text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-green-900">Sincronização concluída</p>
                        <p className="text-xs text-green-700">Backup automático do banco de dados realizado hoje às 04:00.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'import' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Assistente de Importação</h2>
                <p className="text-slate-500">Suba arquivos CSV, Excel ou GeoJSON para atualizar o banco de dados do patrimônio.</p>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-4 hover:border-blue-400 transition-colors group cursor-pointer">
                <p className="text-sm text-slate-500 group-hover:text-blue-600 font-medium">Arraste seu arquivo aqui ou clique para selecionar</p>
                <button className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Selecionar Arquivo</button>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Orientações</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <span className="font-bold block mb-1">Mapeamento de Colunas</span>
                    O sistema tentará detectar automaticamente colunas como "nome", "municipio" e "lat/lng".
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <span className="font-bold block mb-1">Validação Geográfica</span>
                    Coordenadas fora dos limites do Maranhão serão sinalizadas para revisão manual.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
