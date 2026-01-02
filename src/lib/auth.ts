import api from './api';
import Cookies from 'js-cookie';
import { LoginResponse, User } from '@/types';

export const authService = {
  // Super Admin Login
  async superAdminLogin(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/super-admin/login/', {
      email,
      password,
    });
    
    const { access, refresh, user, session_id } = response.data;
    
    // Store tokens and user in cookies
    Cookies.set('access_token', access, { expires: 1 });
    Cookies.set('refresh_token', refresh, { expires: 7 });
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    
    if (session_id) {
      Cookies.set('session_id', session_id, { expires: 7 });
    }
    
    return response.data;
  },
  
  // Tenant User Login (Tenant Admin, Student, Teacher, Parent)
  async tenantLogin(email: string, password: string, schoolCodeOrTenantId?: string): Promise<LoginResponse> {
    let tenantId = schoolCodeOrTenantId;
    
    console.log('🔍 Login attempt:', { email, schoolCodeOrTenantId });
    
    // If schoolCodeOrTenantId looks like a school code (not a UUID), look up the tenant
    if (schoolCodeOrTenantId && !schoolCodeOrTenantId.includes('-')) {
      try {
        console.log('🔍 Looking up tenant by school code:', schoolCodeOrTenantId);
        const response = await api.get(`/tenants/by-school-code/?school_code=${schoolCodeOrTenantId}`);
        tenantId = response.data.tenant_id;
        console.log('✅ Tenant ID found:', tenantId);
      } catch (error: any) {
        console.error('❌ Failed to lookup tenant:', error.response?.data || error.message);
        throw new Error('Invalid school code');
      }
    }
    
    console.log('🔍 Attempting login with tenant ID:', tenantId);
    
    try {
      const response = await api.post<LoginResponse>(
        '/auth/login/',
        { email, password },
        {
          headers: tenantId ? { 'X-Tenant-ID': tenantId } : {},
          params: tenantId ? { tenant_id: tenantId } : {},
        }
      );
      
      console.log('✅ Login successful:', response.data.user);
      
      const { access, refresh, user } = response.data;
      
      // Store tokens and user in cookies
      Cookies.set('access_token', access, { expires: 1 });
      Cookies.set('refresh_token', refresh, { expires: 7 });
      Cookies.set('user', JSON.stringify(user), { expires: 7 });
      
      if (user.tenant) {
        Cookies.set('tenant_id', user.tenant, { expires: 7 });
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login API failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all cookies
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user');
      Cookies.remove('tenant_id');
      Cookies.remove('session_id');
    }
  },
  
  // Get current user from cookies
  getCurrentUser(): User | null {
    const userStr = Cookies.get('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!Cookies.get('access_token');
  },
  
  // Get user profile from API
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile/');
    
    // Update user in cookies
    Cookies.set('user', JSON.stringify(response.data), { expires: 7 });
    
    return response.data;
  },
};
