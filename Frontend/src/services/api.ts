import { AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage on service creation
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token');
  }

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    
    // Only set Content-Type if not FormData
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Important for cookies
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Handle specific status codes
        if (response.status === 401) {
          // Token expired or invalid
          this.setToken(null);
          localStorage.removeItem('user');
          
          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }

        // Extract error message from response
        const errorMessage = data?.message || data?.error || 'Something went wrong';
        throw new ApiError(errorMessage, response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network errors or other fetch errors
      if (error instanceof Error) {
        throw new ApiError(error.message, 0);
      }
      
      throw new ApiError('An unexpected error occurred', 500);
    }
  }

  // ============ Auth Endpoints ============

  private normalizeUser(user: User): User {
    return {
      ...user,
      role: user.role?.trim().toLowerCase() as User['role'],
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Store token and user data
      if (response.token) {
        this.setToken(response.token);
      }
      
      if (response.user) {
        response.user = this.normalizeUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      // Re-throw with user-friendly message
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error('Invalid email or password. Please try again.');
        }
        if (error.status === 429) {
          throw new Error('Too many login attempts. Please wait a few minutes and try again.');
        }
        throw new Error(error.message || 'Login failed. Please try again.');
      }
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Store token and user data
      if (response.token) {
        this.setToken(response.token);
      }
      
      if (response.user) {
        response.user = this.normalizeUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new Error(error.message || 'An account with this email already exists.');
        }
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local data
      this.setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
    }
  }

  async refreshToken(): Promise<{ token: string }> {
    try {
      const response = await this.request<{ token: string }>('/auth/refresh', {
        method: 'POST',
      });
      
      if (response.token) {
        this.setToken(response.token);
      }
      
      return { token: response.token };
    } catch (error) {
      // If refresh fails, clear everything
      this.setToken(null);
      localStorage.removeItem('user');
      throw error;
    }
  }

  // ============ Protected Endpoints ============

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.request<(User & { success: boolean }) | { success: boolean; user: User }>('/auth/me');
      const user = this.normalizeUser('user' in response ? response.user : response);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        this.setToken(null);
        localStorage.removeItem('user');
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  }

  // ============ User Management Endpoints ============

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const response = await this.request<{
      users: User[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/users?${queryParams.toString()}`);
    return response;
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(data: any): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async activateUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}/deactivate`, {
      method: 'POST',
    });
  }

  async assignRole(userId: string, roleId: string): Promise<User> {
    return this.request<User>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleId }),
    });
  }

  // ============ School Endpoints ============

  async getSchools(): Promise<any[]> {
    try {
      const response = await this.request<{ schools: any[]; success: boolean }>('/schools');
      return response.schools || [];
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      return [];
    }
  }

  async getSchool(id: string): Promise<any> {
    const response = await this.request<{ school: any; success: boolean }>(`/schools/${id}`);
    return response.school;
  }

  async createSchool(data: any): Promise<any> {
    const response = await this.request<{ school: any; success: boolean; message: string }>('/schools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.school;
  }

  async updateSchool(id: string, data: any): Promise<any> {
    const response = await this.request<{ school: any; success: boolean; message: string }>(`/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.school;
  }

  async deleteSchool(id: string): Promise<void> {
    await this.request<void>(`/schools/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Academic Endpoints (to be implemented) ============

  async getClasses(schoolId: string, academicYearId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (academicYearId) {
      params.append('academicYearId', academicYearId);
    }
    const response = await this.request<{ classes: any[]; success: boolean }>(
      `/schools/${schoolId}/classes?${params.toString()}`
    );
    return response.classes || [];
  }

  async createClass(schoolId: string, data: any): Promise<any> {
    const response = await this.request<{ class: any; success: boolean; message: string }>(
      `/schools/${schoolId}/classes`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.class;
  }

  async getSubjects(schoolId: string): Promise<any[]> {
    const response = await this.request<{ subjects: any[]; success: boolean }>(
      `/schools/${schoolId}/subjects`
    );
    return response.subjects || [];
  }

  async createSubject(schoolId: string, data: any): Promise<any> {
    const response = await this.request<{ subject: any; success: boolean; message: string }>(
      `/schools/${schoolId}/subjects`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.subject;
  }

  // ============ Attendance Endpoints ============

  async getAttendance(params: {
    schoolId: string;
    classId?: string;
    sectionId?: string;
    date?: string;
    studentId?: string;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, String(value));
      }
    });
    const response = await this.request<{ attendance: any[]; success: boolean }>(
      `/attendance?${queryParams.toString()}`
    );
    return response.attendance || [];
  }

  async markAttendance(data: {
    schoolId: string;
    classId: string;
    sectionId: string;
    date: string;
    records: Array<{
      studentId: string;
      status: 'present' | 'absent' | 'late' | 'leave';
    }>;
  }): Promise<any> {
    const response = await this.request<{ success: boolean; message: string }>(
      '/attendance',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response;
  }

  // ============ Exam Endpoints ============

  async getExams(params: {
    schoolId: string;
    classId?: string;
    academicYearId?: string;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, String(value));
      }
    });
    const response = await this.request<{ exams: any[]; success: boolean }>(
      `/exams?${queryParams.toString()}`
    );
    return response.exams || [];
  }

  async createExam(data: any): Promise<any> {
    const response = await this.request<{ exam: any; success: boolean; message: string }>(
      '/exams',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.exam;
  }

  // ============ Fee Endpoints ============

  async getFees(params: {
    schoolId: string;
    studentId?: string;
    classId?: string;
    status?: 'paid' | 'unpaid' | 'partial';
    month?: string;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, String(value));
      }
    });
    const response = await this.request<{ fees: any[]; success: boolean }>(
      `/fees?${queryParams.toString()}`
    );
    return response.fees || [];
  }

  async createFee(data: any): Promise<any> {
    const response = await this.request<{ fee: any; success: boolean; message: string }>(
      '/fees',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.fee;
  }

  async collectFee(id: string, data: { amount: number; paymentMethod: string; transactionId?: string }): Promise<any> {
    const response = await this.request<{ fee: any; success: boolean; message: string }>(
      `/fees/${id}/collect`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.fee;
  }

  // ============ Report Endpoints ============

  async getReport(params: {
    schoolId: string;
    type: 'attendance' | 'fee' | 'exam' | 'student';
    startDate?: string;
    endDate?: string;
    classId?: string;
    format?: 'pdf' | 'csv' | 'excel';
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, String(value));
      }
    });
    return this.request<any>(`/reports?${queryParams.toString()}`);
  }

  // ============ Helper Methods ============

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getSchoolIdFromStorage(): string | null {
    const user = this.getCurrentUserFromStorage();
    return user?.schoolId || null;
  }

  // Handle API errors with proper user feedback
  handleError(error: unknown): string {
    if (error instanceof ApiError) {
      // Map status codes to user-friendly messages
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'Your session has expired. Please login again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'This resource already exists.';
        case 422:
          return 'Validation failed. Please check your input.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'An internal server error occurred. Please try again later.';
        default:
          return error.message || 'An unexpected error occurred';
      }
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUserFromStorage();
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Check if user has the permission
    return user.permissions?.includes(permission) || false;
  }

  // Check if user has any of the specified roles
  hasRole(roles: string | string[]): boolean {
    const user = this.getCurrentUserFromStorage();
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }
}

export const api = new ApiService();