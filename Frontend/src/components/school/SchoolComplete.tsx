import React, { useEffect } from 'react';
import { 
  CheckCircle, 
  Building2, 
  Users, 
  BookOpen,
  ArrowRight,
  Share2
} from 'lucide-react';

interface SchoolCompleteProps {
  schoolName: string;
  onComplete: () => void;
}

export const SchoolComplete: React.FC<SchoolCompleteProps> = ({
  schoolName,
  onComplete,
}) => {
  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-12 w-12 text-emerald-600" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          School Setup Complete! 🎉
        </h2>
        <p className="text-sm text-slate-500">
          Your school "{schoolName}" has been successfully created
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <Building2 className="mx-auto mb-2 h-6 w-6 text-blue-600" />
            <p className="text-xs font-medium text-blue-600">School Created</p>
            <p className="text-xs text-slate-500">Ready to manage</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-4">
            <Users className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
            <p className="text-xs font-medium text-emerald-600">Admin Account</p>
            <p className="text-xs text-slate-500">Created successfully</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <BookOpen className="mx-auto mb-2 h-6 w-6 text-purple-600" />
            <p className="text-xs font-medium text-purple-600">Academic Setup</p>
            <p className="text-xs text-slate-500">Classes configured</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Dashboard
            <ArrowRight size={18} />
          </button>

          <div className="flex justify-center gap-4 text-xs text-slate-500">
            <button className="hover:text-slate-700">
              <Share2 size={16} className="inline mr-1" />
              Share
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Redirecting to dashboard in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
};