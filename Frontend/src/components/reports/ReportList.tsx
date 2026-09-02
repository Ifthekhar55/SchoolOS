import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { reportApi } from '../../services/reportApi';
import { Report } from '../../types/report';

interface ReportListProps {
  onSelect: (report: Report) => void;
}

export const ReportList: React.FC<ReportListProps> = ({ onSelect }) => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    reportApi.getReports().then((result) => setReports(result.reports || [])).catch(console.error);
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {reports.length === 0 ? (
        <p className="p-6 text-sm text-slate-500">No reports found.</p>
      ) : reports.map((report) => (
        <button key={report.id} type="button" onClick={() => onSelect(report)} className="flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50">
          <FileText size={18} className="text-blue-600" />
          <span className="flex-1 text-sm font-medium text-slate-900">{report.name}</span>
          <span className="text-xs text-slate-500">{report.status}</span>
        </button>
      ))}
    </div>
  );
};
