'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { tenantAdminNav } from '@/config/navigation';
import { parentService } from '@/services/parentService';
import { Parent } from '@/types';
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';

export default function ParentsPage() {
  const router = useRouter();
  const [parents, setParents] = useState<Parent[]>([]);
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadParents();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = parents.filter(
        (parent: any) =>
          parent.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parent.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parent.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParents(filtered);
    } else {
      setFilteredParents(parents);
    }
  }, [searchTerm, parents]);

  const loadParents = async () => {
    try {
      setLoading(true);
      const data = await parentService.getAll();
      setParents(data);
      setFilteredParents(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this parent?')) return;

    try {
      await parentService.delete(id);
      setParents(parents.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete parent');
    }
  };

  const columns: Column<Parent>[] = [
    {
      key: 'first_name',
      label: 'Parent Name',
      render: (_: any, parent: any) => (
        <div>
          <p className="font-medium text-gray-900">
            {parent.user.first_name} {parent.user.last_name}
          </p>
          <p className="text-xs text-gray-500">{parent.user.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (_: any, parent: any) => <span className="text-sm text-gray-900">{parent.user.phone || 'N/A'}</span>,
    },
    {
      key: 'occupation',
      label: 'Occupation',
      render: (value: any) => <span className="text-sm text-gray-900">{value || 'N/A'}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (_: any, parent: any) => (
        <Badge variant={parent.user.is_active ? 'success' : 'danger'}>
          {parent.user.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, parent) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tenant-admin/parents/${parent.id}`);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tenant-admin/parents/${parent.id}/edit`);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(parent.id);
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
      title="Parent Management"
    >
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Parents</h2>
            <p className="text-gray-600">Manage parent/guardian records</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => router.push('/tenant-admin/parents/new')}
          >
            Add Parent
          </Button>
        </div>

        <Card>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredParents}
            loading={loading}
            emptyMessage="No parents found"
            onRowClick={(parent) => router.push(`/tenant-admin/parents/${parent.id}`)}
          />

          {filteredParents.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-sm text-gray-600 text-center">
              Showing {filteredParents.length} of {parents.length} parents
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
