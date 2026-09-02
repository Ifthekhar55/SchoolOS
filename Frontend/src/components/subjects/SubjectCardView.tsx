import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  User,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Award,
  BarChart3,
  Eye,
  RefreshCw,
  Search,
  Filter,
  School,
} from 'lucide-react';
import { Subject, SubjectWithClasses, ClassSubjectDetail } from '../../types/subject';
import { subjectApi } from '../../services/subjectApi';
import { SubjectClassDetails } from './SubjectClassDetails';
import { useAuth } from '../../hooks/useAuth';

interface SubjectCardViewProps {
  onSubjectSelect?: (subjectId: string) => void;
}

export const SubjectCardView: React.FC<SubjectCardViewProps> = ({ onSubjectSelect }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectWithClasses | null>(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectApi.getSubjects({
        search: searchTerm || undefined,
        isActive: filterActive,
        limit: 999,
      });
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = async (subjectId: string) => {
    try {
      setLoading(true);
      const data = await subjectApi.getSubjectWithClasses(subjectId);
      setSelectedSubject(data);
      setShowClassDetails(true);
      if (onSubjectSelect) onSubjectSelect(subjectId);
    } catch (error) {
      console.error('Failed to load subject details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectColor = (name: string) => {
    const colors = {
      'Bangla': 'bg-red-100 border-red-300 text-red-700',
      'English': 'bg-blue-100 border-blue-300 text-blue-700',
      'Math': 'bg-emerald-100 border-emerald-300 text-emerald-700',
      'Science': 'bg-purple-100 border-purple-300 text-purple-700',
      'Social': 'bg-orange-100 border-orange-300 text-orange-700',
      'ICT': 'bg-cyan-100 border-cyan-300 text-cyan-700',
      'Religion': 'bg-indigo-100 border-indigo-300 text-indigo-700',
      'Physical': 'bg-lime-100 border-lime-300 text-lime-700',
      'Arts': 'bg-pink-100 border-pink-300 text-pink-700',
    };
    return colors[name as keyof typeof colors] || 'bg-slate-100 border-slate-300 text-slate-700';
  };

  const getSubjectEmoji = (name: string) => {
    const emojis: Record<string, string> = {
      'Bangla': '📖',
      'English': '📚',
      'Math': '📐',
      'Science': '🔬',
      'Social': '🌍',
      'ICT': '💻',
      'Religion': '🕌',
      'Physical': '🏃',
      'Arts': '🎨',
    };
    return emojis[name] || '📘';
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.nameBangla?.includes(searchTerm) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Subjects</h2>
          <p className="text-sm text-slate-500">
            Click on a subject to view class-wise details
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSubjects}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className="inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadSubjects()}
              placeholder="Search by subject name or code..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <select
          value={filterActive !== undefined ? String(filterActive) : ''}
          onChange={(e) => {
            const value = e.target.value;
            setFilterActive(value === '' ? undefined : value === 'true');
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Subjects</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          onClick={loadSubjects}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Apply
        </button>
      </div>

      {/* Subject Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-semibold text-slate-900">No subjects found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Subjects will appear here once they are created
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSubjects.map((subject) => {
            const colorClass = getSubjectColor(subject.name);
            const emoji = getSubjectEmoji(subject.name);

            return (
              <div
                key={subject.id}
                onClick={() => handleSubjectClick(subject.id)}
                className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl ${colorClass}`}>
                      {emoji}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {subject.name}
                      </h3>
                      {subject.nameBangla && (
                        <p className="text-xs text-slate-500">{subject.nameBangla}</p>
                      )}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={20} className="text-slate-400" />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    subject.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {subject.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-[10px] text-slate-400">{subject.code}</span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">Click to view classes</span>
                  <Eye size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subject Class Details Modal */}
      {showClassDetails && selectedSubject && (
        <SubjectClassDetails
          subject={selectedSubject}
          onClose={() => {
            setShowClassDetails(false);
            setSelectedSubject(null);
          }}
        />
      )}
    </div>
  );
};