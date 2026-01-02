'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { Calendar, Plus, Search, BookOpen, Trash2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

interface Period {
  id: string;
  subject: string;
  class_name: string;
  section: string;
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

interface Teacher {
  id: string;
  name: string;
  employee_id: string;
  email: string;
  phone: string;
}

export default function TeacherTimetablePage() {
  const router = useRouter();
  const [timetable, setTimetable] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await api.get('/teachers/');
      const teachersData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setTeachers(teachersData);
    } catch (err: any) {
      console.error('Failed to load teachers:', err);
      setError('Failed to load teachers');
    }
  };

  const loadTeacherTimetable = async (teacherId: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/timetable/entries/teacher_timetable/?teacher_id=${teacherId}`);
      setTimetable(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load timetable:', err);
      setError('Failed to load timetable');
      setTimetable([]);
      setLoading(false);
    }
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    loadTeacherTimetable(teacher.id);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) {
      return;
    }

    try {
      await api.delete(`/timetable/entries/${entryId}/`);
      if (selectedTeacher) {
        loadTeacherTimetable(selectedTeacher.id);
      }
    } catch (err: any) {
      console.error('Failed to delete entry:', err);
      setError('Failed to delete timetable entry');
    }
  };

  const handleCreateEntry = () => {
    if (selectedTeacher) {
      router.push(`/tenant-admin/timetable/create?teacher_id=${selectedTeacher.id}`);
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

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Teacher Timetable Management"
    >
      <div className="h-full overflow-y-auto">
        <div className="space-y-5">
          {error && <Alert type="error">{error}</Alert>}

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Teacher Timetable</h2>
              <p className="text-gray-600">Search and manage teacher schedules</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.push('/tenant-admin/timetable')}
              >
                Back to Class Timetable
              </Button>
              {selectedTeacher && (
                <Button
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleCreateEntry}
                >
                  Add Entry
                </Button>
              )}
            </div>
          </div>

          {/* Teacher Selection */}
          {!selectedTeacher ? (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Select Teacher</h3>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by name, employee ID, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredTeachers.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No teachers found</p>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        onClick={() => handleTeacherSelect(teacher)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{teacher.name}</h4>
                            <p className="text-sm text-gray-600">ID: {teacher.employee_id}</p>
                            <p className="text-sm text-gray-500">{teacher.email}</p>
                          </div>
                          <Badge variant="info">{teacher.phone}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Selected Teacher Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedTeacher.name}</h3>
                      <p className="text-sm text-gray-600">
                        Employee ID: {selectedTeacher.employee_id} | {selectedTeacher.email}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTeacher(null);
                        setTimetable([]);
                      }}
                    >
                      Change Teacher
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Timetable Display */}
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
                        Create timetable entries for this teacher to get started.
                      </p>
                      <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={handleCreateEntry}
                      >
                        Add Entry
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Teaching Schedule
                          </h3>
                          <Badge variant="info">
                            {timetable.reduce((sum, day) => sum + day.periods.length, 0)} periods/week
                          </Badge>
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
                                      Class {period.class_name}{period.section && `-${period.section}`}
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
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
