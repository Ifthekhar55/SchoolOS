import React, { useState } from 'react';
import { Class } from '../types/class';
import { ClassList } from '../components/classes/ClassList';
import { ClassForm } from '../components/classes/ClassForm';
import { useAuth } from '../hooks/useAuth';
import { ProtectedComponent } from '../components/ProtectedComponent';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setEditingClass(undefined);
    setShowForm(true);
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingClass(undefined);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <ClassList
            key={refreshKey}
            schoolId={user?.schoolId || ''}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onView={(classItem) => console.log('View class:', classItem)}
          />

          {showForm && (
            <ClassForm
              classItem={editingClass}
              schoolId={user?.schoolId || ''}
              onClose={() => {
                setShowForm(false);
                setEditingClass(undefined);
              }}
              onSuccess={handleSuccess}
            />
          )}
        </main>
      </div>
    </div>
  );
};