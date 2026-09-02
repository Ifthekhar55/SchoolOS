import { Router } from 'express';
import FeeController from '../controllers/feeController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

// ============ Statistics & Export (must come before /:id routes) ============
router.get('/statistics', FeeController.getStatistics);
router.get('/export', FeeController.exportReport);

// ============ Fee Structures ============
router.get('/fee-structures', FeeController.getFeeStructures);
router.get('/fee-structures/:id', FeeController.getFeeStructure);
router.post('/fee-structures', authorize('school_admin', 'accountant'), FeeController.createFeeStructure);
router.put('/fee-structures/:id', authorize('school_admin', 'accountant'), FeeController.updateFeeStructure);
router.delete('/fee-structures/:id', authorize('school_admin'), FeeController.deleteFeeStructure);

// ============ Fees ============
router.get('/', FeeController.getFees);
router.get('/:id', FeeController.getFee);
router.post('/', authorize('school_admin', 'accountant'), FeeController.createFee);
router.post('/bulk', authorize('school_admin', 'accountant'), FeeController.createBulkFees);
router.put('/:id', authorize('school_admin', 'accountant'), FeeController.updateFee);
router.delete('/:id', authorize('school_admin'), FeeController.deleteFee);

// ============ Student Fees ============
router.get('/students/:studentId/fees', FeeController.getStudentFees);

// ============ Invoices ============
router.get('/invoices', FeeController.getInvoices);
router.get('/invoices/:id', FeeController.getInvoice);
router.post('/invoices/generate', FeeController.generateInvoice);
router.post('/invoices/bulk-generate', authorize('school_admin', 'accountant'), FeeController.generateBulkInvoices);
router.post('/invoices/:id/send', authorize('school_admin', 'accountant'), FeeController.sendInvoice);

// ============ Payments ============
router.get('/payments', FeeController.getPayments);
router.get('/payments/:id', FeeController.getPayment);
router.post('/payments', authorize('school_admin', 'accountant'), FeeController.processPayment);
router.put('/payments/:id', authorize('school_admin', 'accountant'), FeeController.updatePayment);
router.delete('/payments/:id', authorize('school_admin'), FeeController.deletePayment);

// ============ Online Payments ============
router.post('/payments/online/initiate', FeeController.initiateOnlinePayment);
router.post('/payments/online/verify/:transactionId', FeeController.verifyOnlinePayment);

export default router;