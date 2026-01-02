import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-800',
    tenant_admin: 'bg-blue-100 text-blue-800',
    student: 'bg-green-100 text-green-800',
    teacher: 'bg-orange-100 text-orange-800',
    parent: 'bg-pink-100 text-pink-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    tenant_admin: 'Tenant Admin',
    student: 'Student',
    teacher: 'Teacher',
    parent: 'Parent',
  };
  return labels[role] || role;
}
