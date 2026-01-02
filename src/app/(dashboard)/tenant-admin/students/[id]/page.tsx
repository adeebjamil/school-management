'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { tenantAdminNav } from '@/config/navigation';
import { studentService } from '@/services/studentService';
import { Student } from '@/types';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar } from 'lucide-react';

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const data = await studentService.getById(id);
      setStudent(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load student');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await studentService.delete(id);
      router.push('/tenant-admin/students');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete student');
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Student Details"
      >
        <Loading />
      </DashboardLayout>
    );
  }

  if (error || !student) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Student Details"
      >
        <Alert type="error">{error || 'Student not found'}</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Student Details"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Back to Students
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => router.push(`/tenant-admin/students/${student.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <Badge variant={student.user.is_active ? 'success' : 'danger'}>
                {student.user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {student.user.first_name} {student.user.last_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{student.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{student.user.phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {student.date_of_birth ? formatDate(student.date_of_birth) : 'N/A'}
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.address || 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Admission Number</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {student.admission_number || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Admission Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {student.admission_date ? formatDate(student.admission_date) : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Class</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.class_name || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Section</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.section || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Roll Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.roll_number || 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h3>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Parent Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.parent_name || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Parent Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.parent_email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Parent Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.parent_phone || 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(student.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(student.updated_at)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
