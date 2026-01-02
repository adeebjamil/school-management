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
import { teacherService } from '@/services/teacherService';
import { Teacher } from '@/types';
import { ArrowLeft } from 'lucide-react';

export default function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: 'male',
    nationality: '',
    address: '',
    employee_id: '',
    joining_date: '',
    qualification: 'bachelor',
    specialization: '',
    department: '',
    experience_years: '0',
    salary: '',
    subjects: '',
    is_active: 'true' as string | boolean,
  });

  useEffect(() => {
    loadTeacher();
  }, [id]);

  const loadTeacher = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getById(id);
      setTeacher(data);
      setFormData({
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        phone: data.user.phone || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || 'male',
        nationality: data.nationality || '',
        address: data.address || '',
        employee_id: data.employee_id || '',
        joining_date: data.joining_date || '',
        qualification: data.qualification || 'bachelor',
        specialization: data.specialization || '',
        department: data.department || '',
        experience_years: data.experience_years?.toString() || '0',
        salary: data.salary?.toString() || '',
        subjects: data.subjects || '',
        is_active: data.user.is_active,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load teacher');
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
      const submitData = {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        is_active: String(formData.is_active) === 'true',
      };
      await teacherService.update(id, submitData);
      router.push(`/tenant-admin/teachers/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update teacher');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Edit Teacher"
      >
        <Loading />
      </DashboardLayout>
    );
  }

  if (error && !teacher) {
    return (
      <DashboardLayout
        sidebarItems={tenantAdminNav}
        tenantName="Sunshine High School"
        title="Edit Teacher"
      >
        <Alert type="error">{error}</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Edit Teacher"
    >
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className="mb-4"
        >
          Back to Teacher
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="e.g., Indian"
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

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Employee ID"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                  />
                  <Input
                    label="Joining Date"
                    name="joining_date"
                    type="date"
                    value={formData.joining_date}
                    onChange={handleChange}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qualification
                    </label>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bachelor">Bachelor&apos;s Degree</option>
                      <option value="master">Master&apos;s Degree</option>
                      <option value="phd">PhD</option>
                      <option value="diploma">Diploma</option>
                    </select>
                  </div>
                  <Input
                    label="Specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics, Physics"
                  />
                  <Input
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Science, Arts, Commerce"
                  />
                  <Input
                    label="Experience (Years)"
                    name="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={handleChange}
                  />
                  <Input
                    label="Salary"
                    name="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Monthly salary"
                  />
                  <Input
                    label="Subjects"
                    name="subjects"
                    value={formData.subjects}
                    onChange={handleChange}
                    placeholder="e.g., Math, Science, English"
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
