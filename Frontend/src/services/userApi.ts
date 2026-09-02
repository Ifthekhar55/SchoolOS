import { api } from './api';
import { 
  User, 
  Role, 
  UserFilters, 
  UserListResponse,
  CreateUserData,
  UpdateUserData,
  CreateRoleData,
  UpdateRoleData
} from '../types/user';

class UserApiService {
  // ============ User Management ============
  
  async getUsers(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return api.request<UserListResponse>(`/users?${params.toString()}`);
  }

  async getUser(id: string): Promise<User> {
    return api.request<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserData): Promise<User> {
    return api.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return api.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return api.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async activateUser(id: string): Promise<User> {
    return api.request<User>(`/users/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateUser(id: string): Promise<User> {
    return api.request<User>(`/users/${id}/deactivate`, {
      method: 'POST',
    });
  }

  async assignRole(userId: string, roleId: string): Promise<User> {
    return api.request<User>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleId }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return api.request<User>('/users/me');
  }

  // ============ Role Management ============
  
  async getRoles(): Promise<Role[]> {
    return api.request<Role[]>('/roles');
  }

  async getRole(id: string): Promise<Role> {
    return api.request<Role>(`/roles/${id}`);
  }

  async createRole(data: CreateRoleData): Promise<Role> {
    return api.request<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    return api.request<Role>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: string): Promise<void> {
    return api.request<void>(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Permissions ============
  
  async getUserPermissions(userId: string): Promise<string[]> {
    return api.request<string[]>(`/users/${userId}/permissions`);
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    return api.request<string[]>(`/roles/${roleId}/permissions`);
  }

  async updateRolePermissions(roleId: string, permissions: string[]): Promise<Role> {
    return api.request<Role>(`/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  }
}

export const userApi = new UserApiService();