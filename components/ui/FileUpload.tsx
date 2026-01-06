
import React, { useState } from 'react';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Upload, X, FileText, ImageIcon, File, Loader2, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
    path: string;
    onUploadComplete: (file: { name: string; url: string; type: 'pdf' | 'image' | 'doc' | 'other'; uploadedAt: string }) => void;
    accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ path, onUploadComplete, accept = ".pdf,.doc,.docx,image/*" }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setProgress(0);

        const fileExt = file.name.split('.').pop()?.toLowerCase();
        let type: 'pdf' | 'image' | 'doc' | 'other' = 'other';

        if (['pdf'].includes(fileExt || '')) type = 'pdf';
        else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) type = 'image';
        else if (['doc', 'docx'].includes(fileExt || '')) type = 'doc';

        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `${path}/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(p);
            },
            (err) => {
                console.error("Upload error:", err);
                setError("Falha ao subir arquivo. Verifique sua conexão e permissões.");
                setUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                onUploadComplete({
                    name: file.name,
                    url: downloadURL,
                    type,
                    uploadedAt: new Date().toISOString()
                });
                setUploading(false);
                setProgress(0);
            }
        );
    };

    return (
        <div className="w-full">
            <label className={`
                flex flex-col items-center justify-center w-full h-32 
                border-2 border-dashed rounded-2xl cursor-pointer 
                transition-all duration-300
                ${uploading ? 'bg-slate-50 border-brand-blue/30' : 'bg-white border-slate-200 hover:border-brand-blue hover:bg-brand-blue/5'}
            `}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <Loader2 className="animate-spin text-brand-blue" size={32} />
                                <span className="absolute text-[10px] font-black text-brand-blue">{Math.round(progress)}%</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enviando Arquivo...</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 mb-3 text-slate-400 group-hover:text-brand-blue transition-colors" />
                            <p className="mb-2 text-xs font-bold text-slate-500">
                                <span className="text-brand-blue">Clique para enviar</span> ou arraste
                            </p>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">PDF, Imagens ou Documentos</p>
                        </>
                    )}
                </div>
                {!uploading && (
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleFileChange}
                    />
                )}
            </label>
            {error && (
                <p className="mt-2 text-[10px] font-bold text-red-500 flex items-center gap-1">
                    <X size={12} /> {error}
                </p>
            )}
        </div>
    );
};
