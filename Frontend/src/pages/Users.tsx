import React, { useState } from 'react';
import { UserForm } from '../components/users/UserForm';
import { User } from '../types/user';
import { UserList } from '../components/users/UserList';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const UsersPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setEditingUser(undefined);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingUser(undefined);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <UserList
            key={refreshKey}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onView={(user) => console.log('View user:', user)}
          />

          {showForm && (
            <UserForm
              user={editingUser}
              onClose={() => {
                setShowForm(false);
                setEditingUser(undefined);
              }}
              onSuccess={handleSuccess}
            />
          )}
        </main>
      </div>
    </div>
  );
};