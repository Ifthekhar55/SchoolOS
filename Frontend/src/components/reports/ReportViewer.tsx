import React from 'react';
import { Report } from '../../types/report';

interface ReportViewerProps {
  report: Report;
  onClose: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ report, onClose }) => (
  <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
    <div className="flex items-center justify-between">
      <div><h2 className="text-lg font-semibold text-slate-900">{report.name}</h2><p className="text-sm text-slate-500">{report.description || report.type}</p></div>
      <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600">Back</button>
    </div>
    <pre className="max-h-96 overflow-auto rounded-md bg-slate-50 p-4 text-xs text-slate-700">{JSON.stringify(report.data || report.filters, null, 2)}</pre>
  </div>
);
