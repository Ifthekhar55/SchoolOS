import React, { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Search,
  BookOpen,
} from 'lucide-react';
import { MarkEntry } from '../../types/exam';
import { examApi } from '../../services/examApi';
import { studentApi } from '../../services/studentApi';

interface MarkEntryProps {
  examId: string;
  subjects: any[];
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  initialSubjectId?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const MarkEntryComponent: React.FC<MarkEntryProps> = ({
  examId,
  subjects,
  classId,
  className,
  sectionId,
  sectionName,
  initialSubjectId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const getSubjectId = (subject: any) => subject?.subjectId || subject?.id || subject?.subject?.id || '';
  const getSubjectName = (subject: any) => subject?.subjectName || subject?.subject?.name || subject?.name || 'Subject';

  useEffect(() => {
    if (subjects.length > 0) {
      const firstSubjectId = initialSubjectId || getSubjectId(subjects[0]);
      setSelectedSubjectId(firstSubjectId);
    }
  }, [subjects, initialSubjectId]);

  useEffect(() => {
    if (!selectedSubjectId) return;
    loadData();
  }, [selectedSubjectId, examId, classId, sectionId, subjects]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const subject = subjects.find((item) => getSubjectId(item) === selectedSubjectId) || subjects[0];
      setSelectedSubject(subject);

      const response = await studentApi.getStudents({
        class: className || undefined,
        section: sectionName || undefined,
        limit: 500,
      });

      const classStudents = (response.students || []).filter((student: any) => {
        if (classId && student.class !== className) return false;
        if (sectionId && student.section !== sectionName) return false;
        return true;
      });

      setStudents(classStudents);

      const subjectId = getSubjectId(subject);
      if (!subjectId) throw new Error('Subject not found');
      const markResponse = await examApi.getMarks(examId, subjectId);

      const studentMarks = classStudents.map((student: any) => {
        const mark = (markResponse || []).find((item: any) => item.studentId === student.id);
        return {
          id: mark?.id || '',
          examId,
          subjectId: getSubjectId(subject),
          studentId: student.id,
          studentName: student.name,
          studentRoll: student.rollNumber,
          marksObtained: mark?.marksObtained ?? 0,
          fullMarks: Number(subject.fullMarks || 0),
          percentage: mark?.percentage ?? 0,
          grade: mark?.grade || '',
          gradePoint: mark?.gradePoint || 0,
          isPassed: mark?.isPassed ?? false,
          remarks: mark?.remarks || '',
        } as MarkEntry;
      });

      setMarks(studentMarks);
    } catch (err) {
      console.error('Failed to load mark entry data:', err);
      setError('Failed to load students and marks data');
      setMarks([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);
    setMarks(prev =>
      prev.map(m =>
        m.studentId === studentId
          ? {
              ...m,
              marksObtained: isNaN(numValue) ? 0 : Math.min(numValue, m.fullMarks || 100),
              percentage: isNaN(numValue)
                ? 0
                : ((Math.min(numValue, m.fullMarks || 100) / (m.fullMarks || 100)) * 100),
              isPassed: !isNaN(numValue) && Math.min(numValue, m.fullMarks || 100) >= (selectedSubject?.passingMarks || 0),
            }
          : m
      )
    );
  };

  const handleRemarksChange = (studentId: string, value: string) => {
    setMarks(prev => prev.map(m => m.studentId === studentId ? { ...m, remarks: value } : m));
  };

  const handleSave = async () => {
    if (!selectedSubject) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        examId,
        subjectId: getSubjectId(selectedSubject),
        marks: marks.map((m) => ({
          studentId: m.studentId,
          marksObtained: Number(m.marksObtained || 0),
          remarks: m.remarks || '',
        })),
      };

      const savedMarks = await examApi.enterMarks(examId, getSubjectId(selectedSubject), payload);
      const savedMarksByStudent = new Map(
        savedMarks.map((savedMark: any) => [savedMark.studentId, savedMark])
      );
      setMarks((currentMarks) => currentMarks.map((currentMark) => ({
        ...currentMark,
        ...(savedMarksByStudent.get(currentMark.studentId) || {}),
      })));
      setSuccess('Marks saved successfully!');
      await onSuccess?.();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      console.error('Failed to save marks:', err);
      setError(err.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkFill = (value: number) => {
    if (!confirm(`Set all marks to ${value}?`)) return;
    setMarks(prev => prev.map(m => ({
      ...m,
      marksObtained: Math.min(value, m.fullMarks || 100),
      percentage: ((Math.min(value, m.fullMarks || 100) / (m.fullMarks || 100)) * 100),
      isPassed: Math.min(value, m.fullMarks || 100) >= (selectedSubject?.passingMarks || 0),
    })));
  };

  const filteredMarks = marks.filter((mark) => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    return mark.studentName.toLowerCase().includes(query) || String(mark.studentRoll).includes(query);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!selectedSubject || subjects.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-2 text-slate-500">No subjects available for this exam.</p>
      </div>
    );
  }

  const totalStudents = marks.length;
  const passedStudents = marks.filter((m) => Number(m.marksObtained || 0) >= (selectedSubject.passingMarks || 0)).length;
  const failedStudents = totalStudents - passedStudents;
  const average = totalStudents > 0 ? (marks.reduce((sum, m) => sum + Number(m.marksObtained || 0), 0) / totalStudents) : 0;

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{getSubjectName(selectedSubject)}</h3>
          <p className="text-sm text-slate-500">
            {className || 'Class'}{sectionName ? ` / ${sectionName}` : ''} • Full Marks: {selectedSubject.fullMarks} • Passing: {selectedSubject.passingMarks}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleBulkFill(0)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Reset All
          </button>
          <button
            onClick={() => handleBulkFill(selectedSubject.fullMarks)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Fill Full
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><Save size={16} />Save Marks</>
            )}
          </button>
        </div>
      </div>

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

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or roll..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-sm text-slate-500">
          {filteredMarks.length} of {totalStudents} students
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Roll</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Student Name</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Marks</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">/ {selectedSubject.fullMarks}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">%</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    No students found for this selection.
                  </td>
                </tr>
              ) : (
                filteredMarks.map((mark) => {
                  const isPassing = Number(mark.marksObtained || 0) >= (selectedSubject.passingMarks || 0);
                  return (
                    <tr key={mark.studentId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{mark.studentRoll}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {(mark.studentName || 'S').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{mark.studentName || 'Student'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={mark.marksObtained ?? ''}
                          onChange={(e) => handleMarkChange(mark.studentId, e.target.value)}
                          className={`w-24 rounded-lg border px-3 py-1.5 text-right text-sm outline-none focus:border-blue-500 ${
                            isPassing ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                          }`}
                          min="0"
                          max={selectedSubject.fullMarks}
                          step="0.5"
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-500">/ {selectedSubject.fullMarks}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        <span className={isPassing ? 'text-emerald-600' : 'text-red-600'}>
                          {mark.percentage?.toFixed(1) || '0.0'}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isPassing ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {isPassing ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={mark.remarks || ''}
                          onChange={(e) => handleRemarksChange(mark.studentId, e.target.value)}
                          placeholder="Add remarks..."
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4">
        <div className="text-sm text-slate-600">Total Students: <span className="font-semibold">{totalStudents}</span></div>
        <div className="text-sm text-slate-600">Passed: <span className="font-semibold text-emerald-600">{passedStudents}</span></div>
        <div className="text-sm text-slate-600">Failed: <span className="font-semibold text-red-600">{failedStudents}</span></div>
        <div className="text-sm text-slate-600">Average: <span className="font-semibold">{average.toFixed(1)}</span></div>
      </div>
    </div>
  );
};