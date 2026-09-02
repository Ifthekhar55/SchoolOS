import React from 'react';
import { settingsApi } from '../../services/settingsApi';

export const GradeSettings: React.FC = () => { const [scale, setScale] = React.useState('5'); const save = async () => { await settingsApi.updateGradeSettings({ gradePointScale: Number(scale) }); }; return <section className="space-y-4"><h2 className="text-lg font-semibold text-slate-900">Grade Settings</h2><input type="number" value={scale} onChange={(e) => setScale(e.target.value)} placeholder="Grade point scale" className="w-full rounded-md border border-slate-200 p-2 text-sm" /><button type="button" onClick={save} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save</button></section>; };
