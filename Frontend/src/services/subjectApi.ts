import { api } from './api';
import {
  Subject,
  CreateSubjectData,
  UpdateSubjectData,
  SubjectFilters,
  SubjectListResponse,
  ClassWithSubjects,
  SubjectStatistics,
  SubjectWithClasses,
  SubjectPerformance,
  SubjectTeacher,
  SubjectCardViewResponse,
  SubjectWithClassesRequest,
  SubjectClassDetailsRequest,
  SubjectPerformanceRequest,
  SubjectApiResponse,
  SubjectListApiResponse,
  SubjectWithClassesApiResponse,
  SubjectStatisticsApiResponse,
} from '../types/subject';

class SubjectApiService {
  // ============ Subjects ============

  async getSubjects(filters?: SubjectFilters): Promise<SubjectListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<SubjectListResponse>(`/subjects?${params.toString()}`);
  }

  async getSubject(id: string): Promise<Subject> {
    return api.request<Subject>(`/subjects/${id}`);
  }

  async createSubject(data: CreateSubjectData): Promise<Subject> {
    const response = await api.request<{ subject: Subject }>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.subject;
  }

  async updateSubject(id: string, data: UpdateSubjectData): Promise<Subject> {
    const response = await api.request<{ subject: Subject }>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.subject;
  }

  async deleteSubject(id: string): Promise<void> {
    return api.request<void>(`/subjects/${id}`, {
      method: 'DELETE',
    });
  }

  async activateSubject(id: string): Promise<Subject> {
    return api.request<Subject>(`/subjects/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateSubject(id: string): Promise<Subject> {
    return api.request<Subject>(`/subjects/${id}/deactivate`, {
      method: 'POST',
    });
  }

  // ============ Class Subjects ============

  async getClassSubjects(classId: string): Promise<Subject[]> {
    const response = await api.request<{ subjects: Subject[] }>(`/subjects/class/${classId}`);
    return response.subjects;
  }

  async getClassesWithSubjects(): Promise<ClassWithSubjects[]> {
    const response = await api.request<{ data: ClassWithSubjects[] }>('/subjects/classes-with-subjects');
    return response.data;
  }

  async assignTeacher(subjectId: string, teacherId: string): Promise<Subject> {
    return api.request<Subject>(`/subjects/${subjectId}/assign-teacher`, {
      method: 'POST',
      body: JSON.stringify({ teacherId }),
    });
  }

  // ============ Statistics ============

  async getStatistics(): Promise<SubjectStatistics> {
    return api.request<SubjectStatistics>('/subjects/statistics');
  }

  // ============ Bulk Operations ============

  async bulkCreateSubjects(classId: string, subjects: CreateSubjectData[]): Promise<Subject[]> {
    return api.request<Subject[]>(`/subjects/bulk`, {
      method: 'POST',
      body: JSON.stringify({ classId, subjects }),
    });
  }

  async bulkDeleteSubjects(ids: string[]): Promise<{ deleted: number }> {
    return api.request<{ deleted: number }>('/subjects/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  // ============ New Methods for Subject Card View ============

  /**
   * Get subject with all class and section details
   * @param subjectId - The subject ID
   * @param includeArchived - Whether to include archived classes (default: false)
   * @returns SubjectWithClasses - Complete subject data with class details
   */
  async getSubjectWithClasses(subjectId: string, includeArchived: boolean = false): Promise<SubjectWithClasses> {
    const params = new URLSearchParams();
    params.append('includeArchived', String(includeArchived));
    return api.request<SubjectWithClasses>(`/subjects/${subjectId}/classes?${params.toString()}`);
  }

  /**
   * Get subject performance statistics
   * @param subjectId - The subject ID
   * @param fromDate - Optional start date
   * @param toDate - Optional end date
   * @returns SubjectPerformance - Performance metrics
   */
  async getSubjectPerformance(subjectId: string, fromDate?: Date, toDate?: Date): Promise<SubjectPerformance> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate.toISOString());
    if (toDate) params.append('toDate', toDate.toISOString());
    return api.request<SubjectPerformance>(`/subjects/${subjectId}/performance?${params.toString()}`);
  }

  /**
   * Get teachers teaching a specific subject
   * @param subjectId - The subject ID
   * @returns SubjectTeacher[] - Array of teachers with their classes
   */
  async getSubjectTeachers(subjectId: string): Promise<SubjectTeacher[]> {
    return api.request<SubjectTeacher[]>(`/subjects/${subjectId}/teachers`);
  }

  /**
   * Get subject card view data (compact view for dashboard)
   * @param filters - Optional filters
   * @returns SubjectCardViewResponse - Compact subject data for cards
   */
  async getSubjectCardView(filters?: {
    search?: string;
    isActive?: boolean;
    limit?: number;
  }): Promise<SubjectCardViewResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<SubjectCardViewResponse>(`/subjects/card-view?${params.toString()}`);
  }

  /**
   * Get detailed class-wise subject data for a specific subject
   * @param subjectId - The subject ID
   * @returns SubjectClassDetailsResponse - Class-wise detailed data
   */
  async getSubjectClassDetails(subjectId: string): Promise<SubjectWithClasses> {
    const response = await api.request<{ data: SubjectWithClasses }>(`/subjects/${subjectId}/classes`);
    return response.data;
  }

  /**
   * Get grade distribution for a subject
   * @param subjectId - The subject ID
   * @param classId - Optional class ID
   * @param sectionId - Optional section ID
   * @returns Grade distribution data
   */
  async getSubjectGradeDistribution(
    subjectId: string,
    classId?: string,
    sectionId?: string
  ): Promise<{
    grades: { grade: string; count: number; percentage: number; color: string }[];
    totalStudents: number;
  }> {
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (sectionId) params.append('sectionId', sectionId);
    return api.request<any>(`/subjects/${subjectId}/grade-distribution?${params.toString()}`);
  }

  /**
   * Get subject performance by class
   * @param subjectId - The subject ID
   * @returns Performance data by class
   */
  async getSubjectPerformanceByClass(subjectId: string): Promise<{
    className: string;
    average: number;
    students: number;
    passed: number;
    failed: number;
    passRate: number;
  }[]> {
    return api.request<any[]>(`/subjects/${subjectId}/performance-by-class`);
  }

  /**
   * Get subject performance by section
   * @param subjectId - The subject ID
   * @param classId - The class ID
   * @returns Performance data by section
   */
  async getSubjectPerformanceBySection(subjectId: string, classId: string): Promise<{
    sectionName: string;
    teacherName?: string;
    average: number;
    students: number;
    passed: number;
    failed: number;
    passRate: number;
  }[]> {
    return api.request<any[]>(`/subjects/${subjectId}/class/${classId}/performance-by-section`);
  }

  /**
   * Get subject pass rate trend
   * @param subjectId - The subject ID
   * @param months - Number of months to look back (default: 6)
   * @returns Trend data
   */
  async getSubjectPassRateTrend(subjectId: string, months: number = 6): Promise<{
    month: string;
    passRate: number;
    average: number;
    students: number;
  }[]> {
    return api.request<any[]>(`/subjects/${subjectId}/pass-rate-trend?months=${months}`);
  }

  /**
   * Export subject performance report
   * @param subjectId - The subject ID
   * @param format - Export format (pdf, csv, excel)
   * @param classId - Optional class ID
   * @param sectionId - Optional section ID
   * @returns Blob - The exported file
   */
  async exportSubjectReport(
    subjectId: string,
    format: 'pdf' | 'csv' | 'excel' = 'pdf',
    classId?: string,
    sectionId?: string
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (classId) params.append('classId', classId);
    if (sectionId) params.append('sectionId', sectionId);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/subjects/${subjectId}/export-report?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
      }
    );
    return response.blob();
  }

  /**
   * Get subject teacher performance
   * @param subjectId - The subject ID
   * @param teacherId - The teacher ID
   * @returns Teacher performance data
   */
  async getSubjectTeacherPerformance(subjectId: string, teacherId: string): Promise<{
    teacherName: string;
    classes: {
      className: string;
      sectionName: string;
      average: number;
      students: number;
      passed: number;
      failed: number;
      passRate: number;
    }[];
    overallAverage: number;
    overallPassRate: number;
    totalStudents: number;
  }> {
    return api.request<any>(`/subjects/${subjectId}/teacher/${teacherId}/performance`);
  }

  /**
   * Get subject summary for dashboard
   * @param subjectId - The subject ID
   * @returns Subject summary data
   */
  async getSubjectSummary(subjectId: string): Promise<{
    name: string;
    nameBangla?: string;
    code: string;
    totalClasses: number;
    totalSections: number;
    totalTeachers: number;
    totalStudents: number;
    overallAverage: number;
    passRate: number;
    highestMarks: number;
    lowestMarks: number;
    topPerformer?: {
      studentName: string;
      marks: number;
      className: string;
      sectionName: string;
    };
  }> {
    return api.request<any>(`/subjects/${subjectId}/summary`);
  }

  /**
   * Get all subject names (for dropdowns)
   * @param isActive - Filter by active status
   * @returns Subject name and ID list
   */
  async getSubjectNames(isActive: boolean = true): Promise<{ id: string; name: string; nameBangla?: string }[]> {
    const params = new URLSearchParams();
    params.append('isActive', String(isActive));
    return api.request<any[]>(`/subjects/names?${params.toString()}`);
  }

  /**
   * Search subjects with autocomplete
   * @param query - Search query
   * @param limit - Max results (default: 10)
   * @returns Subject list
   */
  async searchSubjects(query: string, limit: number = 10): Promise<Subject[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', String(limit));
    return api.request<Subject[]>(`/subjects/search?${params.toString()}`);
  }
}

export const subjectApi = new SubjectApiService();