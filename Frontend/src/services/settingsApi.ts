import { api } from './api';
import {
  SchoolProfile,
  AcademicSettings,
  FeeSettings,
  GradeSettings,
  NotificationSettings,
  SystemSettings,
  BackupSettings,
  SettingsResponse,
  Grade,
  Term,
} from '../types/settings';

class SettingsApiService {
  // ============ Get Settings ============

  async getSettings(): Promise<SettingsResponse> {
    return api.request<SettingsResponse>('/settings');
  }

  // ============ School Profile ============

  async updateSchoolProfile(data: Partial<SchoolProfile>): Promise<SchoolProfile> {
    return api.request<SchoolProfile>('/settings/school', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadLogo(file: File): Promise<{ logo: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return api.request<{ logo: string }>('/settings/school/logo', {
      method: 'POST',
      body: formData,
    });
  }

  // ============ Academic Settings ============

  async updateAcademicSettings(data: Partial<AcademicSettings>): Promise<AcademicSettings> {
    return api.request<AcademicSettings>('/settings/academic', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createTerm(data: Partial<Term>): Promise<Term> {
    return api.request<Term>('/settings/academic/terms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTerm(id: string, data: Partial<Term>): Promise<Term> {
    return api.request<Term>(`/settings/academic/terms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTerm(id: string): Promise<void> {
    return api.request<void>(`/settings/academic/terms/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Fee Settings ============

  async updateFeeSettings(data: Partial<FeeSettings>): Promise<FeeSettings> {
    return api.request<FeeSettings>('/settings/fees', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============ Grade Settings ============

  async updateGradeSettings(data: Partial<GradeSettings>): Promise<GradeSettings> {
    return api.request<GradeSettings>('/settings/grades', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createGrade(data: Partial<Grade>): Promise<Grade> {
    return api.request<Grade>('/settings/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGrade(id: string, data: Partial<Grade>): Promise<Grade> {
    return api.request<Grade>(`/settings/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGrade(id: string): Promise<void> {
    return api.request<void>(`/settings/grades/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Notification Settings ============

  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    return api.request<NotificationSettings>('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============ System Settings ============

  async updateSystemSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    return api.request<SystemSettings>('/settings/system', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============ Backup Settings ============

  async updateBackupSettings(data: Partial<BackupSettings>): Promise<BackupSettings> {
    return api.request<BackupSettings>('/settings/backup', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createBackup(): Promise<{ success: boolean; message: string; downloadUrl: string }> {
    return api.request<{ success: boolean; message: string; downloadUrl: string }>('/settings/backup/create', {
      method: 'POST',
    });
  }

  async restoreBackup(file: File): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('backup', file);
    return api.request<{ success: boolean; message: string }>('/settings/backup/restore', {
      method: 'POST',
      body: formData,
    });
  }

  // ============ System Health ============

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    database: boolean;
    storage: boolean;
    cache: boolean;
    uptime: string;
    memory: string;
  }> {
    return api.request('/settings/health');
  }
}

export const settingsApi = new SettingsApiService();