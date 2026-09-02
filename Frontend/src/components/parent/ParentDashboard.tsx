import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Bell,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  ArrowRight,
  Download,
} from 'lucide-react';
import { parentApi } from '../../services/parentApi';
import { ParentDashboardData, Child } from '../../types/parent';
import { ChildSelector } from './ChildSelector';
import { AttendanceStatusBadge } from '../attendance/AttendanceStatusBadge';

interface ParentDashboardProps {
  onSelectChild: (childId: string) => void;
  selectedChildId?: string;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  onSelectChild,
  selectedChildId,
}) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<ParentDashboardData | null>(null);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashboard, childrenData] = await Promise.all([
        parentApi.getDashboard(),
        parentApi.getChildren(),
      ]);
      setDashboardData(dashboard);
      setChildren(childrenData);
      
      if (childrenData.length > 0 && !selectedChildId) {
        onSelectChild(childrenData[0].id);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!dashboardData || children.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-2 text-slate-500">No children found</p>
        <p className="text-sm text-slate-400">Please contact the school to add your children</p>
      </div>
    );
  }

  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Parent Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back! Here's an overview of your children's progress
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} className="inline mr-2" />
            Download Report
          </button>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <ChildSelector
          children={children}
          selectedChildId={selectedChildId}
          onSelect={onSelectChild}
        />
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Children</p>
              <p className="text-2xl font-bold text-slate-900">{children.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users size={20} />
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Attendance</p>
              <p className="text-2xl font-bold text-emerald-600">
                {dashboardData.attendanceSummary.percentage}%
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Due</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(dashboardData.feeSummary.totalDue)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Messages</p>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData.unreadMessages}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <MessageSquare size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Attendance Summary</h3>
            <button
              onClick={() => onSelectChild(children[0]?.id)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View Details
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">Present</span>
              </div>
              <span className="text-sm font-medium text-slate-900">
                {dashboardData.attendanceSummary.present}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm text-slate-600">Absent</span>
              </div>
              <span className="text-sm font-medium text-slate-900">
                {dashboardData.attendanceSummary.absent}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-sm text-slate-600">Late</span>
              </div>
              <span className="text-sm font-medium text-slate-900">
                {dashboardData.attendanceSummary.late}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm text-slate-600">On Leave</span>
              </div>
              <span className="text-sm font-medium text-slate-900">
                {dashboardData.attendanceSummary.leave}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Fee Status</h3>
            <button
              onClick={() => onSelectChild(children[0]?.id)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View Details
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Paid</span>
              <span className="text-sm font-medium text-emerald-600">
                {formatCurrency(dashboardData.feeSummary.totalPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Due</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(dashboardData.feeSummary.totalDue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Overdue Fees</span>
              <span className="text-sm font-medium text-red-700">
                {dashboardData.feeSummary.overdueCount}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: dashboardData.feeSummary.totalDue + dashboardData.feeSummary.totalPaid > 0
                    ? `${(dashboardData.feeSummary.totalPaid / (dashboardData.feeSummary.totalDue + dashboardData.feeSummary.totalPaid)) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Notices */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recent Notices</h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData.recentNotices.slice(0, 3).map((notice) => (
              <div
                key={notice.id}
                className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className={`mt-1 h-2 w-2 rounded-full ${
                  notice.priority === 'high' ? 'bg-red-500' :
                  notice.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {notice.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(notice.publishedAt).toLocaleDateString()}
                  </p>
                </div>
                <Eye size={16} className="text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Upcoming Exams</h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>
          {dashboardData.upcomingExams.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming exams</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.upcomingExams.slice(0, 3).map((exam) => (
                <div
                    key={exam.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {exam.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {exam.type}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};