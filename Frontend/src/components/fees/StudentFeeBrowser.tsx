import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle, ChevronRight, Clock, DollarSign, Edit, Eye, GraduationCap, Plus, Trash2, Users, XCircle } from 'lucide-react';
import { classApi } from '../../services/classApi';
import { studentApi } from '../../services/studentApi';
import { feeApi } from '../../services/feeApi';
import { Fee } from '../../types/fee';
import { useAuth } from '../../hooks/useAuth';

interface StudentFeeBrowserProps {
  onCreate: (studentFilter?: { class?: string; section?: string }) => void;
  onPay: (fee: Fee) => void;
  onView: (fee: Fee) => void;
  onEdit: (fee: Fee) => void;
  onDelete: (id: string) => void;
  onSelectionChange?: (selection: { classId?: string; sectionId?: string; className?: string; sectionName?: string } | null) => void;
}

export const StudentFeeBrowser: React.FC<StudentFeeBrowserProps> = ({ onCreate, onPay, onView, onEdit, onDelete, onSelectionChange }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [sectionFees, setSectionFees] = useState<Fee[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedSection && selectedClass) {
      onSelectionChange?.({
        classId: selectedClass.id,
        sectionId: selectedSection.id,
        className: selectedClass.name,
        sectionName: selectedSection.name,
      });
      return;
    }

    if (selectedClass) {
      onSelectionChange?.({
        classId: selectedClass.id,
        className: selectedClass.name,
      });
      return;
    }

    onSelectionChange?.(null);
  }, [selectedClass, selectedSection, onSelectionChange]);

  useEffect(() => {
    if (!selectedClass && !selectedSection) {
      onSelectionChange?.(null);
    }
  }, [selectedClass, selectedSection, onSelectionChange]);

  useEffect(() => {
    if (user?.role === 'student') {
      setLoading(true);
      studentApi.getStudents({ limit: 1 })
        .then(async (response) => {
          const student = response.students?.[0];
          if (!student) {
            setFees([]);
            return;
          }
          const feeResponse = await feeApi.getFees({ studentId: student.id, limit: 999 });
          setSelectedStudent(student);
          setFees(feeResponse.fees || []);
        })
        .catch((error) => console.error('Failed to load student fees:', error))
        .finally(() => setLoading(false));
      return;
    }

    classApi.getClasses({ page: 1, limit: 999 })
      .then((response) => setClasses(response.classes || []))
      .catch((error) => console.error('Failed to load fee classes:', error))
      .finally(() => setLoading(false));
  }, [user?.role]);

  const chooseClass = async (classItem: any) => {
    setSelectedClass(classItem); setSelectedSection(null); setSelectedStudent(null); setStudents([]); setLoading(true);
    onSelectionChange?.({ classId: classItem.id, className: classItem.name });
    try {
      const response = await classApi.getSections(classItem.id);
      setSections(response.sections || []);
      if (!response.sections?.length) await loadStudents(classItem.name);
    } finally { setLoading(false); }
  };

  const loadStudents = async (className: string, sectionName?: string) => {
    const response = await studentApi.getStudents({ class: className, section: sectionName, limit: 999 });
    setStudents(response.students || []);
  };

  const chooseSection = async (section: any) => {
    setSelectedSection(section); setSelectedStudent(null); setLoading(true);
    onSelectionChange?.({ classId: selectedClass?.id, sectionId: section.id, className: selectedClass?.name, sectionName: section.name });
    try {
      const response = await studentApi.getStudents({ class: selectedClass.name, section: section.name, limit: 999 });
      setStudents(response.students || []);
      const feeResponses = await Promise.all((response.students || []).map((student: any) => feeApi.getFees({ studentId: student.id, limit: 999 })));
      setSectionFees(feeResponses.flatMap((feeResponse) => feeResponse.fees || []));
    } finally { setLoading(false); }
  };

  const chooseStudent = async (student: any) => {
    setSelectedStudent(student); setLoading(true);
    try {
      const response = await feeApi.getFees({ studentId: student.id, limit: 999 });
      setFees(response.fees || []);
    } finally { setLoading(false); }
  };

  const back = () => {
    if (selectedStudent) { setSelectedStudent(null); return; }
    if (selectedClass && (selectedSection || sections.length === 0)) {
      setSelectedSection(null);
      setSelectedClass(null);
      setStudents([]);
      onSelectionChange?.(null);
      return;
    }
    setSelectedClass(null); setSections([]); setStudents([]);
    onSelectionChange?.(null);
  };

  if (loading && !classes.length) return <div className="py-8 text-center text-sm text-slate-500">Loading classes...</div>;
  if (user?.role === 'student') return <div className="space-y-4"><BrowserHeader title="My Fees" onBack={() => undefined} /><FeeRows fees={fees} onPay={onPay} loading={loading} /></div>;
  if (selectedStudent) return <div className="space-y-4"><BrowserHeader title={selectedStudent.name} onBack={back} /><FeeRows fees={fees} onPay={onPay} loading={loading} /></div>;
  if (selectedClass && (selectedSection || sections.length === 0)) return <div className="space-y-4"><BrowserHeader title={selectedSection ? `Fees in Section ${selectedSection.name}` : `Students in Class ${selectedClass.name}`} onBack={back} action={selectedSection ? <button type="button" onClick={() => onCreate({ class: selectedClass.name, section: selectedSection.name })} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"><Plus size={16} />Add Fees</button> : undefined} />{selectedSection ? <FeeTable fees={sectionFees} onPay={onPay} onView={onView} onEdit={onEdit} onDelete={onDelete} loading={loading} /> : <StudentCards students={students} onSelect={chooseStudent} />}</div>;
  if (selectedClass) return <div className="space-y-4"><BrowserHeader title={`Sections in Class ${selectedClass.name}`} onBack={back} /><CardGrid items={sections} label="Section" onSelect={chooseSection} /></div>;
  return <CardGrid items={classes} label="Class" onSelect={chooseClass} empty="No classes found." />;
};

