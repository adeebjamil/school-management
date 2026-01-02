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
import { teacherService } from '@/services/teacherService';
import { Teacher } from '@/types';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar, Briefcase } from 'lucide-react';

export default function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeacher();
  }, [id]);

  const loadTeacher = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getById(id);
      setTeacher(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      await teacherService.delete(id);
      router.push('/tenant-admin/teachers');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete teacher');
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Teacher Details"
      >
        <Loading />
      </DashboardLayout>
    );
  }

  if (error || !teacher) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Teacher Details"
      >
        <Alert type="error">{error || 'Teacher not found'}</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Teacher Details"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Back to Teachers
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => router.push(`/tenant-admin/teachers/${teacher.id}/edit`)}
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
              <Badge variant={teacher.user.is_active ? 'success' : 'danger'}>
                {teacher.user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {teacher.user.first_name} {teacher.user.last_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{teacher.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{teacher.user.phone || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {teacher.date_of_birth ? formatDate(teacher.date_of_birth) : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{teacher.gender || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Nationality</dt>
                <dd className="mt-1 text-sm text-gray-900">{teacher.nationality || 'N/A'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{teacher.address || 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Professional Information
            </h3>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {teacher.employee_id || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Joining Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {teacher.joining_date ? formatDate(teacher.joining_date) : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Qualification</dt>
                <dd className="mt-1 text-sm text-gray-900">{teacher.qualification || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{teacher.department || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Salary</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {teacher.salary ? `$${teacher.salary.toLocaleString()}` : 'N/A'}
                </dd>
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
                <dd className="mt-1 text-sm text-gray-900">{formatDate(teacher.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(teacher.updated_at)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
