export type UserRole = 
  | 'super_admin'
  | 'school_admin'
  | 'principal'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant'
  | 'librarian'
  | 'transport_manager'
  | 'hr_manager';

export type Permission = 
  // User Management
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'users:activate'
  | 'users:deactivate'
  | 'users:assign_role'
  // Student Management
  | 'students:view'
  | 'students:create'
  | 'students:edit'
  | 'students:delete'
  | 'students:import'
  // Teacher Management
  | 'teachers:view'
  | 'teachers:create'
  | 'teachers:edit'
  | 'teachers:delete'
  // Academic
  | 'classes:view'
  | 'classes:create'
  | 'classes:edit'
  | 'classes:delete'
  | 'subjects:view'
  | 'subjects:create'
  | 'subjects:edit'
  | 'subjects:delete'
  // Attendance
  | 'attendance:view'
  | 'attendance:mark'
  | 'attendance:report'
  // Exams & Results
  | 'exams:view'
  | 'exams:create'
  | 'exams:edit'
  | 'exams:delete'
  | 'results:view'
  | 'results:enter'
  | 'results:publish'
  // Fee Management
  | 'fees:view'
  | 'fees:create'
  | 'fees:edit'
  | 'fees:delete'
  | 'fees:collect'
  | 'fees:report'
  // School Settings
  | 'settings:view'
  | 'settings:edit'
  // Reports
  | 'reports:view'
  | 'reports:create'
  | 'reports:export'
    // Notices
    | 'notices:view'
    | 'notices:create'
    | 'notices:edit'
    | 'notices:publish'
    | 'notices:archive'
    | 'notices:delete'
  // System
  | 'system:manage';

export interface Role {
  id: string;
  name: UserRole;
  displayName: string;
  displayNameBangla: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  nameBangla?: string;
  email: string;
  phone: string;
  role: UserRole;
  roleId: string;
  schoolId: string;
  schoolName?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  avatar?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  joiningDate?: Date;
  department?: string;
  designation?: string;
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  permissions?: Permission[];
}

export interface UserFilters {
  role?: UserRole;
  schoolId?: string;
  isActive?: boolean;
  search?: string;
  department?: string;
  joiningDateFrom?: Date;
  joiningDateTo?: Date;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserData {
  name: string;
  nameBangla?: string;
  email: string;
  phone: string;
  role: UserRole;
  schoolId: string;
  password: string;
  confirmPassword: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  joiningDate?: Date;
  department?: string;
  designation?: string;
  emergencyContact?: string;
}

export interface UpdateUserData {
  name?: string;
  nameBangla?: string;
  phone?: string;
  role?: UserRole;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  department?: string;
  designation?: string;
  emergencyContact?: string;
  isActive?: boolean;
}

export interface CreateRoleData {
  name: UserRole;
  displayName: string;
  displayNameBangla: string;
  description: string;
  permissions: Permission[];
}

export interface UpdateRoleData {
  displayName?: string;
  displayNameBangla?: string;
  description?: string;
  permissions?: Permission[];
}

export interface PermissionContextType {
  user: User | null;
  permissions: Permission[];
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isLoading: boolean;
  checkAccess: (permission: Permission, fallback?: React.ReactNode) => React.ReactNode;
}