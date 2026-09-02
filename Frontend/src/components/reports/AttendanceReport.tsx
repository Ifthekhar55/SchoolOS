import React, { useState } from 'react';
import {
  Calendar,
  Download,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { reportApi } from '../../services/reportApi';
import { ReportFilters } from '../../types/report';

interface AttendanceReportProps {
  filters: ReportFilters;
  onGenerate: (data: any) => void;
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({
  filters,
  onGenerate,
}) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    try {
      setLoading(true);
      const data = await reportApi.generateAttendanceReport(filters);
      setReportData(data);
      onGenerate(data);
    } catch (error) {
      console.error('Failed to generate attendance report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Attendance Report</h3>
          <p className="text-xs text-slate-500">Detailed attendance analytics</p>
        </div>
        <button
          onClick={generateReport}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Generate
        </button>
      </div>

      {reportData && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {reportData.summary?.present || 0}
              </p>
              <p className="text-xs text-emerald-600">Present</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-center">
              <p className="text-2xl font-bold text-red-600">
                {reportData.summary?.absent || 0}
              </p>
              <p className="text-xs text-red-600">Absent</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {reportData.summary?.late || 0}
              </p>
              <p className="text-xs text-amber-600">Late</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {reportData.summary?.percentage || 0}%
              </p>
              <p className="text-xs text-blue-600">Attendance Rate</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-400">Student</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-400">Class</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-400">Present</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-400">Absent</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-400">Late</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold uppercase text-slate-400">%</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.students?.map((student: any, index: number) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2 text-sm text-slate-900">{student.name}</td>
                      <td className="px-4 py-2 text-sm text-slate-600">Class {student.class}</td>
                      <td className="px-4 py-2 text-center text-sm text-emerald-600">{student.present}</td>
                      <td className="px-4 py-2 text-center text-sm text-red-600">{student.absent}</td>
                      <td className="px-4 py-2 text-center text-sm text-amber-600">{student.late}</td>
                      <td className="px-4 py-2 text-center text-sm font-semibold text-blue-600">
                        {student.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};