import { apiClient } from '@/lib/api';
import { Tenant } from '@/types';

export interface CreateTenantData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  school_code?: string;
}

export interface UpdateTenantData extends Partial<CreateTenantData> {
  is_active?: boolean;
}

export interface CreateTenantAdminData {
  tenant_id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export const tenantService = {
  /**
   * Get all tenants
   */
  async getAll(): Promise<Tenant[]> {
    const response = await apiClient.get('/tenants/');
    return response.data;
  },

  /**
   * Get tenant by ID
   */
  async getById(id: string): Promise<Tenant> {
    const response = await apiClient.get(`/tenants/${id}/`);
    return response.data;
  },

  /**
   * Create a new tenant
   */
  async create(data: CreateTenantData): Promise<Tenant> {
    const response = await apiClient.post('/tenants/', data);
    return response.data;
  },

  /**
   * Update a tenant
   */
  async update(id: string, data: UpdateTenantData): Promise<Tenant> {
    const response = await apiClient.put(`/tenants/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a tenant
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tenants/${id}/`);
  },

  /**
   * Get users of a tenant
   */
  async getUsers(tenantId: string) {
    const response = await apiClient.get(`/tenants/${tenantId}/users/`);
    return response.data;
  },

  /**
   * Create a tenant admin
   */
  async createTenantAdmin(data: CreateTenantAdminData) {
    const response = await apiClient.post('/auth/tenant-admin/create/', data);
    return response.data;
  },

  /**
   * Get audit logs
   */
  async getAuditLogs(params?: { tenant_id?: string; action?: string; limit?: number }) {
    const response = await apiClient.get('/auth/audit-logs/', { params });
    return response.data;
  },
};
