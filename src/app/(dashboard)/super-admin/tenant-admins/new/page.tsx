'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { superAdminNav } from '@/config/navigation';
import { tenantService } from '@/services/tenantService';
import { Tenant } from '@/types';
import { ArrowLeft } from 'lucide-react';

export default function CreateTenantAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [formData, setFormData] = useState({
    tenant_id: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const data = await tenantService.getAll();
      setTenants(data.filter(t => t.is_active));
    } catch (err: any) {
      setError('Failed to load tenants');
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await tenantService.createTenantAdmin({
        tenant_id: formData.tenant_id,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      });

      setSuccess('Tenant Admin created successfully!');
      
      // Reset form
      setFormData({
        tenant_id: '',
        email: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        phone: '',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/super-admin/tenants');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create tenant admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={superAdminNav} title="Create Tenant Admin">
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
        {success && <Alert type="success" className="mb-4">{success}</Alert>}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Create Tenant Administrator</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a new admin account for a school/tenant
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4">
                <Select
                  label="Select Tenant"
                  value={formData.tenant_id}
                  onChange={(value) => setFormData({ ...formData, tenant_id: value })}
                  options={tenants.map(t => ({ label: t.name, value: t.id }))}
                  placeholder="Choose a school"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />

                  <Input
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@school.com"
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

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Account Credentials</h3>
                  
                  <div className="space-y-4">
                    <Input
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter strong password"
                      helperText="Minimum 8 characters"
                      required
                    />

                    <Input
                      label="Confirm Password"
                      name="confirm_password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>
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
                  Create Admin
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
