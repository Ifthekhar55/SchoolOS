import React, { useState, useEffect } from 'react';
import {
  X,
  School,
  Users,
  User,
  Award,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  Download,
  ChevronRight,
  Printer,
} from 'lucide-react';
import { SubjectWithClasses, ClassSubjectDetail } from '../../types/subject';
import { subjectApi } from '../../services/subjectApi';
import { useAuth } from '../../hooks/useAuth';

interface SubjectClassDetailsProps {
  subject: SubjectWithClasses;
  onClose: () => void;
}

export const SubjectClassDetails: React.FC<SubjectClassDetailsProps> = ({
  subject,
  onClose,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<ClassSubjectDetail | null>(null);
  const [showSectionDetails, setShowSectionDetails] = useState(false);

  const getAverageColor = (avg: number) => {
    if (avg >= 80) return 'text-emerald-600';
    if (avg >= 60) return 'text-blue-600';
    if (avg >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getPassRateColor = (rate: number) => {
    if (rate >= 80) return 'bg-emerald-100 text-emerald-700';
    if (rate >= 60) return 'bg-blue-100 text-blue-700';
    if (rate >= 40) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(1);
  };

  // Group class details by class
  const groupedByClass = subject.classDetails.reduce((acc, detail) => {
    if (!acc[detail.classId]) {
      acc[detail.classId] = {
        className: detail.className,
        classNameBangla: detail.classNameBangla,
        sections: [],
      };
    }
    acc[detail.classId].sections.push(detail);
    return acc;
  }, {} as Record<string, { className: string; classNameBangla?: string; sections: ClassSubjectDetail[] }>);

  const handleSectionClick = (section: ClassSubjectDetail) => {
    setSelectedSection(section);
    setShowSectionDetails(true);
  };

  const getOverallAverage = (sections: ClassSubjectDetail[]) => {
    if (sections.length === 0) return 0;
    const total = sections.reduce((sum, s) => sum + s.averageMarks, 0);
    return total / sections.length;
  };

  const getTotalStudents = (sections: ClassSubjectDetail[]) => {
    return sections.reduce((sum, s) => sum + s.totalStudents, 0);
  };

  const getPassRate = (sections: ClassSubjectDetail[]) => {
    const total = getTotalStudents(sections);
    if (total === 0) return 0;
    const passed = sections.reduce((sum, s) => sum + s.passedStudents, 0);
    return (passed / total) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl">
              📚
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {subject.subjectName}
                {subject.subjectNameBangla && (
                  <span className="ml-2 text-sm text-slate-500">({subject.subjectNameBangla})</span>
                )}
              </h2>
              <p className="text-sm text-slate-500">
                {subject.totalClasses} Classes • {subject.totalSections} Sections • {subject.totalTeachers} Teachers
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Download size={14} className="inline mr-1" />
              Export
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Printer size={14} className="inline mr-1" />
              Print
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
          {/* Overall Statistics */}
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {subject.totalClasses}
              </p>
              <p className="text-xs text-blue-600">Total Classes</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {subject.totalSections}
              </p>
              <p className="text-xs text-emerald-600">Total Sections</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {subject.totalTeachers}
              </p>
              <p className="text-xs text-purple-600">Total Teachers</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {formatPercentage(getOverallAverage(subject.classDetails))}%
              </p>
              <p className="text-xs text-amber-600">Overall Average</p>
            </div>
          </div>

          {/* Classes with Sections */}
          <div className="space-y-4">
            {Object.entries(groupedByClass).map(([classId, classData]) => {
              const isExpanded = expandedClass === classId;
              const classAverage = getOverallAverage(classData.sections);
              const classPassRate = getPassRate(classData.sections);
              const totalStudents = getTotalStudents(classData.sections);

              return (
                <div
                  key={classId}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  {/* Class Header */}
                  <div
                    className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedClass(isExpanded ? null : classId)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-700">
                        {classData.className}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Class {classData.className}
                          {classData.classNameBangla && (
                            <span className="ml-2 text-xs text-slate-500">({classData.classNameBangla})</span>
                          )}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {totalStudents} Students
                          </span>
                          <span className="flex items-center gap-1">
                            <School size={14} />
                            {classData.sections.length} Sections
                          </span>
                          <span className="flex items-center gap-1">
                            <Award size={14} />
                            <span className={getAverageColor(classAverage)}>
                              {formatPercentage(classAverage)}% Avg
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPassRateColor(classPassRate)}`}>
                        {formatPercentage(classPassRate)}% Pass Rate
                      </span>
                      {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Sections */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <School size={16} />
                          Sections
                        </h4>
                      </div>

                      <div className="grid gap-3">
                        {classData.sections.map((section) => (
                          <div
                            key={section.sectionId}
                            className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleSectionClick(section)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                                  {section.sectionName}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">
                                    Section {section.sectionName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {section.totalStudents} Students • {section.teacherName || 'No teacher assigned'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {formatPercentage(section.averageMarks)}%
                                  </p>
                                  <p className="text-[10px] text-slate-500">Average</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-emerald-600">
                                    {section.passedStudents}/{section.totalStudents}
                                  </p>
                                  <p className="text-[10px] text-slate-500">Passed</p>
                                </div>
                                <ChevronRight size={16} className="text-slate-400" />
                              </div>
                            </div>

                            {/* Mini stats bar */}
                            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                              <div className="text-center">
                                <p className="text-xs font-medium text-emerald-600">
                                  {formatPercentage((section.passedStudents / section.totalStudents) * 100)}%
                                </p>
                                <p className="text-[10px] text-slate-500">Pass Rate</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-medium text-blue-600">
                                  {section.highestMarks}
                                </p>
                                <p className="text-[10px] text-slate-500">Highest Marks</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-medium text-red-600">
                                  {section.lowestMarks}
                                </p>
                                <p className="text-[10px] text-slate-500">Lowest Marks</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* No data message */}
          {subject.classDetails.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <School className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">No class details available</h3>
              <p className="mt-1 text-sm text-slate-500">
                This subject hasn't been assigned to any classes yet
              </p>
            </div>
          )}
        </div>

        {/* Section Details Modal */}
        {showSectionDetails && selectedSection && (
          <SectionDetailsModal
            section={selectedSection}
            subjectName={subject.subjectName}
            onClose={() => {
              setShowSectionDetails(false);
              setSelectedSection(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Section Details Modal Component
const SectionDetailsModal: React.FC<{
  section: ClassSubjectDetail;
  subjectName: string;
  onClose: () => void;
}> = ({ section, subjectName, onClose }) => {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {subjectName} - Class {section.className} Section {section.sectionName}
            </h3>
            <p className="text-sm text-slate-500">
              Teacher: {section.teacherName || 'Not assigned'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{section.totalStudents}</p>
              <p className="text-xs text-blue-600">Total Students</p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{section.passedStudents}</p>
              <p className="text-xs text-emerald-600">Passed</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{section.failedStudents}</p>
              <p className="text-xs text-red-600">Failed</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{section.averageMarks}%</p>
              <p className="text-xs text-amber-600">Average</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Highest Marks</p>
              <p className="text-2xl font-bold text-emerald-600">{section.highestMarks}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Lowest Marks</p>
              <p className="text-2xl font-bold text-red-600">{section.lowestMarks}</p>
            </div>
          </div>

          {/* Pass Rate Bar */}
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Pass Rate</span>
              <span className="text-sm font-semibold text-slate-900">
                {((section.passedStudents / section.totalStudents) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${(section.passedStudents / section.totalStudents) * 100}%` }}
              />
            </div>
          </div>

          {/* Teacher Info */}
          {section.teacherName && (
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Teacher Information</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {section.teacherName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{section.teacherName}</p>
                  <p className="text-xs text-slate-500">{section.teacherEmail || 'No email available'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Download size={16} className="inline mr-2" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

