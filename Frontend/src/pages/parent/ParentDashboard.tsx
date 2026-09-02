import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Award,
  DollarSign,
  MessageSquare,
  ChevronRight,
  BookOpen,
  TrendingUp,
  Clock,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  School,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Printer,
  CreditCard,
  Smartphone,
  Building2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import { parentApi } from '../../services/parentApi';
import { attendanceApi } from '../../services/attendanceApi';
import { feeApi } from '../../services/feeApi';
import { examApi } from '../../services/examApi';
import { studentApi } from '../../services/studentApi';
import { calendarApi } from '../../services/calendarApi';
import { classApi } from '../../services/classApi';

// Types
interface Child {
  id: string;
  name: string;
  nameBangla?: string;
  rollNumber: number;
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: Date;
  admissionDate: Date;
  photo?: string;
  isActive: boolean;
  email?: string;
  phone?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
}

interface ChildAttendance {
  date: Date;
  status: 'present' | 'absent' | 'late' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  className?: string;
  sectionName?: string;
}

interface ChildFee {
  id: string;
  feeName: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  dueDate: Date;
  paidDate?: Date;
  month?: string;
  year?: number;
}

interface ChildResult {
  examId: string;
  examName: string;
  examType: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  rank?: number;
  isPassed: boolean;
  subjectResults: {
    subjectName: string;
    fullMarks: number;
    obtainedMarks: number;
    grade: string;
    gradePoint: number;
    isPassed: boolean;
  }[];
}

interface Subject {
  id: string;
  name: string;
  nameBangla?: string;
  code: string;
  teacherName?: string;
}

interface Notice {
  id: string;
  title: string;
  titleBangla?: string;
  content: string;
  type: 'general' | 'academic' | 'fee' | 'emergency' | 'event';
  priority: 'low' | 'medium' | 'high';
  publishedAt: Date;
}

interface ChildStats {
  attendance: {
    present: number;
    absent: number;
    late: number;
    leave: number;
    percentage: number;
  };
  fees: {
    totalDue: number;
    totalPaid: number;
    overdueCount: number;
  };
  results: ChildResult[];
  upcomingExams: ChildResult[];
  subjects: Subject[];
  notices: Notice[];
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudentView = user?.role === 'student';
  
