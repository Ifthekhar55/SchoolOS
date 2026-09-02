import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  Tag,
  FileText,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Notice } from '../../types/notice';
import { NoticeStatusBadge, PriorityBadge } from './NoticeStatusBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { ProtectedComponent } from '../ProtectedComponent';
import { useAuth } from '../../hooks/useAuth';

interface NoticeDetailsProps {
  notice: Notice;
  onClose: () => void;
  onEdit: () => void;
}

const typeLabels: Record<string, string> = {
  general: 'General',
  academic: 'Academic',
  fee: 'Fee',
  emergency: 'Emergency',
  event: 'Event',
};

export const NoticeDetails: React.FC<NoticeDetailsProps> = ({
  notice,
  onClose,
  onEdit,
}) => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{notice.title}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>{typeLabels[notice.type] || notice.type}</span>
                <span>•</span>
                <span>{formatDate(notice.createdAt)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <NoticeStatusBadge status={notice.status} />
            <PriorityBadge priority={notice.priority} />
            {notice.isPublished && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                <CheckCircle size={12} />
                Published
              </span>
            )}
          </div>

          {/* Content */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">Content</h3>
            <div className="rounded-lg bg-slate-50 p-4 whitespace-pre-wrap text-sm text-slate-800">
              {notice.content}
            </div>
            {notice.contentBangla && (
              <div className="mt-2 rounded-lg bg-slate-50 p-4 whitespace-pre-wrap text-sm text-slate-800" dir="rtl">
                {notice.contentBangla}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Published At</p>
              <p className="text-sm text-slate-900">{formatDate(notice.publishedAt)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Expires At</p>
              <p className="text-sm text-slate-900">{formatDate(notice.expiresAt) || 'Never'}</p>
            </div>
            {notice.targetClasses && notice.targetClasses.length > 0 && (
              <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Users size={14} />
                  Target Audience
                </p>
                <p className="text-sm text-slate-900">
                  {notice.targetClasses.map(c => `Class ${c}`).join(', ')}
                  {notice.targetSections && notice.targetSections.length > 0 && 
                    ` (Sections: ${notice.targetSections.join(', ')})`}
                </p>
              </div>
            )}
          </div>

          {/* Attachments */}
          {notice.attachments && notice.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Attachments</h3>
              <div className="space-y-2">
                {notice.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{attachment}</span>
                    </div>
                    <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <div className="text-xs text-slate-400">
            Created: {formatDate(notice.createdAt)}
            {notice.updatedAt && ` • Updated: ${formatDate(notice.updatedAt)}`}
          </div>
          <div className="flex gap-2">
            {!(user?.role === 'teacher' && notice.creatorRole === 'school_admin') && (
              <ProtectedComponent permission="notices:edit" fallback={null}>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Edit size={16} />
                  Edit Notice
                </button>
              </ProtectedComponent>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};