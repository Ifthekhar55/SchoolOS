import { Request, Response } from 'express';
import ReportService from '../services/reportService';

export class ReportController {
  // ============ Report CRUD ============

  async getReports(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const result = await ReportService.getReports(schoolId!, filters);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get reports error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reports',
      });
    }
  }

  async getReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const report = await ReportService.getReport(id, schoolId!);

      return res.status(200).json({
        success: true,
        report,
      });
    } catch (error: any) {
      if (error.message === 'Report not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch report',
      });
    }
  }

  async createReport(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;
      const createdBy = req.user?.userId;

      const report = await ReportService.createReport(schoolId!, data, createdBy!);

      return res.status(201).json({
        success: true,
        message: 'Report created successfully',
        report,
      });
    } catch (error) {
      console.error('Create report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create report',
      });
    }
  }

  async updateReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const report = await ReportService.updateReport(id, schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Report updated successfully',
        report,
      });
    } catch (error: any) {
      if (error.message === 'Report not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update report',
      });
    }
  }

  async deleteReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await ReportService.deleteReport(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Report not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete report',
      });
    }
  }

  // ============ Generate Reports ============

  async generateReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const { format } = req.query;

      const report = await ReportService.generateReport(
        id,
        schoolId!,
        format as string || 'pdf'
      );

      return res.status(200).json({
        success: true,
        message: 'Report generated successfully',
        report,
      });
    } catch (error: any) {
      if (error.message === 'Report not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Generate report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate report',
      });
    }
  }

  async generateCustomReport(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const reportData = await ReportService.generateCustomReport(schoolId!, data);

      return res.status(200).json({
        success: true,
        data: reportData,
      });
    } catch (error) {
      console.error('Generate custom report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate custom report',
      });
    }
  }

  // ============ Report Types ============

  async getReportTypes(req: Request, res: Response) {
    try {
      const types = await ReportService.getReportTypes();

      return res.status(200).json({
        success: true,
        types,
      });
    } catch (error) {
      console.error('Get report types error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch report types',
      });
    }
  }

  // ============ Dashboard Analytics ============

  async getDashboardAnalytics(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const analytics = await ReportService.getDashboardAnalytics(schoolId!, filters);

      return res.status(200).json({
        success: true,
        ...analytics,
      });
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard analytics',
      });
    }
  }

  // ============ Scheduled Reports ============

  async scheduleReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const { frequency, recipients } = req.body;

      const report = await ReportService.scheduleReport(id, schoolId!, frequency, recipients);

      return res.status(200).json({
        success: true,
        message: 'Report scheduled successfully',
        report,
      });
    } catch (error: any) {
      if (error.message === 'Report not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Schedule report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to schedule report',
      });
    }
  }

  async unscheduleReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const report = await ReportService.unscheduleReport(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Report unscheduled successfully',
        report,
      });
    } catch (error: any) {
      if (error.message === 'Report not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Unschedule report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to unschedule report',
      });
    }
  }

  // ============ Download Report ============

  async downloadReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const { format } = req.query;

      const data = await ReportService.downloadReport(
        id,
        schoolId!,
        format as string || 'csv'
      );

      if (typeof data === 'string') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.csv`);
        return res.send(data);
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      if (error.message === 'Report not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Download report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to download report',
      });
    }
  }

  // ============ Auto-Generate Reports ============

  async generateAttendanceReport(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.body;

      const data = await ReportService.generateAttendanceReport(schoolId!, filters);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Generate attendance report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate attendance report',
      });
    }
  }

  async generateFeeReport(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.body;

      const data = await ReportService.generateFeeReport(schoolId!, filters);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Generate fee report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate fee report',
      });
    }
  }

  async generateExamReport(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.body;

      const data = await ReportService.generateExamReport(schoolId!, filters);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Generate exam report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate exam report',
      });
    }
  }

  async generateStudentReport(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.body;

      const data = await ReportService.generateStudentReport(schoolId!, filters);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Generate student report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate student report',
      });
    }
  }

  async generateTeacherReport(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.body;

      const data = await ReportService.generateTeacherReport(schoolId!, filters);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Generate teacher report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate teacher report',
      });
    }
  }

  async generateClassReport(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.body;

      const data = await ReportService.generateClassReport(schoolId!, filters);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Generate class report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate class report',
      });
    }
  }

  // ============ Templates ============

  async getReportTemplates(req: Request, res: Response) {
    try {
      // Return predefined templates
      const templates = [
        { id: 'template-attendance', name: 'Daily Attendance Report', type: 'attendance', description: 'Daily attendance summary' },
        { id: 'template-fee', name: 'Monthly Fee Report', type: 'fee', description: 'Monthly fee collection report' },
        { id: 'template-exam', name: 'Exam Results Report', type: 'exam', description: 'Exam results and performance' },
        { id: 'template-student', name: 'Student Directory', type: 'student', description: 'Complete student list' },
        { id: 'template-teacher', name: 'Teacher Directory', type: 'teacher', description: 'Complete teacher list' },
        { id: 'template-class', name: 'Class Performance', type: 'class', description: 'Class-wise performance analysis' },
        { id: 'template-performance', name: 'School Performance', type: 'performance', description: 'Overall school performance' },
        { id: 'template-financial', name: 'Financial Summary', type: 'financial', description: 'School financial summary' },
      ];

      return res.status(200).json({
        success: true,
        templates,
      });
    } catch (error) {
      console.error('Get report templates error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch report templates',
      });
    }
  }

  async createFromTemplate(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { templateId, filters } = req.body;
      const createdBy = req.user?.userId;

      // Get template
      const templates = [
        { id: 'template-attendance', name: 'Attendance Report', type: 'attendance', description: 'Student attendance analytics' },
        { id: 'template-fee', name: 'Fee Collection Report', type: 'fee', description: 'Fee collection and payment status' },
        { id: 'template-exam', name: 'Exam Results Report', type: 'exam', description: 'Exam results and performance' },
        { id: 'template-student', name: 'Student Directory', type: 'student', description: 'Complete student list' },
        { id: 'template-teacher', name: 'Teacher Directory', type: 'teacher', description: 'Complete teacher list' },
        { id: 'template-class', name: 'Class Performance', type: 'class', description: 'Class-wise performance analysis' },
        { id: 'template-performance', name: 'School Performance', type: 'performance', description: 'Overall school performance' },
        { id: 'template-financial', name: 'Financial Summary', type: 'financial', description: 'School financial summary' },
      ];
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found',
        });
      }

      // Create report from template
      const report = await ReportService.createReport(schoolId!, {
        name: template.name,
        type: template.type,
        description: template.description,
        format: 'pdf',
        filters,
        status: 'draft',
      }, createdBy!);

      return res.status(201).json({
        success: true,
        message: 'Report created from template successfully',
        report,
      });
    } catch (error) {
      console.error('Create from template error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create report from template',
      });
    }
  }
}

export default new ReportController();