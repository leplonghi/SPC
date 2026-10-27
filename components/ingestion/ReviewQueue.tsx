import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ingestionService } from '../../services/ingestionService';
import { IngestionItem, IngestionStatus, Department } from '../../types';
import IngestionStatusBadge from './IngestionStatusBadge';
import {
  Search,
  Filter,
  Check,
  X,
  RotateCcw,
  Archive,
  Eye,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  FileCode,
  MapPin,
  FileSpreadsheet,
  FileImage,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Compass,
  File,
  CheckCircle
} from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';

export const ReviewQueue: React.FC = () => {
  const { user, isAdmin, isEditor, canReviewDepartment } = useAuth();
  
  const [items, setItems] = useState<IngestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<IngestionItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<IngestionStatus | ''>('');
  const [deptFilter, setDeptFilter] = useState<Department | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de Ação
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Carregar dados da fila
  const fetchQueue = async () => {
    setLoading(true);
    try {
      let data: IngestionItem[] = [];
      
      if (isAdmin) {
        // Admins vêem toda a fila
        data = await ingestionService.getIngestionQueue();
      } else if (isEditor) {
        // Editores vêem toda a fila, mas filtramos de acordo com o departamento do editor
        const allItems = await ingestionService.getIngestionQueue();
        data = allItems.filter(item => canReviewDepartment(item.department));
      } else {
        // Colaboradores comuns só vêem os próprios envios
        if (user) {
          data = await ingestionService.getMySubmissions(user.id);
        }
      }
      
      setItems(data);
    } catch (e) {
      console.error('Erro ao carregar fila:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user, statusFilter, deptFilter]);

  // Função para executar as transições de status
  const handleStatusChange = async (targetStatus: IngestionStatus) => {
    if (!selectedItem || !user) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    // Validações de Negócio obrigatórias
    if (targetStatus === IngestionStatus.PUBLISHED) {
      if (!selectedItem.declaredSource || !selectedItem.declaredSource.trim()) {
        setActionError('Erro de Publicação: Arquivos sem fonte declarada não podem ser publicados.');
        setActionLoading(false);
        return;
      }

      if (selectedItem.fileType.startsWith('image/')) {
        const hasRightsInfo = selectedItem.author?.trim() || selectedItem.rights?.trim();
        if (!hasRightsInfo) {
          setActionError('Erro de Publicação: Imagens devem exigir informação de fonte, autoria ou direito de uso.');
          setActionLoading(false);
          return;
        }
      }

      if (selectedItem.suggestedModule === 'poligonal_mapa') {
        const isGeoValid = selectedItem.metadata?.geoValid;
        if (isGeoValid === false) {
          setActionError('Erro de Publicação: Dados geográficos inválidos ou fora do sistema WGS84/EPSG:4326 não podem ser publicados.');
          setActionLoading(false);
          return;
        }
      }
    }

    try {
      // Definir a coleção final de destino e ID único caso aprovado/publicado
      let publishedDetails = undefined;
      if (targetStatus === IngestionStatus.PUBLISHED) {
        let collectionName = 'heritage_assets';
        if (selectedItem.suggestedModule === 'poligonal_mapa') {
          collectionName = 'tombamento_polygons';
        } else if (selectedItem.suggestedModule === 'legislacao') {
          collectionName = 'legislation_documents';
        }
        publishedDetails = {
          collection: collectionName,
          itemId: `pub_${Date.now()}`
        };
      }

      await ingestionService.updateIngestionStatus(
        selectedItem.id,
        targetStatus,
        user.id,
        user.name,
        reviewNotes || undefined,
        publishedDetails
      );

      setActionSuccess(`Status alterado com sucesso para "${targetStatus}"!`);
      setReviewNotes('');
      
      // Atualiza o item local selecionado
      setSelectedItem(null);
      
      // Recarrega a fila
      await fetchQueue();
    } catch (err: any) {
      setActionError(`Erro ao atualizar status: ${err.message || err}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtragem dos itens em memória com base em pesquisa
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesDept = deptFilter ? item.department === deptFilter : true;

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Ícones específicos baseados no tipo do arquivo
  const getFileIcon = (ext: string, type: string) => {
    const e = ext.toLowerCase();
    if (['geojson', 'kml', 'kmz'].includes(e)) return <Compass className="text-emerald-600" size={18} />;
    if (['zip'].includes(e)) return <FileCode className="text-amber-600" size={18} />;
    if (type.startsWith('image/')) return <FileImage className="text-blue-600" size={18} />;
    if (['pdf', 'docx'].includes(e)) return <FileText className="text-brand-red" size={18} />;
    if (['xlsx', 'csv'].includes(e)) return <FileSpreadsheet className="text-teal-600" size={18} />;
    return <File className="text-slate-600" size={18} />;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Filtros da Fila */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por título, arquivo..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Filter size={14} /> Filtros:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IngestionStatus | '')}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
          >
            <option value="">Todos os Status</option>
            {Object.values(IngestionStatus).map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>

          {isAdmin && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value as Department | '')}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
            >
              <option value="">Todos os Departamentos</option>
              {Object.values(Department).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => { setStatusFilter(''); setDeptFilter(''); setSearchQuery(''); }}
            className="px-4 py-2.5 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 mt-4">Carregando Fila de Ingestão...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-3xl border border-slate-200">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <h4 className="text-sm font-bold text-slate-800">Nenhum item na fila</h4>
          <p className="text-xs text-slate-500 mt-1">Nenhum registro corresponde aos filtros selecionados.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Item</th>
                  <th className="py-4 px-6">Origem/Uploader</th>
                  <th className="py-4 px-6">Data de Envio</th>
                  <th className="py-4 px-6">Módulo / Setor</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/55 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/50 flex items-center justify-center flex-shrink-0">
                          {getFileIcon(item.fileExtension, item.fileType)}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 break-all max-w-[200px]">{item.title}</h5>
                          <span className="text-[10px] text-slate-400 font-medium break-all block max-w-[200px] mt-0.5">{item.fileName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        <div>
                          <span>{item.uploadedByName}</span>
                          <span className="block text-[9px] text-slate-400 font-medium font-mono">ID: {item.uploadedBy.substring(0,6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={13} />
                        <span>{new Date(item.uploadedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-black uppercase text-slate-600 block w-max">{item.suggestedModule}</span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1">{item.department}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <IngestionStatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => { setSelectedItem(item); setActionError(''); setActionSuccess(''); }}
                        className="px-3.5 py-1.5 bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={12} /> Detalhes / Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Lateral de Detalhes e Curadoria Técnica */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-[200] animate-fade-in font-sans">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in relative">
            
            {/* Header do Modal */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">Central de Ingestão / Fila de Curadoria</span>
                <h3 className="text-base font-black text-brand-dark max-w-[450px] break-all">{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-all border border-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="flex-grow overflow-y-auto p-8 space-y-6">
              
              {actionError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-3">
                  <AlertTriangle size={18} className="flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-3">
                  <CheckCircle size={18} className="flex-shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Status e Metadados de Envio */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-[10px] font-bold text-slate-600">
                <div>
                  <span className="text-slate-400 block mb-0.5">STATUS ATUAL:</span>
                  <IngestionStatusBadge status={selectedItem.status} />
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">ENVIADO POR:</span>
                  <span className="text-slate-800">{selectedItem.uploadedByName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">DATA DO UPLOAD:</span>
                  <span className="text-slate-800">{new Date(selectedItem.uploadedAt).toLocaleString('pt-BR')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">MÓDULO SUGERIDO / SETOR:</span>
                  <span className="text-slate-800 uppercase">{selectedItem.suggestedModule} / {selectedItem.department}</span>
                </div>
              </div>

              {/* Pré-visualização do Arquivo */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Visualização do Arquivo</h4>
                {selectedItem.fileType.startsWith('image/') ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 flex justify-center bg-slate-50">
                    <img src={selectedItem.fileUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-blue shadow-sm">
                        {getFileIcon(selectedItem.fileExtension, selectedItem.fileType)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 break-all">{selectedItem.fileName}</span>
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                          {(selectedItem.fileSize / (1024 * 1024)).toFixed(2)} MB • {selectedItem.fileExtension}
                        </span>
                      </div>
                    </div>
                    <a
                      href={selectedItem.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink size={12} /> Abrir Arquivo
                    </a>
                  </div>
                )}

                {/* Exibição do polígono no mapa se for geográfico */}
                {selectedItem.suggestedModule === 'poligonal_mapa' && selectedItem.metadata?.geoValid && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden h-48 relative z-0">
                    <MapContainer
                      center={[-2.5284, -44.3044]}
                      zoom={11}
                      scrollWheelZoom={false}
                      className="w-full h-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <GeoJSON data={selectedItem.metadata}>
                        <Popup>{selectedItem.title}</Popup>
                      </GeoJSON>
                    </MapContainer>
                  </div>
                )}
              </div>

              {/* Informações Patrimoniais */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Informações e Fontes Declaradas</h4>
                <div className="space-y-3 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-xs text-slate-700">
                  {selectedItem.description && (
                    <div>
                      <span className="block font-black text-slate-400 text-[10px] uppercase mb-0.5">Descrição:</span>
                      <p className="font-semibold text-slate-800 leading-relaxed">{selectedItem.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block font-black text-slate-400 text-[10px] uppercase mb-0.5">Fonte Declarada:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedItem.declaredSource ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {selectedItem.declaredSource || 'FONTE NÃO DECLARADA (IMPEDIMENTO DE PUBLICAÇÃO)'}
                      </span>
                    </div>
                    {selectedItem.author && (
                      <div>
                        <span className="block font-black text-slate-400 text-[10px] uppercase mb-0.5">Autor/Criador:</span>
                        <span className="text-slate-800 font-bold">{selectedItem.author}</span>
                      </div>
                    )}
                    {selectedItem.rights && (
                      <div>
                        <span className="block font-black text-slate-400 text-[10px] uppercase mb-0.5">Direito de Uso / Licença:</span>
                        <span className="text-slate-800 font-bold">{selectedItem.rights}</span>
                      </div>
                    )}
                    {selectedItem.municipality && (
                      <div>
                        <span className="block font-black text-slate-400 text-[10px] uppercase mb-0.5">Município:</span>
                        <span className="text-slate-800 font-bold">{selectedItem.municipality}</span>
                      </div>
                    )}
                  </div>

                  {selectedItem.tags.length > 0 && (
                    <div className="pt-2">
                      <span className="block font-black text-slate-400 text-[10px] uppercase mb-1">Tags:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItem.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500">#{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Alertas de Regra de Negócio se houverem */}
              {selectedItem.fileType.startsWith('image/') && (!selectedItem.author?.trim() && !selectedItem.rights?.trim()) && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-[10px] font-semibold text-red-700 flex items-start gap-2">
                  <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Alerta de Publicação:</span> Esta imagem não possui informações suficientes de autoria ou direitos de uso preenchidos pelo uploader. A publicação está travada até a correção.
                  </div>
                </div>
              )}

              {/* Histórico e Trilha de Auditoria */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Trilha de Auditoria</h4>
                <div className="space-y-3 border-l-2 border-slate-100 pl-4 ml-2">
                  {selectedItem.auditTrail.map((audit, i) => (
                    <div key={i} className="text-[10px] font-semibold relative">
                      <div className="absolute w-2 h-2 rounded-full bg-slate-300 -left-[21px] top-1"></div>
                      <div className="text-slate-500 font-mono">{new Date(audit.timestamp).toLocaleString('pt-BR')}</div>
                      <div className="text-slate-800 font-bold">{audit.action}</div>
                      <div className="text-slate-400 mt-0.5">Executado por: {audit.userName} (ID: {audit.userId.substring(0,5)})</div>
                      {audit.notes && <div className="text-slate-600 bg-slate-50 border border-slate-100 p-2 rounded-xl mt-1 max-w-md font-medium italic">"{audit.notes}"</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas de Revisão */}
              {((isEditor && canReviewDepartment(selectedItem.department)) || isAdmin) && (
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                    Notas de Revisão / Justificativa Técnica
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={2}
                    placeholder="Adicione observações de aprovação, devolução para ajuste ou rejeição..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              )}

            </div>

            {/* Footer do Modal - Ações com controle de permissão */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 relative z-10">
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Fechar
                </button>
              </div>

              {/* Somente editores autorizados ou admins podem realizar transições na fila */}
              {((isEditor && canReviewDepartment(selectedItem.department)) || isAdmin) ? (
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Devolver para Correção */}
                  <button
                    onClick={() => handleStatusChange(IngestionStatus.NEEDS_CORRECTION)}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                    title="Enviar de volta para o uploader corrigir dados ou arquivo"
                  >
                    <RotateCcw size={12} /> Corrigir
                  </button>

                  {/* Rejeitar */}
                  <button
                    onClick={() => handleStatusChange(IngestionStatus.REJECTED)}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                  >
                    <X size={12} /> Rejeitar
                  </button>

                  {/* Arquivar */}
                  <button
                    onClick={() => handleStatusChange(IngestionStatus.ARCHIVED)}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                  >
                    <Archive size={12} /> Arquivar
                  </button>

                  {/* Aprovar (para Fila) */}
                  <button
                    onClick={() => handleStatusChange(IngestionStatus.APPROVED)}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                  >
                    <Check size={12} /> Aprovar
                  </button>

                  {/* Publicar (Apenas Admins / Super Admins) */}
                  {isAdmin && (
                    <button
                      onClick={() => handleStatusChange(IngestionStatus.PUBLISHED)}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center gap-1"
                      title="Publicar conteúdo e integrá-lo de forma imediata no sistema público"
                    >
                      <ShieldCheck size={12} /> Publicar no Portal
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  <ShieldAlert size={12} /> Sem permissão para moderar este departamento
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewQueue;
