import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { teacherApi } from '../../services/teacherApi';
import { attendanceApi } from '../../services/attendanceApi';
import { examApi } from '../../services/examApi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import {
  Users,
  BookOpen,
  CalendarCheck,
  Award,
  Plus,
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Array<{
    id: string;
    name: string;
    classSubjects: Array<{ sectionId?: string | null; subject: { id: string; name: string; code: string } }>;
    sections: Array<{ id: string; name: string; currentStudents: number; teacherId?: string; roomNumber?: string }>;
  }>>([]);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [upcomingExams, setUpcomingExams] = useState<Array<{
    id: string;
    name: string;
    examDate: Date;
    className?: string;
    sectionName?: string;
  }>>([]);

  const loadDashboardData = async () => {
    try {
      const teacherClasses = await teacherApi.getMyClasses();
      setClasses(teacherClasses);

      const sections = teacherClasses.flatMap((classItem) =>
        classItem.sections
          .map((section) => ({
            classId: classItem.id,
            sectionId: section.id,
            className: classItem.name,
            sectionName: section.name,
          }))
      );

      if (sections.length === 0) {
        setAttendanceRate(0);
        setUpcomingExams([]);
        return;
      }

      const today = new Date();
      const todayDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('-');

      const summaries = await Promise.all(
        sections.map(({ classId, sectionId }) =>
          attendanceApi.getAttendanceSummary({ classId, sectionId, date: todayDate })
        )
      );

      const totalStudents = summaries.reduce((sum, item) => sum + (item?.totalStudents || 0), 0);
      const present = summaries.reduce((sum, item) => sum + (item?.present || 0), 0);
      const late = summaries.reduce((sum, item) => sum + (item?.late || 0), 0);
      const calculatedPercentage = totalStudents > 0
        ? Math.round(((present + late) / totalStudents) * 100)
        : 0;

      setAttendanceRate(calculatedPercentage);

      today.setHours(0, 0, 0, 0);
      const examResponse = await examApi.getExams({
        dateFrom: today,
        limit: 50,
      });

      const relevantClassIds = new Set(teacherClasses.map((item) => item.id));
      const relevantSectionIds = new Set(
        teacherClasses.flatMap((item) => item.sections.map((section) => section.id))
      );

      const filteredExams = examResponse.exams
        .filter((exam) => {
          const isRelevantClass = relevantClassIds.has(exam.classId);
          const isRelevantSection = exam.sectionId ? relevantSectionIds.has(exam.sectionId) : false;
          return isRelevantClass || isRelevantSection;
        })
        .filter((exam) => new Date(exam.examDate) >= today)
        .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
        .slice(0, 3)
        .map((exam) => ({
          id: exam.id,
          name: exam.name,
          examDate: exam.examDate,
          className: exam.className || teacherClasses.find((item) => item.id === exam.classId)?.name,
          sectionName: exam.sectionName || teacherClasses
            .find((item) => item.id === exam.classId)
            ?.sections.find((section) => section.id === exam.sectionId)?.name,
        }));

      setUpcomingExams(filteredExams);
    } catch (error) {
      console.error('Failed to load teacher dashboard data:', error);
      setClasses([]);
      setAttendanceRate(0);
      setUpcomingExams([]);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const refreshOnFocus = () => {
      loadDashboardData();
    };
    window.addEventListener('focus', refreshOnFocus);
    return () => window.removeEventListener('focus', refreshOnFocus);
  }, [user?.id]);

  const totalStudents = classes.reduce(
    (total, classItem) => total + classItem.sections.reduce((sectionTotal, section) => sectionTotal + section.currentStudents, 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />
        <main className="p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back, {user?.name}! Manage your classes and students.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/attendance')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Plus size={16} className="inline mr-2" />
                Enter Attendance
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="My Classes"
              value={classes.length.toString()}
              change=""
              icon={BookOpen}
              iconClass="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="Total Students"
              value={totalStudents.toString()}
              change=""
              icon={Users}
              iconClass="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              title="Today's Attendance"
              value={`${attendanceRate}%`}
              change=""
              icon={CalendarCheck}
              iconClass="bg-amber-50 text-amber-600"
            />
            <StatCard
              title="Upcoming Exams"
              value={upcomingExams.length.toString()}
              change=""
              icon={Award}
              iconClass="bg-purple-50 text-purple-600"
            />
          </section>

          {/* Upcoming Exams */}
          <section className="mt-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Upcoming Exams</h3>
              <div className="space-y-3">
                {upcomingExams.length === 0 ? (
                  <p className="py-3 text-sm text-slate-500">No upcoming exams for your classes.</p>
                ) : upcomingExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{exam.name}</p>
                      <p className="text-xs text-slate-500">
                        {exam.className}{exam.sectionName ? ` • Section ${exam.sectionName}` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
                      {new Date(exam.examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}