const BrowserHeader: React.FC<{ title: string; onBack: () => void; action?: React.ReactNode }> = ({ title, onBack, action }) => <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={onBack} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:underline"><ArrowLeft size={16} />Back</button><span className="truncate text-sm font-semibold text-slate-700">{title}</span></div>{action}</div>;
const CardGrid: React.FC<{ items: any[]; label: string; onSelect: (item: any) => void; empty?: string }> = ({ items, label, onSelect, empty = 'Nothing found.' }) => <section className="space-y-3"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700">{label === 'Class' ? <GraduationCap size={18} /> : <Users size={18} />}{label}s</div>{items.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{items.map((item) => <button key={item.id} type="button" onClick={() => onSelect(item)} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-blue-300 hover:shadow-md"><span className="font-semibold text-slate-900">{label} {item.name}</span><ChevronRight size={18} className="text-slate-400" /></button>)}</div> : <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">{empty}</div>}</section>;
const StudentCards: React.FC<{ students: any[]; onSelect: (student: any) => void }> = ({ students, onSelect }) => <section className="space-y-3"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Users size={18} />Students</div>{students.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{students.map((student) => <button key={student.id} type="button" onClick={() => onSelect(student)} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-blue-300 hover:shadow-md"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{student.name.charAt(0)}</span><span><span className="block font-semibold text-slate-900">{student.name}</span><span className="text-xs text-slate-500">Roll {student.rollNumber}</span></span></button>)}</div> : <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No students found.</div>}</section>;
const FeeRows: React.FC<{ fees: Fee[]; onPay: (fee: Fee) => void; loading: boolean }> = ({ fees, onPay, loading }) => <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">{loading ? <p className="py-6 text-center text-sm text-slate-500">Loading fees...</p> : fees.length ? <div className="space-y-2">{fees.map((fee) => <div key={fee.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0"><div><p className="font-medium text-slate-900">{fee.feeName}</p><p className="text-xs text-slate-500">Due: ৳{fee.dueAmount.toFixed(2)} · {fee.status}</p></div>{fee.status !== 'paid' && <button type="button" onClick={() => onPay(fee)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"><DollarSign size={14} />Process Payment</button>}</div>)}</div> : <p className="py-6 text-center text-sm text-slate-500">No fees found for this student.</p>}</div>;
const FeeTable: React.FC<{ fees: Fee[]; onPay: (fee: Fee) => void; onView: (fee: Fee) => void; onEdit: (fee: Fee) => void; onDelete: (id: string) => void; loading: boolean }> = ({ fees, onPay, onView, onEdit, onDelete, loading }) => <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{loading ? <p className="py-8 text-center text-sm text-slate-500">Loading fees...</p> : <div className="overflow-x-auto"><table className="w-full min-w-[1000px]"><thead><tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-400"><th className="px-4 py-3 text-left">Student</th><th className="px-4 py-3 text-left">Fee Type</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">Paid</th><th className="px-4 py-3 text-right">Due</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Due Date</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{fees.length ? fees.map((fee: any) => { const StatusIcon = fee.status === 'paid' ? CheckCircle : fee.status === 'partial' ? Clock : fee.status === 'overdue' ? AlertCircle : XCircle; return <tr key={fee.id} className="border-b border-slate-100 last:border-0"><td className="px-4 py-3"><p className="text-sm font-semibold text-slate-900">{fee.student?.name || fee.studentName || 'Unknown'}</p><p className="text-xs text-slate-500">Roll: {fee.student?.rollNumber || fee.studentRoll || '-'}</p></td><td className="px-4 py-3 text-sm text-slate-700">{fee.feeName || fee.feeStructure?.name || fee.feeStructure?.type || 'Fee'}</td><td className="px-4 py-3 text-right text-sm">৳{Number(fee.totalAmount || fee.amount || 0).toFixed(2)}</td><td className="px-4 py-3 text-right text-sm text-emerald-600">৳{Number(fee.paidAmount || 0).toFixed(2)}</td><td className="px-4 py-3 text-right text-sm font-semibold text-red-600">৳{Number(fee.dueAmount || 0).toFixed(2)}</td><td className="px-4 py-3 text-center"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${fee.status === 'unpaid' || fee.status === 'overdue' ? 'bg-red-50 text-red-600' : fee.status === 'partial' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}><StatusIcon size={13} />{fee.status}</span></td><td className="px-4 py-3 text-center text-sm text-slate-600">{new Date(fee.dueDate).toLocaleDateString()}</td><td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button type="button" onClick={() => onView(fee)} title="View" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Eye size={16} /></button>{fee.status !== 'paid' && <button type="button" onClick={() => onPay(fee)} title="Pay" className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100"><DollarSign size={16} /></button>}<button type="button" onClick={() => onEdit(fee)} title="Edit" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Edit size={16} /></button><button type="button" onClick={() => onDelete(fee.id)} title="Delete" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button></div></td></tr>; }) : <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">No fees found for students in this section.</td></tr>}</tbody></table></div>}</div>;
