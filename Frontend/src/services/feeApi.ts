import { api } from './api';
import {
  Fee,
  Invoice,
  Payment,
  FeeStructure,
  FeeFilters,
  FeeStatistics,
  CreateFeeData,
  BulkFeeData,
} from '../types/fee';

class FeeApiService {
  // ============ Fee Structures ============

  async getFeeStructures(params?: { classId?: string; type?: string }): Promise<FeeStructure[]> {
    const queryParams = new URLSearchParams();
    if (params?.classId) queryParams.append('classId', params.classId);
    if (params?.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    const response = await api.request<{ success: boolean; structures?: FeeStructure[]; data?: FeeStructure[] }>(
      `/fees/fee-structures${queryString ? `?${queryString}` : ''}`
    );

    return response?.structures ?? response?.data ?? [];
  }

  async getFeeStructure(id: string): Promise<FeeStructure> {
    const response = await api.request<{ success: boolean; structure?: FeeStructure; data?: FeeStructure }>(
      `/fees/fee-structures/${id}`
    );

    return response?.structure ?? response?.data as FeeStructure;
  }

  async createFeeStructure(data: any): Promise<FeeStructure> {
    const response = await api.request<{ success: boolean; structure?: FeeStructure; data?: FeeStructure }>(
      '/fees/fee-structures', {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    return response?.structure ?? response?.data as FeeStructure;
  }

  async updateFeeStructure(id: string, data: any): Promise<FeeStructure> {
    const response = await api.request<{ success: boolean; structure?: FeeStructure; data?: FeeStructure }>(
      `/fees/fee-structures/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );

    return response?.structure ?? response?.data as FeeStructure;
  }

  async deleteFeeStructure(id: string): Promise<void> {
    return api.request<void>(`/fees/fee-structures/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Fees ============

  async getFees(filters?: FeeFilters): Promise<{ fees: Fee[]; total: number; page: number; limit: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<any>(`/fees?${params.toString()}`);
  }

  async getFee(id: string): Promise<Fee> {
    return api.request<Fee>(`/fees/${id}`);
  }

  async getStudentFees(studentId: string, filters?: FeeFilters): Promise<Fee[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<Fee[]>(`/students/${studentId}/fees?${params.toString()}`);
  }

  async createFee(data: CreateFeeData): Promise<Fee> {
    return api.request<Fee>('/fees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createBulkFees(data: BulkFeeData): Promise<{ success: boolean; message: string; count: number }> {
    return api.request<{ success: boolean; message: string; count: number }>('/fees/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFee(id: string, data: any): Promise<Fee> {
    return api.request<Fee>(`/fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFee(id: string): Promise<void> {
    return api.request<void>(`/fees/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Invoices ============

  async getInvoices(filters?: FeeFilters): Promise<{ invoices: Invoice[]; total: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<any>(`/invoices?${params.toString()}`);
  }

  async getInvoice(id: string): Promise<Invoice> {
    return api.request<Invoice>(`/invoices/${id}`);
  }

  async generateInvoice(studentId: string, month: string, year: number): Promise<Invoice> {
    return api.request<Invoice>('/invoices/generate', {
      method: 'POST',
      body: JSON.stringify({ studentId, month, year }),
    });
  }

  async generateBulkInvoices(classId: string, sectionId: string, month: string, year: number): Promise<{ success: boolean; message: string; count: number }> {
    return api.request<{ success: boolean; message: string; count: number }>('/invoices/bulk-generate', {
      method: 'POST',
      body: JSON.stringify({ classId, sectionId, month, year }),
    });
  }

  async sendInvoice(id: string): Promise<{ success: boolean; message: string }> {
    return api.request<{ success: boolean; message: string }>(`/invoices/${id}/send`, {
      method: 'POST',
    });
  }

  // ============ Payments ============

  async getPayments(filters?: any): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<Payment[]>(`/fees/payments?${params.toString()}`);
  }

  async getPayment(id: string): Promise<Payment> {
    return api.request<Payment>(`/fees/payments/${id}`);
  }

  async processPayment(data: {
    studentId: string;
    invoiceId?: string;
    feeId?: string;
    amount: number;
    method: string;
    transactionId?: string;
    notes?: string;
  }): Promise<Payment> {
    return api.request<Payment>('/fees/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(id: string, data: any): Promise<Payment> {
    return api.request<Payment>(`/fees/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePayment(id: string): Promise<void> {
    return api.request<void>(`/fees/payments/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Statistics ============

  async getStatistics(params?: {
    classId?: string;
    sectionId?: string;
    month?: string;
    year?: number;
  }): Promise<FeeStatistics> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await api.request<{ statistics?: FeeStatistics; success: boolean }>(
      `/fees/statistics?${queryParams.toString()}`
    );

    return response.statistics ?? (response as unknown as FeeStatistics);
  }

  // ============ Reports ============

  async exportReport(params: {
    classId?: string;
    sectionId?: string;
    month?: string;
    year?: number;
    status?: string;
    format?: 'pdf' | 'csv' | 'excel';
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, String(value));
      }
    });
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/fees/export?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${api.getToken()}`,
        },
      }
    );
    return response.blob();
  }

  // ============ Online Payment Integration ============

  async initiateOnlinePayment(data: {
    studentId: string;
    amount: number;
    invoiceId?: string;
    gateway: 'bkash' | 'nagad' | 'sslcommerz';
  }): Promise<{ paymentUrl: string; transactionId: string }> {
    return api.request<{ paymentUrl: string; transactionId: string }>('/fees/payments/online/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOnlinePayment(transactionId: string): Promise<{ success: boolean; status: string; data: any }> {
    return api.request<{ success: boolean; status: string; data: any }>(`/fees/payments/online/verify/${transactionId}`, {
      method: 'POST',
    });
  }
}

export const feeApi = new FeeApiService();