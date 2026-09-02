import { Request, Response } from 'express';
import AttendanceService from '../services/attendanceService';

export class AttendanceController {
  // ============ Get Attendance ============

  async getAttendance(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const result = await AttendanceService.getAttendance(schoolId!, filters);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get attendance error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance',
      });
    }
  }

  async getClassAttendance(req: Request, res: Response) {
    try {
      const { classId, sectionId, date } = req.params;
      const { schoolId } = req;

      const result = await AttendanceService.getClassAttendance(
        classId,
        sectionId,
        date,
        schoolId!
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get class attendance error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch class attendance',
      });
    }
  }

  async getStudentAttendance(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { schoolId } = req;
      const { dateFrom, dateTo } = req.query;

      const result = await AttendanceService.getStudentAttendance(
        studentId,
        schoolId!,
        dateFrom as string,
        dateTo as string,
        req.user
      );

      return res.status(200).json({
        success: true,
        attendance: result,
      });
    } catch (error) {
      console.error('Get student attendance error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student attendance',
      });
    }
  }

  // ============ Mark Attendance ============

  async markAttendance(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { classId, sectionId, date, records } = req.body;
      const markedBy = req.user?.userId;

      if (!classId || !date || !records || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Class ID, date, and records are required',
        });
      }

      const result = await AttendanceService.markAttendance(
        schoolId!,
        { classId, sectionId, date, records },
        markedBy!
      );

      return res.status(200).json({
        success: true,
        message: 'Attendance marked successfully',
        records: result,
      });
    } catch (error: any) {
      console.error('Mark attendance error:', error);
      if (error.message === 'This date is a holiday') {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to mark attendance',
      });
    }
  }

  async markBulkAttendance(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { classId, sectionId, date, defaultStatus, records } = req.body;
      const markedBy = req.user?.userId;

      if (!classId || !date || !records || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Class ID, date, and records are required',
        });
      }

      const result = await AttendanceService.markBulkAttendance(
        schoolId!,
        { classId, sectionId, date, defaultStatus, records },
        markedBy!
      );

      return res.status(200).json({
        success: true,
        message: 'Bulk attendance marked successfully',
        records: result,
      });
    } catch (error: any) {
      console.error('Bulk mark attendance error:', error);
      if (error.message === 'This date is a holiday') {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to mark bulk attendance',
      });
    }
  }

  async updateAttendance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const { status, remarks } = req.body;

      const result = await AttendanceService.updateAttendance(id, schoolId!, {
        status,
        remarks,
      });

      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        attendance: result,
      });
    } catch (error: any) {
      console.error('Update attendance error:', error);
      if (error.message === 'Attendance record not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to update attendance',
      });
    }
  }

  // ============ Statistics ============

  async getAttendanceSummary(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { classId, sectionId, date } = req.query;

      const result = await AttendanceService.getAttendanceSummary(schoolId!, {
        classId,
        sectionId,
        date,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get attendance summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance summary',
      });
    }
  }

  async getAttendanceStatistics(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { classId, sectionId, dateFrom, dateTo } = req.query;

      const result = await AttendanceService.getAttendanceStatistics(schoolId!, {
        classId,
        sectionId,
        dateFrom,
        dateTo,
      });

      return res.status(200).json({
        success: true,
        statistics: result,
      });
    } catch (error) {
      console.error('Get attendance statistics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance statistics',
      });
    }
  }

  // ============ Notifications ============

  async notifyAbsentStudent(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { studentId, date } = req.body;

      if (!studentId || !date) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and date are required',
        });
      }

      const result = await AttendanceService.notifyAbsentStudent(
        schoolId!,
        studentId,
        date
      );
      const { success, ...resultData } = result;

      return res.status(200).json({
        success,
        ...resultData,
      });
    } catch (error) {
      console.error('Notify absent student error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send notification',
      });
    }
  }

  async notifyBulkAbsent(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { classId, sectionId, date } = req.body;

      if (!classId || !date) {
        return res.status(400).json({
          success: false,
          message: 'Class ID and date are required',
        });
      }

      const result = await AttendanceService.notifyBulkAbsent(
        schoolId!,
        classId,
        sectionId,
        date
      );
      const { success, ...resultData } = result;

      return res.status(200).json({
        success,
        ...resultData,
      });
    } catch (error) {
      console.error('Bulk notify absent error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send notifications',
      });
    }
  }

  // ============ QR/Biometric ============

  async scanQR(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'QR code is required',
        });
      }

      const result = await AttendanceService.scanQR(schoolId!, code);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error('Scan QR error:', error);
      if (error.message === 'Invalid QR code') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to scan QR code',
      });
    }
  }

  async verifyBiometric(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { studentId, biometricData } = req.body;

      if (!studentId || !biometricData) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and biometric data are required',
        });
      }

      const result = await AttendanceService.verifyBiometric(
        schoolId!,
        studentId,
        biometricData
      );
      const { success, ...resultData } = result;

      return res.status(200).json({
        success,
        ...resultData,
      });
    } catch (error: any) {
      console.error('Verify biometric error:', error);
      if (error.message === 'Student not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to verify biometric',
      });
    }
  }

  // ============ Holidays ============

  async getHolidays(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { year } = req.query;

      const result = await AttendanceService.getHolidays(
        schoolId!,
        year ? parseInt(year as string) : new Date().getFullYear()
      );

      return res.status(200).json({
        success: true,
        holidays: result,
      });
    } catch (error) {
      console.error('Get holidays error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch holidays',
      });
    }
  }

  async createHoliday(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      if (!data.name || !data.date) {
        return res.status(400).json({
          success: false,
          message: 'Name and date are required',
        });
      }

      const result = await AttendanceService.createHoliday(schoolId!, data);

      return res.status(201).json({
        success: true,
        message: 'Holiday created successfully',
        holiday: result,
      });
    } catch (error: any) {
      console.error('Create holiday error:', error);
      if (error.message === 'Holiday already exists on this date') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to create holiday',
      });
    }
  }

  async deleteHoliday(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await AttendanceService.deleteHoliday(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Holiday deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete holiday error:', error);
      if (error.message === 'Holiday not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to delete holiday',
      });
    }
  }

  // ============ Export ============

  async exportAttendance(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { classId, sectionId, dateFrom, dateTo, format } = req.query;

      const csvContent = await AttendanceService.exportAttendance(schoolId!, {
        classId,
        sectionId,
        dateFrom,
        dateTo,
        format: format || 'csv',
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=attendance_${Date.now()}.csv`
      );

      return res.status(200).send(csvContent);
    } catch (error) {
      console.error('Export attendance error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export attendance',
      });
    }
  }
}

export default new AttendanceController();