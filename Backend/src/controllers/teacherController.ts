import { Request, Response } from 'express';
import TeacherService from '../services/teacherService';

export class TeacherController {
  async getMyClasses(req: Request, res: Response) {
    try {
      const classes = await TeacherService.getMyClasses(req.user?.userId!, req.schoolId!);
      return res.status(200).json({ success: true, classes });
    } catch (error) {
      console.error('Get teacher classes error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch teacher classes',
      });
    }
  }

  async getTeacherClasses(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const classes = await TeacherService.getTeacherClasses(schoolId!, id);
      return res.status(200).json({ success: true, classes });
    } catch (error) {
      console.error('Get teacher classes by id error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch teacher classes',
      });
    }
  }

  async getTeachers(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;
      
      const result = await TeacherService.getTeachers(schoolId!, filters);
      
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get teachers error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch teachers',
      });
    }
  }

  async getTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const teacher = await TeacherService.getTeacher(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        teacher,
      });
    } catch (error: any) {
      if (error.message === 'Teacher not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get teacher error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch teacher',
      });
    }
  }

  async createTeacher(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;
      
      const teacher = await TeacherService.createTeacher({
        ...data,
        schoolId,
        createdBy: req.user?.userId,
      });
      
      return res.status(201).json({
        success: true,
        message: 'Teacher created successfully',
        teacher,
      });
    } catch (error: any) {
      console.error('Create teacher error:', error);
      const isConflict = error?.code === 'P2002' || error?.message?.includes('already exists');
      const isValidationError = error?.name === 'PrismaClientValidationError';
      return res.status(isConflict ? 409 : isValidationError ? 400 : 500).json({
        success: false,
        message: isConflict
          ? error.message || 'Duplicate teacher information'
          : isValidationError
            ? error.message || 'Invalid teacher information'
            : 'Failed to create teacher',
      });
    }
  }

  async updateTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;
      
      const teacher = await TeacherService.updateTeacher(id, schoolId!, data);
      
      return res.status(200).json({
        success: true,
        message: 'Teacher updated successfully',
        teacher,
      });
    } catch (error: any) {
      if (error.message === 'Teacher not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update teacher error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update teacher',
      });
    }
  }

  async deleteTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      await TeacherService.deleteTeacher(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Teacher deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Teacher not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete teacher error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete teacher',
      });
    }
  }

  async activateTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const teacher = await TeacherService.activateTeacher(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Teacher activated successfully',
        teacher,
      });
    } catch (error: any) {
      if (error.message === 'Teacher not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Activate teacher error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to activate teacher',
      });
    }
  }

  async deactivateTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const teacher = await TeacherService.deactivateTeacher(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Teacher deactivated successfully',
        teacher,
      });
    } catch (error: any) {
      if (error.message === 'Teacher not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Deactivate teacher error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate teacher',
      });
    }
  }

  async importTeachers(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { teachers } = req.body;
      
      if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No teachers data provided',
        });
      }
      
      const result = await TeacherService.importTeachers(schoolId!, teachers);
      const { success: importedCount, ...importResult } = result;
      
      return res.status(200).json({
        success: true,
        message: `Imported ${importedCount} teachers, failed ${result.failed}`,
        successCount: importedCount,
        ...importResult,
      });
    } catch (error) {
      console.error('Import teachers error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to import teachers',
      });
    }
  }

  async exportTeachers(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;
      
      const result = await TeacherService.getTeachers(schoolId!, {
        ...filters,
        limit: 99999,
        page: 1,
      });
      
      const headers = [
        'Name', 'Name (Bangla)', 'Email', 'Phone', 'Employee ID',
        'Designation', 'Department', 'Qualification', 'Experience',
        'Specialization', 'Joining Date', 'Gender', 'Address', 'Emergency Contact'
      ];
      
      const rows = result.teachers.map((teacher: any) => [
        teacher.name,
        teacher.nameBangla || '',
        teacher.email,
        teacher.phone,
        teacher.employeeId,
        teacher.designation,
        teacher.department,
        teacher.qualification,
        teacher.experience || '',
        teacher.specialization || '',
        new Date(teacher.joiningDate).toLocaleDateString(),
        teacher.gender,
        teacher.address,
        teacher.emergencyContact,
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map((row: string[]) => row.join(',')),
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=teachers_${Date.now()}.csv`);
      
      return res.status(200).send(csvContent);
    } catch (error) {
      console.error('Export teachers error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export teachers',
      });
    }
  }

  async bulkDelete(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No teacher IDs provided',
        });
      }
      
      const result = await TeacherService.bulkDelete(schoolId!, ids);
      
      return res.status(200).json({
        success: true,
        message: `Deleted ${result.deleted} teachers`,
        ...result,
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete teachers',
      });
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      
      const statistics = await TeacherService.getStatistics(schoolId!);
      
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

  async getTeachersByDepartment(req: Request, res: Response) {
    try {
      const { department } = req.params;
      const { schoolId } = req;
      
      const teachers = await TeacherService.getTeachersByDepartment(schoolId!, department);
      
      return res.status(200).json({
        success: true,
        teachers,
      });
    } catch (error) {
      console.error('Get teachers by department error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch teachers',
      });
    }
  }

  async getAvailableTeachers(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      
      const teachers = await TeacherService.getAvailableTeachers(schoolId!);
      
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
}

export default new TeacherController();