import { api } from './api';
import {
  Class,
  ClassSubject,
  Section,
  AcademicYear,
  CreateClassData,
  CreateSectionData,
  UpdateClassData,
  UpdateSectionData,
  ClassFilters,
  ClassListResponse,
  SectionListResponse,
  ClassStatistics,
} from '../types/class';

class ClassApiService {
  // ============ Academic Years ============
  
  async getAcademicYears(schoolId: string): Promise<AcademicYear[]> {
    const response = await api.request<{ academicYears: AcademicYear[] }>(
      `/classes/academic-years?schoolId=${schoolId}`
    );
    return response.academicYears;
  }

  async createAcademicYear(data: any): Promise<AcademicYear> {
    const response = await api.request<{ academicYear: AcademicYear }>('/classes/academic-years', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.academicYear;
  }

  async updateAcademicYear(id: string, data: any): Promise<AcademicYear> {
    const response = await api.request<{ academicYear: AcademicYear }>(`/classes/academic-years/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.academicYear;
  }

  async setCurrentAcademicYear(id: string): Promise<AcademicYear> {
    const response = await api.request<{ academicYear: AcademicYear }>(`/classes/academic-years/${id}/set-current`, {
      method: 'POST',
    });
    return response.academicYear;
  }

  // ============ Classes ============

  async getClasses(filters?: ClassFilters): Promise<ClassListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<ClassListResponse>(`/classes?${params.toString()}`);
  }

  async getClass(id: string): Promise<Class> {
    const response = await api.request<{ class: Class }>(`/classes/${id}`);
    return response.class;
  }

  async createClass(data: CreateClassData): Promise<Class> {
    const response = await api.request<{ class: Class }>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.class;
  }

  async updateClass(id: string, data: UpdateClassData): Promise<Class> {
    const response = await api.request<{ class: Class }>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.class;
  }

  async deleteClass(id: string): Promise<void> {
    return api.request<void>(`/classes/${id}`, {
      method: 'DELETE',
    });
  }

  async activateClass(id: string): Promise<Class> {
    return api.request<Class>(`/classes/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateClass(id: string): Promise<Class> {
    return api.request<Class>(`/classes/${id}/deactivate`, {
      method: 'POST',
    });
  }

  async getClassStatistics(): Promise<ClassStatistics> {
    return api.request<ClassStatistics>('/classes/statistics');
  }

  // ============ Sections ============

  async getSections(classId: string): Promise<SectionListResponse> {
    return api.request<SectionListResponse>(`/classes/${classId}/sections`);
  }

  async getSection(id: string): Promise<Section> {
    return api.request<Section>(`/classes/sections/${id}`);
  }

  async createSection(classId: string, data: CreateSectionData): Promise<Section> {
    return api.request<Section>(`/classes/${classId}/sections`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSection(id: string, data: UpdateSectionData): Promise<Section> {
    return api.request<Section>(`/classes/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSection(id: string): Promise<void> {
    return api.request<void>(`/classes/sections/${id}`, {
      method: 'DELETE',
    });
  }

  async activateSection(id: string): Promise<Section> {
    return api.request<Section>(`/classes/sections/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateSection(id: string): Promise<Section> {
    return api.request<Section>(`/classes/sections/${id}/deactivate`, {
      method: 'POST',
    });
  }

  // ============ Class Subjects ============

  async getClassSubjects(classId: string): Promise<ClassSubject[]> {
    const response = await api.request<{ subjects: ClassSubject[] }>(
      `/classes/${classId}/subjects`
    );
    return response.subjects;
  }

  async assignSubject(classId: string, subjectId: string, data: any): Promise<ClassSubject> {
    return api.request<ClassSubject>(`/classes/${classId}/subjects`, {
      method: 'POST',
      body: JSON.stringify({ subjectId, ...data }),
    });
  }

  async removeSubject(classId: string, subjectId: string, sectionId?: string): Promise<void> {
    const query = sectionId ? `?sectionId=${encodeURIComponent(sectionId)}` : '';
    return api.request<void>(`/classes/${classId}/subjects/${subjectId}${query}`, {
      method: 'DELETE',
    });
  }

  async updateSubject(classId: string, subjectId: string, data: any): Promise<ClassSubject> {
    const query = data.sectionId ? `?sectionId=${encodeURIComponent(data.sectionId)}` : '';
    return api.request<ClassSubject>(`/classes/${classId}/subjects/${subjectId}${query}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============ Helper Methods ============

  async getAvailableTeachers(): Promise<any[]> {
    const response = await api.request<{ teachers: any[] }>('/classes/available-teachers');
    return response.teachers;
  }

  async getAvailableSubjects(): Promise<any[]> {
    const response = await api.request<{ subjects: any[] }>('/classes/available-subjects');
    return response.subjects;
  }
}

export const classApi = new ClassApiService();