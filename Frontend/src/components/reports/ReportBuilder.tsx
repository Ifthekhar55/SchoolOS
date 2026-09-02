import React, { useState } from 'react';
import { reportApi } from '../../services/reportApi';
import { ReportData, ReportFormat, ReportFilters, ReportType } from '../../types/report';

interface ReportBuilderProps {
  onGenerate: (data: ReportData) => void;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({ onGenerate }) => {
  const [type, setType] = useState<ReportType>('attendance');
  const [format, setFormat] = useState<ReportFormat>('json');
  const [loading, setLoading] = useState(false);
  const filters: ReportFilters = {};

  const generate = async () => {
    setLoading(true);
    try {
      const result = await reportApi.generateCustomReport({ type, filters, format });
      onGenerate(result.data);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <label className="text-sm text-slate-600">Type<select value={type} onChange={(event) => setType(event.target.value as ReportType)} className="mt-1 block rounded-md border border-slate-200 p-2"><option value="attendance">Attendance</option><option value="fee">Fees</option><option value="exam">Exams</option><option value="student">Students</option><option value="teacher">Teachers</option><option value="class">Classes</option></select></label>
      <label className="text-sm text-slate-600">Format<select value={format} onChange={(event) => setFormat(event.target.value as ReportFormat)} className="mt-1 block rounded-md border border-slate-200 p-2"><option value="json">JSON</option><option value="csv">CSV</option><option value="excel">Excel</option><option value="pdf">PDF</option></select></label>
      <button type="button" onClick={generate} disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? 'Generating...' : 'Generate report'}</button>
    </div>
  );
};
