import React from 'react';
import { ReportFilters as ReportFiltersType } from '../../types/report';

interface ReportFiltersProps {
  value?: ReportFiltersType;
  onChange?: (filters: ReportFiltersType) => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({ value = {}, onChange }) => (
  <div className="flex flex-wrap gap-3">
    <input aria-label="Class" value={value.classId || ''} onChange={(event) => onChange?.({ ...value, classId: event.target.value || undefined })} placeholder="Class ID" className="rounded-md border border-slate-200 p-2 text-sm" />
    <input aria-label="Student" value={value.studentId || ''} onChange={(event) => onChange?.({ ...value, studentId: event.target.value || undefined })} placeholder="Student ID" className="rounded-md border border-slate-200 p-2 text-sm" />
  </div>
);
