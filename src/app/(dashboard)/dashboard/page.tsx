'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/ui/Loading';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'super_admin':
          router.push('/super-admin/dashboard');
          break;
        case 'tenant_admin':
          router.push('/tenant-admin/dashboard');
          break;
        case 'student':
          router.push('/student/dashboard');
          break;
        case 'teacher':
          router.push('/teacher/dashboard');
          break;
        case 'parent':
          router.push('/parent/dashboard');
          break;
        default:
          router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return <Loading fullScreen text="Redirecting to your dashboard..." />;
}
