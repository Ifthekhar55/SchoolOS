import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, Eye, MapPin, Users } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { calendarApi } from '../../services/calendarApi';
import { teacherApi } from '../../services/teacherApi';

const classNumberWords: Record<string, string> = {
  '1': 'One',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
};

const formatClassName = (className: string) => {
  const classNumber = className.replace(/^class[-\s:]*/i, '').trim();
  return classNumberWords[classNumber.toLowerCase()] || classNumber;
};

type TeacherClass = Awaited<ReturnType<typeof teacherApi.getMyClasses>>[number];
type ScheduleEvent = Awaited<ReturnType<typeof calendarApi.getDayView>>[number];

export default function MyClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPageData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const [teacherClasses, todaySchedule] = await Promise.all([
        teacherApi.getMyClasses(),
        calendarApi.getDayView(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      ]);
      setClasses(teacherClasses);
      setSchedule(todaySchedule || []);
    } catch (error) {
      console.error('Failed to load teacher classes and schedule:', error);
      setClasses([]);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();

    const refreshOnFocus = () => loadPageData();
    window.addEventListener('focus', refreshOnFocus);
    return () => window.removeEventListener('focus', refreshOnFocus);
  }, []);

  const classSections = classes.flatMap((classItem) =>
    classItem.sections.map((section) => ({
      ...section,
      classId: classItem.id,
      className: classItem.name,
      subjects: Array.from(
        new Map(
          classItem.classSubjects
            .filter((item) => item.sectionId === section.id)
            .map((item) => [item.subject.id, item.subject])
        ).values()
      ),
    }))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">My Classes</h1>
            <p className="mt-1 text-sm text-slate-500">View your assigned classes and today&apos;s schedule.</p>
          </div>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <>
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">My Classes</h2>
                </div>
                {classSections.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
                    No classes have been assigned to you yet.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {classSections.map((section) => (
                      <div key={section.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                              Class: {formatClassName(section.className)} - Section: {section.name}
                            </h3>
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                              <Users size={14} /> {section.currentStudents} Students
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin size={14} /> Room: {section.roomNumber || 'Not assigned'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Subjects: {section.subjects.length > 0
                                ? section.subjects.map((subject) => subject.name).join(', ')
                                : 'None assigned'}
                            </p>
                          </div>
                          <Eye size={18} className="shrink-0 text-slate-400" />
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => navigate(`/attendance?classId=${section.classId}&sectionId=${section.id}`)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Enter Attendance
                          </button>
                          <button
                            onClick={() => navigate('/exams')}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Enter Marks
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-6">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <CalendarDays size={18} className="text-blue-600" />
                    <h2 className="text-sm font-semibold text-slate-900">Today&apos;s Class Schedule</h2>
                  </div>
                  <div className="space-y-3">
                    {schedule.length === 0 ? (
                      <p className="py-3 text-sm text-slate-500">No classes scheduled for today.</p>
                    ) : schedule.map((event) => (
                      <div key={event.id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{event.title}</p>
                          <p className="text-xs text-slate-500">
                            {event.allDay ? 'All day' : `${event.startTime || 'Time not set'}${event.endTime ? ` - ${event.endTime}` : ''}`}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                          {event.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
