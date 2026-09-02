import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  UserCircle,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Student, CreateStudentData } from '../../types/student';
import { studentApi } from '../../services/studentApi';
import { classApi } from '../../services/classApi';
import { Class } from '../../types/class';

interface StudentFormProps {
  student?: Student;
  schoolId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const genderOptions = ['male', 'female', 'other'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const religionOptions = ['islam', 'hindu', 'christian', 'buddhist', 'other'];

export const StudentForm: React.FC<StudentFormProps> = ({
  student,
  schoolId,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!student;
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<CreateStudentData>>({
    name: '',
    nameBangla: '',
    email: '',
    phone: '',
    fatherName: '',
    fatherPhone: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelation: '',
    class: '',
    section: '',
    rollNumber: 0,
    admissionDate: new Date(),
    birthDate: new Date(),
    gender: 'male',
    bloodGroup: 'A+',
    religion: 'islam',
    nationality: 'Bangladeshi',
    address: '',
    addressBangla: '',
    emergencyContact: '',
    medicalInfo: '',
    isActive: true,
    createUserAccount: true,
    userPassword: '',
    userPasswordConfirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadClasses = async () => {
      if (!schoolId) {
        setClassesLoading(false);
        return;
      }

      try {
        setClassesLoading(true);
        const response = await classApi.getClasses({ isActive: true, limit: 100 });
        setClasses(response.classes || []);
      } catch (error) {
        console.error('Failed to load classes:', error);
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };

    loadClasses();
    if (student) {
      setFormData({
        name: student.name,
        nameBangla: student.nameBangla || '',
        email: student.email || '',
        phone: student.phone || '',
        fatherName: student.fatherName,
        fatherPhone: student.fatherPhone || '',
        fatherOccupation: student.fatherOccupation || '',
        motherName: student.motherName,
        motherPhone: student.motherPhone || '',
        motherOccupation: student.motherOccupation || '',
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        guardianRelation: student.guardianRelation || '',
        class: student.class,
        section: student.section || '',
        rollNumber: student.rollNumber,
        admissionDate: new Date(student.admissionDate),
        birthDate: student.birthDate ? new Date(student.birthDate) : new Date(),
        gender: student.gender,
        bloodGroup: student.bloodGroup || 'A+',
        religion: student.religion || 'islam',
        nationality: student.nationality || 'Bangladeshi',
        address: student.address,
        addressBangla: student.addressBangla || '',
        emergencyContact: student.emergencyContact,
        medicalInfo: student.medicalInfo || '',
        isActive: student.isActive,
      });
    }
  }, [student, schoolId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Student name is required';
    if (!formData.fatherName) newErrors.fatherName = 'Father\'s name is required';
    if (!formData.motherName) newErrors.motherName = 'Mother\'s name is required';
    if (!formData.class) newErrors.class = 'Class is required';
    else if (!classes.some((classItem) => classItem.name === formData.class)) {
      newErrors.class = 'Please select a class created in this school';
    }
    if (!formData.rollNumber) newErrors.rollNumber = 'Roll number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.emergencyContact) newErrors.emergencyContact = 'Emergency contact is required';

    if (formData.createUserAccount) {
      if (!formData.email) newErrors.email = 'Email is required to create student login';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

      if (!formData.userPassword) newErrors.userPassword = 'Password is required for student login';
      else if (String(formData.userPassword).length < 6) newErrors.userPassword = 'Password must be at least 6 characters';

      if (formData.userPassword && formData.userPassword !== formData.userPasswordConfirm) {
        newErrors.userPasswordConfirm = 'Passwords do not match';
      }
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^01[3-9]\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid Bangladesh phone number';
    }

    if (formData.emergencyContact && !/^01[3-9]\d{8}$/.test(formData.emergencyContact)) {
      newErrors.emergencyContact = 'Invalid Bangladesh phone number';
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
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : new Date(),
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      };

      if (formData.createUserAccount) {
        data.createUserAccount = true;
        data.userPassword = formData.userPassword;
      }

      if (isEditing && student) {
        const { id, schoolId: _schoolId, createdAt, updatedAt, isVerified, parentId, ...updatePayload } = data as any;
        await studentApi.updateStudent(student.id, { ...updatePayload, id: student.id });
      } else {
        const { id, schoolId: _ignoredSchoolId, createdAt, updatedAt, isVerified, parentId, ...createPayload } = data as any;
        await studentApi.createStudent(createPayload as CreateStudentData);
      }
      onSuccess();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save student' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const nextValue = name === 'rollNumber' ? (value === '' ? 0 : Number(value)) : value;

    setFormData(prev => ({
      ...prev,
      [name]: nextValue,
      ...(name === 'class' ? { section: '' } : {}),
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
              {isEditing ? 'Edit Student' : 'Add New Student'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update student information' : 'Add a new student to the system'}
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
                  placeholder="Md. Rahim Ahmed"
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
                placeholder="মো. রহিম আহমেদ"
                dir="rtl"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
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
                  placeholder="student@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    name="createUserAccount"
                    checked={Boolean(formData.createUserAccount)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        createUserAccount: checked,
                        ...(checked ? {} : { userPassword: '', userPasswordConfirm: '' }),
                      }));
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Create login account for this student
                </label>
                <p className="mt-2 text-xs text-slate-600">
                  This creates a matching student user so the student can log in later.
                </p>
              </div>
            </div>

            {formData.createUserAccount && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Student Login Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="userPassword"
                    value={formData.userPassword || ''}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border ${
                      errors.userPassword ? 'border-red-500' : 'border-slate-200'
                    } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                    placeholder="At least 6 characters"
                  />
                  {errors.userPassword && <p className="mt-1 text-xs text-red-500">{errors.userPassword}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="userPasswordConfirm"
                    value={formData.userPasswordConfirm || ''}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border ${
                      errors.userPasswordConfirm ? 'border-red-500' : 'border-slate-200'
                    } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                    placeholder="Re-enter password"
                  />
                  {errors.userPasswordConfirm && <p className="mt-1 text-xs text-red-500">{errors.userPasswordConfirm}</p>}
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone
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

            {/* Parent Information */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Parent Information
              </h3>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Father's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.fatherName ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                placeholder="Md. Abdul Karim"
              />
              {errors.fatherName && <p className="mt-1 text-xs text-red-500">{errors.fatherName}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Father's Phone
              </label>
              <input
                type="tel"
                name="fatherPhone"
                value={formData.fatherPhone || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="017XXXXXXXX"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Mother's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.motherName ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                placeholder="Mrs. Fatema Begum"
              />
              {errors.motherName && <p className="mt-1 text-xs text-red-500">{errors.motherName}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Mother's Phone
              </label>
              <input
                type="tel"
                name="motherPhone"
                value={formData.motherPhone || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="017XXXXXXXX"
              />
            </div>

            {/* Academic Information */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <UserCircle size={18} className="text-blue-600" />
                Academic Information
              </h3>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class"
                value={formData.class || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.class ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
              >
                <option value="">Select Class</option>
                {classesLoading && <option value="" disabled>Loading classes...</option>}
                {!classesLoading && classes.length === 0 && (
                  <option value="" disabled>No classes created yet</option>
                )}
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.name}>
                    {classItem.name} ({classItem.code})
                  </option>
                ))}
              </select>
              {errors.class && <p className="mt-1 text-xs text-red-500">{errors.class}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Section
              </label>
              <select
                name="section"
                value={formData.section || ''}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">Select Section</option>
                {classes
                  .find((classItem) => classItem.name === formData.class)
                  ?.sections?.map((section) => (
                    <option key={section.id} value={section.name}>
                      Section {section.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="rollNumber"
                value={formData.rollNumber || ''}
                onChange={handleInputChange}
                className={`w-full rounded-lg border ${
                  errors.rollNumber ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                placeholder="1"
              />
              {errors.rollNumber && <p className="mt-1 text-xs text-red-500">{errors.rollNumber}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Admission Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate ? new Date(formData.admissionDate).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
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

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Medical Information
              </label>
              <textarea
                name="medicalInfo"
                value={formData.medicalInfo || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Any allergies, medical conditions, or special needs"
              />
            </div>
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
                  {isEditing ? 'Update Student' : 'Add Student'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};