'use client';

import { useState, useEffect, FormEvent, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { tenantAdminNav } from '@/config/navigation';
import { parentService } from '@/services/parentService';
import { Parent } from '@/types';
import { ArrowLeft } from 'lucide-react';

export default function EditParentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [parent, setParent] = useState<Parent | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    occupation: '',
    is_active: 'true' as string | boolean,
  });

  useEffect(() => {
    loadParent();
  }, [id]);

  const loadParent = async () => {
    try {
      setLoading(true);
      const data = await parentService.getById(id);
      setParent(data);
      setFormData({
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        phone: data.user.phone || '',
        address: data.address || '',
        occupation: data.occupation || '',
        is_active: data.user.is_active,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load parent');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await parentService.update(id, {
        ...formData,
        is_active: String(formData.is_active) === 'true',
      });
      router.push(`/tenant-admin/parents/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update parent');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Edit Parent"
      >
        <Loading />
      </DashboardLayout>
    );
  }

  if (error && !parent) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Edit Parent"
      >
        <Alert type="error">{error}</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Edit Parent"
    >
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className="mb-4"
        >
          Back to Parent
        </Button>

        {error && <Alert type="error" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <Input
                    label="Occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                  />
                </div>
                <div className="mt-4">
                  <Textarea
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
              </CardHeader>
              <CardContent>
                <Select
                  label="Status"
                  name="is_active"
                  value={String(formData.is_active)}
                  onChange={handleChange}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <Card>
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
                    Save Changes
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
