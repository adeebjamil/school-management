'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { superAdminNav } from '@/config/navigation';
import { tenantService } from '@/services/tenantService';
import { Tenant } from '@/types';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, Users } from 'lucide-react';

export default function TenantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tenantId) {
      loadTenantData();
    }
  }, [tenantId]);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      const tenantData = await tenantService.getById(tenantId);
      setTenant(tenantData);
      // TODO: Load users when backend endpoint is available
      setUsers([]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tenant details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    try {
      await tenantService.delete(tenantId);
      router.push('/super-admin/tenants');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete tenant');
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={superAdminNav} title="Tenant Details">
        <Loading fullScreen text="Loading tenant details..." />
      </DashboardLayout>
    );
  }

  if (error || !tenant) {
    return (
      <DashboardLayout sidebarItems={superAdminNav} title="Tenant Details">
        <Alert type="error">{error || 'Tenant not found'}</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={superAdminNav} title="Tenant Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Back to Tenants
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => router.push(`/super-admin/tenants/${tenantId}/edit`)}
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

        {/* Tenant Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Tenant ID: {tenant.id}</p>
              </div>
              <Badge variant={tenant.is_active ? 'success' : 'danger'}>
                {tenant.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">School Code</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{tenant.school_code || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-sm text-gray-900">{tenant.slug}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{tenant.email}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{tenant.phone || 'N/A'}</dd>
              </div>

              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{tenant.address || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(tenant.created_at)}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Updated At</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(tenant.updated_at)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Users ({users.length})</h3>
            </div>
          </CardHeader>

          <CardContent>
            {users.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No users found for this tenant</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <Badge>{user.role.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
