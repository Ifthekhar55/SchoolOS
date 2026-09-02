export interface Teacher {
  id: string;
  schoolId: string;
  name: string;
  nameBangla?: string;
  email: string;
  phone: string;
  employeeId: string;
  designation: string;
  department: string;
  qualification: string;
  experience?: string;
  specialization?: string;
  joiningDate: Date;
  birthDate?: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  religion?: 'islam' | 'hindu' | 'christian' | 'buddhist' | 'other';
  nationality?: string;
  address: string;
  addressBangla?: string;
  emergencyContact: string;
  photo?: string;
  isActive: boolean;
  isVerified: boolean;
  userId?: string; // Link to user account
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateTeacherData {
  name: string;
  nameBangla?: string;
  email: string;
  phone: string;
  employeeId: string;
  designation: string;
  department: string;
  qualification: string;
  experience?: string;
  specialization?: string;
  joiningDate: Date;
  birthDate?: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  religion?: 'islam' | 'hindu' | 'christian' | 'buddhist' | 'other';
  nationality?: string;
  address: string;
  addressBangla?: string;
  emergencyContact: string;
  photo?: string;
  isActive?: boolean;
  createUserAccount?: boolean;
  password?: string;
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  id: string;
}

export interface TeacherFilters {
  search?: string;
  department?: string;
  designation?: string;
  gender?: 'male' | 'female' | 'other';
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TeacherListResponse {
  teachers: Teacher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TeacherImportResult {
  success: boolean;
  successCount: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
    data: any;
  }>;
  imported: Teacher[];
}

export interface TeacherStatistics {
  total: number;
  active: number;
  inactive: number;
  byDepartment: Array<{ department: string; count: number }>;
  byDesignation: Array<{ designation: string; count: number }>;
  byGender: Array<{ gender: string; count: number }>;
}