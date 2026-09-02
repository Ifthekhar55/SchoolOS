import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Users,
  Layers,
  School,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { Class, ClassFilters, Section } from '../../types/class';
import { classApi } from '../../services/classApi';
import { schoolApi } from '../../services/schoolApi';
import { usePermissions } from '../../contexts/PermissionContext';
import { ClassStatusBadge } from './ClassStatusBadge';
import { ClassFiltersComponent } from './ClassFilters';
import { ProtectedComponent } from '../ProtectedComponent';
import { SectionList } from './SectionList';

interface ClassListProps {
  onEdit: (classItem: Class) => void;
  onView: (classItem: Class) => void;
  onCreate: () => void;
  schoolId: string;
  academicYearId?: string;
}

export const ClassList: React.FC<ClassListProps> = ({
  onEdit,
  onView,
  onCreate,
  schoolId,
  academicYearId,
}) => {
  const { hasPermission } = usePermissions();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ClassFilters>({
    page: 1,
    limit: 10,
    academicYearId: academicYearId || '',
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, Section[]>>({});

  useEffect(() => {
    loadClasses();
  }, [filters]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await classApi.getClasses(filters);
      setClasses(response.classes);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (classId: string, forceRefresh = false) => {
    if (sections[classId] && !forceRefresh) return;
    try {
      const response = await classApi.getSections(classId);
      setSections(prev => ({ ...prev, [classId]: response.sections }));
    } catch (error) {
      console.error('Failed to load sections:', error);
    }
  };

  const toggleExpand = async (classId: string) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
      await loadSections(classId);
    }
  };

  const currentPage = filters.page ?? 1;
  const pageSize = filters.limit ?? 10;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      await classApi.deleteClass(id);
      loadClasses();
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
  };

  const handleToggleStatus = async (classItem: Class) => {
    try {
      if (classItem.isActive) {
        await classApi.deactivateClass(classItem.id);
      } else {
        await classApi.activateClass(classItem.id);
      }
      loadClasses();
    } catch (error) {
      console.error('Failed to toggle class status:', error);
    }
  };

  const handleDownloadClassRoutine = async (classItem: Class) => {
    try {
      const [classData, school] = await Promise.all([
        classApi.getClass(classItem.id),
        schoolId ? schoolApi.getSchool(schoolId).catch(() => null) : Promise.resolve(null),
      ]);

      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 42;
      let y = 48;

      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 110, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.text(school?.name || 'School Name', marginX, 34);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const location = [school?.address, school?.city, school?.district].filter(Boolean).join(', ') || 'Location not available';
      pdf.text(`Location: ${location}`, marginX, 58);
      pdf.text(`Established Date: ${school?.establishedYear || '-'}`, marginX, 74);
      pdf.text(`Academic Year: ${classData.academicYear?.name || '2026-2027'}`, marginX, 90);
      pdf.text(`Class: ${classData.name === '1' ? 'One' : classData.name || 'N/A'}`, marginX, 104);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      const title = 'Class Routine';
      const titleWidth = pdf.getTextWidth(title);
      pdf.text(title, (pageWidth - titleWidth) / 2, 134);

      y = 156;

      const rows = (classData.sections && classData.sections.length > 0 ? classData.sections : [{ id: 'all', name: 'All Sections', roomNumber: '-' }]).flatMap((section: any) => {
        const sectionAssignments = (classData.classSubjects || []).filter((subject: any) => {
          if (!section || section.id === 'all') return !subject.sectionId;
          return subject.sectionId === section.id;
        });

        if (sectionAssignments.length === 0) {
          return [{
            sectionName: section.name,
            subjectName: 'No subject assigned',
            teacherName: 'TBA',
            roomNumber: section.roomNumber || '-',
          }];
        }

        return sectionAssignments.map((subject: any) => ({
          sectionName: section.name,
          subjectName: subject.subject?.name || subject.subjectName || 'Subject',
          teacherName: subject.teacher?.name || subject.teacherName || 'TBA',
          roomNumber: section.roomNumber || '-',
        }));
      });

      if (rows.length === 0) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.text('No class routine data available for this class.', marginX, y + 12);
      } else {
        const startX = marginX;
        const colWidths = [92, 152, 150, 78];
        const columns = ['Section', 'Subject', 'Teacher', 'Room'];

        pdf.setFillColor(239, 246, 255);
        pdf.roundedRect(startX - 10, y - 14, pageWidth - marginX * 2 + 20, 22, 6, 6, 'F');
        pdf.setTextColor(30, 64, 175);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);

        let x = startX;
        columns.forEach((col, index) => {
          pdf.text(col, x + 4, y + 2);
          x += colWidths[index];
        });

        y += 18;
        pdf.setDrawColor(191, 219, 254);
        pdf.line(startX, y, pageWidth - marginX, y);

        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);

        rows.forEach((row) => {
          if (y > pageHeight - 52) {
            pdf.addPage();
            y = 48;
          }

          let x = startX;
          const values = [row.sectionName, row.subjectName, row.teacherName, row.roomNumber];
          values.forEach((cell, index) => {
            pdf.text(String(cell || '-'), x + 4, y + 12);
            x += colWidths[index];
          });

          pdf.line(startX, y + 16, pageWidth - marginX, y + 16);
          y += 18;
        });
      }

      pdf.save(`class_${classData.name.replace(/\s+/g, '_').toLowerCase()}_routine.pdf`);
    } catch (error) {
      console.error('Failed to download class routine:', error);
      alert('Unable to download routine for this class.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Classes & Sections</h2>
          <p className="text-sm text-slate-500">
            Manage classes, sections, and academic structure
          </p>
        </div>
        <div className="flex gap-2">
          <ProtectedComponent permission="classes:create">
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Class
            </button>
          </ProtectedComponent>
        </div>
      </div>

      {/* Filters */}
      <ClassFiltersComponent
        filters={filters}
        onFilterChange={setFilters}
        onSearch={loadClasses}
        onReset={() => {
          setFilters({ page: 1, limit: 10, academicYearId: academicYearId || '' });
        }}
        onRefresh={loadClasses}
        isLoading={loading}
        total={total}
        schoolId={schoolId}
      />

      {/* Class Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : classes.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <School className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">No classes found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Get started by creating a new class
            </p>
            <ProtectedComponent permission="classes:create">
              <button
                onClick={onCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Class
              </button>
            </ProtectedComponent>
          </div>
        ) : (
          classes.map((classItem) => (
            <div
              key={classItem.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Class Header */}
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50" onClick={() => toggleExpand(classItem.id)}>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-700">
                    {classItem.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Class {classItem.name}
                      {classItem.nameBangla && (
                        <span className="ml-2 text-xs text-slate-500">({classItem.nameBangla})</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layers size={14} />
                        Code: {classItem.code}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {classItem.currentStudents || 0} Students
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {classItem.sections?.length || 0} Sections
                      </span>
                      {classItem.teacherName && (
                        <span>Teacher: {classItem.teacherName}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ClassStatusBadge isActive={classItem.isActive} />
                  <div className="flex items-center gap-1">
                    <ProtectedComponent permission="classes:edit">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(classItem);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <Edit size={16} />
                      </button>
                    </ProtectedComponent>
                    <ProtectedComponent permission="classes:edit">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(classItem);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        {classItem.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </ProtectedComponent>
                    <ProtectedComponent permission="classes:delete">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(classItem.id);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </ProtectedComponent>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadClassRoutine(classItem);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700"
                      title="Download class routine"
                    >
                      <Download size={14} />
                      Download Class Routine
                    </button>
                    <button className="rounded-lg p-1.5 text-slate-400">
                      {expandedClass === classItem.id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Sections */}
              {expandedClass === classItem.id && (
                <div className="border-t border-slate-100 p-4 bg-slate-50">
                  <SectionList
                    classId={classItem.id}
                    sections={sections[classItem.id] || []}
                    classSubjects={classItem.classSubjects || classItem.subjects || []}
                    onRefresh={() => loadSections(classItem.id, true)}
                    schoolId={schoolId}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="text-xs text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, total)} of {total} classes
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
  );
};