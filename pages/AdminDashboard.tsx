
import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Search,
  MoreVertical,
  Shield,
  Save
} from 'lucide-react';
import { User, UserRole, Department } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${color} text-white`}>
        <Icon size={16} />
      </div>
      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
        <ArrowUpRight size={10} /> {trend}
      </span>
    </div>
    <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">{label}</h4>
    <p className="text-xl font-black text-slate-900">{value}</p>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [tempRole, setTempRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      fetchUsers();
    }
  }, [activeTab, isAdmin]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsersList(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingUser(null);
      setTempRole(null);
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Erro ao atualizar função do usuário.");
    }
  };

  // --- Import Feature Logic ---
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importLog, setImportLog] = useState<string[]>([]);
  const endOfLogRef = React.useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setImportLog(prev => [...prev, msg]);
    // Auto scroll
    setTimeout(() => endOfLogRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportLog([]);
      setImportProgress(0);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];

    // Simple CSV parser - assuming standard comma separation and minimal quoting for now
    // For robust parsing, a library is better, but this works for simple seeds.
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

    return lines.slice(1).map(line => {
      // Handle commas inside quotes with regex
      const values: string[] = [];
      let inQuote = false;
      let currentValue = '';

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          values.push(currentValue.trim().replace(/^"|"$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/^"|"$/g, ''));

      const obj: any = {};
      headers.forEach((h, i) => {
        let val = values[i] || '';
        // Map common headers to our schema if needed, or keep as is
        if (h === 'lat' || h === 'lng' || h === 'latitude' || h === 'longitude') {
          obj[h === 'latitude' ? 'lat' : h === 'longitude' ? 'lng' : h] = val ? parseFloat(val.replace(',', '.')) : 0;
        } else {
          obj[h] = val;
        }
      });

      // key mapping normalization
      return {
        titulo: obj.titulo || obj.title || obj.nome || obj.name || '',
        cidade: obj.cidade || obj.city || obj.municipio || '',
        localizacao: obj.localizacao || obj.endereco || obj.address || obj.location || '',
        tipologia: obj.tipologia || obj.type || obj.categoria || 'Outros',
        descricao: obj.descricao || obj.description || obj.desc || '',
        lat: obj.lat || obj.latitude || 0,
        lng: obj.lng || obj.longitude || obj.lon || 0,
        ...obj
      };
    });
  };

};

const parsePDF = async (buffer: ArrayBuffer) => {
  try {
    // Import PDFJS dynamically to avoid load issues
    const pdfjs = await import('pdfjs-dist');

    // Configure worker
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;

    let items: any[] = [];

    addLog(`PDF carregado. ${pdf.numPages} páginas encontradas.`);

    for (let i = 1; i <= pdf.numPages; i++) {
      addLog(`Lendo página ${i}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Basic extraction: join items with space, split by newline
      // Better heuristic: group items by Y position (lines)
      // For this MVP, we take the strings and try to find "listing" patterns

      const strings = textContent.items.map((item: any) => item.str);

      // Simple heuristic: Treat every non-empty line as a potential item title for now
      // Enhancements could include strict regex for "Address - City"

      strings.forEach(str => {
        const cleanStr = str.trim();
        if (cleanStr.length > 5 && !cleanStr.match(/^\d+$/)) {
          items.push({
            titulo: cleanStr,
            cidade: 'Extraído de PDF',
            localizacao: 'A verificar',
            tipologia: 'PDF Import',
            lat: 0,
            lng: 0,
            descricao: `Importado de PDF (Pág ${i})`
          });
        }
      });
    }

    return items;
  } catch (e: any) {
    console.error("PDF Parsing error", e);
    throw new Error("Falha ao ler PDF: " + e.message);
  }
};

