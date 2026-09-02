export type FeeType = 
  | 'admission'
  | 'tuition'
  | 'exam'
  | 'transport'
  | 'library'
  | 'lab'
  | 'sports'
  | 'development'
  | 'other';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'overdue';
export type PaymentMethod = 'cash' | 'bank' | 'bkash' | 'nagad' | 'card' | 'online';

export interface FeeStructure {
  id: string;
  schoolId: string;
  name: string;
  nameBangla?: string;
  type: FeeType;
  classId?: string;
  className?: string;
  amount: number;
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'one_time';
  dueDay?: number; // Day of month when due
  lateFee: number;
  lateFeeAfterDays: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Fee {
  id: string;
  schoolId: string;
  studentId: string;
  studentName?: string;
  studentRoll?: number;
  classId: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  feeStructureId: string;
  feeName: string;
  type: FeeType;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  lateFee: number;
  totalAmount: number;
  month?: string;
  year?: number;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;
  isPaid: boolean;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  studentRoll: number;
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  lateFee: number;
  discount: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  status: PaymentStatus;
  dueDate: Date;
  issuedDate: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  feeId: string;
  feeName: string;
  type: FeeType;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  month?: string;
  year?: number;
  isActive: boolean;
}

export interface Payment {
  id: string;
  schoolId: string;
  studentId: string;
  studentName?: string;
  invoiceId?: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  reference?: string;
  paymentDate: Date;
  notes?: string;
  receivedBy?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeeData {
  studentId: string;
  feeStructureId: string;
  amount: number;
  dueDate: Date;
  month?: string;
  year?: number;
  notes?: string;
}

export interface FeeFilters {
  search?: string;
  studentId?: string;
  classId?: string;
  sectionId?: string;
  status?: PaymentStatus;
  type?: FeeType;
  month?: string;
  year?: number;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface FeeStatistics {
  totalCollected: number;
  totalDue: number;
  totalOverdue: number;
  collectionRate: number;
  byStatus: {
    paid: number;
    partial: number;
    unpaid: number;
    overdue: number;
  };
  byType: Array<{
    type: FeeType;
    amount: number;
    count: number;
  }>;
  monthly: Array<{
    month: string;
    collected: number;
    due: number;
  }>;
  topDefaulters: Array<{
    studentId: string;
    studentName: string;
    dueAmount: number;
  }>;
}

export interface BulkFeeData {
  classId: string;
  sectionId?: string;
  feeStructureId: string;
  month: string;
  year: number;
  dueDate: Date;
}