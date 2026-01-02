import axios, { InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth for public endpoints
    const publicEndpoints = [
      '/tenants/by-school-code',
      '/auth/login',
      '/auth/super-admin/login',
      '/auth/forgot-password',
      '/auth/reset-password',
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    const token = Cookies.get('access_token');
    const tenantId = Cookies.get('tenant_id');
    
    // Only add auth token for non-public endpoints
    if (token && config.headers && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant ID for tenant-specific requests (but not for public endpoints or super-admin)
    if (tenantId && !config.url?.includes('super-admin') && !isPublicEndpoint) {
      // Add as header
      if (config.headers) {
        config.headers['X-Tenant-ID'] = tenantId;
      }
      
      // Also add as query parameter for better compatibility
      if (!config.params) {
        config.params = {};
      }
      config.params.tenant_id = tenantId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = Cookies.get('refresh_token');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          Cookies.set('access_token', access, { expires: 1 });
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          Cookies.remove('user');
          Cookies.remove('tenant_id');
          
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

const apiClient = api;

export default apiClient;
export { apiClient };
