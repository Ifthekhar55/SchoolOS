import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SchoolProvider } from './contexts/SchoolContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// Auth Pages
import { LoginPage } from './pages/Login';
import { SchoolSetupPage } from './pages/SchoolSetup';

// Admin Dashboards
import SchoolAdminDashboard from './pages/admin/SchoolAdminDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import { SchoolsPage } from './pages/Schools';

// Teacher Dashboard
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MyClasses from './pages/teacher/MyClasses';

// Parent Dashboard
import ParentDashboard from './pages/parent/ParentDashboard';

// All other pages
import { UsersPage } from './pages/Users';
import { StudentsPage } from './pages/Students';
import { TeachersPage } from './pages/Teachers';
import { ClassesPage } from './pages/Classes';
import { SubjectsPage } from './pages/Subjects';
import { AttendancePage } from './pages/Attendance';
import { ExamsPage } from './pages/Exams';
import { ResultsPage } from './pages/Results';
import { FeesPage } from './pages/Fees';
import { NoticesPage } from './pages/Notices';
import { CalendarPage } from './pages/Calendar';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { ParentPortal } from './pages/ParentPortal';

// Dashboard Router Component
function DashboardRouter() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'school_admin':
      return <SchoolAdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
    case 'parent':
      return <ParentDashboard />;
    default:
      return <SchoolAdminDashboard />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SchoolProvider>
          <PermissionProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<LoginPage />} />
              <Route
                path="/school-setup"
                element={
                  <ProtectedRoute>
                    <SchoolSetupPage />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard Route - Role-based */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />

              {/* Teacher My Classes */}
              <Route
                path="/my-classes"
                element={
                  <ProtectedRoute requiredRoles={['teacher']}>
                    <MyClasses />
                  </ProtectedRoute>
                }
              />

              {/* Student Management */}
              <Route
                path="/students/add"
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher']}>
                    <StudentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students"
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher']}>
                    <StudentsPage />
                  </ProtectedRoute>
                }
              />

              {/* Teacher Management */}
              <Route
                path="/teachers"
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'school_admin']}>
                    <TeachersPage />
                  </ProtectedRoute>
                }
              />

              {/* Class Management */}
              <Route
                path="/classes"
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'student']}>
                    <ClassesPage />
                  </ProtectedRoute>
                }
              />

              {/* Subject Management */}
              <Route
                path="/subjects"
                element={
                  <ProtectedRoute>
                    <SubjectsPage />
                  </ProtectedRoute>
                }
              />

              {/* Attendance */}
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher', 'student']}>
                    <AttendancePage />
                  </ProtectedRoute>
                }
              />

              {/* Exams */}
              <Route
                path="/exams"
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher', 'student']}>
                    <ExamsPage />
                  </ProtectedRoute>
                }
              />

              {/* Results */}
              <Route
                path="/results"
                element={
                  <ProtectedRoute>
                    <ResultsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fees */}
              <Route
                path="/fees"
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'accountant', 'student']}>
                    <FeesPage />
                  </ProtectedRoute>
                }
              />

              {/* Notices */}
              <Route
                path="/notices"
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher', 'student']}>
                    <NoticesPage />
                  </ProtectedRoute>
                }
              />

              {/* Calendar */}
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />

              {/* Schools */}
              <Route
                path="/schools"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <SchoolsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/school/:schoolId"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <SchoolsPage />
                  </ProtectedRoute>
                }
              />

              {/* Reports */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'school_admin']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'school_admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Users Management */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />

              {/* Parent Portal */}
              <Route
                path="/parent"
                element={
                  <ProtectedRoute requiredRoles={['parent']}>
                    <ParentPortal />
                  </ProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </PermissionProvider>
        </SchoolProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;