import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StudentStatusBadgeProps {
  isActive: boolean;
  isVerified?: boolean;
  className?: string;
}

export const StudentStatusBadge: React.FC<StudentStatusBadgeProps> = ({
  isActive,
  isVerified = false,
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

  if (!isVerified) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-600 ${className}`}>
        <Clock size={14} />
        Pending
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