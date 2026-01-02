export const APP_NAME = 'School Management System';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  TENANT_ID: 'tenant_id',
  SESSION_ID: 'session_id',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SUPER_ADMIN_LOGIN: '/super-admin/login',
  DASHBOARD: '/dashboard',
};

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  TENANT_ADMIN: 'tenant_admin',
  STUDENT: 'student',
  TEACHER: 'teacher',
  PARENT: 'parent',
} as const;
