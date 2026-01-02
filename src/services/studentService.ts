import { apiClient } from '@/lib/api';
import { Student } from '@/types';

export interface CreateStudentData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  admission_number?: string;
  admission_date?: string;
  class_name?: string;
  section?: string;
  roll_number?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
}

export interface UpdateStudentData extends Partial<Omit<CreateStudentData, 'password' | 'email'>> {
  is_active?: boolean;
  school_class?: string;
}

export const studentService = {
  /**
   * Get all students
   */
  async getAll(): Promise<Student[]> {
    const response = await apiClient.get('/students/');
    return response.data;
  },

  /**
   * Get student by ID
   */
  async getById(id: string): Promise<Student> {
    const response = await apiClient.get(`/students/${id}/`);
    return response.data;
  },

  /**
   * Create a new student
   */
  async create(data: CreateStudentData): Promise<Student> {
    const response = await apiClient.post('/students/', data);
    return response.data;
  },

  /**
   * Update a student
   */
  async update(id: string, data: UpdateStudentData): Promise<Student> {
    const response = await apiClient.put(`/students/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a student
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/students/${id}/`);
  },

  /**
   * Bulk import students
   */
  async bulkImport(file: File): Promise<{ success: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/students/bulk-import/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
