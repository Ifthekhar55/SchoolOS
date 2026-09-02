import React from 'react';
import { settingsApi } from '../../services/settingsApi';

export const FeeSettings: React.FC = () => { const [currency, setCurrency] = React.useState('BDT'); const save = async () => { await settingsApi.updateFeeSettings({ currency }); }; return <section className="space-y-4"><h2 className="text-lg font-semibold text-slate-900">Fee Settings</h2><input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency" className="w-full rounded-md border border-slate-200 p-2 text-sm" /><button type="button" onClick={save} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">Save</button></section>; };
