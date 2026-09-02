import { Request, Response } from 'express';
import ClassService from '../services/classService';

export class ClassController {
  // ============ Academic Years ============
  
  async getAcademicYears(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const years = await ClassService.getAcademicYears(schoolId!);
      
      return res.status(200).json({
        success: true,
        academicYears: years,
      });
    } catch (error) {
      console.error('Get academic years error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch academic years',
      });
    }
  }

  async createAcademicYear(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;
      
      const year = await ClassService.createAcademicYear(schoolId!, data);
      
      return res.status(201).json({
        success: true,
        message: 'Academic year created successfully',
        academicYear: year,
      });
    } catch (error) {
      console.error('Create academic year error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create academic year',
      });
    }
  }

  async updateAcademicYear(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;
      
      const year = await ClassService.updateAcademicYear(id, schoolId!, data);
      
      return res.status(200).json({
        success: true,
        message: 'Academic year updated successfully',
        academicYear: year,
      });
    } catch (error) {
      console.error('Update academic year error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update academic year',
      });
    }
  }

  async setCurrentAcademicYear(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const year = await ClassService.setCurrentAcademicYear(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Current academic year set successfully',
        academicYear: year,
      });
    } catch (error) {
      console.error('Set current academic year error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to set current academic year',
      });
    }
  }

  // ============ Classes ============

  async getClasses(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;
      
      const result = await ClassService.getClasses(schoolId!, filters, req.user);
      
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get classes error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch classes',
      });
    }
  }

  async getClass(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const classData = await ClassService.getClass(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        class: classData,
      });
    } catch (error: any) {
      if (error.message === 'Class not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get class error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch class',
      });
    }
  }

  async createClass(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;
      
      const classData = await ClassService.createClass(schoolId!, {
        ...data,
        createdBy: req.user?.userId,
      });
      
      return res.status(201).json({
        success: true,
        message: 'Class created successfully',
        class: classData,
      });
    } catch (error: any) {
      console.error('Create class error:', error);
      const isClientError = error?.code === 'P2002' || error?.code === 'P2003' || error?.name === 'PrismaClientValidationError';
      return res.status(isClientError ? 400 : 500).json({
        success: false,
        message: isClientError
          ? error.message || 'Invalid class information'
          : 'Failed to create class',
      });
    }
  }

  async updateClass(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;
      
      const classData = await ClassService.updateClass(id, schoolId!, data);
      
      return res.status(200).json({
        success: true,
        message: 'Class updated successfully',
        class: classData,
      });
    } catch (error: any) {
      if (error.message === 'Class not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update class error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update class',
      });
    }
  }

  async deleteClass(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      await ClassService.deleteClass(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Class deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Class not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete class error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete class',
      });
    }
  }

  async activateClass(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const classData = await ClassService.activateClass(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Class activated successfully',
        class: classData,
      });
    } catch (error: any) {
      if (error.message === 'Class not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Activate class error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to activate class',
      });
    }
  }

  async deactivateClass(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const classData = await ClassService.deactivateClass(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Class deactivated successfully',
        class: classData,
      });
    } catch (error: any) {
      if (error.message === 'Class not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Deactivate class error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate class',
      });
    }
  }

  async getClassStatistics(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      
      const statistics = await ClassService.getClassStatistics(schoolId!);
      
      return res.status(200).json({
        success: true,
        statistics,
      });
    } catch (error) {
      console.error('Get class statistics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
      });
    }
  }

  // ============ Sections ============

  async getSections(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { schoolId } = req;
      
      const result = await ClassService.getSections(classId, schoolId!, req.user);
      
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get sections error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sections',
      });
    }
  }

  async getSection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const section = await ClassService.getSection(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        section,
      });
    } catch (error: any) {
      if (error.message === 'Section not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get section error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch section',
      });
    }
  }

  async createSection(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { schoolId } = req;
      const data = req.body;
      
      const section = await ClassService.createSection(classId, schoolId!, data);
      
      return res.status(201).json({
        success: true,
        message: 'Section created successfully',
        section,
      });
    } catch (error: any) {
      if (error.message === 'Class not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Create section error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create section',
      });
    }
  }

  async updateSection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;
      
      const section = await ClassService.updateSection(id, schoolId!, data);
      
      return res.status(200).json({
        success: true,
        message: 'Section updated successfully',
        section,
      });
    } catch (error: any) {
      if (error.message === 'Section not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update section error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update section',
      });
    }
  }

  async deleteSection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      await ClassService.deleteSection(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Section deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Section not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'Section has related records and cannot be deleted') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete section error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete section',
      });
    }
  }

  async activateSection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const section = await ClassService.activateSection(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Section activated successfully',
        section,
      });
    } catch (error: any) {
      if (error.message === 'Section not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Activate section error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to activate section',
      });
    }
  }

  async deactivateSection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const section = await ClassService.deactivateSection(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Section deactivated successfully',
        section,
      });
    } catch (error: any) {
      if (error.message === 'Section not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Deactivate section error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate section',
      });
    }
  }

  // ============ Class Subjects ============

  async getClassSubjects(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { schoolId } = req;
      
      const subjects = await ClassService.getClassSubjects(classId, schoolId!);
      
      return res.status(200).json({
        success: true,
        subjects,
      });
    } catch (error) {
      console.error('Get class subjects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch class subjects',
      });
    }
  }

  async assignSubject(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { schoolId } = req;
      const data = req.body;
      
      const subject = await ClassService.assignSubject(classId, schoolId!, data);
      
      return res.status(201).json({
        success: true,
        message: 'Subject assigned successfully',
        subject,
      });
    } catch (error: any) {
      if (error.message === 'Class not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('already assigned')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Assign subject error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign subject',
      });
    }
  }

  async updateSubject(req: Request, res: Response) {
    try {
      const { classId, subjectId } = req.params;
      const { schoolId } = req;
      const data = req.body;
      data.sectionId = req.query.sectionId || data.sectionId;
      
      const subject = await ClassService.updateSubject(classId, subjectId, schoolId!, data);
      
      return res.status(200).json({
        success: true,
        message: 'Subject updated successfully',
        subject,
      });
    } catch (error: any) {
      if (error.message === 'Class subject not found') {
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

  async removeSubject(req: Request, res: Response) {
    try {
      const { classId, subjectId } = req.params;
      const { schoolId } = req;
      const sectionId = typeof req.query.sectionId === 'string' ? req.query.sectionId : undefined;
      
      await ClassService.removeSubject(classId, subjectId, schoolId!, sectionId);
      
      return res.status(200).json({
        success: true,
        message: 'Subject removed successfully',
      });
    } catch (error: any) {
      if (error.message === 'Class subject not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Remove subject error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove subject',
      });
    }
  }

  // ============ Helper Methods ============

  async getAvailableTeachers(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const teachers = await ClassService.getAvailableTeachers(schoolId!);
      
      return res.status(200).json({
        success: true,
        teachers,
      });
    } catch (error) {
      console.error('Get available teachers error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch teachers',
      });
    }
  }

  async getAvailableSubjects(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const subjects = await ClassService.getAvailableSubjects(schoolId!);
      
      return res.status(200).json({
        success: true,
        subjects,
      });
    } catch (error) {
      console.error('Get available subjects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subjects',
      });
    }
  }
}

export default new ClassController();