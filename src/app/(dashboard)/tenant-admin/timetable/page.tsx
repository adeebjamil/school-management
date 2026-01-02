'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { Calendar, Plus, FileText, BookOpen, Trash2, Clock } from 'lucide-react';
import api from '@/lib/api';

interface Period {
  id: string;
  subject: string;
  teacher_details: {
    id: string;
    name: string;
    employee_id: string;
  } | null;
  room_number: string;
  time_slot_details: {
    start_time: string;
    end_time: string;
    period_number: number;
  };
}

interface DaySchedule {
  day: string;
  periods: Period[];
}

interface Class {
  id: string;
  grade: string;
  section: string;
  class_name: string;
  academic_year: string;
}

export default function TimetablePage() {
  const router = useRouter();
  const [timetable, setTimetable] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [filters, setFilters] = useState({
    class_name: '',
    section: '',
  });

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (filters.class_name) {
      loadTimetable();
    }
  }, [filters.class_name, filters.section]);

  const loadClasses = async () => {
    try {
      const response = await api.get('/classes/');
      const classesData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setClasses(classesData);
      
      // Set first class as default if available
      if (classesData.length > 0) {
        setFilters({
          class_name: classesData[0].grade,
          section: classesData[0].section || '',
        });
      } else {
        // No classes available, stop loading
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Failed to load classes:', err);
      setError('Failed to load classes');
      setLoading(false);
    }
  };

  const loadTimetable = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        class_name: filters.class_name,
      };
      
      if (filters.section) {
        params.section = filters.section;
      }
      
      const response = await api.get('/timetable/entries/class_timetable/', { params });
      setTimetable(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load timetable:', err);
      setError('Failed to load timetable');
      setTimetable([]);
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'class_id') {
      const selectedClass = classes.find(c => c.id === value);
      if (selectedClass) {
        setFilters({
          class_name: selectedClass.grade,
          section: selectedClass.section || '',
        });
      }
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) {
      return;
    }

    try {
      await api.delete(`/timetable/entries/${entryId}/`);
      loadTimetable();
    } catch (err: any) {
      console.error('Failed to delete entry:', err);
      setError('Failed to delete timetable entry');
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Mathematics': 'bg-blue-100 text-blue-800 border-blue-200',
      'English': 'bg-purple-100 text-purple-800 border-purple-200',
      'Physics': 'bg-green-100 text-green-800 border-green-200',
      'Chemistry': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Biology': 'bg-teal-100 text-teal-800 border-teal-200',
      'Computer Science': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'History': 'bg-orange-100 text-orange-800 border-orange-200',
      'Geography': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Physical Education': 'bg-red-100 text-red-800 border-red-200',
      'Art': 'bg-pink-100 text-pink-800 border-pink-200',
    };
    return colors[subject] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Timetable Management"
    >
      <div className="h-full overflow-y-auto">
        <div className="space-y-5">
          {error && <Alert type="error">{error}</Alert>}

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Class Timetable</h2>
              <p className="text-gray-600">Manage and view class schedules and periods</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={<Clock className="w-4 h-4" />}
                onClick={() => router.push('/tenant-admin/timetable/time-slots')}
              >
                Time Slots
              </Button>
              <Button
                variant="outline"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => router.push('/tenant-admin/timetable/teacher')}
              >
                Teacher Timetable
              </Button>
              <Button
                icon={<Plus className="w-4 h-4" />}
                onClick={() => router.push('/tenant-admin/timetable/create')}
              >
                Add Entry
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    name="class_id"
                    value={classes.find(c => c.grade === filters.class_name && c.section === filters.section)?.id || ''}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {classes.length === 0 ? (
                      <option value="">No classes available</option>
                    ) : (
                      classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Timetable Grid */}
          <Card>
            <div className="p-0">
              {loading ? (
                <div className="p-8"><Loading /></div>
              ) : timetable.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Timetable Entries
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create timetable entries for this class to get started.
                  </p>
                  <Button
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => router.push('/tenant-admin/timetable/create')}
                  >
                    Add Entry
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Class {filters.class_name} {filters.section && `- Section ${filters.section}`}
                      </h3>
                      <Badge variant="info">Academic Year 2024-25</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {timetable.map((day, dayIndex) => (
                        <div key={dayIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {day.day}
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                            {day.periods.map((period, periodIndex) => (
                              <div
                                key={periodIndex}
                                className={`border-2 rounded-lg p-3 relative ${getSubjectColor(period.subject)}`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-bold opacity-70">
                                    Period {period.time_slot_details.period_number}
                                  </span>
                                  <span className="text-xs font-medium opacity-70">
                                    {period.time_slot_details.start_time} - {period.time_slot_details.end_time}
                                  </span>
                                </div>
                                <h5 className="font-bold text-sm mb-1">{period.subject}</h5>
                                <p className="text-xs opacity-80 mb-1">
                                  {period.teacher_details?.name || 'No teacher assigned'}
                                </p>
                                {period.room_number && (
                                  <div className="flex items-center gap-1 text-xs opacity-70 mb-2">
                                    <BookOpen className="w-3 h-3" />
                                    <span>Room {period.room_number}</span>
                                  </div>
                                )}
                                <div className="flex gap-1 mt-2">
                                  <button
                                    onClick={() => handleDeleteEntry(period.id)}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
