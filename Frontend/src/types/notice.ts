export type NoticeType = 'general' | 'academic' | 'fee' | 'emergency' | 'event';
export type NoticePriority = 'low' | 'medium' | 'high';
export type NoticeStatus = 'draft' | 'published' | 'archived' | 'expired';

export interface Notice {
  id: string;
  schoolId: string;
  title: string;
  titleBangla?: string;
  content: string;
  contentBangla?: string;
  type: NoticeType;
  priority: NoticePriority;
  status: NoticeStatus;
  isPublished: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  targetClasses?: string[];
  targetSections?: string[];
  attachments?: string[];
  createdBy: string;
  createdByName?: string;
  creatorRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoticeData {
  title: string;
  titleBangla?: string;
  content: string;
  contentBangla?: string;
  type: NoticeType;
  priority: NoticePriority;
  publishedAt?: Date;
  expiresAt?: Date;
  targetClasses?: string[];
  targetSections?: string[];
  attachments?: string[];
}

export interface UpdateNoticeData extends Partial<CreateNoticeData> {
  id: string;
}

export interface NoticeFilters {
  search?: string;
  type?: NoticeType;
  priority?: NoticePriority;
  status?: NoticeStatus;
  isPublished?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface NoticeListResponse {
  notices: Notice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NoticeStatistics {
  total: number;
  published: number;
  draft: number;
  archived: number;
  expired: number;
  byType: Array<{ type: NoticeType; count: number }>;
  byPriority: Array<{ priority: NoticePriority; count: number }>;
  recent: Notice[];
}