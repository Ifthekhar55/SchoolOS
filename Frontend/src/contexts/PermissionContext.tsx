import React, { createContext, useState, useContext, useEffect } from 'react';
import { Permission, PermissionContextType, User } from '../types/user';
import type { User as AuthUser } from '../types/auth';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../services/userApi';
import { ROLE_DEFINITIONS } from '../constants/roles';

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      loadUserPermissions(authUser);
    } else {
      setUser(null);
      setPermissions([]);
      setIsLoading(false);
    }
  }, [authUser]);

  const loadUserPermissions = async (user: AuthUser) => {
    try {
      setIsLoading(true);
      const permissionUser = user as User;
      setUser(permissionUser);
      
      // Get permissions from role definition
      const roleDefinition = ROLE_DEFINITIONS[permissionUser.role];
      if (roleDefinition) {
        setPermissions(roleDefinition.permissions as Permission[]);
      } else {
        // Fallback: fetch from API
        const perms = await userApi.getUserPermissions(permissionUser.id);
        setPermissions(perms as Permission[]);
      }
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: Permission | Permission[]): boolean => {
    if (!user || !permissions.length) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p));
    }
    return permissions.includes(permission);
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const checkAccess = (permission: Permission, fallback?: React.ReactNode): React.ReactNode => {
    if (hasPermission(permission)) {
      return null;
    }
    return fallback || null;
  };

  const value: PermissionContextType = {
    user,
    permissions,
    hasPermission,
    hasRole,
    isLoading,
    checkAccess,
  };

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};