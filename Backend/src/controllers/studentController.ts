import { Request, Response } from 'express';
import StudentService from '../services/studentService';
import { StudentService as StudentServiceType } from '../services/studentService';

export class StudentController {
  async getStudents(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;
      
      const result = await StudentService.getStudents(schoolId!, filters, req.user);
      
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get students error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch students',
      });
    }
  }

  async getStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const student = await StudentService.getStudent(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        student,
      });
    } catch (error: any) {
      if (error.message === 'Student not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get student error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student',
      });
    }
  }

  async createStudent(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;
      
      const student = await StudentService.createStudent({
        ...data,
        schoolId,
        createdBy: req.user?.userId,
      });
      
      return res.status(201).json({
        success: true,
        message: 'Student created successfully',
        student,
      });
    } catch (error: any) {
      console.error('Create student error:', error);
      const isClientError = error?.code === 'P2002' || error?.name === 'PrismaClientValidationError';
      return res.status(isClientError ? 400 : 500).json({
        success: false,
        message: isClientError
          ? error.message || 'Invalid student information'
          : 'Failed to create student',
      });
    }
  }

  async getStudentLoginAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const loginAccount = await StudentService.getStudentLoginAccount(schoolId!, id);

      return res.status(200).json({
        success: true,
        ...loginAccount,
      });
    } catch (error: any) {
      if (error.message === 'Student not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      console.error('Get student login account error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch student login account' });
    }
  }

  async resetStudentPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const { password } = req.body || {};

      const result = await StudentService.resetStudentPassword(schoolId!, id, password);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error.message === 'Student not found' || error.message === 'No student login account found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      console.error('Reset student password error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to reset student password' });
    }
  }

  async updateStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;
      
      const student = await StudentService.updateStudent(id, schoolId!, data);
      
      return res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        student,
      });
    } catch (error: any) {
      if (error.message === 'Student not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update student error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update student',
      });
    }
  }

  async deleteStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      await StudentService.deleteStudent(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Student deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Student not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete student error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete student',
      });
    }
  }

  async activateStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const student = await StudentService.activateStudent(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Student activated successfully',
        student,
      });
    } catch (error: any) {
      if (error.message === 'Student not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Activate student error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to activate student',
      });
    }
  }

  async deactivateStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      
      const student = await StudentService.deactivateStudent(id, schoolId!);
      
      return res.status(200).json({
        success: true,
        message: 'Student deactivated successfully',
        student,
      });
    } catch (error: any) {
      if (error.message === 'Student not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Deactivate student error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to deactivate student',
      });
    }
  }

  async importStudents(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { students } = req.body;
      
      if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No students data provided',
        });
      }
      
      const result = await StudentService.importStudents(schoolId!, students);
      const { success: importedCount, ...importResult } = result;
      
      return res.status(200).json({
        success: true,
        message: `Imported ${importedCount} students, failed ${result.failed}`,
        successCount: importedCount,
        ...importResult,
      });
    } catch (error) {
      console.error('Import students error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to import students',
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
          message: 'No student IDs provided',
        });
      }
      
      const result = await StudentService.bulkDelete(schoolId!, ids);
      
      return res.status(200).json({
        success: true,
        message: `Deleted ${result.deleted} students`,
        ...result,
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete students',
      });
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      
      const statistics = await StudentService.getStatistics(schoolId!);
      
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

  async getStudentsByClass(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const { schoolId } = req;
      
      const students = await StudentService.getStudentsByClass(schoolId!, classId);
      
      return res.status(200).json({
        success: true,
        students,
      });
    } catch (error) {
      console.error('Get students by class error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch students',
      });
    }
  }

  async exportStudents(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;
      
      // Get all students without pagination
      const result = await StudentService.getStudents(schoolId!, {
        ...filters,
        limit: 99999,
        page: 1,
      });
      
      // Create CSV
      const headers = [
        'Name', 'Name (Bangla)', 'Email', 'Phone', 'Father\'s Name', 'Mother\'s Name',
        'Class', 'Section', 'Roll Number', 'Gender', 'Address', 'Emergency Contact'
      ];
      
      const rows = result.students.map((student: any) => [
        student.name,
        student.nameBangla || '',
        student.email || '',
        student.phone || '',
        student.fatherName,
        student.motherName,
        student.class,
        student.section || '',
        student.rollNumber,
        student.gender,
        student.address,
        student.emergencyContact,
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map((row: string[]) => row.join(',')),
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=students_${Date.now()}.csv`);
      
      return res.status(200).send(csvContent);
    } catch (error) {
      console.error('Export students error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export students',
      });
    }
  }
}

export default new StudentController();