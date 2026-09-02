import { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
import { studentApi } from "../services/studentApi";
import { teacherApi } from "../services/teacherApi";
import { classApi } from "../services/classApi";
import { feeApi } from "../services/feeApi";

interface RecentRecord {
  id: string;
  type: string;
  color: string;
  name: string;
  action: string;
  createdAt: string;
}

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function RecentRecords() {
  const [records, setRecords] = useState<RecentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentRecords = async () => {
      try {
        const [students, teachers, classes, fees] = await Promise.allSettled([
          studentApi.getStudents({ page: 1, limit: 10 }),
          teacherApi.getTeachers({ page: 1, limit: 10 }),
          classApi.getClasses({ page: 1, limit: 10 }),
          feeApi.getFees({ page: 1, limit: 10 }),
        ]);
        const nextRecords: RecentRecord[] = [];
        if (students.status === "fulfilled") nextRecords.push(...(students.value.students || []).map((item: any) => ({ id: `student-${item.id}`, type: "STUDENT", color: "bg-blue-50 text-blue-600", name: item.name, action: "Student added", createdAt: item.createdAt || item.admissionDate })));
        if (teachers.status === "fulfilled") nextRecords.push(...(teachers.value.teachers || []).map((item: any) => ({ id: `teacher-${item.id}`, type: "TEACHER", color: "bg-orange-50 text-orange-600", name: item.name, action: "Teacher added", createdAt: item.createdAt || item.joiningDate })));
        if (classes.status === "fulfilled") nextRecords.push(...(classes.value.classes || []).map((item: any) => ({ id: `class-${item.id}`, type: "ACADEMIC", color: "bg-purple-50 text-purple-600", name: `Class ${item.name}`, action: "Class created", createdAt: item.createdAt })));
        if (fees.status === "fulfilled") nextRecords.push(...(fees.value.fees || []).map((item: any) => ({ id: `fee-${item.id}`, type: "FINANCE", color: "bg-emerald-50 text-emerald-600", name: "Fee", action: "Fee recorded", createdAt: item.createdAt || item.dueDate })));
        setRecords(nextRecords.filter((record) => record.createdAt).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6));
      } catch (error) {
        console.error("Failed to load recent records:", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    loadRecentRecords();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div><h2 className="text-sm font-bold text-slate-900">Recent Records</h2><p className="mt-1 text-xs text-slate-400">Latest activity in your school</p></div>
        <button className="text-xs font-semibold text-blue-600">View All Records</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead><tr className="border-b border-slate-100 bg-slate-50/70"><th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Type</th><th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Name</th><th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Action</th><th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Time</th><th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">Action</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">Loading recent records...</td></tr> : records.length === 0 ? <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">No recent records found.</td></tr> : records.map((record) => (
              <tr key={record.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50"><td className="px-5 py-3"><span className={`rounded-md px-2 py-1 text-[9px] font-bold ${record.color}`}>{record.type}</span></td><td className="px-5 py-3 text-xs font-semibold text-slate-700">{record.name}</td><td className="px-5 py-3 text-xs text-slate-500">{record.action}</td><td className="px-5 py-3 text-xs text-slate-400">{formatTime(record.createdAt)}</td><td className="px-5 py-3 text-right"><button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="More actions"><MoreVertical size={16} /></button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
