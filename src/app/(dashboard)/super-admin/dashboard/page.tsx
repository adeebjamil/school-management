'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { superAdminNav } from '@/config/navigation';
import { Building2, Users, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { tenantService } from '@/services/tenantService';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const data = await tenantService.getTenants();
      setTenants(data);
    } catch (error: any) {
      if (!silent) {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to load dashboard data',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const activeTenants = tenants.filter(t => t.is_active);
  const inactiveTenants = tenants.filter(t => !t.is_active);
  const totalUsers = tenants.reduce((sum, t) => sum + (t.total_users || 0), 0);

  const stats = [
    {
      title: 'Total Tenants',
      value: tenants.length.toString(),
      change: `+${tenants.filter(t => {
        const created = new Date(t.created_at);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return created > monthAgo;
      }).length} this month`,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Tenants',
      value: activeTenants.length.toString(),
      change: `${((activeTenants.length / tenants.length) * 100 || 0).toFixed(1)}% active`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Inactive Tenants',
      value: inactiveTenants.length.toString(),
      change: `${((inactiveTenants.length / tenants.length) * 100 || 0).toFixed(1)}% inactive`,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: `Across all schools`,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const recentTenants = tenants
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={superAdminNav} title="Super Admin Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={superAdminNav} title="Super Admin Dashboard">
      {/* Refresh indicator */}
      {refreshing && (
        <div className="fixed top-20 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Tenants */}
      <Card title="Recent Tenants" subtitle="Latest registered schools">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">School Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">School Code</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total Users</th>
              </tr>
            </thead>
            <tbody>
              {recentTenants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No tenants found
                  </td>
                </tr>
              ) : (
                recentTenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{tenant.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{tenant.school_code}</td>
                    <td className="py-3 px-4">
                      <Badge variant={tenant.is_active ? 'success' : 'danger'}>
                        {tenant.is_active ? 'active' : 'inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{tenant.total_users || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
