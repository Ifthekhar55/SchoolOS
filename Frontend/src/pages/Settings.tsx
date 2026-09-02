import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  DollarSign,
  Award,
  Bell,
  Settings as SettingsIcon,
  Database,
  UserCog,
  ChevronRight,
} from 'lucide-react';
import { SchoolProfile } from '../components/settings/SchoolProfile';
import { AcademicSettings } from '../components/settings/AcademicSettings';
import { FeeSettings } from '../components/settings/FeeSettings';
import { GradeSettings } from '../components/settings/GradeSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SystemSettings } from '../components/settings/SystemSettings';
import { BackupSettings } from '../components/settings/BackupSettings';
import { UserManagementSettings } from '../components/settings/UserManagementSettings';
import { useAuth } from '../hooks/useAuth';
import { ProtectedComponent } from '../components/ProtectedComponent';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const settingsMenu = [
  { id: 'profile', label: 'School Profile', icon: Building2 },
  { id: 'academic', label: 'Academic Settings', icon: Calendar },
  { id: 'fees', label: 'Fee Settings', icon: DollarSign },
  { id: 'grades', label: 'Grade Settings', icon: Award },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'system', label: 'System Settings', icon: SettingsIcon },
  { id: 'backup', label: 'Backup & Restore', icon: Database },
  { id: 'users', label: 'User Management', icon: UserCog },
];

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <SchoolProfile />;
      case 'academic':
        return <AcademicSettings />;
      case 'fees':
        return <FeeSettings />;
      case 'grades':
        return <GradeSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'system':
        return <SystemSettings />;
      case 'backup':
        return <BackupSettings />;
      case 'users':
        return <UserManagementSettings />;
      default:
        return <SchoolProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your school's configuration and preferences
              </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="lg:w-64 flex-shrink-0">
                <div className="sticky top-6 space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                  {settingsMenu.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                          {item.label}
                        </span>
                        {isActive && <ChevronRight size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};