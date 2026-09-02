import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { parentApi } from '../../services/parentApi';
import { ChildAttendance as IChildAttendance } from '../../types/parent';
import { AttendanceStatusBadge } from '../attendance/AttendanceStatusBadge';

interface ChildAttendanceProps {
  childId: string;
}

export const ChildAttendance: React.FC<ChildAttendanceProps> = ({ childId }) => {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<IChildAttendance[]>([]);
  const [summary, setSummary] = useState<{ present: number; absent: number; late: number; leave: number; percentage: number } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadAttendance();
  }, [childId, currentMonth]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const [attendanceData, summaryData] = await Promise.all([
        parentApi.getChildAttendance(childId, {
          dateFrom: startDate,
          dateTo: endDate,
        }),
        parentApi.getAttendanceSummary(childId),
      ]);

      setAttendance(attendanceData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const getStatusForDate = (date: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateObj = new Date(year, month, date);
    const found = attendance.find(a => 
      new Date(a.date).getDate() === date && 
      new Date(a.date).getMonth() === month &&
      new Date(a.date).getFullYear() === year
    );
    return found?.status || null;
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const statusColors: Record<string, string> = {
    present: 'bg-emerald-500 hover:bg-emerald-600',
    absent: 'bg-red-500 hover:bg-red-600',
    late: 'bg-amber-500 hover:bg-amber-600',
    leave: 'bg-blue-500 hover:bg-blue-600',
  };

  const statusIcons: Record<string, any> = {
    present: CheckCircle,
    absent: XCircle,
    late: Clock,
    leave: AlertCircle,
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Attendance</h2>
          <p className="text-sm text-slate-500">
            Monthly attendance overview
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAttendance}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className="inline mr-2" />
            Refresh
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} className="inline mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-5">
          <div className="rounded-lg bg-emerald-50 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{summary.present}</p>
            <p className="text-xs text-emerald-600">Present</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
            <p className="text-xs text-red-600">Absent</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{summary.late}</p>
            <p className="text-xs text-amber-600">Late</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{summary.leave}</p>
            <p className="text-xs text-blue-600">On Leave</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{summary.percentage}%</p>
            <p className="text-xs text-slate-500">Attendance Rate</p>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-slate-400" />
            <span className="font-semibold text-slate-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
          </div>
          <button
            onClick={handleNextMonth}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-slate-500">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const date = i + 1;
              const status = getStatusForDate(date);
              const Icon = status ? statusIcons[status] : null;
              const color = status ? statusColors[status] : '';

              return (
                <div
                  key={date}
                  className={`relative flex aspect-square items-center justify-center rounded-lg p-2 text-sm transition-colors ${
                    status ? `text-white ${color}` : 'hover:bg-slate-50'
                  }`}
                >
                  {date}
                  {status && Icon && (
                    <Icon size={12} className="absolute -top-1 -right-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-200 px-4 py-3">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${color.replace('hover:', '')}`} />
              <span className="text-xs text-slate-600 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Check In</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Check Out</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendance.slice(0, 10).map((record, index) => (
                  <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <AttendanceStatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {record.checkInTime || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {record.checkOutTime || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {record.remarks || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};