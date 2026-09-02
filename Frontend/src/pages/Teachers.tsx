import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Teacher } from '../types/teacher';
import { TeacherList } from '../components/teachers/TeacherList';
import { TeacherForm } from '../components/teachers/TeacherForm';
import { TeacherDetails } from '../components/teachers/TeacherDetails';
import { TeacherImport } from '../components/teachers/TeacherImport';
import { useAuth } from '../hooks/useAuth';
import { teacherApi } from '../services/teacherApi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const TeachersPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>();
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewProfile = params.get('viewProfile');

    if (viewProfile === 'true') {
      const openFirstTeacherProfile = async () => {
        try {
          const response = await teacherApi.getTeachers({ page: 1, limit: 1 });
          const firstTeacher = response.teachers?.[0];
          if (firstTeacher) {
            setViewingTeacher(firstTeacher);
            setShowDetails(true);
          }
        } catch (error) {
          console.error('Failed to open first teacher profile:', error);
        }
      };

      openFirstTeacherProfile();
    }
  }, [location.search]);

  const handleCreate = () => {
    setEditingTeacher(undefined);
    setShowForm(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleView = (teacher: Teacher) => {
    setViewingTeacher(teacher);
    setShowDetails(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingTeacher(undefined);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <TeacherList
            key={refreshKey}
            schoolId={user?.schoolId || ''}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onView={handleView}
            onImport={() => setShowImport(true)}
          />

          {showForm && (
            <TeacherForm
              teacher={editingTeacher}
              schoolId={user?.schoolId || ''}
              onClose={() => {
                setShowForm(false);
                setEditingTeacher(undefined);
              }}
              onSuccess={handleSuccess}
            />
          )}

          {showDetails && viewingTeacher && (
            <TeacherDetails
              teacher={viewingTeacher}
              onClose={() => {
                setShowDetails(false);
                setViewingTeacher(undefined);
              }}
              onEdit={() => {
                setShowDetails(false);
                handleEdit(viewingTeacher);
              }}
            />
          )}

          {showImport && (
            <TeacherImport
              schoolId={user?.schoolId || ''}
              onClose={() => setShowImport(false)}
              onSuccess={() => {
                setShowImport(false);
                setRefreshKey(prev => prev + 1);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};