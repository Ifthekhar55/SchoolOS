import React, { useEffect, useState } from 'react';
import { X, School, Users, ArrowLeft, BookOpen } from 'lucide-react';
import { Exam } from '../types/exam';
import { ExamList } from '../components/exams/ExamList';
import { ExamForm } from '../components/exams/ExamForm';
import { MarkEntryComponent } from '../components/exams/MarkEntry';
import { ResultView } from '../components/exams/ResultView';
import { useAuth } from '../hooks/useAuth';
import { classApi } from '../services/classApi';
import { examApi } from '../services/examApi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const formatClassName = (className?: string) => {
  if (!className) return '-';

  const cleaned = className.replace(/^class[-\s:]*/i, '').trim();
  const normalized = cleaned.toLowerCase();
  const words: Record<string, string> = {
    '1': 'One',
    '2': 'Two',
    '3': 'Three',
    '4': 'Four',
    '5': 'Five',
    '6': 'Six',
    '7': 'Seven',
    '8': 'Eight',
    '9': 'Nine',
    '10': 'Ten',
  };

  return words[normalized] || cleaned;
};

export const ExamsPage: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showExamDetails, setShowExamDetails] = useState(false);
  const [showMarkEntry, setShowMarkEntry] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | undefined>();
  const [selectedExam, setSelectedExam] = useState<Exam | undefined>();
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSectionName, setSelectedSectionName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [markEntryStage, setMarkEntryStage] = useState<'class' | 'section' | 'subjects' | 'students'>('class');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!showMarkEntry) {
      setClasses([]);
      setSections([]);
      setSelectedClassId('');
      setSelectedClassName('');
      setSelectedSectionId('');
      setSelectedSectionName('');
      setSelectedSubjectId('');
      setMarkEntryStage('class');
      return;
    }

    const loadClasses = async () => {
      try {
        const response = await classApi.getClasses({ page: 1, limit: 999 });
        setClasses(response.classes || []);
      } catch (error) {
        console.error('Failed to load classes for mark entry:', error);
      }
    };

    loadClasses();
  }, [showMarkEntry]);

  const handleCreate = () => {
    setSelectedExam(undefined);
    setShowExamDetails(false);
    setShowResults(false);
    setShowMarkEntry(false);
    setEditingExam(undefined);
    setSelectedExam(undefined);
    setShowForm(true);
  };

  const handleEdit = (exam: Exam) => {
    setSelectedExam(undefined);
    setShowExamDetails(false);
    setShowResults(false);
    setShowMarkEntry(false);
    setEditingExam(exam);
    setSelectedExam(undefined);
    setShowForm(true);
  };

  const handleView = (exam: Exam) => {
    setSelectedExam(exam);
    setShowExamDetails(true);
  };

  const handleMarkEntry = (exam: Exam) => {
    setSelectedExam(exam);
    setShowMarkEntry(true);
    setSelectedClassId('');
    setSelectedClassName('');
    setSelectedSectionId('');
    setSelectedSectionName('');
    setSelectedSubjectId('');
    setMarkEntryStage('class');
  };

  const handleResults = (exam: Exam) => {
    setSelectedExam(exam);
    setShowResults(true);
  };

  const handleClassSelect = async (classItem: any) => {
    setSelectedClassId(classItem.id);
    setSelectedClassName(classItem.name);
    setSelectedSectionId('');
    setSelectedSectionName('');
    setSelectedSubjectId(selectedExam?.subjects?.[0]?.subjectId || selectedExam?.subjects?.[0]?.id || '');

    try {
      const response = await classApi.getSections(classItem.id);
      const classSections = response.sections || [];
      setSections(classSections);

      if (classSections.length > 0) {
        setMarkEntryStage('section');
      } else {
        setMarkEntryStage('subjects');
      }
    } catch (error) {
      console.error('Failed to load section list:', error);
      setSections([]);
      setMarkEntryStage('subjects');
    }
  };

  const handleSectionSelect = (section: any) => {
    setSelectedSectionId(section.id);
    setSelectedSectionName(section.name);
    const firstSubject = selectedExam?.subjects?.[0]?.subjectId || selectedExam?.subjects?.[0]?.id || '';
    setSelectedSubjectId(firstSubject);
    setMarkEntryStage('subjects');
  };

  const handleCloseMarkEntry = () => {
    setShowMarkEntry(false);
    setSelectedExam(undefined);
    setSelectedClassId('');
    setSelectedClassName('');
    setSelectedSectionId('');
    setSelectedSectionName('');
    setSelectedSubjectId('');
    setSections([]);
    setMarkEntryStage('class');
  };

  const handleSuccess = () => {
    setShowForm(false);
    setShowExamDetails(false);
    setShowMarkEntry(false);
    setEditingExam(undefined);
    setSelectedExam(undefined);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <ExamList
            key={refreshKey}
            schoolId={user?.schoolId || ''}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onView={handleView}
            onMarkEntry={handleMarkEntry}
            onResults={handleResults}
          />

          {showExamDetails && selectedExam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedExam.name}</h2>
                    <p className="text-sm text-slate-500">{selectedExam.code}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowExamDetails(false);
                      setSelectedExam(undefined);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
                  <div className="grid gap-4 md:grid-cols-2 text-sm">
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-slate-500">Exam Type</p>
                      <p className="mt-1 font-medium text-slate-800 capitalize">{selectedExam.type?.replace('_', ' ') || '-'}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-slate-500">Class</p>
                      <p className="mt-1 font-medium text-slate-800">{formatClassName(selectedExam.className)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-slate-500">Section</p>
                      <p className="mt-1 font-medium text-slate-800">{selectedExam.sectionName || 'All Sections'}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-slate-500">Status</p>
                      <p className="mt-1 font-medium text-slate-800 capitalize">{selectedExam.status}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-slate-500">Exam Date</p>
                      <p className="mt-1 font-medium text-slate-800">{selectedExam.examDate ? new Date(selectedExam.examDate).toLocaleDateString() : '-'}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-slate-500">Total Marks</p>
                      <p className="mt-1 font-medium text-slate-800">{selectedExam.totalMarks || 0}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">Subjects</h3>
                    <div className="space-y-3">
                      {(selectedExam.subjects || []).map((subject) => {
                        const subjectName = (subject as any).subjectName || (subject as any).subject?.name || 'Subject';
                        return (
                          <div key={subject.subjectId || subject.id} className="rounded-lg border border-slate-200 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium text-slate-800">{subjectName}</div>
                              <div className="text-xs text-slate-500">{subject.fullMarks || 0} full marks</div>
                            </div>
                            <div className="mt-2 grid gap-2 text-xs text-slate-600 md:grid-cols-3">
                              <div>Passing: {subject.passingMarks || 0}</div>
                              <div>Duration: {subject.duration || 0} min</div>
                              <div>{subject.date ? new Date(subject.date).toLocaleDateString() : '-'}</div>
                            </div>
                            {(subject.time || subject.room) && (
                              <div className="mt-2 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                                {subject.time && <div>Start time: {subject.time}</div>}
                                {subject.room && <div>Room: {subject.room}</div>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showForm && (
            <ExamForm
              exam={editingExam}
              schoolId={user?.schoolId || ''}
              onClose={() => {
                setShowForm(false);
                setEditingExam(undefined);
                setSelectedExam(undefined);
              }}
              onSuccess={handleSuccess}
            />
          )}

          {showMarkEntry && selectedExam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Enter Marks - {selectedExam.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Choose a class and section, then enter marks for each student and subject.
                    </p>
                  </div>
                  <button
                    onClick={handleCloseMarkEntry}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
                  {markEntryStage === 'class' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <School size={16} className="text-blue-600" />
                        Select a class
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {classes.map((classItem) => (
                          <button
                            key={classItem.id}
                            type="button"
                            onClick={() => handleClassSelect(classItem)}
                            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base font-semibold text-slate-900">{classItem.name}</span>
                              <School size={18} className="text-slate-400" />
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                              {classItem.sections?.length || 0} sections available
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {markEntryStage === 'section' && selectedClassName && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClassId('');
                            setSelectedClassName('');
                            setSections([]);
                            setMarkEntryStage('class');
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <ArrowLeft size={16} />
                          Back to classes
                        </button>
                        <div className="text-sm font-medium text-slate-700">Class: {formatClassName(selectedClassName)}</div>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Users size={16} className="text-blue-600" />
                        Select a section
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {sections.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                            No sections found for this class. Students will be shown directly.
                          </div>
                        ) : (
                          sections.map((section) => (
                            <button
                              key={section.id}
                              type="button"
                              onClick={() => handleSectionSelect(section)}
                              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                            >
                              {section.name}
                            </button>
                          ))
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSectionId('');
                            setSelectedSectionName('');
                            setSelectedSubjectId(selectedExam?.subjects?.[0]?.subjectId || selectedExam?.subjects?.[0]?.id || '');
                            setMarkEntryStage('subjects');
                          }}
                          className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                        >
                          All Students in {selectedClassName}
                        </button>
                      </div>
                    </div>
                  )}

                  {markEntryStage === 'subjects' && selectedExam && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <BookOpen size={16} className="text-blue-600" />
                          {selectedSectionName ? `${selectedClassName} / ${selectedSectionName}` : selectedClassName || 'Class'} subjects
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSectionId('');
                            setSelectedSectionName('');
                            setSelectedSubjectId('');
                            setMarkEntryStage('section');
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <ArrowLeft size={16} />
                          Change section
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {(selectedExam.subjects || []).map((subject) => {
                          const subjectId = subject.subjectId || subject.id || '';
                          const subjectObj = subject as any;
                          const subjectName = subjectObj.subjectName || subjectObj.subject?.name || subjectObj.name || 'Subject';
                          return (
                            <button
                              key={subjectId || `${subjectName}-${Math.random()}`}
                              type="button"
                              onClick={() => {
                                setSelectedSubjectId(subjectId);
                                setMarkEntryStage('students');
                              }}
                              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                            >
                              <div className="text-sm font-semibold text-slate-900">{subjectName}</div>
                              <div className="mt-2 text-xs text-slate-500">{Number(subject.fullMarks || 0)} full marks</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {markEntryStage === 'students' && selectedExam && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <Users size={16} className="text-blue-600" />
                          {selectedSectionName ? `${selectedClassName} / ${selectedSectionName}` : selectedClassName || 'Class students'}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubjectId('');
                            setMarkEntryStage('subjects');
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <ArrowLeft size={16} />
                          Change subject
                        </button>
                      </div>

                      <MarkEntryComponent
                        examId={selectedExam.id}
                        subjects={selectedExam.subjects || []}
                        classId={selectedClassId || selectedExam.classId}
                        className={selectedClassName || selectedExam.className || ''}
                        sectionId={selectedSectionId || selectedExam.sectionId || ''}
                        sectionName={selectedSectionName || selectedExam.sectionName || ''}
                        initialSubjectId={selectedSubjectId || (selectedExam.subjects?.[0]?.subjectId || selectedExam.subjects?.[0]?.id || '')}
                        onSuccess={() => {
                          // Keep the current subject page open so the newly saved marks remain visible.
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {showResults && selectedExam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Results - {selectedExam.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      View and manage exam results
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setSelectedExam(undefined);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
                  <ResultView
                    examId={selectedExam.id}
                    onClose={() => {
                      setShowResults(false);
                      setSelectedExam(undefined);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};