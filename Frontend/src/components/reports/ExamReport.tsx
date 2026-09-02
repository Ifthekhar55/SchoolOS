import React, { useState } from 'react';
import { reportApi } from '../../services/reportApi';
import { ReportData, ReportFilters } from '../../types/report';

interface ExamReportProps {
  filters: ReportFilters;
  onGenerate: (data: ReportData) => void;
}

export const ExamReport: React.FC<ExamReportProps> = ({ filters, onGenerate }) => {
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    setLoading(true);
    try { onGenerate(await reportApi.generateExamReport(filters)); } catch (error) { console.error('Failed to generate exam report:', error); } finally { setLoading(false); }
  };
  return <button type="button" onClick={generate} disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? 'Generating...' : 'Generate exam report'}</button>;
};
