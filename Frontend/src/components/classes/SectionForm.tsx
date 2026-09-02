import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  User,
  Users,
  Hash,
  Home,
} from 'lucide-react';
import { Section, CreateSectionData, UpdateSectionData } from '../../types/class';
import { classApi } from '../../services/classApi';

interface SectionFormProps {
  classId: string;
  section?: Section;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
}

export const SectionForm: React.FC<SectionFormProps> = ({
  classId,
  section,
  onClose,
  onSuccess,
  schoolId,
}) => {
  const isEditing = !!section;
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<CreateSectionData>>({
    name: '',
    nameBangla: '',
    code: '',
    capacity: 30,
    teacherId: '',
    roomNumber: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTeachers();
    if (section) {
      setFormData({
        name: section.name,
        nameBangla: section.nameBangla || '',
        code: section.code,
        capacity: section.capacity,
        teacherId: section.teacherId || '',
        roomNumber: section.roomNumber || '',
        isActive: section.isActive,
      });
    }
  }, [section]);

  const loadTeachers = async () => {
    try {
      const data = await classApi.getAvailableTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Section name is required';
    if (!formData.code) newErrors.code = 'Section code is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';
    else if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';

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
        classId,
      };

      if (isEditing && section) {
        await classApi.updateSection(section.id, formData as UpdateSectionData);
      } else {
        await classApi.createSection(classId, data as CreateSectionData);
      }
      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save section' });
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
              {isEditing ? 'Edit Section' : 'Add New Section'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update section details' : 'Add a new section to this class'}
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
            {/* Section Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Section Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="A"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Section Name Bangla */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Section Name (Bangla)
              </label>
              <input
                type="text"
                name="nameBangla"
                value={formData.nameBangla || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="এ"
                dir="rtl"
              />
            </div>

            {/* Section Code */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Section Code <span className="text-red-500">*</span>
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
                  placeholder="SEC-A"
                />
              </div>
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
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

            {/* Teacher */}
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

            {/* Room Number */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Room Number
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="Room 201"
                />
              </div>
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
                  {isEditing ? 'Update Section' : 'Add Section'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};