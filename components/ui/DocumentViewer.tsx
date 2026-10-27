import React, { useState, useEffect } from 'react';
import {
    X,
    Download,
    ExternalLink,
    Clock,
    Database,
    BookOpen,
    Languages,
    FileCode,
    Sparkles,
    AlertCircle,
    Info,
    Share2,
    CheckCircle2
} from 'lucide-react';
import { RepositorioItem } from '../../types';

// Helper to parse Google Drive and Docs URLs
export const parseGoogleDriveUrl = (url: string) => {
    if (!url || url === '#') return { embedUrl: '', downloadUrl: '', isDrive: false };

    // Standard file format: /file/d/ID/view
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    // Document format: /document/d/ID/edit
    const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    // Spreadsheet format: /spreadsheets/d/ID/edit
    const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    // Open query format: id=ID
    const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    const id = (fileMatch && fileMatch[1]) ||
               (docMatch && docMatch[1]) ||
               (sheetMatch && sheetMatch[1]) ||
               (openMatch && openMatch[1]) ||
               '';

    if (id) {
        if (url.includes('/document/d/')) {
            return {
                embedUrl: `https://docs.google.com/document/d/${id}/preview`,
                downloadUrl: `https://docs.google.com/document/d/${id}/export?format=pdf`,
                isDrive: true
            };
        }
        if (url.includes('/spreadsheets/d/')) {
            return {
                embedUrl: `https://docs.google.com/spreadsheets/d/${id}/preview`,
                downloadUrl: `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`,
                isDrive: true
            };
        }
        return {
            embedUrl: `https://drive.google.com/file/d/${id}/preview`,
            downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
            isDrive: true
        };
    }

    return {
        embedUrl: url,
        downloadUrl: url,
        isDrive: false
    };
};

