import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  FileText,
  Users,
  Calendar,
} from 'lucide-react';
import { Notice, NoticeType, NoticePriority, NoticeFilters } from '../../types/notice';
import { noticeApi } from '../../services/noticeApi';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import { NoticeStatusBadge, PriorityBadge } from './NoticeStatusBadge';
import { ProtectedComponent } from '../ProtectedComponent';

interface NoticeListProps {
  onEdit: (notice: Notice) => void;
  onView: (notice: Notice) => void;
  onCreate: () => void;
}

const typeColors: Record<NoticeType, string> = {
  general: 'bg-slate-100 text-slate-600',
  academic: 'bg-blue-100 text-blue-600',
  fee: 'bg-emerald-100 text-emerald-600',
  emergency: 'bg-red-100 text-red-600',
  event: 'bg-purple-100 text-purple-600',
};

const typeLabels: Record<NoticeType, string> = {
  general: 'General',
  academic: 'Academic',
  fee: 'Fee',
  emergency: 'Emergency',
  event: 'Event',
};

type NoticeListFilterState = Omit<NoticeFilters, 'type' | 'priority' | 'status' | 'page' | 'limit'> & {
  type: '' | NoticeType;
  priority: '' | NoticePriority;
  status: '' | NoticeFilters['status'];
  page: number;
  limit: number;
};

export const NoticeList: React.FC<NoticeListProps> = ({
  onEdit,
  onView,
  onCreate,
}) => {
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<NoticeListFilterState>({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    priority: '',
    status: '',
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadNotices();
  }, [filters]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const response = await noticeApi.getNotices({
        ...filters,
        type: filters.type || undefined,
        priority: filters.priority || undefined,
        status: filters.status || undefined,
        search: searchTerm || undefined,
      });
      setNotices(response.notices);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await noticeApi.deleteNotice(id);
      loadNotices();
    } catch (error) {
      console.error('Failed to delete notice:', error);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await noticeApi.publishNotice(id);
      loadNotices();
    } catch (error) {
      console.error('Failed to publish notice:', error);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await noticeApi.unpublishNotice(id);
      loadNotices();
    } catch (error) {
      console.error('Failed to unpublish notice:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await noticeApi.archiveNotice(id);
      loadNotices();
    } catch (error) {
      console.error('Failed to archive notice:', error);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Notices</h2>
          <p className="text-sm text-slate-500">
            Manage school announcements and notices
          </p>
        </div>
        <ProtectedComponent permission="notices:create" fallback={null}>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Notice
          </button>
        </ProtectedComponent>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadNotices()}
              placeholder="Search by title..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value as NoticeListFilterState['type'] })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value as NoticeListFilterState['priority'] })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as NoticeListFilterState['status'] })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
          <option value="expired">Expired</option>
        </select>
        <button
          onClick={loadNotices}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Apply
        </button>
      </div>

      {/* Notice List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : notices.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">No notices found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create your first notice to get started
            </p>
            <ProtectedComponent permission="notices:create" fallback={null}>
              <button
                onClick={onCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={18} />
                Create Notice
              </button>
            </ProtectedComponent>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {notice.title}
                    </h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[notice.type]}`}>
                      {typeLabels[notice.type]}
                    </span>
                    <PriorityBadge priority={notice.priority} />
                    <NoticeStatusBadge status={notice.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {notice.content}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(notice.publishedAt)}
                    </span>
                    {notice.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Expires: {formatDate(notice.expiresAt)}
                      </span>
                    )}
                    {notice.targetClasses && notice.targetClasses.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {notice.targetClasses.length} class(es)
                      </span>
                    )}
                    {notice.attachments && notice.attachments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {notice.attachments.length} attachment(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onView(notice)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  {!(user?.role === 'teacher' && notice.creatorRole === 'school_admin') && (
                    <ProtectedComponent permission="notices:edit" fallback={null}>
                      <button
                        onClick={() => onEdit(notice)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                    </ProtectedComponent>
                  )}
                  <ProtectedComponent permission="notices:publish" fallback={null}>
                    {notice.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(notice.id)}
                        className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
                        title="Publish"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {notice.status === 'published' && (
                      <button
                        onClick={() => handleUnpublish(notice.id)}
                        className="rounded-lg p-1.5 text-amber-400 hover:bg-amber-50 hover:text-amber-600"
                        title="Unpublish"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </ProtectedComponent>
                  <ProtectedComponent permission="notices:archive" fallback={null}>
                    {notice.status !== 'archived' && (
                      <button
                        onClick={() => handleArchive(notice.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        title="Archive"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                  </ProtectedComponent>
                  <ProtectedComponent permission="notices:delete" fallback={null}>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </ProtectedComponent>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="text-xs text-slate-500">
            Showing {(filters.page - 1) * filters.limit + 1} to{' '}
            {Math.min(filters.page * filters.limit, total)} of {total} notices
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-sm">
              Page {filters.page} of {totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};