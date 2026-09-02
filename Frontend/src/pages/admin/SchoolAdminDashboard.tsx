import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Plus,
  Download,
  Bell,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import StatCard from "../../components/StatCard";
import ControlCard from "../../components/ControlCard";
import AttendanceChart from "../../components/AttendanceChart";
import SystemAlerts from "../../components/SystemAlerts";
import RecentRecords from "../../components/RecentRecords";
import { schoolApi } from '../../services/schoolApi';
import { studentApi } from '../../services/studentApi';
import { teacherApi } from '../../services/teacherApi';
import { attendanceApi } from '../../services/attendanceApi';
import { feeApi } from '../../services/feeApi';

export default function SchoolAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    attendanceRate: 0,
    outstandingFees: 0,
  });
  const [notifications, setNotifications] = useState(3);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();

    const refreshOnFocus = () => loadDashboardData();
    window.addEventListener('focus', refreshOnFocus);

    return () => {
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentStats, teacherStats, attendance, feeStats] = await Promise.all([
        studentApi.getStatistics(),
        teacherApi.getStatistics(),
        attendanceApi.getAttendanceSummary({}),
        feeApi.getStatistics({}),
      ]);

      const schoolFeeTotal = (feeStats?.totalCollected ?? feeStats?.totalDue ?? 0);

      setStats({
        totalStudents: studentStats?.total || 0,
        totalTeachers: teacherStats?.total || 0,
        attendanceRate: attendance?.percentage || 0,
        outstandingFees: schoolFeeTotal,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `৳${(amount / 1000000).toFixed(1)}M`;
    }

    return `৳${amount.toLocaleString('en-BD', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-0 pt-16 md:ml-64 md:pt-16">
          <Topbar />
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
              <p className="mt-4 text-sm text-slate-500">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                School Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back, {user?.name}! Here's what's happening at your school.
              </p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleNavigation('/reports')}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <Download size={16} className="inline mr-2" />
                Export Data
              </button>
              <button 
                onClick={() => handleNavigation('/students')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="inline mr-2" />
                Add Student
              </button>
            </div>
          </div>

          {/* Stats */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Students"
              value={stats.totalStudents.toLocaleString()}
              change="5.2%"
              icon={Users}
              iconClass="bg-blue-50 text-blue-600"
              positive={true}
            />

            <StatCard
              title="Total Teachers"
              value={stats.totalTeachers.toString()}
              change="2.7%"
              icon={GraduationCap}
              iconClass="bg-orange-50 text-orange-600"
              positive={true}
            />

            <StatCard
              title="Today's Attendance"
              value={`${stats.attendanceRate}%`}
              change="3.6%"
              icon={CalendarCheck}
              iconClass="bg-emerald-50 text-emerald-600"
              positive={true}
            />

            <StatCard
              title="Outstanding Fees"
              value={formatCurrency(stats.outstandingFees)}
              change="4.3%"
              icon={CreditCard}
              iconClass="bg-purple-50 text-purple-600"
              positive={false}
            />
          </section>

          {/* Master Control */}
          <section className="mt-6">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-900">
                Master Control Panel
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Quickly manage your school's core operations.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <ControlCard
                title="Student Management"
                icon={Users}
                actions={[
                  "Add Student",
                  "View Students",
                  "Import CSV",
                ]}
                onAction={(action) => {
                  if (action === "Add Student") handleNavigation('/students');
                  else if (action === "View Students") handleNavigation('/students');
                }}
              />

              <ControlCard
                title="Teacher Management"
                icon={GraduationCap}
                actions={[
                  "Add Teacher",
                  "Manage Teachers",
                  "View Profile",
                ]}
                onAction={(action) => {
                  if (action === "Add Teacher") handleNavigation('/teachers');
                  else if (action === "Manage Teachers") handleNavigation('/teachers');
                  else if (action === "View Profile") handleNavigation('/teachers?viewProfile=true');
                }}
              />

              <ControlCard
                title="Class & Section"
                icon={School}
                actions={[
                  "Assign Teacher",
                  "Merge Section",
                  "Create Section",
                ]}
                onAction={() => handleNavigation('/classes')}
              />

              <ControlCard
                title="Subject Management"
                icon={BookOpen}
                actions={[
                  "Create Subject",
                  "Assign Subject",
                  "Credit Hours",
                ]}
                onAction={() => handleNavigation('/subjects')}
              />

              <ControlCard
                title="Exam Management"
                icon={ClipboardList}
                actions={[
                  "Create Exam",
                  "Schedule Exam",
                  "Enter Marks",
                ]}
                onAction={() => handleNavigation('/exams')}
              />
            </div>
          </section>

          {/* Charts */}
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <AttendanceChart />
            <SystemAlerts />
          </section>

          {/* Recent Records */}
          <section className="mt-6">
            <RecentRecords />
          </section>
        </main>
      </div>
    </div>
  );
}