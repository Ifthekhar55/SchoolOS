import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { AttendanceMarking } from '../components/attendance/AttendanceMarking';
import { AttendanceStatisticsComponent } from '../components/attendance/AttendanceStatistics';
import { AttendanceList } from '../components/attendance/AttendanceList';
import { ProtectedComponent } from '../components/ProtectedComponent';
import { useAuth } from '../hooks/useAuth';
import { attendanceApi } from '../services/attendanceApi';
import { classApi } from '../services/classApi';
import { studentApi } from '../services/studentApi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('mark');
  const [refreshKey, setRefreshKey] = useState(0);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [studentSubjects, setStudentSubjects] = useState<any[]>([]);
  const [studentAttendanceLoading, setStudentAttendanceLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'student') return;

    const loadStudentAttendance = async () => {
      try {
        setStudentAttendanceLoading(true);
        const [studentResponse, classResponse] = await Promise.all([
          studentApi.getStudents({ limit: 1 }),
          classApi.getClasses({ page: 1, limit: 1 }),
        ]);
        const student = studentResponse.students?.[0];
        const classItem = classResponse.classes?.[0];
        const attendance = student
          ? await attendanceApi.getStudentAttendance(student.id)
          : [];
        const sectionId = classItem?.sections?.find((section: any) =>
          section.name?.toLowerCase() === student?.section?.toLowerCase()
        )?.id;
        setStudentSubjects((classItem?.classSubjects || classItem?.subjects || [])
          .filter((subject: any) => !subject.sectionId || subject.sectionId === sectionId));
        setStudentAttendance(attendance || []);
      } catch (error) {
        console.error('Failed to load student attendance:', error);
        setStudentAttendance([]);
        setStudentSubjects([]);
      } finally {
        setStudentAttendanceLoading(false);
      }
    };

    loadStudentAttendance();
  }, [user?.role]);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (user?.role === 'student') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-0 pt-16 md:ml-64 md:pt-16">
          <Topbar />
          <main className="space-y-6 p-4 md:p-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>
              <p className="mt-1 text-sm text-slate-500">Attendance history for your current class.</p>
            </div>
            {studentAttendanceLoading ? (
              <div className="py-12 text-center text-sm text-slate-500">Loading attendance...</div>
            ) : studentSubjects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500">No subjects assigned.</div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {studentSubjects.map((subject: any) => (
                  <section key={subject.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold text-slate-900">{subject.subject?.name || subject.subjectName || 'Subject'}</h2>
                        <p className="mt-1 text-xs text-slate-500">Course teacher: {subject.teacher?.name || subject.teacherName || 'Not assigned'}</p>
                      </div>
                      <span className="text-xs text-slate-500">{studentAttendance.length} records</span>
                    </div>
                    {studentAttendance.length === 0 ? (
                      <p className="py-4 text-sm text-slate-500">No attendance recorded.</p>
                    ) : (
                      <div className="max-h-72 space-y-2 overflow-y-auto">
                        {studentAttendance.map((record) => (
                          <div key={record.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                            <span className="text-sm text-slate-700">{new Date(record.date).toLocaleDateString()}</span>
                            <span className="text-xs font-medium capitalize text-slate-600">{record.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Mark attendance, view reports, and track student attendance
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="mark">
              <ProtectedComponent permission="attendance:mark">
                <AttendanceMarking
                  key={refreshKey}
                  classId={searchParams.get('classId') || undefined}
                  sectionId={searchParams.get('sectionId') || undefined}
                  onSuccess={handleSuccess}
                />
              </ProtectedComponent>
            </TabsContent>

            <TabsContent value="reports">
              <ProtectedComponent permission="attendance:view">
                <AttendanceList />
              </ProtectedComponent>
            </TabsContent>

            <TabsContent value="statistics">
              <ProtectedComponent permission="attendance:view">
                <AttendanceStatisticsComponent />
              </ProtectedComponent>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};