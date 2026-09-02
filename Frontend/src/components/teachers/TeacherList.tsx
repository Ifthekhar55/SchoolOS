import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react';
import { Teacher, TeacherFilters } from '../../types/teacher';
import { teacherApi } from '../../services/teacherApi';
import { usePermissions } from '../../contexts/PermissionContext';
import { TeacherStatusBadge } from './TeacherStatusBadge';
import { TeacherFiltersComponent } from './TeacherFilters';
import { ProtectedComponent } from '../ProtectedComponent';

interface TeacherListProps {
  onEdit: (teacher: Teacher) => void;
  onView: (teacher: Teacher) => void;
  onCreate: () => void;
  onImport: () => void;
  schoolId: string;
}

export const TeacherList: React.FC<TeacherListProps> = ({
  onEdit,
  onView,
  onCreate,
  onImport,
  schoolId,
}) => {
  const { hasPermission } = usePermissions();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TeacherFilters>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

  useEffect(() => {
    loadTeachers();
  }, [filters]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherApi.getTeachers(filters);
      setTeachers(response.teachers);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await teacherApi.deleteTeacher(id);
      loadTeachers();
    } catch (error) {
      console.error('Failed to delete teacher:', error);
    }
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    try {
      if (teacher.isActive) {
        await teacherApi.deactivateTeacher(teacher.id);
      } else {
        await teacherApi.activateTeacher(teacher.id);
      }
      loadTeachers();
    } catch (error) {
      console.error('Failed to toggle teacher status:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedTeachers.length} teachers?`)) return;
    try {
      await teacherApi.bulkDelete(selectedTeachers);
      setSelectedTeachers([]);
      loadTeachers();
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await teacherApi.exportTeachers(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teachers_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const currentPage = filters.page ?? 1;
  const pageSize = filters.limit ?? 10;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Teachers</h2>
          <p className="text-sm text-slate-500">
            Manage teacher records and information
          </p>
        </div>
        <div className="flex gap-2">
          <ProtectedComponent permission="teachers:create">
            <button
              onClick={onImport}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Plus size={18} />
              Import
            </button>
          </ProtectedComponent>
          <ProtectedComponent permission="teachers:create">
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Teacher
            </button>
          </ProtectedComponent>
        </div>
      </div>

      {/* Filters */}
      <TeacherFiltersComponent
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => {
          setFilters({ page: 1, limit: 10 });
          setSelectedTeachers([]);
        }}
        onExport={handleExport}
        onImport={onImport}
        onRefresh={loadTeachers}
        isLoading={loading}
        total={total}
      />

      {/* Bulk Actions */}
      {selectedTeachers.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
          <span className="text-sm text-blue-700">
            {selectedTeachers.length} teacher{selectedTeachers.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedTeachers([])}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Clear
          </button>
        </div>
      )}

      {/* Teacher Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTeachers.length === teachers.length && teachers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTeachers(teachers.map(t => t.id));
                      } else {
                        setSelectedTeachers([]);
                      }
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Teacher
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Designation
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      Loading teachers...
                    </div>
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    No teachers found
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTeachers.includes(teacher.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeachers([...selectedTeachers, teacher.id]);
                          } else {
                            setSelectedTeachers(selectedTeachers.filter(id => id !== teacher.id));
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {teacher.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {teacher.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {teacher.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {teacher.department}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {teacher.designation}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {teacher.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TeacherStatusBadge 
                        isActive={teacher.isActive}
                        isVerified={teacher.isVerified}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(teacher)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <ProtectedComponent permission="teachers:edit">
                          <button
                            onClick={() => onEdit(teacher)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        </ProtectedComponent>
                        <ProtectedComponent permission="teachers:edit">
                          <button
                            onClick={() => handleToggleStatus(teacher)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title={teacher.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {teacher.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                        </ProtectedComponent>
                        <ProtectedComponent permission="teachers:delete">
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </ProtectedComponent>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <div className="text-xs text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, total)} of {total} teachers
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setFilters({ ...filters, page: currentPage - 1 })}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: currentPage + 1 })}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};