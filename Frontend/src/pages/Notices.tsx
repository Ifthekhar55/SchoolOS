import React, { useState } from 'react';
import { Notice } from '../types/notice';
import { NoticeList } from '../components/notices/NoticeList';
import { NoticeForm } from '../components/notices/NoticeForm';
import { NoticeDetails } from '../components/notices/NoticeDetails';
import { ProtectedComponent } from '../components/ProtectedComponent';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const NoticesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | undefined>();
  const [viewingNotice, setViewingNotice] = useState<Notice | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setEditingNotice(undefined);
    setShowForm(true);
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setShowForm(true);
  };

  const handleView = (notice: Notice) => {
    setViewingNotice(notice);
    setShowDetails(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingNotice(undefined);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <NoticeList
            key={refreshKey}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onView={handleView}
          />

          {showForm && (
            <NoticeForm
              notice={editingNotice}
              onClose={() => {
                setShowForm(false);
                setEditingNotice(undefined);
              }}
              onSuccess={handleSuccess}
            />
          )}

          {showDetails && viewingNotice && (
            <NoticeDetails
              notice={viewingNotice}
              onClose={() => {
                setShowDetails(false);
                setViewingNotice(undefined);
              }}
              onEdit={() => {
                setShowDetails(false);
                handleEdit(viewingNotice);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};