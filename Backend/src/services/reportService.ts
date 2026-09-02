import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { ReportFilters, ReportData, ReportSummary, ReportChart, ReportTable, ReportMetric } from '../types/report';
import AttendanceService from './attendanceService';
import FeeService from './feeService';
import ExamService from './examService';

export class ReportService {
  // ============ Report CRUD ============

  async getReports(schoolId: string, filters: any) {
    const { type, status, page = 1, limit = 10 } = filters;

    const where: any = { schoolId };
    if (type) where.type = type;
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      reports,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getReport(id: string, schoolId: string) {
    const report = await prisma.report.findFirst({
      where: { id, schoolId },
    });
    if (!report) throw new Error('Report not found');
    return report;
  }

  async createReport(schoolId: string, data: any, createdBy: string) {
    const report = await prisma.report.create({
      data: {
        ...data,
        schoolId,
        createdBy,
        filters: data.filters || {},
        recipients: data.recipients || [],
      },
    });

    // If scheduled, set next run date
    if (data.scheduled && data.frequency && data.frequency !== 'once') {
      await this.scheduleReport(report.id, schoolId, data.frequency, data.recipients);
    }

    return report;
  }

  async updateReport(id: string, schoolId: string, data: any) {
    const existing = await prisma.report.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Report not found');

    return prisma.report.update({
      where: { id },
      data,
    });
  }

  async deleteReport(id: string, schoolId: string) {
    const existing = await prisma.report.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Report not found');

    return prisma.report.delete({ where: { id } });
  }

  // ============ Generate Reports ============

  async generateReport(id: string, schoolId: string, format: string = 'pdf') {
    const report = await prisma.report.findFirst({
      where: { id, schoolId },
    });
    if (!report) throw new Error('Report not found');

    // Generate report data based on type
    let data;
    switch (report.type) {
      case 'attendance':
        data = await this.generateAttendanceReport(schoolId, report.filters as any);
        break;
      case 'fee':
        data = await this.generateFeeReport(schoolId, report.filters as any);
        break;
      case 'exam':
        data = await this.generateExamReport(schoolId, report.filters as any);
        break;
      case 'student':
        data = await this.generateStudentReport(schoolId, report.filters as any);
        break;
      case 'teacher':
        data = await this.generateTeacherReport(schoolId, report.filters as any);
        break;
      case 'class':
        data = await this.generateClassReport(schoolId, report.filters as any);
        break;
      default:
        data = await this.generateCustomReport(schoolId, report.filters as any);
    }

    // Update report with generated data
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        data: data as unknown as Prisma.InputJsonValue,
        status: 'generated',
        generatedAt: new Date(),
        format: format as any,
      },
    });

    return updatedReport;
  }

  async generateCustomReport(schoolId: string, filters: any) {
    // Generate custom report based on filters
    return this.compileReportData(schoolId, filters);
  }

  // ============ Report Types ============

  async getReportTypes() {
    return [
      { type: 'attendance', label: 'Attendance Report', description: 'Student attendance analytics', icon: 'calendar' },
      { type: 'fee', label: 'Fee Report', description: 'Fee collection and status', icon: 'dollar' },
      { type: 'exam', label: 'Exam Report', description: 'Exam results and performance', icon: 'award' },
      { type: 'student', label: 'Student Report', description: 'Student demographics and statistics', icon: 'users' },
      { type: 'teacher', label: 'Teacher Report', description: 'Teacher performance and workload', icon: 'user' },
      { type: 'class', label: 'Class Report', description: 'Class-wise performance analysis', icon: 'book' },
      { type: 'performance', label: 'Performance Report', description: 'Overall school performance', icon: 'trending-up' },
      { type: 'financial', label: 'Financial Report', description: 'School financial overview', icon: 'dollar' },
      { type: 'custom', label: 'Custom Report', description: 'Build your own report', icon: 'file' },
    ];
  }

  // ============ Dashboard Analytics ============

  async getDashboardAnalytics(schoolId: string, filters: any) {
    const { dateFrom, dateTo } = filters;

    // Get metrics
    const metrics = await this.getDashboardMetrics(schoolId, { dateFrom, dateTo });

    // Get charts
    const charts = await this.getDashboardCharts(schoolId, { dateFrom, dateTo });

    // Get recent reports
    const recentReports = await prisma.report.findMany({
      where: {
        schoolId,
        status: 'generated',
      },
      orderBy: { generatedAt: 'desc' },
      take: 5,
    });

    return {
      metrics,
      charts,
      recentReports,
    };
  }

  // ============ Scheduled Reports ============

  async scheduleReport(id: string, schoolId: string, frequency: string, recipients: string[]) {
    const report = await prisma.report.findFirst({
      where: { id, schoolId },
    });
    if (!report) throw new Error('Report not found');

    const nextRunAt = this.calculateNextRun(frequency);

    return prisma.report.update({
      where: { id },
      data: {
        scheduled: true,
        frequency: frequency as any,
        nextRunAt,
        recipients,
      },
    });
  }

  async unscheduleReport(id: string, schoolId: string) {
    const report = await prisma.report.findFirst({
      where: { id, schoolId },
    });
    if (!report) throw new Error('Report not found');

    return prisma.report.update({
      where: { id },
      data: {
        scheduled: false,
        frequency: undefined,
        nextRunAt: undefined,
        recipients: [],
      },
    });
  }

  // ============ Auto-Generate Reports ============

  async generateAttendanceReport(schoolId: string, filters: any) {
    const attendanceData = await this.getAttendanceData(schoolId, filters);
    return this.compileReportData(schoolId, { ...filters, data: attendanceData, type: 'attendance' });
  }

  async generateFeeReport(schoolId: string, filters: any) {
    const feeData = await this.getFeeData(schoolId, filters);
    return this.compileReportData(schoolId, { ...filters, data: feeData, type: 'fee' });
  }

  async generateExamReport(schoolId: string, filters: any) {
    const examData = await this.getExamData(schoolId, filters);
    return this.compileReportData(schoolId, { ...filters, data: examData, type: 'exam' });
  }

  async generateStudentReport(schoolId: string, filters: any) {
    const studentData = await this.getStudentData(schoolId, filters);
    return this.compileReportData(schoolId, { ...filters, data: studentData, type: 'student' });
  }

  async generateTeacherReport(schoolId: string, filters: any) {
    const teacherData = await this.getTeacherData(schoolId, filters);
    return this.compileReportData(schoolId, { ...filters, data: teacherData, type: 'teacher' });
  }

  async generateClassReport(schoolId: string, filters: any) {
    const classData = await this.getClassData(schoolId, filters);
    return this.compileReportData(schoolId, { ...filters, data: classData, type: 'class' });
  }

  // ============ Helper Methods ============

  private async getAttendanceData(schoolId: string, filters: any) {
    const { classId, sectionId, dateFrom, dateTo } = filters;
    const where: any = { schoolId };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (dateFrom) where.date = { gte: new Date(dateFrom) };
    if (dateTo) where.date = { ...where.date, lte: new Date(dateTo) };

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            class: true,
            section: true,
          },
        },
      },
    });

    // Group by student
    const grouped = attendance.reduce((acc: any, curr) => {
      const key = curr.studentId;
      if (!acc[key]) {
        acc[key] = {
          studentId: curr.studentId,
          name: curr.student.name,
          roll: curr.student.rollNumber,
          class: curr.student.class,
          section: curr.student.section || '',
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
        };
      }
      if (curr.status === 'present') acc[key].present++;
      else if (curr.status === 'absent') acc[key].absent++;
      else if (curr.status === 'late') acc[key].late++;
      else if (curr.status === 'leave') acc[key].leave++;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  private async getFeeData(schoolId: string, filters: any) {
    const { classId, sectionId, month, year } = filters;
    const where: any = { schoolId };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (month) where.month = month;
    if (year) where.year = parseInt(year);

    const fees = await prisma.fee.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            class: true,
            section: true,
          },
        },
        feeStructure: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    return fees.map(fee => ({
      student: fee.student.name,
      roll: fee.student.rollNumber,
      class: fee.student.class,
      section: fee.student.section || '',
      feeType: fee.feeStructure.name,
      amount: fee.totalAmount,
      paid: fee.paidAmount,
      due: fee.dueAmount,
      status: fee.status,
      dueDate: fee.dueDate,
    }));
  }

  private async getExamData(schoolId: string, filters: any) {
    const { classId, sectionId, examId } = filters;
    const where: any = { schoolId };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (examId) where.examId = examId;

    const results = await prisma.result.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            class: true,
            section: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return results.map(result => ({
      student: result.student.name,
      roll: result.student.rollNumber,
      class: result.student.class,
      section: result.student.section || '',
      exam: result.exam.name,
      totalMarks: result.totalMarks,
      obtained: result.obtainedMarks,
      percentage: result.percentage,
      grade: result.grade,
      gpa: result.gpa,
      rank: result.rank,
      status: result.isPassed ? 'Passed' : 'Failed',
    }));
  }

  private async getStudentData(schoolId: string, filters: any) {
    const { classId, sectionId, gender } = filters;
    const where: any = { schoolId, isActive: true };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (gender) where.gender = gender;

    const students = await prisma.student.findMany({
      where,
      include: {
        parent: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    return students.map(student => ({
      name: student.name,
      roll: student.rollNumber,
      class: student.class,
      section: student.section || '',
      gender: student.gender,
      father: student.fatherName,
      mother: student.motherName,
      parent: student.parent?.name || '',
      phone: student.parent?.phone || student.phone || '',
      admissionDate: student.admissionDate,
    }));
  }

  private async getTeacherData(schoolId: string, filters: any) {
    const { department } = filters;
    const where: any = { schoolId, isActive: true };
    if (department) where.department = department;

    const teachers = await prisma.teacher.findMany({
      where,
      
    });

    return teachers.map(teacher => ({
      name: teacher.name,
      employeeId: teacher.employeeId,
      designation: teacher.designation,
      department: teacher.department,
      qualification: teacher.qualification,
      experience: teacher.experience,
      email: teacher.email,
      phone: teacher.phone,
      joiningDate: teacher.joiningDate,
    }));
  }

  private async getClassData(schoolId: string, filters: any) {
    const { academicYearId } = filters;
    const where: any = { schoolId, isActive: true };
    if (academicYearId) where.academicYearId = academicYearId;

    const classes = await prisma.class.findMany({
      where,
      include: {
        sections: true,
        teacher: {
          select: {
            name: true,
          },
        },
        academicYear: {
          select: {
            name: true,
          },
        },
      },
    });

    return classes.map(cls => ({
      name: cls.name,
      code: cls.code,
      sections: cls.sections.length,
      teacher: cls.teacher?.name || '',
      capacity: cls.capacity,
      students: cls.currentStudents || 0,
      academicYear: cls.academicYear.name,
      isActive: cls.isActive,
    }));
  }

  private compileReportData(schoolId: string, data: any): ReportData {
    const { data: rawData, type, ...filters } = data;

    const summary: ReportSummary = {
      title: `${type?.charAt(0).toUpperCase() + type?.slice(1)} Report`,
      generatedAt: new Date(),
      totalRecords: Array.isArray(rawData) ? rawData.length : 0,
      filters: filters as any,
      metadata: {
        schoolId,
        generatedBy: 'System',
        version: '1.0',
      },
    };

    // Generate charts based on data
    const charts: ReportChart[] = [];
    if (rawData && Array.isArray(rawData)) {
      // Create charts based on data structure
      if (rawData.length > 0) {
        // Try to find numeric fields for charts
        const sample = rawData[0];
        const numericFields = Object.keys(sample).filter(key =>
          typeof sample[key] === 'number' &&
          !['id', 'roll', 'rollNumber'].includes(key)
        );

        if (numericFields.length > 0) {
          charts.push({
            id: 'main-chart',
            title: 'Distribution',
            type: 'bar',
            labels: rawData.map((item: any) => item.name || item.student || 'Unknown'),
            datasets: numericFields.slice(0, 3).map(field => ({
              label: field.charAt(0).toUpperCase() + field.slice(1),
              data: rawData.map((item: any) => item[field] || 0),
            })),
          });
        }

        // Add pie chart for status distribution if available
        if (rawData.some((item: any) => item.status)) {
          const statusCounts = rawData.reduce((acc: any, item: any) => {
            const status = item.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});

          charts.push({
            id: 'status-chart',
            title: 'Status Distribution',
            type: 'pie',
            labels: Object.keys(statusCounts),
            datasets: [{
              label: 'Count',
              data: Object.values(statusCounts),
            }],
          });
        }
      }
    }

    // Generate tables
    const tables: ReportTable[] = [];
    if (rawData && Array.isArray(rawData) && rawData.length > 0) {
      const headers = Object.keys(rawData[0]);
      const rows = rawData.map((item: any) => headers.map(key => item[key] || ''));
      tables.push({
        id: 'data-table',
        title: 'Data Table',
        headers,
        rows,
      });
    }

    // Generate metrics
    const metrics: ReportMetric[] = [];
    if (rawData && Array.isArray(rawData)) {
      const totalRecords = rawData.length;
      metrics.push({
        label: 'Total Records',
        value: totalRecords,
        icon: 'file',
        color: '#3B82F6',
      });

      // Calculate numeric averages
      const sample = rawData[0];
      if (sample) {
        const numericFields = Object.keys(sample).filter(key =>
          typeof sample[key] === 'number' &&
          !['id', 'roll', 'rollNumber'].includes(key)
        );

        numericFields.slice(0, 2).forEach(field => {
          const total = rawData.reduce((sum: number, item: any) => sum + (item[field] || 0), 0);
          const avg = totalRecords > 0 ? total / totalRecords : 0;
          metrics.push({
            label: `Avg ${field}`,
            value: avg.toFixed(2),
            icon: 'trending-up',
            color: '#10B981',
          });
        });
      }
    }

    return {
      summary,
      charts,
      tables,
      metrics,
    };
  }

  private async getDashboardMetrics(schoolId: string, filters: any) {
    const { dateFrom, dateTo } = filters;

    const [totalStudents, totalTeachers, totalClasses, attendanceRate, feeCollected] = await Promise.all([
      prisma.student.count({ where: { schoolId, isActive: true } }),
      prisma.teacher.count({ where: { schoolId, isActive: true } }),
      prisma.class.count({ where: { schoolId, isActive: true } }),
      this.calculateAttendanceRate(schoolId, dateFrom, dateTo),
      this.calculateFeeCollected(schoolId, dateFrom, dateTo),
    ]);

    return [
      {
        label: 'Total Students',
        value: totalStudents,
        change: 5.2,
        trend: 'up' as 'up' | 'down' | 'stable',
        icon: 'users',
        color: '#3B82F6',
      },
      {
        label: 'Total Teachers',
        value: totalTeachers,
        change: 2.7,
        trend: 'up' as 'up' | 'down' | 'stable',
        icon: 'user',
        color: '#10B981',
      },
      {
        label: 'Total Classes',
        value: totalClasses,
        change: 0,
        trend: 'stable' as 'up' | 'down' | 'stable',
        icon: 'book',
        color: '#F59E0B',
      },
      {
        label: 'Attendance Rate',
        value: attendanceRate,
        change: 3.6,
        trend: 'up' as 'up' | 'down' | 'stable',
        icon: 'calendar',
        color: '#8B5CF6',
      },
      {
        label: 'Fee Collected',
        value: feeCollected,
        change: 4.3,
        trend: 'up' as 'up' | 'down' | 'stable',
        icon: 'dollar',
        color: '#EF4444',
      },
    ];
  }

  private async getDashboardCharts(schoolId: string, filters: any) {
    const { dateFrom, dateTo } = filters;

    // Attendance by class
    const attendanceByClass = await prisma.attendance.groupBy({
      by: ['classId'],
      where: {
        schoolId,
        date: dateFrom && dateTo ? {
          gte: new Date(dateFrom),
          lte: new Date(dateTo),
        } : undefined,
      },
      _count: true,
    });

    const classes = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true, name: true },
    });

    const classMap = classes.reduce((acc: any, cls) => {
      acc[cls.id] = cls.name;
      return acc;
    }, {});

    const classLabels = attendanceByClass.map(item => classMap[item.classId] || item.classId);
    const classCounts = attendanceByClass.map(item => item._count);

    return [
      {
        id: 'attendance-by-class',
        title: 'Attendance by Class',
        type: 'bar' as 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar',
        labels: classLabels.length > 0 ? classLabels : ['No Data'],
        datasets: [{
          label: 'Attendance',
          data: classCounts.length > 0 ? classCounts : [0],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        }],
      },
      {
        id: 'fee-collection',
        title: 'Fee Collection Trend',
        type: 'line' as 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Collected',
          data: [120000, 135000, 110000, 145000, 160000, 150000],
          borderColor: '#3B82F6',
          fill: false,
        }],
      },
      {
        id: 'student-distribution',
        title: 'Student Distribution by Class',
        type: 'pie' as 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar',
        labels: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
        datasets: [{
          label: 'Students',
          data: [45, 52, 48, 55, 50],
        }],
      },
    ];
  }

  private async calculateAttendanceRate(schoolId: string, dateFrom?: string, dateTo?: string): Promise<number> {
    const where: any = { schoolId };
    if (dateFrom) where.date = { gte: new Date(dateFrom) };
    if (dateTo) where.date = { ...where.date, lte: new Date(dateTo) };

    const attendance = await prisma.attendance.findMany({ where });
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;

    return total > 0 ? Math.round((present / total) * 100) : 0;
  }

  private async calculateFeeCollected(schoolId: string, dateFrom?: string, dateTo?: string): Promise<number> {
    const where: any = { schoolId };
    if (dateFrom) where.createdAt = { gte: new Date(dateFrom) };
    if (dateTo) where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };

    const fees = await prisma.fee.findMany({
      where,
      select: { paidAmount: true },
    });

    return fees.reduce((sum, f) => sum + f.paidAmount, 0);
  }

  private calculateNextRun(frequency: string): Date {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        now.setMonth(now.getMonth() + 3);
        break;
      case 'yearly':
        now.setFullYear(now.getFullYear() + 1);
        break;
      default:
        now.setDate(now.getDate() + 1);
    }
    return now;
  }

  // ============ Export ============

  async downloadReport(id: string, schoolId: string, format: string) {
    const report = await prisma.report.findFirst({
      where: { id, schoolId },
    });
    if (!report) throw new Error('Report not found');

    // Generate CSV/PDF based on format
    if (format === 'csv' && report.data) {
      const data = report.data as any;
      const csv = this.generateCSV(data);
      return csv;
    }

    return report.data;
  }

  private generateCSV(data: any): string {
    if (!data || !data.tables || data.tables.length === 0) {
      return 'No data available';
    }

    const table = data.tables[0];
    const headers = table.headers.join(',');
    const rows = table.rows.map((row: any[]) => row.join(',')).join('\n');

    return `${headers}\n${rows}`;
  }
}

export default new ReportService();