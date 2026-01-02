import api from './api';
import { Course, CourseModule, CourseContent, CourseEnrollment } from '@/types';

export const courseAPI = {
  // ==================== COURSE MANAGEMENT ====================
  
  /**
   * Get all courses with optional filters
   */
  async getCourses(filters?: {
    class_id?: string;
    section_id?: string;
    academic_year?: string;
    semester?: string;
    teacher_id?: string;
    is_published?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get<{results: Course[]}>(`/courses/?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a specific course by ID
   */
  async getCourse(courseId: string) {
    const response = await api.get<Course>(`/courses/${courseId}/`);
    return response.data;
  },

  /**
   * Create a new course
   */
  async createCourse(data: Partial<Course>) {
    const response = await api.post<Course>('/courses/', data);
    return response.data;
  },

  /**
   * Update a course
   */
  async updateCourse(courseId: string, data: Partial<Course>) {
    const response = await api.put<Course>(`/courses/${courseId}/`, data);
    return response.data;
  },

  /**
   * Delete/deactivate a course
   */
  async deleteCourse(courseId: string) {
    const response = await api.delete(`/courses/${courseId}/`);
    return response.data;
  },

  /**
   * Auto-enroll all students from the course's class
   */
  async autoEnrollByClass(courseId: string) {
    const response = await api.post(`/courses/${courseId}/auto-enroll/`);
    return response.data;
  },

  // ==================== MODULE MANAGEMENT ====================

  /**
   * Get all modules for a course
   */
  async getModules(courseId: string) {
    const response = await api.get<CourseModule[]>(`/courses/${courseId}/modules/`);
    return response.data;
  },

  /**
   * Get a specific module
   */
  async getModule(courseId: string, moduleId: string) {
    const response = await api.get<CourseModule>(`/courses/${courseId}/modules/${moduleId}/`);
    return response.data;
  },

  /**
   * Create a new module in a course
   */
  async createModule(courseId: string, data: Partial<CourseModule>) {
    const response = await api.post<CourseModule>(`/courses/${courseId}/modules/`, data);
    return response.data;
  },

  /**
   * Update a module
   */
  async updateModule(courseId: string, moduleId: string, data: Partial<CourseModule>) {
    const response = await api.put<CourseModule>(`/courses/${courseId}/modules/${moduleId}/`, data);
    return response.data;
  },

  /**
   * Delete a module
   */
  async deleteModule(courseId: string, moduleId: string) {
    const response = await api.delete(`/courses/${courseId}/modules/${moduleId}/`);
    return response.data;
  },

  // ==================== CONTENT MANAGEMENT ====================

  /**
   * Get all content items for a module
   */
  async getContents(courseId: string, moduleId: string) {
    const response = await api.get<CourseContent[]>(`/courses/${courseId}/modules/${moduleId}/contents/`);
    return response.data;
  },

  /**
   * Get a specific content item
   */
  async getContent(courseId: string, moduleId: string, contentId: string) {
    const response = await api.get<CourseContent>(`/courses/${courseId}/modules/${moduleId}/contents/${contentId}/`);
    return response.data;
  },

  /**
   * Create a new content item in a module
   */
  async createContent(courseId: string, moduleId: string, data: Partial<CourseContent>) {
    const response = await api.post<CourseContent>(`/courses/${courseId}/modules/${moduleId}/contents/`, data);
    return response.data;
  },

  /**
   * Update a content item
   */
  async updateContent(courseId: string, moduleId: string, contentId: string, data: Partial<CourseContent>) {
    const response = await api.put<CourseContent>(`/courses/${courseId}/modules/${moduleId}/contents/${contentId}/`, data);
    return response.data;
  },

  /**
   * Delete a content item
   */
  async deleteContent(courseId: string, moduleId: string, contentId: string) {
    const response = await api.delete(`/courses/${courseId}/modules/${moduleId}/contents/${contentId}/`);
    return response.data;
  },

  // ==================== ENROLLMENT MANAGEMENT ====================

  /**
   * Get all enrollments for a course
   */
  async getEnrollments(courseId: string) {
    const response = await api.get<CourseEnrollment[]>(`/courses/${courseId}/enrollments/`);
    return response.data;
  },

  /**
   * Enroll a student in a course
   */
  async enrollStudent(courseId: string, studentId: string) {
    const response = await api.post<CourseEnrollment>(`/courses/${courseId}/enrollments/`, {
      student: studentId,
      course: courseId,
    });
    return response.data;
  },

  /**
   * Bulk enroll multiple students in a course
   */
  async bulkEnroll(courseId: string, studentIds: string[]) {
    const response = await api.post('/courses/bulk-enroll/', {
      course_id: courseId,
      student_ids: studentIds,
    });
    return response.data;
  },

  // ==================== USER-SPECIFIC VIEWS ====================

  /**
   * Get courses for the current user (student or teacher)
   */
  async getMyCourses() {
    const response = await api.get<Course[]>('/courses/my/courses/');
    return response.data;
  },
};

export default courseAPI;
