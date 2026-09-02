import { api } from './api';
import { School, SchoolSetupData, SchoolCreationResponse } from '../types/school';

class SchoolApiService {
  // Create a new school (multi-tenant setup)
  async createSchool(data: SchoolSetupData): Promise<SchoolCreationResponse> {
    const response = await api.request<SchoolCreationResponse>('/schools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  // Get all schools (for super admin)
  async getSchools(): Promise<School[]> {
    try {
      const response = await api.request<{ schools: School[]; success: boolean }>('/schools');
      return response.schools || [];
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      return [];
    }
  }

  // Get school by ID
  async getSchool(id: string): Promise<School> {
    const response = await api.request<{ school: School; success: boolean }>(`/schools/${id}`);
    return response.school;
  }

  // Update school
  async updateSchool(id: string, data: Partial<School>): Promise<School> {
    const response = await api.request<{ school: School; success: boolean; message: string }>(`/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.school;
  }

  // Delete school
  async deleteSchool(id: string): Promise<void> {
    await api.request<void>(`/schools/${id}`, {
      method: 'DELETE',
    });
  }

  // Get school's academic years
  async getAcademicYears(schoolId: string): Promise<any[]> {
    const response = await api.request<{ academicYears: any[]; success: boolean }>(`/schools/${schoolId}/academic-years`);
    return response.academicYears || [];
  }

  // Create academic year
  async createAcademicYear(schoolId: string, data: any): Promise<any> {
    const response = await api.request<{ academicYear: any; success: boolean; message: string }>(`/schools/${schoolId}/academic-years`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.academicYear;
  }

  // Get classes
  async getClasses(schoolId: string, academicYearId: string): Promise<any[]> {
    const response = await api.request<{ classes: any[]; success: boolean }>(`/schools/${schoolId}/academic-years/${academicYearId}/classes`);
    return response.classes || [];
  }

  // Create class
  async createClass(schoolId: string, academicYearId: string, data: any): Promise<any> {
    const response = await api.request<{ class: any; success: boolean; message: string }>(`/schools/${schoolId}/academic-years/${academicYearId}/classes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.class;
  }

  // Get subjects
  async getSubjects(schoolId: string): Promise<any[]> {
    const response = await api.request<{ subjects: any[]; success: boolean }>(`/schools/${schoolId}/subjects`);
    return response.subjects || [];
  }

  // Create subject
  async createSubject(schoolId: string, data: any): Promise<any> {
    const response = await api.request<{ subject: any; success: boolean; message: string }>(`/schools/${schoolId}/subjects`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.subject;
  }
}

export const schoolApi = new SchoolApiService();