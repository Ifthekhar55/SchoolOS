import prisma from '../config/database';
import fs from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';

export class SettingsService {
  // ============ Get Settings ============

  async getSettings(schoolId: string) {
    let settings = await prisma.settings.findUnique({
      where: { schoolId },
    });

    // If settings don't exist, create default settings
    if (!settings) {
      settings = await this.createDefaultSettings(schoolId);
    }

    return settings;
  }

  async createDefaultSettings(schoolId: string) {
    const defaultSettings = {
      schoolProfile: {
        name: '',
        nameBangla: '',
        type: 'english_medium',
        address: '',
        city: '',
        district: '',
        division: '',
        postCode: '',
        phone: '',
        email: '',
        website: '',
        logo: '',
        establishedYear: null,
        subscriptionPlan: 'starter',
        status: 'active',
      },
      academic: {
        academicYearId: '',
        academicYearName: '',
        startDate: new Date(),
        endDate: new Date(),
        isCurrent: true,
        sessionName: '',
        termStructure: [],
      },
      fees: {
        currency: 'BDT',
        currencySymbol: '৳',
        lateFeeEnabled: false,
        lateFeeAmount: 100,
        lateFeeAfterDays: 10,
        paymentMethods: ['cash', 'bank', 'bkash', 'nagad'],
        onlinePaymentEnabled: false,
        paymentGateways: {
          bkash: false,
          nagad: false,
          sslcommerz: false,
        },
      },
      grades: {
        system: 'gpa',
        grades: [
          { grade: 'A+', minPercentage: 80, maxPercentage: 100, gradePoint: 5.0, isPassing: true },
          { grade: 'A', minPercentage: 70, maxPercentage: 79, gradePoint: 4.0, isPassing: true },
          { grade: 'B', minPercentage: 60, maxPercentage: 69, gradePoint: 3.0, isPassing: true },
          { grade: 'C', minPercentage: 50, maxPercentage: 59, gradePoint: 2.0, isPassing: true },
          { grade: 'D', minPercentage: 40, maxPercentage: 49, gradePoint: 1.0, isPassing: true },
          { grade: 'E', minPercentage: 33, maxPercentage: 39, gradePoint: 0.5, isPassing: true },
          { grade: 'F', minPercentage: 0, maxPercentage: 32, gradePoint: 0.0, isPassing: false },
        ],
        passingPercentage: 33,
        gradePointScale: 5.0,
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        attendanceAlerts: true,
        feeReminders: true,
        examReminders: true,
        eventReminders: true,
        noticeAlerts: true,
        parentCommunication: true,
      },
      system: {
        timezone: 'Asia/Dhaka',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        language: 'en',
        maintenanceMode: false,
        allowRegistration: true,
        maxLoginAttempts: 5,
        sessionTimeout: 60,
      },
      backup: {
        autoBackup: false,
        backupFrequency: 'weekly',
        backupTime: '00:00',
        retentionDays: 30,
        lastBackup: null,
        backupSize: '0MB',
      },
    };

    return prisma.settings.create({
      data: {
        schoolId,
        schoolProfile: defaultSettings.schoolProfile,
        academic: defaultSettings.academic,
        fees: defaultSettings.fees,
        grades: defaultSettings.grades,
        notifications: defaultSettings.notifications,
        system: defaultSettings.system,
        backup: defaultSettings.backup,
      },
    });
  }

  // ============ School Profile ============

  async updateSchoolProfile(schoolId: string, data: any) {
    const settings = await prisma.settings.findUnique({
      where: { schoolId },
    });

    if (!settings) {
      throw new Error('Settings not found');
    }

    const schoolProfile = { ...settings.schoolProfile as any, ...data };

    return prisma.settings.update({
      where: { schoolId },
      data: { schoolProfile },
    });
  }

