import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  User,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoginCredentials } from '../../types/auth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill demo credentials with animation
  const fillDemoCredentials = (email: string, password: string) => {
    setFormData({ email, password, rememberMe: true });
    setLoginError('');
    setErrors({});
  };

  const demoAccounts = [
    { label: 'Super Admin', email: 'admin@schoolos.com', password: 'password123' },
    { label: 'School Admin', email: 'school@demo.com', password: 'password123' },
    { label: 'Teacher', email: 'teacher@demo.com', password: 'password123' },
    { label: 'Student', email: 'student@demo.com', password: 'password123' },
    { label: 'Parent', email: 'parent@demo.com', password: 'password123' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    setLoginError('');
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess(false);
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      console.log('📤 Attempting login with:', formData.email);
      await login(formData);
      setLoginSuccess(true);
      console.log('✅ Login successful, redirecting...');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setLoginError(error.message || 'Invalid email or password. Please try again.');
      // Shake animation for error feedback
      const form = document.querySelector('form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  // Handle Enter key for quick login
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
      {/* Error Alert */}
      {loginError && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 animate-slideDown">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{loginError}</span>
        </div>
      )}

      {/* Success Alert */}
      {loginSuccess && (
        <div className="flex items-start gap-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600 border border-emerald-200 animate-slideDown">
          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Login successful! Redirecting to dashboard...</span>
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="admin@school.com"
            className={`w-full rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
            } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500/20`}
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 animate-slideDown">
            <AlertCircle className="h-3 w-3" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            className={`w-full rounded-lg border ${
              errors.password ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
            } bg-slate-50 py-3 pl-10 pr-12 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-500/20`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 animate-slideDown">
            <AlertCircle className="h-3 w-3" />
            {errors.password}
          </p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
          />
          <span>Remember me</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
      >
        {isSubmitting || isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isLoading ? 'Checking...' : 'Signing in...'}
          </>
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </button>

      {/* Register Link */}
      <div className="text-center text-sm">
        <span className="text-slate-500">Don't have an account? </span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          Create an account
        </button>
      </div>

      {/* Demo Credentials with Quick Fill */}
      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-blue-600" />
          <p className="text-xs font-medium text-blue-800">Quick Demo Access</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemoCredentials(account.email, account.password)}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 border border-blue-100 hover:border-blue-300 text-left"
            >
              <span className="block font-semibold text-slate-700">{account.label}</span>
              <span className="text-[10px] text-slate-400">{account.email}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-slate-400">
          Click any role to auto-fill credentials
        </p>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out forwards;
        }
      `}</style>
    </form>
  );
};