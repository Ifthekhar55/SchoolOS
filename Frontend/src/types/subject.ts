export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  nameBangla?: string;
  code: string;
  description?: string;
  classId: string;
  className?: string;
  teacherId?: string;
  teacherName?: string;
  creditHours: number;
  isCompulsory: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubjectData {
  name: string;
  nameBangla?: string;
  code: string;
  description?: string;
  classId: string;
  teacherId?: string;
  creditHours: number;
  isCompulsory?: boolean;
}

export interface UpdateSubjectData extends Partial<CreateSubjectData> {
  id: string;
}

export interface SubjectFilters {
  search?: string;
  classId?: string;
  teacherId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface SubjectListResponse {
  subjects: Subject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClassWithSubjects {
  classId: string;
  className: string;
  classNameBangla?: string;
  sectionCount: number;
  subjectCount: number;
  subjects: Subject[];
}

export interface SubjectStatistics {
  total: number;
  active: number;
  inactive: number;
  byClass: Array<{ className: string; count: number }>;
  byTeacher: Array<{ teacherName: string; count: number }>;
  compulsoryCount: number;
  optionalCount: number;
}

// ============ New Types for Subject Card View ============

export interface ClassSubjectDetail {
  id: string;
  classId: string;
  className: string;
  classNameBangla?: string;
  sectionId: string;
  sectionName: string;
  teacherId?: string;
  teacherName?: string;
  teacherEmail?: string;
  averageMarks: number;
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  highestMarks: number;
  lowestMarks: number;
}

export interface SubjectWithClasses {
  subjectId: string;
  subjectName: string;
  subjectNameBangla?: string;
  subjectCode: string;
  totalClasses: number;
  totalSections: number;
  totalTeachers: number;
  classDetails: ClassSubjectDetail[];
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  overallAverage: number;
  totalStudents: number;
  passRate: number;
  classPerformance: {
    className: string;
    average: number;
    students: number;
    passed: number;
    failed: number;
  }[];
}

export interface SubjectTeacher {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  classes: {
    classId: string;
    className: string;
    sectionId: string;
    sectionName: string;
    averageMarks: number;
    students: number;
  }[];
}

export interface SubjectSectionStats {
  sectionId: string;
  sectionName: string;
  className: string;
  teacherName?: string;
  totalStudents: number;
  averageMarks: number;
  passRate: number;
  highestMarks: number;
  lowestMarks: number;
  gradeDistribution: {
    grade: string;
    count: number;
  }[];
}

export interface SubjectGradeDistribution {
  grade: string;
  count: number;
  percentage: number;
  color: string;
}

// ============ Subject Card View Response Types ============

export interface SubjectCardViewResponse {
  subjects: SubjectCardItem[];
  total: number;
}

export interface SubjectCardItem {
  id: string;
  name: string;
  nameBangla?: string;
  code: string;
  isActive: boolean;
  totalClasses: number;
  totalSections: number;
  totalTeachers: number;
  averageMarks: number;
  passRate: number;
  color?: string;
  emoji?: string;
}

// ============ Subject Class Details Response ============

export interface SubjectClassDetailsResponse {
  subjectId: string;
  subjectName: string;
  subjectNameBangla?: string;
  subjectCode: string;
  classes: SubjectClassGroup[];
}

export interface SubjectClassGroup {
  classId: string;
  className: string;
  classNameBangla?: string;
  sections: SubjectSectionDetail[];
  classAverage: number;
  classPassRate: number;
  totalStudents: number;
}

export interface SubjectSectionDetail {
  sectionId: string;
  sectionName: string;
  teacherId?: string;
  teacherName?: string;
  teacherEmail?: string;
  totalStudents: number;
  averageMarks: number;
  passedStudents: number;
  failedStudents: number;
  highestMarks: number;
  lowestMarks: number;
  passRate: number;
  gradeDistribution: SubjectGradeDistribution[];
}

// ============ Helper Types ============

export interface SubjectStatsByClass {
  className: string;
  subjectCount: number;
  teacherCount: number;
  averageMarks: number;
  passRate: number;
}

export interface SubjectStatsByTeacher {
  teacherId: string;
  teacherName: string;
  subjectCount: number;
  classCount: number;
  averageMarks: number;
  studentCount: number;
}

// ============ Request/Response Types ============

export interface SubjectWithClassesRequest {
  subjectId: string;
  includeArchived?: boolean;
}

export interface SubjectClassDetailsRequest {
  subjectId: string;
  classId: string;
  sectionId?: string;
}

export interface SubjectPerformanceRequest {
  subjectId: string;
  fromDate?: Date;
  toDate?: Date;
}

// ============ API Response Types ============

export interface SubjectApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SubjectListApiResponse {
  success: boolean;
  subjects: Subject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubjectWithClassesApiResponse {
  success: boolean;
  data: SubjectWithClasses;
}

export interface SubjectStatisticsApiResponse {
  success: boolean;
  statistics: SubjectStatistics;
}