import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class ParentService {
  // ============ Dashboard ============

  async getDashboard(parentId: string, schoolId: string) {
    // Get children
    const children = await prisma.student.findMany({
      where: {
        parentId,
        schoolId,
        isActive: true,
      },
    });

    // Get attendance summary for all children
    const attendanceSummary = await this.getAttendanceSummaryForChildren(children, schoolId);

    // Get fee summary for all children
    const feeSummary = await this.getFeeSummaryForChildren(children, schoolId);

    // Get upcoming exams
    const classes = await prisma.class.findMany({
      where: { schoolId, name: { in: children.map(child => child.class) } },
      select: { id: true },
    });

    const upcomingExams = await prisma.exam.findMany({
      where: {
        schoolId,
        classId: { in: classes.map(classRecord => classRecord.id) },
        status: 'scheduled',
        examDate: { gte: new Date() },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { examDate: 'asc' },
      take: 5,
    });

    // Get recent notices
    const recentNotices = await prisma.notice.findMany({
      where: {
        schoolId,
        isPublished: true,
        publishedAt: { lte: new Date() },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });

    // Get unread messages
    const unreadMessages = await prisma.message.count({
      where: { parentId, receiverId: (await prisma.parent.findUnique({ where: { id: parentId } }))?.userId, isRead: false },
    });

    return {
      children,
      attendanceSummary,
      feeSummary,
      upcomingExams,
      recentNotices,
      unreadMessages: unreadMessages || 0,
    };
  }

  private async getAttendanceSummaryForChildren(children: any[], schoolId: string) {
    const date = new Date();
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        schoolId,
        studentId: { in: children.map(c => c.id) },
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const leave = attendance.filter(a => a.status === 'leave').length;
    const total = present + absent + late + leave;

    return {
      present,
      absent,
      late,
      leave,
      percentage: total > 0 ? (present / total) * 100 : 0,
    };
  }

  private async getFeeSummaryForChildren(children: any[], schoolId: string) {
    const fees = await prisma.fee.findMany({
      where: {
        schoolId,
        studentId: { in: children.map(c => c.id) },
        status: { in: ['unpaid', 'overdue'] },
      },
    });

    const totalDue = fees.reduce((sum, f) => sum + f.dueAmount, 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const overdueCount = fees.filter(f => f.status === 'overdue').length;

    return {
      totalDue,
      totalPaid,
      overdueCount,
    };
  }

  // ============ Children ============

  async getChildren(parentId: string, schoolId: string) {
    return prisma.student.findMany({
      where: {
        parentId,
        schoolId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getChild(childId: string, parentId: string, schoolId: string) {
    const child = await prisma.student.findFirst({
      where: {
        id: childId,
        parentId,
        schoolId,
      },
    });

    if (!child) throw new Error('Child not found');
    return child;
  }

  // ============ Attendance ============

  async getChildAttendance(childId: string, parentId: string, schoolId: string, filters: any) {
    const { dateFrom, dateTo } = filters;

    const child = await prisma.student.findFirst({
      where: { id: childId, parentId, schoolId },
    });
    if (!child) throw new Error('Child not found');

    const where: any = {
      studentId: childId,
      schoolId,
    };

    if (dateFrom) where.date = { gte: new Date(dateFrom) };
    if (dateTo) where.date = { ...where.date, lte: new Date(dateTo) };

    return prisma.attendance.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getAttendanceSummary(childId: string, parentId: string, schoolId: string) {
    const child = await prisma.student.findFirst({
      where: { id: childId, parentId, schoolId },
    });
    if (!child) throw new Error('Child not found');

    const date = new Date();
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        studentId: childId,
        schoolId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const leave = attendance.filter(a => a.status === 'leave').length;
    const total = present + absent + late + leave;

    return {
      present,
      absent,
      late,
      leave,
      percentage: total > 0 ? (present / total) * 100 : 0,
    };
  }

  // ============ Fees ============

  async getChildFees(childId: string, parentId: string, schoolId: string, filters: any) {
    const child = await prisma.student.findFirst({
      where: { id: childId, parentId, schoolId },
    });
    if (!child) throw new Error('Child not found');

    const where: any = {
      studentId: childId,
      schoolId,
    };

    if (filters.status) where.status = filters.status;

    return prisma.fee.findMany({
      where,
      include: {
        feeStructure: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getFeeSummary(childId: string, parentId: string, schoolId: string) {
    const child = await prisma.student.findFirst({
      where: { id: childId, parentId, schoolId },
    });
    if (!child) throw new Error('Child not found');

    const fees = await prisma.fee.findMany({
      where: {
        studentId: childId,
        schoolId,
        status: { in: ['unpaid', 'overdue'] },
      },
    });

    const totalDue = fees.reduce((sum, f) => sum + f.dueAmount, 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const overdueCount = fees.filter(f => f.status === 'overdue').length;

    return {
      totalDue,
      totalPaid,
      overdueCount,
    };
  }

  // ============ Results ============

  async getChildResults(childId: string, parentId: string, schoolId: string, filters: any) {
    const child = await prisma.student.findFirst({
      where: { id: childId, parentId, schoolId },
    });
    if (!child) throw new Error('Child not found');

    const where: any = {
      studentId: childId,
      student: { schoolId },
    };

    if (filters.examId) where.examId = filters.examId;

    const results = await prisma.result.findMany({
      where,
      include: {
        exam: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { exam: { examDate: 'desc' } },
    });

    return results.map(result => ({
      examId: result.examId,
      examName: result.exam.name,
      examType: result.exam.type,
      totalMarks: result.totalMarks,
      obtainedMarks: result.obtainedMarks,
      percentage: result.percentage,
      grade: result.grade,
      gpa: result.gpa,
      rank: result.rank,
      isPassed: result.isPassed,
      subjectResults: result.subjectResults,
    }));
  }

  async getChildResult(childId: string, examId: string, parentId: string, schoolId: string) {
    const child = await prisma.student.findFirst({
      where: { id: childId, parentId, schoolId },
    });
    if (!child) throw new Error('Child not found');

    const result = await prisma.result.findFirst({
      where: {
        studentId: childId,
        examId,
        student: { schoolId },
      },
      include: {
        exam: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!result) throw new Error('Result not found');

    return {
      examId: result.examId,
      examName: result.exam.name,
      examType: result.exam.type,
      totalMarks: result.totalMarks,
      obtainedMarks: result.obtainedMarks,
      percentage: result.percentage,
      grade: result.grade,
      gpa: result.gpa,
      rank: result.rank,
      isPassed: result.isPassed,
      subjectResults: result.subjectResults,
    };
  }

  // ============ Teachers ============

  async getChildTeachers(childId: string, parentId: string, schoolId: string) {
    const child = await prisma.student.findFirst({
      where: { id: childId, parentId, schoolId },
    });
    if (!child) throw new Error('Child not found');

    // Get teachers for the class
    const classSubjects = await prisma.classSubject.findMany({
      where: {
        class: { schoolId, name: child.class },
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return classSubjects
      .filter(cs => cs.teacherId)
      .map(cs => ({
        id: cs.teacherId!,
        name: cs.teacher!.name,
        subject: cs.subject.name,
      }));
  }

  // ============ Profile ============

  async getProfile(parentId: string, schoolId: string) {
    const parent = await prisma.parent.findFirst({
      where: { id: parentId, schoolId },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!parent) throw new Error('Parent profile not found');

    return {
      id: parent.id,
      name: parent.name,
      nameBangla: parent.nameBangla,
      email: parent.user.email,
      phone: parent.user.phone,
      address: parent.address,
      occupation: parent.occupation,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
    };
  }

  async updateProfile(parentId: string, schoolId: string, data: any) {
    const parent = await prisma.parent.findFirst({
      where: { id: parentId, schoolId },
    });
    if (!parent) throw new Error('Parent profile not found');

    // Update user
    await prisma.user.update({
      where: { id: parent.userId },
      data: {
        name: data.name,
        phone: data.phone,
      },
    });

    // Update parent
    return prisma.parent.update({
      where: { id: parentId },
      data: {
        name: data.name,
        nameBangla: data.nameBangla,
        address: data.address,
        occupation: data.occupation,
      },
    });
  }

  // ============ Notices ============

  async getNotices(schoolId: string, filters: any) {
    const { type, priority } = filters;

    const where: any = {
      schoolId,
      isPublished: true,
      publishedAt: { lte: new Date() },
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    };

    if (type) where.type = type;
    if (priority) where.priority = priority;

    return prisma.notice.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getNotice(noticeId: string, schoolId: string) {
    const notice = await prisma.notice.findFirst({
      where: { id: noticeId, schoolId },
    });

    if (!notice) throw new Error('Notice not found');
    return notice;
  }

  // ============ Messages ============

  async getMessages(parentId: string, schoolId: string, filters: any) {
    const parent = await prisma.parent.findFirst({
      where: { id: parentId, schoolId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!parent) throw new Error('Parent not found');

    const where: any = {
      receiverId: parent.userId,
      schoolId,
    };

    if (filters.isRead !== undefined) where.isRead = filters.isRead === 'true';

    return prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });
  }

  async sendMessage(parentId: string, schoolId: string, data: any) {
    const parent = await prisma.parent.findFirst({
      where: { id: parentId, schoolId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!parent) throw new Error('Parent not found');

    // Get receiver (school admin or teacher)
    const receiver = await prisma.user.findFirst({
      where: {
        schoolId,
        role: data.receiverRole || 'school_admin',
        id: data.receiverId || undefined,
      },
    });

    if (!receiver) throw new Error('Receiver not found');

    return prisma.message.create({
      data: {
        schoolId,
        senderId: parent.userId,
        receiverId: receiver.id,
        parentId: parent.id,
        subject: data.subject,
        message: data.message,
        isUrgent: data.isUrgent || false,
      },
    });
  }

  async markMessageAsRead(messageId: string, parentId: string, schoolId: string) {
    const parent = await prisma.parent.findFirst({
      where: { id: parentId, schoolId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!parent) throw new Error('Parent not found');

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        receiverId: parent.userId,
        schoolId,
      },
    });

    if (!message) throw new Error('Message not found');

    return prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async deleteMessage(messageId: string, parentId: string, schoolId: string) {
    const parent = await prisma.parent.findFirst({
      where: { id: parentId, schoolId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!parent) throw new Error('Parent not found');

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        receiverId: parent.userId,
        schoolId,
      },
    });

    if (!message) throw new Error('Message not found');

    return prisma.message.delete({ where: { id: messageId } });
  }

  // ============ Teacher Messages ============

  async sendTeacherMessage(parentId: string, schoolId: string, data: any) {
    const parent = await prisma.parent.findFirst({
      where: { id: parentId, schoolId },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!parent) throw new Error('Parent not found');

    const teacher = await prisma.user.findFirst({
      where: {
        id: data.teacherId,
        schoolId,
        role: 'teacher',
      },
    });

    if (!teacher) throw new Error('Teacher not found');

    return prisma.message.create({
      data: {
        schoolId,
        senderId: parent.userId,
        receiverId: teacher.id,
        parentId: parent.id,
        subject: `[Child: ${data.childId}] ${data.subject}`,
        message: data.message,
        isUrgent: data.isUrgent || false,
      },
    });
  }

  // ============ Payments ============

  async makePayment(parentId: string, schoolId: string, data: any) {
    const { childId, feeId, amount, method } = data;

    // Verify child belongs to parent
    const child = await prisma.student.findFirst({
      where: { id: childId, parentId, schoolId },
    });
    if (!child) throw new Error('Child not found');

    // Verify fee exists
    const fee = await prisma.fee.findFirst({
      where: { id: feeId, studentId: childId, schoolId },
    });
    if (!fee) throw new Error('Fee not found');

    // Process payment
    const payment = await prisma.$transaction(async (tx) => {
      // Create payment record
      const newPayment = await tx.payment.create({
        data: {
          schoolId,
          studentId: childId,
          feeId,
          amount,
          method,
          paymentDate: new Date(),
          receivedBy: parentId,
          status: 'completed',
        },
      });

      // Update fee
      const newPaidAmount = fee.paidAmount + amount;
      const newDueAmount = fee.totalAmount - newPaidAmount;
      const status = newDueAmount <= 0 ? 'paid' : 'partial';

      await tx.fee.update({
        where: { id: feeId },
        data: {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status,
          isPaid: newDueAmount <= 0,
          paidDate: newDueAmount <= 0 ? new Date() : undefined,
        },
      });

      return newPayment;
    });

    return {
      success: true,
      message: 'Payment processed successfully',
      transactionId: payment.id,
    };
  }

  // ============ Online Payments ============

  async initiateOnlinePayment(parentId: string, schoolId: string, data: any) {
    const { childId, feeId, amount, gateway } = data;

    // Verify child belongs to parent
    const child = await prisma.student.findFirst({
      where: { id: childId, parentId, schoolId },
    });
    if (!child) throw new Error('Child not found');

    // Verify fee exists
    const fee = await prisma.fee.findFirst({
      where: { id: feeId, studentId: childId, schoolId },
    });
    if (!fee) throw new Error('Fee not found');

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // TODO: Integrate with bKash, Nagad, or SSLCommerz API
    return {
      paymentUrl: `https://payment.gateway.com/pay/${transactionId}`,
      transactionId,
    };
  }

  // ============ Reports ============

  async getChildReport(childId: string, parentId: string, schoolId: string, format: string = 'pdf') {
    const child = await prisma.student.findFirst({
      where: { id: childId, parentId, schoolId },
    });
    if (!child) throw new Error('Child not found');

    // Get attendance
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId: childId,
        schoolId,
      },
      orderBy: { date: 'desc' },
      take: 30,
    });

    // Get results
    const results = await prisma.result.findMany({
      where: {
        studentId: childId,
        student: { schoolId },
      },
      include: {
        exam: true,
      },
      orderBy: { exam: { examDate: 'desc' } },
    });

    // Generate report data
    const reportData = {
      child,
      attendance,
      results,
      generatedAt: new Date(),
    };

    // TODO: Generate PDF/CSV report
    return reportData;
  }
}

export default new ParentService();