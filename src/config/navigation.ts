import { 
  Home, 
  Building2, 
  Users, 
  FileText, 
  Brain,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Book,
  Bus,
  User,
  CreditCard,
  Trophy,
  UserCheck,
  UserCircle,
  MessageCircle
} from 'lucide-react';
import { UserRole } from '@/types';

export interface NavigationItem {
  label: string;
  href: string;
  icon: any;
  roles: UserRole[];
}

export const NAVIGATION: Record<UserRole, NavigationItem[]> = {
  super_admin: [
    { label: 'Home', href: '/super-admin/dashboard', icon: Home, roles: ['super_admin'] },
    { label: 'Tenants', href: '/super-admin/tenants', icon: Building2, roles: ['super_admin'] },
    { label: 'Tenant Admins', href: '/super-admin/tenant-admins', icon: Users, roles: ['super_admin'] },
    { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: FileText, roles: ['super_admin'] },
    { label: 'AI Fine-Tuned', href: '/super-admin/ai', icon: Brain, roles: ['super_admin'] },
  ],
  
  tenant_admin: [
    { label: 'Home', href: '/tenant-admin/dashboard', icon: Home, roles: ['tenant_admin'] },
    { label: 'Classes', href: '/tenant-admin/classes', icon: BookOpen, roles: ['tenant_admin'] },
    { label: 'Students', href: '/tenant-admin/students', icon: GraduationCap, roles: ['tenant_admin'] },
    { label: 'Teachers', href: '/tenant-admin/teachers', icon: Users, roles: ['tenant_admin'] },
    { label: 'Parents', href: '/tenant-admin/parents', icon: Users, roles: ['tenant_admin'] },
    { label: 'Courses', href: '/tenant-admin/courses', icon: BookOpen, roles: ['tenant_admin'] },
    { label: 'Attendance', href: '/tenant-admin/attendance', icon: Calendar, roles: ['tenant_admin'] },
    { label: 'Exams & Results', href: '/tenant-admin/exams', icon: ClipboardCheck, roles: ['tenant_admin'] },
    { label: 'Library', href: '/tenant-admin/library', icon: Book, roles: ['tenant_admin'] },
    { label: 'Transport', href: '/tenant-admin/transport', icon: Bus, roles: ['tenant_admin'] },
    { label: 'Timetable', href: '/tenant-admin/timetable', icon: Calendar, roles: ['tenant_admin'] },
    { label: 'Profile', href: '/tenant-admin/profile', icon: UserCircle, roles: ['tenant_admin'] },
  ],
  
  student: [
    { label: 'Home', href: '/student/dashboard', icon: Home, roles: ['student'] },
    { label: 'Attendance', href: '/student/attendance', icon: Calendar, roles: ['student'] },
    { label: 'Courses', href: '/student/courses', icon: BookOpen, roles: ['student'] },
    { label: 'Exam Section', href: '/student/exams', icon: ClipboardCheck, roles: ['student'] },
    { label: 'Admit Card', href: '/student/admit-card', icon: CreditCard, roles: ['student'] },
    { label: 'Results', href: '/student/results', icon: Trophy, roles: ['student'] },
    { label: 'Counsellor', href: '/student/counsellor', icon: UserCheck, roles: ['student'] },
    { label: 'Library', href: '/student/library', icon: Book, roles: ['student'] },
    { label: 'Transport', href: '/student/transport', icon: Bus, roles: ['student'] },
    { label: 'Timetable', href: '/student/timetable', icon: Calendar, roles: ['student'] },
    { label: 'Profile', href: '/student/profile', icon: UserCircle, roles: ['student'] },
  ],
  
  teacher: [
    { label: 'Home', href: '/teacher/dashboard', icon: Home, roles: ['teacher'] },
    { label: 'Attendance', href: '/teacher/attendance', icon: Calendar, roles: ['teacher'] },
    { label: 'Courses', href: '/teacher/courses', icon: BookOpen, roles: ['teacher'] },
    { label: 'Exam Section', href: '/teacher/exams', icon: ClipboardCheck, roles: ['teacher'] },
    { label: 'Counselling', href: '/teacher/counselling', icon: MessageCircle, roles: ['teacher'] },
    { label: 'Transport', href: '/teacher/transport', icon: Bus, roles: ['teacher'] },
    { label: 'Timetable', href: '/teacher/timetable', icon: Calendar, roles: ['teacher'] },
    { label: 'Profile', href: '/teacher/profile', icon: UserCircle, roles: ['teacher'] },
  ],
  
  parent: [
    { label: 'Home', href: '/parent/dashboard', icon: Home, roles: ['parent'] },
    { label: 'My Children', href: '/parent/children', icon: Users, roles: ['parent'] },
    { label: 'Attendance', href: '/parent/attendance', icon: Calendar, roles: ['parent'] },
    { label: 'Results', href: '/parent/results', icon: Trophy, roles: ['parent'] },
    { label: 'Profile', href: '/parent/profile', icon: UserCircle, roles: ['parent'] },
  ],
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'purple',
  tenant_admin: 'blue',
  student: 'green',
  teacher: 'orange',
  parent: 'pink',
};

// Export individual navigation arrays for easier use
export const superAdminNav = NAVIGATION.super_admin;
export const tenantAdminNav = NAVIGATION.tenant_admin;
export const studentNav = NAVIGATION.student;
export const teacherNav = NAVIGATION.teacher;
export const parentNav = NAVIGATION.parent;
