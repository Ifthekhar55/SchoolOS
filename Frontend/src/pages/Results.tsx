import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronRight, Download, GraduationCap, RefreshCw, Users } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { examApi } from '../services/examApi';
import { classApi } from '../services/classApi';
import { studentApi } from '../services/studentApi';
import { schoolApi } from '../services/schoolApi';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

type ResultRecord = any;
type Group = { id: string; name: string; results: ResultRecord[]; studentCount: number };

export const ResultsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [studentRecord, setStudentRecord] = useState<ResultRecord | null>(null);
  const [allStudents, setAllStudents] = useState<ResultRecord[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [school, setSchool] = useState<any>(null);
  const [schoolClasses, setSchoolClasses] = useState<any[]>([]);
  const [sectionsByClass, setSectionsByClass] = useState<Record<string, any[]>>({});
  const [studentsBySection, setStudentsBySection] = useState<Record<string, ResultRecord[]>>({});
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [examId, setExamId] = useState('');
  const [classId, setClassId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [examId, user?.schoolId]);

  async function loadData() {
    try {
      setLoading(true);
      const [examData, classData, schoolData, studentData] = await Promise.all([
        examApi.getExams({ status: 'published', limit: 999 }),
        classApi.getClasses({ page: 1, limit: 999 }),
        user?.schoolId ? schoolApi.getSchool(user.schoolId) : Promise.resolve(null),
        studentApi.getStudents({ limit: 999 }),
      ]);
      setExams(examData.exams || []);
      setSchoolClasses(classData.classes || []);
      setSchool(schoolData);
      setAllStudents(studentData.students || []);
      setStudentRecord(user?.role === 'student' ? studentData.students?.[0] || null : null);
      try {
        setResults(await examApi.getResults({ examId: examId || undefined, isPublished: true }));
      } catch (error) {
        console.error('Failed to load published results:', error);
        setResults([]);
      }
      setClassId(null); setSectionId(null); setStudentId(null);
    } catch (error) {
      console.error('Failed to load results:', error);
      setResults([]);
    } finally { setLoading(false); }
  }

  const classes = useMemo(() => schoolClasses.map((item) => ({
    id: item.id,
    name: item.name,
    studentCount: allStudents.filter((student) => student.class === item.name).length,
    results: allStudents.filter((student) => student.class === item.name).map((student) => ({ studentId: student.id, student })),
  })), [allStudents, results, schoolClasses]);
  const selectedClass = classes.find((item) => item.id === classId);
  const sections = useMemo(() => (classId ? sectionsByClass[classId] || [] : []).map((section) => ({
    id: section.id,
    name: section.name,
    studentCount: allStudents.filter((student) => student.class === selectedClass?.name && student.section === section.name).length,
    results: allStudents.filter((student) => student.class === selectedClass?.name && student.section === section.name).map((student) => ({ studentId: student.id, student })),
  })), [allStudents, classId, sectionsByClass, selectedClass]);
  const selectedSection = sections.find((item) => item.id === sectionId);
  const visibleResults = selectedSection?.results || selectedClass?.results || [];
  const students = useMemo(() => sectionId && studentsBySection[sectionId]
    ? studentsBySection[sectionId].map((student) => ({ studentId: student.id, student }))
    : uniqueStudents(visibleResults), [sectionId, studentsBySection, visibleResults]);
  const selectedStudent = students.find((item) => (item.studentId || item.student?.id) === studentId);

  const handleClassSelect = async (id: string) => {
    setClassId(id); setSectionId(null); setStudentId(null); setSectionsLoading(true);
    try {
      const response = await classApi.getSections(id);
      setSectionsByClass((current) => ({ ...current, [id]: response.sections || [] }));
    } catch (error) {
      console.error('Failed to load class sections:', error);
      setSectionsByClass((current) => ({ ...current, [id]: [] }));
    } finally { setSectionsLoading(false); }
  };

  const handleSectionSelect = async (id: string) => {
    setSectionId(id); setStudentId(null); setStudentsLoading(true);
    try {
      const section = sections.find((item) => item.id === id);
      const response = await studentApi.getStudents({ class: selectedClass?.name, section: section?.name, limit: 999 });
      setStudentsBySection((current) => ({ ...current, [id]: response.students || [] }));
    } catch (error) {
      console.error('Failed to load section students:', error);
      setStudentsBySection((current) => ({ ...current, [id]: [] }));
    } finally { setStudentsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <div className="results-page space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h1 className="text-2xl font-bold text-slate-900">Results</h1><p className="mt-1 text-sm text-slate-500">Browse class, section, and student marks</p></div>
              <div className="flex items-center gap-2"><select value={examId} onChange={(event) => setExamId(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">All Published Exams</option>{exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}</select><button type="button" onClick={loadData} title="Refresh results" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600"><RefreshCw size={17} /></button></div>
            </header>
            {classId && <div className="flex items-center gap-2 text-sm text-slate-500"><button type="button" onClick={() => { setClassId(null); setSectionId(null); setStudentId(null); }} className="font-medium text-blue-600 hover:underline">Classes</button><ChevronRight size={15} /><span>{selectedClass?.name}</span>{sectionId && <><ChevronRight size={15} /><span>Section {selectedSection?.name}</span></>}{studentId && <><ChevronRight size={15} /><span>{selectedStudent?.student?.name}</span></>}</div>}
            {loading ? <Loader /> : user?.role === 'student' ? (studentRecord ? <StudentMarks student={{ studentId: studentRecord.id, student: studentRecord }} school={school} onBack={() => undefined} /> : <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500">No student record found.</div>) : studentId && selectedStudent ? <StudentMarks student={selectedStudent} school={school} onBack={() => setStudentId(null)} /> : classId ? (sectionsLoading || studentsLoading ? <Loader /> : sections.length > 0 && !sectionId ? <CardGrid title={`Sections in ${selectedClass?.name}`} icon={<Users size={19} />} groups={sections} onSelect={handleSectionSelect} /> : <StudentCards students={students} onSelect={setStudentId} />) : <CardGrid title="Classes" icon={<GraduationCap size={19} />} groups={classes} onSelect={handleClassSelect} empty="No classes available." />}
          </div>
        </main>
      </div>
    </div>
  );
};

function uniqueStudents(results: ResultRecord[]) { const students = new Map<string, ResultRecord>(); results.forEach((result) => { const id = result.studentId || result.student?.id; if (id && !students.has(id)) students.set(id, result); }); return [...students.values()].sort((a, b) => (a.student?.rollNumber || 0) - (b.student?.rollNumber || 0)); }
const Loader = () => <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
const CardGrid: React.FC<{ title: string; icon: React.ReactNode; groups: Group[]; onSelect: (id: string) => void; empty?: string }> = ({ title, icon, groups, onSelect, empty = 'Nothing found.' }) => <section className="space-y-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700">{icon}{title}</div>{groups.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500">{empty}</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{groups.map((group) => <button key={group.id} type="button" onClick={() => onSelect(group.id)} className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">{title === 'Classes' ? `Class ${group.name}` : `Section ${group.name}`}</h2><p className="mt-2 text-sm text-slate-500">{new Set(group.results.map((result) => result.studentId || result.student?.id)).size} students</p></div><ChevronRight size={18} className="text-slate-400" /></div></button>)}</div>}</section>;
const StudentCards: React.FC<{ students: ResultRecord[]; onSelect: (id: string) => void }> = ({ students, onSelect }) => <section className="space-y-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Users size={19} />Students</div>{students.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500">No students found.</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{students.map((result) => { const id = result.studentId || result.student?.id; const name = result.student?.name || 'Student'; return <button key={id} type="button" onClick={() => onSelect(id)} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-blue-300 hover:shadow-md"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{name.charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{name}</p><p className="text-sm text-slate-500">Roll {result.student?.rollNumber || '-'}</p></div><ChevronRight size={18} className="text-slate-400" /></button>; })}</div>}</section>;

const StudentMarks: React.FC<{ student: ResultRecord; school: any; onBack: () => void }> = ({ student, school, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<any[]>([]);
  const examNames = [...new Set(marks.map((mark) => mark.examSubject?.exam?.name).filter(Boolean))];
  useEffect(() => { let active = true; examApi.getStudentMarks(student.studentId || student.student?.id).then((data) => { if (active) setMarks(data || []); }).catch((error) => { console.error('Failed to load student marks:', error); if (active) setMarks([]); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [student]);
  const downloadPdf = () => {
    const pdf = new jsPDF();
    const name = student.student?.name || 'Student';
    const total = marks.reduce((sum, mark) => sum + Number(mark.marksObtained || 0), 0);
    const full = marks.reduce((sum, mark) => sum + Number(mark.fullMarks || 0), 0);
    const average = full ? (total / full) * 100 : 0;
    const examNames = [...new Set(marks.map((mark) => mark.examSubject?.exam?.name).filter(Boolean))];
    const resultTitle = examNames.length === 1 ? `${examNames[0]} Result` : 'Student Result';
    let y = 18;
    pdf.setFontSize(16); pdf.setFont('helvetica', 'bold'); pdf.text(school?.name || 'School', 105, y, { align: 'center' });
    pdf.setFontSize(10); pdf.setFont('helvetica', 'normal'); y += 7; pdf.text(`${school?.address || ''}${school?.city ? `, ${school.city}` : ''}`, 105, y, { align: 'center' }); y += 5; pdf.text(`Established: ${school?.establishedYear || '-'}`, 105, y, { align: 'center' });
    y += 12; pdf.setFontSize(12); pdf.setFont('helvetica', 'bold'); pdf.text(resultTitle, 105, y, { align: 'center' }); y += 10; pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
    pdf.text(`Student name: ${name}`, 14, y); pdf.text(`Roll: ${student.student?.rollNumber || '-'}`, 120, y); y += 6; pdf.text(`Class: ${student.student?.class || '-'}`, 14, y); pdf.text(`Section: ${student.student?.section || '-'}`, 120, y); y += 10;
    pdf.setFont('helvetica', 'bold'); pdf.text('Subject', 14, y); pdf.text('Marks', 105, y); pdf.text('Highest Marks', 150, y, { align: 'center' }); pdf.text('Status', 175, y); y += 6; pdf.setFont('helvetica', 'normal');
    marks.forEach((mark) => { if (y > 275) { pdf.addPage(); y = 18; } pdf.text(String(mark.examSubject?.subject?.name || 'Subject').slice(0, 40), 14, y); pdf.text(`${mark.marksObtained}/${mark.fullMarks}`, 105, y); pdf.text(String(mark.highestMarks ?? mark.marksObtained), 150, y, { align: 'center' }); pdf.text(mark.isPassed ? 'Passed' : 'Failed', 175, y); y += 6; });
    y += 5; pdf.setFont('helvetica', 'bold'); pdf.text(`Total marks: ${total}/${full}`, 14, y); y += 6; pdf.text(`Average: ${average.toFixed(1)}%`, 14, y); y += 6; pdf.text(`Subjects: ${marks.length} | Passed: ${marks.filter((mark) => mark.isPassed).length}`, 14, y);
    pdf.save(`${name.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}_result.pdf`);
  };
  return <section className="space-y-5"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">{(student.student?.name || 'S').charAt(0).toUpperCase()}</div><div><h2 className="text-xl font-bold text-slate-900">{student.student?.name || 'Student'}</h2><p className="text-sm text-slate-500">Roll {student.student?.rollNumber || '-'}</p></div></div><div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"><span className="flex items-center gap-2"><BookOpen size={18} />{examNames.length === 1 ? `${examNames[0]} Result` : 'Exam Results'}</span>{!loading && marks.length > 0 && <button type="button" onClick={downloadPdf} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"><Download size={15} />Print / Download PDF</button>}</div>{loading ? <Loader /> : marks.length === 0 ? <div className="py-10 text-center text-sm text-slate-500">No marks entered for this student.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[520px]"><thead><tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400"><th className="px-4 py-3">Subject</th><th className="px-4 py-3 text-right">Marks</th><th className="px-4 py-3 text-right">Highest Marks</th><th className="px-4 py-3 text-right">Status</th></tr></thead><tbody>{marks.map((mark: any) => <tr key={mark.id} className="border-b border-slate-100 last:border-0"><td className="px-4 py-3 text-sm font-medium text-slate-900">{mark.examSubject?.subject?.name || 'Subject'}</td><td className="px-4 py-3 text-right text-sm text-slate-700">{mark.marksObtained}/{mark.fullMarks}</td><td className="px-4 py-3 text-right text-sm text-slate-700">{mark.highestMarks ?? mark.marksObtained}</td><td className={`px-4 py-3 text-right text-sm font-semibold ${mark.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>{mark.isPassed ? 'Passed' : 'Failed'}</td></tr>)}</tbody></table></div>}</div><button type="button" onClick={onBack} className="text-sm font-medium text-blue-600 hover:underline">Back to students</button></section>;
};
