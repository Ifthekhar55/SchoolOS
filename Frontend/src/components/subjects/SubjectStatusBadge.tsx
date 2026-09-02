import React from 'react';
import { CheckCircle, XCircle, BookOpen } from 'lucide-react';

interface SubjectStatusBadgeProps {
  isActive: boolean;
  isCompulsory?: boolean;
  className?: string;
}

export const SubjectStatusBadge: React.FC<SubjectStatusBadgeProps> = ({
  isActive,
  isCompulsory = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isCompulsory && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
          <BookOpen size={12} />
          Compulsory
        </span>
      )}
      {!isActive ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
          <XCircle size={14} />
          Inactive
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          <CheckCircle size={14} />
          Active
        </span>
      )}
    </div>
  );
};