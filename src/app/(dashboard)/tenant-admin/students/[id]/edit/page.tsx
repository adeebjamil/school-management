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
import { studentService } from '@/services/studentService';
import { Student } from '@/types';
import { ArrowLeft } from 'lucide-react';

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    admission_number: '',
    admission_date: '',
    class_name: '',
    section: '',
    roll_number: '',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    is_active: 'true' as string | boolean,
  });

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const data = await studentService.getById(id);
      setStudent(data);
      setFormData({
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        phone: data.user.phone || '',
        date_of_birth: data.date_of_birth || '',
        address: data.address || '',
        admission_number: data.admission_number || '',
        admission_date: data.admission_date || '',
        class_name: data.class_name || '',
        section: data.section || '',
        roll_number: data.roll_number || '',
        parent_name: data.parent_name || '',
        parent_email: data.parent_email || '',
        parent_phone: data.parent_phone || '',
        is_active: data.user.is_active,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load student');
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
      await studentService.update(id, {
        ...formData,
        is_active: String(formData.is_active) === 'true',
      });
      router.push(`/tenant-admin/students/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Edit Student"
      >
        <Loading />
      </DashboardLayout>
    );
  }

  if (error && !student) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Edit Student"
      >
        <Alert type="error">{error}</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Edit Student"
    >
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className="mb-4"
        >
          Back to Student
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
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
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

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Admission Number"
                    name="admission_number"
                    value={formData.admission_number}
                    onChange={handleChange}
                  />
                  <Input
                    label="Admission Date"
                    name="admission_date"
                    type="date"
                    value={formData.admission_date}
                    onChange={handleChange}
                  />
                  <Input
                    label="Class"
                    name="class_name"
                    value={formData.class_name}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                  />
                  <Input
                    label="Section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    placeholder="e.g., A"
                  />
                  <Input
                    label="Roll Number"
                    name="roll_number"
                    value={formData.roll_number}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Parent/Guardian Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Parent Name"
                    name="parent_name"
                    value={formData.parent_name}
                    onChange={handleChange}
                  />
                  <Input
                    label="Parent Email"
                    name="parent_email"
                    type="email"
                    value={formData.parent_email}
                    onChange={handleChange}
                  />
                  <Input
                    label="Parent Phone"
                    name="parent_phone"
                    type="tel"
                    value={formData.parent_phone}
                    onChange={handleChange}
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
