import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  UserCircle,
  Edit,
  Download,
  Printer,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Student } from '../../types/student';
import { StudentStatusBadge } from './StudentStatusBadge';
import { usePermissions } from '../../contexts/PermissionContext';
import { studentApi } from '../../services/studentApi';

interface StudentDetailsProps {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({
  student,
  onClose,
  onEdit,
}) => {
  const { hasPermission } = usePermissions();
  const [loginAccount, setLoginAccount] = useState<{ exists: boolean; email?: string | null; isActive?: boolean; isVerified?: boolean; userId?: string | null } | null>(null);
  const [resetPassword, setResetPassword] = useState<string>('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string>('');

  useEffect(() => {
    const loadLoginAccount = async () => {
      try {
        const data = await studentApi.getStudentLoginAccount(student.id);
        setLoginAccount(data);
      } catch (error) {
        console.error('Failed to fetch student login account:', error);
        setLoginAccount({ exists: false });
      }
    };

    loadLoginAccount();
  }, [student.id]);

  const handleResetPassword = async () => {
    try {
      setResetLoading(true);
      setResetError('');
      const response = await studentApi.resetStudentPassword(student.id);
      setResetPassword(response.tempPassword);
    } catch (error: any) {
      setResetError(error.message || 'Failed to reset student password');
    } finally {
      setResetLoading(false);
    }
  };

  const InfoRow = ({ label, value }: { label: string; value?: string | number | Date }) => (
    <div className="py-2 border-b border-slate-100 last:border-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-sm text-slate-900 mt-0.5">
        {value ? (typeof value === 'string' ? value : String(value)) : '—'}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <span>Class {student.class}</span>
                {student.section && <span>• Section {student.section}</span>}
                <span>• Roll {student.rollNumber}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Status */}
            <div className="md:col-span-2 flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <StudentStatusBadge isActive={student.isActive} isVerified={student.isVerified} />
              <span className="text-xs text-slate-500">
                Joined: {new Date(student.admissionDate).toLocaleDateString()}
              </span>
            </div>

            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-4">
                <InfoRow label="Full Name" value={student.name} />
                <InfoRow label="Name (Bangla)" value={student.nameBangla} />
                <InfoRow label="Email" value={student.email} />
                <InfoRow label="Phone" value={student.phone} />
                <InfoRow label="Gender" value={student.gender} />
                <InfoRow label="Blood Group" value={student.bloodGroup} />
                <InfoRow label="Religion" value={student.religion} />
                <InfoRow label="Nationality" value={student.nationality} />
                <InfoRow label="Date of Birth" value={student.birthDate ? new Date(student.birthDate).toLocaleDateString() : undefined} />
                <InfoRow label="Admission Date" value={new Date(student.admissionDate).toLocaleDateString()} />
              </div>
            </div>

            {/* Parent Information */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Parent Information
              </h3>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-4">
                <InfoRow label="Father's Name" value={student.fatherName} />
                <InfoRow label="Father's Phone" value={student.fatherPhone} />
                <InfoRow label="Father's Occupation" value={student.fatherOccupation} />
                <InfoRow label="Mother's Name" value={student.motherName} />
                <InfoRow label="Mother's Phone" value={student.motherPhone} />
                <InfoRow label="Mother's Occupation" value={student.motherOccupation} />
                <InfoRow label="Guardian's Name" value={student.guardianName} />
                <InfoRow label="Guardian's Phone" value={student.guardianPhone} />
                <InfoRow label="Guardian's Relation" value={student.guardianRelation} />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />
                Address
              </h3>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-4">
                <InfoRow label="Address" value={student.address} />
                <InfoRow label="Address (Bangla)" value={student.addressBangla} />
              </div>
            </div>

            {/* Login Credentials */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-600" />
                Login Credentials
              </h3>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoRow label="Login Email" value={loginAccount?.email || student.email || 'Not created'} />
                  <InfoRow label="Status" value={loginAccount?.exists ? (loginAccount.isActive ? 'Active' : 'Inactive') : 'No login account'} />
                </div>

                {loginAccount?.exists ? (
                  <div className="mt-4 flex flex-col gap-3 rounded-lg border border-blue-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500">Password</p>
                        <p className="text-sm text-slate-700">Reset available</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resetLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        <RefreshCw size={14} className={resetLoading ? 'animate-spin' : ''} />
                        {resetLoading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>

                    {resetPassword && (
                      <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        New temporary password: <span className="font-bold">{resetPassword}</span>
                      </div>
                    )}

                    {resetError && (
                      <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {resetError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
                    No login account was created for this student yet.
                  </div>
                )}
              </div>
            </div>

            {/* Other Information */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <UserCircle size={18} className="text-blue-600" />
                Other Information
              </h3>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-4">
                <InfoRow label="Emergency Contact" value={student.emergencyContact} />
                <div className="col-span-2">
                  <InfoRow label="Medical Information" value={student.medicalInfo} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <div className="text-xs text-slate-400">
            Created: {new Date(student.createdAt).toLocaleString()}
            {student.updatedAt && ` • Updated: ${new Date(student.updatedAt).toLocaleString()}`}
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Printer size={16} />
              Print
            </button>
            {hasPermission('students:edit') && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Edit size={16} />
                Edit Student
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};