  // State
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childStats, setChildStats] = useState<ChildStats>({
    attendance: { present: 0, absent: 0, late: 0, leave: 0, percentage: 0 },
    fees: { totalDue: 0, totalPaid: 0, overdueCount: 0 },
    results: [],
    upcomingExams: [],
    subjects: [],
    notices: [],
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [attendanceData, setAttendanceData] = useState<ChildAttendance[]>([]);
  const [feeData, setFeeData] = useState<ChildFee[]>([]);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedFee, setSelectedFee] = useState<ChildFee | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [todaySchedule, setTodaySchedule] = useState<Awaited<ReturnType<typeof calendarApi.getDayView>>>([]);
  const [studentDashboardStats, setStudentDashboardStats] = useState({
    subjectCount: 0,
    attendancePercentage: 0,
    resultCount: 0,
    outstandingFees: 0,
  });
  const [studentDashboardLoading, setStudentDashboardLoading] = useState(false);

  useEffect(() => {
    if (isStudentView) {
      loadStudentDashboard();
      return;
    }

    loadData();
  }, [isStudentView]);

  const loadStudentDashboard = async () => {
    try {
      setStudentDashboardLoading(true);
      const today = new Date();
      const [studentResponse, events] = await Promise.all([
        studentApi.getStudents({ limit: 1 }),
        calendarApi.getDayView(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      ]);
      const student = studentResponse.students?.[0];
      if (!student) {
        setTodaySchedule([]);
        setStudentDashboardStats({ subjectCount: 0, attendancePercentage: 0, resultCount: 0, outstandingFees: 0 });
        return;
      }

      const attendance = await attendanceApi.getStudentAttendance(student.id);

      const [classResponse, resultsResponse, feesResponse] = await Promise.all([
        classApi.getClasses({ page: 1, limit: 1 }),
        examApi.getResults({ studentId: student.id, isPublished: true }),
        feeApi.getFees({ studentId: student.id, limit: 999 }),
      ]);
      const classItem = classResponse.classes?.[0];
      const sectionId = classItem?.sections?.find((section: any) =>
        section.name?.toLowerCase() === student.section?.toLowerCase()
      )?.id;
      const subjects = (classItem?.classSubjects || classItem?.subjects || [])
        .filter((subject: any) => !subject.sectionId || subject.sectionId === sectionId);
      const presentCount = attendance.filter((record) => record.status === 'present' || record.status === 'late').length;
      const attendancePercentage = attendance.length > 0
        ? Math.round((presentCount / attendance.length) * 100)
        : 0;
      const outstandingFees = (feesResponse.fees || [])
        .reduce((total: number, fee: { dueAmount?: number }) => total + Number(fee.dueAmount || 0), 0);

      setStudentDashboardStats({
        subjectCount: new Set(subjects.map((subject: any) => subject.subjectId || subject.subject?.id || subject.id)).size,
        attendancePercentage,
        resultCount: resultsResponse.length,
        outstandingFees,
      });

      const matchingEvents = events.filter((event) => {
        const matchesClass = !event.targetClasses?.length || event.targetClasses.includes(student.class);
        const matchesSection = !event.targetSections?.length || event.targetSections.includes(student.section || '');
        return matchesClass && matchesSection;
      });
      setTodaySchedule(matchingEvents);
    } catch (error) {
      console.error('Failed to load student dashboard:', error);
      setTodaySchedule([]);
      setStudentDashboardStats({ subjectCount: 0, attendancePercentage: 0, resultCount: 0, outstandingFees: 0 });
    } finally {
      setStudentDashboardLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChildId && !isStudentView) {
      loadChildData(selectedChildId);
    }
  }, [selectedChildId, isStudentView]);

  const loadData = async () => {
    try {
      setLoading(true);
      const childrenData = await parentApi.getChildren();
      setChildren(childrenData || []);
      
      if (childrenData && childrenData.length > 0) {
        const firstChild = childrenData[0];
        setSelectedChildId(firstChild.id);
        setSelectedChild(firstChild);
        await loadChildData(firstChild.id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (childId: string) => {
    try {
      setLoading(true);
      
      // Get child details
      const child = children.find(c => c.id === childId);
      setSelectedChild(child || null);

      // Fetch all data in parallel
      const [
        attendanceSummary,
        feeSummary,
        results,
        upcomingExams,
        subjects,
        notices,
        attendanceHistory,
        feeHistory,
      ] = await Promise.all([
        parentApi.getAttendanceSummary(childId),
        parentApi.getFeeSummary(childId),
        parentApi.getChildResults(childId),
        parentApi.getChildResults(childId).then(r => r.filter((e: any) => e.percentage === 0)),
        parentApi.getTeachers(childId).then((teachers) => teachers.map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          teacherName: teacher.name,
          code: teacher.subject || 'General',
        }))),
        parentApi.getNotices().then(n => n.slice(0, 5)),
        parentApi.getChildAttendance(childId, { dateFrom: new Date(new Date().setDate(1)), dateTo: new Date() }),
        parentApi.getChildFees(childId),
      ]);

      setChildStats({
        attendance: attendanceSummary || { present: 0, absent: 0, late: 0, leave: 0, percentage: 0 },
        fees: feeSummary || { totalDue: 0, totalPaid: 0, overdueCount: 0 },
        results: results || [],
        upcomingExams: upcomingExams || [],
        subjects: subjects || [],
        notices: notices || [],
      });

      setAttendanceData(attendanceHistory || []);
      setFeeData(feeHistory || []);
    } catch (error) {
      console.error('Failed to load child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
  };

  const handlePayFee = async () => {
    if (!selectedFee || !selectedChild) return;
    try {
      await parentApi.makePayment({
        childId: selectedChild.id,
        feeId: selectedFee.id,
        amount: selectedFee.dueAmount,
        method: paymentMethod,
      });
      setShowPayment(false);
      setSelectedFee(null);
      loadChildData(selectedChild.id);
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toFixed(2)}`;
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'text-emerald-600',
      'A': 'text-emerald-500',
      'B': 'text-blue-600',
      'C': 'text-amber-600',
      'D': 'text-orange-600',
      'E': 'text-red-500',
      'F': 'text-red-700',
    };
    return colors[grade] || 'text-slate-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-emerald-100 text-emerald-700';
      case 'absent': return 'bg-red-100 text-red-700';
      case 'late': return 'bg-amber-100 text-amber-700';
      case 'leave': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700';
      case 'partial': return 'bg-amber-100 text-amber-700';
      case 'unpaid': return 'bg-red-100 text-red-700';
      case 'overdue': return 'bg-red-200 text-red-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const renderStudentDashboard = () => (
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
            <StatCard title="Subjects" value={studentDashboardLoading ? '...' : String(studentDashboardStats.subjectCount)} change="" icon={BookOpen} iconClass="bg-blue-50 text-blue-600" />
            <StatCard title="Attendance" value={studentDashboardLoading ? '...' : `${studentDashboardStats.attendancePercentage}%`} change="" icon={CalendarCheck} iconClass="bg-emerald-50 text-emerald-600" />
            <StatCard title="Results" value={studentDashboardLoading ? '...' : String(studentDashboardStats.resultCount)} change="" icon={Award} iconClass="bg-amber-50 text-amber-600" />
            <StatCard title="Outstanding Fees" value={studentDashboardLoading ? '...' : formatCurrency(studentDashboardStats.outstandingFees)} change="" icon={CreditCard} iconClass="bg-red-50 text-red-600" />
          </section>
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">Today&apos;s Class Schedule</h2>
            </div>
            <div className="space-y-3">
              {todaySchedule.length === 0 ? (
                <p className="py-3 text-sm text-slate-500">No classes scheduled for today.</p>
              ) : todaySchedule.map((event) => (
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
          </section>
        </main>
      </div>
    </div>
  );

  if (isStudentView) {
    return renderStudentDashboard();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-0 pt-16 md:ml-64 md:pt-16">
          <Topbar />
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
              <p className="mt-4 text-sm text-slate-500">Loading your children's data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-0 pt-16 md:ml-64 md:pt-16">
          <Topbar />
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-center max-w-md">
              <Users className="mx-auto h-16 w-16 text-slate-400" />
              <h2 className="mt-4 text-xl font-bold text-slate-900">No Children Found</h2>
              <p className="mt-2 text-sm text-slate-500">
                You haven't added any children to your account yet. Please contact the school to link your children.
              </p>
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
                Parent Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Monitor your children's academic progress and school activities
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => loadChildData(selectedChildId)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <RefreshCw size={16} className="inline mr-2" />
                Refresh
              </button>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
                <MessageSquare size={16} className="inline mr-2" />
                Message Teacher
              </button>
            </div>
          </div>

          {/* Child Selector */}
          <div className="mb-6 flex flex-wrap gap-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => handleChildSelect(child.id)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  selectedChildId === child.id
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {child.name.charAt(0).toUpperCase()}
                </div>
                {child.name}
                <span className="text-xs text-slate-400">
                  Class {child.className} {child.sectionName ? `- ${child.sectionName}` : ''}
                </span>
              </button>
            ))}
          </div>

          {selectedChild && (
            <>
              {/* Child Profile Card */}
              <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                      {selectedChild.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedChild.name}
                        {selectedChild.nameBangla && (
                          <span className="ml-2 text-sm text-slate-500">({selectedChild.nameBangla})</span>
                        )}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span>Class {selectedChild.className}</span>
                        {selectedChild.sectionName && <span>• Section {selectedChild.sectionName}</span>}
                        <span>• Roll {selectedChild.rollNumber}</span>
                        {selectedChild.isActive ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle size={14} />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <Download size={14} className="inline mr-1" />
                      Report Card
                    </button>
                    <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <Printer size={14} className="inline mr-1" />
                      Print
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Attendance Rate"
                  value={`${childStats.attendance.percentage}%`}
                  change=""
                  icon={CalendarCheck}
                  iconClass="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                  title="Current GPA"
                  value={childStats.results.length > 0 ? childStats.results[0].gpa.toFixed(2) : 'N/A'}
                  change=""
                  icon={Award}
                  iconClass="bg-blue-50 text-blue-600"
                />
                <StatCard
                  title="Upcoming Exams"
                  value={String(childStats.upcomingExams.length)}
                  change=""
                  icon={BookOpen}
                  iconClass="bg-amber-50 text-amber-600"
                />
                <StatCard
                  title="Fee Status"
                  value={childStats.fees.totalDue > 0 ? `Due ${formatCurrency(childStats.fees.totalDue)}` : 'Paid'}
                  change=""
                  icon={DollarSign}
                  iconClass={childStats.fees.totalDue > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}
                />
              </section>

              {/* Tab Navigation */}
              <div className="mt-6 border-b border-slate-200">
                <nav className="flex flex-wrap gap-2">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
                    { id: 'results', label: 'Results', icon: Award },
                    { id: 'fees', label: 'Fees', icon: CreditCard },
                    { id: 'subjects', label: 'Subjects', icon: BookOpen },
                    { id: 'notices', label: 'Notices', icon: FileText },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                          activeTab === tab.id
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Attendance Summary */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg bg-emerald-50 p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-600">
                          {childStats.attendance.present}
                        </p>
                        <p className="text-xs text-emerald-600">Present</p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-3 text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {childStats.attendance.absent}
                        </p>
                        <p className="text-xs text-red-600">Absent</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-3 text-center">
                        <p className="text-2xl font-bold text-amber-600">
                          {childStats.attendance.late}
                        </p>
                        <p className="text-xs text-amber-600">Late</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {childStats.attendance.percentage}%
                        </p>
                        <p className="text-xs text-blue-600">Attendance Rate</p>
                      </div>
                    </div>

                    {/* Subjects & Teachers */}
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <BookOpen size={18} className="text-blue-500" />
                          Subjects
                        </h3>
                        <div className="space-y-2">
                          {childStats.subjects.length === 0 ? (
                            <p className="text-sm text-slate-500">No subjects assigned</p>
                          ) : (
                            childStats.subjects.map((subject, i) => (
                              <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                                <span className="text-sm text-slate-900">{subject.name}</span>
                                <span className="text-xs text-slate-500">{subject.teacherName || 'No teacher assigned'}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Fee Summary */}
                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <CreditCard size={18} className="text-emerald-500" />
                          Fee Summary
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-500">Total Paid</span>
                            <span className="text-sm font-medium text-emerald-600">
                              {formatCurrency(childStats.fees.totalPaid)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-500">Total Due</span>
                            <span className="text-sm font-medium text-red-600">
                              {formatCurrency(childStats.fees.totalDue)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-500">Overdue</span>
                            <span className="text-sm font-medium text-red-700">
                              {childStats.fees.overdueCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Notices */}
                    {childStats.notices.length > 0 && (
                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <FileText size={18} className="text-purple-500" />
                          Recent Notices
                        </h3>
                        <div className="space-y-3">
                          {childStats.notices.map((notice) => (
                            <div key={notice.id} className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-0">
                              <div className={`h-2 w-2 rounded-full ${
                                notice.priority === 'high' ? 'bg-red-500' :
                                notice.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">{notice.title}</p>
                                <p className="text-xs text-slate-500">
                                  {new Date(notice.publishedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Eye size={16} className="text-slate-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming Exams */}
                    {childStats.upcomingExams.length > 0 && (
                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <Clock size={18} className="text-amber-500" />
                          Upcoming Exams
                        </h3>
                        <div className="space-y-3">
                          {childStats.upcomingExams.map((exam) => (
                            <div key={exam.examId} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{exam.examName}</p>
                                <p className="text-xs text-slate-500">{exam.examType}</p>
                              </div>
                              <ChevronRight size={16} className="text-slate-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg bg-emerald-50 p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-600">
                          {childStats.attendance.present}
                        </p>
                        <p className="text-xs text-emerald-600">Present</p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {childStats.attendance.absent}
                        </p>
                        <p className="text-xs text-red-600">Absent</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-4 text-center">
                        <p className="text-2xl font-bold text-amber-600">
                          {childStats.attendance.late}
                        </p>
                        <p className="text-xs text-amber-600">Late</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {childStats.attendance.percentage}%
                        </p>
                        <p className="text-xs text-blue-600">Attendance Rate</p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Class</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Check In</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceData.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                                  No attendance records found
                                </td>
                              </tr>
                            ) : (
                              attendanceData.slice(0, 10).map((record, index) => (
                                <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm text-slate-900">
                                    {new Date(record.date).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(record.status)}`}>
                                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {record.className || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {record.checkInTime || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {record.remarks || '-'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                  <div className="space-y-4">
                    {childStats.results.length === 0 ? (
                      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                        <Award className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No results available</h3>
                        <p className="mt-1 text-sm text-slate-500">Results will appear here once exams are completed</p>
                      </div>
                    ) : (
                      childStats.results.map((result) => (
                        <div
                          key={result.examId}
                          className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Exam Header */}
                          <div
                            className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                            onClick={() => setExpandedExam(expandedExam === result.examId ? null : result.examId)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                <Award className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                  {result.examName}
                                </h3>
                                <p className="text-xs text-slate-500">
                                  {result.examType} • {result.isPassed ? 'Passed' : 'Failed'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900">
                                  {result.percentage}%
                                </p>
                                <span className={`text-sm font-bold ${getGradeColor(result.grade)}`}>
                                  {result.grade} ({result.gpa.toFixed(2)})
                                </span>
                              </div>
                              {expandedExam === result.examId ? (
                                <ChevronUp size={18} className="text-slate-400" />
                              ) : (
                                <ChevronDown size={18} className="text-slate-400" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedExam === result.examId && (
                            <div className="border-t border-slate-100 p-4 bg-slate-50">
                              <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-200">
                                  <p className="text-xs text-slate-500">Total Marks</p>
                                  <p className="text-lg font-bold text-slate-900">
                                    {result.obtainedMarks}/{result.totalMarks}
                                  </p>
                                </div>
                                <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-200">
                                  <p className="text-xs text-slate-500">GPA</p>
                                  <p className="text-lg font-bold text-blue-600">
                                    {result.gpa.toFixed(2)}
                                  </p>
                                </div>
                                <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-200">
                                  <p className="text-xs text-slate-500">Rank</p>
                                  <p className="text-lg font-bold text-slate-900">
                                    {result.rank ? `#${result.rank}` : '-'}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4">
                                <h4 className="mb-2 text-xs font-semibold uppercase text-slate-400">Subject-wise Results</h4>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                  {result.subjectResults.map((subject) => (
                                    <div
                                      key={subject.subjectName}
                                      className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm border border-slate-100"
                                    >
                                      <div>
                                        <p className="text-sm font-medium text-slate-900">
                                          {subject.subjectName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {subject.obtainedMarks}/{subject.fullMarks}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <span className={`text-sm font-bold ${getGradeColor(subject.grade)}`}>
                                          {subject.grade}
                                        </span>
                                        <p className="text-xs text-slate-500">
                                          {subject.gradePoint}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Fees Tab */}
                {activeTab === 'fees' && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-lg bg-emerald-50 p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(childStats.fees.totalPaid)}
                        </p>
                        <p className="text-xs text-emerald-600">Total Paid</p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(childStats.fees.totalDue)}
                        </p>
                        <p className="text-xs text-red-600">Total Due</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-4 text-center">
                        <p className="text-2xl font-bold text-amber-600">
                          {childStats.fees.overdueCount}
                        </p>
                        <p className="text-xs text-amber-600">Overdue</p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Fee Name</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Amount</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Paid</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Due</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-400">Status</th>
                              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-400">Due Date</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feeData.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                                  No fees found
                                </td>
                              </tr>
                            ) : (
                              feeData.map((fee) => (
                                <tr key={fee.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                  <td className="px-4 py-3 text-sm text-slate-900">
                                    {fee.feeName}
                                    {fee.month && <span className="text-xs text-slate-500 block">({fee.month} {fee.year})</span>}
                                  </td>
                                  <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                                    {formatCurrency(fee.amount)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-sm text-emerald-600">
                                    {formatCurrency(fee.paidAmount)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                                    {formatCurrency(fee.dueAmount)}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getFeeStatusColor(fee.status)}`}>
                                      {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-sm text-slate-600">
                                    {new Date(fee.dueDate).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {fee.status !== 'paid' && (
                                      <button
                                        onClick={() => {
                                          setSelectedFee(fee);
                                          setShowPayment(true);
                                        }}
                                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                                      >
                                        Pay Now
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subjects Tab */}
                {activeTab === 'subjects' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="mb-4 text-sm font-semibold text-slate-900">All Subjects</h3>
                      {childStats.subjects.length === 0 ? (
                        <p className="text-sm text-slate-500">No subjects assigned</p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {childStats.subjects.map((subject) => (
                            <div key={subject.id} className="rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{subject.name}</p>
                                  {subject.nameBangla && (
                                    <p className="text-xs text-slate-500">{subject.nameBangla}</p>
                                  )}
                                  <p className="text-xs text-slate-500 mt-1">Code: {subject.code}</p>
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                  {subject.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              {subject.teacherName && (
                                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                                  <User size={12} />
                                  {subject.teacherName}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notices Tab */}
                {activeTab === 'notices' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="mb-4 text-sm font-semibold text-slate-900">All Notices</h3>
                      {childStats.notices.length === 0 ? (
                        <p className="text-sm text-slate-500">No notices available</p>
                      ) : (
                        <div className="space-y-3">
                          {childStats.notices.map((notice) => (
                            <div key={notice.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0">
                              <div className={`mt-1 h-2 w-2 rounded-full ${
                                notice.priority === 'high' ? 'bg-red-500' :
                                notice.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-slate-900">{notice.title}</p>
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    notice.type === 'emergency' ? 'bg-red-100 text-red-600' :
                                    notice.type === 'fee' ? 'bg-emerald-100 text-emerald-600' :
                                    notice.type === 'academic' ? 'bg-blue-100 text-blue-600' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{notice.content}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(notice.publishedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Payment Modal */}
          {showPayment && selectedFee && selectedChild && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Make Payment</h3>
                    <p className="text-sm text-slate-500">{selectedFee.feeName}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPayment(false);
                      setSelectedFee(null);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Due Amount</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(selectedFee.dueAmount)}
                    </span>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'cash', label: 'Cash', icon: Building2 },
                        { value: 'bank', label: 'Bank', icon: Building2 },
                        { value: 'bkash', label: 'bKash', icon: Smartphone },
                        { value: 'nagad', label: 'Nagad', icon: Smartphone },
                        { value: 'card', label: 'Card', icon: CreditCard },
                        { value: 'online', label: 'Online', icon: CreditCard },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setPaymentMethod(value)}
                          className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition ${
                            paymentMethod === value
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Icon size={20} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setShowPayment(false);
                        setSelectedFee(null);
                      }}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePayFee}
                      className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Add X import
import { X } from 'lucide-react';