import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ingestionService, validateGeoJsonWGS84, validateCsvCoordinates } from '../../services/ingestionService';
import { IngestionContentType, Department, IngestionStatus } from '../../types';
import { MOCK_ASSETS } from '../../data/mockData';
import {
  UploadCloud,
  File,
  X,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Tag,
  MapPin,
  Link as LinkIcon,
  Info,
  Calendar,
  User,
  Shield
} from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';

export const UploadForm: React.FC = () => {
  const { user } = useAuth();
  
  // Estados do Formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<IngestionContentType>(IngestionContentType.ACERVO_DIGITAL);
  const [declaredSource, setDeclaredSource] = useState('');
  const [department, setDepartment] = useState<Department>(Department.DPHAP);
  const [municipality, setMunicipality] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [relatedAssetId, setRelatedAssetId] = useState('');
  const [author, setAuthor] = useState('');
  const [rights, setRights] = useState('');

  // Estados de Upload
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Estados de Validação e Pré-visualização Geográfica
  const [geoValidation, setGeoValidation] = useState<{ valid: boolean; error?: string } | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sugere o departamento responsável automaticamente com base no tipo de conteúdo
  useEffect(() => {
    switch (contentType) {
      case IngestionContentType.BEM_CULTURAL:
      case IngestionContentType.POLIGONAL_MAPA:
      case IngestionContentType.LEGISLACAO:
        setDepartment(Department.DPHAP);
        break;
      case IngestionContentType.ACERVO_DIGITAL:
      case IngestionContentType.REPOSITORIO_TECNICO:
        setDepartment(Department.DPI);
        break;
      case IngestionContentType.PROJETO:
      case IngestionContentType.SERVICO:
        setDepartment(Department.DPE);
        break;
      default:
        setDepartment(Department.DPHAP);
    }
  }, [contentType]);

  // Libera a memória do preview de imagem
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Função para processar e validar o arquivo selecionado
  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMsg('');
    setGeoValidation(null);
    setGeoJsonData(null);

    // Gerar preview para imagens
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }

    // Validar se for arquivo geográfico
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (ext === 'geojson') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const validation = validateGeoJsonWGS84(text);
        setGeoValidation(validation);
        if (validation.valid) {
          try {
            setGeoJsonData(JSON.parse(text));
          } catch (e) {}
        }
      };
      reader.readAsText(selectedFile);
    } else if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const validation = validateCsvCoordinates(text);
        setGeoValidation(validation);
      };
      reader.readAsText(selectedFile);
    } else if (ext === 'zip') {
      setGeoValidation({
        valid: true,
        error: 'Shapefile empacotado (.zip). O arquivo foi aceito para processamento e será validado posteriormente pelo setor técnico.'
      });
    } else if (['kml', 'kmz'].includes(ext || '')) {
      setGeoValidation({
        valid: true,
        error: 'Arquivo KML/KMZ aceito. O sistema validará as coordenadas no momento da publicação.'
      });
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    setGeoValidation(null);
    setGeoJsonData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Você precisa estar logado para enviar arquivos.');
      return;
    }

    if (!file) {
      setErrorMsg('Por favor, faça o upload de um arquivo.');
      return;
    }

    if (!declaredSource.trim()) {
      setErrorMsg('O campo Fonte Declarada é obrigatório.');
      return;
    }

    // Regra obrigatória: Imagens exigem autoria/direitos
    if (file.type.startsWith('image/') && !author.trim() && !rights.trim()) {
      setErrorMsg('Para imagens, é obrigatório preencher o Autor ou o Direito de Uso.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Upload do arquivo para o Firebase Storage
      const uploadRes = await ingestionService.uploadFile(file, user.id);

      // 2. Montar metadata geográfico
      let metadataPayload: any = {};
      if (geoJsonData) {
        metadataPayload = {
          geoValid: geoValidation?.valid,
          geoError: geoValidation?.error || null,
          coordinatesSystem: 'WGS84 / EPSG:4326',
          geometryType: geoJsonData.type || 'FeatureCollection',
          featuresCount: geoJsonData.features ? geoJsonData.features.length : 1
        };
      } else if (geoValidation) {
        metadataPayload = {
          geoValid: geoValidation.valid,
          geoError: geoValidation.error || null,
          coordinatesSystem: 'Pendente de validação'
        };
      }

      // 3. Montar dados do item de Ingestão
      const ext = file.name.split('.').pop() || '';
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const ingestionItemData = {
        title: title || file.name,
        description,
        uploadedBy: user.id,
        uploadedByName: user.name,
        fileName: file.name,
        fileUrl: uploadRes.url,
        fileType: file.type || 'application/octet-stream',
        fileExtension: ext,
        fileSize: file.size,
        suggestedModule: contentType,
        department,
        municipality: municipality || undefined,
        relatedAssetId: relatedAssetId || undefined,
        declaredSource,
        author: author || undefined,
        rights: rights || undefined,
        tags,
        metadata: metadataPayload
      };

      // 4. Submeter ao Firestore
      await ingestionService.submitIngestionItem(ingestionItemData);

      setSuccessMsg('Conteúdo enviado com sucesso! Ele foi adicionado à fila de análise técnica e está com status "Em análise".');
      
      // Limpar formulário
      setTitle('');
      setDescription('');
      setDeclaredSource('');
      setMunicipality('');
      setTagsInput('');
      setRelatedAssetId('');
      setAuthor('');
      setRights('');
      clearFile();

    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Erro ao submeter conteúdo: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden font-sans">
      <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-brand-dark flex items-center gap-2">
            <UploadCloud className="text-brand-blue" size={20} />
            Novo Envio Patrimonial
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Insira os dados e faça o upload de documentos, imagens ou dados geográficos.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider">
          <Shield size={12} />
          Fila de Validação Ativa
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-3">
            <AlertTriangle size={18} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-3">
            <CheckCircle size={18} className="flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Zona de Upload (Drag and Drop) */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
            Arquivo do Patrimônio <span className="text-brand-red">*</span>
          </label>

          {!file ? (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-brand-blue bg-blue-50/30 scale-[0.99]'
                  : 'border-slate-200 hover:border-brand-blue hover:bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.dataTransfer?.files[0] || e.target.files[0])}
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.tiff,.pdf,.docx,.xlsx,.csv,.geojson,.kml,.kmz,.zip"
              />
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 transition-colors group-hover:bg-brand-blue/10 group-hover:text-brand-blue">
                <UploadCloud size={28} />
              </div>
              <p className="text-xs font-bold text-slate-700 text-center">
                Arraste e solte o arquivo aqui ou <span className="text-brand-blue">clique para procurar</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-2 text-center max-w-sm">
                Formatos aceitos: Imagens (JPG, PNG, WebP, TIFF), Documentos (PDF, DOCX, XLSX, CSV), Mapas (GeoJSON, KML, KMZ, ZIP de Shapefiles).
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-3xl p-6 bg-slate-50/50 relative">
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white border border-slate-200 hover:bg-red-50 hover:text-brand-red transition-all shadow-sm"
              >
                <X size={14} />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand-blue shadow-sm overflow-hidden flex-shrink-0">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <File size={28} />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 break-all">{file.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Tipo Desconhecido'}
                  </p>

                  {/* Resultados de Validação Geográfica */}
                  {geoValidation && (
                    <div className={`mt-3 p-3 rounded-2xl border text-[10px] font-semibold ${
                      geoValidation.valid 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {geoValidation.valid ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        <span>Validação Geográfica</span>
                      </div>
                      <p className="opacity-90">{geoValidation.error || 'Sistema de coordenadas validado no padrão WGS84 / EPSG:4326.'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pré-visualização do Mapa GeoJSON */}
              {geoJsonData && (
                <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden h-48 bg-slate-100 relative z-0">
                  <MapContainer
                    center={[-2.5284, -44.3044]}
                    zoom={10}
                    scrollWheelZoom={false}
                    className="w-full h-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <GeoJSON data={geoJsonData}>
                      <Popup>Pré-visualização do polígono de tombamento enviado.</Popup>
                    </GeoJSON>
                  </MapContainer>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informações Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              Título do Conteúdo / Documento
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Decreto de Tombamento do Centro Histórico"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              Tipo de Conteúdo <span className="text-brand-red">*</span>
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as IngestionContentType)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
            >
              {Object.values(IngestionContentType).map((type) => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
            Descrição / Resumo Informativo
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Forneça uma descrição detalhada sobre o conteúdo enviado, seu valor histórico ou técnico..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all resize-none"
          />
        </div>

        {/* Setores e Fonte (Obrigatórios) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              Fonte Declarada <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              value={declaredSource}
              onChange={(e) => setDeclaredSource(e.target.value)}
              placeholder="Ex: IPHAN, Diário Oficial, Nome do Livro/Autor"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
              required
            />
            <p className="text-[10px] text-slate-400 font-medium">Regra: Arquivos sem fonte declarada não podem ser aprovados ou publicados.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              Departamento Responsável (Sugerido) <span className="text-brand-red">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
            >
              {Object.values(Department).map((dept) => (
                <option key={dept} value={dept}>
                  {dept === Department.DPHAP ? 'DPHAP (Patrimônio Material)' : dept === Department.DPI ? 'DPI (Patrimônio Imaterial)' : 'DPE (Projetos Especiais)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Campos opcionais de Direitos e Autoria (Obrigatórios se imagem) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              Autor / Criador
              {file?.type.startsWith('image/') && <span className="text-brand-red">*</span>}
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ex: Fotógrafo, Engenheiro, Historiador"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              Direito de Uso / Licença
              {file?.type.startsWith('image/') && <span className="text-brand-red">*</span>}
            </label>
            <input
              type="text"
              value={rights}
              onChange={(e) => setRights(e.target.value)}
              placeholder="Ex: Domínio Público, CC BY-NC-SA, Autoria Própria"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
            />
          </div>
        </div>

        {/* Opcionais Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" /> Município Relacionado
            </label>
            <input
              type="text"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              placeholder="Ex: São Luís, Alcântara"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <LinkIcon size={12} className="text-slate-400" /> Bem Cultural Vinculado
            </label>
            <select
              value={relatedAssetId}
              onChange={(e) => setRelatedAssetId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
            >
              <option value="">Nenhum bem patrimonial</option>
              {MOCK_ASSETS.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.municipality})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Tag size={12} className="text-slate-400" /> Tags (Separadas por vírgula)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Ex: legislação, restauro, colonial"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all"
            />
          </div>
        </div>

        {/* Rodapé do Formulário */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
            <Info size={14} className="text-brand-blue" />
            O arquivo entrará com status "Enviado" para análise.
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Processando Envio...' : 'Enviar para Curadoria'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
