'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Loading } from '@/components/ui/Loading';
import { UserRole } from '@/types';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const { hasAnyRole } = useRole();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && allowedRoles && user) {
      if (!hasAnyRole(allowedRoles)) {
        // User doesn't have required role, redirect to unauthorized page
        router.push('/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, allowedRoles, user, hasAnyRole, router]);

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !hasAnyRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
