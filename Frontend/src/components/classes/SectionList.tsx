import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Users,
  RefreshCw,
} from 'lucide-react';
import { ClassSubject, Section } from '../../types/class';
import { classApi } from '../../services/classApi';
import { usePermissions } from '../../contexts/PermissionContext';
import { ClassStatusBadge } from './ClassStatusBadge';
import { SectionForm } from './SectionForm';
import { ProtectedComponent } from '../ProtectedComponent';

interface SectionListProps {
  classId: string;
  sections: Section[];
  classSubjects: ClassSubject[];
  onRefresh: () => void;
  schoolId: string;
}

export const SectionList: React.FC<SectionListProps> = ({
  classId,
  sections,
  classSubjects,
  onRefresh,
  schoolId,
}) => {
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | undefined>();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      await classApi.deleteSection(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  const handleToggleStatus = async (section: Section) => {
    try {
      if (section.isActive) {
        await classApi.deactivateSection(section.id);
      } else {
        await classApi.activateSection(section.id);
      }
      onRefresh();
    } catch (error) {
      console.error('Failed to toggle section status:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Users size={16} />
          Sections
        </h4>
        <ProtectedComponent permission="classes:create">
          <button
            onClick={() => setShowSectionForm(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Plus size={14} />
            Add Section
          </button>
        </ProtectedComponent>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-4 text-sm text-slate-500">
          No sections added yet
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-shadow hover:shadow-sm"
            >
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-medium text-slate-900">
                  Section {section.name}
                  {section.nameBangla && (
                    <span className="ml-1 text-xs text-slate-500">({section.nameBangla})</span>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>Code: {section.code}</span>
                  <span>Capacity: {section.capacity}</span>
                  {section.currentStudents !== undefined && (
                    <span>Students: {section.currentStudents}</span>
                  )}
                  {section.teacherName && (
                    <span>Teacher: {section.teacherName}</span>
                  )}
                  {section.roomNumber && (
                    <span>Room: {section.roomNumber}</span>
                  )}
                </div>
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-700">Subjects &amp; Course Teachers</p>
                  {classSubjects.filter((subject) => !subject.sectionId || subject.sectionId === section.id).length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {classSubjects
                        .filter((subject) => !subject.sectionId || subject.sectionId === section.id)
                        .map((subject) => (
                          <div key={subject.id} className="flex items-start justify-between gap-2 text-xs">
                            <span className="font-medium text-slate-700">
                              {subject.subject?.name || subject.subjectName || 'Subject'}
                            </span>
                            <span className="text-right text-slate-500">
                              {subject.teacher?.name || subject.teacherName || 'Teacher not assigned'}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">No subjects assigned.</p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <div className="shrink-0">
                  <ClassStatusBadge isActive={section.isActive} type="section" />
                </div>
                <ProtectedComponent permission="classes:edit">
                  <button
                    onClick={() => {
                      setEditingSection(section);
                      setShowSectionForm(true);
                    }}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Edit size={14} />
                  </button>
                </ProtectedComponent>
                <ProtectedComponent permission="classes:edit">
                  <button
                    onClick={() => handleToggleStatus(section)}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    {section.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                  </button>
                </ProtectedComponent>
                <ProtectedComponent permission="classes:delete">
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </ProtectedComponent>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section Form Modal */}
      {showSectionForm && (
        <SectionForm
          classId={classId}
          section={editingSection}
          onClose={() => {
            setShowSectionForm(false);
            setEditingSection(undefined);
          }}
          onSuccess={() => {
            setShowSectionForm(false);
            setEditingSection(undefined);
            onRefresh();
          }}
          schoolId={schoolId}
        />
      )}
    </div>
  );
};