import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Download,
} from 'lucide-react';
import { Exam, ExamFilters, ExamStatus } from '../../types/exam';
import { examApi } from '../../services/examApi';
import { schoolApi } from '../../services/schoolApi';
import { usePermissions } from '../../contexts/PermissionContext';
import { useAuth } from '../../hooks/useAuth';
import { ProtectedComponent } from '../ProtectedComponent';

interface ExamListProps {
  onEdit: (exam: Exam) => void;
  onView: (exam: Exam) => void;
  onCreate: () => void;
  onMarkEntry: (exam: Exam) => void;
  onResults: (exam: Exam) => void;
  schoolId: string;
}

const statusColors: Record<ExamStatus, { bg: string; text: string; icon: any }> = {
  draft: { bg: 'bg-slate-100', text: 'text-slate-600', icon: FileText },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-600', icon: Calendar },
  ongoing: { bg: 'bg-amber-100', text: 'text-amber-600', icon: Clock },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: CheckCircle },
  published: { bg: 'bg-purple-100', text: 'text-purple-600', icon: CheckCircle },
};

const formatClassName = (className?: string) => {
  if (!className) return '-';

  const cleaned = className.replace(/^class[-\s:]*/i, '').trim();
  const normalized = cleaned.toLowerCase();
  const words: Record<string, string> = {
    '1': 'One',
    '2': 'Two',
    '3': 'Three',
    '4': 'Four',
    '5': 'Five',
    '6': 'Six',
    '7': 'Seven',
    '8': 'Eight',
    '9': 'Nine',
    '10': 'Ten',
  };

  return words[normalized] || cleaned;
};

export const ExamList: React.FC<ExamListProps> = ({
  onEdit,
  onView,
  onCreate,
  onMarkEntry,
  onResults,
  schoolId,
}) => {
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ExamFilters>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadExams();
  }, [filters]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examApi.getExams(filters);
      setExams(response.exams);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await examApi.deleteExam(id);
      setExams((prev) => prev.filter((exam) => exam.id !== id));
      setTotal((prev) => Math.max(prev - 1, 0));
      setOpenMenuId(null);
    } catch (error) {
      console.error('Failed to delete exam:', error);
    }
  };

  const handleDownloadCombinedRoutine = async () => {
    try {
      const school = schoolId ? await schoolApi.getSchool(schoolId).catch(() => null) : null;
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = 48;

      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 112, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(school?.name || 'School Name', 42, 32);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const location = [school?.address, school?.city, school?.district].filter(Boolean).join(', ') || 'Location not available';
      pdf.text(`Location: ${location}`, 42, 56);
      pdf.text(`Established Date: ${school?.establishedYear || '-'}`, 42, 72);

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      const titleText = 'MidTerm Exam Routine';
      const titleWidth = pdf.getTextWidth(titleText);
      pdf.text(titleText, (pageWidth - titleWidth) / 2, 130);

      y = 152;

      const rows = exams
        .flatMap((exam) => {
          const className = formatClassName(exam.className || 'Class');
          const sectionName = exam.sectionName || 'All Sections';

          return (exam.subjects || []).map((subject: any) => ({
            className,
            sectionName,
            subjectName: subject.subjectName || subject.subject?.name || 'Subject',
            date: subject.date ? new Date(subject.date) : null,
            time: subject.time || '-',
            room: subject.room || '-',
          }));
        })
        .sort((a, b) => {
          const aTime = a.date ? a.date.getTime() : Number.MAX_SAFE_INTEGER;
          const bTime = b.date ? b.date.getTime() : Number.MAX_SAFE_INTEGER;
          return aTime - bTime;
        });

      if (rows.length === 0) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.text('No exam routine available.', 42, y + 16);
      } else {
        const startX = 42;
        const colWidths = [90, 90, 90, 70, 70, 120];
        const columns = ['Class', 'Section', 'Date', 'Time', 'Room', 'Subject'];

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        let x = startX;
        columns.forEach((col) => {
          pdf.text(col, x + 4, y);
          x += colWidths[columns.indexOf(col)];
        });

        y += 12;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);

        rows.forEach((row) => {
          if (y > pageHeight - 54) {
            pdf.addPage();
            y = 48;
          }

          let x = startX;
          const values = [
            row.className,
            row.sectionName,
            row.date ? row.date.toLocaleDateString() : '-',
            row.time,
            row.room,
            row.subjectName,
          ];

          values.forEach((cell, cellIndex) => {
            pdf.text(String(cell || '-'), x + 4, y + 12);
            x += colWidths[cellIndex];
          });

          pdf.setDrawColor(226, 232, 240);
          pdf.line(startX, y + 16, pageWidth - 42, y + 16);
          y += 18;
        });
      }

      pdf.save('midterm_exam_routine.pdf');
      setOpenMenuId(null);
    } catch (error) {
      console.error('Failed to download combined exam routine:', error);
    }
  };

  const currentPage = filters.page ?? 1;
  const pageSize = filters.limit ?? 10;

  const StatusBadge = ({ status }: { status: ExamStatus }) => {
    const config = statusColors[status];
    const Icon = config?.icon || FileText;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config?.bg || 'bg-slate-100'} ${config?.text || 'text-slate-600'}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Exams</h2>
          <p className="text-sm text-slate-500">
            Manage exams, enter marks, and publish results
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCombinedRoutine}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download size={18} />
            Download Routine
          </button>
          <ProtectedComponent permission="exams:create" fallback={null}>
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Exam
            </button>
          </ProtectedComponent>
        </div>
      </div>

      {/* Exam Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : exams.length === 0 ? (
          <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">No exams found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create your first exam to get started
            </p>
            <ProtectedComponent permission="exams:create" fallback={null}>
              <button
                onClick={onCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={18} />
                Create Exam
              </button>
            </ProtectedComponent>
          </div>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {exam.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {exam.code} • Class {formatClassName(exam.className)}
                    {exam.sectionName && ` - ${exam.sectionName}`}
                  </p>
                </div>
                <StatusBadge status={exam.status} />
              </div>

              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Type</span>
                  <span className="font-medium text-slate-700 capitalize">
                    {exam.type?.replace('_', ' ') || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-700">
                    {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Subjects</span>
                  <span className="font-medium text-slate-700">
                    {exam.subjects?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Marks</span>
                  <span className="font-medium text-slate-700">
                    {exam.totalMarks || 0}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onView(exam)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>

                  {user?.role !== 'teacher' && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === exam.id ? null : exam.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        title="More actions"
                        aria-label="More actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {openMenuId === exam.id && (
                        <div className="absolute left-1/2 top-full z-10 mt-1 w-36 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                          <ProtectedComponent permission="exams:edit" fallback={null}>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                onEdit(exam);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                          </ProtectedComponent>
                          <ProtectedComponent permission="exams:delete" fallback={null}>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDelete(exam.id);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </ProtectedComponent>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {(exam.status === 'draft' || exam.status === 'scheduled' || exam.status === 'ongoing') && (
                    <button
                      onClick={() => onMarkEntry(exam)}
                      className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                    >
                      Enter Marks
                    </button>
                  )}
                  {(exam.status === 'completed' || exam.status === 'published') && (
                    <button
                      onClick={() => onResults(exam)}
                      className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100"
                    >
                      Results
                    </button>
                  )}
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
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, total)} of {total} exams
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