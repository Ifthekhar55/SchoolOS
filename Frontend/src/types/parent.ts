export interface Child {
  id: string;
  name: string;
  nameBangla?: string;
  rollNumber: number;
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: Date;
  admissionDate: Date;
  photo?: string;
  isActive: boolean;
}

export interface ChildAttendance {
  date: Date;
  status: 'present' | 'absent' | 'late' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  className?: string;
  sectionName?: string;
}

export interface ChildFee {
  id: string;
  feeName: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  dueDate: Date;
  paidDate?: Date;
  month?: string;
  year?: number;
}

export interface ChildResult {
  examId: string;
  examName: string;
  examType: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  rank?: number;
  isPassed: boolean;
  subjectResults: {
    subjectName: string;
    fullMarks: number;
    obtainedMarks: number;
    grade: string;
    gradePoint: number;
    isPassed: boolean;
  }[];
}

export interface Notice {
  id: string;
  title: string;
  titleBangla?: string;
  content: string;
  contentBangla?: string;
  type: 'general' | 'academic' | 'fee' | 'emergency' | 'event';
  priority: 'low' | 'medium' | 'high';
  isPublished: boolean;
  publishedAt: Date;
  expiresAt?: Date;
  attachments?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  subject: string;
  message: string;
  isRead: boolean;
  isUrgent: boolean;
  sentAt: Date;
  readAt?: Date;
  attachments?: string[];
}

export interface ParentProfile {
  id: string;
  name: string;
  nameBangla?: string;
  email: string;
  phone: string;
  address?: string;
  occupation?: string;
  children: Child[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentDashboardData {
  children: Child[];
  attendanceSummary: {
    present: number;
    absent: number;
    late: number;
    leave: number;
    percentage: number;
  };
  feeSummary: {
    totalDue: number;
    totalPaid: number;
    overdueCount: number;
  };
  upcomingExams: UpcomingExam[];
  recentNotices: Notice[];
  unreadMessages: number;
}

export interface ParentFilters {
  childId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: ChildFee['status'];
  examId?: string;
  page?: number;
  limit?: number;
}

export interface UpcomingExam {
  id: string;
  name: string;
  type: string;
  examDate: Date;
}