interface DocumentViewerProps {
    item: RepositorioItem;
    onClose: () => void;
    getCategoryConfig: (category: string) => {
        icon: React.ComponentType<any>;
        label: string;
        color: string;
        lightColor: string;
    };
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ item, onClose, getCategoryConfig }) => {
    const [iframeLoading, setIframeLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'tech'>('info');
    const [copied, setCopied] = useState(false);

    const { embedUrl, downloadUrl, isDrive } = parseGoogleDriveUrl(item.downloadUrl);
    const catConfig = getCategoryConfig(item.category);

    useEffect(() => {
        setIframeLoading(true);
    }, [item]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.origin + `/repositorio?id=${item.id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-md cursor-pointer"
                onClick={onClose}
            ></div>

            {/* Modal Body */}
            <div className="bg-[#FAF8F5] relative z-20 w-full max-w-[95vw] h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-200/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* Header (Slim & Sleek) */}
                <div className="bg-[#0B132B] text-white px-8 py-5 flex items-center justify-between border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${catConfig.lightColor.split(' ')[0]} bg-white/10 text-white`}>
                            {React.createElement(catConfig.icon, { size: 20 })}
                        </div>
                        <div>
                            <span className="text-[9px] font-black tracking-widest text-[#CC343A] uppercase">
                                Central de Documentação • {catConfig.label}
                            </span>
                            <h2 className="text-base font-black text-slate-100 line-clamp-1 leading-tight max-w-[50vw] md:max-w-[65vw]">
                                {item.title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="p-2.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                            title="Copiar Link do Documento"
                        >
                            <Share2 size={16} />
                            <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Compartilhar'}</span>
                        </button>
                        
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-white/5 hover:bg-[#CC343A] hover:text-white text-slate-300 rounded-xl transition-all transform hover:rotate-90"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Main Side-by-Side Area */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    
                    {/* Left Column: Drive Embedded PDF Viewer (65%) */}
                    <div className="flex-1 md:flex-[1.8] bg-slate-950/80 relative flex items-center justify-center border-r border-slate-200/40 h-1/2 md:h-full">
                        {embedUrl ? (
                            <>
                                {iframeLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900 z-10">
                                        <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-[#CC343A] animate-spin"></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                                            Carregando do Google Drive...
                                        </p>
                                    </div>
                                )}
                                <iframe
                                    src={embedUrl}
                                    className="w-full h-full border-none shadow-inner"
                                    allow="autoplay"
                                    onLoad={() => setIframeLoading(false)}
                                    title={`Visualização de ${item.title}`}
                                ></iframe>
                            </>
                        ) : (
                            <div className="text-center p-8 max-w-sm text-slate-400">
                                <AlertCircle size={40} className="mx-auto mb-4 text-[#CC343A]" />
                                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-2">Visualização Indisponível</h4>
                                <p className="text-[11px] leading-relaxed">
                                    Este documento técnico não possui um link de visualização válido no Google Drive. Use o botão de download para baixar o arquivo completo.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Rich Extracted Information (35%) */}
                    <div className="w-full md:w-[380px] lg:w-[450px] flex flex-col h-1/2 md:h-full bg-white overflow-hidden shrink-0">
                        {/* Tab Switcher */}
                        <div className="flex border-b border-slate-100 shrink-0 bg-[#F9F7F1]/30">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 ${
                                    activeTab === 'info' 
                                        ? 'border-[#CC343A] text-[#CC343A] bg-white' 
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <Sparkles size={14} /> Informações por IA
                            </button>
                            <button
                                onClick={() => setActiveTab('tech')}
                                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 ${
                                    activeTab === 'tech' 
                                        ? 'border-[#CC343A] text-[#CC343A] bg-white' 
                                        : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <Info size={14} /> Ficha Técnica
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                            {activeTab === 'info' ? (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    {/* Executive Summary */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <BookOpen size={12} className="text-[#CC343A]" /> Resumo Executivo
                                        </h4>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed bg-[#F9F7F1]/80 border border-slate-200/40 p-4 rounded-2xl shadow-sm text-justify">
                                            {item.executiveSummary || item.description || "Nenhum resumo executivo extraído para este documento."}
                                        </p>
                                    </div>

                                    {/* Highlights */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Sparkles size={12} className="text-amber-500" /> Pontos de Destaque Extraídos
                                        </h4>
                                        <ul className="space-y-3">
                                            {item.highlights && item.highlights.length > 0 ? (
                                                item.highlights.map((highlight, index) => (
                                                    <li key={index} className="flex items-start gap-3 group animate-in slide-in-from-right-3 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                                                        <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                                            <CheckCircle2 size={12} />
                                                        </div>
                                                        <span className="text-[11px] text-slate-500 font-semibold leading-normal group-hover:text-slate-800 transition-colors">
                                                            {highlight}
                                                        </span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-[11px] text-slate-400 font-semibold italic">Nenhum ponto-chave catalogado.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    {/* Specifications Grid */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadados Técnicos</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            
                                            {/* Department */}
                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1 hover:border-slate-200 transition-all">
                                                <Database size={16} className="text-brand-blue" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Órgão</span>
                                                <span className="text-xs font-black text-slate-800">{item.department || "Geral"}</span>
                                            </div>

                                            {/* Format */}
                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1 hover:border-slate-200 transition-all">
                                                <FileCode size={16} className="text-[#CC343A]" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Formato</span>
                                                <span className="text-xs font-black text-slate-800">{item.format || "PDF"} ({item.size || "N/A"})</span>
                                            </div>

                                            {/* Pages */}
                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1 hover:border-slate-200 transition-all">
                                                <BookOpen size={16} className="text-emerald-500" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Volume</span>
                                                <span className="text-xs font-black text-slate-800">{item.pageCount || "N/A"} páginas</span>
                                            </div>

                                            {/* Language */}
                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1 hover:border-slate-200 transition-all">
                                                <Languages size={16} className="text-amber-500" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Idioma</span>
                                                <span className="text-xs font-black text-slate-800">{item.language || "Português"}</span>
                                            </div>

                                            {/* Year */}
                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1 hover:border-slate-200 transition-all col-span-2">
                                                <Clock size={16} className="text-indigo-500" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Ano de Publicação</span>
                                                <span className="text-xs font-black text-slate-800">{item.year || new Date(item.date).getFullYear()}</span>
                                            </div>
                                            
                                        </div>
                                    </div>

                                    {/* Related Tags */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tópicos e Assuntos</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.tags && item.tags.length > 0 ? (
                                                item.tags.map((tag, idx) => (
                                                    <span 
                                                        key={idx}
                                                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-[#F9F7F1] text-slate-500 rounded-lg border border-slate-200/50 hover:bg-[#CC343A] hover:text-white hover:border-transparent transition-all cursor-default"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400 font-medium italic">Sem tags associadas.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Document Action Panel (Sticky Footer) */}
                        <div className="p-6 border-t border-slate-100 bg-[#FAF8F5] flex flex-col gap-3 shrink-0">
                            <div className="flex gap-2">
                                {/* Download Link */}
                                <a
                                    href={downloadUrl || item.downloadUrl}
                                    target={isDrive ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    className="flex-1 py-4 bg-[#CC343A] hover:bg-[#b02c31] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#CC343A]/20 text-center"
                                >
                                    <Download size={14} /> Baixar {item.format}
                                </a>

                                {/* Drive Outer View Link */}
                                {isDrive && (
                                    <a
                                        href={item.downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-4 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center"
                                        title="Abrir no Google Drive"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                            
                            <p className="text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                Documento do Acervo Técnico SPC • Acesso Público
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};
