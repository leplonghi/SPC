import React, { useState, useEffect } from 'react';
import {
    X, Save, Trash2, Plus, Info, MapPin, Building,
    Calendar, Palette, FileText, Search, Image as ImageIcon,
    Loader2, AlertCircle, Shield, CheckCircle, ExternalLink
} from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { HeritageAsset, HeritageLot } from '../../types_patrimonio';
import { FileUpload } from '../ui/FileUpload';

interface InlineAssetEditorProps {
    asset: HeritageAsset;
    allLots?: HeritageLot[];
    onSave: (updated: HeritageAsset) => Promise<void>;
    onCancel: () => void;
    onDelete?: () => void;
    onOpenTombamentoEditor?: () => void;
    isSaving?: boolean;
}

interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
    place_id: number;
    addresstype?: string;
    importance?: number;
}

export const InlineAssetEditor: React.FC<InlineAssetEditorProps> = ({
    asset,
    allLots = [],
    onSave,
    onCancel,
    onDelete,
    onOpenTombamentoEditor,
    isSaving = false
}) => {
    // Draft states matching HeritageAsset
    const [titulo, setTitulo] = useState(asset.titulo || '');
    const [cidade, setCidade] = useState(asset.cidade || '');
    const [enderecoOriginal, setEnderecoOriginal] = useState(asset.endereco_original || '');
    const [enderecoCanonico, setEnderecoCanonico] = useState(asset.endereco_canonico || '');
    const [categoria, setCategoria] = useState(asset.categoria || 'civil');
    const [conservationStatus, setConservationStatus] = useState(asset.conservation_status || 'Regular');
    const [propriedade, setPropriedade] = useState(asset.propriedade || 'privado');
    const [usoAtual, setUsoAtual] = useState(asset.uso_atual || '');
    const [anoConstrucao, setAnoConstrucao] = useState(asset.ano_construcao || '');
    const [estiloArquitetonico, setEstiloArquitetonico] = useState(asset.estilo_arquitetonico || '');
    const [tipologia, setTipologia] = useState(asset.tipologia || '');
    const [descricao, setDescricao] = useState(asset.descricao || '');
    const [lat, setLat] = useState<number>(asset.lat || 0);
    const [lng, setLng] = useState<number>(asset.lng || 0);
    
    // Geocode precision & source info
    const [geocodeConfidence, setGeocodeConfidence] = useState(asset.geocode_confidence ?? 1.0);
    const [geocodePrecision, setGeocodePrecision] = useState(asset.geocode_precision || 'rooftop');
    
    // Files & Images lists
    const [documentos, setDocumentos] = useState(asset.documentos || []);
    const [imagensHistoricas, setImagensHistoricas] = useState<string[]>(asset.imagens_historicas || []);
    const [newImageUrl, setNewImageUrl] = useState('');

    // Linked lots selection state
    const [selectedLotIds, setSelectedLotIds] = useState<string[]>(asset.lote_ids || []);

    // Geocoding search states
    const [addressSearchQuery, setAddressSearchQuery] = useState('');
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Active tab in the sidebar
    const [activeTab, setActiveTab] = useState<'info' | 'geo' | 'docs'>('info');

    // Update form values if asset prop changes
    useEffect(() => {
        setTitulo(asset.titulo || '');
        setCidade(asset.cidade || '');
        setEnderecoOriginal(asset.endereco_original || '');
        setEnderecoCanonico(asset.endereco_canonico || '');
        setCategoria(asset.categoria || 'civil');
        setConservationStatus(asset.conservation_status || 'Regular');
        setPropriedade(asset.propriedade || 'privado');
        setUsoAtual(asset.uso_atual || '');
        setAnoConstrucao(asset.ano_construcao || '');
        setEstiloArquitetonico(asset.estilo_arquitetonico || '');
        setTipologia(asset.tipologia || '');
        setDescricao(asset.descricao || '');
        setLat(asset.lat || 0);
        setLng(asset.lng || 0);
        setGeocodeConfidence(asset.geocode_confidence ?? 1.0);
        setGeocodePrecision(asset.geocode_precision || 'rooftop');
        setDocumentos(asset.documentos || []);
        setImagensHistoricas(asset.imagens_historicas || []);
        setSelectedLotIds(asset.lote_ids || []);
    }, [asset]);

    const handleSearchAddress = async () => {
        if (!addressSearchQuery.trim()) return;
        setIsSearchingAddress(true);
        setSearchError(null);
        setSearchResults([]);

        // Build clean search query with city if available
        const queryStr = `${addressSearchQuery}, ${cidade || 'São Luís'}, Maranhão, Brasil`;
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=br&addressdetails=1&q=${encodeURIComponent(queryStr)}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Erro na requisição ao Nominatim");
            const data = await res.json();
            if (data && data.length > 0) {
                setSearchResults(data);
            } else {
                setSearchError("Nenhum endereço encontrado para esta busca.");
            }
        } catch (e) {
            console.error("Geocoding address search error:", e);
            setSearchError("Falha na conexão com o geocodificador Nominatim.");
        } finally {
            setIsSearchingAddress(false);
        }
    };

    const selectGeocodingResult = (res: NominatimResult) => {
        const parsedLat = parseFloat(res.lat);
        const parsedLng = parseFloat(res.lon);
        
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            setLat(parsedLat);
            setLng(parsedLng);
            setEnderecoCanonico(res.display_name);
            setGeocodePrecision(
                res.addresstype === 'building' || res.addresstype === 'house_number' ? 'rooftop' :
                res.addresstype === 'road' || res.addresstype === 'street' ? 'street' : 'place'
            );
            
            // Infer simple confidence based on match importance
            const confidence = res.importance ? Math.min(1.0, res.importance * 1.5) : 0.8;
            setGeocodeConfidence(parseFloat(confidence.toFixed(2)));
        }
        setSearchResults([]);
        setAddressSearchQuery('');
    };

    const addImageUrl = () => {
        if (!newImageUrl.trim()) return;
        if (!imagensHistoricas.includes(newImageUrl.trim())) {
            setImagensHistoricas(prev => [...prev, newImageUrl.trim()]);
        }
        setNewImageUrl('');
    };

    const removeImageUrl = (urlToRemove: string) => {
        setImagensHistoricas(prev => prev.filter(url => url !== urlToRemove));
    };

    const handleUploadDoc = (file: { name: string; url: string; type: 'pdf' | 'image' | 'doc' | 'other'; uploadedAt: string }) => {
        setDocumentos(prev => [...prev, file]);
    };

    const removeDoc = (idx: number) => {
        setDocumentos(prev => prev.filter((_, i) => i !== idx));
    };

    const toggleLotAssociation = (lotId: string) => {
        setSelectedLotIds(prev => 
            prev.includes(lotId) 
                ? prev.filter(id => id !== lotId) 
                : [...prev, lotId]
        );
    };

    const handleSaveClick = () => {
        const updatedAsset: HeritageAsset = {
            ...asset,
            titulo,
            cidade,
            endereco_original: enderecoOriginal,
            endereco_canonico: enderecoCanonico,
            categoria,
            conservation_status: conservationStatus,
            propriedade,
            uso_atual: usoAtual,
            ano_construcao: anoConstrucao,
            estilo_arquitetonico: estiloArquitetonico,
            tipologia,
            descricao,
            lat,
            lng,
            geocode_confidence: geocodeConfidence,
            geocode_precision: geocodePrecision,
            documentos,
            imagens_historicas: imagensHistoricas,
            lote_ids: selectedLotIds
        };
        onSave(updatedAsset);
    };

    const accentColor = '#1E88E5'; // Sapphire Blue for Assets (Color Ban compliant)

    return (
        <div className="absolute top-20 right-4 md:right-6 bottom-4 w-80 z-[1001] pointer-events-auto flex flex-col gap-2">
            <GlassPanel
                className="flex-1 overflow-hidden flex flex-col p-0 bg-white/97 shadow-2xl"
                style={{ borderColor: `${accentColor}30` } as React.CSSProperties}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-slate-100"
                    style={{ borderBottom: `2px solid ${accentColor}20` }}
                >
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: accentColor }}>
                            Editor de Imóvel Histórico
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 truncate max-w-[210px]">
                            {titulo || 'Sem Título'}
                        </p>
                    </div>
                    <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={14} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-2 bg-slate-50 shrink-0 border-b border-slate-100">
                    <button
                        className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            activeTab === 'info' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        onClick={() => setActiveTab('info')}
                        style={activeTab === 'info' ? { background: accentColor } : {}}
                    >
                        <Building size={10} className="inline mr-1" />
                        Geral
                    </button>
                    <button
                        className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            activeTab === 'geo' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        onClick={() => setActiveTab('geo')}
                        style={activeTab === 'geo' ? { background: accentColor } : {}}
                    >
                        <MapPin size={10} className="inline mr-1" />
                        Mapa
                    </button>
                    <button
                        className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            activeTab === 'docs' ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        onClick={() => setActiveTab('docs')}
                        style={activeTab === 'docs' ? { background: accentColor } : {}}
                    >
                        <FileText size={10} className="inline mr-1" />
                        Mídia ({imagensHistoricas.length + documentos.length})
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-left">
                    
                    {/* --- INFO TAB --- */}
                    {activeTab === 'info' && (
                        <div className="space-y-3">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Título do Bem</label>
                                <input
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)}
                                    placeholder="Ex: Solar dos Vasconcelos..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Categoria</label>
                                    <select
                                        value={categoria}
                                        onChange={e => setCategoria(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                                    >
                                        <option value="civil">Civil</option>
                                        <option value="religious">Religioso</option>
                                        <option value="military">Militar</option>
                                        <option value="monument">Monumento</option>
                                        <option value="ruin">Ruína</option>
                                        <option value="area">Área</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Conservação</label>
                                    <select
                                        value={conservationStatus}
                                        onChange={e => setConservationStatus(e.target.value as any)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                                    >
                                        <option value="Regular">Regular</option>
                                        <option value="Em Obras">Em Obras</option>
                                        <option value="Alerta">Alerta</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Propriedade</label>
                                    <select
                                        value={propriedade}
                                        onChange={e => setPropriedade(e.target.value as any)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                                    >
                                        <option value="privado">Privado</option>
                                        <option value="público">Público</option>
                                        <option value="institucional">Institucional</option>
                                        <option value="misto">Misto</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Ano Construção</label>
                                    <input
                                        value={anoConstrucao}
                                        onChange={e => setAnoConstrucao(e.target.value)}
                                        placeholder="Ex: 1845 ou Séc. XIX"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Uso Atual</label>
                                    <input
                                        value={usoAtual}
                                        onChange={e => setUsoAtual(e.target.value)}
                                        placeholder="Museu, Residência..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Estilo Arq.</label>
                                    <input
                                        value={estiloArquitetonico}
                                        onChange={e => setEstiloArquitetonico(e.target.value)}
                                        placeholder="Neoclássico, Colonial..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tipologia</label>
                                <input
                                    value={tipologia}
                                    onChange={e => setTipologia(e.target.value)}
                                    placeholder="Ex: Sobrado com mirante"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Descrição Histórica</label>
                                <textarea
                                    value={descricao}
                                    onChange={e => setDescricao(e.target.value)}
                                    placeholder="Resumo histórico e arquitetônico do imóvel..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-slate-700"
                                />
                            </div>

                            {/* Tombamento Trigger Box */}
                            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tombamento Legal</label>
                                <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield size={16} className="text-blue-500" />
                                        <div>
                                            <p className="text-[10px] font-black text-blue-900 uppercase">Tombamentos Ativos</p>
                                            <p className="text-[9px] text-slate-500 font-bold">
                                                {asset.tombamentos?.length || 0} registro(s) anexado(s)
                                            </p>
                                        </div>
                                    </div>
                                    {onOpenTombamentoEditor && (
                                        <button
                                            type="button"
                                            onClick={onOpenTombamentoEditor}
                                            className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/10"
                                        >
                                            Gerenciar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MAP / GEO TAB --- */}
                    {activeTab === 'geo' && (
                        <div className="space-y-4">
                            {/* Address Search Geocoder */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                    Buscar Novo Endereço (Nominatim)
                                </label>
                                <div className="flex gap-1.5">
                                    <input
                                        value={addressSearchQuery}
                                        onChange={e => setAddressSearchQuery(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSearchAddress(); }}
                                        placeholder="Ex: Rua da Estrela, Centro..."
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSearchAddress}
                                        disabled={isSearchingAddress}
                                        className="px-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 text-white rounded-lg transition-all flex items-center justify-center shrink-0 shadow-md shadow-blue-500/15"
                                    >
                                        {isSearchingAddress ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                                    </button>
                                </div>

                                {searchError && (
                                    <p className="text-[9px] font-bold text-red-500 flex items-center gap-1">
                                        <AlertCircle size={10} /> {searchError}
                                    </p>
                                )}

                                {/* Results dropdown/list */}
                                {searchResults.length > 0 && (
                                    <div className="bg-white border border-slate-100 shadow-xl rounded-xl p-1.5 space-y-1 divide-y divide-slate-50 max-h-40 overflow-y-auto no-scrollbar">
                                        {searchResults.map((res) => (
                                            <button
                                                key={res.place_id}
                                                type="button"
                                                onClick={() => selectGeocodingResult(res)}
                                                className="w-full text-left p-2 hover:bg-slate-50 text-[10px] font-bold text-slate-600 leading-snug rounded transition-all block"
                                            >
                                                {res.display_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Coordinates and Geocoding results */}
                            <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 block">Latitude</label>
                                        <input
                                            type="number"
                                            value={lat}
                                            onChange={e => setLat(parseFloat(e.target.value) || 0)}
                                            step="0.000001"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-mono font-bold outline-none text-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 block">Longitude</label>
                                        <input
                                            type="number"
                                            value={lng}
                                            onChange={e => setLng(parseFloat(e.target.value) || 0)}
                                            step="0.000001"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-mono font-bold outline-none text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 block">Endereço Original</label>
                                    <textarea
                                        value={enderecoOriginal}
                                        onChange={e => setEnderecoOriginal(e.target.value)}
                                        rows={2}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none resize-none text-slate-700"
                                    />
                                </div>

                                <div>
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 block">Endereço Normalizado (Mapa)</label>
                                    <p className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200/60 rounded-lg p-2 leading-relaxed min-h-10 text-left">
                                        {enderecoCanonico || <span className="text-slate-400 font-medium italic">Nenhum endereço normalizado associado</span>}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-[9px] font-bold border-t border-slate-100 pt-2 text-slate-400">
                                    <span className="flex items-center gap-1">
                                        Precisão: <span className="text-slate-600 uppercase font-black">{geocodePrecision}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        Confiança: <span className={`font-black ${geocodeConfidence >= 0.75 ? 'text-emerald-600' : 'text-amber-500'}`}>{Math.round(geocodeConfidence * 100)}%</span>
                                    </span>
                                </div>
                            </div>

                            {/* Cadastral Lot association */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                    Lotes Cadastrais Associados
                                </label>
                                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 no-scrollbar text-left">
                                    {allLots.length === 0 ? (
                                        <p className="text-[10px] font-bold text-slate-400 italic py-2 text-center">Nenhum lote cadastral no mapa.</p>
                                    ) : (
                                        allLots.map((lot) => {
                                            const isChecked = selectedLotIds.includes(lot.id);
                                            return (
                                                <button
                                                    key={lot.id}
                                                    type="button"
                                                    onClick={() => toggleLotAssociation(lot.id)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                                                        isChecked
                                                            ? 'bg-amber-50/55 text-amber-700 border-amber-500/30'
                                                            : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-100'
                                                    }`}
                                                >
                                                    <span className="truncate max-w-[210px]">{lot.titulo}</span>
                                                    <span className="text-[9px] font-mono text-slate-400">
                                                        {lot.numero_lote ? `Lote ${lot.numero_lote}` : 'S/N'}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MÍDIA TAB --- */}
                    {activeTab === 'docs' && (
                        <div className="space-y-4">
                            {/* Historical Images */}
                            <div className="space-y-2.5">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                    <ImageIcon size={12} className="text-slate-400" /> Galeria de Imagens Históricas
                                </h4>
                                
                                {/* URL Adder */}
                                <div className="flex gap-1">
                                    <input
                                        value={newImageUrl}
                                        onChange={e => setNewImageUrl(e.target.value)}
                                        placeholder="URL da foto histórica..."
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] font-bold outline-none text-slate-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={addImageUrl}
                                        className="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition-all flex items-center justify-center font-bold"
                                    >
                                        Anexar
                                    </button>
                                </div>

                                {/* Images list */}
                                <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                                    {imagensHistoricas.map((url, i) => (
                                        <div key={i} className="group relative aspect-square bg-slate-100 border border-slate-100 rounded-xl overflow-hidden hover:scale-95 transition-all">
                                            <img src={url} alt={`Histórico ${i+1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImageUrl(url)}
                                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 bg-black/50 text-white hover:bg-red-500 rounded-md transition-all"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {imagensHistoricas.length === 0 && (
                                        <div className="col-span-3 py-6 text-center text-[9px] font-bold text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                                            Nenhuma imagem vinculada.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documents Upload & List */}
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                    <FileText size={12} className="text-slate-400" /> Arquivos & Documentos
                                </h4>

                                <FileUpload
                                    path={`assets/${asset.id}/documentos`}
                                    onUploadComplete={handleUploadDoc}
                                />

                                {/* Docs list */}
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 no-scrollbar text-left">
                                    {documentos.map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-sm transition-all group">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <FileText size={14} className="text-red-500 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-bold text-slate-700 truncate">{doc.name}</p>
                                                    <p className="text-[8px] text-slate-400 font-medium">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-400 hover:text-blue-500 rounded transition-colors">
                                                    <ExternalLink size={12} />
                                                </a>
                                                <button type="button" onClick={() => removeDoc(idx)} className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {documentos.length === 0 && (
                                        <p className="text-[9px] font-bold text-slate-400 italic py-2 text-center">Nenhum documento anexado.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="p-4 border-t border-slate-100 flex flex-col gap-2 shrink-0">
                    <button
                        onClick={handleSaveClick}
                        disabled={isSaving || !titulo.trim()}
                        className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                            background: titulo.trim() ? accentColor : '#E2E8F0',
                            boxShadow: titulo.trim() ? `0 4px 20px rgba(30,136,229,0.35)` : 'none',
                        }}
                    >
                        {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        Salvar Alterações
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all border border-slate-100"
                        >
                            Cancelar
                        </button>
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-all flex items-center justify-center gap-1"
                            >
                                <Trash2 size={10} />
                                Excluir Imóvel
                            </button>
                        )}
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
};
