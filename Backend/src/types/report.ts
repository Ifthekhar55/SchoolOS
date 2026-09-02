export interface ReportFilters {
  dateFrom?: Date | string;
  dateTo?: Date | string;
  classId?: string;
  sectionId?: string;
  studentId?: string;
  teacherId?: string;
  examId?: string;
  feeType?: string;
  status?: string;
  gender?: string;
  ageGroup?: string;
  customFields?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ReportSummary {
  title: string;
  subtitle?: string;
  generatedAt: Date;
  totalRecords: number;
  filters: ReportFilters;
  metadata: Record<string, unknown>;
}

export interface ReportDataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
  borderColor?: string;
  fill?: boolean;
}

export interface ReportChart {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar';
  labels: string[];
  datasets: ReportDataset[];
  options?: Record<string, unknown>;
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

export interface ReportData {
  summary: ReportSummary;
  charts: ReportChart[];
  tables: ReportTable[];
  metrics: ReportMetric[];
}