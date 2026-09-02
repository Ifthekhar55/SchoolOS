import { api } from './api';
import {
  Teacher,
  CreateTeacherData,
  UpdateTeacherData,
  TeacherFilters,
  TeacherListResponse,
  TeacherImportResult,
  TeacherStatistics,
} from '../types/teacher';

class TeacherApiService {
  async getTeachers(filters?: TeacherFilters): Promise<TeacherListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<TeacherListResponse>(`/teachers?${params.toString()}`);
  }

  async getTeacher(id: string): Promise<Teacher> {
    return api.request<Teacher>(`/teachers/${id}`);
  }

  async getTeacherClasses(id: string): Promise<Array<{
    id: string;
    name: string;
    nameBangla?: string;
    sections: Array<{
      id: string;
      name: string;
      nameBangla?: string;
      currentStudents: number;
      teacherId?: string;
      roomNumber?: string;
    }>;
    classSubjects: Array<{
      subject: { id: string; name: string; nameBangla?: string; code: string };
    }>;
  }>> {
    const response = await api.request<{ classes: Array<{
      id: string;
      name: string;
      nameBangla?: string;
      sections: Array<{
        id: string;
        name: string;
        nameBangla?: string;
        currentStudents: number;
        teacherId?: string;
        roomNumber?: string;
      }>;
      classSubjects: Array<{
        subject: { id: string; name: string; nameBangla?: string; code: string };
      }>;
    }> }>('/teachers/' + id + '/classes');
    return response.classes;
  }

  async createTeacher(data: CreateTeacherData): Promise<Teacher> {
    const response = await api.request<{ teacher: Teacher }>('/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.teacher;
  }

  async updateTeacher(id: string, data: UpdateTeacherData): Promise<Teacher> {
    const response = await api.request<{ teacher: Teacher }>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.teacher;
  }

  async deleteTeacher(id: string): Promise<void> {
    return api.request<void>(`/teachers/${id}`, {
      method: 'DELETE',
    });
  }

  async activateTeacher(id: string): Promise<Teacher> {
    return api.request<Teacher>(`/teachers/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateTeacher(id: string): Promise<Teacher> {
    return api.request<Teacher>(`/teachers/${id}/deactivate`, {
      method: 'POST',
    });
  }

  async importTeachers(data: any[]): Promise<TeacherImportResult> {
    return api.request<TeacherImportResult>('/teachers/import', {
      method: 'POST',
      body: JSON.stringify({ teachers: data }),
    });
  }

  async exportTeachers(filters?: TeacherFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/teachers/export?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
      }
    );
    return response.blob();
  }

  async getStatistics(): Promise<TeacherStatistics> {
    const response = await api.request<{ statistics: TeacherStatistics }>('/teachers/statistics');
    return response.statistics;
  }

  async getMyClasses(): Promise<Array<{
    id: string;
    name: string;
    nameBangla?: string;
    classSubjects: Array<{ sectionId?: string | null; subject: { id: string; name: string; nameBangla?: string; code: string } }>;
    sections: Array<{
      id: string;
      name: string;
      nameBangla?: string;
      currentStudents: number;
      teacherId?: string;
      roomNumber?: string;
    }>;
  }>> {
    const response = await api.request<{ classes: Array<{
      id: string;
      name: string;
      nameBangla?: string;
      classSubjects: Array<{ sectionId?: string | null; subject: { id: string; name: string; nameBangla?: string; code: string } }>;
      sections: Array<{
        id: string;
        name: string;
        nameBangla?: string;
        currentStudents: number;
        teacherId?: string;
        roomNumber?: string;
      }>;
    }> }>('/teachers/my-classes');
    return response.classes;
  }

  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    return api.request<{ deleted: number }>('/teachers/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async getTeachersByDepartment(department: string): Promise<Teacher[]> {
    return api.request<Teacher[]>(`/teachers/department/${department}`);
  }

  async getAvailableTeachers(): Promise<Teacher[]> {
    return api.request<Teacher[]>('/teachers/available');
  }
}

export const teacherApi = new TeacherApiService();