import { api } from './api';
import {
  Exam,
  ExamSubject,
  MarkEntry,
  ExamResult,
  CreateExamData,
  UpdateExamData,
  ExamFilters,
  ExamListResponse,
  MarkEntryData,
  ResultFilter,
  GradeSystemConfig,
  Grade,
} from '../types/exam';

class ExamApiService {
  // ============ Exams ============

  async getExams(filters?: ExamFilters): Promise<ExamListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<ExamListResponse>(`/exams?${params.toString()}`);
  }

  async getExam(id: string): Promise<Exam> {
    const response = await api.request<{ exam: Exam }>(`/exams/${id}`);
    return response.exam;
  }

  async createExam(data: CreateExamData): Promise<Exam> {
    return api.request<Exam>('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExam(id: string, data: UpdateExamData): Promise<Exam> {
    return api.request<Exam>(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExam(id: string): Promise<void> {
    return api.request<void>(`/exams/${id}`, {
      method: 'DELETE',
    });
  }

  async publishExam(id: string): Promise<Exam> {
    return api.request<Exam>(`/exams/${id}/publish`, {
      method: 'POST',
    });
  }

  async unpublishExam(id: string): Promise<Exam> {
    return api.request<Exam>(`/exams/${id}/unpublish`, {
      method: 'POST',
    });
  }

  // ============ Exam Subjects ============

  async getExamSubjects(examId: string): Promise<ExamSubject[]> {
    return api.request<ExamSubject[]>(`/exams/${examId}/subjects`);
  }

  async addExamSubject(examId: string, data: any): Promise<ExamSubject> {
    return api.request<ExamSubject>(`/exams/${examId}/subjects`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExamSubject(examId: string, subjectId: string, data: any): Promise<ExamSubject> {
    return api.request<ExamSubject>(`/exams/${examId}/subjects/${subjectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeExamSubject(examId: string, subjectId: string): Promise<void> {
    return api.request<void>(`/exams/${examId}/subjects/${subjectId}`, {
      method: 'DELETE',
    });
  }

  // ============ Marks Entry ============

  async getMarks(examId: string, subjectId: string): Promise<MarkEntry[]> {
    const response = await api.request<{ marks: MarkEntry[] }>(
      `/exams/${examId}/subjects/${subjectId}/marks`
    );
    return response.marks;
  }

  async enterMarks(examId: string, subjectId: string, data: MarkEntryData): Promise<MarkEntry[]> {
    const response = await api.request<{ marks: MarkEntry[] }>(`/exams/${examId}/subjects/${subjectId}/marks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.marks;
  }

  async updateMarks(examId: string, subjectId: string, studentId: string, data: any): Promise<MarkEntry> {
    return api.request<MarkEntry>(`/exams/${examId}/subjects/${subjectId}/marks/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getStudentMarks(studentId: string, examId?: string): Promise<MarkEntry[]> {
    const params = new URLSearchParams();
    if (examId) params.append('examId', examId);
    const response = await api.request<{ marks: MarkEntry[] }>(`/exams/students/${studentId}/marks?${params.toString()}`);
    return response.marks;
  }

  // ============ Results ============

  async getResults(filters?: ResultFilter): Promise<ExamResult[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.request<{ results: ExamResult[] }>(`/exams/results?${params.toString()}`);
    return response.results || [];
  }

  async getStudentResult(studentId: string, examId: string): Promise<ExamResult> {
    return api.request<ExamResult>(`/exams/students/${studentId}/results/${examId}`);
  }

  async generateResults(examId: string): Promise<ExamResult[]> {
    return api.request<ExamResult[]>(`/exams/${examId}/generate-results`, {
      method: 'POST',
    });
  }

  async publishResults(examId: string): Promise<{ success: boolean; message: string }> {
    return api.request<{ success: boolean; message: string }>(`/exams/${examId}/publish-results`, {
      method: 'POST',
    });
  }

  async exportResults(examId: string, format?: 'pdf' | 'csv' | 'excel'): Promise<Blob> {
    const params = new URLSearchParams();
    if (format) params.append('format', format);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/exams/${examId}/export-results?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
      }
    );
    return response.blob();
  }

  async getClassResult(classId: string, sectionId: string, examId: string): Promise<ExamResult[]> {
    return api.request<ExamResult[]>(`/classes/${classId}/sections/${sectionId}/results/${examId}`);
  }

  // ============ Grade System ============

  async getGradeSystems(): Promise<GradeSystemConfig[]> {
    return api.request<GradeSystemConfig[]>('/grade-systems');
  }

  async getGradeSystem(id: string): Promise<GradeSystemConfig> {
    return api.request<GradeSystemConfig>(`/grade-systems/${id}`);
  }

  async createGradeSystem(data: any): Promise<GradeSystemConfig> {
    return api.request<GradeSystemConfig>('/grade-systems', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGradeSystem(id: string, data: any): Promise<GradeSystemConfig> {
    return api.request<GradeSystemConfig>(`/grade-systems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGradeSystem(id: string): Promise<void> {
    return api.request<void>(`/grade-systems/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultGradeSystem(id: string): Promise<GradeSystemConfig> {
    return api.request<GradeSystemConfig>(`/grade-systems/${id}/set-default`, {
      method: 'POST',
    });
  }

  // ============ Statistics ============

  async getExamStatistics(params: {
    classId?: string;
    sectionId?: string;
    examId?: string;
    academicYearId?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, String(value));
      }
    });
    return api.request<any>(`/exams/statistics?${queryParams.toString()}`);
  }

  async getStudentReport(studentId: string): Promise<any> {
    return api.request<any>(`/students/${studentId}/report`);
  }

  async getClassReport(classId: string, sectionId: string): Promise<any> {
    return api.request<any>(`/classes/${classId}/sections/${sectionId}/report`);
  }
}

export const examApi = new ExamApiService();