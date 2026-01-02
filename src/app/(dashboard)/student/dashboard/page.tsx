'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { studentNav } from '@/config/navigation';
import { BookOpen, Calendar, FileText, Trophy } from 'lucide-react';

export default function StudentDashboard() {
  // Mock data
  const stats = [
    {
      title: 'Enrolled Courses',
      value: '8',
      change: 'Current semester',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Attendance',
      value: '92%',
      change: 'This month',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Assignments',
      value: '5',
      change: '2 due this week',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Average Grade',
      value: '85%',
      change: 'B+ overall',
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const upcomingExams = [
    { id: 1, subject: 'Mathematics', date: '2025-02-15', time: '09:00 AM' },
    { id: 2, subject: 'Physics', date: '2025-02-18', time: '11:00 AM' },
    { id: 3, subject: 'Chemistry', date: '2025-02-20', time: '02:00 PM' },
  ];

  const todayClasses = [
    { time: '08:00 AM', subject: 'English', teacher: 'Mr. Smith', room: 'A-101' },
    { time: '10:00 AM', subject: 'Mathematics', teacher: 'Ms. Johnson', room: 'B-205' },
    { time: '01:00 PM', subject: 'History', teacher: 'Mr. Brown', room: 'C-302' },
  ];

  return (
    <DashboardLayout
      sidebarItems={studentNav}
      tenantName="Sunshine High School"
      title="Student Dashboard"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <Card title="Today's Classes">
          <div className="space-y-3">
            {todayClasses.map((classItem, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">{classItem.time}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{classItem.subject}</p>
                  <p className="text-sm text-gray-600">{classItem.teacher}</p>
                  <p className="text-xs text-gray-500">Room: {classItem.room}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Exams */}
        <Card title="Upcoming Exams">
          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">{exam.subject}</p>
                  <p className="text-sm text-gray-600">{exam.date}</p>
                </div>
                <Badge variant="info">{exam.time}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
