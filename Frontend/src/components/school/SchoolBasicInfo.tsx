import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Calendar,
  ChevronRight 
} from 'lucide-react';
import { SchoolSetupData } from '../../types/school';

interface SchoolBasicInfoProps {
  data: Partial<SchoolSetupData>;
  updateData: (data: Partial<SchoolSetupData>) => void;
  onNext: () => void;
}

const divisions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
const districts = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Kishoreganj'],
  Chittagong: ['Chittagong', 'Cox\'s Bazar', 'Comilla', 'Feni', 'Noakhali'],
  // Add more districts as needed
};

export const SchoolBasicInfo: React.FC<SchoolBasicInfoProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const [errors, setErrors] = useState<Partial<SchoolSetupData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SchoolSetupData> = {};

    if (!data.schoolName) {
      newErrors.schoolName = 'School name is required';
    }

    if (!data.address) {
      newErrors.address = 'Address is required';
    }

    if (!data.city) {
      newErrors.city = 'City is required';
    }

    if (!data.district) {
      newErrors.district = 'District is required';
    }

    if (!data.division) {
      newErrors.division = 'Division is required';
    }

    if (!data.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^01[3-9]\d{8}$/.test(data.phone)) {
      newErrors.phone = 'Enter a valid Bangladesh phone number';
    }

    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
    // Clear error when user starts typing
    if (errors[name as keyof SchoolSetupData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-slate-900">
          School Information
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* School Name */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              School Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="schoolName"
                value={data.schoolName || ''}
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

          {/* School Name Bangla */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              School Name (Bangla)
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="schoolNameBangla"
                value={data.schoolNameBangla || ''}
                onChange={handleInputChange}
                placeholder="গ্রিনফিল্ড ইন্টারন্যাশনাল স্কুল"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                dir="rtl"
              />
            </div>
          </div>

          {/* School Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              School Type <span className="text-red-500">*</span>
            </label>
            <select
              name="schoolType"
              value={data.schoolType || ''}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            >
              <option value="">Select type</option>
              <option value="english_medium">English Medium</option>
              <option value="bangla_medium">Bangla Medium</option>
              <option value="kindergarten">Kindergarten</option>
              <option value="coaching">Coaching Academy</option>
              <option value="college">College</option>
            </select>
          </div>

          {/* Established Year */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Established Year
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                name="establishedYear"
                value={data.establishedYear || ''}
                onChange={handleInputChange}
                placeholder="2000"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea
                name="address"
                value={data.address || ''}
                onChange={handleInputChange}
                placeholder="House #12, Road #5, Block #A"
                rows={2}
                className={`w-full rounded-lg border ${
                  errors.address ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
              />
            </div>
            {errors.address && (
              <p className="mt-1.5 text-xs text-red-500">{errors.address}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={data.city || ''}
              onChange={handleInputChange}
              placeholder="Dhaka"
              className={`w-full rounded-lg border ${
                errors.city ? 'border-red-500' : 'border-slate-200'
              } bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
            />
            {errors.city && (
              <p className="mt-1.5 text-xs text-red-500">{errors.city}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              District <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="district"
              value={data.district || ''}
              onChange={handleInputChange}
              placeholder="Dhaka"
              className={`w-full rounded-lg border ${
                errors.district ? 'border-red-500' : 'border-slate-200'
              } bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
            />
            {errors.district && (
              <p className="mt-1.5 text-xs text-red-500">{errors.district}</p>
            )}
          </div>

          {/* Division */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Division <span className="text-red-500">*</span>
            </label>
            <select
              name="division"
              value={data.division || ''}
              onChange={handleInputChange}
              className={`w-full rounded-lg border ${
                errors.division ? 'border-red-500' : 'border-slate-200'
              } bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
            >
              <option value="">Select division</option>
              {divisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
            {errors.division && (
              <p className="mt-1.5 text-xs text-red-500">{errors.division}</p>
            )}
          </div>

          {/* Post Code */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Post Code
            </label>
            <input
              type="text"
              name="postCode"
              value={data.postCode || ''}
              onChange={handleInputChange}
              placeholder="1205"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={data.phone || ''}
                onChange={handleInputChange}
                placeholder="017XXXXXXXX"
                className={`w-full rounded-lg border ${
                  errors.phone ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                value={data.email || ''}
                onChange={handleInputChange}
                placeholder="info@school.com"
                className={`w-full rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                name="website"
                value={data.website || ''}
                onChange={handleInputChange}
                placeholder="www.school.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Next: Academic Setup
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </form>
  );
};