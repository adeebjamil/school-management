'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { superAdminNav } from '@/config/navigation';
import { tenantService } from '@/services/tenantService';
import { ArrowLeft } from 'lucide-react';

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    school_code: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await tenantService.create(formData);
      router.push('/super-admin/tenants');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={superAdminNav} title="Create New Tenant">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className="mb-4"
        >
          Back to Tenants
        </Button>

        {error && <Alert type="error" className="mb-4">{error}</Alert>}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Tenant Information</h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter the details for the new school/tenant
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
                  helperText="Unique identifier for the school"
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
                <Button type="submit" loading={loading}>
                  Create Tenant
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
