import { Request, Response } from 'express';
import SubjectService from '../services/subjectService';
import prisma from '../config/database';

export class SubjectController {
  // ============ Get Subjects ============

  async getSubjects(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const result = await SubjectService.getSubjects(schoolId!, filters);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get subjects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subjects',
      });
    }
  }

  async getSubject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const subject = await SubjectService.getSubject(id, schoolId!);

      return res.status(200).json({
        success: true,
        subject,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get subject error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subject',
      });
    }
  }

  // ============ Create/Update Subjects ============

  async createSubject(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      // Check if subject already exists for this class
      const existing = await prisma.subject.findFirst({
        where: {
          schoolId,
          classId: data.classId,
          name: data.name,
        },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Subject already exists for this class',
        });
      }

      const subject = await SubjectService.createSubject(schoolId!, data);

      return res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        subject,
      });
    } catch (error: any) {
      console.error('Create subject error:', error);
      const isConflict = error?.code === 'P2002';
      const isValidationError = error?.name === 'PrismaClientValidationError';
      return res.status(isConflict ? 409 : isValidationError ? 400 : 500).json({
        success: false,
        message: isConflict
          ? 'A subject with this code or name already exists'
          : isValidationError
            ? error.message || 'Invalid subject information'
            : 'Failed to create subject',
      });
    }
  }

  async updateSubject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const subject = await SubjectService.updateSubject(id, schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Subject updated successfully',
        subject,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update subject error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update subject',
      });
    }
  }

  async deleteSubject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await SubjectService.deleteSubject(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Subject deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete subject error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete subject',
      });
    }
  }

  // ============ Status Management ============

  async activateSubject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const subject = await SubjectService.activateSubject(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Subject activated successfully',
        subject,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Activate subject error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to activate subject',
      });
    }
  }

  async deactivateSubject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const subject = await SubjectService.deactivateSubject(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Subject deactivated successfully',
        subject,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Deactivate subject error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate subject',
      });
    }
  }

  // ============ Class Subjects ============

  async getSubjectsByClass(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { schoolId } = req;

      const subjects = await SubjectService.getSubjectsByClass(classId, schoolId!);

      return res.status(200).json({
        success: true,
        subjects,
      });
    } catch (error) {
      console.error('Get subjects by class error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subjects',
      });
    }
  }

  async getClassesWithSubjects(req: Request, res: Response) {
    try {
      const { schoolId } = req;

      const data = await SubjectService.getClassesWithSubjects(schoolId!);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Get classes with subjects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch classes with subjects',
      });
    }
  }

  // ============ Teacher Assignment ============

  async assignTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const { teacherId } = req.body;

      if (!teacherId) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required',
        });
      }

      const subject = await SubjectService.assignTeacher(id, teacherId, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Teacher assigned successfully',
        subject,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'Teacher not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Assign teacher error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign teacher',
      });
    }
  }

  // ============ Statistics ============

  async getStatistics(req: Request, res: Response) {
    try {
      const { schoolId } = req;

      const statistics = await SubjectService.getStatistics(schoolId!);

      return res.status(200).json({
        success: true,
        statistics,
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
      });
    }
  }

  // ============ Bulk Operations ============

  async bulkCreateSubjects(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const subjects = await SubjectService.bulkCreateSubjects(schoolId!, data);

      return res.status(201).json({
        success: true,
        message: `Created ${subjects.length} subjects`,
        subjects,
      });
    } catch (error: any) {
      if (error.message === 'Class not found') {
        return res.status(404).json({
          message: error.message,
        });
      }
      console.error('Bulk create subjects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create subjects',
      });
    }
  }

  async bulkDeleteSubjects(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Subject IDs are required',
        });
      }

      const result = await SubjectService.bulkDeleteSubjects(schoolId!, ids);

      return res.status(200).json({
        success: true,
        message: `Deleted ${result.deleted} subjects`,
        ...result,
      });
    } catch (error) {
      console.error('Bulk delete subjects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete subjects',
      });
    }
  }

  // ============ Search ============

  async searchSubjects(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      const subjects = await SubjectService.searchSubjects(schoolId!, q as string);

      return res.status(200).json({
        success: true,
        subjects,
      });
    } catch (error) {
      console.error('Search subjects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search subjects',
      });
    }
  }

  // ============ NEW METHODS FOR SUBJECT CARD VIEW ============

  /**
   * Get subject card view data (compact view for dashboard)
   * GET /api/subjects/card-view
   */
  async getSubjectCardView(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const result = await SubjectService.getSubjectCardView(schoolId!, filters);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get subject card view error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subject card view',
      });
    }
  }

  /**
   * Get subject with all class and section details
   * GET /api/subjects/:id/classes
   */
  async getSubjectWithClasses(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const { includeArchived } = req.query;

      const result = await SubjectService.getSubjectWithClasses(
        id,
        schoolId!,
        includeArchived === 'true'
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get subject with classes error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subject details',
      });
    }
  }

  /**
   * Get subject performance statistics
   * GET /api/subjects/:id/performance
   */
  async getSubjectPerformance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const { fromDate, toDate } = req.query;

      const result = await SubjectService.getSubjectPerformance(
        id,
        schoolId!,
        fromDate ? new Date(fromDate as string) : undefined,
        toDate ? new Date(toDate as string) : undefined
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get subject performance error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subject performance',
      });
    }
  }

  /**
   * Get teachers teaching a specific subject
   * GET /api/subjects/:id/teachers
   */
  async getSubjectTeachers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const teachers = await SubjectService.getSubjectTeachers(id, schoolId!);

      return res.status(200).json({
        success: true,
        teachers,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get subject teachers error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subject teachers',
      });
    }
  }

  /**
   * Get detailed statistics for a specific subject in a class
   * GET /api/subjects/:subjectId/class/:classId
   */
  async getSubjectClassDetails(req: Request, res: Response) {
    try {
      const { subjectId, classId } = req.params;
      const { schoolId } = req;
      const { sectionId } = req.query;

      const result = await SubjectService.getSubjectClassDetails(
        subjectId,
        classId,
        schoolId!,
        sectionId as string
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found' || error.message === 'Class not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get subject class details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch class details',
      });
    }
  }

  /**
   * Get subject summary for dashboard
   * GET /api/subjects/:id/summary
   */
  async getSubjectSummary(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const summary = await SubjectService.getSubjectSummary(id, schoolId!);

      return res.status(200).json({
        success: true,
        summary,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get subject summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subject summary',
      });
    }
  }

  /**
   * Get subject names for dropdown
   * GET /api/subjects/names
   */
  async getSubjectNames(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { isActive } = req.query;

      const subjects = await SubjectService.getSubjectNames(
        schoolId!,
        isActive !== undefined ? isActive === 'true' : true
      );

      return res.status(200).json({
        success: true,
        subjects,
      });
    } catch (error) {
      console.error('Get subject names error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subject names',
      });
    }
  }

  /**
   * Export subject performance report
   * GET /api/subjects/:id/export-report
   */
  async exportSubjectReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const { format, classId, sectionId } = req.query;

      const csvContent = await SubjectService.exportSubjectReport(
        id,
        schoolId!,
        format as string || 'csv',
        classId as string,
        sectionId as string
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=subject_report_${id}_${Date.now()}.csv`
      );

      return res.status(200).send(csvContent);
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Export subject report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export subject report',
      });
    }
  }

  /**
   * Get subject performance by class
   * GET /api/subjects/:id/performance-by-class
   */
  async getSubjectPerformanceByClass(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const result = await SubjectService.getSubjectPerformanceByClass(id, schoolId!);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get subject performance by class error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch performance data',
      });
    }
  }

  /**
   * Get subject performance by section
   * GET /api/subjects/:id/class/:classId/performance-by-section
   */
  async getSubjectPerformanceBySection(req: Request, res: Response) {
    try {
      const { id, classId } = req.params;
      const { schoolId } = req;

      const result = await SubjectService.getSubjectPerformanceBySection(
        id,
        classId,
        schoolId!
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get subject performance by section error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch performance data',
      });
    }
  }

  /**
   * Get subject pass rate trend
   * GET /api/subjects/:id/pass-rate-trend
   */
  async getSubjectPassRateTrend(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const { months } = req.query;

      const result = await SubjectService.getSubjectPassRateTrend(
        id,
        schoolId!,
        months ? parseInt(months as string) : 6
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get subject pass rate trend error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch pass rate trend',
      });
    }
  }
}

export default new SubjectController();