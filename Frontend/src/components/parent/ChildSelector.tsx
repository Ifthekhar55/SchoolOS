import React from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { Child } from '../../types/parent';

interface ChildSelectorProps {
  children: Child[];
  selectedChildId?: string;
  onSelect: (childId: string) => void;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  children,
  selectedChildId,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {selectedChild?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {selectedChild?.name || 'Select Child'}
            </p>
            <p className="text-xs text-slate-500">
              Class {selectedChild?.className}
              {selectedChild?.sectionName && ` - ${selectedChild.sectionName}`}
              {selectedChild?.rollNumber && ` • Roll ${selectedChild.rollNumber}`}
            </p>
          </div>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => {
                  onSelect(child.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                  child.id === selectedChildId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {child.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">{child.name}</p>
                  <p className="text-xs text-slate-500">
                    Class {child.className}
                    {child.sectionName && ` - ${child.sectionName}`}
                    {child.rollNumber && ` • Roll ${child.rollNumber}`}
                  </p>
                </div>
                {child.id === selectedChildId && (
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};