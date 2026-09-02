import React, { useEffect, useState } from 'react';
import { AlertCircle, DollarSign, Loader2, Save, X } from 'lucide-react';
import { FeeStructure } from '../../types/fee';
import { feeApi } from '../../services/feeApi';

interface FeeStructureFormProps {
  structure?: FeeStructure;
  onClose: () => void;
  onSuccess: () => void;
}

const feeTypeOptions = [
  { value: 'tuition', label: 'Tuition Fee' },
  { value: 'admission', label: 'Admission Fee' },
  { value: 'exam', label: 'Exam Fee' },
  { value: 'transport', label: 'Transport Fee' },
  { value: 'library', label: 'Library Fee' },
  { value: 'lab', label: 'Lab Fee' },
  { value: 'sports', label: 'Sports Fee' },
  { value: 'development', label: 'Development Fee' },
  { value: 'other', label: 'Other' },
];

const frequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One Time' },
];

export const FeeStructureForm: React.FC<FeeStructureFormProps> = ({
  structure,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!structure;
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'tuition' as FeeStructure['type'],
    classId: '',
    amount: 0,
    isRecurring: true,
    frequency: 'monthly' as FeeStructure['frequency'],
    dueDay: 10,
    lateFee: 0,
    lateFeeAfterDays: 10,
    description: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadClasses();
    if (structure) {
      setFormData({
        name: structure.name,
        type: structure.type,
        classId: structure.classId || '',
        amount: structure.amount,
        isRecurring: structure.isRecurring,
        frequency: structure.frequency || 'monthly',
        dueDay: structure.dueDay || 10,
        lateFee: structure.lateFee || 0,
        lateFeeAfterDays: structure.lateFeeAfterDays || 10,
        description: structure.description || '',
        isActive: structure.isActive,
      });
    }
  }, [structure]);

  const loadClasses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/classes?page=1&limit=999`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'amount' || name === 'dueDay' || name === 'lateFee' || name === 'lateFeeAfterDays'
          ? Number(value) || 0
          : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) nextErrors.name = 'Fee structure name is required';
    if (!formData.type) nextErrors.type = 'Fee type is required';
    if (!formData.amount || formData.amount <= 0) nextErrors.amount = 'Amount must be greater than 0';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        lateFee: Number(formData.lateFee),
        dueDay: Number(formData.dueDay),
        lateFeeAfterDays: Number(formData.lateFeeAfterDays),
        classId: formData.classId || undefined,
      };

      if (isEditing && structure) {
        await feeApi.updateFeeStructure(structure.id, payload);
      } else {
        await feeApi.createFeeStructure(payload);
      }

      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save fee structure' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Fee Structure' : 'Add Fee Structure'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update the fee definition' : 'Create a new fee category for the school'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {errors.submit && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle size={18} />
              {errors.submit}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Fee Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-slate-200'} bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                placeholder="Tuition Fee"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Fee Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${errors.type ? 'border-red-500' : 'border-slate-200'} bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
              >
                {feeTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Class (optional)
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Class {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${errors.amount ? 'border-red-500' : 'border-slate-200'} bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="2500"
                />
              </div>
              {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Due Day
              </label>
              <input
                name="dueDay"
                type="number"
                min="1"
                max="31"
                value={formData.dueDay}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Late Fee
              </label>
              <input
                name="lateFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.lateFee}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Late Fee After Days
              </label>
              <input
                name="lateFeeAfterDays"
                type="number"
                min="0"
                value={formData.lateFeeAfterDays}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Optional details about this fee"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Recurring fee
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isEditing ? 'Update Structure' : 'Save Structure'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
