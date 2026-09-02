import { Request, Response } from 'express';
import prisma from '../config/database';
import ParentService from '../services/parentService';

export class ParentController {
  // ============ Dashboard ============

  async getDashboard(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const userId = req.user?.userId;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const dashboard = await ParentService.getDashboard(parent.id, schoolId!);

      return res.status(200).json({
        success: true,
        ...dashboard,
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard',
      });
    }
  }

  // ============ Children ============

  async getChildren(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const userId = req.user?.userId;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const children = await ParentService.getChildren(parent.id, schoolId!);

      return res.status(200).json({
        success: true,
        children,
      });
    } catch (error) {
      console.error('Get children error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch children',
      });
    }
  }

  async getChild(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const userId = req.user?.userId;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const child = await ParentService.getChild(id, parent.id, schoolId!);

      return res.status(200).json({
        success: true,
        child,
      });
    } catch (error: any) {
      if (error.message === 'Child not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get child error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch child',
      });
    }
  }

  // ============ Attendance ============

  async getChildAttendance(req: Request, res: Response) {
    try {
      const { childId } = req.params;
      const { schoolId } = req;
      const userId = req.user?.userId;
      const filters = req.query;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const attendance = await ParentService.getChildAttendance(
        childId,
        parent.id,
        schoolId!,
        filters
      );

      return res.status(200).json({
        success: true,
        attendance,
      });
    } catch (error: any) {
      if (error.message === 'Child not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get child attendance error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance',
      });
    }
  }

  async getAttendanceSummary(req: Request, res: Response) {
    try {
      const { childId } = req.params;
      const { schoolId } = req;
      const userId = req.user?.userId;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const summary = await ParentService.getAttendanceSummary(
        childId,
        parent.id,
        schoolId!
      );

      return res.status(200).json({
        success: true,
        ...summary,
      });
    } catch (error: any) {
      if (error.message === 'Child not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get attendance summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance summary',
      });
    }
  }

  // ============ Fees ============

  async getChildFees(req: Request, res: Response) {
    try {
      const { childId } = req.params;
      const { schoolId } = req;
      const userId = req.user?.userId;
      const filters = req.query;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const fees = await ParentService.getChildFees(
        childId,
        parent.id,
        schoolId!,
        filters
      );

      return res.status(200).json({
        success: true,
        fees,
      });
    } catch (error: any) {
      if (error.message === 'Child not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get child fees error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fees',
      });
    }
  }

  async getFeeSummary(req: Request, res: Response) {
    try {
      const { childId } = req.params;
      const { schoolId } = req;
      const userId = req.user?.userId;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const summary = await ParentService.getFeeSummary(
        childId,
        parent.id,
        schoolId!
      );

      return res.status(200).json({
        success: true,
        ...summary,
      });
    } catch (error: any) {
      if (error.message === 'Child not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get fee summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee summary',
      });
    }
  }

  // ============ Results ============

  async getChildResults(req: Request, res: Response) {
    try {
      const { childId } = req.params;
      const { schoolId } = req;
      const userId = req.user?.userId;
      const filters = req.query;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const results = await ParentService.getChildResults(
        childId,
        parent.id,
        schoolId!,
        filters
      );

      return res.status(200).json({
        success: true,
        results,
      });
    } catch (error: any) {
      if (error.message === 'Child not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get child results error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch results',
      });
    }
  }

  async getChildResult(req: Request, res: Response) {
    try {
      const { childId, examId } = req.params;
      const { schoolId } = req;
      const userId = req.user?.userId;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const result = await ParentService.getChildResult(
        childId,
        examId,
        parent.id,
        schoolId!
      );

      return res.status(200).json({
        success: true,
        result,
      });
    } catch (error: any) {
      if (error.message === 'Child not found' || error.message === 'Result not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get child result error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch result',
      });
    }
  }

  // ============ Teachers ============

  async getChildTeachers(req: Request, res: Response) {
    try {
      const { childId } = req.params;
      const { schoolId } = req;
      const userId = req.user?.userId;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const teachers = await ParentService.getChildTeachers(
        childId,
        parent.id,
        schoolId!
      );

      return res.status(200).json({
        success: true,
        teachers,
      });
    } catch (error: any) {
      if (error.message === 'Child not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get child teachers error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch teachers',
      });
    }
  }

  // ============ Profile ============

  async getProfile(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const userId = req.user?.userId;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const profile = await ParentService.getProfile(parent.id, schoolId!);

      return res.status(200).json({
        success: true,
        profile,
      });
    } catch (error: any) {
      if (error.message === 'Parent profile not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const userId = req.user?.userId;
      const data = req.body;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const profile = await ParentService.updateProfile(parent.id, schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile,
      });
    } catch (error: any) {
      if (error.message === 'Parent profile not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
      });
    }
  }

  // ============ Notices ============

  async getNotices(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const notices = await ParentService.getNotices(schoolId!, filters);

      return res.status(200).json({
        success: true,
        notices,
      });
    } catch (error) {
      console.error('Get notices error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notices',
      });
    }
  }

  async getNotice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const notice = await ParentService.getNotice(id, schoolId!);

      return res.status(200).json({
        success: true,
        notice,
      });
    } catch (error: any) {
      if (error.message === 'Notice not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get notice error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notice',
      });
    }
  }

  // ============ Messages ============

  async getMessages(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const userId = req.user?.userId;
      const filters = req.query;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const messages = await ParentService.getMessages(parent.id, schoolId!, filters);

      return res.status(200).json({
        success: true,
        messages,
      });
    } catch (error: any) {
      if (error.message === 'Parent not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get messages error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
      });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const userId = req.user?.userId;
      const data = req.body;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const message = await ParentService.sendMessage(parent.id, schoolId!, data);

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error: any) {
      if (error.message === 'Parent not found' || error.message === 'Receiver not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Send message error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send message',
      });
    }
  }

  async markMessageAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const userId = req.user?.userId;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      await ParentService.markMessageAsRead(id, parent.id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Message marked as read',
      });
    } catch (error: any) {
      if (error.message === 'Parent not found' || error.message === 'Message not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Mark message as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark message as read',
      });
    }
  }

  async deleteMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const userId = req.user?.userId;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      await ParentService.deleteMessage(id, parent.id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Parent not found' || error.message === 'Message not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete message error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete message',
      });
    }
  }

  // ============ Teacher Messages ============

  async sendTeacherMessage(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const userId = req.user?.userId;
      const data = req.body;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const message = await ParentService.sendTeacherMessage(parent.id, schoolId!, data);

      return res.status(201).json({
        success: true,
        message: 'Message sent to teacher successfully',
        data: message,
      });
    } catch (error: any) {
      if (error.message === 'Parent not found' || error.message === 'Teacher not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Send teacher message error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send message to teacher',
      });
    }
  }

  // ============ Payments ============

  async makePayment(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const userId = req.user?.userId;
      const data = req.body;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const result = await ParentService.makePayment(parent.id, schoolId!, data);

      return res.status(200).json({
        ...result,
      });
    } catch (error: any) {
      if (error.message === 'Parent not found' || 
          error.message === 'Child not found' || 
          error.message === 'Fee not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Make payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process payment',
      });
    }
  }

  async initiateOnlinePayment(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const userId = req.user?.userId;
      const data = req.body;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const result = await ParentService.initiateOnlinePayment(parent.id, schoolId!, data);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error.message === 'Parent not found' || 
          error.message === 'Child not found' || 
          error.message === 'Fee not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Initiate online payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate online payment',
      });
    }
  }

  // ============ Reports ============

  async getChildReport(req: Request, res: Response) {
    try {
      const { childId } = req.params;
      const { schoolId } = req;
      const userId = req.user?.userId;
      const { format } = req.query;

      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent profile not found',
        });
      }

      const report = await ParentService.getChildReport(
        childId,
        parent.id,
        schoolId!,
        format as string || 'pdf'
      );

      // TODO: Return actual PDF/CSV file
      return res.status(200).json({
        success: true,
        report,
      });
    } catch (error: any) {
      if (error.message === 'Parent not found' || error.message === 'Child not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get child report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate report',
      });
    }
  }
}

export default new ParentController();