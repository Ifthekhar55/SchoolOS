import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  BookOpen,
  Hash,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Subject, CreateSubjectData } from '../../types/subject';
import { subjectApi } from '../../services/subjectApi';
import { classApi } from '../../services/classApi';

interface SubjectFormProps {
  subject?: Subject;
  classId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({
  subject,
  classId: initialClassId,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!subject;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateSubjectData>>({
    name: '',
    nameBangla: '',
    code: '',
    description: '',
    classId: initialClassId || '',
    creditHours: 0,
    isCompulsory: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadClasses();
    if (subject) {
      setFormData({
        name: subject.name,
        nameBangla: subject.nameBangla || '',
        code: subject.code,
        description: subject.description || '',
        classId: subject.classId,
        creditHours: subject.creditHours || 0,
        isCompulsory: subject.isCompulsory,
      });
    }
  }, [subject]);

  const loadClasses = async () => {
    try {
      const response = await classApi.getClasses({ page: 1, limit: 999 });
      const availableClasses = response.classes || [];
      if (!subject && !initialClassId && availableClasses[0]?.id) {
        setFormData(prev => ({ ...prev, classId: availableClasses[0].id }));
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Subject name is required';
    if (!formData.code) newErrors.code = 'Subject code is required';
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (formData.creditHours === undefined || formData.creditHours < 0) {
      newErrors.creditHours = 'Valid credit hours are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const data = {
        ...formData,
        creditHours: Number(formData.creditHours) || 0,
      };

      if (isEditing && subject) {
        await subjectApi.updateSubject(subject.id, { ...data, id: subject.id });
      } else {
        await subjectApi.createSubject(data as CreateSubjectData);
      }
      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save subject' });
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
      [name]: name === 'creditHours' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update subject details' : 'Create a new subject'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              <AlertCircle size={18} />
              {errors.submit}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Subject Name */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Subject Name <span className="text-red-500">*</span>
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
                  placeholder="Mathematics"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Subject Name Bangla */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Subject Name (Bangla)
              </label>
              <input
                type="text"
                name="nameBangla"
                value={formData.nameBangla || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="গণিত"
                dir="rtl"
              />
            </div>

            {/* Subject Code */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Subject Code <span className="text-red-500">*</span>
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
                  placeholder="MAT-101"
                />
              </div>
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>

            {/* Credit Hours */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Credit Hours <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="creditHours"
                  value={formData.creditHours || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.creditHours ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="3"
                  min="0"
                  step="0.5"
                />
              </div>
              {errors.creditHours && <p className="mt-1 text-xs text-red-500">{errors.creditHours}</p>}
            </div>

            {/* Compulsory */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-blue-600" />
                  Subject Type
                </div>
              </label>
              <select
                name="isCompulsory"
                value={formData.isCompulsory ? 'true' : 'false'}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    isCompulsory: e.target.value === 'true',
                  }));
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="true">Compulsory</option>
                <option value="false">Optional</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Enter subject description..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
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
                  {isEditing ? 'Update Subject' : 'Create Subject'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};