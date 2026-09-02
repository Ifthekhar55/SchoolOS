export interface Class {
  id: string;
  schoolId: string;
  academicYearId: string;
  academicYear?: AcademicYear;
  name: string;
  nameBangla?: string;
  code: string;
  capacity: number;
  currentStudents: number;
  teacherId?: string;
  teacherName?: string;
  sections: Section[];
  subjects?: ClassSubject[];
  classSubjects?: ClassSubject[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface Section {
  id: string;
  classId: string;
  name: string;
  nameBangla?: string;
  code: string;
  capacity: number;
  currentStudents: number;
  teacherId?: string;
  teacherName?: string;
  roomNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassSubject {
  id: string;
  classId: string;
  sectionId?: string | null;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  subject?: {
    id: string;
    name: string;
    code?: string;
    subjectType?: string;
  };
  teacherId?: string;
  teacherName?: string;
  teacher?: {
    id: string;
    name: string;
    email?: string;
  };
  isCompulsory: boolean;
  creditHours?: number;
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
  isCurrent: boolean;
  classes: Class[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClassData {
  name: string;
  nameBangla?: string;
  code: string;
  capacity: number;
  academicYearId: string;
  teacherId?: string;
  sections?: CreateSectionData[];
  subjects?: string[];
  isActive?: boolean;
}

export interface CreateSectionData {
  name: string;
  nameBangla?: string;
  code: string;
  capacity: number;
  teacherId?: string;
  roomNumber?: string;
  isActive?: boolean;
}

export interface UpdateClassData extends Partial<CreateClassData> {
  id: string;
}

export interface UpdateSectionData extends Partial<CreateSectionData> {
  id: string;
}

export interface ClassFilters {
  search?: string;
  academicYearId?: string;
  teacherId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClassListResponse {
  classes: Class[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SectionListResponse {
  sections: Section[];
  total: number;
}

export interface ClassStatistics {
  total: number;
  active: number;
  inactive: number;
  totalStudents: number;
  totalSections: number;
  averageClassSize: number;
  byClass: Array<{ className: string; count: number }>;
}