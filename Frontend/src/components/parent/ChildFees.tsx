import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { parentApi } from '../../services/parentApi';
import { ChildFee } from '../../types/parent';

interface ChildFeesProps {
  childId: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  paid: {
    label: 'Paid',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: CheckCircle,
  },
  partial: {
    label: 'Partial',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: Clock,
  },
  unpaid: {
    label: 'Unpaid',
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: XCircle,
  },
  overdue: {
    label: 'Overdue',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: AlertCircle,
  },
};

export const ChildFees: React.FC<ChildFeesProps> = ({ childId }) => {
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState<ChildFee[]>([]);
  const [summary, setSummary] = useState<{ totalDue: number; totalPaid: number; overdueCount: number } | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedFee, setSelectedFee] = useState<ChildFee | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    loadFees();
  }, [childId]);

  const loadFees = async () => {
    try {
      setLoading(true);
      const [feesData, summaryData] = await Promise.all([
        parentApi.getChildFees(childId),
        parentApi.getFeeSummary(childId),
      ]);
      setFees(feesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedFee) return;
    try {
      await parentApi.makePayment({
        childId,
        feeId: selectedFee.id,
        amount: selectedFee.dueAmount,
        method: paymentMethod,
      });
      setShowPayment(false);
      setSelectedFee(null);
      loadFees();
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toFixed(2)}`;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status];
    const Icon = config?.icon || CheckCircle;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config?.bg || 'bg-slate-50'} ${config?.color || 'text-slate-600'}`}>
        <Icon size={12} />
        {config?.label || status}
      </span>
    );
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
          <h2 className="text-lg font-bold text-slate-900">Fees</h2>
          <p className="text-sm text-slate-500">
            Fee summary and payment history
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadFees}
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

      {/* Summary */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalPaid)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Due</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalDue)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Overdue</p>
            <p className="text-2xl font-bold text-red-700">
              {summary.overdueCount}
            </p>
          </div>
        </div>
      )}

      {/* Fee List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Fee Name</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Paid</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Due</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-400">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-400">Due Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    No fees found
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {fee.feeName}
                      {fee.month && <span className="text-xs text-slate-500 block">({fee.month} {fee.year})</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                      {formatCurrency(fee.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-emerald-600">
                      {formatCurrency(fee.paidAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                      {formatCurrency(fee.dueAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={fee.status} />
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600">
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {fee.status !== 'paid' && (
                        <button
                          onClick={() => {
                            setSelectedFee(fee);
                            setShowPayment(true);
                          }}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Make Payment</h3>
                <p className="text-sm text-slate-500">{selectedFee.feeName}</p>
              </div>
              <button
                onClick={() => {
                  setShowPayment(false);
                  setSelectedFee(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Due Amount</span>
                <span className="font-bold text-red-600">
                  ৳{selectedFee.dueAmount}
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cash', label: 'Cash', icon: Banknote },
                    { value: 'bank', label: 'Bank', icon: Building2 },
                    { value: 'bkash', label: 'bKash', icon: Smartphone },
                    { value: 'nagad', label: 'Nagad', icon: Smartphone },
                    { value: 'card', label: 'Card', icon: CreditCard },
                    { value: 'online', label: 'Online', icon: CreditCard },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPaymentMethod(value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition ${
                        paymentMethod === value
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowPayment(false);
                    setSelectedFee(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add X import
import { X } from 'lucide-react';