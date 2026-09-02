import { api } from './api';
import {
  Notice,
  CreateNoticeData,
  UpdateNoticeData,
  NoticeFilters,
  NoticeListResponse,
  NoticeStatistics,
} from '../types/notice';
import { NoticeType, NoticePriority } from '../types/notice';

class NoticeApiService {
  // ============ Notices ============

  async getNotices(filters?: NoticeFilters): Promise<NoticeListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<NoticeListResponse>(`/notices?${params.toString()}`);
  }

  async getNotice(id: string): Promise<Notice> {
    return api.request<Notice>(`/notices/${id}`);
  }

  async createNotice(data: CreateNoticeData): Promise<Notice> {
    return api.request<Notice>('/notices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNotice(id: string, data: UpdateNoticeData): Promise<Notice> {
    return api.request<Notice>(`/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNotice(id: string): Promise<void> {
    return api.request<void>(`/notices/${id}`, {
      method: 'DELETE',
    });
  }

  async publishNotice(id: string): Promise<Notice> {
    return api.request<Notice>(`/notices/${id}/publish`, {
      method: 'POST',
    });
  }

  async unpublishNotice(id: string): Promise<Notice> {
    return api.request<Notice>(`/notices/${id}/unpublish`, {
      method: 'POST',
    });
  }

  async archiveNotice(id: string): Promise<Notice> {
    return api.request<Notice>(`/notices/${id}/archive`, {
      method: 'POST',
    });
  }

  // ============ Statistics ============

  async getStatistics(): Promise<NoticeStatistics> {
    return api.request<NoticeStatistics>('/notices/statistics');
  }

  // ============ Public/Published Notices ============

  async getPublishedNotices(filters?: {
    type?: NoticeType;
    priority?: NoticePriority;
    limit?: number;
  }): Promise<Notice[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return api.request<Notice[]>(`/notices/public?${params.toString()}`);
  }

  // ============ Attachments ============

  async uploadAttachment(noticeId: string, file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return api.request<{ url: string; filename: string }>(`/notices/${noticeId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  }

  async deleteAttachment(noticeId: string, filename: string): Promise<void> {
    return api.request<void>(`/notices/${noticeId}/attachments/${filename}`, {
      method: 'DELETE',
    });
  }
}

export const noticeApi = new NoticeApiService();