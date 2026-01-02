import { apiClient } from '@/lib/api';

export interface Exam {
  id: string;
  name: string;
  exam_type: 'midterm' | 'final' | 'unit_test' | 'quarterly' | 'annual';
  class_name: string;
  section: string;
  start_date: string;
  end_date: string;
  total_marks: number;
  passing_marks: number;
  subjects: ExamSubject[];
  created_at: string;
  updated_at: string;
}

export interface ExamSubject {
  id?: string;
  exam?: string;
  subject_name: string;
  subject_code: string;
  exam_date: string;
  max_marks: number;
  passing_marks: number;
  duration_minutes: number;
}

export interface ExamResult {
  id: string;
  exam: string;
  exam_name: string;
  student: string;
  student_name: string;
  student_roll_number: string;
  class_name: string;
  section: string;
  subject_marks: SubjectMark[];
  total_marks_obtained: number;
  total_max_marks: number;
  percentage: number;
  grade: string;
  rank?: number;
  result_status: 'pass' | 'fail' | 'absent';
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface SubjectMark {
  subject_name: string;
  subject_code: string;
  marks_obtained: number;
  max_marks: number;
  passing_marks: number;
  status: 'pass' | 'fail' | 'absent';
  grade?: string;
}

export interface MarkEntryData {
  exam_id: string;
  subject_code: string;
  marks: {
    student_id: string;
    marks_obtained: number | null;
    is_absent?: boolean;
  }[];
}

export interface ReportCardData {
  student: {
    id: string;
    name: string;
    roll_number: string;
    class_name: string;
    section: string;
    photo?: string;
  };
  exam: {
    id: string;
    name: string;
    exam_type: string;
    start_date: string;
    end_date: string;
  };
  subjects: {
    subject_name: string;
    marks_obtained: number;
    max_marks: number;
    grade: string;
    remarks?: string;
  }[];
  summary: {
    total_marks_obtained: number;
    total_max_marks: number;
    percentage: number;
    grade: string;
    rank: number;
    result_status: string;
  };
  attendance?: {
    total_days: number;
    present_days: number;
    percentage: number;
  };
}

export interface ExamAnalytics {
  exam_id: string;
  exam_name: string;
  class_name: string;
  section: string;
  total_students: number;
  appeared: number;
  absent: number;
  passed: number;
  failed: number;
  pass_percentage: number;
  highest_marks: number;
  lowest_marks: number;
  average_marks: number;
  subject_wise_stats: {
    subject_name: string;
    average_marks: number;
    highest_marks: number;
    lowest_marks: number;
    pass_percentage: number;
  }[];
}

const examService = {
  // Get all exams with optional filters
  getAll: async (params?: {
    class_name?: string;
    section?: string;
    exam_type?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await apiClient.get<Exam[]>('/exams/', { params });
    return response.data;
  },

  // Get single exam by ID
  getById: async (id: string) => {
    const response = await apiClient.get<Exam>(`/exams/${id}/`);
    return response.data;
  },

  // Create new exam
  create: async (data: Omit<Exam, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await apiClient.post<Exam>('/exams/', data);
    return response.data;
  },

  // Update exam
  update: async (id: string, data: Partial<Exam>) => {
    const response = await apiClient.put<Exam>(`/exams/${id}/`, data);
    return response.data;
  },

  // Delete exam
  delete: async (id: string) => {
    await apiClient.delete(`/exams/${id}/`);
  },

  // Get all results for an exam
  getExamResults: async (examId: string, params?: {
    class_name?: string;
    section?: string;
    result_status?: string;
  }) => {
    const response = await apiClient.get<ExamResult[]>(`/exams/${examId}/results/`, { params });
    return response.data;
  },

  // Get student's result for an exam
  getStudentResult: async (examId: string, studentId: string) => {
    const response = await apiClient.get<ExamResult>(
      `/exams/${examId}/students/${studentId}/result/`
    );
    return response.data;
  },

  // Submit marks for a subject
  submitMarks: async (data: MarkEntryData) => {
    const response = await apiClient.post('/exams/marks/submit/', data);
    return response.data;
  },

  // Get marks for a subject (for editing)
  getSubjectMarks: async (examId: string, subjectCode: string) => {
    const response = await apiClient.get(
      `/exams/${examId}/subjects/${subjectCode}/marks/`
    );
    return response.data;
  },

  // Generate report card
  generateReportCard: async (examId: string, studentId: string) => {
    const response = await apiClient.get<ReportCardData>(
      `/exams/${examId}/students/${studentId}/report-card/`
    );
    return response.data;
  },

  // Get exam analytics
  getAnalytics: async (examId: string) => {
    const response = await apiClient.get<ExamAnalytics>(
      `/exams/${examId}/analytics/`
    );
    return response.data;
  },

  // Publish results (make them visible to students/parents)
  publishResults: async (examId: string) => {
    const response = await apiClient.post(`/exams/${examId}/publish-results/`);
    return response.data;
  },

  // Calculate grades for an exam
  calculateGrades: async (examId: string) => {
    const response = await apiClient.post(`/exams/${examId}/calculate-grades/`);
    return response.data;
  },

  // Get grade distribution
  getGradeDistribution: async (examId: string) => {
    const response = await apiClient.get(`/exams/${examId}/grade-distribution/`);
    return response.data;
  },
};

export default examService;
