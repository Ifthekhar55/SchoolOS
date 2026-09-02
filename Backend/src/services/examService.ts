import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class ExamService {
  // ============ Exams ============

  async getExams(schoolId: string, filters: any) {
    const {
      search,
      type,
      classId,
      sectionId,
      academicYearId,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = filters;

    const where: any = { schoolId };

    if (type) where.type = type;
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (status) where.status = status;
    if (dateFrom) where.examDate = { gte: new Date(dateFrom) };
    if (dateTo) where.examDate = { ...where.examDate, lte: new Date(dateTo) };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameBangla: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip,
        take,
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
          subjects: {
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
          academicYear: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { examDate: 'desc' },
      }),
      prisma.exam.count({ where }),
    ]);

    return {
      exams: exams.map((exam) => ({
        ...exam,
        className: exam.class?.name || '',
        sectionName: exam.section?.name || '',
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getExam(id: string, schoolId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id, schoolId },
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
        subjects: {
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
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!exam) throw new Error('Exam not found');
    return {
      ...exam,
      className: exam.class?.name || '',
      sectionName: exam.section?.name || '',
    };
  }

  async createExam(schoolId: string, data: any, createdBy: string) {
    const {
      subjects,
      schoolId: _schoolId,
      sectionId,
      nameBangla,
      description,
      ...examData
    } = data;

    const examId = await prisma.$transaction(async (tx) => {
      const exam = await tx.exam.create({
        data: {
          ...examData,
          schoolId,
          createdBy,
          sectionId: sectionId || null,
          nameBangla: nameBangla || null,
          description: description || null,
          examDate: new Date(data.examDate),
        },
      });

      // Create exam subjects
      if (subjects && subjects.length > 0) {
        await tx.examSubject.createMany({
          data: subjects.map((subject: any) => ({
            subjectId: subject.subjectId,
            fullMarks: subject.fullMarks,
            passingMarks: subject.passingMarks,
            duration: subject.duration,
            time: subject.time || null,
            room: subject.room || null,
            examId: exam.id,
            date: new Date(subject.date),
          })),
        });
      }

      return exam.id;
    });

    return this.getExam(examId, schoolId);
  }

  async updateExam(id: string, schoolId: string, data: any) {
    const existing = await prisma.exam.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Exam not found');

    const {
      id: _id,
      schoolId: _schoolId,
      subjects,
      createdAt,
      updatedAt,
      createdBy,
      ...examData
    } = data;

    const trimEmptyStrings = (value: any): any => {
      if (value === null || value === undefined) return value;
      if (value instanceof Date) return value;

      if (Array.isArray(value)) {
        return value
          .map((item) => trimEmptyStrings(item))
          .filter((item) => item !== undefined);
      }

      if (typeof value === 'object') {
        const cleaned: Record<string, any> = {};
        Object.entries(value).forEach(([key, item]) => {
          const sanitized = trimEmptyStrings(item);
          if (sanitized === undefined) return;
          if (typeof sanitized === 'string' && sanitized.trim() === '') {
            cleaned[key] = key === 'sectionId' || key === 'nameBangla' || key === 'description' || key === 'room' ? null : sanitized;
            return;
          }
          cleaned[key] = sanitized;
        });
        return cleaned;
      }

      if (typeof value === 'string') {
        return value.trim();
      }

      return value;
    };

    const safeExamData = trimEmptyStrings({
      ...examData,
      sectionId: examData.sectionId || null,
      nameBangla: examData.nameBangla || null,
      description: examData.description || null,
      examDate: data.examDate ? new Date(data.examDate) : existing.examDate,
    });

    return prisma.$transaction(async (tx) => {
      const exam = await tx.exam.update({
        where: { id },
        data: safeExamData,
      });

      if (subjects) {
        const validSubjects = (subjects || [])
          .filter((subject: any) => subject && subject.subjectId)
          .map((subject: any) => {
            const subjectDate = subject.date ? new Date(subject.date) : new Date();

            return {
              subjectId: subject.subjectId,
              fullMarks: Number(subject.fullMarks) || 0,
              passingMarks: Number(subject.passingMarks) || 0,
              duration: Number(subject.duration) || 0,
              time: subject.time || null,
              room: subject.room || null,
              examId: id,
              date: Number.isNaN(subjectDate.getTime()) ? new Date() : subjectDate,
            };
          });

        const currentSubjects = await tx.examSubject.findMany({
          where: { examId: id },
          select: { id: true, subjectId: true },
        });

        const incomingSubjectIds = new Set(validSubjects.map((subject: any) => subject.subjectId));
        const subjectsToRemove = currentSubjects.filter(
          (subject) => !incomingSubjectIds.has(subject.subjectId)
        );

        if (subjectsToRemove.length > 0) {
          await tx.mark.deleteMany({
            where: {
              examSubjectId: { in: subjectsToRemove.map((subject) => subject.id) },
            },
          });

          await tx.examSubject.deleteMany({
            where: {
              id: { in: subjectsToRemove.map((subject) => subject.id) },
            },
          });
        }

        const existingSubjectsById = new Map(
          currentSubjects.filter((subject) => incomingSubjectIds.has(subject.subjectId)).map((subject) => [subject.subjectId, subject])
        );

        for (const subject of validSubjects) {
          const existing = existingSubjectsById.get(subject.subjectId);

          if (existing) {
            await tx.examSubject.update({
              where: { id: existing.id },
              data: {
                fullMarks: subject.fullMarks,
                passingMarks: subject.passingMarks,
                duration: subject.duration,
                time: subject.time || null,
                room: subject.room || null,
                date: subject.date,
              },
            });
            continue;
          }

          await tx.examSubject.create({
            data: {
              examId: id,
              subjectId: subject.subjectId,
              fullMarks: subject.fullMarks,
              passingMarks: subject.passingMarks,
              duration: subject.duration,
              time: subject.time || null,
              room: subject.room || null,
              date: subject.date,
            },
          });
        }
      }

      return this.getExam(id, schoolId);
    });
  }

  async deleteExam(id: string, schoolId: string) {
    const existing = await prisma.exam.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Exam not found');

    await prisma.$transaction(async (tx) => {
      const subjectIds = await tx.examSubject.findMany({
        where: { examId: id },
        select: { id: true },
      });

      if (subjectIds.length > 0) {
        await tx.mark.deleteMany({
          where: {
            examSubjectId: {
              in: subjectIds.map((subject) => subject.id),
            },
          },
        });
      }

      await tx.examSubject.deleteMany({ where: { examId: id } });
      await tx.result.deleteMany({ where: { examId: id } });
      await tx.exam.delete({ where: { id } });
    });

    return { success: true };
  }

  async publishExam(id: string, schoolId: string) {
    const existing = await prisma.exam.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Exam not found');

    return prisma.exam.update({
      where: { id },
      data: { status: 'published' },
    });
  }

  async unpublishExam(id: string, schoolId: string) {
    const existing = await prisma.exam.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Exam not found');

    return prisma.exam.update({
      where: { id },
      data: { status: 'completed' },
    });
  }

  // ============ Exam Subjects ============

  async getExamSubjects(examId: string, schoolId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
      include: {
        class: {
          select: { name: true },
        },
        section: {
          select: { name: true },
        },
      },
    });
    if (!exam) throw new Error('Exam not found');

    return prisma.examSubject.findMany({
      where: { examId },
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async addExamSubject(examId: string, schoolId: string, data: any) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
    });
    if (!exam) throw new Error('Exam not found');

    const existing = await prisma.examSubject.findFirst({
      where: { examId, subjectId: data.subjectId },
    });
    if (existing) throw new Error('Subject already added to this exam');

    return prisma.examSubject.create({
      data: {
        ...data,
        examId,
        date: new Date(data.date),
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

  async updateExamSubject(examId: string, subjectId: string, schoolId: string, data: any) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
    });
    if (!exam) throw new Error('Exam not found');

    const existing = await prisma.examSubject.findFirst({
      where: { examId, subjectId },
    });
    if (!existing) throw new Error('Exam subject not found');

    return prisma.examSubject.update({
      where: { examId_subjectId: { examId, subjectId } },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
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

  async removeExamSubject(examId: string, subjectId: string, schoolId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
    });
    if (!exam) throw new Error('Exam not found');

    const existing = await prisma.examSubject.findFirst({
      where: { examId, subjectId },
    });
    if (!existing) throw new Error('Exam subject not found');

    return prisma.examSubject.delete({
      where: { examId_subjectId: { examId, subjectId } },
    });
  }

  // ============ Marks Entry ============

  async getMarks(examId: string, subjectId: string, schoolId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
      include: {
        class: {
          select: { name: true },
        },
        section: {
          select: { name: true },
        },
      },
    });
    if (!exam) throw new Error('Exam not found');

    const examSubject = await prisma.examSubject.findFirst({
      where: { examId, subjectId },
      include: {
        subject: true,
      },
    });
    if (!examSubject) throw new Error('Exam subject not found');

    // Get all students in the class/section
    const students = await prisma.student.findMany({
      where: {
        schoolId,
        class: exam.class.name,
        section: exam.section?.name || undefined,
        isActive: true,
      },
      orderBy: { rollNumber: 'asc' },
    });

    // Get existing marks
    const marks = await prisma.mark.findMany({
      where: {
        examSubjectId: examSubject.id,
      },
    });

    // Combine students with marks
    return students.map(student => {
      const mark = marks.find(m => m.studentId === student.id);
      return {
        studentId: student.id,
        studentName: student.name,
        studentRoll: student.rollNumber,
        marksObtained: mark?.marksObtained || 0,
        fullMarks: examSubject.fullMarks,
        percentage: mark?.percentage || 0,
        grade: mark?.grade || '',
        gradePoint: mark?.gradePoint || 0,
        isPassed: mark?.isPassed || false,
        remarks: mark?.remarks || '',
        enteredAt: mark?.enteredAt || null,
      };
    });
  }

  async enterMarks(examId: string, subjectId: string, schoolId: string, data: any, enteredBy: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
      include: {
        class: true,
      },
    });
    if (!exam) throw new Error('Exam not found');

    const examSubject = await prisma.examSubject.findFirst({
      where: { examId, subjectId },
      include: {
        subject: true,
      },
    });
    if (!examSubject) throw new Error('Exam subject not found');

    const results: any[] = [];

    await prisma.$transaction(async (tx) => {
      for (const markData of data.marks) {
        const percentage = (markData.marksObtained / examSubject.fullMarks) * 100;
        const isPassed = markData.marksObtained >= examSubject.passingMarks;

        const mark = await tx.mark.upsert({
          where: {
            examSubjectId_studentId: {
              examSubjectId: examSubject.id,
              studentId: markData.studentId,
            },
          },
          update: {
            marksObtained: markData.marksObtained,
            percentage,
            isPassed,
            classId: exam.classId,
            sectionId: exam.sectionId || undefined,
            remarks: markData.remarks || '',
            updatedAt: new Date(),
          },
          create: {
            examSubjectId: examSubject.id,
            studentId: markData.studentId,
            marksObtained: markData.marksObtained,
            fullMarks: examSubject.fullMarks,
            percentage,
            isPassed,
            classId: exam.classId,
            sectionId: exam.sectionId || undefined,
            remarks: markData.remarks || '',
            enteredBy,
          },
        });
        results.push(mark);
      }
    });

    return results;
  }

  async updateMark(examId: string, subjectId: string, studentId: string, schoolId: string, data: any) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
    });
    if (!exam) throw new Error('Exam not found');

    const examSubject = await prisma.examSubject.findFirst({
      where: { examId, subjectId },
    });
    if (!examSubject) throw new Error('Exam subject not found');

    const mark = await prisma.mark.findFirst({
      where: {
        examSubjectId: examSubject.id,
        studentId,
      },
    });
    if (!mark) throw new Error('Mark not found');

    const percentage = (data.marksObtained / examSubject.fullMarks) * 100;
    const isPassed = data.marksObtained >= examSubject.passingMarks;

    return prisma.mark.update({
      where: { id: mark.id },
      data: {
        marksObtained: data.marksObtained,
        percentage,
        isPassed,
        classId: exam.classId,
        sectionId: exam.sectionId || undefined,
        remarks: data.remarks || '',
        updatedAt: new Date(),
      },
    });
  }

  async getStudentMarks(studentId: string, schoolId: string, examId?: string, user?: { email: string; role: string }) {
    const where: any = {
      studentId,
      student: { schoolId },
    };
    if (user?.role === 'student') {
      where.student.email = user.email;
    }
    if (examId) where.examSubject = { examId };

    const marks = await prisma.mark.findMany({
      where,
      include: {
        examSubject: {
          include: {
            exam: true,
            subject: true,
          },
        },
      },
      orderBy: { examSubject: { exam: { examDate: 'desc' } } },
    });

    const highestMarks = await prisma.mark.groupBy({
      by: ['examSubjectId'],
      where: {
        student: { schoolId },
        ...(examId ? { examSubject: { examId } } : {}),
      },
      _max: { marksObtained: true },
    });
    const highestByExamSubject = new Map(
      highestMarks.map((entry) => [entry.examSubjectId, entry._max.marksObtained || 0])
    );

    return marks.map((mark) => ({
      ...mark,
      highestMarks: highestByExamSubject.get(mark.examSubjectId) || mark.marksObtained,
    }));
  }

  // ============ Results ============

  async getResults(schoolId: string, filters: any) {
    const { examId, classId, sectionId, studentId, isPublished } = filters;

    const where: any = {
      student: { schoolId },
    };

    if (examId) where.examId = examId;
    if (studentId) where.studentId = studentId;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';

    if (classId || sectionId) {
      where.student = {
        ...where.student,
        class: classId || undefined,
        section: sectionId || undefined,
      };
    }

    return prisma.result.findMany({
      where,
      include: {
        exam: {
          include: {
            class: true,
            section: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
      },
      orderBy: [
        { exam: { examDate: 'desc' } },
        { rank: 'asc' },
      ],
    });
  }

  async getStudentResult(studentId: string, examId: string, schoolId: string) {
    const result = await prisma.result.findFirst({
      where: {
        studentId,
        examId,
        student: { schoolId },
      },
      include: {
        exam: {
          include: {
            class: true,
            section: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
      },
    });

    if (!result) throw new Error('Result not found');
    return result;
  }

  async generateResults(examId: string, schoolId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
      include: {
        subjects: {
          include: {
            subject: true,
            marks: true,
          },
        },
        class: true,
        section: true,
      },
    });
    if (!exam) throw new Error('Exam not found');

    // Get all students in the class/section
    const students = await prisma.student.findMany({
      where: {
        schoolId,
        class: exam.classId,
        section: exam.sectionId || undefined,
        isActive: true,
      },
      orderBy: { rollNumber: 'asc' },
    });

    const results: any[] = [];

    await prisma.$transaction(async (tx) => {
      for (const student of students) {
        let totalObtained = 0;
        let totalMarks = 0;
        const subjectResults = [];

        // Calculate marks for each subject
        for (const examSubject of exam.subjects) {
          const mark = examSubject.marks.find(m => m.studentId === student.id);
          const obtained = mark?.marksObtained || 0;
          const full = examSubject.fullMarks;

          totalObtained += obtained;
          totalMarks += full;

          const percentage = full > 0 ? (obtained / full) * 100 : 0;
          const grade = this.calculateGrade(percentage);
          const gradePoint = this.calculateGradePoint(percentage);

          subjectResults.push({
            subjectId: examSubject.subjectId,
            subjectName: examSubject.subject.name,
            fullMarks: full,
            obtainedMarks: obtained,
            percentage,
            grade,
            gradePoint,
            isPassed: obtained >= examSubject.passingMarks,
          });
        }

        const overallPercentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
        const isPassed = subjectResults.every(s => s.isPassed);
        const grade = this.calculateGrade(overallPercentage);
        const gradePoint = this.calculateGradePoint(overallPercentage);
        const gpa = this.calculateGPA(subjectResults);

        const result = await tx.result.upsert({
          where: {
            examId_studentId: {
              examId,
              studentId: student.id,
            },
          },
          update: {
            totalMarks,
            obtainedMarks: totalObtained,
            percentage: overallPercentage,
            grade,
            gradePoint,
            gpa,
            isPassed,
            subjectResults,
            updatedAt: new Date(),
          },
          create: {
            examId,
            studentId: student.id,
            totalMarks,
            obtainedMarks: totalObtained,
            percentage: overallPercentage,
            grade,
            gradePoint,
            gpa,
            isPassed,
            subjectResults,
          },
        });
        results.push(result);
      }

      // Calculate ranks
      const sortedResults = [...results].sort((a, b) => b.gpa - a.gpa);
      for (let i = 0; i < sortedResults.length; i++) {
        await tx.result.update({
          where: { id: sortedResults[i].id },
          data: { rank: i + 1 },
        });
      }
    });

    return this.getResults(schoolId, { examId });
  }

  async publishResults(examId: string, schoolId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
    });
    if (!exam) throw new Error('Exam not found');

    await prisma.result.updateMany({
      where: { examId },
      data: { isPublished: true },
    });

    // Update exam status
    await prisma.exam.update({
      where: { id: examId },
      data: { status: 'published' },
    });

    return {
      success: true,
      message: 'Results published successfully',
    };
  }

  async getClassResults(classId: string, sectionId: string, examId: string, schoolId: string) {
    return prisma.result.findMany({
      where: {
        examId,
        student: {
          schoolId,
          class: classId,
          section: sectionId || undefined,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
      },
      orderBy: { rank: 'asc' },
    });
  }

  // ============ Grade Systems ============

  async getGradeSystems(schoolId: string) {
    return prisma.gradeSystem.findMany({
      where: { schoolId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async getGradeSystem(id: string, schoolId: string) {
    const system = await prisma.gradeSystem.findFirst({
      where: { id, schoolId },
    });
    if (!system) throw new Error('Grade system not found');
    return system;
  }

  async createGradeSystem(schoolId: string, data: any) {
    if (data.isDefault) {
      await prisma.gradeSystem.updateMany({
        where: { schoolId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.gradeSystem.create({
      data: {
        ...data,
        schoolId,
      },
    });
  }

  async updateGradeSystem(id: string, schoolId: string, data: any) {
    const existing = await prisma.gradeSystem.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Grade system not found');

    if (data.isDefault) {
      await prisma.gradeSystem.updateMany({
        where: { schoolId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return prisma.gradeSystem.update({
      where: { id },
      data,
    });
  }

  async deleteGradeSystem(id: string, schoolId: string) {
    const existing = await prisma.gradeSystem.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Grade system not found');

    return prisma.gradeSystem.delete({ where: { id } });
  }

  async setDefaultGradeSystem(id: string, schoolId: string) {
    await prisma.gradeSystem.updateMany({
      where: { schoolId, isDefault: true },
      data: { isDefault: false },
    });

    return prisma.gradeSystem.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  // ============ Statistics ============

  async getExamStatistics(schoolId: string, params: any) {
    const { classId, sectionId, examId, academicYearId } = params;

    const where: any = { schoolId };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (examId) where.id = examId;
    if (academicYearId) where.academicYearId = academicYearId;

    const exams = await prisma.exam.findMany({
      where,
      include: {
        results: true,
        class: true,
        section: true,
      },
      orderBy: { examDate: 'desc' },
    });

    return exams.map(exam => {
      const results = exam.results || [];
      const totalStudents = results.length;
      const passed = results.filter(r => r.isPassed).length;
      const failed = totalStudents - passed;
      const avgGpa = totalStudents > 0
        ? results.reduce((sum, r) => sum + (r.gpa || 0), 0) / totalStudents
        : 0;

      return {
        examId: exam.id,
        examName: exam.name,
        className: exam.class.name,
        sectionName: exam.section?.name || 'All',
        totalStudents,
        passed,
        failed,
        passRate: totalStudents > 0 ? (passed / totalStudents) * 100 : 0,
        avgGpa,
        topGpa: results.length > 0 ? Math.max(...results.map(r => r.gpa || 0)) : 0,
      };
    });
  }

  async getStudentReport(studentId: string, schoolId: string) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
    });
    if (!student) throw new Error('Student not found');

    const results = await prisma.result.findMany({
      where: { studentId },
      include: {
        exam: {
          include: {
            class: true,
            section: true,
          },
        },
      },
      orderBy: { exam: { examDate: 'desc' } },
    });

    return {
      student,
      results,
    };
  }

  async getClassReport(classId: string, sectionId: string, schoolId: string) {
    const classData = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });
    if (!classData) throw new Error('Class not found');

    const results = await prisma.result.findMany({
      where: {
        student: {
          schoolId,
          class: classId,
          section: sectionId || undefined,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
        exam: {
          include: {
            class: true,
            section: true,
          },
        },
      },
      orderBy: [
        { exam: { examDate: 'desc' } },
        { rank: 'asc' },
      ],
    });

    return {
      class: classData,
      results,
    };
  }

  // ============ Helper Methods ============

  private calculateGrade(percentage: number): string {
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    if (percentage >= 33) return 'E';
    return 'F';
  }

  private calculateGradePoint(percentage: number): number {
    if (percentage >= 80) return 5.0;
    if (percentage >= 70) return 4.0;
    if (percentage >= 60) return 3.0;
    if (percentage >= 50) return 2.0;
    if (percentage >= 40) return 1.0;
    if (percentage >= 33) return 0.5;
    return 0.0;
  }

  private calculateGPA(subjectResults: any[]): number {
    if (subjectResults.length === 0) return 0;
    const total = subjectResults.reduce((sum, s) => sum + s.gradePoint, 0);
    return total / subjectResults.length;
  }

  // ============ Export ============

  async exportResults(examId: string, schoolId: string, format: string = 'csv') {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
      include: {
        class: true,
        section: true,
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });
    if (!exam) throw new Error('Exam not found');

    const results = await prisma.result.findMany({
      where: { examId },
      include: {
        student: {
          select: {
            name: true,
            rollNumber: true,
          },
        },
      },
      orderBy: { rank: 'asc' },
    });

    // Generate CSV
    const headers = [
      'Rank',
      'Student Name',
      'Roll Number',
      'Total Marks',
      'Obtained Marks',
      'Percentage',
      'Grade',
      'GPA',
      'Status',
    ];

    const rows = results.map(result => [
      result.rank || '-',
      result.student.name,
      result.student.rollNumber,
      result.totalMarks,
      result.obtainedMarks,
      result.percentage.toFixed(2),
      result.grade,
      result.gpa.toFixed(2),
      result.isPassed ? 'Passed' : 'Failed',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  }
}

export default new ExamService();