const handleUpload = async () => {
  if (!importFile) return;
  setImporting(true);
  addLog("Iniciando leitura do arquivo...");

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      let data: any[] = [];

      if (importFile.name.endsWith('.json')) {
        const text = e.target?.result as string;
        data = JSON.parse(text);
        addLog("Arquivo JSON interpretado.");
      } else if (importFile.name.endsWith('.csv')) {
        const text = e.target?.result as string;
        data = parseCSV(text);
        addLog("Arquivo CSV interpretado.");
      } else if (importFile.name.endsWith('.pdf')) {
        if (e.target?.result instanceof ArrayBuffer) {
          // PDF requires ArrayBuffer
          data = await parsePDF(e.target.result);
          addLog(`Extração de PDF concluída. ${data.length} itens encontrados.`);
        } else {
          throw new Error("Erro de leitura de arquivo (Buffer inválido)");
        }
      } else {
        throw new Error("Formato não suportado");
      }

      // Validate basic requirement
      if (!data.length) throw new Error("Arquivo vazio ou nenhum dado extraído");

      setImportTotal(data.length);
      addLog(`${data.length} itens detectados. Iniciando processamento...`);

      // Dynamically import service to avoid circular or early load issues
      const { geocodingService } = await import('../services/GeocodingService');

      await geocodingService.importSeed(data, (count) => {
        setImportProgress(count);
        // We could add more specific logs here via a modified service callback, 
        // but for now we trust the progress count.
        if (count % 5 === 0) addLog(`Processados: ${count}/${data.length}`);
      });

      addLog("Sucesso: Importação finalizada!");
      setTimeout(() => setImporting(false), 2000);

    } catch (err: any) {
      console.error(err);
      addLog(`Erro Crítico: ${err.message}`);
      setImporting(false);
    }
  };

  if (importFile.name.endsWith('.pdf')) {
    reader.readAsArrayBuffer(importFile);
  } else {
    reader.readAsText(importFile);
  }
};

// Permission check guarded by PrivateRoute in App.tsx, but good to have safety
if (!user) return null;

