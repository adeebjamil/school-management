import { apiClient } from '@/lib/api';
import { Teacher } from '@/types';

export interface CreateTeacherData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  employee_id?: string;
  joining_date?: string;
  qualification?: string;
  department?: string;
  subjects?: string;
  salary?: number;
  gender?: string;
  nationality?: string;
  specialization?: string;
  experience_years?: number;
}

export interface UpdateTeacherData extends Partial<Omit<CreateTeacherData, 'password' | 'email'>> {
  is_active?: boolean;
}

export const teacherService = {
  /**
   * Get all teachers
   */
  async getAll(): Promise<Teacher[]> {
    const response = await apiClient.get('/teachers/');
    return response.data;
  },

  /**
   * Get teacher by ID
   */
  async getById(id: string): Promise<Teacher> {
    const response = await apiClient.get(`/teachers/${id}/`);
    return response.data;
  },

  /**
   * Create a new teacher
   */
  async create(data: CreateTeacherData): Promise<Teacher> {
    const response = await apiClient.post('/teachers/', data);
    return response.data;
  },

  /**
   * Update a teacher
   */
  async update(id: string, data: UpdateTeacherData): Promise<Teacher> {
    const response = await apiClient.put(`/teachers/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a teacher
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/teachers/${id}/`);
  },
};
