import { Request, Response } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';

export class SchoolController {
  // Get all schools (for super admin)
  async getSchools(req: Request, res: Response) {
    try {
      const { user } = req;
      
      // If super admin, get all schools
      // If school admin, get only their school
      let where = {};
      
      if (user?.role === 'super_admin') {
        // Super admin sees all schools
        where = {};
      } else if (user?.schoolId) {
        // Other users see only their school
        where = { id: user.schoolId };
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const schools = await prisma.school.findMany({
        where,
        include: {
          _count: {
            select: { users: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        schools: schools.map(school => ({
          ...school,
          userCount: school._count.users,
        })),
      });
    } catch (error) {
      console.error('Get schools error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch schools',
      });
    }
  }

  // Get a single school
  async getSchool(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user } = req;

      if (user?.role !== 'super_admin' && user?.schoolId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const school = await prisma.school.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              phone: true,
              isActive: true,
            },
          },
          academicYears: {
            include: {
              classes: {
                include: {
                  sections: true,
                  classSubjects: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
            },
          },
          settings: true,
          classes: {
            include: {
              sections: true,
              classSubjects: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      });

      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'School not found',
        });
      }

      return res.status(200).json({
        success: true,
        school,
      });
    } catch (error) {
      console.error('Get school error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch school',
      });
    }
  }

  // Create a new school (for super admin or registration)
  async createSchool(req: Request, res: Response) {
    try {
      const { user } = req;
      const body = req.body;
      const {
        name,
        nameBangla,
        type,
        address,
        city,
        district,
        division,
        postCode,
        phone,
        email,
        website,
        establishedYear,
        subscriptionPlan,
      } = body;
      const schoolName = name || body.schoolName;
      const schoolType = type || body.schoolType;
      const schoolEmail = (email || body.schoolEmail || body.adminEmail || '').trim().toLowerCase();
      const schoolPhone = (phone || body.adminPhone || '').trim();
      const adminEmail = String(body.adminEmail || schoolEmail || '').trim().toLowerCase();
      const adminName = String(body.adminName || '').trim();
      const adminPhone = String(body.adminPhone || schoolPhone || '').trim();
      const adminPassword = String(body.adminPassword || '');

      // Check if user has permission
      if (user?.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admin can create schools',
        });
      }

      if (!schoolName || !schoolEmail || !schoolPhone) {
        return res.status(400).json({
          success: false,
          message: 'School name, email, and phone are required',
        });
      }

      // Check if school already exists
      const existingSchool = await prisma.school.findFirst({
        where: { 
          OR: [
            { name: schoolName },
            { email: schoolEmail }
          ]
        },
      });

      if (existingSchool) {
        return res.status(409).json({
          success: false,
          message: 'School with this name or email already exists',
        });
      }

      const hasAdminPayload = Boolean(adminName || adminEmail || adminPassword || adminPhone);
      if (hasAdminPayload && (!adminName || !adminEmail || !adminPassword || !adminPhone)) {
        return res.status(400).json({
          success: false,
          message: 'School admin name, email, phone, and password are required together',
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const school = await tx.school.create({
          data: {
            name: schoolName,
            nameBangla: nameBangla || body.schoolNameBangla || undefined,
            type: schoolType || 'english_medium',
            address: address || '',
            city: city || '',
            district: district || '',
            division: division || '',
            postCode: postCode || undefined,
            phone: schoolPhone,
            email: schoolEmail,
            website: website || undefined,
            establishedYear: establishedYear ? parseInt(establishedYear) : body.establishedYear || undefined,
            subscriptionPlan: subscriptionPlan || 'starter',
            status: 'active',
          },
        });

        const adminUser = hasAdminPayload
          ? await tx.user.create({
              data: {
                name: adminName,
                email: adminEmail,
                phone: adminPhone,
                password: await bcrypt.hash(adminPassword, 10),
                role: 'school_admin',
                schoolId: school.id,
                isActive: true,
                isVerified: true,
              },
            })
          : null;

        const defaultSettings = {
          schoolProfile: {
            name: school.name,
            nameBangla: school.nameBangla || '',
            type: school.type,
            address: school.address || '',
            city: school.city || '',
            district: school.district || '',
            division: school.division || '',
            postCode: school.postCode || '',
            phone: school.phone,
            email: school.email,
            website: school.website || '',
            logo: '',
            establishedYear: school.establishedYear || null,
            subscriptionPlan: school.subscriptionPlan,
            status: school.status,
          },
          academic: {
            academicYearId: '',
            academicYearName: '',
            startDate: body.academicYearStart || new Date().toISOString(),
            endDate: body.academicYearEnd || new Date(Date.now() + 31536000000).toISOString(),
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

        const academicStart = body.academicYearStart ? new Date(body.academicYearStart) : new Date();
        const academicEnd = body.academicYearEnd ? new Date(body.academicYearEnd) : new Date(Date.now() + 31536000000);
        const academicYearName = body.academicYearName || `Academic Year ${academicStart.getFullYear()}-${academicEnd.getFullYear()}`;

        const academicYear = await tx.academicYear.create({
          data: {
            schoolId: school.id,
            name: academicYearName,
            startDate: academicStart,
            endDate: academicEnd,
            isActive: true,
            isCurrent: true,
          },
        });

        const classesData = Array.isArray(body.classes) ? body.classes : [];

        for (let index = 0; index < classesData.length; index++) {
          const classItem = classesData[index];
          const className = classItem?.name || `Class ${index + 1}`;
          const classCode = `CLS-${school.id.slice(0, 8)}-${String(index + 1).padStart(2, '0')}`;

          const createdClass = await tx.class.create({
            data: {
              schoolId: school.id,
              academicYearId: academicYear.id,
              name: className,
              nameBangla: classItem?.nameBangla || undefined,
              code: classCode,
              capacity: Number(classItem?.capacity) || 40,
              currentStudents: 0,
              isActive: true,
              createdBy: user?.userId,
            },
          });

          const sections = Array.isArray(classItem?.sections) && classItem.sections.length > 0
            ? classItem.sections
            : ['A'];

          for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
            const sectionName = sections[sectionIndex] || `A`;
            await tx.section.create({
              data: {
                classId: createdClass.id,
                name: String(sectionName),
                code: `${createdClass.code}-${String(sectionName)}`,
                capacity: 40,
                currentStudents: 0,
                isActive: true,
              },
            });
          }

          const subjects = Array.isArray(classItem?.subjects) && classItem.subjects.length > 0
            ? classItem.subjects
            : ['Bangla', 'English', 'Math'];

          for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex++) {
            const subjectName = String(subjects[subjectIndex] || '').trim();
            if (!subjectName) continue;

            const subjectCode = `${createdClass.code}-${String(subjectIndex + 1).padStart(2, '0')}`;

            await tx.subject.create({
              data: {
                schoolId: school.id,
                classId: createdClass.id,
                name: subjectName,
                code: subjectCode,
                description: `${subjectName} for ${className}`,
                isCompulsory: true,
                isActive: true,
              },
            });
          }
        }

        await tx.settings.create({
          data: {
            schoolId: school.id,
            schoolProfile: defaultSettings.schoolProfile,
            academic: {
              ...defaultSettings.academic,
              academicYearId: academicYear.id,
              academicYearName: academicYear.name,
              startDate: academicStart.toISOString(),
              endDate: academicEnd.toISOString(),
            },
            fees: defaultSettings.fees,
            grades: defaultSettings.grades,
            notifications: defaultSettings.notifications,
            system: defaultSettings.system,
            backup: defaultSettings.backup,
          },
        });

        await tx.feeStructure.createMany({
          data: [
            { schoolId: school.id, name: 'Admission Fee', type: 'admission', amount: 2500, frequency: 'one_time', dueDay: 10, lateFee: 0, lateFeeAfterDays: 10, isRecurring: false, isActive: true },
            { schoolId: school.id, name: 'Tuition Fee', type: 'tuition', amount: 2500, frequency: 'monthly', dueDay: 10, lateFee: 100, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
            { schoolId: school.id, name: 'Exam Fee', type: 'exam', amount: 1200, frequency: 'half_yearly', dueDay: 10, lateFee: 50, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
            { schoolId: school.id, name: 'Transport Fee', type: 'transport', amount: 1800, frequency: 'monthly', dueDay: 10, lateFee: 80, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
            { schoolId: school.id, name: 'Library Fee', type: 'library', amount: 500, frequency: 'monthly', dueDay: 10, lateFee: 25, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
            { schoolId: school.id, name: 'Lab Fee', type: 'lab', amount: 800, frequency: 'monthly', dueDay: 10, lateFee: 40, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
            { schoolId: school.id, name: 'Sports Fee', type: 'sports', amount: 600, frequency: 'monthly', dueDay: 10, lateFee: 30, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
            { schoolId: school.id, name: 'Development Fee', type: 'development', amount: 1000, frequency: 'yearly', dueDay: 10, lateFee: 50, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
            { schoolId: school.id, name: 'Other Fees', type: 'other', amount: 300, frequency: 'monthly', dueDay: 10, lateFee: 20, lateFeeAfterDays: 10, isRecurring: true, isActive: true },
          ],
          skipDuplicates: true,
        });

        return { school, adminUser, academicYear };
      });

      return res.status(201).json({
        success: true,
        message: 'School created successfully',
        ...result,
      });
    } catch (error: any) {
      console.error('Create school error:', error);
      return res.status(error?.code === 'P2002' ? 409 : 500).json({
        success: false,
        message: error?.code === 'P2002'
          ? 'A school or account with this email already exists'
          : 'Failed to create school',
      });
    }
  }

  // Update a school
  async updateSchool(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user } = req;
      const {
        name,
        nameBangla,
        type,
        address,
        city,
        district,
        division,
        postCode,
        phone,
        email,
        website,
        establishedYear,
        subscriptionPlan,
        status,
      } = req.body;

      // Check access
      if (user?.role !== 'super_admin' && user?.schoolId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const school = await prisma.school.findUnique({
        where: { id },
      });

      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'School not found',
        });
      }

      const updatedSchool = await prisma.school.update({
        where: { id },
        data: {
          name,
          nameBangla,
          type,
          address,
          city,
          district,
          division,
          postCode,
          phone,
          email,
          website,
          establishedYear: establishedYear ? parseInt(establishedYear) : undefined,
          subscriptionPlan,
          status,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'School updated successfully',
        school: updatedSchool,
      });
    } catch (error) {
      console.error('Update school error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update school',
      });
    }
  }

  // Delete a school (super admin only)
  async deleteSchool(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user } = req;

      if (user?.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admin can delete schools',
        });
      }

      const school = await prisma.school.findUnique({
        where: { id },
      });

      if (!school) {
        return res.status(404).json({
          success: false,
          message: 'School not found',
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.message.deleteMany({ where: { schoolId: id } });
        await tx.payment.deleteMany({ where: { schoolId: id } });
        await tx.invoice.deleteMany({ where: { schoolId: id } });
        await tx.fee.deleteMany({ where: { schoolId: id } });
        await tx.feeStructure.deleteMany({ where: { schoolId: id } });
        await tx.notice.deleteMany({ where: { schoolId: id } });
        await tx.report.deleteMany({ where: { schoolId: id } });
        await tx.calendarEvent.deleteMany({ where: { schoolId: id } });
        await tx.holiday.deleteMany({ where: { schoolId: id } });
        await tx.gradeSystem.deleteMany({ where: { schoolId: id } });
        await tx.grade.deleteMany({ where: { schoolId: id } });
        await tx.term.deleteMany({ where: { schoolId: id } });
        await tx.settings.deleteMany({ where: { schoolId: id } });
        await tx.exam.deleteMany({ where: { schoolId: id } });
        await tx.attendance.deleteMany({ where: { schoolId: id } });

        await tx.classSubject.deleteMany({
          where: { class: { schoolId: id } },
        });
        await tx.section.deleteMany({
          where: { class: { schoolId: id } },
        });
        await tx.subject.deleteMany({ where: { schoolId: id } });
        await tx.class.deleteMany({ where: { schoolId: id } });
        await tx.academicYear.deleteMany({ where: { schoolId: id } });

        await tx.parent.deleteMany({ where: { schoolId: id } });
        await tx.student.deleteMany({ where: { schoolId: id } });
        await tx.teacher.deleteMany({ where: { schoolId: id } });
        await tx.user.deleteMany({ where: { schoolId: id } });

        await tx.school.delete({ where: { id } });
      });

      return res.status(200).json({
        success: true,
        message: 'School deleted successfully',
      });
    } catch (error) {
      console.error('Delete school error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete school',
      });
    }
  }
}

export default new SchoolController();