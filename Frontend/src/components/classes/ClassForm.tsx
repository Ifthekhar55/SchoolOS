import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  School,
  Users,
  Hash,
  User,
  Calendar,
} from 'lucide-react';
import { Class, CreateClassData } from '../../types/class';
import { classApi } from '../../services/classApi';

interface ClassFormProps {
  classItem?: Class;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
}

export const ClassForm: React.FC<ClassFormProps> = ({
  classItem,
  onClose,
  onSuccess,
  schoolId,
}) => {
  const isEditing = !!classItem;
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [academicYearsLoading, setAcademicYearsLoading] = useState(true);
  const [showAcademicYearForm, setShowAcademicYearForm] = useState(false);
  const [academicYearSaving, setAcademicYearSaving] = useState(false);
  const [academicYearError, setAcademicYearError] = useState('');
  const [newAcademicYear, setNewAcademicYear] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [formData, setFormData] = useState<Partial<CreateClassData>>({
    name: '',
    nameBangla: '',
    code: '',
    capacity: 30,
    academicYearId: '',
    teacherId: '',
    isActive: true,
    sections: [],
    subjects: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTeachers();
    if (schoolId) {
      loadAcademicYears();
    } else {
      setAcademicYearsLoading(false);
    }
    if (classItem) {
      setFormData({
        name: classItem.name,
        nameBangla: classItem.nameBangla || '',
        code: classItem.code,
        capacity: classItem.capacity,
        academicYearId: classItem.academicYearId,
        teacherId: classItem.teacherId || '',
        isActive: classItem.isActive,
      });
    }
  }, [classItem, schoolId]);

  const loadTeachers = async () => {
    try {
      const data = await classApi.getAvailableTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
  };

  const loadAcademicYears = async () => {
    try {
      setAcademicYearsLoading(true);
      const data = await classApi.getAcademicYears(schoolId);
      setAcademicYears(data);
      if (!isEditing && data.length > 0) {
        const current = data.find(y => y.isCurrent);
        setFormData(prev => ({
          ...prev,
          academicYearId: current?.id || data[0]?.id || '',
        }));
      }
    } catch (error) {
      console.error('Failed to load academic years:', error);
      setAcademicYears([]);
    } finally {
      setAcademicYearsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Class name is required';
    if (!formData.code) newErrors.code = 'Class code is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    else if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    if (!formData.academicYearId) newErrors.academicYearId = 'Academic year is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createAcademicYear = async () => {
    setAcademicYearError('');
    if (!newAcademicYear.name || !newAcademicYear.startDate || !newAcademicYear.endDate) {
      setAcademicYearError('Name, start date, and end date are required');
      return;
    }
    if (new Date(newAcademicYear.endDate) <= new Date(newAcademicYear.startDate)) {
      setAcademicYearError('End date must be after start date');
      return;
    }

    try {
      setAcademicYearSaving(true);
      const academicYear = await classApi.createAcademicYear({
        ...newAcademicYear,
        isCurrent: academicYears.length === 0,
      });
      setAcademicYears((years) => [academicYear, ...years]);
      setFormData((prev) => ({ ...prev, academicYearId: academicYear.id }));
      setNewAcademicYear({ name: '', startDate: '', endDate: '' });
      setShowAcademicYearForm(false);
    } catch (error: any) {
      setAcademicYearError(error.message || 'Failed to create academic year');
    } finally {
      setAcademicYearSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const data = {
        ...formData,
        schoolId,
      };

      if (isEditing && classItem) {
        await classApi.updateClass(classItem.id, { ...data, id: classItem.id });
      } else {
        await classApi.createClass(data as CreateClassData);
      }
      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save class' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Class' : 'Add New Class'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update class details' : 'Add a new class to the system'}
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

          <div className="grid gap-4">
            {/* Class Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Class Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="1"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Class Name Bangla */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Class Name (Bangla)
              </label>
              <input
                type="text"
                name="nameBangla"
                value={formData.nameBangla || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="প্রথম"
                dir="rtl"
              />
            </div>

            {/* Class Code */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Class Code <span className="text-red-500">*</span>
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
                  placeholder="CLS-001"
                />
              </div>
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>

            {/* Academic Year */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  name="academicYearId"
                  value={formData.academicYearId || ''}
                  onChange={handleInputChange}
                  className={`min-w-0 flex-1 rounded-lg border ${
                    errors.academicYearId ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                >
                  <option value="">Select Academic Year</option>
                  {academicYearsLoading && <option value="" disabled>Loading academic years...</option>}
                  {!academicYearsLoading && academicYears.length === 0 && (
                    <option value="" disabled>No academic years available</option>
                  )}
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name} {year.isCurrent ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setAcademicYearError('');
                    setShowAcademicYearForm((visible) => !visible);
                  }}
                  className="shrink-0 rounded-lg border border-blue-200 px-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  {showAcademicYearForm ? 'Cancel' : 'New Year'}
                </button>
              </div>
              {errors.academicYearId && <p className="mt-1 text-xs text-red-500">{errors.academicYearId}</p>}
              {showAcademicYearForm && (
                <div className="mt-3 space-y-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                  <input
                    value={newAcademicYear.name}
                    onChange={(e) => setNewAcademicYear((year) => ({ ...year, name: e.target.value }))}
                    placeholder="Academic year name (e.g. 2026-2027)"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="date"
                      value={newAcademicYear.startDate}
                      onChange={(e) => setNewAcademicYear((year) => ({ ...year, startDate: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={newAcademicYear.endDate}
                      onChange={(e) => setNewAcademicYear((year) => ({ ...year, endDate: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  {academicYearError && <p className="text-xs text-red-500">{academicYearError}</p>}
                  <button
                    type="button"
                    onClick={createAcademicYear}
                    disabled={academicYearSaving}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {academicYearSaving ? 'Creating...' : 'Create Academic Year'}
                  </button>
                </div>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.capacity ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                placeholder="30"
                min="1"
              />
              {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>}
            </div>

            {/* Class Teacher */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Class Teacher
              </label>
              <select
                name="teacherId"
                value={formData.teacherId || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.designation})
                  </option>
                ))}
              </select>
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
                  {isEditing ? 'Update Class' : 'Add Class'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};