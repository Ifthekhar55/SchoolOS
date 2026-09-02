import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Users,
  GraduationCap
} from 'lucide-react';
import { SchoolSetupData } from '../../types/school';

interface SchoolAcademicSetupProps {
  data: Partial<SchoolSetupData>;
  updateData: (data: Partial<SchoolSetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const banglaClassNames = [
  'প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম',
  'ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম',
  'একাদশ', 'দ্বাদশ'
];

const commonSubjects = [
  'Bangla', 'English', 'Math', 'Science', 'Social Science',
  'ICT', 'Religion', 'Physical Education', 'Art', 'Music'
];

const formatDateInput = (value: Date | string | undefined) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

export const SchoolAcademicSetup: React.FC<SchoolAcademicSetupProps> = ({
  data,
  updateData,
  onNext,
  onBack,
}) => {
  const [classes, setClasses] = useState(data.classes || []);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    setClasses(data.classes || []);
  }, [data.classes]);

  const addClass = () => {
    const newClass = {
      name: `Class ${classes.length + 1}`,
      nameBangla: banglaClassNames[classes.length] || '',
      sections: ['A'],
      subjects: ['Bangla', 'English', 'Math'],
    };
    setClasses([...classes, newClass]);
    updateData({ classes: [...classes, newClass] });
  };

  const removeClass = (index: number) => {
    const updated = classes.filter((_, i) => i !== index);
    setClasses(updated);
    updateData({ classes: updated });
  };

  const updateClass = (index: number, field: string, value: any) => {
    const updated = classes.map((cls, i) => {
      if (i === index) {
        return { ...cls, [field]: value };
      }
      return cls;
    });
    setClasses(updated);
    updateData({ classes: updated });
  };

  const addSection = (classIndex: number) => {
    const sections = classes[classIndex].sections || [];
    const nextLetter = String.fromCharCode(65 + sections.length);
    updateClass(classIndex, 'sections', [...sections, nextLetter]);
  };

  const removeSection = (classIndex: number, sectionIndex: number) => {
    const sections = classes[classIndex].sections.filter((_, i) => i !== sectionIndex);
    updateClass(classIndex, 'sections', sections);
  };

  const addSubject = (classIndex: number) => {
    const subjects = classes[classIndex].subjects || [];
    updateClass(classIndex, 'subjects', [...subjects, '']);
  };

  const removeSubject = (classIndex: number, subjectIndex: number) => {
    const subjects = classes[classIndex].subjects.filter((_, i) => i !== subjectIndex);
    updateClass(classIndex, 'subjects', subjects);
  };

  const updateSubject = (classIndex: number, subjectIndex: number, value: string) => {
    const subjects = [...classes[classIndex].subjects];
    subjects[subjectIndex] = value;
    updateClass(classIndex, 'subjects', subjects);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!data.academicYearStart) {
      newErrors.academicYearStart = 'Academic year start date is required';
    }

    if (!data.academicYearEnd) {
      newErrors.academicYearEnd = 'Academic year end date is required';
    }

    if (data.academicYearStart && data.academicYearEnd) {
      const start = new Date(data.academicYearStart);
      const end = new Date(data.academicYearEnd);
      if (end <= start) {
        newErrors.academicYearEnd = 'End date must be after start date';
      }
    }

    if (classes.length === 0) {
      newErrors.classes = 'Add at least one class';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-slate-900">
          Academic Setup
        </h2>

        {/* Academic Year */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Academic Year Start <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={formatDateInput(data.academicYearStart)}
                onChange={(e) => updateData({ academicYearStart: e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined })}
                className={`w-full rounded-lg border ${
                  errors.academicYearStart ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
              />
            </div>
            {errors.academicYearStart && (
              <p className="mt-1.5 text-xs text-red-500">{errors.academicYearStart}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Academic Year End <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={formatDateInput(data.academicYearEnd)}
                onChange={(e) => updateData({ academicYearEnd: e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined })}
                className={`w-full rounded-lg border ${
                  errors.academicYearEnd ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
              />
            </div>
            {errors.academicYearEnd && (
              <p className="mt-1.5 text-xs text-red-500">{errors.academicYearEnd}</p>
            )}
          </div>
        </div>

        {/* Classes Section */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Classes & Sections
              </h3>
              <p className="text-xs text-slate-500">
                Add the classes in your school
              </p>
            </div>
            <button
              type="button"
              onClick={addClass}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Class
            </button>
          </div>

          {errors.classes && (
            <p className="mb-4 text-xs text-red-500">{errors.classes}</p>
          )}

          <div className="space-y-4">
            {classes.map((cls, classIndex) => (
              <div
                key={classIndex}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-slate-400" />
                    <span className="font-semibold text-slate-700">
                      Class {classIndex + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeClass(classIndex)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Class Name */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Class Name
                    </label>
                    <input
                      type="text"
                      value={cls.name}
                      onChange={(e) => updateClass(classIndex, 'name', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      placeholder="Class 1"
                    />
                  </div>

                  {/* Class Name Bangla */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Class Name (Bangla)
                    </label>
                    <input
                      type="text"
                      value={cls.nameBangla || ''}
                      onChange={(e) => updateClass(classIndex, 'nameBangla', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      placeholder="প্রথম শ্রেণী"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Sections */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-600">
                      Sections
                    </label>
                    <button
                      type="button"
                      onClick={() => addSection(classIndex)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      + Add Section
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cls.sections?.map((section, sectionIndex) => (
                      <span
                        key={sectionIndex}
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
                      >
                        {section}
                        <button
                          type="button"
                          onClick={() => removeSection(classIndex, sectionIndex)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subjects */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-600">
                      Subjects
                    </label>
                    <button
                      type="button"
                      onClick={() => addSubject(classIndex)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      + Add Subject
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cls.subjects?.map((subject, subjectIndex) => (
                      <div key={subjectIndex} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => updateSubject(classIndex, subjectIndex, e.target.value)}
                          className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                          placeholder="Subject"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubject(classIndex, subjectIndex)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Next: Admin Account
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </form>
  );
};