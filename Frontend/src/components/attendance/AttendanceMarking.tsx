import React, { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  RefreshCw,
  Bell,
  BookOpen,
  MoreVertical,
} from 'lucide-react';
import { AttendanceStatus, DailyAttendance, ClassAttendance } from '../../types/attendance';
import { attendanceApi } from '../../services/attendanceApi';
import { classApi } from '../../services/classApi';
import { teacherApi } from '../../services/teacherApi';
import { studentApi } from '../../services/studentApi';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../contexts/PermissionContext';

interface AttendanceMarkingProps {
  classId?: string;
  sectionId?: string;
  date?: Date;
  onSuccess?: () => void;
}

export const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({
  classId: initialClassId,
  sectionId: initialSectionId,
  date: initialDate,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState(initialClassId || '');
  const [selectedSection, setSelectedSection] = useState(initialSectionId || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [openActionsStudentId, setOpenActionsStudentId] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    total: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
  } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadSections();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection && selectedDate) {
      loadStudents();
      loadExistingAttendance();
    }
  }, [selectedClass, selectedSection, selectedDate, classes, sections]);

  const loadClasses = async () => {
    try {
      const [response, teacherClasses] = await Promise.all([
        classApi.getClasses({ page: 1, limit: 999 }),
        teacherApi.getMyClasses(),
      ]);
      setClasses(response.classes || []);
      const assignedClass = teacherClasses.find((classItem) => classItem.id === selectedClass);
      const assignedSectionSubjects = assignedClass?.classSubjects
        .filter((assignment) => assignment.sectionId === selectedSection)
        .map((assignment) => assignment.subject) || [];
      setAssignedSubjects(Array.from(
        new Map(assignedSectionSubjects.map((subject) => [subject.id, subject])).values()
      ));
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const loadSections = async () => {
    try {
      if (!selectedClass) {
        setSections([]);
        return;
      }
      const response = await classApi.getSections(selectedClass);
      setSections(response.sections || []);
    } catch (error) {
      console.error('Failed to load sections:', error);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const selectedClassName = classes.find((classItem) => classItem.id === selectedClass)?.name;
      const selectedSectionName = sections.find((section) => section.id === selectedSection)?.name;
      const data = await studentApi.getStudents({
        class: selectedClassName,
        section: selectedSectionName,
        limit: 999,
      });
      setStudents(data.students || []);
      
      // Initialize attendance status for all students
      const initialAttendance: Record<string, AttendanceStatus> = {};
      data.students.forEach((student: any) => {
        initialAttendance[student.id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Failed to load students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      setAssignedSubjects([]);
      setSelectedSubjectId('');
      return;
    }
    const loadAssignedSubjects = async () => {
      try {
        const teacherClasses = await teacherApi.getMyClasses();
        const assignedClass = teacherClasses.find((classItem) => classItem.id === selectedClass);
        const subjects = assignedClass?.classSubjects
          .filter((assignment) => assignment.sectionId === selectedSection)
          .map((assignment) => assignment.subject) || [];
        setAssignedSubjects(Array.from(new Map(subjects.map((subject) => [subject.id, subject])).values()));
        setSelectedSubjectId((currentSubjectId) =>
          subjects.some((subject) => subject.id === currentSubjectId) ? currentSubjectId : ''
        );
      } catch (loadError) {
        console.error('Failed to load assigned subjects:', loadError);
        setAssignedSubjects([]);
      }
    };
    loadAssignedSubjects();
  }, [selectedClass, selectedSection]);

  const loadExistingAttendance = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const existing = await attendanceApi.getClassAttendance(
        selectedClass,
        selectedSection,
        dateStr
      );

      if (existing && existing.students) {
        const existingAttendance: Record<string, AttendanceStatus> = {};
        const existingRemarks: Record<string, string> = {};
        existing.students.forEach((record: any) => {
          existingAttendance[record.studentId] = record.status;
          existingRemarks[record.studentId] = record.remarks || '';
        });
        setAttendance(existingAttendance);
        setRemarks(existingRemarks);
        setSummary({
          total: existing.totalStudents,
          present: existing.present,
          absent: existing.absent,
          late: existing.late,
          leave: existing.leave,
        });
      }
    } catch (error) {
      console.error('Failed to load existing attendance:', error);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    
    // Update summary
    const newSummary = calculateSummary();
    setSummary(newSummary);
  };

  const calculateSummary = () => {
    const total = students.length;
    let present = 0,
      absent = 0,
      late = 0,
      leave = 0;

    Object.values(attendance).forEach(status => {
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'leave') leave++;
    });

    return { total, present, absent, late, leave };
  };

  const handleBulkUpdate = (status: AttendanceStatus) => {
    const newAttendance: Record<string, AttendanceStatus> = {};
    students.forEach((student: any) => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
    setSummary(calculateSummary());
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSection) {
      setError('Please select a class and section');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const records = students.map((student: any) => ({
        studentId: student.id,
        status: attendance[student.id] || 'present',
        remarks: remarks[student.id] || '',
      }));

      await attendanceApi.markAttendance({
        classId: selectedClass,
        sectionId: selectedSection,
        date: selectedDate,
        records,
      });

      await loadExistingAttendance();
      setSuccess('Attendance marked successfully!');
      onSuccess?.();

      // Send notifications for absent students
      const absentStudents = records.filter(r => r.status === 'absent');
      if (absentStudents.length > 0 && hasPermission('attendance:report')) {
        await attendanceApi.sendBulkAbsentNotification(
          selectedClass,
          selectedSection,
          selectedDate.toISOString().split('T')[0]
        );
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusCount = (status: AttendanceStatus) => {
    return Object.values(attendance).filter(s => s === status).length;
  };

  const statusOptions: { value: AttendanceStatus; label: string; icon: any; color: string }[] = [
    { value: 'present', label: 'Present', icon: CheckCircle, color: 'emerald' },
    { value: 'absent', label: 'Absent', icon: XCircle, color: 'red' },
    { value: 'late', label: 'Late', icon: Clock, color: 'amber' },
    { value: 'leave', label: 'On Leave', icon: Calendar, color: 'blue' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mark Attendance</h2>
          <p className="text-sm text-slate-500">
            Mark daily attendance for students
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadExistingAttendance()}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {selectedClass && selectedSection && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <BookOpen size={17} className="text-blue-600" />
            Assigned Subjects
          </h3>
          {assignedSubjects.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
              No subjects assigned to this section.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {assignedSubjects.map((subject) => (
                <button
                  type="button"
                  key={subject.id}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={`flex min-h-24 items-center rounded-xl border p-4 text-left shadow-sm transition-colors ${
                    selectedSubjectId === subject.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <span className="text-base font-semibold text-slate-900">{subject.name}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Class <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                Class {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Section <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select Section</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                Section {section.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setSelectedClass('');
              setSelectedSection('');
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Summary */}
      {summary && selectedClass && selectedSection && (
        <div className="grid gap-4 sm:grid-cols-5">
          <div className="rounded-lg bg-slate-50 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
            <p className="text-xs text-slate-500">Total Students</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{summary.present}</p>
            <p className="text-xs text-emerald-600">Present</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
            <p className="text-xs text-red-600">Absent</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{summary.late}</p>
            <p className="text-xs text-amber-600">Late</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{summary.leave}</p>
            <p className="text-xs text-blue-600">On Leave</p>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedClass && selectedSection && students.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-4">
          <span className="text-sm font-medium text-slate-700">Bulk Update:</span>
          {statusOptions.map(({ value, label, icon: Icon, color }) => (
            <button
              key={value}
              onClick={() => handleBulkUpdate(value)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-${color}-600 bg-${color}-50 hover:bg-${color}-100 transition-colors`}
            >
              <Icon size={14} />
              Mark All {label}
            </button>
          ))}
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600 border border-emerald-200">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Attendance Table */}
      {selectedClass && selectedSection && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            Students in selected class and section
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">No students found in this class/section</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                      Roll
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: any) => (
                    <tr
                      key={student.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {student.nameBangla || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`min-w-9 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                              attendance[student.id] === 'absent'
                                ? 'bg-red-500 text-white'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`min-w-9 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                              attendance[student.id] === 'present'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            P
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={remarks[student.id] || ''}
                            onChange={(e) => {
                              setRemarks(prev => ({
                                ...prev,
                                [student.id]: e.target.value,
                              }));
                            }}
                            placeholder="Add remarks..."
                            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                          />
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenActionsStudentId(
                                openActionsStudentId === student.id ? null : student.id
                              )}
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Attendance actions"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openActionsStudentId === student.id && (
                              <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleStatusChange(student.id, 'late');
                                    setOpenActionsStudentId(null);
                                  }}
                                  className="block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  Mark as late
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleStatusChange(student.id, 'leave');
                                    setOpenActionsStudentId(null);
                                  }}
                                  className="block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  Mark as leave
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      {selectedClass && selectedSection && selectedSubjectId && students.length > 0 && (
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Attendance
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};