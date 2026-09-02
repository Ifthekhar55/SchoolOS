export type ReportType = 
  | 'attendance'
  | 'fee'
  | 'exam'
  | 'student'
  | 'teacher'
  | 'class'
  | 'performance'
  | 'financial'
  | 'custom';

export type ReportFormat = 'pdf' | 'csv' | 'excel' | 'json';
export type ReportStatus = 'draft' | 'generated' | 'scheduled' | 'archived';
export type ReportFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Report {
  id: string;
  schoolId: string;
  name: string;
  nameBangla?: string;
  type: ReportType;
  description?: string;
  format: ReportFormat;
  status: ReportStatus;
  filters: ReportFilters;
  data?: any;
  generatedAt?: Date;
  expiresAt?: Date;
  scheduled?: boolean;
  frequency?: ReportFrequency;
  nextRunAt?: Date;
  recipients?: string[];
  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  classId?: string;
  sectionId?: string;
  studentId?: string;
  teacherId?: string;
  examId?: string;
  feeType?: string;
  status?: string;
  gender?: string;
  ageGroup?: string;
  customFields?: Record<string, any>;
}

export interface ReportData {
  summary: ReportSummary;
  charts: ReportChart[];
  tables: ReportTable[];
  metrics: ReportMetric[];
}

export interface ReportSummary {
  title: string;
  subtitle?: string;
  generatedAt: Date;
  totalRecords: number;
  filters: ReportFilters;
  metadata: Record<string, any>;
}

export interface ReportChart {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar';
  labels: string[];
  datasets: ReportDataset[];
  options?: Record<string, any>;
}

export interface ReportDataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
  borderColor?: string;
  fill?: boolean;
}

export interface ReportTable {
  id: string;
  title: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: string;
}

export interface ReportMetric {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: string;
  color?: string;
}

export interface CreateReportData {
  name: string;
  nameBangla?: string;
  type: ReportType;
  description?: string;
  format: ReportFormat;
  filters: ReportFilters;
  scheduled?: boolean;
  frequency?: ReportFrequency;
  recipients?: string[];
}

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  classId?: string;
  sectionId?: string;
  studentId?: string;
  teacherId?: string;
  examId?: string;
  feeType?: string;
  status?: string;
  gender?: string;
  ageGroup?: string;
  customFields?: Record<string, any>;
}