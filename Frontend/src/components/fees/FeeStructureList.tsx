import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  DollarSign,
  Calendar,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { feeApi } from '../../services/feeApi';
import { FeeStructure } from '../../types/fee';
import { ProtectedComponent } from '../ProtectedComponent';

interface FeeStructureListProps {
  onCreate: () => void;
  onEdit: (structure: FeeStructure) => void;
  onView?: (structure: FeeStructure) => void;
}

export const FeeStructureList: React.FC<FeeStructureListProps> = ({
  onCreate,
  onEdit,
  onView,
}) => {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStructures();
  }, []);

  const loadStructures = async () => {
    try {
      setLoading(true);
      const data = await feeApi.getFeeStructures();
      setStructures(data || []);
    } catch (error) {
      console.error('Failed to load fee structures:', error);
      setStructures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee structure?')) return;

    try {
      await feeApi.deleteFeeStructure(id);
      await loadStructures();
    } catch (error) {
      console.error('Failed to delete fee structure:', error);
    }
  };

  const formatCurrency = (amount: number) => `৳${Number(amount).toFixed(2)}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Fee Structures</h2>
          <p className="text-sm text-slate-500">Manage school fee categories and default billing rules</p>
        </div>

        <ProtectedComponent permission="fees:create">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Structure
          </button>
        </ProtectedComponent>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : structures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <DollarSign className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">No fee structures found</h3>
          <p className="mt-1 text-sm text-slate-500">Create your first fee category to start billing students.</p>
          <ProtectedComponent permission="fees:create">
            <button
              type="button"
              onClick={onCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Structure
            </button>
          </ProtectedComponent>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {structures.map((structure) => (
                  <tr key={structure.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{structure.name}</p>
                        <p className="text-xs text-slate-500">
                          {structure.className ? `Class ${structure.className}` : 'All classes'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{structure.type}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(structure.amount)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{structure.frequency || 'monthly'}</td>
                    <td className="px-4 py-3">
                      {structure.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          <ShieldCheck size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                          <ShieldAlert size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(structure)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                        )}

                        <ProtectedComponent permission="fees:edit">
                          <button
                            type="button"
                            onClick={() => onEdit(structure)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        </ProtectedComponent>

                        <ProtectedComponent permission="fees:delete">
                          <button
                            type="button"
                            onClick={() => handleDelete(structure.id)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
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
  );
};
