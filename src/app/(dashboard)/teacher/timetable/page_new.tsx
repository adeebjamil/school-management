'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { teacherNav } from '@/config/navigation';
import { Calendar, Clock, BookOpen, GraduationCap } from 'lucide-react';
import api from '@/lib/api';

interface Period {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
  subject: string;
  class_name: string;
  section: string;
  room_number: string;
}

interface DaySchedule {
  day: string;
  periods: Period[];
}

export default function TeacherTimetablePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timetable, setTimetable] = useState<DaySchedule[]>([]);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/timetable/entries/my_timetable/');
      setTimetable(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load timetable:', err);
      if (err.response?.status === 404) {
        setError('No timetable assigned');
      } else {
        setError('Failed to load timetable');
      }
      setTimetable([]);
      setLoading(false);
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

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={teacherNav}
        tenantName="Sunshine High School"
        title="My Timetable"
      >
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={teacherNav}
      tenantName="Sunshine High School"
      title="My Timetable"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Teaching Schedule</h2>
          <p className="text-gray-600 mt-1">Weekly class schedule assigned to you</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {timetable.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Timetable Available
              </h3>
              <p className="text-gray-600">
                Your teaching schedule will appear here once it's assigned by the administration.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {timetable.map((day, dayIndex) => (
              <Card key={dayIndex}>
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold text-gray-900">{day.day}</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                    {day.periods.map((period, periodIndex) => (
                      <div
                        key={periodIndex}
                        className={`border-2 rounded-lg p-3 ${getSubjectColor(period.subject)}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold opacity-70">
                            Period {period.period_number}
                          </span>
                          <span className="text-xs font-medium opacity-70">
                            {period.start_time} - {period.end_time}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm mb-1">{period.subject}</h4>
                        <div className="flex items-center gap-1 text-xs opacity-80 mb-1">
                          <GraduationCap className="w-3 h-3" />
                          <span>
                            Class {period.class_name}{period.section && `-${period.section}`}
                          </span>
                        </div>
                        {period.room_number && (
                          <div className="flex items-center gap-1 text-xs opacity-70">
                            <BookOpen className="w-3 h-3" />
                            <span>Room {period.room_number}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
