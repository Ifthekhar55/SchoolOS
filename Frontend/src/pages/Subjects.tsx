import React, { useState } from 'react';
import { Subject } from '../types/subject';
import { SubjectList } from '../components/subjects/SubjectList';
import { SubjectForm } from '../components/subjects/SubjectForm';
import { SubjectDetails } from '../components/subjects/SubjectDetails';
import { SubjectSectionList } from '../components/subjects/SubjectSectionList';
import { ProtectedComponent } from '../components/ProtectedComponent';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const SubjectsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>();
  const [viewingSubject, setViewingSubject] = useState<Subject | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = (classId?: string) => {
    setSelectedClassId(classId || '');
    setEditingSubject(undefined);
    setShowForm(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setSelectedClassId(subject.classId);
    setShowForm(true);
  };

  const handleView = (subject: Subject) => {
    setViewingSubject(subject);
    setShowDetails(true);
  };

  if (selectedSubject) {
    return (
      <SubjectSectionList
        subject={selectedSubject}
        onBack={() => setSelectedSubject(undefined)}
      />
    );
  }

  const handleSuccess = () => {
    setShowForm(false);
    setEditingSubject(undefined);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <SubjectList
            key={refreshKey}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onView={handleView}
            onSubjectSelect={setSelectedSubject}
          />

          {showForm && (
            <SubjectForm
              subject={editingSubject}
              classId={selectedClassId}
              onClose={() => {
                setShowForm(false);
                setEditingSubject(undefined);
                setSelectedClassId('');
              }}
              onSuccess={handleSuccess}
            />
          )}

          {showDetails && viewingSubject && (
            <SubjectDetails
              subject={viewingSubject}
              onClose={() => {
                setShowDetails(false);
                setViewingSubject(undefined);
              }}
              onEdit={() => {
                setShowDetails(false);
                handleEdit(viewingSubject);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};