import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { parentApi } from '../../services/parentApi';
import { Message } from '../../types/parent';

interface TeacherCommunicationProps {
  childId: string;
}

export const TeacherCommunication: React.FC<TeacherCommunicationProps> = ({ childId }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    parentApi.getMessages().then(setMessages).catch(error => console.error('Failed to load messages:', error));
  }, [childId]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">Teacher Communication</h2>
      </div>
      {messages.length === 0 ? (
        <p className="text-sm text-slate-500">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map(message => (
            <article key={message.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <h3 className="font-medium text-slate-900">{message.subject}</h3>
              <p className="mt-1 text-sm text-slate-600">{message.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
