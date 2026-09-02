import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { parentApi } from '../../services/parentApi';
import { ChildResult } from '../../types/parent';
import { AttendanceStatusBadge } from '../attendance/AttendanceStatusBadge';

interface ChildResultsProps {
  childId: string;
}

export const ChildResults: React.FC<ChildResultsProps> = ({ childId }) => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ChildResult[]>([]);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<string>('');

  useEffect(() => {
    loadResults();
  }, [childId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await parentApi.getChildResults(childId);
      setResults(data);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'text-emerald-600',
      'A': 'text-emerald-500',
      'B': 'text-blue-600',
      'C': 'text-amber-600',
      'D': 'text-orange-600',
      'E': 'text-red-500',
      'F': 'text-red-700',
    };
    return colors[grade] || 'text-slate-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Results</h2>
          <p className="text-sm text-slate-500">
            Academic performance and exam results
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadResults}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} className="inline mr-2" />
            Refresh
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} className="inline mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Results Cards */}
      {results.length === 0 ? (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-2 text-slate-500">No results available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.examId}
              className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Exam Header */}
              <div
                className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedExam(expandedExam === result.examId ? null : result.examId)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {result.examName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {result.examType} • {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {result.percentage}%
                    </p>
                    <span className={`text-sm font-bold ${getGradeColor(result.grade)}`}>
                      {result.grade}
                    </span>
                  </div>
                  <div className="text-right">
                    <AttendanceStatusBadge status={result.isPassed ? 'present' : 'absent'} />
                  </div>
                  {expandedExam === result.examId ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedExam === result.examId && (
                <div className="border-t border-slate-100 p-4 bg-slate-50">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-200">
                      <p className="text-xs text-slate-500">Total Marks</p>
                      <p className="text-lg font-bold text-slate-900">
                        {result.obtainedMarks}/{result.totalMarks}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-200">
                      <p className="text-xs text-slate-500">GPA</p>
                      <p className="text-lg font-bold text-blue-600">
                        {result.gpa.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-200">
                      <p className="text-xs text-slate-500">Rank</p>
                      <p className="text-lg font-bold text-slate-900">
                        {result.rank ? `#${result.rank}` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase text-slate-400">Subject-wise Results</h4>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {result.subjectResults.map((subject) => (
                        <div
                          key={subject.subjectName}
                          className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm border border-slate-100"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {subject.subjectName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {subject.obtainedMarks}/{subject.fullMarks}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-bold ${getGradeColor(subject.grade)}`}>
                              {subject.grade}
                            </span>
                            <p className="text-xs text-slate-500">
                              {subject.gradePoint}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};