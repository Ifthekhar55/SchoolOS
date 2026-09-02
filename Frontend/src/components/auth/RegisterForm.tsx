import React, { useState } from 'react';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, School, 
  Loader2, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types/auth';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'school_admin',
    schoolName: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};

    if (!formData.name) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'school_admin' && !formData.schoolName) {
      newErrors.schoolName = 'School name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await register(formData);
      setRegistrationSuccess(true);
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (error: any) {
      setErrors({ 
        email: error.message || 'Registration failed. Please check your details and try again.'
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (registrationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 rounded-full bg-emerald-100 p-4">
          <CheckCircle className="h-12 w-12 text-emerald-600" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">Registration Successful!</h3>
        <p className="text-sm text-slate-500">
          Your account has been created. Redirecting to login...
        </p>
        <div className="mt-4 h-1 w-32 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-full animate-pulse bg-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Md. Rahim Khan"
            className={`w-full rounded-lg border ${
              errors.name ? 'border-red-500' : 'border-slate-200'
            } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
          />
        </div>
        {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="admin@school.com"
            className={`w-full rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-slate-200'
            } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
          />
        </div>
        {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
          Phone Number (Optional)
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="017XXXXXXXX"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Role Selection */}
      <div>
        <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-700">
          I am registering as
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
        >
          <option value="school_admin">School Administrator</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      {/* School Name (shown for school_admin) */}
      {formData.role === 'school_admin' && (
        <div>
          <label htmlFor="schoolName" className="mb-1.5 block text-sm font-medium text-slate-700">
            School Name
          </label>
          <div className="relative">
            <School className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="schoolName"
              name="schoolName"
              type="text"
              value={formData.schoolName}
              onChange={handleInputChange}
              placeholder="Greenfield International School"
              className={`w-full rounded-lg border ${
                errors.schoolName ? 'border-red-500' : 'border-slate-200'
              } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
            />
          </div>
          {errors.schoolName && (
            <p className="mt-1.5 text-xs text-red-500">{errors.schoolName}</p>
          )}
        </div>
      )}

      {/* Password */}
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            className={`w-full rounded-lg border ${
              errors.password ? 'border-red-500' : 'border-slate-200'
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
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
          <AlertCircle size={14} />
          <span>Must contain uppercase, lowercase, and number</span>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            className={`w-full rounded-lg border ${
              errors.confirmPassword ? 'border-red-500' : 'border-slate-200'
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
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Login Link */}
      <div className="text-center text-sm">
        <span className="text-slate-500">Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          Sign in
        </button>
      </div>
    </form>
  );
};