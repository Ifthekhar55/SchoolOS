export interface Student {
  id: string;
  schoolId: string;
  name: string;
  nameBangla?: string;
  email?: string;
  phone?: string;
  fatherName: string;
  fatherPhone?: string;
  fatherOccupation?: string;
  motherName: string;
  motherPhone?: string;
  motherOccupation?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  class: string;
  section?: string;
  rollNumber: number;
  admissionDate: Date;
  birthDate?: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  religion?: 'islam' | 'hindu' | 'christian' | 'buddhist' | 'other';
  nationality?: string;
  address: string;
  addressBangla?: string;
  emergencyContact: string;
  medicalInfo?: string;
  photo?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface CreateStudentData {
  name: string;
  nameBangla?: string;
  email?: string;
  phone?: string;
  fatherName: string;
  fatherPhone?: string;
  fatherOccupation?: string;
  motherName: string;
  motherPhone?: string;
  motherOccupation?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  class: string;
  section?: string;
  rollNumber: number;
  admissionDate: Date;
  birthDate?: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  religion?: 'islam' | 'hindu' | 'christian' | 'buddhist' | 'other';
  nationality?: string;
  address: string;
  addressBangla?: string;
  emergencyContact: string;
  medicalInfo?: string;
  photo?: string;
  isActive?: boolean;
  createUserAccount?: boolean;
  userPassword?: string;
  userPasswordConfirm?: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  id: string;
}

export interface StudentFilters {
  search?: string;
  class?: string;
  section?: string;
  gender?: 'male' | 'female' | 'other';
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentImportResult {
  success: boolean;
  successCount: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
    data: any;
  }>;
  imported: Student[];
}