return (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <div className="bg-slate-900 text-white px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center font-bold">SPC</div>
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
          { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, role: 'any' },
          { id: 'assets', label: 'Bens Materiais', icon: MapIcon, role: 'any' },
          { id: 'intangible', label: 'Imaterial', icon: FilePlus, role: 'any' },
          { id: 'import', label: 'Importar Dados', icon: UploadCloud, role: 'any' },
          { id: 'users', label: 'Usuários', icon: Users, role: 'admin' },
          { id: 'logs', label: 'Audit Log', icon: History, role: 'admin' },
        ].map(item => {
          if (item.role === 'admin' && !isAdmin) return null;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-grow p-6 space-y-6 max-w-6xl mx-auto w-full">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Tombamentos" value="2.451" trend="12%" icon={MapIcon} color="bg-brand-blue" />
              <StatCard label="Registros DPI" value="38" trend="4%" icon={FilePlus} color="bg-brand-red" />
              <StatCard label="Projetos Ativos" value="12" trend="0%" icon={Database} color="bg-brand-dark" />
              <StatCard label="Solicitações" value="89" trend="24%" icon={History} color="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <History size={18} className="text-brand-blue" /> Edições Recentes
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
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

              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Database size={18} className="text-brand-red" /> Integridade de Dados
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

        {activeTab === 'assets' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-black text-slate-900">Gestão de Bens Materiais</h2>
                <p className="text-xs text-slate-500 font-medium">Bens Tombados e Poligonais de Proteção</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-brand-blue/90 flex items-center gap-2">
                  <FilePlus size={14} /> Novo Bem
                </button>
              </div>
            </div>

            <div className="p-12 text-center text-slate-400">
              <MapIcon size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-600">Módulo em Desenvolvimento</h3>
              <p className="text-sm max-w-md mx-auto mt-2">
                A interface de edição visual de poligonais e gestão avançada de bens tomabados está sendo implementada. Por favor, utilize a importação em massa para atualizações ou contate o suporte técnico.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'users' && isAdmin && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-black text-slate-900">Gestão de Usuários</h2>
                <p className="text-xs text-slate-500 font-medium">Controle de acesso e permissões do sistema</p>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Buscar usuário..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue w-64" />
              </div>
            </div>

            {loadingUsers ? (
              <div className="p-12 flex justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Usuário</th>
                      <th className="px-6 py-4">E-mail</th>
                      <th className="px-6 py-4">Função</th>
                      <th className="px-6 py-4">Departamento</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-slate-700">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{u.id}</td> {/* Using ID as proxy for email/uid display if email not in User type, assume ID is relatable or add email to User type later */}
                        <td className="px-6 py-4">
                          {editingUser === u.id ? (
                            <select
                              className="text-xs p-1 border rounded"
                              value={tempRole || u.role}
                              onChange={(e) => setTempRole(e.target.value as UserRole)}
                            >
                              {Object.values(UserRole).map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border ${u.role === UserRole.SUPER_ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              u.role === UserRole.ADMIN_SPC ? 'bg-red-50 text-red-700 border-red-100' :
                                u.role.includes('Editor') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                  'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                              <Shield size={10} className="mr-1" />
                              {u.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                          {u.department || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingUser === u.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRoleChange(u.id, tempRole || u.role)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                <Save size={14} />
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="p-1 text-red-400 hover:bg-red-50 rounded"
                              >
                                <AlertCircle size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingUser(u.id); setTempRole(u.role); }}
                              className="text-slate-400 hover:text-brand-blue"
                            >
                              <MoreVertical size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'import' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-blue-50 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Assistente de Importação</h2>
              <p className="text-slate-500">Suba arquivos CSV (.csv), JSON (.json) ou PDF (.pdf) para atualizar o banco de dados do patrimônio.</p>
            </div>

            {!importing && !importFile && (
              <div
                className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-4 hover:border-brand-blue transition-colors group cursor-pointer relative"
              >
                <input
                  type="file"
                  accept=".csv,.json,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="pointer-events-none">
                  <p className="text-sm text-slate-500 group-hover:text-brand-blue font-medium">Arraste seu arquivo aqui ou clique para selecionar</p>
                  <button className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold pointer-events-none">Selecionar Arquivo</button>
                  <p className="text-[10px] text-slate-400 mt-2">Suporta CSV, JSON e listas em PDF</p>
                </div>
              </div>
            )}

            {importFile && !importing && (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                    <FilePlus size={24} className="text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{importFile.name}</p>
                    <p className="text-xs text-slate-500">{(importFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button
                    onClick={() => setImportFile(null)}
                    className="ml-auto text-slate-400 hover:text-red-500"
                  >
                    <MoreVertical size={20} className="rotate-90" /> {/* Using as close/clear for now, ideally X icon */}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setImportFile(null)}
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpload}
                    className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20"
                  >
                    Iniciar Importação
                  </button>
                </div>
              </div>
            )}

            {importing && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Processando...</span>
                    <span>{Math.round((importProgress / (importTotal || 1)) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-blue transition-all duration-300"
                      style={{ width: `${(importProgress / (importTotal || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    Processados {importProgress} de {importTotal} itens
                  </p>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] space-y-1">
                  {importLog.map((log, i) => (
                    <div key={i} className={`
                         ${log.includes('Erro') ? 'text-red-400' : 'text-slate-300'}
                         ${log.includes('Sucesso') ? 'text-green-400' : ''}
                       `}>
                      <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                      {log}
                    </div>
                  ))}
                  <div ref={endOfLogRef} />
                </div>
              </div>
            )}

            {!importing && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Orientações</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <span className="font-bold block mb-1">Formatos e Colunas</span>
                    Para CSV/JSON: <code>titulo</code>, <code>cidade</code>, <code>localizacao</code>. <br />
                    Para PDF: O sistema extrairá textos como lista. Ideal para diários oficiais.
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <span className="font-bold block mb-1">Geocoding Automático</span>
                    Itens sem coordenadas (lat/lng) serão processados automaticamente pelo serviço de geocodificação. Isso pode levar algum tempo.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default AdminDashboard;
