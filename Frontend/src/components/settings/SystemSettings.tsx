import React from 'react';
import { settingsApi } from '../../services/settingsApi';

export const SystemSettings: React.FC = () => { const [timezone, setTimezone] = React.useState('Asia/Dhaka'); const save = async () => { await settingsApi.updateSystemSettings({ timezone }); }; return <section className="space-y-4"><h2 className="text-lg font-semibold text-slate-900">System Settings</h2><input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Timezone" className="w-full rounded-md border border-slate-200 p-2 text-sm" /><button type="button" onClick={save} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save</button></section>; };
