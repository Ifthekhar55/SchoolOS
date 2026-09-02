import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Edit,
  Printer,
  Award,
  Users,
  BookOpen,
} from 'lucide-react';
import { Teacher } from '../../types/teacher';
import { TeacherStatusBadge } from './TeacherStatusBadge';
import { usePermissions } from '../../contexts/PermissionContext';
import { teacherApi } from '../../services/teacherApi';

interface TeacherDetailsProps {
  teacher: Teacher;
  onClose: () => void;
  onEdit: () => void;
}

export const TeacherDetails: React.FC<TeacherDetailsProps> = ({
  teacher,
  onClose,
  onEdit,
}) => {
  const { hasPermission } = usePermissions();
  const [classesTaught, setClassesTaught] = useState<Array<{
    id: string;
    name: string;
    nameBangla?: string;
    sections: Array<{ id: string; name: string; nameBangla?: string; currentStudents: number; roomNumber?: string; }>; 
    classSubjects: Array<{ subject: { id: string; name: string; nameBangla?: string; code: string } }>;
  }>>([]);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await teacherApi.getTeacherClasses(teacher.id);
        setClassesTaught(response);
      } catch (error) {
        console.error('Failed to fetch teacher classes:', error);
        setClassesTaught([]);
      }
    };

    loadClasses();
  }, [teacher.id]);

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
              {teacher.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{teacher.name}</h2>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <span>{teacher.designation}</span>
                <span>•</span>
                <span>{teacher.department}</span>
                <span>•</span>
                <span>ID: {teacher.employeeId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Status */}
            <div className="md:col-span-2 flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <TeacherStatusBadge isActive={teacher.isActive} isVerified={teacher.isVerified} />
              <span className="text-xs text-slate-500">
                Joined: {new Date(teacher.joiningDate).toLocaleDateString()}
              </span>
            </div>

            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-4">
                <InfoRow label="Full Name" value={teacher.name} />
                <InfoRow label="Name (Bangla)" value={teacher.nameBangla} />
                <InfoRow label="Email" value={teacher.email} />
                <InfoRow label="Phone" value={teacher.phone} />
                <InfoRow label="Gender" value={teacher.gender} />
                <InfoRow label="Blood Group" value={teacher.bloodGroup} />
                <InfoRow label="Religion" value={teacher.religion} />
                <InfoRow label="Nationality" value={teacher.nationality} />
                <InfoRow label="Date of Birth" value={teacher.birthDate ? new Date(teacher.birthDate).toLocaleDateString() : undefined} />
              </div>
            </div>

            {/* Professional Information */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600" />
                Professional Information
              </h3>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-4">
                <InfoRow label="Employee ID" value={teacher.employeeId} />
                <InfoRow label="Designation" value={teacher.designation} />
                <InfoRow label="Department" value={teacher.department} />
                <InfoRow label="Qualification" value={teacher.qualification} />
                <InfoRow label="Specialization" value={teacher.specialization} />
                <InfoRow label="Experience" value={teacher.experience} />
                <InfoRow label="Joining Date" value={new Date(teacher.joiningDate).toLocaleDateString()} />
              </div>
            </div>

            {/* Classes Taught */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" />
                Classes Taught in This School
              </h3>
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                {classesTaught.length === 0 ? (
                  <p className="text-sm text-slate-500">No classes assigned yet.</p>
                ) : (
                  classesTaught.map((classItem) => (
                    <div key={classItem.id} className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{classItem.name}</p>
                          {classItem.nameBangla && (
                            <p className="text-xs text-slate-500">{classItem.nameBangla}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {classItem.sections.length > 0 ? (
                            classItem.sections.map((section) => (
                              <span key={section.id} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                {section.name}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">No sections</span>
                          )}
                        </div>
                      </div>

                      {classItem.classSubjects.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {classItem.classSubjects.map((entry) => (
                            <span key={entry.subject.id} className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                              {entry.subject.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />
                Address
              </h3>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-4">
                <div className="col-span-2">
                  <InfoRow label="Address" value={teacher.address} />
                </div>
                <div className="col-span-2">
                  <InfoRow label="Address (Bangla)" value={teacher.addressBangla} />
                </div>
              </div>
            </div>

            {/* Other Information */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Award size={18} className="text-blue-600" />
                Other Information
              </h3>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-4">
                <div className="col-span-2">
                  <InfoRow label="Emergency Contact" value={teacher.emergencyContact} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-[11px] leading-relaxed text-slate-400 sm:text-xs">
            Created: {new Date(teacher.createdAt).toLocaleString()}
            {teacher.updatedAt && ` • Updated: ${new Date(teacher.updatedAt).toLocaleString()}`}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:text-sm">
              <Printer size={16} />
              Print
            </button>
            {hasPermission('teachers:edit') && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 sm:text-sm"
              >
                <Edit size={16} />
                Edit Teacher
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};