import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Eye, Link, Pencil, Trash2, X } from 'lucide-react';
import { ClassSubjectDetail, Subject, SubjectWithClasses } from '../../types/subject';
import { subjectApi } from '../../services/subjectApi';
import { classApi } from '../../services/classApi';
import { api } from '../../services/api';

interface SubjectSectionListProps {
  subject: Subject;
  onBack: () => void;
}

const classNumberWords: Record<string, string> = {
  '1': 'One',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
};

const formatClassName = (className: string) => {
  const classNumber = className.replace(/^class[-\s:]*/i, '').trim();
  return classNumberWords[classNumber.toLowerCase()] || classNumber;
};

export const SubjectSectionList: React.FC<SubjectSectionListProps> = ({ subject, onBack }) => {
  const [details, setDetails] = useState<SubjectWithClasses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedTeacherUserId, setSelectedTeacherUserId] = useState('');
  const [editingAssignment, setEditingAssignment] = useState<ClassSubjectDetail | null>(null);
  const [viewingAssignment, setViewingAssignment] = useState<ClassSubjectDetail | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  const loadDetails = async () => {
      try {
        setLoading(true);
        setError('');
        setDetails(await subjectApi.getSubjectClassDetails(subject.id));
      } catch (loadError) {
        console.error('Failed to load subject section details:', loadError);
        setError('Unable to load section details.');
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadDetails();
  }, [subject.id]);

  const openAssignForm = async (assignment?: ClassSubjectDetail) => {
    try {
      setAssignError('');
      const [classResponse, teacherResponse] = await Promise.all([
        classApi.getClasses({ page: 1, limit: 999 }),
        api.request<{ teachers: any[] }>('/teachers/available'),
      ]);
      setClasses(classResponse.classes || []);
      setTeachers(teacherResponse.teachers || []);
      setEditingAssignment(assignment || null);
      setSelectedClassId(assignment?.classId || '');
      setSelectedSectionId(assignment?.sectionId || '');
      setSelectedTeacherUserId(assignment?.teacherId || '');
      setShowAssignForm(true);
    } catch (loadError) {
      console.error('Failed to load classes for assignment:', loadError);
      setAssignError('Unable to load classes.');
      setShowAssignForm(true);
    }
  };

  const handleAssignSubject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedClassId || !selectedSectionId || !selectedTeacherUserId) {
      setAssignError('Please select a teacher, class, and section.');
      return;
    }

    try {
      setAssigning(true);
      setAssignError('');
      const assignmentData = {
        teacherId: selectedTeacherUserId,
        sectionId: selectedSectionId,
        isCompulsory: subject.isCompulsory,
        creditHours: subject.creditHours,
      };
      if (editingAssignment) {
        await classApi.updateSubject(selectedClassId, subject.id, assignmentData);
      } else {
        await classApi.assignSubject(selectedClassId, subject.id, assignmentData);
      }
      setEditingAssignment(null);
      setShowAssignForm(false);
      await loadDetails();
    } catch (assignSubjectError: any) {
      console.error('Failed to assign subject:', assignSubjectError);
      setAssignError(assignSubjectError.message || 'Unable to assign subject.');
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteAssignment = async (assignment: ClassSubjectDetail) => {
    if (!window.confirm(`Remove ${subject.name} from Class: ${formatClassName(assignment.className)} - Section-${assignment.sectionName}?`)) return;

    try {
      await classApi.removeSubject(assignment.classId, subject.id, assignment.sectionId);
      await loadDetails();
    } catch (deleteError: any) {
      setError(deleteError.message || 'Unable to remove subject assignment.');
    }
  };

  const sections = details?.classDetails || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          title="Back to subjects"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-sm text-slate-500">Subject details</p>
          <h2 className="text-xl font-bold text-slate-900">{subject.name}</h2>
        </div>
        <button
          type="button"
          onClick={() => openAssignForm()}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Link size={16} />
          Assign Subject
        </button>
      </div>

      {showAssignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form onSubmit={handleAssignSubject} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Assign Subject</h3>
                <p className="text-sm text-slate-500">Assign {subject.name} to a class</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingAssignment(null);
                  setShowAssignForm(false);
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {assignError && (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {assignError}
              </p>
            )}

            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="assign-class">
              Select Class
            </label>
            <select
              id="assign-class"
              value={selectedClassId}
              onChange={(event) => {
                setSelectedClassId(event.target.value);
                setSelectedSectionId('');
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Select a class</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  Class {classItem.name}
                </option>
              ))}
            </select>

            <label className="mb-1.5 mt-4 block text-sm font-medium text-slate-700" htmlFor="assign-section">
              Section
            </label>
            <select
              id="assign-section"
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
              disabled={!selectedClassId}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select a section</option>
              {(classes.find((classItem) => classItem.id === selectedClassId)?.sections || []).map((section: any) => (
                <option key={section.id} value={section.id}>
                  Section {section.name}
                </option>
              ))}
            </select>

            <label className="mb-1.5 mt-4 block text-sm font-medium text-slate-700" htmlFor="assign-teacher">
              Teacher's Name
            </label>
            <select
              id="assign-teacher"
              value={selectedTeacherUserId}
              onChange={(event) => setSelectedTeacherUserId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="">Select a teacher</option>
              {teachers.filter((teacher) => teacher.userId).map((teacher) => (
                <option key={teacher.userId} value={teacher.userId}>
                  {teacher.name}
                </option>
              ))}
            </select>

            <label className="mb-1.5 mt-4 block text-sm font-medium text-slate-700" htmlFor="assign-teacher-id">
              Teacher ID
            </label>
            <input
              id="assign-teacher-id"
              type="text"
              value={teachers.find((teacher) => teacher.userId === selectedTeacherUserId)?.id || 'Select a teacher first'}
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-600 outline-none"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingAssignment(null);
                  setShowAssignForm(false);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assigning}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {assigning ? 'Assigning...' : 'Assign Subject'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-2 text-sm text-slate-500">No class sections are assigned to this subject.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {sections.map((section) => (
              <div
                key={section.id}
                className="flex min-w-[520px] items-center justify-between gap-6 px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    Class: {formatClassName(section.className)} - Section-{section.sectionName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Teacher Name of {details?.subjectName || subject.name}: {section.teacherName || 'Not assigned'}
                  </p>
                </div>
                <div className="whitespace-nowrap text-sm font-medium text-slate-700">
                  <p className="text-slate-600">Total students: {section.totalStudents}</p>
                  <p className="text-emerald-600">Passed: {section.passedStudents}</p>
                  <p className="text-red-600">Failed: {section.failedStudents}</p>
                </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewingAssignment(section)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openAssignForm(section)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(section)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Subject Assignment</h3>
              <button
                type="button"
                onClick={() => setViewingAssignment(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <p><span className="font-semibold text-slate-700">Subject:</span> {subject.name}</p>
              <p><span className="font-semibold text-slate-700">Class:</span> {formatClassName(viewingAssignment.className)}</p>
              <p><span className="font-semibold text-slate-700">Section:</span> Section-{viewingAssignment.sectionName}</p>
              <p><span className="font-semibold text-slate-700">Teacher:</span> {viewingAssignment.teacherName || 'Not assigned'}</p>
              <p><span className="font-semibold text-slate-700">Total students:</span> {viewingAssignment.totalStudents}</p>
              <p><span className="font-semibold text-slate-700">Passed:</span> {viewingAssignment.passedStudents}</p>
              <p><span className="font-semibold text-slate-700">Failed:</span> {viewingAssignment.failedStudents}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
