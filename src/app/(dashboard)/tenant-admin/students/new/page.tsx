'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { tenantAdminNav } from '@/config/navigation';
import { studentService } from '@/services/studentService';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    date_of_birth: '',
    gender: 'male',
    address: '',
    admission_number: '',
    admission_date: '',
    class_id: '',
    class_name: '',
    section: '',
    roll_number: '',
    academic_year: new Date().getFullYear().toString(),
  });

  const loadClasses = async () => {
    try {
      const response = await api.get('/classes/');
      const classesData = Array.isArray(response.data) ? response.data : response.data.results || [];
      
      // Transform the data to match the expected format
      const formattedClasses = classesData.map((cls: any) => ({
        id: cls.id,
        className: cls.class_name, // e.g., "Grade 9-A"
        grade: cls.grade,
        section: cls.section,
        classTeacher: cls.class_teacher_details ? {
          firstName: cls.class_teacher_details.first_name,
          lastName: cls.class_teacher_details.last_name
        } : null
      }));
      
      setClasses(formattedClasses);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If class is selected, auto-fill class_name and section
    if (name === 'class_id') {
      const selectedClass = classes.find(cls => cls.id === value);
      if (selectedClass) {
        setFormData({
          ...formData,
          class_id: value,
          class_name: selectedClass.grade, // Store grade for backend
          section: selectedClass.section || '',
        });
        return;
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await studentService.create(formData);
      router.push('/tenant-admin/students');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Add New Student"
    >
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className="mb-4"
        >
          Back to Students
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
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    helperText="Temporary password for first login"
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
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
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
                    required
                  />
                  <Input
                    label="Admission Date"
                    name="admission_date"
                    type="date"
                    value={formData.admission_date}
                    onChange={handleChange}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class *
                    </label>
                    <select
                      name="class_id"
                      value={formData.class_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.className}
                          {cls.classTeacher && 
                            ` (Teacher: ${cls.classTeacher.firstName} ${cls.classTeacher.lastName})`
                          }
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Student will be automatically assigned to the class teacher as counselor
                    </p>
                  </div>
                  <Input
                    label="Class Name (Optional)"
                    name="class_name"
                    value={formData.class_name}
                    onChange={handleChange}
                    placeholder="e.g., 10 (auto-filled from class)"
                    helperText="Leave empty to use class grade"
                  />
                  <Input
                    label="Section (Optional)"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    placeholder="e.g., A (auto-filled from class)"
                    helperText="Leave empty to use class section"
                  />
                  <Input
                    label="Roll Number"
                    name="roll_number"
                    value={formData.roll_number}
                    onChange={handleChange}
                  />
                  <Input
                    label="Academic Year"
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleChange}
                    placeholder="e.g., 2025"
                    required
                  />
                </div>
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
                  <Button type="submit" loading={loading}>
                    Add Student
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
