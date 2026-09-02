import React from 'react';
import { CheckCircle, XCircle, Users, Layers } from 'lucide-react';

interface ClassStatusBadgeProps {
  isActive: boolean;
  type?: 'class' | 'section';
  className?: string;
}

export const ClassStatusBadge: React.FC<ClassStatusBadgeProps> = ({
  isActive,
  type = 'class',
  className = '',
}) => {
  if (!isActive) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 ${className}`}>
        <XCircle size={14} />
        Inactive
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 ${className}`}>
      <CheckCircle size={14} />
      Active
    </span>
  );
};