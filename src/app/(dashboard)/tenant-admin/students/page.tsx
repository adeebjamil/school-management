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
import { studentService } from '@/services/studentService';
import { Student } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, Eye, Edit, Trash2, Search, Upload } from 'lucide-react';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        (student: any) =>
          student.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      console.log('Student data from API:', data);
      console.log('First student:', data[0]);
      setStudents(data);
      setFilteredStudents(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await studentService.delete(id);
      setStudents(students.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete student');
    }
  };

  const columns: Column<Student>[] = [
    {
      key: 'admission_number',
      label: 'Admission No.',
      render: (value) => <span className="font-mono text-sm">{value || 'N/A'}</span>,
    },
    {
      key: 'first_name',
      label: 'Student Name',
      render: (_, student: any) => (
        <div>
          <p className="font-medium text-gray-900">
            {student.user?.first_name} {student.user?.last_name}
          </p>
          <p className="text-xs text-gray-500">{student.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'class_name',
      label: 'Class',
      render: (value, student) => (
        <span className="text-sm text-gray-900">
          {value || 'N/A'} {student.section ? `- ${student.section}` : ''}
        </span>
      ),
    },
    {
      key: 'roll_number',
      label: 'Roll No.',
      render: (value) => <span className="text-sm text-gray-900">{value || 'N/A'}</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (_, student: any) => <span className="text-sm text-gray-900">{student.user?.phone || 'N/A'}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (_, student: any) => (
        <Badge variant={student.user?.is_active ? 'success' : 'danger'}>
          {student.user?.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, student) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tenant-admin/students/${student.id}`);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tenant-admin/students/${student.id}/edit`);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(student.id);
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
      title="Student Management"
    >
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Students</h2>
            <p className="text-gray-600">Manage student records and information</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<Upload className="w-4 h-4" />}
              onClick={() => router.push('/tenant-admin/students/import')}
            >
              Bulk Import
            </Button>
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/tenant-admin/students/new')}
            >
              Add Student
            </Button>
          </div>
        </div>

        <Card>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredStudents}
            loading={loading}
            emptyMessage="No students found"
            onRowClick={(student) => router.push(`/tenant-admin/students/${student.id}`)}
          />

          {filteredStudents.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-sm text-gray-600 text-center">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
