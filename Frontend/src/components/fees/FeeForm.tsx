import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  DollarSign,
  Calendar,
  Users,
  BookOpen,
  Hash,
} from 'lucide-react';
import { Fee, FeeType } from '../../types/fee';
import { feeApi } from '../../services/feeApi';
import { studentApi } from '../../services/studentApi';

interface FeeFormProps {
  fee?: Fee;
  schoolId: string;
  studentFilter?: { class?: string; section?: string };
  onClose: () => void;
  onSuccess: () => void;
}

const feeTypes: { value: FeeType; label: string }[] = [
  { value: 'admission', label: 'Admission Fee' },
  { value: 'tuition', label: 'Tuition Fee' },
  { value: 'exam', label: 'Exam Fee' },
  { value: 'transport', label: 'Transport Fee' },
  { value: 'library', label: 'Library Fee' },
  { value: 'lab', label: 'Lab Fee' },
  { value: 'sports', label: 'Sports Fee' },
  { value: 'development', label: 'Development Fee' },
  { value: 'other', label: 'Other' },
];

export const FeeForm: React.FC<FeeFormProps> = ({
  fee,
  schoolId,
  studentFilter,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!fee;
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    studentId: '',
    feeStructureId: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedStructure, setSelectedStructure] = useState<any>(null);

  useEffect(() => {
    loadStudents();
    loadFeeStructures();
    if (fee) {
      setFormData({
        studentId: fee.studentId,
        feeStructureId: fee.feeStructureId,
        amount: fee.amount,
        dueDate: new Date(fee.dueDate).toISOString().split('T')[0],
        month: fee.month || new Date().toLocaleString('default', { month: 'long' }),
        year: fee.year || new Date().getFullYear(),
        notes: fee.notes || '',
      });
    }
  }, [fee, studentFilter]);

  const loadStudents = async () => {
    try {
      const response = await studentApi.getStudents({ ...studentFilter, limit: 999 });
      setStudents(response.students || []);
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const loadFeeStructures = async () => {
    try {
      const data = await feeApi.getFeeStructures();
      setFeeStructures(data || []);
    } catch (error) {
      console.error('Failed to load fee structures:', error);
    }
  };

  const handleStructureChange = (structureId: string) => {
    const structure = feeStructures.find(s => s.id === structureId);
    setSelectedStructure(structure);
    setFormData(prev => ({
      ...prev,
      feeStructureId: structureId,
      amount: structure?.amount || 0,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentId) newErrors.studentId = 'Student is required';
    if (!formData.feeStructureId) newErrors.feeStructureId = 'Fee structure is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';

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
        schoolId,
        amount: Number(formData.amount),
        dueDate: new Date(formData.dueDate),
      };

      if (isEditing && fee) {
        await feeApi.updateFee(fee.id, data);
      } else {
        await feeApi.createFee(data);
      }
      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save fee' });
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
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Fee' : 'Add Fee'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update fee details' : 'Add a new fee for a student'}
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
            {/* Student */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                name="studentId"
                value={formData.studentId || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.studentId ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} (Roll {student.rollNumber})
                  </option>
                ))}
              </select>
              {errors.studentId && <p className="mt-1 text-xs text-red-500">{errors.studentId}</p>}
            </div>

            {/* Fee Structure */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Fee Structure <span className="text-red-500">*</span>
              </label>
              <select
                name="feeStructureId"
                value={formData.feeStructureId || ''}
                onChange={(e) => {
                  handleStructureChange(e.target.value);
                  handleInputChange(e);
                }}
                className={`w-full rounded-lg border ${
                  errors.feeStructureId ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
              >
                <option value="">Select Fee Structure</option>
                {feeStructures.map((structure) => (
                  <option key={structure.id} value={structure.id}>
                    {structure.name} - ৳{structure.amount}
                    {structure.className && ` (Class ${structure.className})`}
                  </option>
                ))}
              </select>
              {errors.feeStructureId && <p className="mt-1 text-xs text-red-500">{errors.feeStructureId}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.amount ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="1000"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
            </div>

            {/* Month & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Month
                </label>
                <select
                  name="month"
                  value={formData.month || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Year
                </label>
                <select
                  name="year"
                  value={formData.year || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.dueDate ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                />
              </div>
              {errors.dueDate && <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Additional notes..."
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
                  {isEditing ? 'Update Fee' : 'Add Fee'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};