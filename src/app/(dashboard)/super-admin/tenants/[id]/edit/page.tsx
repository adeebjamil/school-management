'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { superAdminNav } from '@/config/navigation';
import { tenantService } from '@/services/tenantService';
import { ArrowLeft } from 'lucide-react';

export default function EditTenantPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    school_code: '',
    is_active: true,
  });

  useEffect(() => {
    if (tenantId) {
      loadTenant();
    }
  }, [tenantId]);

  const loadTenant = async () => {
    try {
      setLoading(true);
      const data = await tenantService.getById(tenantId);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        school_code: data.school_code || '',
        is_active: data.is_active,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await tenantService.update(tenantId, formData);
      router.push(`/super-admin/tenants/${tenantId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update tenant');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={superAdminNav} title="Edit Tenant">
        <Loading fullScreen text="Loading tenant data..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={superAdminNav} title="Edit Tenant">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className="mb-4"
        >
          Back
        </Button>

        {error && <Alert type="error" className="mb-4">{error}</Alert>}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Edit Tenant Information</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update the details for this school/tenant
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="School Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter school name"
                  required
                />

                <Input
                  label="School Code"
                  name="school_code"
                  value={formData.school_code}
                  onChange={handleChange}
                  placeholder="e.g., SHS001"
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="school@example.com"
                  required
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />

                <Textarea
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  rows={3}
                />

                <Select
                  label="Status"
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(value) => setFormData({ ...formData, is_active: value === 'true' })}
                  options={[
                    { label: 'Active', value: 'true' },
                    { label: 'Inactive', value: 'false' },
                  ]}
                />
              </div>
            </CardContent>

            <CardFooter>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  Update Tenant
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
