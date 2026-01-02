// TypeScript types for the application

export type UserRole = 'super_admin' | 'tenant_admin' | 'student' | 'teacher' | 'parent';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  profile_picture?: string;
  is_active: boolean;
  date_joined: string;
  tenant?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  session_id?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  school_code: string;
  established_date?: string;
  logo?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_start?: string;
  subscription_end?: string;
}

export interface TenantFeature {
  id: string;
  tenant: string;
  feature: string;
  feature_display: string;
  is_enabled: boolean;
  enabled_at: string;
}

export interface Student {
  id: string;
  tenant: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    is_active: boolean;
  };
  admission_number?: string;
  roll_number?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  nationality?: string;
  religion?: string;
  class_name?: string;
  section?: string;
  admission_date?: string;
  academic_year?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  tenant: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    is_active: boolean;
  };
  employee_id?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  qualification?: string;
  specialization?: string;
  department?: string;
  experience_years?: number;
  joining_date?: string;
  salary?: number;
  subjects?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  created_at: string;
  updated_at: string;
}

export interface Parent {
  id: string;
  tenant: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    is_active: boolean;
  };
  relation?: string;
  occupation?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SidebarItem {
  name: string;
  icon: any;
  href: string;
  roles: UserRole[];
}
// Course-related types
export interface CourseContent {
  id: string;
  content_type: 'lesson' | 'assignment' | 'quiz' | 'resource' | 'video' | 'reading' | 'lab';
  title: string;
  description?: string;
  content?: string;
  file_url?: string;
  video_url?: string;
  external_link?: string;
  due_date?: string;
  max_points: number;
  order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  module_number: number;
  title: string;
  description?: string;
  learning_objectives?: string;
  start_date?: string;
  end_date?: string;
  duration_hours: number;
  order: number;
  is_active: boolean;
  contents: CourseContent[];
  total_contents: number;
  created_at: string;
  updated_at: string;
}

export interface SchoolClass {
  id: string;
  grade: string;
  section: string;
  class_name: string;
  academic_year: string;
}

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  description?: string;
  school_class?: string;
  school_class_details?: SchoolClass;
  section?: string;
  credits: number;
  duration_weeks: number;
  academic_year: string;
  semester: '1' | '2' | 'summer' | 'annual';
  primary_teacher?: string;
  primary_teacher_details?: Teacher;
  additional_teachers?: string[];
  additional_teachers_details?: Teacher[];
  syllabus?: string;
  course_objectives?: string;
  prerequisites?: string;
  is_active: boolean;
  is_published: boolean;
  modules: CourseModule[];
  total_modules: number;
  enrolled_students_count: number;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  student: string;
  student_details?: Student;
  course: string;
  course_details?: Course;
  enrollment_date: string;
  completion_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentProgress {
  id: string;
  content: string;
  content_details?: CourseContent;
  is_completed: boolean;
  completed_at?: string;
  time_spent_minutes: number;
  score?: number;
  submission_date?: string;
  created_at: string;
  updated_at: string;
}