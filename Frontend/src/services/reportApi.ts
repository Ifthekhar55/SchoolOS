import { api } from './api';
import {
  Report,
  CreateReportData,
  ReportFilters,
  ReportData,
  ReportMetric,
  ReportChart,
  ReportType,
  ReportFormat,
} from '../types/report';

class ReportApiService {
  // ============ Reports ============

  async getReports(params?: {
    type?: ReportType;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ reports: Report[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    return api.request<any>(`/reports?${queryParams.toString()}`);
  }

  async getReport(id: string): Promise<Report> {
    return api.request<Report>(`/reports/${id}`);
  }

  async createReport(data: CreateReportData): Promise<Report> {
    return api.request<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReport(id: string, data: Partial<CreateReportData>): Promise<Report> {
    return api.request<Report>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReport(id: string): Promise<void> {
    return api.request<void>(`/reports/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Generate Reports ============

  async generateReport(id: string, format?: ReportFormat): Promise<{ data: ReportData; downloadUrl: string }> {
    const params = new URLSearchParams();
    if (format) params.append('format', format);
    return api.request<{ data: ReportData; downloadUrl: string }>(`/reports/${id}/generate?${params.toString()}`, {
      method: 'POST',
    });
  }

  async generateCustomReport(data: {
    type: ReportType;
    filters: ReportFilters;
    format: ReportFormat;
  }): Promise<{ data: ReportData; downloadUrl: string }> {
    return api.request<{ data: ReportData; downloadUrl: string }>('/reports/generate-custom', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ Download Reports ============

  async downloadReport(id: string, format: ReportFormat): Promise<Blob> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/reports/${id}/download?format=${format}`,
      {
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
      }
    );
    return response.blob();
  }

  // ============ Report Types ============

  async getReportTypes(): Promise<{ type: ReportType; label: string; description: string; icon: string }[]> {
    return api.request<{ type: ReportType; label: string; description: string; icon: string }[]>('/reports/types');
  }

  // ============ Scheduled Reports ============

  async scheduleReport(id: string, frequency: string, recipients: string[]): Promise<Report> {
    return api.request<Report>(`/reports/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ frequency, recipients }),
    });
  }

  async unscheduleReport(id: string): Promise<Report> {
    return api.request<Report>(`/reports/${id}/unschedule`, {
      method: 'POST',
    });
  }

  // ============ Dashboard Analytics ============

  async getDashboardAnalytics(params?: { dateFrom?: Date; dateTo?: Date }): Promise<{
    metrics: ReportMetric[];
    charts: ReportChart[];
    recentReports: Report[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom.toISOString().split('T')[0]);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo.toISOString().split('T')[0]);
    return api.request<any>(`/reports/dashboard-analytics?${queryParams.toString()}`);
  }

  // ============ Export ============

  async exportReport(id: string, format: ReportFormat): Promise<Blob> {
    return this.downloadReport(id, format);
  }

  // ============ Templates ============

  async getReportTemplates(): Promise<{ id: string; name: string; type: ReportType; description: string }[]> {
    return api.request<{ id: string; name: string; type: ReportType; description: string }[]>('/reports/templates');
  }

  async createFromTemplate(templateId: string, filters: ReportFilters): Promise<Report> {
    return api.request<Report>('/reports/from-template', {
      method: 'POST',
      body: JSON.stringify({ templateId, filters }),
    });
  }

  // ============ Auto-Generate Reports ============

  async generateAttendanceReport(filters: ReportFilters): Promise<ReportData> {
    return api.request<ReportData>('/reports/attendance', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async generateFeeReport(filters: ReportFilters): Promise<ReportData> {
    return api.request<ReportData>('/reports/fee', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async generateExamReport(filters: ReportFilters): Promise<ReportData> {
    return api.request<ReportData>('/reports/exam', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async generateStudentReport(filters: ReportFilters): Promise<ReportData> {
    return api.request<ReportData>('/reports/student', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async generateTeacherReport(filters: ReportFilters): Promise<ReportData> {
    return api.request<ReportData>('/reports/teacher', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async generateClassReport(filters: ReportFilters): Promise<ReportData> {
    return api.request<ReportData>('/reports/class', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }
}

export const reportApi = new ReportApiService();