'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { superAdminNav } from '@/config/navigation';
import { Building2, Users, CheckCircle, XCircle } from 'lucide-react';

export default function SuperAdminDashboard() {
  // Mock data - replace with real API calls
  const stats = [
    {
      title: 'Total Tenants',
      value: '24',
      change: '+3 this month',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Tenants',
      value: '22',
      change: '91.7% active',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Inactive Tenants',
      value: '2',
      change: '8.3% inactive',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Total Users',
      value: '1,847',
      change: '+127 this month',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const recentTenants = [
    { id: 1, name: 'Sunshine High School', code: 'SHS001', status: 'active', users: 245 },
    { id: 2, name: 'Green Valley Academy', code: 'GVA002', status: 'active', users: 189 },
    { id: 3, name: 'Mountain View School', code: 'MVS003', status: 'inactive', users: 0 },
    { id: 4, name: 'Riverside International', code: 'RIS004', status: 'active', users: 412 },
  ];

  return (
    <DashboardLayout sidebarItems={superAdminNav} title="Super Admin Dashboard">
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
              {recentTenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{tenant.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{tenant.code}</td>
                  <td className="py-3 px-4">
                    <Badge variant={tenant.status === 'active' ? 'success' : 'danger'}>
                      {tenant.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{tenant.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
