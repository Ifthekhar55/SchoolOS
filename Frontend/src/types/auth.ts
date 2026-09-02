export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';
  schoolId: string;
  schoolName?: string;
  avatar?: string;
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'school_admin' | 'teacher' | 'student' | 'parent';
  schoolName?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  switchSchool: (schoolId: string) => void;
  refreshToken: () => Promise<string>;
}