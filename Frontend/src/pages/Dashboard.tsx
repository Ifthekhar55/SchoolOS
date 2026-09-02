import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import ControlCard from "../components/ControlCard";
import AttendanceChart from "../components/AttendanceChart";
import SystemAlerts from "../components/SystemAlerts";
import RecentRecords from "../components/RecentRecords";

export default function Dashboard() {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `৳${(amount / 1000000).toFixed(1)}M`;
    }

    return `৳${amount.toLocaleString('en-BD', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleControlAction = (action: string) => {
    switch (action) {
      case "Add Student":
        navigate("/students/add");
        break;
      case "View Students":
        navigate("/students");
        break;
      case "Import CSV":
        navigate("/students?mode=import");
        break;
      case "Add Teacher":
        navigate("/teachers");
        break;
      case "Manage Teachers":
        navigate("/teachers");
        break;
      case "View Profile":
        navigate("/teachers?viewProfile=true");
        break;
      default:
        break;
    }
  };

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
                Admin Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Welcome back! Here's what's happening at your school.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50">
                Export Data
              </button>

              <button
                onClick={() => navigate("/students/add")}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                + Add Student
              </button>
            </div>
          </div>

          {/* Stats */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Students"
              value="2,450"
              change="5.2%"
              icon={Users}
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              title="Total Teachers"
              value="68"
              change="2.7%"
              icon={GraduationCap}
              iconClass="bg-orange-50 text-orange-600"
            />

            <StatCard
              title="Today's Attendance"
              value="93.4%"
              change="3.6%"
              icon={CalendarCheck}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="Outstanding Fees"
              value={formatCurrency(4100)}
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
                onAction={handleControlAction}
              />

              <ControlCard
                title="Teacher Management"
                icon={GraduationCap}
                actions={[
                  "Add Teacher",
                  "Manage Teachers",
                  "View Profile",
                ]}
                onAction={handleControlAction}
              />

              <ControlCard
                title="Class & Section"
                icon={School}
                actions={[
                  "Assign Teacher",
                  "Merge Section",
                  "Create Section",
                ]}
              />

              <ControlCard
                title="Subject Management"
                icon={BookOpen}
                actions={[
                  "Create Subject",
                  "Assign Subject",
                  "Credit Hours",
                ]}
              />

              <ControlCard
                title="Exam Management"
                icon={ClipboardList}
                actions={[
                  "Create Exam",
                  "Schedule Exam",
                  "Enter Marks",
                ]}
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