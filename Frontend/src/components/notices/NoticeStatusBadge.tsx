import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Archive, 
  AlertCircle,
  XCircle 
} from 'lucide-react';
import { NoticeStatus, NoticePriority } from '../../types/notice';

interface NoticeStatusBadgeProps {
  status: NoticeStatus;
  className?: string;
}

const statusConfig: Record<NoticeStatus, { icon: any; label: string; color: string; bg: string }> = {
  draft: {
    icon: FileText,
    label: 'Draft',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
  published: {
    icon: CheckCircle,
    label: 'Published',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  archived: {
    icon: Archive,
    label: 'Archived',
    color: 'text-slate-500',
    bg: 'bg-slate-100',
  },
  expired: {
    icon: XCircle,
    label: 'Expired',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
};

export const NoticeStatusBadge: React.FC<NoticeStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const config = statusConfig[status];
  const Icon = config?.icon || FileText;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config?.bg || 'bg-slate-100'} ${config?.color || 'text-slate-600'} ${className}`}
    >
      <Icon size={12} />
      {config?.label || status}
    </span>
  );
};

// Priority Badge
interface PriorityBadgeProps {
  priority: NoticePriority;
  className?: string;
}

const priorityConfig: Record<NoticePriority, { label: string; color: string; bg: string }> = {
  low: {
    label: 'Low',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  high: {
    label: 'High',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className = '',
}) => {
  const config = priorityConfig[priority];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config?.bg || 'bg-slate-100'} ${config?.color || 'text-slate-600'} ${className}`}
    >
      <div className={`h-1.5 w-1.5 rounded-full ${priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
      {config?.label || priority}
    </span>
  );
};