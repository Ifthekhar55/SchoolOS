import React, { useState } from 'react';
import { reportApi } from '../../services/reportApi';
import { ReportData, ReportFilters } from '../../types/report';

interface FeeReportProps {
  filters: ReportFilters;
  onGenerate: (data: ReportData) => void;
}

export const FeeReport: React.FC<FeeReportProps> = ({ filters, onGenerate }) => {
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    setLoading(true);
    try { onGenerate(await reportApi.generateFeeReport(filters)); } catch (error) { console.error('Failed to generate fee report:', error); } finally { setLoading(false); }
  };
  return <button type="button" onClick={generate} disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? 'Generating...' : 'Generate fee report'}</button>;
};
