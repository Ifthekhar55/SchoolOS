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
  MoreVertical,
  FileText,
} from 'lucide-react';
import { Student, StudentFilters } from '../../types/student';
import { studentApi } from '../../services/studentApi';
import { usePermissions } from '../../contexts/PermissionContext';
import { StudentStatusBadge } from './StudentStatusBadge';
import { StudentFiltersComponent } from './StudentFilters';
import { ProtectedComponent } from '../ProtectedComponent';

interface StudentListProps {
  onEdit: (student: Student) => void;
  onView: (student: Student) => void;
  onCreate: () => void;
  onImport: () => void;
  schoolId: string;
  showControls?: boolean;
  filters?: StudentFilters;
  onFilterChange?: (filters: StudentFilters) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  onEdit,
  onView,
  onCreate,
  onImport,
  schoolId,
  showControls = true,
  filters: controlledFilters,
  onFilterChange,
}) => {
  const { hasPermission } = usePermissions();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalFilters, setInternalFilters] = useState<StudentFilters>({
    page: 1,
    limit: 10,
  });
  const filters = controlledFilters ?? internalFilters;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    loadStudents();
  }, [filters]);

  const updateFilters = (nextFilters: StudentFilters) => {
    if (onFilterChange) {
      onFilterChange(nextFilters);
      return;
    }
    setInternalFilters(nextFilters);
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getStudents(filters);
      setStudents(response.students);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentApi.deleteStudent(id);
      loadStudents();
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  const handleToggleStatus = async (student: Student) => {
    try {
      if (student.isActive) {
        await studentApi.deactivateStudent(student.id);
      } else {
        await studentApi.activateStudent(student.id);
      }
      loadStudents();
    } catch (error) {
      console.error('Failed to toggle student status:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedStudents.length} students?`)) return;
    try {
      await studentApi.bulkDelete(selectedStudents);
      setSelectedStudents([]);
      loadStudents();
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await studentApi.exportStudents(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const currentPage = filters.page ?? 1;
  const pageSize = filters.limit ?? 10;

  return (
    <div className="space-y-4">
      {showControls && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Students</h2>
              <p className="text-sm text-slate-500">
                Manage student records and information
              </p>
            </div>
            <div className="flex gap-2">
              <ProtectedComponent permission="students:import">
                <button
                  onClick={onImport}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <FileText size={18} />
                  Import
                </button>
              </ProtectedComponent>
              <ProtectedComponent permission="students:create">
                <button
                  onClick={onCreate}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  <Plus size={18} />
                  Add Student
                </button>
              </ProtectedComponent>
            </div>
          </div>

          <StudentFiltersComponent
            filters={filters}
            onFilterChange={updateFilters}
            onSearch={loadStudents}
            onReset={() => {
              updateFilters({ page: 1, limit: 10 });
              setSelectedStudents([]);
            }}
            onExport={handleExport}
            onImport={onImport}
            onRefresh={loadStudents}
            isLoading={loading}
            total={total}
          />
        </>
      )}

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
          <span className="text-sm text-blue-700">
            {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedStudents([])}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Clear
          </button>
        </div>
      )}

      {/* Student Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === students.length && students.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(students.map(s => s.id));
                      } else {
                        setSelectedStudents([]);
                      }
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Class
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Roll
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Parents
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
                      Loading students...
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {student.nameBangla || ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      Class {student.class}
                      {student.section && `-${student.section}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {student.rollNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <p className="text-slate-700">F: {student.fatherName}</p>
                        <p className="text-slate-500">M: {student.motherName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StudentStatusBadge 
                        isActive={student.isActive}
                        isVerified={student.isVerified}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(student)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <ProtectedComponent permission="students:edit">
                          <button
                            onClick={() => onEdit(student)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        </ProtectedComponent>
                        <ProtectedComponent permission="students:edit">
                          <button
                            onClick={() => handleToggleStatus(student)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title={student.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {student.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                        </ProtectedComponent>
                        <ProtectedComponent permission="students:delete">
                          <button
                            onClick={() => handleDelete(student.id)}
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
              {Math.min(currentPage * pageSize, total)} of {total} students
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => updateFilters({ ...filters, page: currentPage - 1 })}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => updateFilters({ ...filters, page: currentPage + 1 })}
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