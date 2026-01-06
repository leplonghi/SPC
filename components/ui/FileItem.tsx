
import React, { useState } from 'react';
import { Download, Edit2, Trash2, RefreshCw, FileText, ImageIcon, File, Check, X, Loader2 } from 'lucide-react';

interface FileData {
    name: string;
    url: string;
    type: 'pdf' | 'image' | 'doc' | 'other';
    uploadedAt: string;
}

interface FileItemProps {
    file: FileData;
    isEditor: boolean;
    onDelete: () => void;
    onRename: (newName: string) => void;
    onReplace: (newFile: File) => Promise<void>;
}

export const FileItem: React.FC<FileItemProps> = ({ file, isEditor, onDelete, onRename, onReplace }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(file.name);
    const [isReplacing, setIsReplacing] = useState(false);

    const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setIsReplacing(true);
        try {
            await onReplace(selectedFile);
        } finally {
            setIsReplacing(false);
        }
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group flex-wrap md:flex-nowrap">
            <div className={`p-2 rounded-lg shrink-0 ${file.type === 'pdf' ? 'bg-red-50 text-red-500' : file.type === 'image' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-500'}`}>
                {file.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
            </div>

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-1 w-full outline-none focus:border-brand-blue"
                            autoFocus
                        />
                        <button onClick={() => { onRename(newName); setIsEditing(false); }} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"><Check size={12} /></button>
                        <button onClick={() => { setIsEditing(false); setNewName(file.name); }} className="p-1 text-red-500 hover:bg-red-50 rounded"><X size={12} /></button>
                    </div>
                ) : (
                    <>
                        <p className="text-[11px] font-bold text-slate-700 truncate">{file.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                    </>
                )}
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-auto">
                <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all"
                    title="Download"
                >
                    <Download size={16} />
                </a>

                {isEditor && (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                            title="Editar nome"
                        >
                            <Edit2 size={16} />
                        </button>

                        <label className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all cursor-pointer relative" title="Atualizar arquivo">
                            {isReplacing ? (
                                <Loader2 size={16} className="animate-spin text-brand-blue" />
                            ) : (
                                <RefreshCw size={16} />
                            )}
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleReplace}
                                disabled={isReplacing}
                            />
                        </label>

                        <button
                            onClick={() => { if (confirm("Deseja realmente excluir este arquivo?")) onDelete(); }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Deletar"
                        >
                            <Trash2 size={16} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
