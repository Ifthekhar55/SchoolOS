import React from 'react';
import { BookOpen, CalendarCheck, Award, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Welcome back, {user?.name}.</p>
          </div>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Subjects" value="0" change="" icon={BookOpen} iconClass="bg-blue-50 text-blue-600" />
            <StatCard title="Attendance" value="0%" change="" icon={CalendarCheck} iconClass="bg-emerald-50 text-emerald-600" />
            <StatCard title="Results" value="0" change="" icon={Award} iconClass="bg-amber-50 text-amber-600" />
            <StatCard title="Outstanding Fees" value="৳0" change="" icon={CreditCard} iconClass="bg-red-50 text-red-600" />
          </section>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;