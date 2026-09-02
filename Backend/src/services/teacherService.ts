import prisma from '../config/database';
import bcrypt from 'bcryptjs';

export class TeacherService {
  async getMyClasses(userId: string, schoolId: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { userId, schoolId },
      select: { id: true, userId: true },
    });

    if (!teacher) return [];

    return this.getTeacherClasses(schoolId, teacher.id, teacher.userId);
  }

  async getTeacherClasses(schoolId: string, teacherId: string, userId?: string | null) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, schoolId },
      select: { id: true, userId: true },
    });

    if (!teacher) return [];

    const effectiveUserId = userId || teacher.userId;

    const classes = await prisma.class.findMany({
      where: {
        schoolId,
        isActive: true,
        OR: [
          { teacherId: teacher.id },
          ...(effectiveUserId ? [
            { sections: { some: { teacherId: effectiveUserId, isActive: true } } },
            { classSubjects: { some: { teacherId: effectiveUserId } } },
          ] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        nameBangla: true,
        sections: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            nameBangla: true,
            currentStudents: true,
            teacherId: true,
            roomNumber: true,
          },
          orderBy: { name: 'asc' },
        },
        classSubjects: {
          where: { subject: { isActive: true } },
          select: {
            sectionId: true,
            subject: {
              select: { id: true, name: true, nameBangla: true, code: true },
            },
          },
          orderBy: { subject: { name: 'asc' } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return Promise.all(classes.map(async (classItem) => ({
      ...classItem,
      sections: await Promise.all(classItem.sections.map(async (section) => ({
        ...section,
        currentStudents: await prisma.student.count({
          where: {
            schoolId,
            class: classItem.name,
            section: section.name,
            isActive: true,
          },
        }),
      }))),
    })));
  }

  async getTeachers(schoolId: string, filters: any) {
    const { 
      search, 
      department, 
      designation, 
      gender, 
      isActive, 
      page = 1, 
      limit = 10 
    } = filters;
    
    const where: any = { schoolId };
    
    if (department) where.department = department;
    if (designation) where.designation = designation;
    if (gender) where.gender = gender;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameBangla: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
      ].filter(condition => condition !== undefined);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacher.count({ where }),
    ]);

    return {
      teachers,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getTeacher(id: string, schoolId: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId },
    });
    if (!teacher) throw new Error('Teacher not found');
    return teacher;
  }

  async createTeacher(data: any) {
    const { createUserAccount, password, ...teacherData } = data;
    const normalizedEmail = String(teacherData.email || '').trim().toLowerCase();
    
    // Start a transaction
    return prisma.$transaction(async (tx) => {
      const existingTeacher = await tx.teacher.findFirst({
        where: {
          OR: [
            { email: normalizedEmail },
            { employeeId: String(teacherData.employeeId).trim() },
          ],
        },
        select: { email: true, employeeId: true },
      });

      if (existingTeacher) {
        if (existingTeacher.email === normalizedEmail) {
          throw new Error('A teacher with this email already exists');
        }
        throw new Error('A teacher with this employee ID already exists');
      }

      if (createUserAccount) {
        const existingUser = await tx.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true },
        });
        if (existingUser) {
          throw new Error('A user account with this email already exists');
        }
      }

      // Create the teacher
      const teacher = await tx.teacher.create({
        data: {
          schoolId: teacherData.schoolId,
          name: teacherData.name,
          nameBangla: teacherData.nameBangla || undefined,
          email: normalizedEmail,
          phone: teacherData.phone,
          employeeId: String(teacherData.employeeId).trim(),
          designation: teacherData.designation,
          department: teacherData.department,
          qualification: teacherData.qualification,
          experience: teacherData.experience || undefined,
          specialization: teacherData.specialization || undefined,
          joiningDate: new Date(teacherData.joiningDate),
          birthDate: teacherData.birthDate ? new Date(teacherData.birthDate) : undefined,
          gender: teacherData.gender,
          bloodGroup: teacherData.bloodGroup || undefined,
          religion: teacherData.religion || undefined,
          nationality: teacherData.nationality || undefined,
          address: teacherData.address,
          addressBangla: teacherData.addressBangla || undefined,
          emergencyContact: teacherData.emergencyContact,
          photo: teacherData.photo || undefined,
          isActive: teacherData.isActive ?? true,
          isVerified: true,
          createdBy: teacherData.createdBy || undefined,
        },
      });

      // If user account should be created
      if (createUserAccount) {
        const hashedPassword = await bcrypt.hash(password || 'password123', 10);
        
        const user = await tx.user.create({
          data: {
            name: teacherData.name,
            nameBangla: teacherData.nameBangla,
            email: normalizedEmail,
            phone: teacherData.phone,
            password: hashedPassword,
            role: 'teacher',
            schoolId: teacherData.schoolId,
            isActive: true,
            isVerified: true,
          },
        });

        // Link the teacher to the user
        await tx.teacher.update({
          where: { id: teacher.id },
          data: { userId: user.id },
        });
      }

      return teacher;
    });
  }

  async updateTeacher(id: string, schoolId: string, data: any) {
    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId },
    });
    if (!teacher) throw new Error('Teacher not found');

    const {
      id: _id,
      schoolId: _schoolId,
      userId,
      createdAt,
      updatedAt,
      createdBy,
      createUserAccount,
      password,
      ...safeData
    } = data;

    return prisma.teacher.update({
      where: { id },
      data: {
        ...safeData,
        joiningDate: safeData.joiningDate ? new Date(safeData.joiningDate) : undefined,
        birthDate: safeData.birthDate ? new Date(safeData.birthDate) : undefined,
      },
    });
  }

  async deleteTeacher(id: string, schoolId: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId },
    });
    if (!teacher) throw new Error('Teacher not found');

    return prisma.teacher.delete({ where: { id } });
  }

  async activateTeacher(id: string, schoolId: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId },
    });
    if (!teacher) throw new Error('Teacher not found');

    return prisma.teacher.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivateTeacher(id: string, schoolId: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id, schoolId },
    });
    if (!teacher) throw new Error('Teacher not found');

    return prisma.teacher.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async importTeachers(schoolId: string, teachersData: any[]) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
      imported: [] as any[],
    };

    for (let i = 0; i < teachersData.length; i++) {
      try {
        const teacher = await prisma.teacher.create({
          data: {
            ...teachersData[i],
            schoolId,
            joiningDate: new Date(teachersData[i].joiningDate || new Date()),
            birthDate: teachersData[i].birthDate ? new Date(teachersData[i].birthDate) : undefined,
          },
        });
        results.success++;
        results.imported.push(teacher);
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message,
          data: teachersData[i],
        });
      }
    }

    return results;
  }

  async bulkDelete(schoolId: string, ids: string[]) {
    const result = await prisma.teacher.deleteMany({
      where: {
        id: { in: ids },
        schoolId,
      },
    });
    return { deleted: result.count };
  }

  async getStatistics(schoolId: string) {
    const [total, active, inactive, byDepartment, byDesignation, byGender] = await Promise.all([
      prisma.teacher.count({ where: { schoolId } }),
      prisma.teacher.count({ where: { schoolId, isActive: true } }),
      prisma.teacher.count({ where: { schoolId, isActive: false } }),
      prisma.teacher.groupBy({
        by: ['department'],
        where: { schoolId },
        _count: true,
      }),
      prisma.teacher.groupBy({
        by: ['designation'],
        where: { schoolId },
        _count: true,
      }),
      prisma.teacher.groupBy({
        by: ['gender'],
        where: { schoolId },
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      inactive,
      byDepartment: byDepartment.map(item => ({
        department: item.department,
        count: item._count,
      })),
      byDesignation: byDesignation.map(item => ({
        designation: item.designation,
        count: item._count,
      })),
      byGender: byGender.map(item => ({
        gender: item.gender,
        count: item._count,
      })),
    };
  }

  async getTeachersByDepartment(schoolId: string, department: string) {
    return prisma.teacher.findMany({
      where: {
        schoolId,
        department,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getAvailableTeachers(schoolId: string) {
    return prisma.teacher.findMany({
      where: {
        schoolId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        userId: true,
        name: true,
        nameBangla: true,
        designation: true,
        department: true,
        email: true,
        phone: true,
      },
    });
  }
}

export default new TeacherService();