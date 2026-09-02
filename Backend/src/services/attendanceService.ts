import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class AttendanceService {
  // ============ Get Attendance ============

  async getAttendance(schoolId: string, filters: any) {
    const { 
      classId, 
      sectionId, 
      studentId, 
      status, 
      dateFrom, 
      dateTo, 
      page = 1, 
      limit = 10 
    } = filters;

    const where: any = { schoolId };

    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (dateFrom) where.date = { gte: new Date(dateFrom) };
    if (dateTo) where.date = { ...where.date, lte: new Date(dateTo) };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take,
        include: {
          student: {
            select: {
              name: true,
              nameBangla: true,
              rollNumber: true,
            },
          },
          markedByUser: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ]);

    return {
      attendance,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getClassAttendance(classId: string, sectionId: string, date: string, schoolId: string) {
    const dateObj = new Date(`${date.slice(0, 10)}T00:00:00.000Z`);
    const nextDate = new Date(dateObj);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      select: { name: true },
    });

    const sectionRecord = await prisma.section.findUnique({
      where: { id: sectionId },
      select: { name: true },
    });

    const className = classRecord?.name;
    const sectionName = sectionRecord?.name;

    // Get all students in the class/section using the stored student.name values
    const students = await prisma.student.findMany({
      where: {
        schoolId,
        ...(className ? { class: className } : {}),
        ...(sectionName ? { section: sectionName } : {}),
        isActive: true,
      },
      orderBy: { rollNumber: 'asc' },
    });

    // Get attendance records for the date
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        classId,
        sectionId,
        date: { gte: dateObj, lt: nextDate },
        schoolId,
      },
    });

    // Map attendance to students
    const studentAttendance = students.map(student => {
      const record = attendanceRecords.find(a => a.studentId === student.id);
      return {
        studentId: student.id,
        studentName: student.name,
        studentRoll: student.rollNumber,
        status: record?.status || 'absent',
        checkInTime: record?.checkInTime || undefined,
        checkOutTime: record?.checkOutTime || undefined,
        remarks: record?.remarks || undefined,
      };
    });

    const summary = {
      totalStudents: students.length,
      present: studentAttendance.filter(s => s.status === 'present').length,
      absent: studentAttendance.filter(s => s.status === 'absent').length,
      late: studentAttendance.filter(s => s.status === 'late').length,
      leave: studentAttendance.filter(s => s.status === 'leave').length,
    };

    return {
      classId,
      className: await this.getClassName(classId),
      sectionId,
      sectionName: await this.getSectionName(sectionId),
      date: dateObj,
      ...summary,
      attendancePercentage: summary.totalStudents > 0 
        ? Math.round(((summary.present + summary.late) / summary.totalStudents) * 100) 
        : 0,
      students: studentAttendance,
    };
  }

  async getStudentAttendance(studentId: string, schoolId: string, dateFrom?: string, dateTo?: string, user?: { email: string; role: string }) {
    const where: any = {
      studentId,
      schoolId,
    };

    if (user?.role === 'student') {
      where.student = { email: user.email, schoolId };
    }

    if (dateFrom) where.date = { gte: new Date(dateFrom) };
    if (dateTo) where.date = { ...where.date, lte: new Date(dateTo) };

    return prisma.attendance.findMany({
      where,
      include: {
        class: {
          select: {
            name: true,
          },
        },
        section: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  // ============ Mark Attendance ============

  async markAttendance(schoolId: string, data: any, markedBy: string) {
    const { classId, sectionId, date, records } = data;
    const dateObj = new Date(`${String(date).slice(0, 10)}T00:00:00.000Z`);
    const nextDate = new Date(dateObj);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    // Check if it's a holiday
    const holiday = await prisma.holiday.findFirst({
      where: {
        schoolId,
        date: { gte: dateObj, lt: nextDate },
        isActive: true,
      },
    });

    if (holiday) {
      throw new Error('This date is a holiday');
    }

    const results: any[] = [];

    // Use transaction for all updates
    await prisma.$transaction(async (tx) => {
      for (const record of records) {
        // Upsert attendance
        const existingAttendance = await tx.attendance.findFirst({
          where: {
            studentId: record.studentId,
            date: { gte: dateObj, lt: nextDate },
          },
        });
        const attendance = existingAttendance
          ? await tx.attendance.update({
              where: { id: existingAttendance.id },
              data: {
            status: record.status,
            checkInTime: record.checkInTime,
            checkOutTime: record.checkOutTime,
            remarks: record.remarks,
            markedBy,
              },
            })
          : await tx.attendance.create({
              data: {
            schoolId,
            studentId: record.studentId,
            classId,
            sectionId,
            date: dateObj,
            status: record.status,
            checkInTime: record.checkInTime,
            checkOutTime: record.checkOutTime,
            remarks: record.remarks,
            markedBy,
              },
            });
        results.push(attendance);
      }
    });

    return results;
  }

  async markBulkAttendance(schoolId: string, data: any, markedBy: string) {
    const { classId, sectionId, date, defaultStatus, records } = data;
    const dateObj = new Date(date);

    // Check if it's a holiday
    const holiday = await prisma.holiday.findFirst({
      where: {
        schoolId,
        date: dateObj,
        isActive: true,
      },
    });

    if (holiday) {
      throw new Error('This date is a holiday');
    }

    const results: any[] = [];

    await prisma.$transaction(async (tx) => {
      for (const record of records) {
        const status = record.status || defaultStatus || 'present';
        const attendance = await tx.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: dateObj,
            },
          },
          update: {
            status,
            markedBy,
          },
          create: {
            schoolId,
            studentId: record.studentId,
            classId,
            sectionId,
            date: dateObj,
            status,
            markedBy,
          },
        });
        results.push(attendance);
      }
    });

    return results;
  }

  async updateAttendance(id: string, schoolId: string, data: any) {
    const attendance = await prisma.attendance.findFirst({
      where: { id, schoolId },
    });

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    return prisma.attendance.update({
      where: { id },
      data: {
        status: data.status,
        remarks: data.remarks,
      },
    });
  }

  // ============ Statistics ============

  async getAttendanceSummary(schoolId: string, params: any) {
    const { classId, sectionId, date } = params;
    const dateObj = date
      ? new Date(`${String(date).slice(0, 10)}T00:00:00.000Z`)
      : new Date();
    const nextDate = new Date(dateObj);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const [classRecord, sectionRecord] = await Promise.all([
      classId
        ? prisma.class.findUnique({ where: { id: classId }, select: { name: true } })
        : Promise.resolve(null),
      sectionId
        ? prisma.section.findUnique({ where: { id: sectionId }, select: { name: true } })
        : Promise.resolve(null),
    ]);

    const where: any = {
      schoolId,
      date: { gte: dateObj, lt: nextDate },
    };

    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;

    const [totalStudents, attendanceRecords] = await Promise.all([
      prisma.student.count({
        where: {
          schoolId,
          class: classRecord?.name || undefined,
          section: sectionRecord?.name || undefined,
          isActive: true,
        },
      }),
      prisma.attendance.findMany({
        where,
      }),
    ]);

    const present = attendanceRecords.filter(a => a.status === 'present').length;
    const absent = attendanceRecords.filter(a => a.status === 'absent').length;
    const late = attendanceRecords.filter(a => a.status === 'late').length;
    const leave = attendanceRecords.filter(a => a.status === 'leave').length;

    return {
      totalStudents,
      present,
      absent,
      late,
      leave,
      percentage: totalStudents > 0 ? Math.round(((present + late) / totalStudents) * 100) : 0,
      date: dateObj,
    };
  }

  async getAttendanceStatistics(schoolId: string, params: any) {
    const { classId, sectionId, dateFrom, dateTo } = params;
    const from = dateFrom ? new Date(dateFrom) : new Date(new Date().setDate(1));
    const to = dateTo ? new Date(dateTo) : new Date();

    const overallWhere: any = {
      schoolId,
      date: {
        gte: from,
        lte: to,
      },
    };
    if (classId) overallWhere.classId = classId;
    if (sectionId) overallWhere.sectionId = sectionId;

    const records = await prisma.attendance.findMany({
      where: overallWhere,
      include: {
        class: {
          select: { name: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    const total = records.length;
    const present = records.filter(a => a.status === 'present').length;
    const absent = records.filter(a => a.status === 'absent').length;
    const late = records.filter(a => a.status === 'late').length;
    const leave = records.filter(a => a.status === 'leave').length;

    const classMap = new Map<string, { className: string; present: number; absent: number; late: number; leave: number; total: number }>();
    const dayMap = new Map<string, { date: string; present: number; absent: number; late: number; leave: number; total: number }>();
    const monthMap = new Map<string, { month: string; present: number; absent: number; late: number; leave: number; total: number }>();

    records.forEach(record => {
      const className = record.class?.name || 'Unknown';
      const currentClass = classMap.get(record.classId) || {
        className,
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total: 0,
      };
      currentClass.total += 1;
      if (record.status === 'present') currentClass.present += 1;
      if (record.status === 'absent') currentClass.absent += 1;
      if (record.status === 'late') currentClass.late += 1;
      if (record.status === 'leave') currentClass.leave += 1;
      classMap.set(record.classId, currentClass);

      const dayKey = record.date.toISOString().split('T')[0];
      const currentDay = dayMap.get(dayKey) || {
        date: dayKey,
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total: 0,
      };
      currentDay.total += 1;
      if (record.status === 'present') currentDay.present += 1;
      if (record.status === 'absent') currentDay.absent += 1;
      if (record.status === 'late') currentDay.late += 1;
      if (record.status === 'leave') currentDay.leave += 1;
      dayMap.set(dayKey, currentDay);

      const monthKey = record.date.toISOString().slice(0, 7);
      const currentMonth = monthMap.get(monthKey) || {
        month: monthKey,
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total: 0,
      };
      currentMonth.total += 1;
      if (record.status === 'present') currentMonth.present += 1;
      if (record.status === 'absent') currentMonth.absent += 1;
      if (record.status === 'late') currentMonth.late += 1;
      if (record.status === 'leave') currentMonth.leave += 1;
      monthMap.set(monthKey, currentMonth);
    });

    return {
      overall: {
        total,
        present,
        absent,
        late,
        leave,
        percentage: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
      },
      byClass: Array.from(classMap.values()).map(item => ({
        className: item.className,
        present: item.present,
        absent: item.absent,
        percentage: item.total > 0 ? Math.round(((item.present + item.late) / item.total) * 100) : 0,
      })),
      byDay: Array.from(dayMap.values()).map(item => ({
        date: item.date,
        present: item.present,
        absent: item.absent,
        percentage: item.total > 0 ? Math.round(((item.present + item.late) / item.total) * 100) : 0,
      })),
      monthly: Array.from(monthMap.values()).map(item => ({
        month: item.month,
        present: item.present,
        absent: item.absent,
        percentage: item.total > 0 ? Math.round(((item.present + item.late) / item.total) * 100) : 0,
      })),
    };
  }

  // ============ Notifications ============

  async notifyAbsentStudent(schoolId: string, studentId: string, date: string) {
    // This would integrate with SMS/Email service
    // For now, just log it
    console.log(`📧 Sending absence notification for student ${studentId} on ${date}`);
    
    return {
      success: true,
      message: 'Notification sent successfully',
    };
  }

  async notifyBulkAbsent(schoolId: string, classId: string, sectionId: string, date: string) {
    // Get all absent students for the date
    const dateObj = new Date(date);
    const absentStudents = await prisma.attendance.findMany({
      where: {
        schoolId,
        classId,
        sectionId,
        date: dateObj,
        status: 'absent',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send notifications (simplified)
    const count = absentStudents.length;
    console.log(`📧 Sending bulk absence notifications for ${count} students`);

    return {
      success: true,
      message: `Notifications sent to ${count} students`,
      count,
    };
  }

  // ============ QR/Biometric ============

  async scanQR(schoolId: string, code: string) {
    // Decode QR code to get student ID
    // This is a simplified version
    const studentId = code; // In real implementation, decode from QR
    
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!student) {
      throw new Error('Invalid QR code');
    }

    return {
      studentId: student.id,
      name: student.name,
      status: 'present',
    };
  }

  async verifyBiometric(schoolId: string, studentId: string, biometricData: string) {
    // This would integrate with biometric system
    // Simplified version
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // In real implementation, verify biometric data
    const isValid = true; // Placeholder

    return {
      success: isValid,
      studentId: student.id,
      name: student.name,
    };
  }

  // ============ Holidays ============

  async getHolidays(schoolId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    return prisma.holiday.findMany({
      where: {
        schoolId,
        date: {
          gte: startDate,
          lt: endDate,
        },
        isActive: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  async createHoliday(schoolId: string, data: any) {
    const existing = await prisma.holiday.findFirst({
      where: {
        schoolId,
        date: new Date(data.date),
      },
    });

    if (existing) {
      throw new Error('Holiday already exists on this date');
    }

    return prisma.holiday.create({
      data: {
        ...data,
        schoolId,
        date: new Date(data.date),
      },
    });
  }

  async deleteHoliday(id: string, schoolId: string) {
    const holiday = await prisma.holiday.findFirst({
      where: { id, schoolId },
    });

    if (!holiday) {
      throw new Error('Holiday not found');
    }

    return prisma.holiday.delete({ where: { id } });
  }

  // ============ Helper Methods ============

  private async getClassName(classId: string): Promise<string> {
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      select: { name: true },
    });
    return cls?.name || classId;
  }

  private async getSectionName(sectionId: string): Promise<string> {
    if (!sectionId) return '';
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      select: { name: true },
    });
    return section?.name || sectionId;
  }

  // ============ Export ============

  async exportAttendance(schoolId: string, params: any) {
    const { classId, sectionId, dateFrom, dateTo, format = 'csv' } = params;
    
    const where: any = {
      schoolId,
    };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (dateFrom) where.date = { gte: new Date(dateFrom) };
    if (dateTo) where.date = { ...where.date, lte: new Date(dateTo) };

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            name: true,
            rollNumber: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
        section: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Format for CSV
    const headers = [
      'Date',
      'Student Name',
      'Roll Number',
      'Class',
      'Section',
      'Status',
      'Check In',
      'Check Out',
      'Remarks',
    ];

    const rows = records.map(record => [
      record.date.toISOString().split('T')[0],
      record.student.name,
      record.student.rollNumber,
      record.class.name,
      record.section?.name || '',
      record.status,
      record.checkInTime || '',
      record.checkOutTime || '',
      record.remarks || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  }
}

export default new AttendanceService();