export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'holiday';

export interface Attendance {
  id: string;
  schoolId: string;
  studentId: string;
  studentName?: string;
  studentRoll?: number;
  classId: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  date: Date;
  status: AttendanceStatus;
  markedBy: string;
  markedByName?: string;
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  isHoliday: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyAttendance {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: number;
  classId: string;
  sectionId: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
}

export interface ClassAttendance {
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  date: Date;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  attendancePercentage: number;
  students: DailyAttendance[];
}

export interface AttendanceFilters {
  classId?: string;
  sectionId?: string;
  studentId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

export interface AttendanceStatistics {
  overall: {
    present: number;
    absent: number;
    late: number;
    leave: number;
    total: number;
    percentage: number;
  };
  byClass: Array<{
    className: string;
    present: number;
    absent: number;
    percentage: number;
  }>;
  byDay: Array<{
    date: string;
    present: number;
    absent: number;
    percentage: number;
  }>;
  monthly: Array<{
    month: string;
    present: number;
    absent: number;
    percentage: number;
  }>;
}

export interface MarkAttendanceData {
  classId: string;
  sectionId: string;
  date: Date;
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    remarks?: string;
  }>;
}

export interface BulkAttendanceData {
  classId: string;
  sectionId: string;
  date: Date;
  defaultStatus?: AttendanceStatus;
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
  }>;
}

export interface AttendanceSummary {
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
  date: Date;
}