'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { superAdminNav } from '@/config/navigation';
import { Plus } from 'lucide-react';

export default function TenantAdminsPage() {
  const router = useRouter();

  return (
    <DashboardLayout sidebarItems={superAdminNav} title="Tenant Admin Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tenant Admins</h2>
            <p className="text-gray-600">Manage school administrators</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => router.push('/super-admin/tenant-admins/new')}
          >
            Create Tenant Admin
          </Button>
        </div>

        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">
              View all tenant admins by navigating to individual tenants
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/super-admin/tenants')}
            >
              Go to Tenants
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
