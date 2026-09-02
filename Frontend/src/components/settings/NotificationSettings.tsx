import React from 'react';
import { settingsApi } from '../../services/settingsApi';

export const NotificationSettings: React.FC = () => { const [enabled, setEnabled] = React.useState(true); const save = async () => { await settingsApi.updateNotificationSettings({ emailNotifications: enabled }); }; return <section className="space-y-4"><h2 className="text-lg font-semibold text-slate-900">Notifications</h2><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Email notifications</label><button type="button" onClick={save} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save</button></section>; };
