import React from 'react';
import { School, BookOpen, Users, Award } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle = 'Smart School Management System' 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-2">
          {/* Left Side - Form */}
          <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                  <School className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">SchoolOS</h1>
                  <p className="text-xs text-slate-500">Smart School Management</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
              {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
            </div>

            {children}
          </div>

          {/* Right Side - Branding */}
          <div className="relative hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-12 lg:flex lg:flex-col lg:justify-center">
            <div className="relative z-10 text-white">
              <div className="mb-8 flex items-center gap-3">
                <School className="h-10 w-10" />
                <div>
                  <h2 className="text-3xl font-bold">SchoolOS</h2>
                  <p className="text-sm text-blue-200">Bangladesh Edition</p>
                </div>
              </div>

              <h3 className="mb-6 text-4xl font-bold leading-tight">
                Manage Your School<br />
                <span className="text-blue-200">Effortlessly</span>
              </h3>

              <ul className="space-y-4">
                {[
                  { icon: Users, text: 'Student & Teacher Management' },
                  { icon: BookOpen, text: 'Attendance & Grade Tracking' },
                  { icon: Award, text: 'Exam & Results Management' },
                  { icon: School, text: 'Parent & Fee Management' },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{item.text}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-medium">
                  🇧🇩 Built specifically for Bangladeshi schools
                </p>
                <p className="mt-1 text-xs text-blue-200">
                  BDT Currency • Bengali Support • bKash/Nagad Integration
                </p>
              </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
};