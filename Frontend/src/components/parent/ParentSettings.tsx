import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { parentApi } from '../../services/parentApi';
import { ParentProfile } from '../../types/parent';

export const ParentSettings: React.FC = () => {
  const [profile, setProfile] = useState<ParentProfile | null>(null);

  useEffect(() => {
    parentApi.getProfile().then(setProfile).catch(error => console.error('Failed to load profile:', error));
  }, []);

  const updateField = (field: 'name' | 'phone' | 'address' | 'occupation', value: string) => {
    setProfile(current => current ? { ...current, [field]: value } : current);
  };

  const saveProfile = async () => {
    if (profile) setProfile(await parentApi.updateProfile(profile));
  };

  if (!profile) return <p className="text-sm text-slate-500">Loading settings...</p>;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Parent Settings</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {(['name', 'phone', 'address', 'occupation'] as const).map(field => (
          <label key={field} className="text-sm font-medium capitalize text-slate-700">
            {field}
            <input
              value={profile[field] || ''}
              onChange={event => updateField(field, event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal outline-none focus:border-blue-500"
            />
          </label>
        ))}
      </div>
      <button onClick={saveProfile} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        <Save className="h-4 w-4" /> Save changes
      </button>
    </section>
  );
};
