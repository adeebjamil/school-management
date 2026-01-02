'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Dropdown';
import { Alert } from '@/components/ui/Alert';
import { superAdminNav } from '@/config/navigation';
import { tenantService } from '@/services/tenantService';
import { formatDate } from '@/lib/utils';
import { FileText, Filter } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  user_email: string;
  ip_address: string;
  timestamp: string;
  tenant_name?: string;
  details?: any;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    action: '',
    limit: 50,
  });

  useEffect(() => {
    loadAuditLogs();
  }, [filter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await tenantService.getAuditLogs(filter);
      setLogs(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { variant: 'success' | 'info' | 'warning' | 'danger', label: string }> = {
      'login': { variant: 'success', label: 'Login' },
      'logout': { variant: 'info', label: 'Logout' },
      'create_tenant': { variant: 'success', label: 'Created Tenant' },
      'update_tenant': { variant: 'warning', label: 'Updated Tenant' },
      'delete_tenant': { variant: 'danger', label: 'Deleted Tenant' },
      'create_admin': { variant: 'success', label: 'Created Admin' },
    };

    const config = actionMap[action] || { variant: 'info' as const, label: action };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      label: 'Date & Time',
      render: (value) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{formatDate(value)}</p>
          <p className="text-xs text-gray-500">{new Date(value).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (value) => getActionBadge(value),
    },
    {
      key: 'user_email',
      label: 'User',
      render: (value) => (
        <span className="text-sm text-gray-900">{value}</span>
      ),
    },
    {
      key: 'ip_address',
      label: 'IP Address',
      render: (value) => (
        <span className="text-sm font-mono text-gray-600">{value}</span>
      ),
    },
    {
      key: 'tenant_name',
      label: 'Tenant',
      render: (value) => (
        <span className="text-sm text-gray-900">{value || 'System'}</span>
      ),
    },
  ];

  return (
    <DashboardLayout sidebarItems={superAdminNav} title="Audit Logs">
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
            </div>
            <p className="text-gray-600 mt-1">Track all system activities and changes</p>
          </div>

          <div className="flex gap-3">
            <Select
              label="Action Type"
              value={filter.action}
              onChange={(value) => setFilter({ ...filter, action: value })}
              options={[
                { label: 'All Actions', value: '' },
                { label: 'Login', value: 'login' },
                { label: 'Logout', value: 'logout' },
                { label: 'Create Tenant', value: 'create_tenant' },
                { label: 'Update Tenant', value: 'update_tenant' },
                { label: 'Delete Tenant', value: 'delete_tenant' },
                { label: 'Create Admin', value: 'create_admin' },
              ]}
            />

            <Select
              label="Limit"
              value={filter.limit.toString()}
              onChange={(value) => setFilter({ ...filter, limit: parseInt(value) })}
              options={[
                { label: '25 records', value: '25' },
                { label: '50 records', value: '50' },
                { label: '100 records', value: '100' },
                { label: '200 records', value: '200' },
              ]}
            />
          </div>
        </div>

        <Card>
          <Table
            columns={columns}
            data={logs}
            loading={loading}
            emptyMessage="No audit logs found"
          />
        </Card>

        {logs.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Showing {logs.length} most recent audit logs
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
