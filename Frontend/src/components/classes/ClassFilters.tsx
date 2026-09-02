import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, X, Filter } from 'lucide-react';
import { ClassFilters } from '../../types/class';
import { classApi } from '../../services/classApi';

interface ClassFiltersProps {
  filters: ClassFilters;
  onFilterChange: (filters: ClassFilters) => void;
  onSearch: () => void;
  onReset: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  total?: number;
  schoolId: string;
}

export const ClassFiltersComponent: React.FC<ClassFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  onRefresh,
  isLoading = false,
  total = 0,
  schoolId,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      const data = await classApi.getAcademicYears(schoolId);
      setAcademicYears(data);
    } catch (error) {
      console.error('Failed to load academic years:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchTerm, page: 1 });
    onSearch();
  };

  const handleFilterChange = (key: keyof ClassFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const handleReset = () => {
    setSearchTerm('');
    onReset();
  };

  const hasFilters = filters.search || filters.academicYearId || 
                     filters.teacherId || filters.isActive !== undefined;

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
              placeholder="Search by class name, code..."
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
          value={filters.academicYearId || ''}
          onChange={(e) => handleFilterChange('academicYearId', e.target.value || undefined)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Academic Years</option>
          {academicYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name} ({year.isCurrent ? 'Current' : ''})
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
            {total} class{total !== 1 ? 'es' : ''}
          </span>
        )}
      </div>
    </div>
  );
};