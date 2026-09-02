import { api } from './api';
import {
  Child,
  ChildAttendance,
  ChildFee,
  ChildResult,
  Notice,
  Message,
  ParentProfile,
  ParentDashboardData,
  ParentFilters,
  UpcomingExam,
} from '../types/parent';

type ApiChild = Child & { class?: string; section?: string };

const normalizeChild = (child: ApiChild): Child => ({
  ...child,
  classId: child.classId || child.className || child.class || '',
  className: child.className || child.class || '',
  sectionName: child.sectionName || child.section,
});

class ParentApiService {
  // ============ Dashboard ============

  async getDashboard(): Promise<ParentDashboardData> {
    const response = await api.request<ParentDashboardData & { children: ApiChild[] }>('/parent/dashboard');
    return { ...response, children: response.children.map(normalizeChild) };
  }

  // ============ Children ============

  async getChildren(): Promise<Child[]> {
    const response = await api.request<{ children: Child[] }>('/parent/children');
    return response.children.map(normalizeChild);
  }

  async getChild(id: string): Promise<Child> {
    const response = await api.request<{ child: Child }>(`/parent/children/${id}`);
    return response.child;
  }

  // ============ Attendance ============

  async getChildAttendance(childId: string, filters?: ParentFilters): Promise<ChildAttendance[]> {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString().split('T')[0]);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString().split('T')[0]);
    const response = await api.request<{ attendance: ChildAttendance[] }>(`/parent/children/${childId}/attendance?${params.toString()}`);
    return response.attendance;
  }

  async getAttendanceSummary(childId: string): Promise<{ present: number; absent: number; late: number; leave: number; percentage: number }> {
    return api.request<{ present: number; absent: number; late: number; leave: number; percentage: number }>(
      `/parent/children/${childId}/attendance-summary`
    );
  }

  // ============ Fees ============

  async getChildFees(childId: string, filters?: ParentFilters): Promise<ChildFee[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    const response = await api.request<{ fees: ChildFee[] }>(`/parent/children/${childId}/fees?${params.toString()}`);
    return response.fees;
  }

  async getFeeSummary(childId: string): Promise<{ totalDue: number; totalPaid: number; overdueCount: number }> {
    return api.request<{ totalDue: number; totalPaid: number; overdueCount: number }>(
      `/parent/children/${childId}/fee-summary`
    );
  }

  async makePayment(data: {
    childId: string;
    feeId: string;
    amount: number;
    method: string;
  }): Promise<{ success: boolean; message: string; transactionId: string }> {
    return api.request<{ success: boolean; message: string; transactionId: string }>('/parent/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async initiateOnlinePayment(data: {
    childId: string;
    feeId: string;
    amount: number;
    gateway: 'bkash' | 'nagad' | 'sslcommerz';
  }): Promise<{ paymentUrl: string; transactionId: string }> {
    return api.request<{ paymentUrl: string; transactionId: string }>('/parent/payments/online/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ Results ============

  async getChildResults(childId: string, filters?: ParentFilters): Promise<ChildResult[]> {
    const params = new URLSearchParams();
    if (filters?.examId) params.append('examId', filters.examId);
    const response = await api.request<{ results: ChildResult[] }>(`/parent/children/${childId}/results?${params.toString()}`);
    return response.results;
  }

  async getChildResult(childId: string, examId: string): Promise<ChildResult> {
    const response = await api.request<{ result: ChildResult }>(`/parent/children/${childId}/results/${examId}`);
    return response.result;
  }

  // ============ Notices ============

  async getNotices(filters?: { type?: string; priority?: string }): Promise<Notice[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.priority) params.append('priority', filters.priority);
    const response = await api.request<{ notices: Notice[] }>(`/parent/notices?${params.toString()}`);
    return response.notices;
  }

  async getNotice(id: string): Promise<Notice> {
    const response = await api.request<{ notice: Notice }>(`/parent/notices/${id}`);
    return response.notice;
  }

  // ============ Messages ============

  async getMessages(filters?: { isRead?: boolean }): Promise<Message[]> {
    const params = new URLSearchParams();
    if (filters?.isRead !== undefined) params.append('isRead', String(filters.isRead));
    const response = await api.request<{ messages: Message[] }>(`/parent/messages?${params.toString()}`);
    return response.messages;
  }

  async sendMessage(data: {
    receiverId: string;
    subject: string;
    message: string;
    isUrgent?: boolean;
  }): Promise<Message> {
    const response = await api.request<{ data: Message }>('/parent/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async markMessageAsRead(id: string): Promise<{ success: boolean }> {
    return api.request<{ success: boolean }>(`/parent/messages/${id}/read`, {
      method: 'POST',
    });
  }

  async deleteMessage(id: string): Promise<void> {
    return api.request<void>(`/parent/messages/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Profile ============

  async getProfile(): Promise<ParentProfile> {
    const response = await api.request<{ profile: ParentProfile }>('/parent/profile');
    return response.profile;
  }

  async updateProfile(data: Partial<ParentProfile>): Promise<ParentProfile> {
    const response = await api.request<{ profile: ParentProfile }>('/parent/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.profile;
  }

  // ============ Communication ============

  async getTeachers(childId: string): Promise<{ id: string; name: string; subject: string }[]> {
    const response = await api.request<{ teachers: { id: string; name: string; subject: string }[] }>(`/parent/children/${childId}/teachers`);
    return response.teachers;
  }

  async sendTeacherMessage(data: {
    teacherId: string;
    childId: string;
    subject: string;
    message: string;
  }): Promise<Message> {
    return api.request<Message>('/parent/teacher-messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ Report ============

  async getChildReport(childId: string, filters?: { format?: 'pdf' | 'csv' }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.format) params.append('format', filters.format);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/parent/children/${childId}/report?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
      }
    );
    return response.blob();
  }
}

export const parentApi = new ParentApiService();