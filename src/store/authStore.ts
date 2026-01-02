import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, isSuperAdmin?: boolean, tenantId?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  
  login: async (email, password, isSuperAdmin = false, tenantId) => {
    try {
      let response;
      
      if (isSuperAdmin) {
        response = await authService.superAdminLogin(email, password);
      } else {
        response = await authService.tenantLogin(email, password, tenantId);
      }
      
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  
  loadUser: () => {
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    set({ user, isAuthenticated, isLoading: false });
  },
}));
