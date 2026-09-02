import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent' | 'accountant'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', {
    path: location.pathname,
    isAuthenticated,
    isLoading,
    role: user?.role,
    requiredRoles,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedRole = user?.role?.trim().toLowerCase();

  if (requiredRoles.length > 0 && user && !requiredRoles.includes(normalizedRole as typeof requiredRoles[number])) {
    console.log('Insufficient permissions, redirecting to dashboard', {
      role: user.role,
      requiredRoles,
    });
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};