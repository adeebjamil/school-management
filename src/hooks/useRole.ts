'use client';

import { useAuth } from './useAuth';
import { UserRole } from '@/types';

export function useRole() {
  const { user } = useAuth();

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const isSuperAdmin = (): boolean => hasRole('super_admin');
  const isTenantAdmin = (): boolean => hasRole('tenant_admin');
  const isStudent = (): boolean => hasRole('student');
  const isTeacher = (): boolean => hasRole('teacher');
  const isParent = (): boolean => hasRole('parent');

  const hasAnyRole = (roles: UserRole[]): boolean => hasRole(roles);
  const hasAllRoles = (roles: UserRole[]): boolean => hasRole(roles);

  return {
    role: user?.role,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isSuperAdmin,
    isTenantAdmin,
    isStudent,
    isTeacher,
    isParent,
  };
}
