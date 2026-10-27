import React from 'react';
import { IngestionStatus } from '../../types';
import {
  FileText,
  Send,
  Search,
  AlertCircle,
  CheckCircle,
  Globe,
  XCircle,
  Archive
} from 'lucide-react';

interface IngestionStatusBadgeProps {
  status: IngestionStatus;
  className?: string;
}

export const IngestionStatusBadge: React.FC<IngestionStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case IngestionStatus.DRAFT:
        return {
          label: 'Rascunho',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <FileText size={12} className="mr-1" />
        };
      case IngestionStatus.SUBMITTED:
        return {
          label: 'Enviado',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Send size={12} className="mr-1" />
        };
      case IngestionStatus.IN_REVIEW:
        return {
          label: 'Em Análise',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Search size={12} className="mr-1" />
        };
      case IngestionStatus.NEEDS_CORRECTION:
        return {
          label: 'Ajuste Necessário',
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: <AlertCircle size={12} className="mr-1" />
        };
      case IngestionStatus.APPROVED:
        return {
          label: 'Aprovado',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle size={12} className="mr-1" />
        };
      case IngestionStatus.PUBLISHED:
        return {
          label: 'Publicado',
          bg: 'bg-teal-100 text-teal-800 border-teal-300',
          icon: <Globe size={12} className="mr-1" />
        };
      case IngestionStatus.REJECTED:
        return {
          label: 'Rejeitado',
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: <XCircle size={12} className="mr-1" />
        };
      case IngestionStatus.ARCHIVED:
        return {
          label: 'Arquivado',
          bg: 'bg-zinc-100 text-zinc-600 border-zinc-200',
          icon: <Archive size={12} className="mr-1" />
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: null
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.bg} ${className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export default IngestionStatusBadge;
