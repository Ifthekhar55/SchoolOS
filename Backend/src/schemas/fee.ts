import { z } from 'zod';

const money = z.coerce.number().finite().nonnegative();

export const createFeeSchema = z.object({
  studentId: z.string().trim().min(1),
  feeStructureId: z.string().trim().min(1),
  amount: money,
  lateFee: money.optional(),
  month: z.string().trim().optional(),
  year: z.coerce.number().int().optional(),
  dueDate: z.coerce.date(),
}).passthrough();

export const processPaymentSchema = z.object({
  studentId: z.string().trim().min(1),
  invoiceId: z.string().trim().min(1).optional(),
  feeId: z.string().trim().min(1).optional(),
  amount: money,
  method: z.enum(['cash', 'bank', 'bkash', 'nagad', 'card', 'online']),
  transactionId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
}).passthrough();

export const updatePaymentSchema = processPaymentSchema.partial();
