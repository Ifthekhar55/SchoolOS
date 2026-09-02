import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  Users,
  BookOpen,
  Hash,
  Plus,
  Trash2,
} from 'lucide-react';
import { Exam, CreateExamData, ExamType } from '../../types/exam';
import { examApi } from '../../services/examApi';
import { classApi } from '../../services/classApi';

interface ExamFormProps {
  exam?: Exam;
  schoolId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const examTypes: { value: ExamType; label: string }[] = [
  { value: 'class_test', label: 'Class Test' },
  { value: 'weekly', label: 'Weekly Test' },
  { value: 'monthly', label: 'Monthly Test' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'final', label: 'Final' },
  { value: 'board', label: 'Board Exam' },
];

export const ExamForm: React.FC<ExamFormProps> = ({
  exam,
  schoolId,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!exam;
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<CreateExamData>>({
    name: '',
    nameBangla: '',
    type: 'mid_term',
    code: '',
    description: '',
    classId: '',
    sectionId: '',
    academicYearId: '',
    examDate: new Date(),
    duration: 180,
    totalMarks: 100,
    passingMarks: 33,
    weightage: 100,
    subjects: [],
    status: 'draft',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDateForInput = (value: any) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const normalizeDateValue = (value: any) => {
    if (!value) return new Date();
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  };

  useEffect(() => {
    loadClasses();
    loadAcademicYears();
  }, []);

  useEffect(() => {
    if (!exam) return;

    setFormData({
      name: exam.name,
      nameBangla: exam.nameBangla || '',
      type: exam.type,
      code: exam.code,
      description: exam.description || '',
      classId: exam.classId,
      sectionId: exam.sectionId || '',
      academicYearId: exam.academicYearId,
      examDate: new Date(exam.examDate),
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      weightage: exam.weightage || 100,
      subjects: exam.subjects?.map(s => ({
        subjectId: s.subjectId,
        fullMarks: s.fullMarks,
        passingMarks: s.passingMarks,
        duration: s.duration,
        date: new Date(s.date),
        time: s.time || '',
        room: s.room || '',
      })) || [],
      status: exam.status,
    });

    if (exam.classId) {
      loadSections(exam.classId);
      loadSubjects(exam.classId);
    }
  }, [exam]);

  const loadClasses = async () => {
    try {
      const response = await classApi.getClasses({ page: 1, limit: 999 });
      setClasses(response.classes || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const loadAcademicYears = async () => {
    try {
      const years = await classApi.getAcademicYears(schoolId);
      setAcademicYears(years);
      if (years.length > 0 && !exam) {
        const current = years.find((y: any) => y.isCurrent);
        setFormData(prev => ({
          ...prev,
          academicYearId: current?.id || years[0]?.id || '',
        }));
      }
    } catch (error) {
      console.error('Failed to load academic years:', error);
    }
  };

  const loadSections = async (classId: string) => {
    try {
      const response = await classApi.getSections(classId);
      setSections(response.sections || []);
    } catch (error) {
      console.error('Failed to load sections:', error);
    }
  };

  const loadSubjects = async (classId: string) => {
    try {
      const data = await classApi.getClassSubjects(classId);
      const normalizedSubjects = (data || []).map((item: any) => {
        if (item?.subject) {
          return { ...item.subject, classSubjectId: item.id };
        }
        return item;
      });

      setSubjects(normalizedSubjects);

      setFormData(prev => {
        const currentSubjects = prev.subjects || [];

        if (exam && currentSubjects.length > 0) {
          return {
            ...prev,
            subjects: currentSubjects.map((subject) => ({
              ...subject,
              subjectId: subject.subjectId || '',
              fullMarks: Number(subject.fullMarks) || 0,
              passingMarks: Number(subject.passingMarks) || 0,
              duration: Number(subject.duration) || prev.duration || 60,
              date: subject.date ? new Date(subject.date) : prev.examDate || new Date(),
              time: subject.time || '',
              room: subject.room || '',
            })),
          };
        }

        if (!exam && normalizedSubjects.length > 0) {
          const firstSubjects = normalizedSubjects.map((subject: any) => ({
            subjectId: subject.id,
            fullMarks: 0,
            passingMarks: 0,
            duration: prev.duration || 60,
            date: prev.examDate || new Date(),
            time: '',
            room: '',
          }));

          return {
            ...prev,
            subjects: firstSubjects,
          };
        }

        return {
          ...prev,
          subjects: [],
        };
      });
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setSubjects([]);
      setFormData(prev => ({ ...prev, subjects: [] }));
    }
  };

  const handleClassChange = (classId: string) => {
    setFormData(prev => ({ ...prev, classId, sectionId: '' }));
    if (classId) {
      loadSections(classId);
      loadSubjects(classId);
    } else {
      setSections([]);
      setSubjects([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Exam name is required';
    if (!formData.code) newErrors.code = 'Exam code is required';
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.academicYearId) newErrors.academicYearId = 'Academic year is required';
    if (!formData.subjects || formData.subjects.length === 0) {
      newErrors.subjects = 'At least one subject is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sanitizePayload = (value: any): any => {
    if (value === null || value === undefined) return value;
    if (value instanceof Date) return value;

    if (Array.isArray(value)) {
      return value
        .map((item) => sanitizePayload(item))
        .filter((item) => item !== undefined);
    }

    if (typeof value === 'object') {
      const cleaned: Record<string, any> = {};
      Object.entries(value).forEach(([key, item]) => {
        const sanitized = sanitizePayload(item);
        if (sanitized === undefined) return;

        if (typeof sanitized === 'string' && sanitized.trim() === '') {
          if (key === 'sectionId' || key === 'nameBangla' || key === 'description' || key === 'room') {
            cleaned[key] = null;
            return;
          }
          return;
        }

        cleaned[key] = sanitized;
      });
      return cleaned;
    }

    if (typeof value === 'string') {
      return value.trim();
    }

    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const subjects = formData.subjects || [];
      const validSubjects = subjects
        .filter((subject) => subject.subjectId)
        .map((subject) => ({
          ...subject,
          fullMarks: Number(subject.fullMarks) || 0,
          passingMarks: Number(subject.passingMarks) || 0,
          duration: Number(subject.duration) || 0,
          time: subject.time || '',
          room: subject.room || '',
          date: normalizeDateValue(subject.date),
        }));

      const subjectDates = validSubjects
        .map((subject) => subject.date)
        .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()));

      const calculatedExamDate = subjectDates.length > 0
        ? new Date(Math.min(...subjectDates.map((date) => date.getTime())))
        : new Date();

      const calculatedDuration = validSubjects.reduce(
        (maxDuration, subject) => Math.max(maxDuration, Number(subject.duration) || 0),
        0
      );

      const calculatedTotalMarks = validSubjects.reduce(
        (total, subject) => total + (Number(subject.fullMarks) || 0),
        0
      );

      const calculatedPassingMarks = validSubjects.reduce(
        (total, subject) => total + (Number(subject.passingMarks) || 0),
        0
      );

      const data = sanitizePayload({
        ...formData,
        schoolId,
        sectionId: formData.sectionId || null,
        nameBangla: formData.nameBangla || null,
        description: formData.description || null,
        examDate: calculatedExamDate,
        duration: calculatedDuration || 60,
        totalMarks: calculatedTotalMarks || 0,
        passingMarks: calculatedPassingMarks || 0,
        weightage: 100,
        subjects: validSubjects,
      });

      if (isEditing && exam) {
        const { id: _id, ...updatePayload } = data as any;
        await examApi.updateExam(exam.id, updatePayload as any);
      } else {
        await examApi.createExam(data as CreateExamData);
      }
      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save exam' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'totalMarks' || name === 'passingMarks' || name === 'weightage'
        ? parseInt(value) || 0
        : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubjectChange = (index: number, field: string, value: any) => {
    const subjects = [...(formData.subjects || [])];
    const nextValue = field === 'date' && typeof value === 'string' && value
      ? new Date(`${value}T12:00:00`)
      : value;

    subjects[index] = { ...subjects[index], [field]: nextValue };
    setFormData(prev => ({ ...prev, subjects }));
  };

  const addSubject = () => {
    const subjectsList = [...(formData.subjects || [])];
    const usedSubjectIds = new Set(subjectsList.map(item => item.subjectId).filter(Boolean));
    const nextSubject = subjects.find((subject: any) => !usedSubjectIds.has(subject.id));

    subjectsList.push({
      subjectId: nextSubject?.id || '',
      fullMarks: 0,
      passingMarks: 0,
      duration: formData.duration || 60,
      date: formData.examDate || new Date(),
      time: '',
      room: '',
    });
    setFormData(prev => ({ ...prev, subjects: subjectsList }));
  };

  const removeSubject = (index: number) => {
    const subjects = (formData.subjects || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, subjects }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Exam' : 'Create New Exam'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update exam details' : 'Schedule a new exam'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
          {errors.submit && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              <AlertCircle size={18} />
              {errors.submit}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Exam Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Exam Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="Mid Term Examination"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Exam Name Bangla */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Exam Name (Bangla)
              </label>
              <input
                type="text"
                name="nameBangla"
                value={formData.nameBangla || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="মধ্য-বার্ষিক পরীক্ষা"
                dir="rtl"
              />
            </div>

            {/* Exam Code */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Exam Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="code"
                  value={formData.code || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.code ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="EXAM-2026-001"
                />
              </div>
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>

            {/* Exam Type */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Exam Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                {examTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="classId"
                value={formData.classId || ''}
                onChange={(e) => {
                  handleClassChange(e.target.value);
                  handleInputChange(e);
                }}
                className={`w-full rounded-lg border ${
                  errors.classId ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Class {cls.name}
                  </option>
                ))}
              </select>
              {errors.classId && <p className="mt-1 text-xs text-red-500">{errors.classId}</p>}
            </div>

            {/* Section */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Section
              </label>
              <select
                name="sectionId"
                value={formData.sectionId || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    Section {section.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                name="academicYearId"
                value={formData.academicYearId || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.academicYearId ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                    {year.isCurrent ? ' (Current)' : ''}
                  </option>
                ))}
              </select>
              {errors.academicYearId && <p className="mt-1 text-xs text-red-500">{errors.academicYearId}</p>}
            </div>

            {/* Subjects */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-slate-700">
                  Subjects <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addSubject}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  <Plus size={14} />
                  Add Subject
                </button>
              </div>
              {errors.subjects && <p className="mb-2 text-xs text-red-500">{errors.subjects}</p>}

              <div className="space-y-4">
                {(formData.subjects || []).map((subject, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid gap-3 md:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Subject
                          </label>
                          <select
                            value={subject.subjectId || ''}
                            onChange={(e) => handleSubjectChange(index, 'subjectId', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                          >
                            <option value="">Select Subject</option>
                            {subjects.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                          </select>
                          {subjects.length === 0 && formData.classId && (
                            <p className="mt-1 text-xs text-slate-500">
                              No subjects are assigned to this class.
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Full Marks
                          </label>
                          <input
                            type="number"
                            value={subject.fullMarks || ''}
                            onChange={(e) => handleSubjectChange(index, 'fullMarks', parseInt(e.target.value) || 0)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Passing Marks
                          </label>
                          <input
                            type="number"
                            value={subject.passingMarks || ''}
                            onChange={(e) => handleSubjectChange(index, 'passingMarks', parseInt(e.target.value) || 0)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Duration (min)
                          </label>
                          <input
                            type="number"
                            value={subject.duration || ''}
                            onChange={(e) => handleSubjectChange(index, 'duration', parseInt(e.target.value) || 0)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Date
                          </label>
                          <input
                            type="date"
                            value={subject.date ? formatDateForInput(subject.date) : ''}
                            onChange={(e) => handleSubjectChange(index, 'date', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Starting Time
                          </label>
                          <input
                            type="time"
                            value={subject.time || ''}
                            onChange={(e) => handleSubjectChange(index, 'time', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Room
                          </label>
                          <input
                            type="text"
                            value={subject.room || ''}
                            onChange={(e) => handleSubjectChange(index, 'room', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                            placeholder="Room 201"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSubject(index)}
                        className="ml-3 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? 'Update Exam' : 'Create Exam'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};