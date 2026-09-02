import React, { useEffect, useState } from 'react';
import { AlertTriangle, CircleDollarSign, CreditCard, TrendingUp } from 'lucide-react';
import { feeApi } from '../services/feeApi';
import { Fee, FeeStructure } from '../types/fee';
import { StudentFeeBrowser } from '../components/fees/StudentFeeBrowser';
import { FeeForm } from '../components/fees/FeeForm';
import { PaymentForm } from '../components/fees/PaymentForm';
import { FeeStructureList } from '../components/fees/FeeStructureList';
import { FeeStructureForm } from '../components/fees/FeeStructureForm';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const formatCurrency = (value: number) => `৳${value.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const FeesPage: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | undefined>();
  const [editingStructure, setEditingStructure] = useState<FeeStructure | undefined>();
  const [selectedFee, setSelectedFee] = useState<Fee | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [structureRefreshKey, setStructureRefreshKey] = useState(0);
  const [feeStudentFilter, setFeeStudentFilter] = useState<{ class?: string; section?: string }>();
  const [summaryScope, setSummaryScope] = useState<{ classId?: string; sectionId?: string; className?: string; sectionName?: string } | null>(null);
  const [feeSummary, setFeeSummary] = useState({
    totalCollected: 0,
    totalDue: 0,
    totalOverdue: 0,
    collectionRate: 0,
    paid: 0,
    partial: 0,
    unpaid: 0,
    overdue: 0,
  });

  useEffect(() => {
    if (isStudent) return;

    const loadFeeSummary = async () => {
      try {
        const stats = await feeApi.getStatistics({
          classId: summaryScope?.classId,
          sectionId: summaryScope?.sectionId,
        });

        const hasScopeData = (stats?.totalDue || 0) > 0 || (stats?.totalCollected || 0) > 0 || (stats?.totalOverdue || 0) > 0;

        if (summaryScope?.classId || summaryScope?.sectionId) {
          if (hasScopeData) {
            setFeeSummary({
              totalCollected: stats?.totalCollected || 0,
              totalDue: stats?.totalDue || 0,
              totalOverdue: stats?.totalOverdue || 0,
              collectionRate: stats?.collectionRate || 0,
              paid: stats?.byStatus?.paid || 0,
              partial: stats?.byStatus?.partial || 0,
              unpaid: stats?.byStatus?.unpaid || 0,
              overdue: stats?.byStatus?.overdue || 0,
            });
            return;
          }

          const response = await feeApi.getFees({
            classId: summaryScope.classId,
            sectionId: summaryScope.sectionId,
            limit: 9999,
          });

          const fees = response.fees || [];
          const totalCollected = fees.reduce((sum, fee) => sum + Number(fee.paidAmount || 0), 0);
          const totalDue = fees.reduce((sum, fee) => sum + Number(fee.dueAmount || 0), 0);
          const totalOverdue = fees
            .filter((fee) => fee.status === 'overdue')
            .reduce((sum, fee) => sum + Number(fee.dueAmount || 0), 0);
          const totalAmount = fees.reduce((sum, fee) => sum + Number(fee.totalAmount || fee.amount || 0), 0);
          const byStatus = {
            paid: fees.filter((fee) => fee.status === 'paid').length,
            partial: fees.filter((fee) => fee.status === 'partial').length,
            unpaid: fees.filter((fee) => fee.status === 'unpaid').length,
            overdue: fees.filter((fee) => fee.status === 'overdue').length,
          };

          setFeeSummary({
            totalCollected,
            totalDue,
            totalOverdue,
            collectionRate: totalAmount > 0 ? (totalCollected / totalAmount) * 100 : 0,
            paid: byStatus.paid,
            partial: byStatus.partial,
            unpaid: byStatus.unpaid,
            overdue: byStatus.overdue,
          });
          return;
        }

        setFeeSummary({
          totalCollected: stats?.totalCollected || 0,
          totalDue: stats?.totalDue || 0,
          totalOverdue: stats?.totalOverdue || 0,
          collectionRate: stats?.collectionRate || 0,
          paid: stats?.byStatus?.paid || 0,
          partial: stats?.byStatus?.partial || 0,
          unpaid: stats?.byStatus?.unpaid || 0,
          overdue: stats?.byStatus?.overdue || 0,
        });
      } catch (error) {
        console.error('Failed to load fee summary:', error);
      }
    };

    loadFeeSummary();
  }, [isStudent, refreshKey, summaryScope]);

  const handleCreate = (studentFilter?: { class?: string; section?: string }) => {
    setEditingFee(undefined);
    setFeeStudentFilter(studentFilter);
    setShowForm(true);
  };

  const handleEdit = (fee: Fee) => {
    setEditingFee(fee);
    setFeeStudentFilter(undefined);
    setShowForm(true);
  };

  const handleView = (fee: Fee) => {
    console.log('View fee:', fee);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fee entry?')) return;

    try {
      await feeApi.deleteFee(id);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete fee:', error);
    }
  };

  const handlePay = (fee: Fee) => {
    setSelectedFee(fee);
    setShowPayment(true);
  };

  const handleStructureCreate = () => {
    setEditingStructure(undefined);
    setShowStructureForm(true);
  };

  const handleStructureEdit = (structure: FeeStructure) => {
    setEditingStructure(structure);
    setShowStructureForm(true);
  };

  const handleStructureSuccess = () => {
    setShowStructureForm(false);
    setEditingStructure(undefined);
    setStructureRefreshKey(prev => prev + 1);
    setRefreshKey(prev => prev + 1);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setShowPayment(false);
    setEditingFee(undefined);
    setSelectedFee(undefined);
    setFeeStudentFilter(undefined);
    setRefreshKey(prev => prev + 1);
  };

  const summaryCards = [
    {
      label: 'Total Collection',
      value: formatCurrency(feeSummary.totalCollected),
      detail: `${feeSummary.paid + feeSummary.partial} entries cleared`,
      tone: 'emerald',
      icon: CircleDollarSign,
    },
    {
      label: 'Due',
      value: formatCurrency(feeSummary.totalDue),
      detail: `${feeSummary.unpaid + feeSummary.partial} still pending`,
      tone: 'amber',
      icon: CreditCard,
    },
    {
      label: 'Collection %',
      value: `${feeSummary.collectionRate.toFixed(1)}%`,
      detail: 'against total due',
      tone: 'sky',
      icon: TrendingUp,
    },
    {
      label: 'Overdue',
      value: formatCurrency(feeSummary.totalOverdue),
      detail: `${feeSummary.overdue} records overdue`,
      tone: 'rose',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-0 pt-16 md:ml-64 md:pt-16">
        <Topbar />

        <main className="space-y-6 p-4 md:p-6">
          <div className="space-y-6">
            {!isStudent && (
              <>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <FeeStructureList
                    key={structureRefreshKey}
                    onCreate={handleStructureCreate}
                    onEdit={handleStructureEdit}
                    onView={(structure) => console.log('View fee structure:', structure)}
                  />
                </div>

                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Fee Summary</h3>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      Scope: {summaryScope?.sectionName
                        ? `${summaryScope.className || 'Class'} / ${summaryScope.sectionName}`
                        : summaryScope?.className
                          ? `${summaryScope.className}`
                          : 'School Wide'}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map(({ label, value, detail, tone, icon: Icon }) => (
                      <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                            <h4 className="mt-2 text-2xl font-bold text-slate-900">{value}</h4>
                          </div>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            tone === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                            tone === 'amber' ? 'bg-amber-100 text-amber-600' :
                            tone === 'sky' ? 'bg-sky-100 text-sky-600' : 'bg-rose-100 text-rose-600'}
                          `}>
                            <Icon size={18} />
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">{detail}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            <StudentFeeBrowser
              key={refreshKey}
              onCreate={handleCreate}
              onPay={handlePay}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelectionChange={setSummaryScope}
            />

            {showForm && !isStudent && (
              <FeeForm
                fee={editingFee}
                schoolId={user?.schoolId || ''}
                studentFilter={feeStudentFilter}
                onClose={() => {
                  setShowForm(false);
                  setEditingFee(undefined);
                  setFeeStudentFilter(undefined);
                }}
                onSuccess={handleSuccess}
              />
            )}

            {showStructureForm && !isStudent && (
              <FeeStructureForm
                structure={editingStructure}
                onClose={() => {
                  setShowStructureForm(false);
                  setEditingStructure(undefined);
                }}
                onSuccess={handleStructureSuccess}
              />
            )}

            {showPayment && selectedFee && (
              <PaymentForm
                fee={selectedFee}
                onClose={() => {
                  setShowPayment(false);
                  setSelectedFee(undefined);
                }}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};