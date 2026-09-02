import React from 'react';
import { settingsApi } from '../../services/settingsApi';

export const BackupSettings: React.FC = () => { const [loading, setLoading] = React.useState(false); const createBackup = async () => { setLoading(true); try { const result = await settingsApi.createBackup(); window.open(result.downloadUrl, '_blank'); } finally { setLoading(false); } }; return <section className="space-y-4"><h2 className="text-lg font-semibold text-slate-900">Backup & Restore</h2><button type="button" onClick={createBackup} disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{loading ? 'Creating...' : 'Create backup'}</button></section>; };
