import { api } from './api';
import { 
  Student, 
  CreateStudentData, 
  UpdateStudentData, 
  StudentFilters, 
  StudentListResponse,
  StudentImportResult 
} from '../types/student';

class StudentApiService {
  // Get students with filters
  async getStudents(filters?: StudentFilters): Promise<StudentListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<StudentListResponse>(`/students?${params.toString()}`);
  }

  // Get a single student
  async getStudent(id: string): Promise<Student> {
    return api.request<Student>(`/students/${id}`);
  }

  // Create a new student
  async createStudent(data: CreateStudentData): Promise<Student> {
    return api.request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update a student
  async updateStudent(id: string, data: UpdateStudentData): Promise<Student> {
    return api.request<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getStudentLoginAccount(studentId: string): Promise<{ exists: boolean; email?: string | null; isActive?: boolean; isVerified?: boolean; userId?: string | null }> {
    return api.request<{ exists: boolean; email?: string | null; isActive?: boolean; isVerified?: boolean; userId?: string | null }>(`/students/${studentId}/login-account`);
  }

  async resetStudentPassword(studentId: string, password?: string): Promise<{ email: string; tempPassword: string; message: string }> {
    return api.request<{ email: string; tempPassword: string; message: string }>(`/students/${studentId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(password ? { password } : {}),
    });
  }

  // Delete a student
  async deleteStudent(id: string): Promise<void> {
    return api.request<void>(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Activate a student
  async activateStudent(id: string): Promise<Student> {
    return api.request<Student>(`/students/${id}/activate`, {
      method: 'POST',
    });
  }

  // Deactivate a student
  async deactivateStudent(id: string): Promise<Student> {
    return api.request<Student>(`/students/${id}/deactivate`, {
      method: 'POST',
    });
  }

  // Bulk import students
  async importStudents(data: any[]): Promise<StudentImportResult> {
    return api.request<StudentImportResult>('/students/import', {
      method: 'POST',
      body: JSON.stringify({ students: data }),
    });
  }

  // Export students
  async exportStudents(filters?: StudentFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/students/export?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
      }
    );
    return response.blob();
  }

  // Get student statistics
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byClass: Array<{ class: string; count: number }>;
    byGender: Array<{ gender: string; count: number }>;
  }> {
    const response = await api.request<{ statistics: {
      total: number;
      active: number;
      inactive: number;
      byClass: Array<{ class: string; count: number }>;
      byGender: Array<{ gender: string; count: number }>;
    } }>('/students/statistics');
    return response.statistics;
  }

  // Bulk delete students
  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    return api.request<{ deleted: number }>('/students/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  // Get students by class
  async getStudentsByClass(classId: string): Promise<Student[]> {
    return api.request<Student[]>(`/students/class/${classId}`);
  }
}

export const studentApi = new StudentApiService();