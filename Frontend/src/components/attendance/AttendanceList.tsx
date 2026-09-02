import React, { useEffect, useState } from 'react';
import { Attendance } from '../../types/attendance';
import { attendanceApi } from '../../services/attendanceApi';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';

export const AttendanceList: React.FC = () => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        setRecords(await attendanceApi.getAttendance({ page: 1, limit: 100 }));
      } catch (error) {
        console.error('Failed to load attendance records:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);

  if (loading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading attendance...</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No attendance records found</td></tr>
            ) : records.map(record => (
              <tr key={record.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{record.studentName || record.studentId}</td>
                <td className="px-4 py-3 text-slate-600">{record.className || record.classId}{record.sectionName ? ` / ${record.sectionName}` : ''}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(record.date).toLocaleDateString()}</td>
                <td className="px-4 py-3"><AttendanceStatusBadge status={record.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
