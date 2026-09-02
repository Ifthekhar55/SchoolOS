import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { parentApi } from '../../services/parentApi';
import { Notice } from '../../types/parent';

export const Notices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    parentApi.getNotices().then(setNotices).catch(error => console.error('Failed to load notices:', error));
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">School Notices</h2>
      </div>
      {notices.length === 0 ? (
        <p className="text-sm text-slate-500">No notices available.</p>
      ) : (
        <div className="space-y-3">
          {notices.map(notice => (
            <article key={notice.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <h3 className="font-medium text-slate-900">{notice.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{notice.content}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
