import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Filter,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Shield,
  Eye
} from 'lucide-react';
import { User, UserFilters, UserRole } from '../../types/user';
import { userApi } from '../../services/userApi';
import { usePermissions } from '../../contexts/PermissionContext';
import { UserStatusBadge } from './UserStatusBadge';
import { ROLE_DEFINITIONS, ROLE_OPTIONS } from '../../constants/roles';
import { ProtectedComponent } from '../ProtectedComponent';

interface UserListProps {
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onCreate: () => void;
}

export const UserList: React.FC<UserListProps> = ({ onEdit, onView, onCreate }) => {
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUsers(filters);
      setUsers(response.users);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
  };

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await userApi.deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await userApi.deactivateUser(user.id);
      } else {
        await userApi.activateUser(user.id);
      }
      loadUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const getRoleDisplay = (role: UserRole) => {
    const roleDef = ROLE_DEFINITIONS[role];
    return roleDef?.displayName || role;
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-700',
      school_admin: 'bg-blue-100 text-blue-700',
      principal: 'bg-indigo-100 text-indigo-700',
      teacher: 'bg-emerald-100 text-emerald-700',
      student: 'bg-amber-100 text-amber-700',
      parent: 'bg-pink-100 text-pink-700',
      accountant: 'bg-cyan-100 text-cyan-700',
      librarian: 'bg-orange-100 text-orange-700',
      transport_manager: 'bg-teal-100 text-teal-700',
      hr_manager: 'bg-rose-100 text-rose-700',
    };
    return colors[role] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500">
            Manage users and their roles
          </p>
        </div>
        <ProtectedComponent permission="users:create">
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Add User
          </button>
        </ProtectedComponent>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, email, phone..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.role || ''}
              onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Roles</option>
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
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
            <button
              onClick={loadUsers}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                  Last Login
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusBadge 
                        isActive={user.isActive} 
                        isVerified={user.isVerified}
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {user.lastLoginAt ? (
                        new Date(user.lastLoginAt).toLocaleDateString()
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(user)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <ProtectedComponent permission="users:edit">
                          <button
                            onClick={() => onEdit(user)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        </ProtectedComponent>
                        <ProtectedComponent permission="users:activate">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                        </ProtectedComponent>
                        <ProtectedComponent permission="users:delete">
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </ProtectedComponent>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <div className="text-xs text-slate-500">
              Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to{' '}
              {Math.min((filters.page || 1) * (filters.limit || 10), total)} of {total} users
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange((filters.page || 1) - 1)}
                disabled={filters.page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-sm">
                Page {filters.page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange((filters.page || 1) + 1)}
                disabled={filters.page === totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};