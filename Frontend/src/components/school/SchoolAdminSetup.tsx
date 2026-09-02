import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { SchoolSetupData } from '../../types/school';

interface SchoolAdminSetupProps {
  data: Partial<SchoolSetupData>;
  updateData: (data: Partial<SchoolSetupData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

export const SchoolAdminSetup: React.FC<SchoolAdminSetupProps> = ({
  data,
  updateData,
  onBack,
  onSubmit,
  isSubmitting,
  isEditMode = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<SchoolSetupData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SchoolSetupData> = {};

    if (isEditMode) {
      setErrors({});
      return true;
    }

    if (!data.adminName) {
      newErrors.adminName = 'Admin name is required';
    } else if (data.adminName.length < 2) {
      newErrors.adminName = 'Name must be at least 2 characters';
    }

    if (!data.adminEmail) {
      newErrors.adminEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.adminEmail)) {
      newErrors.adminEmail = 'Enter a valid email';
    }

    if (!data.adminPhone) {
      newErrors.adminPhone = 'Phone number is required';
    } else if (!/^01[3-9]\d{8}$/.test(data.adminPhone)) {
      newErrors.adminPhone = 'Enter a valid Bangladesh phone number';
    }

    if (!data.adminPassword) {
      newErrors.adminPassword = 'Password is required';
    } else if (data.adminPassword.length < 6) {
      newErrors.adminPassword = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.adminPassword)) {
      newErrors.adminPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!data.adminConfirmPassword) {
      newErrors.adminConfirmPassword = 'Please confirm your password';
    } else if (data.adminPassword !== data.adminConfirmPassword) {
      newErrors.adminConfirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
    if (errors[name as keyof SchoolSetupData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold text-slate-900">
          Admin Account Setup
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Create the administrator account for your school
        </p>

        <div className="space-y-5">
          {/* Admin Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="adminName"
                value={data.adminName || ''}
                onChange={handleInputChange}
                placeholder="Md. Rahim Khan"
                className={`w-full rounded-lg border ${
                  errors.adminName ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
              />
            </div>
            {errors.adminName && (
              <p className="mt-1.5 text-xs text-red-500">{errors.adminName}</p>
            )}
          </div>

          {/* Admin Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="adminEmail"
                value={data.adminEmail || ''}
                onChange={handleInputChange}
                placeholder="admin@school.com"
                className={`w-full rounded-lg border ${
                  errors.adminEmail ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
              />
            </div>
            {errors.adminEmail && (
              <p className="mt-1.5 text-xs text-red-500">{errors.adminEmail}</p>
            )}
          </div>

          {/* Admin Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="adminPhone"
                value={data.adminPhone || ''}
                onChange={handleInputChange}
                placeholder="017XXXXXXXX"
                className={`w-full rounded-lg border ${
                  errors.adminPhone ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
              />
            </div>
            {errors.adminPhone && (
              <p className="mt-1.5 text-xs text-red-500">{errors.adminPhone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="adminPassword"
                value={data.adminPassword || ''}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full rounded-lg border ${
                  errors.adminPassword ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.adminPassword && (
              <p className="mt-1.5 text-xs text-red-500">{errors.adminPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="adminConfirmPassword"
                value={data.adminConfirmPassword || ''}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full rounded-lg border ${
                  errors.adminConfirmPassword ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.adminConfirmPassword && (
              <p className="mt-1.5 text-xs text-red-500">{errors.adminConfirmPassword}</p>
            )}
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
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create School'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};