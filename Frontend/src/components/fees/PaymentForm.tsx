import React, { useState } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
} from 'lucide-react';
import { Fee, PaymentMethod } from '../../types/fee';
import { feeApi } from '../../services/feeApi';

interface PaymentFormProps {
  fee: Fee;
  onClose: () => void;
  onSuccess: () => void;
}

const paymentMethods: { value: PaymentMethod; label: string; icon: any }[] = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'bank', label: 'Bank Transfer', icon: Building2 },
  { value: 'bkash', label: 'bKash', icon: Smartphone },
  { value: 'nagad', label: 'Nagad', icon: Smartphone },
  { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
  { value: 'online', label: 'Online Payment', icon: CreditCard },
];

export const PaymentForm: React.FC<PaymentFormProps> = ({
  fee,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: fee.dueAmount || fee.amount,
    method: 'cash' as PaymentMethod,
    transactionId: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentData.amount || paymentData.amount <= 0) {
      newErrors.amount = 'Valid payment amount is required';
    }
    if (paymentData.amount > fee.dueAmount) {
      newErrors.amount = `Amount cannot exceed due amount (${fee.dueAmount})`;
    }
    if (!paymentData.method) {
      newErrors.method = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setSuccess('');

      // Process the payment
      await feeApi.processPayment({
        studentId: fee.studentId,
        feeId: fee.id,
        invoiceId: (fee as any).invoiceId || undefined,
        amount: paymentData.amount,
        method: paymentData.method,
        transactionId: paymentData.transactionId || undefined,
        notes: paymentData.notes || undefined,
      });

      setSuccess('Payment processed successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to process payment' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const PaymentMethodIcon = ({ method }: { method: PaymentMethod }) => {
    const found = paymentMethods.find(m => m.value === method);
    const Icon = found?.icon || CreditCard;
    return <Icon size={16} className="inline mr-2" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Process Payment</h2>
            <p className="text-sm text-slate-500">
              {fee.studentName} - {fee.feeName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Fee Summary */}
          <div className="rounded-lg bg-slate-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Amount</span>
              <span className="font-semibold text-slate-900">৳{fee.totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Already Paid</span>
              <span className="font-semibold text-emerald-600">৳{fee.paidAmount}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
              <span className="font-medium text-slate-700">Due Amount</span>
              <span className="font-bold text-red-600">৳{fee.dueAmount}</span>
            </div>
          </div>

          {errors.submit && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              <AlertCircle size={18} />
              {errors.submit}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600 border border-emerald-200">
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          <div className="space-y-4">
            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Payment Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="amount"
                  value={paymentData.amount || ''}
                  onChange={handleInputChange}
                  max={fee.dueAmount}
                  className={`w-full rounded-lg border ${
                    errors.amount ? 'border-red-500' : 'border-slate-200'
                  } bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white`}
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                />
              </div>
              {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentData(prev => ({ ...prev, method: value }))}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition ${
                      paymentData.method === value
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              {errors.method && <p className="mt-1 text-xs text-red-500">{errors.method}</p>}
            </div>

            {/* Transaction ID */}
            {(paymentData.method === 'bkash' || paymentData.method === 'nagad' || paymentData.method === 'online') && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="transactionId"
                  value={paymentData.transactionId || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="Enter transaction ID"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={paymentData.notes || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fee.dueAmount === 0}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Process Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};