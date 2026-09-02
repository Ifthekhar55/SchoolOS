import { Request, Response } from 'express';
import NoticeService from '../services/noticeService';

export class NoticeController {
  // ============ Get Notices ============

  async getNotices(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const result = await NoticeService.getNotices(schoolId!, filters);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get notices error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notices',
      });
    }
  }

  async getPublishedNotices(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const notices = await NoticeService.getPublishedNotices(schoolId!, filters);

      return res.status(200).json({
        success: true,
        notices,
      });
    } catch (error) {
      console.error('Get published notices error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch published notices',
      });
    }
  }

  async getNotice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const notice = await NoticeService.getNotice(id, schoolId!);

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

  // ============ Create Notice ============

  async createNotice(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;
      const createdBy = req.user?.userId;

      const notice = await NoticeService.createNotice(schoolId!, data, createdBy!);

      return res.status(201).json({
        success: true,
        message: 'Notice created successfully',
        notice,
      });
    } catch (error) {
      console.error('Create notice error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create notice',
      });
    }
  }

  // ============ Update Notice ============

  async updateNotice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const notice = await NoticeService.updateNotice(id, schoolId!, data, req.user?.role);

      return res.status(200).json({
        success: true,
        message: 'Notice updated successfully',
        notice,
      });
    } catch (error: any) {
      if (error.message === 'Notice not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'Teachers cannot edit school admin notices') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update notice error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update notice',
      });
    }
  }

  // ============ Delete Notice ============

  async deleteNotice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await NoticeService.deleteNotice(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Notice deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Notice not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete notice error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete notice',
      });
    }
  }

  // ============ Publish/Unpublish ============

  async publishNotice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const notice = await NoticeService.publishNotice(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Notice published successfully',
        notice,
      });
    } catch (error: any) {
      if (error.message === 'Notice not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Publish notice error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to publish notice',
      });
    }
  }

  async unpublishNotice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const notice = await NoticeService.unpublishNotice(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Notice unpublished successfully',
        notice,
      });
    } catch (error: any) {
      if (error.message === 'Notice not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Unpublish notice error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to unpublish notice',
      });
    }
  }

  // ============ Archive ============

  async archiveNotice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const notice = await NoticeService.archiveNotice(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Notice archived successfully',
        notice,
      });
    } catch (error: any) {
      if (error.message === 'Notice not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Archive notice error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to archive notice',
      });
    }
  }

  // ============ Statistics ============

  async getStatistics(req: Request, res: Response) {
    try {
      const { schoolId } = req;

      const statistics = await NoticeService.getStatistics(schoolId!);

      return res.status(200).json({
        success: true,
        statistics,
      });
    } catch (error) {
      console.error('Get notice statistics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
      });
    }
  }

  // ============ Attachments ============

  async uploadAttachment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const result = await NoticeService.uploadAttachment(id, schoolId!, file);

      return res.status(200).json({
        success: true,
        message: 'Attachment uploaded successfully',
        ...result,
      });
    } catch (error: any) {
      if (error.message === 'Notice not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Upload attachment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload attachment',
      });
    }
  }

  async deleteAttachment(req: Request, res: Response) {
    try {
      const { id, filename } = req.params;
      const { schoolId } = req;

      await NoticeService.deleteAttachment(id, filename, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Attachment deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Notice not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete attachment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete attachment',
      });
    }
  }

  // ============ Auto-Expire ============

  async autoExpireNotices(req: Request, res: Response) {
    try {
      const result = await NoticeService.autoExpireNotices();

      return res.status(200).json({
        success: true,
        message: `${result.expired} notices expired`,
        ...result,
      });
    } catch (error) {
      console.error('Auto-expire notices error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to auto-expire notices',
      });
    }
  }
}

export default new NoticeController();