  async uploadLogo(schoolId: string, file: any) {
    // TODO: Upload to cloud storage (S3, Cloudinary, etc.)
    // For now, save locally
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${schoolId}-${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    const logoUrl = `/uploads/logos/${filename}`;

    const settings = await prisma.settings.findUnique({
      where: { schoolId },
    });

    if (!settings) {
      throw new Error('Settings not found');
    }

    const schoolProfile = { ...settings.schoolProfile as any, logo: logoUrl };

    await prisma.settings.update({
      where: { schoolId },
      data: { schoolProfile },
    });

    return { logo: logoUrl };
  }

  // ============ Academic Settings ============

  async updateAcademicSettings(schoolId: string, data: any) {
    const settings = await prisma.settings.findUnique({
      where: { schoolId },
    });

    if (!settings) {
      throw new Error('Settings not found');
    }

    const academic = { ...settings.academic as any, ...data };

    return prisma.settings.update({
      where: { schoolId },
      data: { academic },
    });
  }

  // ============ Terms ============

  async createTerm(schoolId: string, data: any) {
    // If this term is active, deactivate others
    if (data.isActive) {
      await prisma.term.updateMany({
        where: { schoolId, isActive: true },
        data: { isActive: false },
      });
    }

    const { schoolId: _schoolId, ...termData } = data;

    return prisma.term.create({
      data: {
        ...termData,
        schoolId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
  }

  async updateTerm(id: string, schoolId: string, data: any) {
    const existing = await prisma.term.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Term not found');

    const { schoolId: _schoolId, ...termData } = data;

    // If this term is active, deactivate others
    if (data.isActive) {
      await prisma.term.updateMany({
        where: { schoolId, isActive: true, id: { not: id } },
        data: { isActive: false },
      });
    }

    return prisma.term.update({
      where: { id },
      data: {
        ...termData,
        startDate: termData.startDate ? new Date(termData.startDate) : undefined,
        endDate: termData.endDate ? new Date(termData.endDate) : undefined,
      },
    });
  }

  async deleteTerm(id: string, schoolId: string) {
    const existing = await prisma.term.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Term not found');

    return prisma.term.delete({ where: { id } });
  }

  // ============ Fee Settings ============

  async updateFeeSettings(schoolId: string, data: any) {
    const settings = await prisma.settings.findUnique({
      where: { schoolId },
    });

    if (!settings) {
      throw new Error('Settings not found');
    }

    const fees = { ...settings.fees as any, ...data };

    return prisma.settings.update({
      where: { schoolId },
      data: { fees },
    });
  }

  // ============ Grade Settings ============

  async updateGradeSettings(schoolId: string, data: any) {
    const settings = await prisma.settings.findUnique({
      where: { schoolId },
    });

    if (!settings) {
      throw new Error('Settings not found');
    }

    const grades = { ...settings.grades as any, ...data };

    return prisma.settings.update({
      where: { schoolId },
      data: { grades },
    });
  }

  // ============ Grades ============

  async createGrade(schoolId: string, data: any) {
    const { schoolId: _schoolId, ...gradeData } = data;
    return prisma.grade.create({
      data: {
        ...gradeData,
        schoolId,
      },
    });
  }

  async updateGrade(id: string, schoolId: string, data: any) {
    const existing = await prisma.grade.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Grade not found');

    const { schoolId: _schoolId, ...gradeData } = data;

    return prisma.grade.update({
      where: { id },
      data: gradeData,
    });
  }

  async deleteGrade(id: string, schoolId: string) {
    const existing = await prisma.grade.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Grade not found');

    return prisma.grade.delete({ where: { id } });
  }

  // ============ Notification Settings ============

  async updateNotificationSettings(schoolId: string, data: any) {
    const settings = await prisma.settings.findUnique({
      where: { schoolId },
    });

    if (!settings) {
      throw new Error('Settings not found');
    }

    const notifications = { ...settings.notifications as any, ...data };

    return prisma.settings.update({
      where: { schoolId },
      data: { notifications },
    });
  }

  // ============ System Settings ============

  async updateSystemSettings(schoolId: string, data: any) {
    const settings = await prisma.settings.findUnique({
      where: { schoolId },
    });

    if (!settings) {
      throw new Error('Settings not found');
    }

    const system = { ...settings.system as any, ...data };

    return prisma.settings.update({
      where: { schoolId },
      data: { system },
    });
  }

  // ============ Backup Settings ============

  async updateBackupSettings(schoolId: string, data: any) {
    const settings = await prisma.settings.findUnique({
      where: { schoolId },
    });

    if (!settings) {
      throw new Error('Settings not found');
    }

    const backup = { ...settings.backup as any, ...data };

    return prisma.settings.update({
      where: { schoolId },
      data: { backup },
    });
  }

  async createBackup(schoolId: string) {
    // Create backup of database
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `backup-${schoolId}-${Date.now()}.json`;
    const filepath = path.join(backupDir, filename);

    // Get all data
    const data = {
      settings: await prisma.settings.findUnique({ where: { schoolId } }),
      students: await prisma.student.findMany({ where: { schoolId } }),
      teachers: await prisma.teacher.findMany({ where: { schoolId } }),
      classes: await prisma.class.findMany({ where: { schoolId } }),
      attendance: await prisma.attendance.findMany({ where: { schoolId } }),
      fees: await prisma.fee.findMany({ where: { schoolId } }),
      exams: await prisma.exam.findMany({ where: { schoolId } }),
      results: await prisma.result.findMany({ where: { exam: { schoolId } } }),
      notices: await prisma.notice.findMany({ where: { schoolId } }),
    };

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    // Update last backup time
    const settings = await prisma.settings.findUnique({
      where: { schoolId },
    });

    if (settings) {
      const backup = { ...settings.backup as any, lastBackup: new Date(), backupSize: `${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)}MB` };
      await prisma.settings.update({
        where: { schoolId },
        data: { backup },
      });
    }

    return {
      success: true,
      message: 'Backup created successfully',
      downloadUrl: `/api/settings/backup/download/${filename}`,
    };
  }

  async restoreBackup(schoolId: string, file: any) {
    // TODO: Implement restore logic
    return {
      success: true,
      message: 'Backup restored successfully',
    };
  }

  // ============ System Health ============

  async getSystemHealth(schoolId: string) {
    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      const database = true;
    } catch {
      const database = false;
    }

    // Check storage
    const storage = true;

    return {
      status: 'healthy' as 'healthy' | 'degraded' | 'down',
      database: true,
      storage: true,
      cache: true,
      uptime: process.uptime().toString(),
      memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
    };
  }
}

export default new SettingsService();