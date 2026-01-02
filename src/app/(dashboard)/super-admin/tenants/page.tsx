'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { superAdminNav } from '@/config/navigation';
import { tenantService } from '@/services/tenantService';
import { Tenant } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantService.getAll();
      setTenants(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;

    try {
      await tenantService.delete(id);
      setTenants(tenants.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete tenant');
    }
  };

  const columns: Column<Tenant>[] = [
    {
      key: 'name',
      label: 'School Name',
      render: (_, tenant) => (
        <div>
          <p className="font-medium text-gray-900">{tenant.name}</p>
          <p className="text-xs text-gray-500">{tenant.slug}</p>
        </div>
      ),
    },
    {
      key: 'school_code',
      label: 'School Code',
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => formatDate(value),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, tenant) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/super-admin/tenants/${tenant.id}`);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/super-admin/tenants/${tenant.id}/edit`);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(tenant.id);
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
    <DashboardLayout sidebarItems={superAdminNav} title="Tenant Management">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Tenants</h2>
            <p className="text-gray-600">Manage all registered schools</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => router.push('/super-admin/tenants/new')}
          >
            Add New Tenant
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            data={tenants}
            loading={loading}
            emptyMessage="No tenants found"
            onRowClick={(tenant) => router.push(`/super-admin/tenants/${tenant.id}`)}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
