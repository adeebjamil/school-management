import { apiClient } from '@/lib/api';
import { Parent } from '@/types';

export interface CreateParentData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  occupation?: string;
  student_ids?: string[];
}

export interface UpdateParentData extends Partial<Omit<CreateParentData, 'password' | 'email'>> {
  is_active?: boolean;
}

export const parentService = {
  /**
   * Get all parents
   */
  async getAll(): Promise<Parent[]> {
    const response = await apiClient.get('/parents/');
    return response.data;
  },

  /**
   * Get parent by ID
   */
  async getById(id: string): Promise<Parent> {
    const response = await apiClient.get(`/parents/${id}/`);
    return response.data;
  },

  /**
   * Create a new parent
   */
  async create(data: CreateParentData): Promise<Parent> {
    const response = await apiClient.post('/parents/', data);
    return response.data;
  },

  /**
   * Update a parent
   */
  async update(id: string, data: UpdateParentData): Promise<Parent> {
    const response = await apiClient.put(`/parents/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a parent
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/parents/${id}/`);
  },

  /**
   * Link a student to a parent
   */
  async linkStudentToParent(data: {
    student_id: string;
    parent_id: string;
    is_primary?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/parents/link-student/', data);
    return response.data;
  },

  /**
   * Get all students linked to a parent
   */
  async getParentChildren(parentId: string): Promise<any[]> {
    const response = await apiClient.get(`/parents/parent/${parentId}/children/`);
    return response.data;
  },

  /**
   * Get all parents linked to a student
   */
  async getStudentParents(studentId: string): Promise<any[]> {
    const response = await apiClient.get(`/parents/student/${studentId}/parents/`);
    return response.data;
  },

  /**
   * Unlink a student from a parent
   */
  async unlinkStudentFromParent(linkId: string): Promise<void> {
    await apiClient.delete(`/parents/unlink/${linkId}/`);
  },
};
