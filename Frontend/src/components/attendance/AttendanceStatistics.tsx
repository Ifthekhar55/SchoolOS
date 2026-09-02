import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Calendar, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { attendanceApi } from '../../services/attendanceApi';
import { AttendanceStatistics as IAttendanceStatistics } from '../../types/attendance';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export const AttendanceStatisticsComponent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<IAttendanceStatistics | null>(null);
  const [dateRange, setDateRange] = useState({
    dateFrom: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
  });
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (classId) {
      loadSections();
    } else {
      setSections([]);
      setSectionId('');
    }
  }, [classId]);

  useEffect(() => {
    loadStatistics();
  }, [classId, sectionId, dateRange.dateFrom, dateRange.dateTo]);

  const loadClasses = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/classes?page=1&limit=999`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const loadSections = async () => {
    try {
      if (!classId) {
        setSections([]);
        return;
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/classes/${classId}/sections`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );
      const data = await response.json();
      setSections(data.sections || []);
    } catch (error) {
      console.error('Failed to load sections:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceApi.getAttendanceStatistics({
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
      });
      
      // Ensure data has the expected structure
      if (data && data.overall) {
        setStatistics(data);
      } else {
        // Initialize with default values if data is incomplete
        setStatistics({
          overall: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            leave: 0,
            percentage: 0,
          },
          byClass: [],
          byDay: [],
          monthly: [],
        });
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
      setError('Failed to load attendance statistics');
      setStatistics({
        overall: {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
          percentage: 0,
        },
        byClass: [],
        byDay: [],
        monthly: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await attendanceApi.exportAttendanceReport({
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
        format: 'csv',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="ml-3 text-sm text-slate-500">Loading statistics...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadStatistics}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // No data state - with safe default values
  if (!statistics || !statistics.overall) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No attendance data available</p>
        <button
          onClick={loadStatistics}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  // Safe access with default values
  const overall = statistics.overall || { total: 0, present: 0, absent: 0, late: 0, leave: 0, percentage: 0 };
  const byClass = statistics.byClass || [];
  const byDay = statistics.byDay || [];
  const monthly = statistics.monthly || [];

  const pieData = [
    { name: 'Present', value: overall.present || 0 },
    { name: 'Absent', value: overall.absent || 0 },
    { name: 'Late', value: overall.late || 0 },
    { name: 'On Leave', value: overall.leave || 0 },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Attendance Statistics</h2>
          <p className="text-sm text-slate-500">
            Overview of attendance patterns and trends
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadStatistics}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className="inline mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download size={16} className="inline mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Class
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                Class {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Section
          </label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Sections</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                Section {section.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Date From
          </label>
          <input
            type="date"
            value={dateRange.dateFrom}
            onChange={(e) => setDateRange(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Date To
          </label>
          <input
            type="date"
            value={dateRange.dateTo}
            onChange={(e) => setDateRange(prev => ({ ...prev, dateTo: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Overall Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Students</p>
          <p className="text-2xl font-bold text-slate-900">{overall.total || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Attendance Rate</p>
          <p className="text-2xl font-bold text-emerald-600">
            {overall.percentage || 0}%
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Present</p>
          <p className="text-2xl font-bold text-emerald-600">{overall.present || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Absent</p>
          <p className="text-2xl font-bold text-red-600">{overall.absent || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Attendance Distribution</h3>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">
              No data available
            </div>
          )}
        </div>

        {/* Bar Chart - By Class */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Attendance by Class</h3>
          {byClass.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byClass}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="className" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">
              No data available
            </div>
          )}
        </div>

        {/* Line Chart - Daily Trend */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Daily Attendance Trend</h3>
          {byDay.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
                  <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
                  <Line type="monotone" dataKey="percentage" stroke="#3b82f6" name="Attendance %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Monthly Summary</h3>
        {monthly.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-400">Month</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-400">Present</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-400">Absent</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase text-slate-400">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((month) => (
                  <tr key={month.month} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 text-sm text-slate-900">{month.month}</td>
                    <td className="px-4 py-2 text-right text-sm text-emerald-600">{month.present || 0}</td>
                    <td className="px-4 py-2 text-right text-sm text-red-600">{month.absent || 0}</td>
                    <td className="px-4 py-2 text-right text-sm font-semibold text-blue-600">
                      {month.percentage || 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No monthly data available
          </div>
        )}
      </div>
    </div>
  );
};