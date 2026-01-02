import { apiClient } from '@/lib/api';

export interface AttendanceRecord {
  id: string;
  student: string;
  student_name?: string;
  student_roll_number?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: string;
  marked_by_name?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface MarkAttendanceData {
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface BulkAttendanceData {
  date: string;
  class_name: string;
  section: string;
  attendance: Array<{
    student_id: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks?: string;
  }>;
}

export interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  excused_days: number;
  attendance_percentage: number;
}

export interface ClassAttendanceStats {
  date: string;
  class_name: string;
  section: string;
  total_students: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_percentage: number;
}

export const attendanceService = {
  /**
   * Get attendance records with optional filters
   */
  async getAll(params?: {
    date?: string;
    student_id?: string;
    class_name?: string;
    section?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<AttendanceRecord[]> {
    const response = await apiClient.get('/attendance/', { params });
    return response.data;
  },

  /**
   * Get attendance record by ID
   */
  async getById(id: string): Promise<AttendanceRecord> {
    const response = await apiClient.get(`/attendance/${id}/`);
    return response.data;
  },

  /**
   * Mark attendance for a single student
   */
  async markAttendance(data: MarkAttendanceData): Promise<AttendanceRecord> {
    const response = await apiClient.post('/attendance/', data);
    return response.data;
  },

  /**
   * Bulk mark attendance for a class
   */
  async bulkMarkAttendance(data: BulkAttendanceData): Promise<{ success: number; errors: any[] }> {
    const response = await apiClient.post('/attendance/bulk-mark/', data);
    return response.data;
  },

  /**
   * Update attendance record
   */
  async update(id: string, data: Partial<MarkAttendanceData>): Promise<AttendanceRecord> {
    const response = await apiClient.put(`/attendance/${id}/`, data);
    return response.data;
  },

  /**
   * Delete attendance record
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/attendance/${id}/`);
  },

  /**
   * Get attendance statistics for a student
   */
  async getStudentStats(
    studentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceStats> {
    const response = await apiClient.get(`/attendance/student-stats/${studentId}/`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  /**
   * Get attendance statistics for a class
   */
  async getClassStats(
    className: string,
    section: string,
    date: string
  ): Promise<ClassAttendanceStats> {
    const response = await apiClient.get('/attendance/class-stats/', {
      params: { class_name: className, section, date },
    });
    return response.data;
  },

  /**
   * Get attendance report
   */
  async getReport(params: {
    start_date: string;
    end_date: string;
    class_name?: string;
    section?: string;
    student_id?: string;
  }): Promise<any> {
    const response = await apiClient.get('/attendance/report/', { params });
    return response.data;
  },
};
