export type ExamType = 'class_test' | 'mid_term' | 'final' | 'board' | 'weekly' | 'monthly';
export type ExamStatus = 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'published';
export type GradeSystem = 'letter' | 'gpa' | 'percentage' | 'cgpa';

export interface Exam {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  nameBangla?: string;
  type: ExamType;
  code: string;
  description?: string;
  classId: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  subjects: ExamSubject[];
  startDate: Date;
  endDate: Date;
  examDate: Date;
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  weightage: number;
  status: ExamStatus;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamSubject {
  id: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherId?: string;
  teacherName?: string;
  fullMarks: number;
  passingMarks: number;
  duration: number;
  date: Date;
  time?: string;
  room?: string;
  isActive: boolean;
}

export interface MarkEntry {
  id: string;
  examId: string;
  subjectId: string;
  studentId: string;
  studentName: string;
  studentRoll: number;
  marksObtained: number;
  fullMarks: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  isPassed: boolean;
  remarks?: string;
  enteredBy?: string;
  enteredAt?: Date;
  updatedAt?: Date;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentRoll: number;
  classId: string;
  sectionId: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  gpa: number;
  cgpa?: number;
  rank?: number;
  isPassed: boolean;
  isPublished: boolean;
  subjectResults: SubjectResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  fullMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  gradePoint: number;
  isPassed: boolean;
}

export interface Grade {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint: number;
  description?: string;
  isPassing: boolean;
}

export interface CreateExamData {
  name: string;
  nameBangla?: string;
  type: ExamType;
  code: string;
  description?: string;
  classId: string;
  sectionId?: string;
  academicYearId: string;
  examDate?: Date;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  weightage?: number;
  subjects: {
    subjectId: string;
    fullMarks: number;
    passingMarks: number;
    duration: number;
    date: Date;
    time?: string;
    room?: string;
  }[];
  status?: ExamStatus;
}

export interface UpdateExamData extends Partial<CreateExamData> {
  id: string;
}

export interface ExamFilters {
  search?: string;
  type?: ExamType;
  classId?: string;
  sectionId?: string;
  academicYearId?: string;
  status?: ExamStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface ExamListResponse {
  exams: Exam[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MarkEntryData {
  examId: string;
  subjectId: string;
  marks: {
    studentId: string;
    marksObtained: number;
    remarks?: string;
  }[];
}

export interface ResultFilter {
  examId?: string;
  classId?: string;
  sectionId?: string;
  studentId?: string;
  isPublished?: boolean;
}

export interface GradeSystemConfig {
  id: string;
  schoolId: string;
  name: string;
  system: GradeSystem;
  grades: Grade[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}