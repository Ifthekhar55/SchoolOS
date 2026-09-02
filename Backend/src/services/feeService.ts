import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class FeeService {
  // ============ Fee Structures ============

  private async createDefaultFeeStructures(schoolId: string) {
    const defaultStructures: Array<{
      name: string;
      type: 'admission' | 'tuition' | 'exam' | 'transport' | 'library' | 'lab' | 'sports' | 'development' | 'other';
      amount: number;
      frequency: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'one_time';
      lateFee: number;
      lateFeeAfterDays: number;
      isRecurring: boolean;
    }> = [
      { name: 'Admission Fee', type: 'admission', amount: 2500, frequency: 'one_time', lateFee: 0, lateFeeAfterDays: 10, isRecurring: false },
      { name: 'Tuition Fee', type: 'tuition', amount: 2500, frequency: 'monthly', lateFee: 100, lateFeeAfterDays: 10, isRecurring: true },
      { name: 'Exam Fee', type: 'exam', amount: 1200, frequency: 'half_yearly', lateFee: 50, lateFeeAfterDays: 10, isRecurring: true },
      { name: 'Transport Fee', type: 'transport', amount: 1800, frequency: 'monthly', lateFee: 80, lateFeeAfterDays: 10, isRecurring: true },
      { name: 'Library Fee', type: 'library', amount: 500, frequency: 'monthly', lateFee: 25, lateFeeAfterDays: 10, isRecurring: true },
      { name: 'Lab Fee', type: 'lab', amount: 800, frequency: 'monthly', lateFee: 40, lateFeeAfterDays: 10, isRecurring: true },
      { name: 'Sports Fee', type: 'sports', amount: 600, frequency: 'monthly', lateFee: 30, lateFeeAfterDays: 10, isRecurring: true },
      { name: 'Development Fee', type: 'development', amount: 1000, frequency: 'yearly', lateFee: 50, lateFeeAfterDays: 10, isRecurring: true },
      { name: 'Other Fees', type: 'other', amount: 300, frequency: 'monthly', lateFee: 20, lateFeeAfterDays: 10, isRecurring: true },
    ];

    return prisma.feeStructure.createMany({
      data: defaultStructures.map((item) => ({
        ...item,
        schoolId,
        isActive: true,
      })),
    });
  }

  async getFeeStructures(schoolId: string, filters: any) {
    const { classId, type } = filters;
    const where: any = { schoolId, isActive: true };

    if (classId) where.classId = classId;
    if (type) where.type = type;

    let structures = await prisma.feeStructure.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (structures.length === 0) {
      await this.createDefaultFeeStructures(schoolId);
      structures = await prisma.feeStructure.findMany({
        where,
        include: {
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return structures;
  }

  async getFeeStructure(id: string, schoolId: string) {
    const structure = await prisma.feeStructure.findFirst({
      where: { id, schoolId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!structure) throw new Error('Fee structure not found');
    return structure;
  }

  async createFeeStructure(schoolId: string, data: any) {
    return prisma.feeStructure.create({
      data: {
        ...data,
        schoolId,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateFeeStructure(id: string, schoolId: string, data: any) {
    const existing = await prisma.feeStructure.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Fee structure not found');

    return prisma.feeStructure.update({
      where: { id },
      data,
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteFeeStructure(id: string, schoolId: string) {
    const existing = await prisma.feeStructure.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Fee structure not found');

    return prisma.feeStructure.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============ Fees ============

  private async buildScopeAwareFeeWhere(schoolId: string, filters: any) {
    const {
      studentId,
      classId,
      sectionId,
      status,
      type,
      month,
      year,
      dateFrom,
      dateTo,
      search,
    } = filters;

    const where: any = { schoolId };

    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (type) where.feeStructure = { type };
    if (month) where.month = month;
    if (year) where.year = parseInt(year);
    if (dateFrom) where.dueDate = { gte: new Date(dateFrom) };
    if (dateTo) where.dueDate = { ...where.dueDate, lte: new Date(dateTo) };

    const scopedConditions: any[] = [];

    if (classId || sectionId) {
      const className = classId ? (await prisma.class.findUnique({ where: { id: classId }, select: { name: true } }))?.name : null;
      const sectionRecord = sectionId ? (await prisma.section.findUnique({ where: { id: sectionId }, select: { name: true, classId: true } })) : null;
      const sectionName = sectionRecord?.name || null;

      if (classId && sectionId) {
        scopedConditions.push({ classId, sectionId });
        if (className || sectionName) {
          scopedConditions.push({
            student: {
              ...(className ? { class: className } : {}),
              ...(sectionName ? { section: sectionName } : {}),
            },
          });
        }
      } else if (classId) {
        scopedConditions.push({ classId });
        if (className) {
          scopedConditions.push({ student: { class: className } });
        }
      } else if (sectionId) {
        scopedConditions.push({ sectionId });
        if (sectionName) {
          scopedConditions.push({ student: { section: sectionName } });
        }
      }

      if (scopedConditions.length > 0) {
        where.OR = scopedConditions;
      }
    }

    if (search) {
      where.OR = [
        ...(Array.isArray(where.OR) ? where.OR : []),
        { student: { name: { contains: search, mode: 'insensitive' } } },
        { feeStructure: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  async getFees(schoolId: string, filters: any, user?: { email: string; role: string }) {
    const {
      page = 1,
      limit = 10,
    } = filters;

    const where = await this.buildScopeAwareFeeWhere(schoolId, filters);

    if (user?.role === 'student') {
      const student = await prisma.student.findFirst({
        where: { schoolId, email: user.email },
        select: { id: true },
      });
      where.studentId = student?.id || '__student_not_found__';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [fees, total] = await Promise.all([
      prisma.fee.findMany({
        where,
        skip,
        take,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              rollNumber: true,
            },
          },
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
          feeStructure: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.fee.count({ where }),
    ]);

    return {
      fees,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getFee(id: string, schoolId: string) {
    const fee = await prisma.fee.findFirst({
      where: { id, schoolId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
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
        feeStructure: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        payments: true,
      },
    });
    if (!fee) throw new Error('Fee not found');
    return fee;
  }

  async getStudentFees(studentId: string, schoolId: string, filters: any) {
    const { status, month, year } = filters;
    const where: any = { studentId, schoolId };

    if (status) where.status = status;
    if (month) where.month = month;
    if (year) where.year = parseInt(year);

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

  async createFee(schoolId: string, data: any) {
    // Get student info
    const student = await prisma.student.findFirst({
      where: { id: data.studentId, schoolId },
    });
    if (!student) throw new Error('Student not found');

    const classRecord = await prisma.class.findFirst({
      where: { schoolId, name: student.class },
    });
    if (!classRecord) throw new Error('Student class not found');
    const sectionRecord = student.section
      ? await prisma.section.findFirst({
          where: { classId: classRecord.id, name: student.section },
        })
      : null;

    const dueAmount = data.amount;
    const totalAmount = dueAmount + (data.lateFee || 0);

    return prisma.fee.create({
      data: {
        ...data,
        schoolId,
        classId: classRecord.id,
        sectionId: sectionRecord?.id,
        dueAmount,
        totalAmount,
        status: 'unpaid',
        isPaid: false,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
        feeStructure: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async createBulkFees(schoolId: string, data: any) {
    const { classId, sectionId, feeStructureId, month, year, dueDate } = data;

    // Get all students in the class/section
    const classRecord = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });
    if (!classRecord) throw new Error('Class not found');

    const students = await prisma.student.findMany({
      where: {
        schoolId,
        class: classRecord.name,
        section: sectionId
          ? (await prisma.section.findFirst({ where: { id: sectionId, classId } }))?.name
          : undefined,
        isActive: true,
      },
    });

    if (students.length === 0) {
      throw new Error('No students found in this class/section');
    }

    // Get fee structure
    const feeStructure = await prisma.feeStructure.findFirst({
      where: { id: feeStructureId, schoolId },
    });
    if (!feeStructure) throw new Error('Fee structure not found');

    const results = [];

    for (const student of students) {
      // Check if fee already exists
      const existing = await prisma.fee.findFirst({
        where: {
          studentId: student.id,
          feeStructureId,
          month,
          year: parseInt(year),
        },
      });

      if (!existing) {
        const dueAmount = feeStructure.amount;
        const totalAmount = dueAmount + (feeStructure.lateFee || 0);

        const fee = await prisma.fee.create({
          data: {
            schoolId,
            studentId: student.id,
            feeStructureId,
            classId: classRecord.id,
            sectionId: sectionId || undefined,
            amount: dueAmount,
            dueAmount,
            totalAmount,
            lateFee: feeStructure.lateFee || 0,
            month,
            year: parseInt(year),
            dueDate: new Date(dueDate),
            status: 'unpaid',
            isPaid: false,
          },
        });
        results.push(fee);
      }
    }

    return {
      success: true,
      message: `Created ${results.length} fees for ${students.length} students`,
      count: results.length,
    };
  }

  async updateFee(id: string, schoolId: string, data: any) {
    const existing = await prisma.fee.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Fee not found');

    return prisma.fee.update({
      where: { id },
      data: {
        ...data,
        dueAmount: data.amount || existing.amount,
        totalAmount: (data.amount || existing.amount) + (data.lateFee || existing.lateFee || 0),
      },
    });
  }

  async deleteFee(id: string, schoolId: string) {
    const existing = await prisma.fee.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Fee not found');

    return prisma.fee.delete({ where: { id } });
  }

  // ============ Invoices ============

  async getInvoices(schoolId: string, filters: any) {
    const { studentId, classId, sectionId, status, page = 1, limit = 10 } = filters;

    const where: any = { schoolId };
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (classId) where.student = { classId };
    if (sectionId) where.student = { ...where.student, sectionId };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take,
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
          payments: true,
        },
        orderBy: { issuedDate: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async getInvoice(id: string, schoolId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, schoolId },
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
        payments: true,
      },
    });
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }

  async generateInvoice(studentId: string, schoolId: string, data: any) {
    const { month, year } = data;

    // Get student's fees for the month
    const fees = await prisma.fee.findMany({
      where: {
        studentId,
        schoolId,
        month,
        year: parseInt(year),
      },
      include: {
        feeStructure: true,
        student: {
          select: { rollNumber: true },
        },
      },
    });

    if (fees.length === 0) {
      throw new Error('No fees found for this student in the specified month');
    }

    const subtotal = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const lateFee = fees.reduce((sum, fee) => sum + (fee.lateFee || 0), 0);
    const total = subtotal + lateFee;
    const paidAmount = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
    const dueAmount = total - paidAmount;

    const invoiceItems = fees.map(fee => ({
      feeId: fee.id,
      feeName: fee.feeStructure.name,
      type: fee.feeStructure.type,
      amount: fee.amount,
      paidAmount: fee.paidAmount || 0,
      dueAmount: fee.dueAmount || 0,
      month: fee.month,
      year: fee.year,
    }));

    const invoiceNumber = `INV-${year}${String(month).padStart(2, '0')}-${String(fees[0]?.student?.rollNumber || '000').padStart(3, '0')}`;

    return prisma.invoice.create({
      data: {
        schoolId,
        studentId,
        invoiceNumber,
        items: invoiceItems,
        subtotal,
        lateFee,
        discount: 0,
        total,
        paidAmount,
        dueAmount,
        status: dueAmount > 0 ? 'unpaid' : 'paid',
        dueDate: new Date(data.dueDate || new Date()),
        issuedDate: new Date(),
        notes: `Invoice for ${month} ${year}`,
      },
    });
  }

  async generateBulkInvoices(schoolId: string, data: any) {
    const { classId, sectionId, month, year, dueDate } = data;

    const classRecord = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });
    if (!classRecord) throw new Error('Class not found');

    const students = await prisma.student.findMany({
      where: {
        schoolId,
        class: classRecord.name,
        section: sectionId
          ? (await prisma.section.findFirst({ where: { id: sectionId, classId } }))?.name
          : undefined,
        isActive: true,
      },
    });

    const results = [];

    for (const student of students) {
      try {
        const invoice = await this.generateInvoice(student.id, schoolId, {
          month,
          year,
          dueDate,
        });
        results.push(invoice);
      } catch (error) {
        console.error(`Failed to generate invoice for student ${student.id}:`, error);
      }
    }

    return {
      success: true,
      message: `Generated ${results.length} invoices for ${students.length} students`,
      count: results.length,
    };
  }

  async sendInvoice(id: string, schoolId: string) {
    const invoice = await this.getInvoice(id, schoolId);
    // TODO: Implement email/SMS sending logic
    return {
      success: true,
      message: 'Invoice sent successfully',
    };
  }

  // ============ Payments ============

  async getPayments(schoolId: string, filters: any) {
    const { studentId, invoiceId, dateFrom, dateTo, page = 1, limit = 10 } = filters;

    const where: any = { schoolId };
    if (studentId) where.studentId = studentId;
    if (invoiceId) where.invoiceId = invoiceId;
    if (dateFrom) where.paymentDate = { gte: new Date(dateFrom) };
    if (dateTo) where.paymentDate = { ...where.paymentDate, lte: new Date(dateTo) };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              rollNumber: true,
            },
          },
        },
        orderBy: { paymentDate: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async getPayment(id: string, schoolId: string) {
    const payment = await prisma.payment.findFirst({
      where: { id, schoolId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
        invoice: true,
        fee: true,
      },
    });
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  async processPayment(schoolId: string, data: any, receivedBy: string) {
    const { studentId, invoiceId, feeId, amount, method, transactionId, notes } = data;

    // Start transaction
    return prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          schoolId,
          studentId,
          invoiceId,
          feeId,
          amount,
          method,
          transactionId,
          notes,
          receivedBy,
        },
      });

      // Update fee if feeId is provided
      if (feeId) {
        const fee = await tx.fee.findFirst({
          where: { id: feeId, schoolId },
        });
        if (fee) {
          const newPaidAmount = fee.paidAmount + amount;
          const newDueAmount = fee.totalAmount - newPaidAmount;
          const status = newDueAmount <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : 'unpaid';

          await tx.fee.update({
            where: { id: feeId },
            data: {
              paidAmount: newPaidAmount,
              dueAmount: newDueAmount,
              status,
              isPaid: newDueAmount <= 0,
              paidDate: newDueAmount <= 0 ? new Date() : undefined,
              paymentMethod: method,
              transactionId,
            },
          });
        }
      }

      // Update invoice if invoiceId is provided
      if (invoiceId) {
        const invoice = await tx.invoice.findFirst({
          where: { id: invoiceId, schoolId },
        });
        if (invoice) {
          const newPaidAmount = invoice.paidAmount + amount;
          const newDueAmount = invoice.total - newPaidAmount;
          const status = newDueAmount <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : 'unpaid';

          await tx.invoice.update({
            where: { id: invoiceId },
            data: {
              paidAmount: newPaidAmount,
              dueAmount: newDueAmount,
              status,
              paidDate: newDueAmount <= 0 ? new Date() : undefined,
            },
          });
        }
      }

      return payment;
    });
  }

  async updatePayment(id: string, schoolId: string, data: any) {
    const existing = await prisma.payment.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Payment not found');

    return prisma.payment.update({
      where: { id },
      data,
    });
  }

  async deletePayment(id: string, schoolId: string) {
    const existing = await prisma.payment.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Payment not found');

    // TODO: Reverse payment from fee/invoice
    return prisma.payment.delete({ where: { id } });
  }

  // ============ Online Payments ============

  async initiateOnlinePayment(schoolId: string, data: any) {
    const { studentId, amount, invoiceId, gateway } = data;

    // Generate a unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // TODO: Integrate with bKash, Nagad, or SSLCommerz API
    // For now, return a mock payment URL
    return {
      paymentUrl: `https://payment.gateway.com/pay/${transactionId}`,
      transactionId,
    };
  }

  async verifyOnlinePayment(transactionId: string) {
    // TODO: Verify payment with gateway
    return {
      success: true,
      status: 'completed',
      data: {
        transactionId,
        amount: 1000,
        paymentDate: new Date(),
      },
    };
  }

  // ============ Statistics ============

  async getStatistics(schoolId: string, filters: any, user?: { email: string; role: string }) {
    const { month, year } = filters;

    const where: any = await this.buildScopeAwareFeeWhere(schoolId, filters);
    if (user?.role === 'student') {
      const student = await prisma.student.findFirst({
        where: { schoolId, email: user.email },
        select: { id: true },
      });
      where.studentId = student?.id || '__student_not_found__';
    }
    if (month) where.month = month;
    if (year) where.year = parseInt(year);

    const fees = await prisma.fee.findMany({
      where,
    });

    const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalDue = fees.reduce((sum, f) => sum + f.dueAmount, 0);
    const totalOverdue = fees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.dueAmount, 0);
    const totalAmount = fees.reduce((sum, f) => sum + f.totalAmount, 0);

    const byStatus = {
      paid: fees.filter(f => f.status === 'paid').length,
      partial: fees.filter(f => f.status === 'partial').length,
      unpaid: fees.filter(f => f.status === 'unpaid').length,
      overdue: fees.filter(f => f.status === 'overdue').length,
    };

    const byType = await prisma.fee.groupBy({
      by: ['feeStructureId'],
      where,
      _count: true,
      _sum: {
        amount: true,
        paidAmount: true,
      },
    });

    // Get monthly data
    const monthlyData = await prisma.fee.groupBy({
      by: ['month', 'year'],
      where,
      _sum: {
        paidAmount: true,
        dueAmount: true,
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
      ],
    });

    // Get top defaulters
    const topDefaulters = await prisma.fee.groupBy({
      by: ['studentId'],
      where: {
        ...where,
        status: { in: ['unpaid', 'overdue'] },
      },
      _sum: {
        dueAmount: true,
      },
      orderBy: {
        _sum: {
          dueAmount: 'desc',
        },
      },
      take: 10,
    });

    // Get student names for defaulters
    const defaulterStudents = await prisma.student.findMany({
      where: {
        id: { in: topDefaulters.map(d => d.studentId) },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const topDefaultersList = topDefaulters.map(d => ({
      studentId: d.studentId,
      studentName: defaulterStudents.find(s => s.id === d.studentId)?.name || 'Unknown',
      dueAmount: d._sum.dueAmount || 0,
    }));

    return {
      totalCollected,
      totalDue,
      totalOverdue,
      totalAmount,
      collectionRate: totalAmount > 0 ? (totalCollected / totalAmount) * 100 : 0,
      byStatus,
      byType: byType.map(item => ({
        type: item.feeStructureId,
        amount: item._sum.amount || 0,
        count: item._count || 0,
      })),
      monthly: monthlyData.map(item => ({
        month: item.month || 'Unknown',
        collected: item._sum.paidAmount || 0,
        due: item._sum.dueAmount || 0,
      })),
      topDefaulters: topDefaultersList,
    };
  }

  // ============ Export ============

  async exportReport(schoolId: string, filters: any) {
    const { classId, sectionId, month, year, status, format = 'csv' } = filters;

    const where: any = { schoolId };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (month) where.month = month;
    if (year) where.year = parseInt(year);
    if (status) where.status = status;

    const fees = await prisma.fee.findMany({
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
        feeStructure: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const headers = [
      'Student Name',
      'Roll Number',
      'Class',
      'Section',
      'Fee Type',
      'Amount',
      'Paid',
      'Due',
      'Status',
      'Due Date',
    ];

    const rows = fees.map(fee => [
      fee.student.name,
      fee.student.rollNumber,
      fee.class.name,
      fee.section?.name || '',
      fee.feeStructure.name,
      fee.totalAmount,
      fee.paidAmount,
      fee.dueAmount,
      fee.status,
      new Date(fee.dueDate).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  }
}

export default new FeeService();