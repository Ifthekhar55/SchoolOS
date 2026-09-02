import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  UserCircle,
  Save,
  Loader2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Users,
  Key,
} from 'lucide-react';
import { Teacher, CreateTeacherData } from '../../types/teacher';
import { teacherApi } from '../../services/teacherApi';

interface TeacherFormProps {
  teacher?: Teacher;
  schoolId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const departmentOptions = [
  'Science',
  'Mathematics',
  'English',
  'Bangla',
  'Social Science',
  'ICT',
  'Physical Education',
  'Arts',
  'Music',
  'Religion',
];
const designationOptions = [
  'Principal',
  'Vice Principal',
  'Senior Teacher',
  'Assistant Teacher',
  'Lecturer',
  'Instructor',
];
const genderOptions = ['male', 'female', 'other'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const religionOptions = ['islam', 'hindu', 'christian', 'buddhist', 'other'];

export const TeacherForm: React.FC<TeacherFormProps> = ({
  teacher,
  schoolId,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!teacher;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateTeacherData>>({
    name: '',
    nameBangla: '',
    email: '',
    phone: '',
    employeeId: '',
    designation: '',
    department: '',
    qualification: '',
    experience: '',
    specialization: '',
    joiningDate: new Date(),
    birthDate: new Date(),
    gender: 'male',
    bloodGroup: 'A+',
    religion: 'islam',
    nationality: 'Bangladeshi',
    address: '',
    addressBangla: '',
    emergencyContact: '',
    isActive: true,
    createUserAccount: false,
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name,
        nameBangla: teacher.nameBangla || '',
        email: teacher.email,
        phone: teacher.phone,
        employeeId: teacher.employeeId,
        designation: teacher.designation,
        department: teacher.department,
        qualification: teacher.qualification,
        experience: teacher.experience || '',
        specialization: teacher.specialization || '',
        joiningDate: new Date(teacher.joiningDate),
        birthDate: teacher.birthDate ? new Date(teacher.birthDate) : new Date(),
        gender: teacher.gender,
        bloodGroup: teacher.bloodGroup || 'A+',
        religion: teacher.religion || 'islam',
        nationality: teacher.nationality || 'Bangladeshi',
        address: teacher.address,
        addressBangla: teacher.addressBangla || '',
        emergencyContact: teacher.emergencyContact,
        isActive: teacher.isActive,
        createUserAccount: false,
        password: '',
      });
    }
  }, [teacher]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Teacher name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.phone) newErrors.phone = 'Phone is required';
    else if (!/^01[3-9]\d{8}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    
    if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.qualification) newErrors.qualification = 'Qualification is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.emergencyContact) newErrors.emergencyContact = 'Emergency contact is required';
    
    if (formData.createUserAccount && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

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
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate) : new Date(),
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      };

      if (isEditing && teacher) {
        const { schoolId: _schoolId, createUserAccount, password, id: _id, ...teacherUpdate } = data as any;
        await teacherApi.updateTeacher(teacher.id, {
          ...teacherUpdate,
          id: teacher.id,
        });
      } else {
        await teacherApi.createTeacher(data as CreateTeacherData);
      }
      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save teacher' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Teacher' : 'Add New Teacher'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update teacher information' : 'Add a new teacher to the system'}
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
        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
          {errors.submit && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              <AlertCircle size={18} />
              {errors.submit}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Personal Information
              </h3>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="Md. Rahim Khan"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Name (Bangla)
              </label>
              <input
                type="text"
                name="nameBangla"
                value={formData.nameBangla || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="মো. রহিম খান"
                dir="rtl"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="teacher@school.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.phone ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="017XXXXXXXX"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId || ''}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${
                    errors.employeeId ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="EMP-2024-001"
                />
              </div>
              {errors.employeeId && <p className="mt-1 text-xs text-red-500">{errors.employeeId}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                {genderOptions.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">Select</option>
                {bloodGroupOptions.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Religion
              </label>
              <select
                name="religion"
                value={formData.religion || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">Select</option>
                {religionOptions.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel.charAt(0).toUpperCase() + rel.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Bangladeshi"
              />
            </div>

            {/* Professional Information */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap size={18} className="text-blue-600" />
                Professional Information
              </h3>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Designation <span className="text-red-500">*</span>
              </label>
              <select
                name="designation"
                value={formData.designation || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.designation ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
              >
                <option value="">Select Designation</option>
                {designationOptions.map((desig) => (
                  <option key={desig} value={desig}>{desig}</option>
                ))}
              </select>
              {errors.designation && <p className="mt-1 text-xs text-red-500">{errors.designation}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.department ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
              >
                <option value="">Select Department</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Qualification <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.qualification ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                placeholder="M.Sc. in Mathematics"
              />
              {errors.qualification && <p className="mt-1 text-xs text-red-500">{errors.qualification}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Algebra, Calculus"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Experience (Years)
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="5 years"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Joining Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate ? new Date(formData.joiningDate).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />
                Address Information
              </h3>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  rows={2}
                  className={`w-full rounded-lg border ${
                    errors.address ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="House #12, Road #5, Block #A, Mirpur, Dhaka"
                />
              </div>
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Address (Bangla)
              </label>
              <textarea
                name="addressBangla"
                value={formData.addressBangla || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="বাড়ি #১২, রোড #৫, ব্লক #এ, মিরপুর, ঢাকা"
                dir="rtl"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Emergency Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.emergencyContact ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                placeholder="017XXXXXXXX"
              />
              {errors.emergencyContact && <p className="mt-1 text-xs text-red-500">{errors.emergencyContact}</p>}
            </div>

            {/* User Account Creation */}
            {!isEditing && (
              <div className="md:col-span-2">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    name="createUserAccount"
                    checked={formData.createUserAccount || false}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Create User Account
                    </label>
                    <p className="text-xs text-slate-500">
                      This will create a login account for the teacher
                    </p>
                  </div>
                </div>

                {formData.createUserAccount && (
                  <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border ${
                          errors.password ? 'border-red-500' : 'border-slate-200'
                        } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6">
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
                  {isEditing ? 'Update Teacher' : 'Add Teacher'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};