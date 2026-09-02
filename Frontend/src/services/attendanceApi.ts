import { api } from './api';
import {
  Attendance,
  ClassAttendance,
  AttendanceFilters,
  AttendanceStatistics,
  MarkAttendanceData,
  BulkAttendanceData,
  AttendanceSummary,
} from '../types/attendance';

class AttendanceApiService {
  // ============ Mark/Get Attendance ============

  async getAttendance(filters: AttendanceFilters): Promise<Attendance[]> {
    const params = new URLSearchParams();
    if (filters.classId) params.append('classId', filters.classId);
    if (filters.sectionId) params.append('sectionId', filters.sectionId);
    if (filters.studentId) params.append('studentId', filters.studentId);
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString().split('T')[0]);
    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString().split('T')[0]);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await api.request<{ attendance: Attendance[]; total: number; page: number; limit: number; totalPages: number }>(
      `/attendance?${params.toString()}`
    );
    return response.attendance || [];
  }

  async getClassAttendance(classId: string, sectionId: string, date: string): Promise<ClassAttendance> {
    return api.request<ClassAttendance>(`/attendance/class/${classId}/section/${sectionId}/date/${date}`);
  }

  async getStudentAttendance(studentId: string, dateFrom?: string, dateTo?: string): Promise<Attendance[]> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    const response = await api.request<{ attendance: Attendance[] }>(`/attendance/student/${studentId}?${params.toString()}`);
    return response.attendance || [];
  }

  async markAttendance(data: MarkAttendanceData): Promise<{ success: boolean; message: string; records: Attendance[] }> {
    return api.request<{ success: boolean; message: string; records: Attendance[] }>('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markBulkAttendance(data: BulkAttendanceData): Promise<{ success: boolean; message: string; records: Attendance[] }> {
    return api.request<{ success: boolean; message: string; records: Attendance[] }>('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAttendance(id: string, status: string, remarks?: string): Promise<Attendance> {
    return api.request<Attendance>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, remarks }),
    });
  }

  // ============ Reports & Statistics ============

  async getAttendanceSummary(params: {
    classId?: string;
    sectionId?: string;
    date?: string;
  }): Promise<AttendanceSummary> {
    const queryParams = new URLSearchParams();
    if (params.classId) queryParams.append('classId', params.classId);
    if (params.sectionId) queryParams.append('sectionId', params.sectionId);
    if (params.date) queryParams.append('date', params.date);
    return api.request<AttendanceSummary>(`/attendance/summary?${queryParams.toString()}`);
  }

  async getAttendanceStatistics(params: {
    classId?: string;
    sectionId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AttendanceStatistics> {
    const queryParams = new URLSearchParams();
    if (params.classId) queryParams.append('classId', params.classId);
    if (params.sectionId) queryParams.append('sectionId', params.sectionId);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    return api.request<AttendanceStatistics>(`/attendance/statistics?${queryParams.toString()}`);
  }

  async exportAttendanceReport(params: {
    classId?: string;
    sectionId?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'pdf' | 'csv' | 'excel';
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params.classId) queryParams.append('classId', params.classId);
    if (params.sectionId) queryParams.append('sectionId', params.sectionId);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params.format) queryParams.append('format', params.format);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/attendance/export?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
      }
    );
    return response.blob();
  }

  // ============ Notifications ============

  async sendAbsentNotification(studentId: string, date: string): Promise<{ success: boolean; message: string }> {
    return api.request<{ success: boolean; message: string }>('/attendance/notify-absent', {
      method: 'POST',
      body: JSON.stringify({ studentId, date }),
    });
  }

  async sendBulkAbsentNotification(classId: string, sectionId: string, date: string): Promise<{ success: boolean; message: string; count: number }> {
    return api.request<{ success: boolean; message: string; count: number }>('/attendance/notify-absent-bulk', {
      method: 'POST',
      body: JSON.stringify({ classId, sectionId, date }),
    });
  }

  // ============ QR/Biometric ============

  async scanQR(code: string): Promise<{ studentId: string; name: string; status: string }> {
    return api.request<{ studentId: string; name: string; status: string }>('/attendance/scan-qr', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async verifyBiometric(studentId: string, biometricData: string): Promise<{ success: boolean; studentId: string; name: string }> {
    return api.request<{ success: boolean; studentId: string; name: string }>('/attendance/verify-biometric', {
      method: 'POST',
      body: JSON.stringify({ studentId, biometricData }),
    });
  }

  // ============ Holidays ============

  async getHolidays(year: number): Promise<any[]> {
    return api.request<any[]>(`/attendance/holidays?year=${year}`);
  }

  async createHoliday(data: { name: string; date: string; description?: string }): Promise<any> {
    return api.request<any>('/attendance/holidays', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteHoliday(id: string): Promise<void> {
    return api.request<void>(`/attendance/holidays/${id}`, {
      method: 'DELETE',
    });
  }
}

export const attendanceApi = new AttendanceApiService();