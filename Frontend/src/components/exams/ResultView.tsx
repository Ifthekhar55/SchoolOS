import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  RefreshCw,
  FileText,
  Award,
  Users,
  BarChart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ExamResult } from '../../types/exam';
import { examApi } from '../../services/examApi';

interface ResultViewProps {
  examId: string;
  onClose?: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ examId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exam, setExam] = useState<any>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [examId]);

  const loadData = async () => {
    if (!examId || !examId.trim()) {
      setExam(null);
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [examData, resultsData] = await Promise.all([
        examApi.getExam(examId),
        examApi.getResults({ examId }),
      ]);
      setExam(examData);
      setResults(resultsData);
    } catch (error: any) {
      if (error?.status === 404 || error?.message?.includes('not found')) {
        setExam(null);
        setResults([]);
        return;
      }
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      const blob = await examApi.exportResults(examId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_${examId}_${Date.now()}.${format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const handlePublishResults = async () => {
    if (!confirm('Publish results for all students?')) return;
    try {
      await examApi.publishResults(examId);
      loadData();
    } catch (error) {
      console.error('Failed to publish results:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!exam || results.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-2 text-slate-500">No results available</p>
        <button
          onClick={() => examApi.generateResults(examId)}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Generate Results
        </button>
      </div>
    );
  }

  const sortedResults = [...results].sort((a, b) => (b.rank || 999) - (a.rank || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Results - {exam.name}
          </h2>
          <p className="text-sm text-slate-500">
            Class {exam.className} {exam.sectionName && `- ${exam.sectionName}`} • {results.length} students
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!exam.isPublished && (
            <button
              onClick={handlePublishResults}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Publish Results
            </button>
          )}
          <button
            onClick={() => handleExport('csv')}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Download size={16} className="inline mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Printer size={16} className="inline mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Passed</p>
          <p className="text-2xl font-bold text-emerald-600">
            {results.filter(r => r.isPassed).length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Failed</p>
          <p className="text-2xl font-bold text-red-600">
            {results.filter(r => !r.isPassed).length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Average GPA</p>
          <p className="text-2xl font-bold text-blue-600">
            {(results.reduce((sum, r) => sum + (r.gpa || 0), 0) / results.length).toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Pass Rate</p>
          <p className="text-2xl font-bold text-purple-600">
            {((results.filter(r => r.isPassed).length / results.length) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Student
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">
                  Roll
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">
                  Marks
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">
                  GPA
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result) => (
                <React.Fragment key={result.id}>
                  <tr
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setExpandedStudent(
                      expandedStudent === result.studentId ? null : result.studentId
                    )}
                  >
                    <td className="px-4 py-3 text-sm font-bold text-slate-900">
                      {result.rank || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {result.studentName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {result.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">
                      {result.studentRoll}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                      {result.obtainedMarks}/{result.totalMarks}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-blue-600">
                      {result.gpa?.toFixed(2) || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        result.isPassed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {result.isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        {expandedStudent === result.studentId ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedStudent === result.studentId && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-slate-50">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-700">Subject Details</p>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {result.subjectResults?.map((subject) => (
                              <div
                                key={subject.subjectId}
                                className="rounded-lg bg-white p-3 shadow-sm border border-slate-200"
                              >
                                <p className="text-sm font-medium text-slate-900">
                                  {subject.subjectName}
                                </p>
                                <div className="mt-1 flex items-center justify-between text-xs">
                                  <span className="text-slate-500">
                                    {subject.obtainedMarks}/{subject.fullMarks}
                                  </span>
                                  <span className={`font-semibold ${
                                    subject.isPassed ? 'text-emerald-600' : 'text-red-600'
                                  }`}>
                                    {subject.grade} ({subject.gradePoint})
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};