import React from 'react';
import { settingsApi } from '../../services/settingsApi';

export const AcademicSettings: React.FC = () => { const [name, setName] = React.useState(''); const save = async () => { await settingsApi.updateAcademicSettings({ sessionName: name }); }; return <section className="space-y-4"><h2 className="text-lg font-semibold text-slate-900">Academic Settings</h2><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Session name" className="w-full rounded-md border border-slate-200 p-2 text-sm" /><button type="button" onClick={save} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save</button></section>; };
