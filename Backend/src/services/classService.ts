import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class ClassService {
  // ============ Academic Years ============
  
  async getAcademicYears(schoolId: string) {
    return prisma.academicYear.findMany({
      where: { schoolId },
      orderBy: { startDate: 'desc' },
    });
  }

  async createAcademicYear(schoolId: string, data: any) {
    // If this is set as current, unset other current years
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return prisma.academicYear.create({
      data: {
        ...data,
        schoolId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
  }

  async updateAcademicYear(id: string, schoolId: string, data: any) {
    const existing = await prisma.academicYear.findFirst({ where: { id, schoolId } });
    if (!existing) throw new Error('Academic year not found');

    // If this is set as current, unset other current years
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { schoolId, isCurrent: true, id: { not: id } },
        data: { isCurrent: false },
      });
    }

    const { schoolId: _schoolId, ...academicYearData } = data;

    return prisma.academicYear.update({
      where: { id },
      data: {
        ...academicYearData,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async setCurrentAcademicYear(id: string, schoolId: string) {
    const existing = await prisma.academicYear.findFirst({ where: { id, schoolId } });
    if (!existing) throw new Error('Academic year not found');

    await prisma.academicYear.updateMany({
      where: { schoolId, isCurrent: true },
      data: { isCurrent: false },
    });

    return prisma.academicYear.update({
      where: { id },
      data: { isCurrent: true },
    });
  }

  // ============ Classes ============

  async getClasses(schoolId: string, filters: any, user?: { userId: string; email: string; role: string }) {
    const { 
      search, 
      academicYearId, 
      teacherId, 
      isActive, 
      page = 1, 
      limit = 10 
    } = filters;
    
    const where: any = { schoolId };

    let studentAssignment: { className: string; sectionName: string | null } | undefined;
    if (user?.role === 'student') {
      const student = await prisma.student.findFirst({
        where: {
          schoolId,
          email: user.email,
        },
        select: { class: true, section: true },
      });

      if (!student) {
        return {
          classes: [],
          total: 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: 0,
        };
      }

      studentAssignment = { className: student.class, sectionName: student.section };
      where.name = { equals: student.class, mode: 'insensitive' };
    }
    
    if (academicYearId) where.academicYearId = academicYearId;
    if (teacherId) where.teacherId = teacherId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameBangla: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [classes, total, liveStudentCounts] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take,
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          sections: {
            where: studentAssignment?.sectionName
              ? { isActive: true, name: { equals: studentAssignment.sectionName, mode: 'insensitive' } }
              : { isActive: true },
          },
          classSubjects: {
            include: {
              subject: true,
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.class.count({ where }),
      prisma.student.groupBy({
        by: ['class'],
        where: {
          schoolId,
          isActive: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const studentCountsByClass = new Map<string, number>();
    liveStudentCounts.forEach(item => {
      studentCountsByClass.set(item.class, item._count.id);
    });

    const classesWithCount = classes.map(cls => ({
      ...cls,
      teacherName: cls.teacher?.name || '',
      currentStudents: studentCountsByClass.get(cls.name) || 0,
    }));

    return {
      classes: classesWithCount,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getClass(id: string, schoolId: string) {
    const classData = await prisma.class.findFirst({
      where: { id, schoolId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        sections: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        classSubjects: {
          include: {
            subject: true,
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        academicYear: true,
      },
    });
    
    if (!classData) throw new Error('Class not found');

    const liveClassStudentCount = await prisma.student.count({
      where: {
        schoolId,
        class: classData.name,
        isActive: true,
      },
    });
    
    return {
      ...classData,
      teacherName: classData.teacher?.name || '',
      currentStudents: liveClassStudentCount,
    };
  }

  async createClass(schoolId: string, data: any) {
    const { sections, subjects, ...classData } = data;

    const academicYear = await prisma.academicYear.findFirst({
      where: { id: data.academicYearId, schoolId },
      select: { id: true },
    });
    if (!academicYear) throw new Error('Academic year not found in this school');

    if (classData.teacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: { id: classData.teacherId, schoolId },
        select: { id: true },
      });
      if (!teacher) throw new Error('Teacher not found in this school');
    }

    if (subjects?.length) {
      const subjectCount = await prisma.subject.count({
        where: { id: { in: subjects }, schoolId },
      });
      if (subjectCount !== subjects.length) throw new Error('Subject not found in this school');
    }

    const newClass = await prisma.$transaction(async (tx) => {
      // Create the class
      const newClass = await tx.class.create({
        data: {
          ...classData,
          schoolId,
          teacherId: classData.teacherId || undefined,
          academicYearId: data.academicYearId,
        },
      });

      // Create sections if provided
      if (sections && sections.length > 0) {
        await tx.section.createMany({
          data: sections.map((section: any) => ({
            ...section,
            classId: newClass.id,
          })),
        });
      }

      // Assign subjects if provided
      if (subjects && subjects.length > 0) {
        await tx.classSubject.createMany({
          data: subjects.map((subjectId: string) => ({
            classId: newClass.id,
            subjectId,
            isCompulsory: true,
          })),
        });
      }

      return newClass;
    });

    return this.getClass(newClass.id, schoolId);
  }

  async updateClass(id: string, schoolId: string, data: any) {
    const existing = await prisma.class.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Class not found');

    if (data.academicYearId) {
      const academicYear = await prisma.academicYear.findFirst({
        where: { id: data.academicYearId, schoolId },
        select: { id: true },
      });
      if (!academicYear) throw new Error('Academic year not found in this school');
    }
    if (data.teacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: { id: data.teacherId, schoolId },
        select: { id: true },
      });
      if (!teacher) throw new Error('Teacher not found in this school');
    }

    const { schoolId: _schoolId, sections: _sections, classSubjects: _classSubjects, ...classData } = data;

    return prisma.class.update({
      where: { id },
      data: {
        ...classData,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sections: true,
        classSubjects: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  async deleteClass(id: string, schoolId: string) {
    const existing = await prisma.class.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Class not found');

    // Delete related sections and class subjects first
    await prisma.$transaction([
      prisma.section.deleteMany({ where: { classId: id } }),
      prisma.classSubject.deleteMany({ where: { classId: id } }),
      prisma.class.delete({ where: { id } }),
    ]);

    return { success: true };
  }

  async activateClass(id: string, schoolId: string) {
    const existing = await prisma.class.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Class not found');

    return prisma.class.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivateClass(id: string, schoolId: string) {
    const existing = await prisma.class.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Class not found');

    return prisma.class.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getClassStatistics(schoolId: string) {
    const [total, active, inactive, totalSections, liveClassCounts, byClass] = await Promise.all([
      prisma.class.count({ where: { schoolId } }),
      prisma.class.count({ where: { schoolId, isActive: true } }),
      prisma.class.count({ where: { schoolId, isActive: false } }),
      prisma.section.count({ where: { class: { schoolId } } }),
      prisma.student.groupBy({
        by: ['class'],
        where: {
          schoolId,
          isActive: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.class.findMany({
        where: { schoolId, isActive: true },
        select: {
          name: true,
          _count: {
            select: { sections: true },
          },
        },
      }),
    ]);

    const totalStudents = liveClassCounts.reduce((sum, item) => sum + item._count.id, 0);

    return {
      total,
      active,
      inactive,
      totalStudents,
      totalSections,
      averageClassSize: totalSections > 0 ? Math.round(totalStudents / totalSections) : 0,
      byClass: byClass.map(cls => ({
        className: cls.name,
        count: cls._count.sections,
      })),
    };
  }

  // ============ Sections ============

  async getSections(classId: string, schoolId: string, user?: { userId: string; email: string; role: string }) {
    let studentSectionName: string | null | undefined;
    if (user?.role === 'student') {
      const student = await prisma.student.findFirst({
        where: { schoolId, email: user.email },
        select: { class: true, section: true },
      });

      if (!student) {
        return { sections: [], total: 0 };
      }

      const classRecord = await prisma.class.findFirst({
        where: { id: classId, schoolId, name: { equals: student.class, mode: 'insensitive' } },
        select: { id: true },
      });

      if (!classRecord) {
        return { sections: [], total: 0 };
      }

      studentSectionName = student.section;
      if (!studentSectionName) {
        return { sections: [], total: 0 };
      }
    }

    const [sections, classRecord, liveSectionCounts] = await Promise.all([
      prisma.section.findMany({
        where: { 
          classId,
          class: { schoolId },
          ...(studentSectionName ? { name: { equals: studentSectionName, mode: 'insensitive' } } : {}),
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.class.findUnique({
        where: { id: classId },
        select: { id: true, name: true },
      }),
      prisma.student.groupBy({
        by: ['class', 'section'],
        where: {
          schoolId,
          isActive: true,
          section: { not: null },
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const countsByClassAndSection = new Map<string, number>();
    liveSectionCounts.forEach(item => {
      if (item.section) {
        countsByClassAndSection.set(`${item.class}::${item.section}`, item._count.id);
      }
    });

    const sectionsWithLiveCounts = sections.map(section => ({
      ...section,
      currentStudents: countsByClassAndSection.get(`${classRecord?.name || ''}::${section.name}`) || 0,
      teacherName: section.teacher?.name || '',
    }));

    return {
      sections: sectionsWithLiveCounts,
      total: sectionsWithLiveCounts.length,
    };
  }

  async getSection(id: string, schoolId: string) {
    const section = await prisma.section.findFirst({
      where: { 
        id,
        class: { schoolId },
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            academicYearId: true,
          },
        },
      },
    });
    
    if (!section) throw new Error('Section not found');
    return section;
  }

  async createSection(classId: string, schoolId: string, data: any) {
    // Verify class belongs to school
    const classData = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });
    if (!classData) throw new Error('Class not found');

    if (data.teacherId) {
      const teacher = await prisma.user.findFirst({
        where: { id: data.teacherId, schoolId },
        select: { id: true },
      });
      if (!teacher) throw new Error('Teacher not found in this school');
    }

    const { classId: _classId, ...sectionData } = data;

    return prisma.section.create({
      data: {
        ...sectionData,
        classId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateSection(id: string, schoolId: string, data: any) {
    const existing = await prisma.section.findFirst({
      where: { 
        id,
        class: { schoolId },
      },
    });
    if (!existing) throw new Error('Section not found');

    const {
      name,
      nameBangla,
      code,
      capacity,
      teacherId,
      roomNumber,
      isActive,
    } = data;

    if (teacherId) {
      const teacher = await prisma.user.findFirst({
        where: { id: teacherId, schoolId },
        select: { id: true },
      });
      if (!teacher) throw new Error('Teacher not found in this school');
    }

    return prisma.section.update({
      where: { id },
      data: {
        name,
        nameBangla: nameBangla || null,
        code,
        capacity,
        teacherId: teacherId || null,
        roomNumber: roomNumber || null,
        isActive,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteSection(id: string, schoolId: string) {
    const existing = await prisma.section.findFirst({
      where: { 
        id,
        class: { schoolId },
      },
    });
    if (!existing) throw new Error('Section not found');

    try {
      return await prisma.section.delete({ where: { id } });
    } catch (error: any) {
      if (error?.code === 'P2003' || error?.code === 'P2025') {
        throw new Error('Section has related records and cannot be deleted');
      }
      throw error;
    }
  }

  async activateSection(id: string, schoolId: string) {
    const existing = await prisma.section.findFirst({
      where: { 
        id,
        class: { schoolId },
      },
    });
    if (!existing) throw new Error('Section not found');

    return prisma.section.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivateSection(id: string, schoolId: string) {
    const existing = await prisma.section.findFirst({
      where: { 
        id,
        class: { schoolId },
      },
    });
    if (!existing) throw new Error('Section not found');

    return prisma.section.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============ Class Subjects ============

  async getClassSubjects(classId: string, schoolId: string) {
    const classSubjects = await prisma.classSubject.findMany({
      where: { 
        classId,
        class: { schoolId },
      },
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { subject: { name: 'asc' } },
    });

    return classSubjects;
  }

  async assignSubject(classId: string, schoolId: string, data: any) {
    const { subjectId, sectionId, teacherId, isCompulsory, creditHours } = data;

    // Verify class belongs to school
    const classData = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });
    if (!classData) throw new Error('Class not found');

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
      select: { id: true },
    });
    if (!subject) throw new Error('Subject not found in this school');

    if (teacherId) {
      const teacher = await prisma.user.findFirst({
        where: { id: teacherId, schoolId },
        select: { id: true },
      });
      if (!teacher) throw new Error('Teacher not found in this school');
    }

    if (sectionId) {
      const section = await prisma.section.findFirst({
        where: { id: sectionId, classId },
      });
      if (!section) throw new Error('Section not found in this class');
    }

    // Check if subject already assigned
    const existing = await prisma.classSubject.findFirst({
      where: { classId, subjectId, sectionId: sectionId || null },
    });
    if (existing) throw new Error('Subject already assigned to this class');

    return prisma.classSubject.create({
      data: {
        classId,
        sectionId: sectionId || undefined,
        subjectId,
        teacherId,
        isCompulsory: isCompulsory !== undefined ? isCompulsory : true,
        creditHours: creditHours || 0,
      },
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateSubject(classId: string, subjectId: string, schoolId: string, data: any) {
    const existing = await prisma.classSubject.findFirst({
      where: { 
        classId, 
        subjectId,
        ...(data.sectionId ? { sectionId: data.sectionId } : {}),
        class: { schoolId },
      },
    });
    if (!existing) throw new Error('Class subject not found');

    if (data.teacherId) {
      const teacher = await prisma.user.findFirst({
        where: { id: data.teacherId, schoolId },
        select: { id: true },
      });
      if (!teacher) throw new Error('Teacher not found in this school');
    }

    return prisma.classSubject.update({
      where: { id: existing.id },
      data: {
        teacherId: data.teacherId,
        isCompulsory: data.isCompulsory,
        creditHours: data.creditHours,
      },
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async removeSubject(classId: string, subjectId: string, schoolId: string, sectionId?: string) {
    const assignmentWhere = {
      classId,
      subjectId,
      class: { schoolId },
    };
    const existing = sectionId
      ? await prisma.classSubject.findFirst({
          where: { ...assignmentWhere, sectionId },
        }) || await prisma.classSubject.findFirst({
          where: { ...assignmentWhere, sectionId: null },
        })
      : await prisma.classSubject.findFirst({ where: assignmentWhere });
    if (!existing) throw new Error('Class subject not found');

    return prisma.classSubject.delete({
      where: { id: existing.id },
    });
  }

  // ============ Helper Methods ============

  async getAvailableTeachers(schoolId: string) {
    return prisma.user.findMany({
      where: {
        schoolId,
        role: 'teacher',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        designation: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getAvailableSubjects(schoolId: string) {
    return prisma.subject.findMany({
      where: {
        schoolId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}

export default new ClassService();