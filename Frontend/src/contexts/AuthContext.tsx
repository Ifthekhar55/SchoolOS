import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, LoginCredentials, RegisterData, AuthContextType } from '../types/auth';
import { api, ApiError } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = api.getToken();
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 Initializing auth...');
      console.log('📦 Stored token:', storedToken ? 'Yes' : 'No');
      console.log('👤 Stored user:', storedUser ? 'Yes' : 'No');
      
      if (storedToken && storedUser) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
          setToken(storedToken);
          console.log('✅ User authenticated from storage');
        } catch (error) {
          console.error('Auth initialization failed:', error);
          api.setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('auth_token');
          setUser(null);
          setToken(null);
        }
      } else {
        console.log('⏳ No stored credentials found');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login...');
      const response = await api.login(credentials);
      console.log('✅ Login response:', response);
      
      setUser(response.user);
      setToken(response.token);
      
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('auth_token', response.token);
      
      console.log('✅ Login successful, redirecting to dashboard...');
      
      // Redirect to dashboard
      window.location.href = response.user.role === 'parent' ? '/parent' : '/dashboard';
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await api.register(data);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('auth_token', response.token);
      window.location.href = response.user.role === 'parent' ? '/parent' : '/dashboard';
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Proper logout function
  const logout = async () => {
    console.log('🚪 Logout called');
    try {
      // Try to call logout API
      await api.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // ⚠️ CRITICAL: Clear ALL localStorage items
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentSchoolId');
      
      // Clear any session storage
      sessionStorage.clear();
      
      // Reset state
      setUser(null);
      setToken(null);
      
      console.log('✅ Logout successful, redirecting to login...');
      
      // ⚠️ IMPORTANT: Use window.location.href for hard redirect
      // This ensures a full page reload and clears all React state
      window.location.href = '/login';
    }
  };

  const switchSchool = (schoolId: string) => {
    setUser(currentUser => currentUser ? { ...currentUser, schoolId } : currentUser);
    localStorage.setItem('currentSchoolId', schoolId);
  };

  const refreshToken = async () => {
    try {
      const { token: newToken } = await api.refreshToken();
      setToken(newToken);
      return newToken;
    } catch (error) {
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login: async (credentials) => {
      const response = await login(credentials);
      return response;
    },
    register,
    logout,
    switchSchool,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};