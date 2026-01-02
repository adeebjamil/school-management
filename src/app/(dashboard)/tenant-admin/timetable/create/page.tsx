'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import api from '@/lib/api';

interface Class {
  id: string;
  grade: string;
  section: string;
  class_name: string;
  academic_year: string;
}

interface Teacher {
  id: string;
  name: string;
  employee_id: string;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  period_number: number;
}

export default function CreateTimetablePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  const [formData, setFormData] = useState({
    class_name: '',
    section: '',
    day: 'monday',
    time_slot_id: '',
    subject: '',
    teacher_id: '',
    room_number: '',
    academic_year: '2024-25',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load classes
      const classesResponse = await api.get('/classes/');
      const classesData = Array.isArray(classesResponse.data) ? classesResponse.data : classesResponse.data.results || [];
      setClasses(classesData);
      
      if (classesData.length > 0) {
        setFormData(prev => ({
          ...prev,
          class_name: classesData[0].grade,
          section: classesData[0].section || '',
        }));
      }
      
      // Load teachers
      const teachersResponse = await api.get('/teachers/');
      const teachersData = Array.isArray(teachersResponse.data) ? teachersResponse.data : teachersResponse.data.results || [];
      const formattedTeachers = teachersData.map((t: any) => ({
        id: t.id,
        name: t.full_name || `${t.first_name || ''} ${t.last_name || ''}`.trim(),
        employee_id: t.employee_id,
      }));
      setTeachers(formattedTeachers);
      
      // Load time slots
      const slotsResponse = await api.get('/timetable/time-slots/');
      const slotsData = Array.isArray(slotsResponse.data) ? slotsResponse.data : slotsResponse.data.results || [];
      setTimeSlots(slotsData);
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load required data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'class_id') {
      const selectedClass = classes.find(c => c.id === value);
      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          class_name: selectedClass.grade,
          section: selectedClass.section || '',
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.class_name || !formData.time_slot_id || !formData.subject) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await api.post('/timetable/entries/', formData);
      
      router.push('/tenant-admin/timetable');
    } catch (err: any) {
      console.error('Failed to create timetable entry:', err);
      setError(err.response?.data?.error || 'Failed to create timetable entry');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Create Timetable Entry"
    >
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.back()}
            >
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Timetable Entry</h2>
              <p className="text-gray-600">Create a new class period entry</p>
            </div>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Entry Details</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="class_id"
                      value={classes.find(c => c.grade === formData.class_name && c.section === formData.section)?.id || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="day"
                      value={formData.day}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Slot <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="time_slot_id"
                      value={formData.time_slot_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Time Slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          Period {slot.period_number}: {slot.start_time} - {slot.end_time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Mathematics"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher
                    </label>
                    <select
                      name="teacher_id"
                      value={formData.teacher_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Teacher (Optional)</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.employee_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Number
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleInputChange}
                      placeholder="e.g., 101"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    icon={<Save className="w-4 h-4" />}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Entry'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
