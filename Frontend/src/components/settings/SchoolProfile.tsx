import React, { useEffect, useState } from 'react';
import { settingsApi } from '../../services/settingsApi';

export const SchoolProfile: React.FC = () => {
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [message, setMessage] = useState('');
  useEffect(() => { settingsApi.getSettings().then((data) => setProfile((data as any).schoolProfile || {})).catch(console.error); }, []);
  const save = async () => { await settingsApi.updateSchoolProfile(profile); setMessage('Saved'); };
  return <section className="space-y-4"><h2 className="text-lg font-semibold text-slate-900">School Profile</h2><input value={String(profile.name || '')} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="School name" className="w-full rounded-md border border-slate-200 p-2 text-sm" /><button type="button" onClick={save} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save {message}</button></section>;
};
