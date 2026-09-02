export interface School {
  id: string;
  name: string;
  nameBangla?: string;
  type: 'english_medium' | 'bangla_medium' | 'kindergarten' | 'coaching' | 'college';
  address: string;
  city: string;
  district: string;
  division: string;
  postCode: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  establishedYear?: number;
  academicYears: AcademicYear[];
  subscriptionPlan: 'starter' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'trial';
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  classes: Class[];
}

export interface Class {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  nameBangla?: string;
  sections: Section[];
  subjects: Subject[];
}

export interface Section {
  id: string;
  classId: string;
  name: string;
  capacity: number;
  currentStudents: number;
  teacherId?: string;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  nameBangla?: string;
  code: string;
  isOptional: boolean;
  creditHours?: number;
}

export interface SchoolSetupData {
  // Step 1: Basic Info
  schoolName: string;
  schoolNameBangla: string;
  schoolType: School['type'];
  establishedYear: number;
  address: string;
  city: string;
  district: string;
  division: string;
  postCode: string;
  phone: string;
  email: string;
  website: string;
  
  // Step 2: Academic Setup
  academicYearStart: Date;
  academicYearEnd: Date;
  classes: {
    name: string;
    nameBangla: string;
    sections: string[];
    subjects: string[];
  }[];
  
  // Step 3: Admin Setup
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  adminConfirmPassword: string;
}

export interface SchoolCreationResponse {
  school: School;
  adminUser: {
    id: string;
    name: string;
    email: string;
    role: 'school_admin';
  };
  message: string;
}

export interface SchoolContextType {
  currentSchool: School | null;
  schools: School[];
  isLoading: boolean;
  setCurrentSchool: (schoolId: string) => void;
  createSchool: (data: SchoolSetupData) => Promise<School>;
  updateSchool: (id: string, data: Partial<School>) => Promise<void>;
  getSchools: () => Promise<void>;
}