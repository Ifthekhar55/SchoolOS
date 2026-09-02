import React from 'react';
import { Search, Filter, X, Download, Upload, RefreshCw } from 'lucide-react';
import { StudentFilters } from '../../types/student';

interface StudentFiltersProps {
  filters: StudentFilters;
  onFilterChange: (filters: StudentFilters) => void;
  onSearch: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  total?: number;
}

const classOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const sectionOptions = ['A', 'B', 'C', 'D', 'E'];
const genderOptions = ['male', 'female', 'other'];

export const StudentFiltersComponent: React.FC<StudentFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  onExport,
  onImport,
  onRefresh,
  isLoading = false,
  total = 0,
}) => {
  const [searchTerm, setSearchTerm] = React.useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchTerm, page: 1 });
    onSearch();
  };

  const handleFilterChange = (key: keyof StudentFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const handleReset = () => {
    setSearchTerm('');
    onReset();
  };

  const hasFilters = filters.search || filters.class || filters.section || filters.gender || filters.isActive !== undefined;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, roll number, phone, email..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filters.class || ''}
          onChange={(e) => handleFilterChange('class', e.target.value || undefined)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Classes</option>
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>Class {cls}</option>
          ))}
        </select>

        <select
          value={filters.section || ''}
          onChange={(e) => handleFilterChange('section', e.target.value || undefined)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Sections</option>
          {sectionOptions.map((sec) => (
            <option key={sec} value={sec}>Section {sec}</option>
          ))}
        </select>

        <select
          value={filters.gender || ''}
          onChange={(e) => handleFilterChange('gender', e.target.value || undefined)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Genders</option>
          {genderOptions.map((gender) => (
            <option key={gender} value={gender}>
              {gender.charAt(0).toUpperCase() + gender.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.isActive !== undefined ? String(filters.isActive) : ''}
          onChange={(e) => {
            const value = e.target.value;
            handleFilterChange('isActive', value === '' ? undefined : value === 'true');
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onImport}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Upload size={16} />
            Import
          </button>
          <button
            onClick={onExport}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
        </div>

        {hasFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <X size={16} />
            Clear filters
          </button>
        )}

        {total > 0 && (
          <span className="ml-auto text-sm text-slate-500">
            {total} student{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};