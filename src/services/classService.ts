import api from '../lib/api';

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId?: string;
  department?: string;
}

export interface SchoolClass {
  id: string;
  tenantId: string;
  grade: string;
  section: string;
  className: string;
  academicYear: string;
  classTeacher?: string;
  classTeacherId?: string;
  classTeacherDetails?: Teacher;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassData {
  grade: string;
  section: string;
  className?: string;
  academicYear: string;
  classTeacherId?: string;
}

export interface UpdateClassData {
  grade?: string;
  section?: string;
  className?: string;
  academicYear?: string;
  classTeacherId?: string;
}

export interface ClassStatistics {
  totalClasses: number;
  withTeachers: number;
  withoutTeachers: number;
  totalStudents: number;
}

class ClassService {
  /**
   * Transform API response from snake_case to camelCase
   */
  private transformClass(data: any): SchoolClass {
    const transformed = {
      id: data.id,
      tenantId: data.tenant_id || data.tenantId,
      grade: data.grade,
      section: data.section,
      className: data.class_name || data.className,
      academicYear: data.academic_year || data.academicYear,
      classTeacher: data.class_teacher,
      classTeacherId: data.class_teacher_id || data.classTeacherId || undefined,
      classTeacherDetails: data.class_teacher_details ? {
        id: data.class_teacher_details.id,
        firstName: data.class_teacher_details.firstName || data.class_teacher_details.first_name,
        lastName: data.class_teacher_details.lastName || data.class_teacher_details.last_name,
        email: data.class_teacher_details.email,
        employeeId: data.class_teacher_details.employeeId || data.class_teacher_details.employee_id,
        department: data.class_teacher_details.department,
      } : undefined,
      studentCount: data.student_count || data.studentCount || 0,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
    };
    return transformed;
  }

  /**
   * Get all classes for the current tenant
   */
  async getAllClasses(): Promise<SchoolClass[]> {
    try {
      const response = await api.get('/classes/');
      const data = response.data;
      
      // Handle if response is wrapped or direct array
      const classesArray = Array.isArray(data) ? data : (data.results || data.data || []);
      
      return classesArray.map((cls: any) => this.transformClass(cls));
    } catch (error) {
      console.error('Error in getAllClasses:', error);
      throw error;
    }
  }

  /**
   * Get a specific class by ID
   */
  async getClassById(id: string): Promise<SchoolClass> {
    const response = await api.get(`/classes/${id}/`);
    return this.transformClass(response.data);
  }

  /**
   * Create a new class
   */
  async createClass(data: CreateClassData): Promise<SchoolClass> {
    const payload: any = {
      grade: data.grade,
      section: data.section,
      class_name: data.className,
      academic_year: data.academicYear,
    };
    
    // Only include class_teacher if a teacher is selected
    if (data.classTeacherId && data.classTeacherId.trim() !== '') {
      payload.class_teacher = data.classTeacherId;
    }
    
    const response = await api.post('/classes/', payload);
    return this.transformClass(response.data);
  }

  /**
   * Update an existing class
   */
  async updateClass(id: string, data: UpdateClassData): Promise<SchoolClass> {
    const payload: any = {};
    
    if (data.grade) payload.grade = data.grade;
    if (data.section) payload.section = data.section;
    if (data.className) payload.class_name = data.className;
    if (data.academicYear) payload.academic_year = data.academicYear;
    
    // Handle class_teacher - only include if set, allow null to remove teacher
    if (data.classTeacherId !== undefined) {
      if (data.classTeacherId && data.classTeacherId.trim() !== '') {
        payload.class_teacher = data.classTeacherId;
      } else {
        payload.class_teacher = null;
      }
    }
    
    const response = await api.patch(`/classes/${id}/`, payload);
    return this.transformClass(response.data);
  }

  /**
   * Delete a class
   */
  async deleteClass(id: string): Promise<void> {
    await api.delete(`/classes/${id}/`);
  }

  /**
   * Get all teachers for class assignment
   */
  async getAllTeachers(): Promise<Teacher[]> {
    const response = await api.get('/classes/teachers/');
    return response.data;
  }

  /**
   * Get class statistics
   */
  async getStatistics(): Promise<ClassStatistics> {
    const response = await api.get('/classes/statistics/');
    return response.data;
  }

  /**
   * Search classes by query
   */
  async searchClasses(query: string): Promise<SchoolClass[]> {
    const response = await api.get('/classes/', {
      params: { search: query }
    });
    return response.data;
  }

  /**
   * Filter classes by academic year
   */
  async filterByAcademicYear(academicYear: string): Promise<SchoolClass[]> {
    const response = await api.get('/classes/', {
      params: { academic_year: academicYear }
    });
    return response.data;
  }

  /**
   * Filter classes by grade
   */
  async filterByGrade(grade: string): Promise<SchoolClass[]> {
    const response = await api.get('/classes/', {
      params: { grade }
    });
    return response.data;
  }

  /**
   * Get classes assigned to a specific teacher
   */
  async getClassesByTeacher(teacherId: string): Promise<SchoolClass[]> {
    const response = await api.get('/classes/', {
      params: { class_teacher: teacherId }
    });
    return response.data;
  }
}

export default new ClassService();
