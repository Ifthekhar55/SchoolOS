import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { AttendanceStatus } from '../../types/attendance';

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<AttendanceStatus, { icon: any; label: string; color: string; bg: string }> = {
  present: {
    icon: CheckCircle,
    label: 'Present',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  absent: {
    icon: XCircle,
    label: 'Absent',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  late: {
    icon: Clock,
    label: 'Late',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  leave: {
    icon: AlertCircle,
    label: 'On Leave',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  holiday: {
    icon: Calendar,
    label: 'Holiday',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
};

export const AttendanceStatusBadge: React.FC<AttendanceStatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const config = statusConfig[status];
  const Icon = config?.icon || CheckCircle;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-4 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config?.bg || 'bg-slate-50'} ${config?.color || 'text-slate-600'} ${sizeClasses[size]} ${className}`}
    >
      <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
      {config?.label || status}
    </span>
  );
};