import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Edit,
  X,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { schoolApi } from '../services/schoolApi';

interface School {
  id: string;
  name: string;
  nameBangla?: string;
  address: string;
  city: string;
  district: string;
  division: string;
  phone: string;
  email: string;
  subscriptionPlan: 'starter' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'trial';
  userCount?: number;
  createdAt: Date;
}

export const SchoolsPage: React.FC = () => {
  const navigate = useNavigate();
  const { schoolId } = useParams();

  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showSchoolDetails, setShowSchoolDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openMenuSchoolId, setOpenMenuSchoolId] = useState<string | null>(null);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoading(true);
        const data = await schoolApi.getSchools();
        setSchools(data || []);

        if (schoolId) {
          const matched = (data || []).find((school) => school.id === schoolId);
          if (matched) {
            setSelectedSchool(matched);
            setShowSchoolDetails(true);
          }
        }
      } catch (error) {
        console.error('Failed to load schools:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchools();
  }, [schoolId]);

  const filteredSchools = useMemo(() => {
    let result = [...schools];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((school) =>
        school.name?.toLowerCase().includes(term) ||
        school.nameBangla?.toLowerCase().includes(term) ||
        school.city?.toLowerCase().includes(term) ||
        school.email?.toLowerCase().includes(term)
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter((school) => school.status === filterStatus);
    }

    if (filterPlan !== 'all') {
      result = result.filter((school) => school.subscriptionPlan === filterPlan);
    }

    return result;
  }, [schools, searchTerm, filterStatus, filterPlan]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'trial':
        return 'bg-amber-100 text-amber-700';
      case 'inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700';
      case 'premium':
        return 'bg-blue-100 text-blue-700';
      case 'standard':
        return 'bg-emerald-100 text-emerald-700';
      case 'starter':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleViewSchool = (school: School) => {
    setSelectedSchool(school);
    setShowSchoolDetails(true);
    setOpenMenuSchoolId(null);
    navigate(`/school/${school.id}`);
  };

  const handleDeleteSchool = async (schoolId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();

    const schoolToDelete = schools.find((school) => school.id === schoolId);
    const confirmed = window.confirm(
      `Are you sure you want to delete "${schoolToDelete?.name || 'this school'}"? This action cannot be undone.`
    );

    if (!confirmed) {
      setOpenMenuSchoolId(null);
      return;
    }

    try {
      await schoolApi.deleteSchool(schoolId);
      setSchools((prevSchools) => prevSchools.filter((school) => school.id !== schoolId));
      setOpenMenuSchoolId(null);

      if (selectedSchool?.id === schoolId) {
        setSelectedSchool(null);
        setShowSchoolDetails(false);
        navigate('/schools');
      }
    } catch (error) {
      console.error('Failed to delete school:', error);
      alert('Failed to delete school. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">School List</h1>
            <p className="mt-1 text-sm text-slate-500">Manage all registered schools.</p>
          </div>

          <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[220px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by school name, city, email..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterPlan('all');
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>

              <span className="ml-auto text-sm text-slate-500">
                {filteredSchools.length} school{filteredSchools.length !== 1 ? 's' : ''}
              </span>
            </div>
          </section>

          {loading ? (
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSchools.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  No schools found
                </div>
              ) : (
                filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    onClick={() => handleViewSchool(school)}
                    className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
                        {school.name?.charAt(0).toUpperCase() || 'S'}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusColor(school.status)}`}>
                          {school.status?.charAt(0).toUpperCase() + school.status?.slice(1) || 'Unknown'}
                        </span>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenMenuSchoolId(openMenuSchoolId === school.id ? null : school.id);
                            }}
                            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`More actions for ${school.name}`}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openMenuSchoolId === school.id && (
                            <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                              <button
                                type="button"
                                onClick={(event) => handleDeleteSchool(school.id, event)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700">
                        {school.name || 'Unnamed School'}
                      </h3>
                      {school.nameBangla && (
                        <p className="mt-1 text-xs text-slate-500">{school.nameBangla}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </section>
          )}
        </main>
      </div>

      {showSchoolDetails && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-700">
                  {selectedSchool.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedSchool.name}</h2>
                  <p className="text-sm text-slate-500">
                    {selectedSchool.city}, {selectedSchool.district}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSchoolDetails(false);
                  setSelectedSchool(null);
                  navigate('/schools');
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500">School Details</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-slate-400" />
                      <span className="text-slate-700">{selectedSchool.email || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-slate-400" />
                      <span className="text-slate-700">{selectedSchool.phone || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="text-slate-700">{selectedSchool.address || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500">Subscription</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Plan</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPlanColor(selectedSchool.subscriptionPlan)}`}>
                        {selectedSchool.subscriptionPlan?.charAt(0).toUpperCase() + selectedSchool.subscriptionPlan?.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(selectedSchool.status)}`}>
                        {selectedSchool.status?.charAt(0).toUpperCase() + selectedSchool.status?.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Students</span>
                      <span className="font-medium text-slate-900">{selectedSchool.userCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  onClick={() => {
                    setShowSchoolDetails(false);
                    setSelectedSchool(null);
                    navigate('/schools');
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSchoolDetails(false);
                    setSelectedSchool(null);
                    navigate('/school-setup', { state: { editSchool: selectedSchool } });
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Edit size={16} className="inline mr-2" />
                  Edit School
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
