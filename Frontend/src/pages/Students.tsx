import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Student, StudentFilters } from '../types/student';
import { Class, Section } from '../types/class';
import { StudentList } from '../components/students/StudentList';
import { StudentForm } from '../components/students/StudentForm';
import { StudentDetails } from '../components/students/StudentDetails';
import { StudentImport } from '../components/students/StudentImport';
import { StudentStatusBadge } from '../components/students/StudentStatusBadge';
import { StudentFiltersComponent } from '../components/students/StudentFilters';
import { ProtectedComponent } from '../components/ProtectedComponent';
import { useAuth } from '../hooks/useAuth';
import { classApi } from '../services/classApi';
import { studentApi } from '../services/studentApi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const StudentsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [viewingStudent, setViewingStudent] = useState<Student | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [studentsInSection, setStudentsInSection] = useState<Student[]>([]);
  const [selectedClassName, setSelectedClassName] = useState<string>('');
  const [selectedSectionName, setSelectedSectionName] = useState<string>('');
  const [loadingClassBrowser, setLoadingClassBrowser] = useState(false);
  const [studentFilters, setStudentFilters] = useState<StudentFilters>({ page: 1, limit: 10 });

  const params = new URLSearchParams(location.search);
  const mode = params.get('mode');
  const isAddMode = location.pathname.endsWith('/add') || mode === 'add';
  const isImportMode = mode === 'import';

  useEffect(() => {
    if (isAddMode) {
      setEditingStudent(undefined);
      setShowForm(true);
      setShowImport(false);
      return;
    }

    if (isImportMode) {
      setShowImport(true);
      setShowForm(false);
      setEditingStudent(undefined);
    }
  }, [isAddMode, isImportMode]);

  useEffect(() => {
    if (!user?.schoolId) return;
    loadClasses();
  }, [user?.schoolId]);

  const loadClasses = async () => {
    try {
      setLoadingClassBrowser(true);
      const response = await classApi.getClasses({ limit: 200 });
      setClasses(response.classes || []);
    } catch (error) {
      console.error('Failed to load classes for student browser:', error);
    } finally {
      setLoadingClassBrowser(false);
    }
  };

  const loadSectionsForClass = async (classItem: Class) => {
    try {
      setSelectedClassName(classItem.name);
      setSelectedSectionName('');
      setStudentsInSection([]);
      const response = await classApi.getSections(classItem.id);
      setSections(response.sections || []);
    } catch (error) {
      console.error('Failed to load sections for class:', error);
      setSections([]);
    }
  };

  const loadStudentsForSection = async (className: string, sectionName: string) => {
    try {
      setSelectedSectionName(sectionName);
      const response = await studentApi.getStudents({
        class: className,
        section: sectionName,
        limit: 200,
      });
      setStudentsInSection(response.students || []);
    } catch (error) {
      console.error('Failed to load students for section:', error);
      setStudentsInSection([]);
    }
  };

  const handleCreate = () => {
    setEditingStudent(undefined);
    setShowForm(true);
    navigate('/students/add', { replace: true });
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleView = (student: Student) => {
    setViewingStudent(student);
    setShowDetails(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingStudent(undefined);
    setRefreshKey(prev => prev + 1);
    navigate('/students', { replace: true });
  };

  const handleSectionDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await studentApi.deleteStudent(studentId);
      if (selectedClassName && selectedSectionName) {
        await loadStudentsForSection(selectedClassName, selectedSectionName);
      }
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  const handleSectionToggleStatus = async (student: Student) => {
    try {
      if (student.isActive) {
        await studentApi.deactivateStudent(student.id);
      } else {
        await studentApi.activateStudent(student.id);
      }

      if (selectedClassName && selectedSectionName) {
        await loadStudentsForSection(selectedClassName, selectedSectionName);
      }
    } catch (error) {
      console.error('Failed to toggle student status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          {!isAddMode && !showForm && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Student Class Overview</h3>
                  <p className="text-sm text-slate-500">Browse students by class and section</p>
                </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <ProtectedComponent permission="students:create">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Add Student
                </button>
              </ProtectedComponent>
            </div>
          </div>

          <div className="mb-4">
            <StudentFiltersComponent
              filters={studentFilters}
              onFilterChange={setStudentFilters}
              onSearch={() => undefined}
              onReset={() => setStudentFilters({ page: 1, limit: 10 })}
              onExport={() => undefined}
              onImport={() => setShowImport(true)}
              onRefresh={() => undefined}
              isLoading={false}
              total={0}
            />
          </div>

          {loadingClassBrowser ? (
            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
              Loading class overview...
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {classes.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No classes available yet.
                  </div>
                ) : (
                  classes.map((classItem) => (
                    <button
                      key={classItem.id}
                      type="button"
                      onClick={() => loadSectionsForClass(classItem)}
                      className={`rounded-xl border p-4 text-left transition ${
                        selectedClassName === classItem.name
                          ? 'border-blue-600 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-sm font-semibold text-slate-900">{classItem.name}</div>
                      <div className="mt-2 text-xs text-slate-500">
                        {classItem.sections?.length || 0} sections
                      </div>
                    </button>
                  ))
                )}
              </div>

              {selectedClassName && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Sections in {selectedClassName}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sections.length === 0 ? (
                      <span className="text-sm text-slate-500">No sections found for this class.</span>
                    ) : (
                      sections.map((section) => (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => loadStudentsForSection(selectedClassName, section.name)}
                          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                            selectedSectionName === section.name
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                          }`}
                        >
                          {section.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {selectedSectionName && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Students in {selectedClassName} - {selectedSectionName}
                  </h4>

                  {studentsInSection.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      No students found in this section.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                                Student
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                                Class
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                                Roll
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                                Parents
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                                Status
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentsInSection.map((student) => (
                              <tr
                                key={student.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                      {student.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                                      <p className="text-xs text-slate-500">{student.nameBangla || ''}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                  {student.class}
                                  {student.section ? `-${student.section}` : ''}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">{student.rollNumber}</td>
                                <td className="px-4 py-3">
                                  <div className="text-xs">
                                    <p className="text-slate-700">F: {student.fatherName}</p>
                                    <p className="text-slate-500">M: {student.motherName}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <StudentStatusBadge isActive={student.isActive} isVerified={student.isVerified} />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleView(student)}
                                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                      title="View"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    <ProtectedComponent permission="students:edit">
                                      <button
                                        onClick={() => handleEdit(student)}
                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                        title="Edit"
                                      >
                                        <Edit size={16} />
                                      </button>
                                    </ProtectedComponent>
                                    <ProtectedComponent permission="students:edit">
                                      <button
                                        onClick={() => handleSectionToggleStatus(student)}
                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                        title={student.isActive ? 'Deactivate' : 'Activate'}
                                      >
                                        {student.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                      </button>
                                    </ProtectedComponent>
                                    <ProtectedComponent permission="students:delete">
                                      <button
                                        onClick={() => handleSectionDelete(student.id)}
                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                        title="Delete"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </ProtectedComponent>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

          {(showForm || isAddMode) && (
            <StudentForm
              student={editingStudent}
              schoolId={user?.schoolId || ''}
              onClose={() => {
                setShowForm(false);
                setEditingStudent(undefined);
                navigate('/students', { replace: true });
              }}
              onSuccess={handleSuccess}
            />
          )}

          {showDetails && viewingStudent && (
            <StudentDetails
              student={viewingStudent}
              onClose={() => {
                setShowDetails(false);
                setViewingStudent(undefined);
              }}
              onEdit={() => {
                setShowDetails(false);
                handleEdit(viewingStudent);
              }}
            />
          )}

          {showImport && (
            <StudentImport
              schoolId={user?.schoolId || ''}
              onClose={() => {
                setShowImport(false);
                navigate('/students', { replace: true });
              }}
              onSuccess={() => {
                setShowImport(false);
                setRefreshKey(prev => prev + 1);
                navigate('/students', { replace: true });
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};