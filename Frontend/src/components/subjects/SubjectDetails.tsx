import React from 'react';
import { X, Edit, BookOpen } from 'lucide-react';
import { Subject } from '../../types/subject';

interface SubjectDetailsProps {
  subject: Subject;
  onClose: () => void;
  onEdit: () => void;
}

export const SubjectDetails: React.FC<SubjectDetailsProps> = ({ subject, onClose, onEdit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-600" size={20} />
          <h2 className="text-lg font-semibold text-slate-900">{subject.name}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-2 text-slate-400 hover:bg-slate-100">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-3 p-5 text-sm text-slate-600">
        <p><strong className="text-slate-900">Code:</strong> {subject.code}</p>
        <p><strong className="text-slate-900">Class:</strong> {subject.className || subject.classId}</p>
        <p><strong className="text-slate-900">Teacher:</strong> {subject.teacherName || 'Not assigned'}</p>
        <p><strong className="text-slate-900">Credit hours:</strong> {subject.creditHours}</p>
        <p><strong className="text-slate-900">Type:</strong> {subject.isCompulsory ? 'Compulsory' : 'Optional'}</p>
        {subject.description && <p><strong className="text-slate-900">Description:</strong> {subject.description}</p>}
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
        <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600">Close</button>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"><Edit size={16} /> Edit</button>
      </div>
    </div>
  </div>
);
