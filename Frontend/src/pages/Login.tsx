import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && !isLoading) {
    console.log('🔄 User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout 
      title={isLogin ? 'Welcome Back' : 'Create Account'}
      subtitle={isLogin 
        ? 'Sign in to manage your school' 
        : 'Start managing your school digitally'
      }
    >
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </AuthLayout>
  );
};