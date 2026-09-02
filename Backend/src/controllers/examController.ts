import { Request, Response } from 'express';
import ExamService from '../services/examService';

export class ExamController {
  // ============ Exams ============

  async getExams(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const result = await ExamService.getExams(schoolId!, filters);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get exams error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch exams',
      });
    }
  }

  async getExam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const exam = await ExamService.getExam(id, schoolId!);

      return res.status(200).json({
        success: true,
        exam,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get exam error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch exam',
      });
    }
  }

  async createExam(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const exam = await ExamService.createExam(
        schoolId!,
        data,
        req.user?.userId!
      );

      return res.status(201).json({
        success: true,
        message: 'Exam created successfully',
        exam,
      });
    } catch (error) {
      console.error('Create exam error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create exam',
      });
    }
  }

  async updateExam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const exam = await ExamService.updateExam(id, schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Exam updated successfully',
        exam,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update exam error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update exam',
      });
    }
  }

  async deleteExam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await ExamService.deleteExam(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Exam deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Exam not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete exam error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete exam',
      });
    }
  }

  async publishExam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const exam = await ExamService.publishExam(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Exam published successfully',
        exam,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Publish exam error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to publish exam',
      });
    }
  }

  async unpublishExam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const exam = await ExamService.unpublishExam(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Exam unpublished successfully',
        exam,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Unpublish exam error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to unpublish exam',
      });
    }
  }

  // ============ Exam Subjects ============

  async getExamSubjects(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      const { schoolId } = req;

      const subjects = await ExamService.getExamSubjects(examId, schoolId!);

      return res.status(200).json({
        success: true,
        subjects,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get exam subjects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch exam subjects',
      });
    }
  }

  async addExamSubject(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const subject = await ExamService.addExamSubject(examId, schoolId!, data);

      return res.status(201).json({
        success: true,
        message: 'Subject added successfully',
        subject,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'Subject already added to this exam') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Add exam subject error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add subject',
      });
    }
  }

  async updateExamSubject(req: Request, res: Response) {
    try {
      const { examId, subjectId } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const subject = await ExamService.updateExamSubject(
        examId,
        subjectId,
        schoolId!,
        data
      );

      return res.status(200).json({
        success: true,
        message: 'Subject updated successfully',
        subject,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found' || error.message === 'Exam subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update exam subject error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update subject',
      });
    }
  }

  async removeExamSubject(req: Request, res: Response) {
    try {
      const { examId, subjectId } = req.params;
      const { schoolId } = req;

      await ExamService.removeExamSubject(examId, subjectId, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Subject removed successfully',
      });
    } catch (error: any) {
      if (error.message === 'Exam not found' || error.message === 'Exam subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Remove exam subject error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove subject',
      });
    }
  }

  // ============ Marks Entry ============

  async getMarks(req: Request, res: Response) {
    try {
      const { examId, subjectId } = req.params;
      const { schoolId } = req;

      const marks = await ExamService.getMarks(examId, subjectId, schoolId!);

      return res.status(200).json({
        success: true,
        marks,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found' || error.message === 'Exam subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get marks error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch marks',
      });
    }
  }

  async enterMarks(req: Request, res: Response) {
    try {
      const { examId, subjectId } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const marks = await ExamService.enterMarks(
        examId,
        subjectId,
        schoolId!,
        data,
        req.user?.userId!
      );

      return res.status(200).json({
        success: true,
        message: 'Marks entered successfully',
        marks,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found' || error.message === 'Exam subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Enter marks error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to enter marks',
      });
    }
  }

  async updateMark(req: Request, res: Response) {
    try {
      const { examId, subjectId, studentId } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const mark = await ExamService.updateMark(
        examId,
        subjectId,
        studentId,
        schoolId!,
        data
      );

      return res.status(200).json({
        success: true,
        message: 'Mark updated successfully',
        mark,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found' || 
          error.message === 'Exam subject not found' ||
          error.message === 'Mark not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update mark error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update mark',
      });
    }
  }

  async getStudentMarks(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { schoolId } = req;
      const { examId } = req.query;

      const marks = await ExamService.getStudentMarks(
        studentId,
        schoolId!,
        examId as string,
        req.user
      );

      return res.status(200).json({
        success: true,
        marks,
      });
    } catch (error) {
      console.error('Get student marks error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student marks',
      });
    }
  }

  // ============ Results ============

  async getResults(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const results = await ExamService.getResults(schoolId!, filters);

      return res.status(200).json({
        success: true,
        results,
      });
    } catch (error) {
      console.error('Get results error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch results',
      });
    }
  }

  async getStudentResult(req: Request, res: Response) {
    try {
      const { studentId, examId } = req.params;
      const { schoolId } = req;

      const result = await ExamService.getStudentResult(studentId, examId, schoolId!);

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (error: any) {
      if (error.message === 'Result not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get student result error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student result',
      });
    }
  }

  async generateResults(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      const { schoolId } = req;

      const results = await ExamService.generateResults(examId, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Results generated successfully',
        results,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Generate results error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate results',
      });
    }
  }

  async publishResults(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      const { schoolId } = req;

      const result = await ExamService.publishResults(examId, schoolId!);
      const { success, ...resultData } = result;

      return res.status(200).json({
        success,
        ...resultData,
      });
    } catch (error: any) {
      if (error.message === 'Exam not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Publish results error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to publish results',
      });
    }
  }

  async exportResults(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      const { schoolId } = req;
      const { format } = req.query;

      const csvContent = await ExamService.exportResults(
        examId,
        schoolId!,
        format as string || 'csv'
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=results_${examId}_${Date.now()}.csv`
      );

      return res.status(200).send(csvContent);
    } catch (error: any) {
      if (error.message === 'Exam not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Export results error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export results',
      });
    }
  }

  async getClassResults(req: Request, res: Response) {
    try {
      const { classId, sectionId, examId } = req.params;
      const { schoolId } = req;

      const results = await ExamService.getClassResults(
        classId,
        sectionId,
        examId,
        schoolId!
      );

      return res.status(200).json({
        success: true,
        results,
      });
    } catch (error: any) {
      if (error.message === 'Class not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get class results error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch class results',
      });
    }
  }

  // ============ Grade Systems ============

  async getGradeSystems(req: Request, res: Response) {
    try {
      const { schoolId } = req;

      const systems = await ExamService.getGradeSystems(schoolId!);

      return res.status(200).json({
        success: true,
        gradeSystems: systems,
      });
    } catch (error) {
      console.error('Get grade systems error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch grade systems',
      });
    }
  }

  async getGradeSystem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const system = await ExamService.getGradeSystem(id, schoolId!);

      return res.status(200).json({
        success: true,
        gradeSystem: system,
      });
    } catch (error: any) {
      if (error.message === 'Grade system not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get grade system error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch grade system',
      });
    }
  }

  async createGradeSystem(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const system = await ExamService.createGradeSystem(schoolId!, data);

      return res.status(201).json({
        success: true,
        message: 'Grade system created successfully',
        gradeSystem: system,
      });
    } catch (error) {
      console.error('Create grade system error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create grade system',
      });
    }
  }

  async updateGradeSystem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const system = await ExamService.updateGradeSystem(id, schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Grade system updated successfully',
        gradeSystem: system,
      });
    } catch (error: any) {
      if (error.message === 'Grade system not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update grade system error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update grade system',
      });
    }
  }

  async deleteGradeSystem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await ExamService.deleteGradeSystem(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Grade system deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Grade system not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete grade system error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete grade system',
      });
    }
  }

  async setDefaultGradeSystem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const system = await ExamService.setDefaultGradeSystem(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Default grade system set successfully',
        gradeSystem: system,
      });
    } catch (error: any) {
      if (error.message === 'Grade system not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Set default grade system error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to set default grade system',
      });
    }
  }

  // ============ Statistics ============

  async getExamStatistics(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { classId, sectionId, examId, academicYearId } = req.query;

      const statistics = await ExamService.getExamStatistics(schoolId!, {
        classId,
        sectionId,
        examId,
        academicYearId,
      });

      return res.status(200).json({
        success: true,
        statistics,
      });
    } catch (error) {
      console.error('Get exam statistics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch exam statistics',
      });
    }
  }

  async getStudentReport(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { schoolId } = req;

      const report = await ExamService.getStudentReport(studentId, schoolId!);

      return res.status(200).json({
        success: true,
        report,
      });
    } catch (error: any) {
      if (error.message === 'Student not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get student report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student report',
      });
    }
  }

  async getClassReport(req: Request, res: Response) {
    try {
      const { classId, sectionId } = req.params;
      const { schoolId } = req;

      const report = await ExamService.getClassReport(classId, sectionId, schoolId!);

      return res.status(200).json({
        success: true,
        report,
      });
    } catch (error: any) {
      if (error.message === 'Class not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get class report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch class report',
      });
    }
  }
}

export default new ExamController();