'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { tenantAdminNav } from '@/config/navigation';
import { teacherService } from '@/services/teacherService';
import { Teacher } from '@/types';
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = teachers.filter(
        (teacher: any) =>
          teacher.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  }, [searchTerm, teachers]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAll();
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      await teacherService.delete(id);
      setTeachers(teachers.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete teacher');
    }
  };

  const columns: Column<Teacher>[] = [
    {
      key: 'employee_id',
      label: 'Employee ID',
      render: (value) => <span className="font-mono text-sm">{value || 'N/A'}</span>,
    },
    {
      key: 'first_name',
      label: 'Teacher Name',
      render: (_, teacher: any) => (
        <div>
          <p className="font-medium text-gray-900">
            {teacher.user?.first_name} {teacher.user?.last_name}
          </p>
          <p className="text-xs text-gray-500">{teacher.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (value) => <span className="text-sm text-gray-900">{value || 'N/A'}</span>,
    },
    {
      key: 'qualification',
      label: 'Qualification',
      render: (value) => <span className="text-sm text-gray-900">{value || 'N/A'}</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (_, teacher: any) => <span className="text-sm text-gray-900">{teacher.user?.phone || 'N/A'}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (_, teacher: any) => (
        <Badge variant={teacher.user?.is_active ? 'success' : 'danger'}>
          {teacher.user?.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, teacher) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tenant-admin/teachers/${teacher.id}`);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tenant-admin/teachers/${teacher.id}/edit`);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(teacher.id);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Teacher Management"
    >
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Teachers</h2>
            <p className="text-gray-600">Manage teacher records and information</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => router.push('/tenant-admin/teachers/new')}
          >
            Add Teacher
          </Button>
        </div>

        <Card>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredTeachers}
            loading={loading}
            emptyMessage="No teachers found"
            onRowClick={(teacher) => router.push(`/tenant-admin/teachers/${teacher.id}`)}
          />

          {filteredTeachers.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-sm text-gray-600 text-center">
              Showing {filteredTeachers.length} of {teachers.length} teachers
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
