import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class SubjectService {
  // ============ Get Subjects ============

  async getSubjects(schoolId: string, filters: any) {
    const {
      search,
      classId,
      teacherId,
      isActive,
      page = 1,
      limit = 10,
    } = filters;

    const where: any = { schoolId };

    if (classId) where.classId = classId;
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

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip,
        take,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              nameBangla: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          classSubjects: {
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
        orderBy: { name: 'asc' },
      }),
      prisma.subject.count({ where }),
    ]);

    // Deduplicate subjects by name and code
    const uniqueSubjects = new Map<string, any>();

    for (const subject of subjects) {
      const key = `${(subject.name || '').trim().toLowerCase()}|${(subject.code || '').trim().toLowerCase()}`;
      const existing = uniqueSubjects.get(key);

      if (!existing) {
        uniqueSubjects.set(key, {
          ...subject,
          className: subject.class?.name || subject.classId,
          teacherName: subject.teacher?.name || null,
        });
        continue;
      }

      // Merge class names
      const classNames = new Set(
        [existing.className, subject.class?.name, existing.class?.name].filter(Boolean) as string[]
      );

      uniqueSubjects.set(key, {
        ...existing,
        ...subject,
        className: Array.from(classNames).join(', '),
        teacherName: existing.teacherName || subject.teacher?.name || null,
      });
    }

    const filteredSubjects = Array.from(uniqueSubjects.values());

    return {
      subjects: filteredSubjects,
      total: filteredSubjects.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(filteredSubjects.length / Number(limit)),
    };
  }

  async getSubject(id: string, schoolId: string) {
    const subject = await prisma.subject.findFirst({
      where: { id, schoolId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            nameBangla: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        classSubjects: {
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

    if (!subject) throw new Error('Subject not found');
    return subject;
  }

  // ============ Create/Update Subjects ============

  async createSubject(schoolId: string, data: any) {
    const classData = await prisma.class.findFirst({
      where: { id: data.classId, schoolId, isActive: true },
      select: { id: true },
    });
    if (!classData) throw new Error('Class not found in this school');

    return prisma.subject.create({
      data: {
        schoolId,
        name: data.name,
        nameBangla: data.nameBangla || undefined,
        code: String(data.code).trim(),
        description: data.description || undefined,
        classId: data.classId,
        teacherId: data.teacherId || undefined,
        creditHours: Number(data.creditHours) || 0,
        isCompulsory: data.isCompulsory ?? true,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateSubject(id: string, schoolId: string, data: any) {
    const existing = await prisma.subject.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Subject not found');

    if (data.classId) {
      const classRecord = await prisma.class.findFirst({
        where: { id: data.classId, schoolId },
        select: { id: true },
      });
      if (!classRecord) throw new Error('Class not found in this school');
    }
    if (data.teacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: { id: data.teacherId, schoolId },
        select: { id: true },
      });
      if (!teacher) throw new Error('Teacher not found in this school');
    }

    const { schoolId: _schoolId, ...subjectData } = data;

    return prisma.subject.update({
      where: { id },
      data: subjectData,
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteSubject(id: string, schoolId: string) {
    const existing = await prisma.subject.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Subject not found');

    return prisma.$transaction(async (transaction) => {
      await transaction.mark.deleteMany({
        where: {
          examSubject: {
            subjectId: id,
          },
        },
      });
      await transaction.examSubject.deleteMany({ where: { subjectId: id } });
      await transaction.classSubject.deleteMany({ where: { subjectId: id } });
      return transaction.subject.delete({ where: { id } });
    });
  }

  // ============ Status Management ============

  async activateSubject(id: string, schoolId: string) {
    const existing = await prisma.subject.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Subject not found');

    return prisma.subject.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivateSubject(id: string, schoolId: string) {
    const existing = await prisma.subject.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Subject not found');

    return prisma.subject.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============ Class Subjects ============

  async getSubjectsByClass(classId: string, schoolId: string) {
    return prisma.subject.findMany({
      where: {
        classId,
        schoolId,
        isActive: true,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getClassesWithSubjects(schoolId: string) {
    const classes = await prisma.class.findMany({
      where: {
        schoolId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        nameBangla: true,
        sections: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const subjectCounts = await prisma.subject.groupBy({
      by: ['classId'],
      where: {
        schoolId,
        isActive: true,
      },
      _count: true,
    });

    const classMap = subjectCounts.reduce((acc: any, item) => {
      acc[item.classId] = item._count;
      return acc;
    }, {});

    const classWithSubjects = await Promise.all(
      classes.map(async (cls) => {
        const subjects = await prisma.subject.findMany({
          where: {
            classId: cls.id,
            schoolId,
            isActive: true,
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
        });

        return {
          classId: cls.id,
          className: cls.name,
          classNameBangla: cls.nameBangla,
          sectionCount: cls.sections.length,
          subjectCount: classMap[cls.id] || 0,
          subjects,
        };
      })
    );

    return classWithSubjects;
  }

  // ============ Teacher Assignment ============

  async assignTeacher(subjectId: string, teacherId: string, schoolId: string) {
    const existing = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
    });
    if (!existing) throw new Error('Subject not found');

    const teacher = await prisma.user.findFirst({
      where: {
        id: teacherId,
        schoolId,
        role: 'teacher',
        isActive: true,
      },
    });
    if (!teacher) throw new Error('Teacher not found');

    return prisma.subject.update({
      where: { id: subjectId },
      data: { teacherId },
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

  // ============ Statistics ============

  async getStatistics(schoolId: string) {
    const [total, active, inactive, compulsory, optional, byClass, byTeacher] = await Promise.all([
      prisma.subject.count({ where: { schoolId } }),
      prisma.subject.count({ where: { schoolId, isActive: true } }),
      prisma.subject.count({ where: { schoolId, isActive: false } }),
      prisma.subject.count({ where: { schoolId, isCompulsory: true } }),
      prisma.subject.count({ where: { schoolId, isCompulsory: false } }),
      prisma.subject.groupBy({
        by: ['classId'],
        where: { schoolId, isActive: true },
        _count: true,
      }),
      prisma.subject.groupBy({
        by: ['teacherId'],
        where: { schoolId, isActive: true, teacherId: { not: null } },
        _count: true,
      }),
    ]);

    const classIds = byClass.map(item => item.classId);
    const classes = await prisma.class.findMany({
      where: { id: { in: classIds } },
      select: { id: true, name: true },
    });
    const classMap = classes.reduce((acc: any, cls) => {
      acc[cls.id] = cls.name;
      return acc;
    }, {});

    const teacherIds = byTeacher.map(item => item.teacherId).filter(id => id !== null);
    const teachers = await prisma.user.findMany({
      where: { id: { in: teacherIds as string[] } },
      select: { id: true, name: true },
    });
    const teacherMap = teachers.reduce((acc: any, teacher) => {
      acc[teacher.id] = teacher.name;
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      compulsoryCount: compulsory,
      optionalCount: optional,
      byClass: byClass.map(item => ({
        className: classMap[item.classId] || item.classId,
        count: item._count,
      })),
      byTeacher: byTeacher.map(item => ({
        teacherName: teacherMap[item.teacherId!] || 'Unknown',
        count: item._count,
      })),
    };
  }

  // ============ Bulk Operations ============

  async bulkCreateSubjects(schoolId: string, data: any) {
    const { classId, subjects } = data;

    const classData = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });
    if (!classData) throw new Error('Class not found');

    const results = [];

    for (const subjectData of subjects) {
      try {
        const subject = await prisma.subject.create({
          data: {
            ...subjectData,
            classId,
            schoolId,
          },
        });
        results.push(subject);
      } catch (error) {
        console.error(`Failed to create subject: ${subjectData.name}`, error);
      }
    }

    return results;
  }

  async bulkDeleteSubjects(schoolId: string, ids: string[]) {
    const result = await prisma.subject.deleteMany({
      where: {
        id: { in: ids },
        schoolId,
      },
    });

    return { deleted: result.count };
  }

  // ============ Search ============

  async searchSubjects(schoolId: string, query: string) {
    return prisma.subject.findMany({
      where: {
        schoolId,
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameBangla: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 20,
    });
  }

  // ============ NEW METHODS FOR SUBJECT CARD VIEW ============

  /**
   * Get subject card view data (compact view for dashboard)
   */
  async getSubjectCardView(schoolId: string, filters: any) {
    const { search, isActive, limit = 999 } = filters;

    const where: any = { schoolId };
    if (isActive !== undefined) where.isActive = isActive === 'true';

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameBangla: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            nameBangla: true,
            sections: {
              select: {
                id: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        classSubjects: {
          include: {
            class: {
              include: {
                sections: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
      take: Number(limit),
      orderBy: { name: 'asc' },
    });

    // Get marks data for each subject
    const subjectIds = subjects.map(s => s.id);
    const marks = await prisma.mark.findMany({
      where: {
        examSubject: {
          subjectId: { in: subjectIds },
        },
      },
      select: {
        classId: true,
        sectionId: true,
        examSubject: {
          select: {
            subjectId: true,
          },
        },
        marksObtained: true,
        fullMarks: true,
        isPassed: true,
        studentId: true,
        student: {
          select: {
            class: true,
            section: true,
          },
        },
      },
    });

    // Calculate statistics for each subject
    const subjectStats = subjects.map(subject => {
      const subjectMarks = marks.filter(m => m.examSubject.subjectId === subject.id);
      const totalStudents = subjectMarks.length;
      const passedStudents = subjectMarks.filter(m => m.isPassed).length;
      const averageMarks = totalStudents > 0
        ? subjectMarks.reduce((sum, m) => sum + (m.marksObtained / m.fullMarks) * 100, 0) / totalStudents
        : 0;

      // Get unique teachers count
      const teacherIds = new Set<string>();
      if (subject.teacherId) teacherIds.add(subject.teacherId);
      
      // Get sections count
      const allSections = new Set();
      if (subject.class?.sections) {
        subject.class.sections.forEach(s => allSections.add(s.id));
      }

      return {
        id: subject.id,
        name: subject.name,
        nameBangla: subject.nameBangla,
        code: subject.code,
        isActive: subject.isActive,
        totalClasses: 1,
        totalSections: allSections.size || 0,
        totalTeachers: teacherIds.size,
        averageMarks: Math.round(averageMarks),
        passRate: totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0,
      };
    });

    return {
      subjects: subjectStats,
      total: subjectStats.length,
    };
  }

  /**
   * Get subject with all class and section details
   */
  async getSubjectWithClasses(subjectId: string, schoolId: string, includeArchived: boolean = false) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
      include: {
        class: {
          include: {
            sections: {
              where: includeArchived ? {} : { isActive: true },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        classSubjects: {
          include: {
            class: {
              include: {
                sections: {
                  where: includeArchived ? {} : { isActive: true },
                },
              },
            },
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!subject) throw new Error('Subject not found');

    const classDetails: any[] = [];

    // Get marks for this subject across all classes
    const marks = await prisma.mark.findMany({
      where: {
        examSubject: {
          subjectId,
        },
      },
      select: {
        classId: true,
        sectionId: true,
        examSubject: {
          select: {
            exam: {
              select: {
                classId: true,
                sectionId: true,
              },
            },
          },
        },
        marksObtained: true,
        fullMarks: true,
        isPassed: true,
        studentId: true,
        student: {
          select: {
            class: true,
            section: true,
          },
        },
      },
    });

    // Group marks by class and section
    const marksByClassSection: Record<string, any[]> = {};
    marks.forEach(mark => {
      const classId = mark.classId || mark.examSubject.exam.classId;
      const sectionId = mark.sectionId || mark.examSubject.exam.sectionId || 'none';
      const key = `${classId}-${sectionId}`;
      if (!marksByClassSection[key]) marksByClassSection[key] = [];
      marksByClassSection[key].push(mark);
    });

    // Build class details from classSubjects
    for (const cs of subject.classSubjects) {
      const classData = cs.class;
      for (const section of classData.sections) {
        if (cs.sectionId && cs.sectionId !== section.id) continue;
        const key = `${classData.id}-${section.id}`;
        const legacyKey = `${classData.id}-none`;
        const className = String(classData.name).replace(/^class[-\s:]*/i, '').trim().toLowerCase();
        const sectionName = String(section.name).trim().toLowerCase();
        const sectionMarks = [
          ...(marksByClassSection[key] || []),
          ...(marksByClassSection[legacyKey] || []).filter((mark: any) => {
            const studentClass = String(mark.student?.class || '').replace(/^class[-\s:]*/i, '').trim().toLowerCase();
            return studentClass === className && String(mark.student?.section || '').trim().toLowerCase() === sectionName;
          }),
        ];

        const totalStudents = sectionMarks.length;
        const passedStudents = sectionMarks.filter(m => m.isPassed).length;
        const failedStudents = totalStudents - passedStudents;

        const averageMarks = totalStudents > 0
          ? sectionMarks.reduce((sum, m) => sum + (m.marksObtained / m.fullMarks) * 100, 0) / totalStudents
          : 0;

        const marksValues = sectionMarks.map(m => m.marksObtained);
        const highestMarks = marksValues.length > 0 ? Math.max(...marksValues) : 0;
        const lowestMarks = marksValues.length > 0 ? Math.min(...marksValues) : 0;

        classDetails.push({
          id: `${classData.id}-${section.id}`,
          classId: classData.id,
          className: classData.name,
          classNameBangla: classData.nameBangla,
          sectionId: section.id,
          sectionName: section.name,
          teacherId: cs.sectionId ? cs.teacherId || undefined : undefined,
          teacherName: cs.sectionId ? cs.teacher?.name || undefined : undefined,
          teacherEmail: cs.sectionId ? cs.teacher?.email || undefined : undefined,
          averageMarks: Math.round(averageMarks),
          totalStudents,
          passedStudents,
          failedStudents,
          highestMarks,
          lowestMarks,
        });
      }
    }

    // Get unique teachers count
    const teachers = new Set<string>();
    classDetails.forEach(d => {
      if (d.teacherId) teachers.add(d.teacherId);
    });

    // Get all sections count
    const allSections = classDetails.map(d => d.sectionId);
    const uniqueSections = new Set(allSections);

    // Get all classes count
    const allClasses = classDetails.map(d => d.classId);
    const uniqueClasses = new Set(allClasses);

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectNameBangla: subject.nameBangla,
      subjectCode: subject.code,
      totalClasses: uniqueClasses.size,
      totalSections: uniqueSections.size,
      totalTeachers: teachers.size,
      classDetails,
    };
  }

  /**
   * Get subject performance statistics
   */
  async getSubjectPerformance(subjectId: string, schoolId: string, fromDate?: Date, toDate?: Date) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
    });
    if (!subject) throw new Error('Subject not found');

    const where: any = {
      examSubject: {
        subjectId,
      },
    };

    if (fromDate) where.enteredAt = { gte: fromDate };
    if (toDate) where.enteredAt = { ...where.enteredAt, lte: toDate };

    const marks = await prisma.mark.findMany({
      where,
      select: {
        marksObtained: true,
        fullMarks: true,
        isPassed: true,
        enteredAt: true,
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
        examSubject: {
          select: {
            exam: {
              select: {
                classId: true,
                sectionId: true,
              },
            },
          },
        },
      },
    });

    const totalStudents = marks.length;
    const passedStudents = marks.filter(m => m.isPassed).length;
    const failedStudents = totalStudents - passedStudents;

    const averageMarks = totalStudents > 0
      ? marks.reduce((sum, m) => sum + (m.marksObtained / m.fullMarks) * 100, 0) / totalStudents
      : 0;

    // Group by class
    const classMap: Record<string, { className: string; marks: any[] }> = {};
    for (const mark of marks) {
      const classId = mark.examSubject.exam.classId;
      if (!classMap[classId]) {
        classMap[classId] = {
          className: classId,
          marks: [],
        };
      }
      classMap[classId].marks.push(mark);
    }

    const classPerformance = Object.entries(classMap).map(([classId, data]) => {
      const total = data.marks.length;
      const passed = data.marks.filter(m => m.isPassed).length;
      const avg = total > 0
        ? data.marks.reduce((sum, m) => sum + (m.marksObtained / m.fullMarks) * 100, 0) / total
        : 0;

      return {
        className: classId,
        average: Math.round(avg),
        students: total,
        passed,
        failed: total - passed,
      };
    });

    return {
      overallAverage: Math.round(averageMarks),
      totalStudents,
      passedStudents,
      failedStudents,
      passRate: totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0,
      classPerformance,
    };
  }

  /**
   * Get teachers teaching a specific subject
   */
  async getSubjectTeachers(subjectId: string, schoolId: string) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
    });
    if (!subject) throw new Error('Subject not found');

    const teachers = await prisma.user.findMany({
      where: {
        schoolId,
        role: 'teacher',
        isActive: true,
        OR: [
          { id: subject.teacherId || '' },
          { classSubjects: { some: { subjectId } } },
        ],
      },
      include: {
        classSubjects: {
          where: { subjectId },
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

    return teachers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      classes: user.classSubjects.map(cs => ({
        classId: cs.classId,
        className: cs.class?.name || '',
      })) || [],
    }));
  }

  /**
   * Get detailed statistics for a specific subject in a class
   */
  async getSubjectClassDetails(subjectId: string, classId: string, schoolId: string, sectionId?: string) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
    });
    if (!subject) throw new Error('Subject not found');

    const classData = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });
    if (!classData) throw new Error('Class not found');

    const where: any = {
      examSubject: {
        subjectId,
      },
    };

    if (classId) {
      where.examSubject = {
        ...where.examSubject,
        exam: {
          classId,
        },
      };
    }

    if (sectionId) {
      where.examSubject = {
        ...where.examSubject,
        exam: {
          ...where.examSubject?.exam,
          sectionId,
        },
      };
    }

    const marks = await prisma.mark.findMany({
      where,
      select: {
        marksObtained: true,
        fullMarks: true,
        isPassed: true,
        examSubject: {
          select: {
            exam: {
              select: {
                sectionId: true,
              },
            },
          },
        },
      },
    });

    // Group by section
    const sectionMap: Record<string, any[]> = {};
    for (const mark of marks) {
      const key = mark.examSubject.exam.sectionId || 'none';
      if (!sectionMap[key]) sectionMap[key] = [];
      sectionMap[key].push(mark);
    }

    // Get section names
    const sectionIds = Object.keys(sectionMap).filter(id => id !== 'none');
    const sections = await prisma.section.findMany({
      where: { id: { in: sectionIds } },
      select: { id: true, name: true },
    });
    const sectionNameMap = sections.reduce((acc, s) => {
      acc[s.id] = s.name;
      return acc;
    }, {} as Record<string, string>);

    // Build result
    const results = Object.entries(sectionMap).map(([secId, secMarks]) => {
      const total = secMarks.length;
      const passed = secMarks.filter(m => m.isPassed).length;
      const failed = total - passed;
      const avg = total > 0
        ? secMarks.reduce((sum, m) => sum + (m.marksObtained / m.fullMarks) * 100, 0) / total
        : 0;

      const marksValues = secMarks.map(m => m.marksObtained);
      const highest = marksValues.length > 0 ? Math.max(...marksValues) : 0;
      const lowest = marksValues.length > 0 ? Math.min(...marksValues) : 0;

      return {
        sectionId: secId === 'none' ? '' : secId,
        sectionName: secId === 'none' ? 'All Sections' : (sectionNameMap[secId] || secId),
        totalStudents: total,
        averageMarks: Math.round(avg),
        passedStudents: passed,
        failedStudents: failed,
        highestMarks: highest,
        lowestMarks: lowest,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      };
    });

    return results;
  }

  /**
   * Get subject summary for dashboard
   */
  async getSubjectSummary(subjectId: string, schoolId: string) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
      include: {
        class: true,
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!subject) throw new Error('Subject not found');

    const marks = await prisma.mark.findMany({
      where: {
        examSubject: {
          subjectId,
        },
      },
      select: {
        marksObtained: true,
        fullMarks: true,
        isPassed: true,
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
      orderBy: { marksObtained: 'desc' },
    });

    const totalStudents = marks.length;
    const passedStudents = marks.filter(m => m.isPassed).length;
    const avg = totalStudents > 0
      ? marks.reduce((sum, m) => sum + (m.marksObtained / m.fullMarks) * 100, 0) / totalStudents
      : 0;

    const marksValues = marks.map(m => m.marksObtained);
    const highest = marksValues.length > 0 ? Math.max(...marksValues) : 0;
    const lowest = marksValues.length > 0 ? Math.min(...marksValues) : 0;

    let topPerformer = undefined;
    if (marks.length > 0 && marks[0].student) {
      topPerformer = {
        studentName: marks[0].student.name,
        marks: marks[0].marksObtained,
        className: marks[0].student.class || '',
        sectionName: marks[0].student.section || '',
      };
    }

    // Get unique teachers count
    const teachers = await prisma.user.findMany({
      where: {
        schoolId,
        role: 'teacher',
        OR: [
          { id: subject.teacherId || '' },
          { classSubjects: { some: { subjectId } } },
        ],
      },
    });

    return {
      name: subject.name,
      nameBangla: subject.nameBangla,
      code: subject.code,
      totalClasses: 1,
      totalSections: 0,
      totalTeachers: teachers.length,
      totalStudents,
      overallAverage: Math.round(avg),
      passRate: totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0,
      highestMarks: highest,
      lowestMarks: lowest,
      topPerformer,
    };
  }

  /**
   * Get subject names for dropdown
   */
  async getSubjectNames(schoolId: string, isActive: boolean = true) {
    const subjects = await prisma.subject.findMany({
      where: {
        schoolId,
        isActive,
      },
      select: {
        id: true,
        name: true,
        nameBangla: true,
      },
      orderBy: { name: 'asc' },
    });

    return subjects;
  }

  /**
   * Export subject report
   */
  async exportSubjectReport(subjectId: string, schoolId: string, format: string, classId?: string, sectionId?: string) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
      include: {
        class: true,
        teacher: true,
      },
    });
    if (!subject) throw new Error('Subject not found');

    const where: any = {
      examSubject: {
        subjectId,
      },
    };
    if (classId) {
      where.examSubject = {
        ...where.examSubject,
        exam: {
          classId,
        },
      };
    }
    if (sectionId) {
      where.examSubject = {
        ...where.examSubject,
        exam: {
          ...where.examSubject?.exam,
          sectionId,
        },
      };
    }

    const marks = await prisma.mark.findMany({
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
      orderBy: { marksObtained: 'desc' },
    });

    const headers = [
      'Student Name',
      'Roll Number',
      'Class',
      'Section',
      'Marks Obtained',
      'Full Marks',
      'Percentage',
      'Status',
    ];

    const rows = marks.map(m => [
      m.student.name,
      m.student.rollNumber,
      m.student.class || '',
      m.student.section || '',
      m.marksObtained,
      m.fullMarks,
      ((m.marksObtained / m.fullMarks) * 100).toFixed(2),
      m.isPassed ? 'Passed' : 'Failed',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Get subject performance by class
   */
  async getSubjectPerformanceByClass(subjectId: string, schoolId: string) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
    });
    if (!subject) throw new Error('Subject not found');

    const marks = await prisma.mark.findMany({
      where: {
        examSubject: {
          subjectId,
        },
      },
      select: {
        marksObtained: true,
        fullMarks: true,
        isPassed: true,
        examSubject: {
          select: {
            exam: {
              select: {
                classId: true,
              },
            },
          },
        },
      },
    });

    // Group by class
    const classMap: Record<string, any[]> = {};
    for (const mark of marks) {
      const classId = mark.examSubject.exam.classId;
      if (!classMap[classId]) classMap[classId] = [];
      classMap[classId].push(mark);
    }

    // Get class names
    const classIds = Object.keys(classMap);
    const classes = await prisma.class.findMany({
      where: { id: { in: classIds } },
      select: { id: true, name: true },
    });
    const classNames = classes.reduce((acc, c) => {
      acc[c.id] = c.name;
      return acc;
    }, {} as Record<string, string>);

    const results = Object.entries(classMap).map(([classId, marksList]) => {
      const total = marksList.length;
      const passed = marksList.filter(m => m.isPassed).length;
      const avg = total > 0
        ? marksList.reduce((sum, m) => sum + (m.marksObtained / m.fullMarks) * 100, 0) / total
        : 0;

      return {
        className: classNames[classId] || classId,
        average: Math.round(avg),
        students: total,
        passed,
        failed: total - passed,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      };
    });

    return results;
  }

  /**
   * Get subject performance by section
   */
  async getSubjectPerformanceBySection(subjectId: string, classId: string, schoolId: string) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
    });
    if (!subject) throw new Error('Subject not found');

    const marks = await prisma.mark.findMany({
      where: {
        examSubject: {
          subjectId,
          exam: {
            classId,
          },
        },
      },
      select: {
        marksObtained: true,
        fullMarks: true,
        isPassed: true,
        examSubject: {
          select: {
            exam: {
              select: {
                sectionId: true,
              },
            },
          },
        },
      },
    });

    // Group by section
    const sectionMap: Record<string, any[]> = {};
    for (const mark of marks) {
      const key = mark.examSubject.exam.sectionId || 'none';
      if (!sectionMap[key]) sectionMap[key] = [];
      sectionMap[key].push(mark);
    }

    // Get section names
    const sectionIds = Object.keys(sectionMap).filter(id => id !== 'none');
    const sections = await prisma.section.findMany({
      where: { id: { in: sectionIds } },
      select: { id: true, name: true },
    });
    const sectionNames = sections.reduce((acc, s) => {
      acc[s.id] = s.name;
      return acc;
    }, {} as Record<string, string>);

    // Get teachers for each section
    const sectionTeachers = await prisma.section.findMany({
      where: { id: { in: sectionIds } },
      select: {
        id: true,
        teacher: {
          select: {
            name: true,
          },
        },
      },
    });
    const teacherMap = sectionTeachers.reduce((acc, s) => {
      acc[s.id] = s.teacher?.name || undefined;
      return acc;
    }, {} as Record<string, string | undefined>);

    const results = Object.entries(sectionMap).map(([secId, marksList]) => {
      const total = marksList.length;
      const passed = marksList.filter(m => m.isPassed).length;
      const avg = total > 0
        ? marksList.reduce((sum, m) => sum + (m.marksObtained / m.fullMarks) * 100, 0) / total
        : 0;

      return {
        sectionName: secId === 'none' ? 'All Sections' : (sectionNames[secId] || secId),
        teacherName: secId === 'none' ? undefined : teacherMap[secId],
        average: Math.round(avg),
        students: total,
        passed,
        failed: total - passed,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      };
    });

    return results;
  }

  /**
   * Get subject pass rate trend
   */
  async getSubjectPassRateTrend(subjectId: string, schoolId: string, months: number = 6) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, schoolId },
    });
    if (!subject) throw new Error('Subject not found');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const marks = await prisma.mark.findMany({
      where: {
        examSubject: {
          subjectId,
        },
        enteredAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        enteredAt: true,
        marksObtained: true,
        fullMarks: true,
        isPassed: true,
      },
    });

    // Group by month
    const monthMap: Record<string, any[]> = {};
    for (const mark of marks) {
      const key = mark.enteredAt.toISOString().substring(0, 7);
      if (!monthMap[key]) monthMap[key] = [];
      monthMap[key].push(mark);
    }

    const results = Object.entries(monthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, marksList]) => {
        const total = marksList.length;
        const passed = marksList.filter(m => m.isPassed).length;
        const avg = total > 0
          ? marksList.reduce((sum, m) => sum + (m.marksObtained / m.fullMarks) * 100, 0) / total
          : 0;

        return {
          month,
          passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
          average: Math.round(avg),
          students: total,
        };
      });

    return results;
  }
}

export default new SubjectService();