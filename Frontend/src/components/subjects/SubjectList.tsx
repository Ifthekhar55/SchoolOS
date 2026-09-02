import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  BookOpen,
} from 'lucide-react';
import { Subject } from '../../types/subject';
import { subjectApi } from '../../services/subjectApi';
import { ProtectedComponent } from '../ProtectedComponent';

const normalizeSubjectName = (value: string) => (value || '').trim().toLowerCase();

interface SubjectListProps {
  onEdit: (subject: Subject) => void;
  onView: (subject: Subject) => void;
  onCreate: (classId?: string) => void;
  onSubjectSelect: (subject: Subject) => void;
}

export const SubjectList: React.FC<SubjectListProps> = ({
  onCreate,
  onSubjectSelect,
}) => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const subjectResponse = await subjectApi.getSubjects({ page: 1, limit: 999 });

      const uniqueMap = new Map<string, Subject>();

      (subjectResponse.subjects || []).forEach((subject) => {
        const normalizedName = normalizeSubjectName(subject.name);
        const key = normalizedName;
        const existing = uniqueMap.get(key);

        if (!existing) {
          uniqueMap.set(key, subject);
          return;
        }

        uniqueMap.set(key, {
          ...existing,
          ...subject,
          className: [existing.className, subject.className].filter(Boolean).join(', ') || existing.className,
          teacherName: existing.teacherName || subject.teacherName,
          isActive: existing.isActive || subject.isActive,
          isCompulsory: existing.isCompulsory || subject.isCompulsory,
        });
      });

      setSubjects(Array.from(uniqueMap.values()));
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.teacherName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Subjects</h2>
          <p className="text-sm text-slate-500">
            Manage all subjects across the school
          </p>
        </div>
        <ProtectedComponent permission="subjects:create">
          <button
            onClick={() => onCreate()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Subject
          </button>
        </ProtectedComponent>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by subject, class, or teacher..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">No subjects found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create subjects for your classes to get started
            </p>
            <ProtectedComponent permission="subjects:create">
              <button
                onClick={() => onCreate()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Subject
              </button>
            </ProtectedComponent>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredSubjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => onSubjectSelect(subject)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') onSubjectSelect(subject);
                }}
                className="flex min-h-24 items-center justify-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="text-lg font-semibold text-slate-900">{subject.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};