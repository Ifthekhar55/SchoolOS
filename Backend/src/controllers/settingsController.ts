import { Request, Response } from 'express';
import SettingsService from '../services/settingsService';
import multer from 'multer';
import path from 'path';

// Configure multer for logo upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
    }
  },
});

export class SettingsController {
  // ============ Get Settings ============

  async getSettings(req: Request, res: Response) {
    try {
      const { schoolId } = req;

      const settings = await SettingsService.getSettings(schoolId!);

      return res.status(200).json({
        success: true,
        ...settings,
      });
    } catch (error) {
      console.error('Get settings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch settings',
      });
    }
  }

  // ============ School Profile ============

  async updateSchoolProfile(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const settings = await SettingsService.updateSchoolProfile(schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'School profile updated successfully',
        school: settings.schoolProfile,
      });
    } catch (error: any) {
      if (error.message === 'Settings not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update school profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update school profile',
      });
    }
  }

  async uploadLogo(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const result = await SettingsService.uploadLogo(schoolId!, file);

      return res.status(200).json({
        success: true,
        message: 'Logo uploaded successfully',
        ...result,
      });
    } catch (error: any) {
      if (error.message === 'Settings not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Upload logo error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload logo',
      });
    }
  }

  // ============ Academic Settings ============

  async updateAcademicSettings(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const settings = await SettingsService.updateAcademicSettings(schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Academic settings updated successfully',
        academic: settings.academic,
      });
    } catch (error: any) {
      if (error.message === 'Settings not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update academic settings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update academic settings',
      });
    }
  }

  // ============ Terms ============

  async createTerm(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const term = await SettingsService.createTerm(schoolId!, data);

      return res.status(201).json({
        success: true,
        message: 'Term created successfully',
        term,
      });
    } catch (error) {
      console.error('Create term error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create term',
      });
    }
  }

  async updateTerm(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const term = await SettingsService.updateTerm(id, schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Term updated successfully',
        term,
      });
    } catch (error: any) {
      if (error.message === 'Term not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update term error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update term',
      });
    }
  }

  async deleteTerm(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await SettingsService.deleteTerm(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Term deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Term not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete term error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete term',
      });
    }
  }

  // ============ Fee Settings ============

  async updateFeeSettings(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const settings = await SettingsService.updateFeeSettings(schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Fee settings updated successfully',
        fees: settings.fees,
      });
    } catch (error: any) {
      if (error.message === 'Settings not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update fee settings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update fee settings',
      });
    }
  }

  // ============ Grade Settings ============

  async updateGradeSettings(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const settings = await SettingsService.updateGradeSettings(schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Grade settings updated successfully',
        grades: settings.grades,
      });
    } catch (error: any) {
      if (error.message === 'Settings not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update grade settings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update grade settings',
      });
    }
  }

  // ============ Grades ============

  async createGrade(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const grade = await SettingsService.createGrade(schoolId!, data);

      return res.status(201).json({
        success: true,
        message: 'Grade created successfully',
        grade,
      });
    } catch (error) {
      console.error('Create grade error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create grade',
      });
    }
  }

  async updateGrade(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const grade = await SettingsService.updateGrade(id, schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Grade updated successfully',
        grade,
      });
    } catch (error: any) {
      if (error.message === 'Grade not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update grade error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update grade',
      });
    }
  }

  async deleteGrade(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await SettingsService.deleteGrade(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Grade deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Grade not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete grade error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete grade',
      });
    }
  }

  // ============ Notification Settings ============

  async updateNotificationSettings(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const settings = await SettingsService.updateNotificationSettings(schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Notification settings updated successfully',
        notifications: settings.notifications,
      });
    } catch (error: any) {
      if (error.message === 'Settings not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update notification settings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update notification settings',
      });
    }
  }

  // ============ System Settings ============

  async updateSystemSettings(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const settings = await SettingsService.updateSystemSettings(schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'System settings updated successfully',
        system: settings.system,
      });
    } catch (error: any) {
      if (error.message === 'Settings not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update system settings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update system settings',
      });
    }
  }

  // ============ Backup Settings ============

  async updateBackupSettings(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const settings = await SettingsService.updateBackupSettings(schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Backup settings updated successfully',
        backup: settings.backup,
      });
    } catch (error: any) {
      if (error.message === 'Settings not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update backup settings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update backup settings',
      });
    }
  }

  async createBackup(req: Request, res: Response) {
    try {
      const { schoolId } = req;

      const result = await SettingsService.createBackup(schoolId!);

      return res.status(200).json({
        ...result,
        success: true,
      });
    } catch (error) {
      console.error('Create backup error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create backup',
      });
    }
  }

  async restoreBackup(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No backup file uploaded',
        });
      }

      const result = await SettingsService.restoreBackup(schoolId!, file);

      return res.status(200).json({
        ...result,
        success: true,
      });
    } catch (error) {
      console.error('Restore backup error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to restore backup',
      });
    }
  }

  // ============ System Health ============

  async getSystemHealth(req: Request, res: Response) {
    try {
      const { schoolId } = req;

      const health = await SettingsService.getSystemHealth(schoolId!);

      return res.status(200).json({
        success: true,
        ...health,
      });
    } catch (error) {
      console.error('Get system health error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get system health',
      });
    }
  }
}

export default new SettingsController();