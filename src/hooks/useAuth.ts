'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, loadUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      loadUser();
    }
  }, [isAuthenticated, isLoading, loadUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth: loadUser,
  };
}
