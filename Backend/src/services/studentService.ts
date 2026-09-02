import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class StudentService {
  async getStudents(schoolId: string, filters: any, user?: { email: string; role: string }) {
    const { search, class: className, section, gender, isActive, page = 1, limit = 10 } = filters;
    
    const where: any = { schoolId };

    if (user?.role === 'student') {
      where.email = user.email;
    }
    
    if (className) where.class = className;
    if (section) where.section = section;
    if (gender) where.gender = gender;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameBangla: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { fatherName: { contains: search, mode: 'insensitive' } },
        { motherName: { contains: search, mode: 'insensitive' } },
        { rollNumber: !isNaN(Number(search)) ? Number(search) : undefined },
      ].filter(condition => condition !== undefined);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getStudent(id: string, schoolId: string) {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
    });
    if (!student) throw new Error('Student not found');
    return student;
  }

  async createStudent(data: any) {
    const normalizedEmail = data.email?.trim().toLowerCase();
    const shouldCreateUser = Boolean(data.createUserAccount && normalizedEmail && data.userPassword);

    return prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          schoolId: data.schoolId,
          name: data.name,
          nameBangla: data.nameBangla || undefined,
          email: normalizedEmail || undefined,
          phone: data.phone || undefined,
          fatherName: data.fatherName,
          fatherPhone: data.fatherPhone || undefined,
          fatherOccupation: data.fatherOccupation || undefined,
          motherName: data.motherName,
          motherPhone: data.motherPhone || undefined,
          motherOccupation: data.motherOccupation || undefined,
          guardianName: data.guardianName || undefined,
          guardianPhone: data.guardianPhone || undefined,
          guardianRelation: data.guardianRelation || undefined,
          class: data.class,
          section: data.section || undefined,
          rollNumber: Number(data.rollNumber),
          admissionDate: new Date(data.admissionDate),
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
          gender: data.gender,
          bloodGroup: data.bloodGroup || undefined,
          religion: data.religion || undefined,
          nationality: data.nationality || undefined,
          address: data.address,
          addressBangla: data.addressBangla || undefined,
          emergencyContact: data.emergencyContact,
          medicalInfo: data.medicalInfo || undefined,
          photo: data.photo || undefined,
          isActive: data.isActive ?? true,
          isVerified: true,
          createdBy: data.createdBy || undefined,
        },
      });

      if (shouldCreateUser) {
        const existingUser = await tx.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(data.userPassword, 10);

        await tx.user.create({
          data: {
            name: data.name,
            nameBangla: data.nameBangla || undefined,
            email: normalizedEmail,
            phone: data.phone || data.fatherPhone || data.emergencyContact || 'N/A',
            password: hashedPassword,
            role: 'student',
            schoolId: data.schoolId,
            address: data.address || undefined,
            dateOfBirth: data.birthDate ? new Date(data.birthDate) : undefined,
            gender: data.gender,
            bloodGroup: data.bloodGroup || undefined,
            isActive: true,
            isVerified: true,
            createdBy: data.createdBy || undefined,
          },
        });
      }

      return student;
    });
  }

  async updateStudent(id: string, schoolId: string, data: any) {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
    });
    if (!student) throw new Error('Student not found');

    const {
      id: _ignoredId,
      schoolId: _ignoredSchoolId,
      createdAt,
      updatedAt,
      isVerified,
      parentId,
      ...safeData
    } = data || {};

    const normalizedRollNumber = safeData.rollNumber !== undefined && safeData.rollNumber !== null
      ? Number(safeData.rollNumber)
      : undefined;

    const normalizedData = {
      ...safeData,
      ...(normalizedRollNumber !== undefined ? { rollNumber: normalizedRollNumber } : {}),
      ...(safeData.isActive !== undefined ? { isActive: Boolean(safeData.isActive) } : {}),
      ...(safeData.admissionDate ? { admissionDate: new Date(safeData.admissionDate) } : {}),
      ...(safeData.birthDate ? { birthDate: new Date(safeData.birthDate) } : {}),
    };

    return prisma.student.update({
      where: { id },
      data: normalizedData,
    });
  }

  async deleteStudent(id: string, schoolId: string) {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
    });
    if (!student) throw new Error('Student not found');

    return prisma.student.delete({ where: { id } });
  }

  async activateStudent(id: string, schoolId: string) {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
    });
    if (!student) throw new Error('Student not found');

    return prisma.student.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivateStudent(id: string, schoolId: string) {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
    });
    if (!student) throw new Error('Student not found');

    return prisma.student.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async importStudents(schoolId: string, studentsData: any[]) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
      imported: [] as any[],
    };

    for (let i = 0; i < studentsData.length; i++) {
      try {
        const student = await prisma.student.create({
          data: {
            ...studentsData[i],
            schoolId,
            rollNumber: Number(studentsData[i].rollNumber),
            admissionDate: new Date(studentsData[i].admissionDate || new Date()),
            birthDate: studentsData[i].birthDate ? new Date(studentsData[i].birthDate) : undefined,
          },
        });
        results.success++;
        results.imported.push(student);
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message,
          data: studentsData[i],
        });
      }
    }

    return results;
  }

  async bulkDelete(schoolId: string, ids: string[]) {
    const result = await prisma.student.deleteMany({
      where: {
        id: { in: ids },
        schoolId,
      },
    });
    return { deleted: result.count };
  }

  async getStatistics(schoolId: string) {
    const [total, active, inactive, byClass, byGender] = await Promise.all([
      prisma.student.count({ where: { schoolId } }),
      prisma.student.count({ where: { schoolId, isActive: true } }),
      prisma.student.count({ where: { schoolId, isActive: false } }),
      prisma.student.groupBy({
        by: ['class'],
        where: { schoolId },
        _count: true,
      }),
      prisma.student.groupBy({
        by: ['gender'],
        where: { schoolId },
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      inactive,
      byClass: byClass.map(item => ({
        class: item.class,
        count: item._count,
      })),
      byGender: byGender.map(item => ({
        gender: item.gender,
        count: item._count,
      })),
    };
  }

  async getStudentsByClass(schoolId: string, classId: string) {
    return prisma.student.findMany({
      where: {
        schoolId,
        class: classId,
        isActive: true,
      },
      orderBy: { rollNumber: 'asc' },
    });
  }

  async getStudentLoginAccount(schoolId: string, studentId: string) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      select: { id: true, email: true },
    });

    if (!student) throw new Error('Student not found');

    const user = await prisma.user.findFirst({
      where: {
        schoolId,
        email: student.email || '',
        role: 'student',
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      exists: Boolean(user),
      email: user?.email || student.email || null,
      userId: user?.id || null,
      isActive: user?.isActive ?? false,
      isVerified: user?.isVerified ?? false,
      createdAt: user?.createdAt || null,
      updatedAt: user?.updatedAt || null,
    };
  }

  async resetStudentPassword(schoolId: string, studentId: string, password?: string) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      select: { id: true, email: true, name: true },
    });

    if (!student) throw new Error('Student not found');

    if (!student.email) {
      throw new Error('Student email is required to create a login account');
    }

    const user = await prisma.user.findFirst({
      where: {
        schoolId,
        email: student.email,
        role: 'student',
      },
    });

    if (!user) {
      throw new Error('No student login account found');
    }

    const newPassword = password || `${student.name.replace(/\s+/g, '').toLowerCase()}@${Math.random().toString(36).slice(-6)}`;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      email: user.email,
      tempPassword: newPassword,
      message: 'Student password reset successfully',
    };
  }
}

export default new StudentService();