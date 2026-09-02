import { Request, Response } from 'express';
import FeeService from '../services/feeService';

export class FeeController {
  // ============ Fee Structures ============

  async getFeeStructures(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const structures = await FeeService.getFeeStructures(schoolId!, filters);

      return res.status(200).json({
        success: true,
        structures,
      });
    } catch (error) {
      console.error('Get fee structures error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee structures',
      });
    }
  }

  async getFeeStructure(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const structure = await FeeService.getFeeStructure(id, schoolId!);

      return res.status(200).json({
        success: true,
        structure,
      });
    } catch (error: any) {
      if (error.message === 'Fee structure not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get fee structure error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee structure',
      });
    }
  }

  async createFeeStructure(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const structure = await FeeService.createFeeStructure(schoolId!, data);

      return res.status(201).json({
        success: true,
        message: 'Fee structure created successfully',
        structure,
      });
    } catch (error) {
      console.error('Create fee structure error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create fee structure',
      });
    }
  }

  async updateFeeStructure(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const structure = await FeeService.updateFeeStructure(id, schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Fee structure updated successfully',
        structure,
      });
    } catch (error: any) {
      if (error.message === 'Fee structure not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update fee structure error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update fee structure',
      });
    }
  }

  async deleteFeeStructure(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await FeeService.deleteFeeStructure(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Fee structure deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Fee structure not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete fee structure error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete fee structure',
      });
    }
  }

  // ============ Fees ============

  async getFees(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const result = await FeeService.getFees(schoolId!, filters, req.user);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get fees error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fees',
      });
    }
  }

  async getFee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const fee = await FeeService.getFee(id, schoolId!);

      return res.status(200).json({
        success: true,
        fee,
      });
    } catch (error: any) {
      if (error.message === 'Fee not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get fee error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee',
      });
    }
  }

  async getStudentFees(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { schoolId } = req;
      const filters = req.query;

      const fees = await FeeService.getStudentFees(studentId, schoolId!, filters);

      return res.status(200).json({
        success: true,
        fees,
      });
    } catch (error) {
      console.error('Get student fees error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student fees',
      });
    }
  }

  async createFee(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const fee = await FeeService.createFee(schoolId!, data);

      return res.status(201).json({
        success: true,
        message: 'Fee created successfully',
        fee,
      });
    } catch (error: any) {
      if (error.message === 'Student not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Create fee error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create fee',
      });
    }
  }

  async createBulkFees(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const result = await FeeService.createBulkFees(schoolId!, data);
      const { success, ...resultData } = result;

      return res.status(201).json({
        success,
        ...resultData,
      });
    } catch (error: any) {
      console.error('Create bulk fees error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create bulk fees',
      });
    }
  }

  async updateFee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const fee = await FeeService.updateFee(id, schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Fee updated successfully',
        fee,
      });
    } catch (error: any) {
      if (error.message === 'Fee not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update fee error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update fee',
      });
    }
  }

  async deleteFee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await FeeService.deleteFee(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Fee deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Fee not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete fee error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete fee',
      });
    }
  }

  // ============ Invoices ============

  async getInvoices(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const result = await FeeService.getInvoices(schoolId!, filters);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get invoices error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch invoices',
      });
    }
  }

  async getInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const invoice = await FeeService.getInvoice(id, schoolId!);

      return res.status(200).json({
        success: true,
        invoice,
      });
    } catch (error: any) {
      if (error.message === 'Invoice not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get invoice error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch invoice',
      });
    }
  }

  async generateInvoice(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const invoice = await FeeService.generateInvoice(studentId, schoolId!, data);

      return res.status(201).json({
        success: true,
        message: 'Invoice generated successfully',
        invoice,
      });
    } catch (error: any) {
      console.error('Generate invoice error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate invoice',
      });
    }
  }

  async generateBulkInvoices(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const result = await FeeService.generateBulkInvoices(schoolId!, data);
      const { success, ...resultData } = result;

      return res.status(201).json({
        success,
        ...resultData,
      });
    } catch (error) {
      console.error('Generate bulk invoices error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate bulk invoices',
      });
    }
  }

  async sendInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const result = await FeeService.sendInvoice(id, schoolId!);
      const { success, ...resultData } = result;

      return res.status(200).json({
        success,
        ...resultData,
      });
    } catch (error: any) {
      if (error.message === 'Invoice not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Send invoice error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send invoice',
      });
    }
  }

  // ============ Payments ============

  async getPayments(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const result = await FeeService.getPayments(schoolId!, filters);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get payments error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payments',
      });
    }
  }

  async getPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const payment = await FeeService.getPayment(id, schoolId!);

      return res.status(200).json({
        success: true,
        payment,
      });
    } catch (error: any) {
      if (error.message === 'Payment not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment',
      });
    }
  }

  async processPayment(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;
      const receivedBy = req.user?.userId;

      const payment = await FeeService.processPayment(schoolId!, data, receivedBy!);

      return res.status(201).json({
        success: true,
        message: 'Payment processed successfully',
        payment,
      });
    } catch (error) {
      console.error('Process payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process payment',
      });
    }
  }

  async updatePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const payment = await FeeService.updatePayment(id, schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Payment updated successfully',
        payment,
      });
    } catch (error: any) {
      if (error.message === 'Payment not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update payment',
      });
    }
  }

  async deletePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await FeeService.deletePayment(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Payment deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Payment not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete payment',
      });
    }
  }

  // ============ Online Payments ============

  async initiateOnlinePayment(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;

      const result = await FeeService.initiateOnlinePayment(schoolId!, data);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Initiate online payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate online payment',
      });
    }
  }

  async verifyOnlinePayment(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;

      const result = await FeeService.verifyOnlinePayment(transactionId);
      const { success, ...resultData } = result;

      return res.status(200).json({
        success,
        ...resultData,
      });
    } catch (error) {
      console.error('Verify online payment error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify online payment',
      });
    }
  }

  // ============ Statistics ============

  async getStatistics(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const statistics = await FeeService.getStatistics(schoolId!, filters, req.user);

      return res.status(200).json({
        success: true,
        statistics,
      });
    } catch (error) {
      console.error('Get fee statistics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee statistics',
      });
    }
  }

  // ============ Export ============

  async exportReport(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const csvContent = await FeeService.exportReport(schoolId!, filters);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=fee_report_${Date.now()}.csv`
      );

      return res.status(200).send(csvContent);
    } catch (error) {
      console.error('Export fee report error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export fee report',
      });
    }
  }
}

export default new FeeController();