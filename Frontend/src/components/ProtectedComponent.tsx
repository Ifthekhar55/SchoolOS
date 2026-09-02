import React from 'react';
import { Permission } from '../types/user';
import { usePermissions } from '../contexts/PermissionContext';

interface ProtectedComponentProps {
  permission: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  permission,
  fallback,
  children,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
};