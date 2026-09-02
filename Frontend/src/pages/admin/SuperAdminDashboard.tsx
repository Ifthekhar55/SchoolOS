import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  School,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronRight,
  BarChart3,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  Settings,
  UserCog,
  Bell,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import { schoolApi } from '../../services/schoolApi';
import { userApi } from '../../services/userApi';

// Types
interface School {
  id: string;
  name: string;
  nameBangla?: string;
  address: string;
  city: string;
  district: string;
  division: string;
  phone: string;
  email: string;
  subscriptionPlan: 'starter' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'trial';
  userCount?: number;
  createdAt: Date;
}

interface DashboardStats {
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  activeSchools: number;
  trialSchools: number;
  inactiveSchools: number;
  growthRate: number;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0,
    activeSchools: 0,
    trialSchools: 0,
    inactiveSchools: 0,
    growthRate: 0,
  });
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const schoolsData = await schoolApi.getSchools();
      const schoolSummaries = await Promise.all(
        (schoolsData || []).map(async (school: any) => {
          try {
            const schoolDetail = (await schoolApi.getSchool(school.id)) as any;
            const users = Array.isArray(schoolDetail?.users) ? schoolDetail.users : [];
            const studentCount = users.filter((user: any) => user.role === 'student').length;
            const teacherCount = users.filter((user: any) => user.role === 'teacher').length;

            return {
              school,
              studentCount,
              teacherCount,
            };
          } catch (error) {
            console.error(`Failed to load details for ${school.id}:`, error);
            return {
              school,
              studentCount: 0,
              teacherCount: 0,
            };
          }
        })
      );

      const totalStudents = schoolSummaries.reduce((acc, item) => acc + item.studentCount, 0);
      const totalTeachers = schoolSummaries.reduce((acc, item) => acc + item.teacherCount, 0);
      const activeSchools = schoolsData.filter((school: any) => school.status === 'active').length;
      const trialSchools = schoolsData.filter((school: any) => school.status === 'trial').length;
      const inactiveSchools = schoolsData.filter((school: any) => school.status === 'inactive').length;

      const subscriptionRevenueMap: Record<string, number> = {
        starter: 15000,
        standard: 30000,
        premium: 60000,
        enterprise: 90000,
      };

      const totalRevenue = schoolsData.reduce((acc: number, school: any) => {
        return acc + (subscriptionRevenueMap[school.subscriptionPlan] || 0);
      }, 0);

      setSchools(schoolsData || []);
      setFilteredSchools(schoolsData || []);

      setStats({
        totalSchools: schoolsData.length,
        totalStudents,
        totalTeachers,
        totalRevenue,
        activeSchools,
        trialSchools,
        inactiveSchools,
        growthRate: 12.5,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `৳${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `৳${(amount / 1000).toFixed(1)}K`;
    }
    return `৳${amount}`;
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
                Super Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back, {user?.name}! Manage all schools and system performance.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={loadData}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <RefreshCw size={16} className="inline mr-2" />
                Refresh
              </button>
              <button onClick={() => navigate('/school-setup')} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
                <Plus size={16} className="inline mr-2" />
                Add School
              </button>
            </div>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Schools"
              value={String(stats.totalSchools)}
              change={`${stats.growthRate}%`}
              icon={School}
              iconClass="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="Total Students"
              value={stats.totalStudents.toLocaleString()}
              change="8.4%"
              icon={Users}
              iconClass="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Total Teachers"
              value={stats.totalTeachers.toLocaleString()}
              change="5.2%"
              icon={GraduationCap}
              iconClass="bg-orange-50 text-orange-600"
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              change="12.3%"
              icon={DollarSign}
              iconClass="bg-purple-50 text-purple-600"
            />
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Schools</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.activeSchools}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle size={20} />
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${stats.totalSchools > 0 ? (stats.activeSchools / stats.totalSchools) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Trial Schools</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.trialSchools}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock size={20} />
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${stats.totalSchools > 0 ? (stats.trialSchools / stats.totalSchools) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Inactive Schools</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactiveSchools}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <XCircle size={20} />
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: `${stats.totalSchools > 0 ? (stats.inactiveSchools / stats.totalSchools) * 100 : 0}%` }}
                />
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">System Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-600">School Adoption</span>
                    <span className="font-medium text-slate-900">{stats.totalSchools > 0 ? Math.round((stats.activeSchools / stats.totalSchools) * 100) : 0}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.totalSchools > 0 ? (stats.activeSchools / stats.totalSchools) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Revenue Growth</span>
                    <span className="font-medium text-slate-900">{stats.growthRate}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(stats.growthRate * 10, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Quick Actions</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => navigate('/school-setup')} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:shadow-md transition-shadow">
                  <Building2 size={20} className="text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Add School</p>
                    <p className="text-xs text-slate-500">Register new school</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:shadow-md transition-shadow">
                  <Users size={20} className="text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Manage Users</p>
                    <p className="text-xs text-slate-500">User management</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:shadow-md transition-shadow">
                  <BarChart3 size={20} className="text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">View Reports</p>
                    <p className="text-xs text-slate-500">Analytics & insights</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:shadow-md transition-shadow">
                  <Settings size={20} className="text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">System Settings</p>
                    <p className="text-xs text-slate-500">Configuration</p>
                  </div>
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// Add X import
import { X } from 'lucide-react';