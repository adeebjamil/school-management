'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { parentNav } from '@/config/navigation';
import { User, Calendar, BookOpen, TrendingUp } from 'lucide-react';

export default function ParentDashboard() {
  // Mock data for children
  const children = [
    {
      id: 1,
      name: 'John Doe',
      class: 'Grade 10A',
      attendance: '94%',
      grade: 'A',
      subjects: 8,
    },
    {
      id: 2,
      name: 'Jane Doe',
      class: 'Grade 8B',
      attendance: '96%',
      grade: 'A+',
      subjects: 7,
    },
  ];

  const upcomingEvents = [
    { date: '2025-02-15', event: 'Parent-Teacher Meeting', child: 'John Doe' },
    { date: '2025-02-18', event: 'Mathematics Exam', child: 'John Doe' },
    { date: '2025-02-20', event: 'Science Fair', child: 'Jane Doe' },
    { date: '2025-02-25', event: 'Annual Sports Day', child: 'Both' },
  ];

  const recentNotifications = [
    { type: 'assignment', message: 'New homework assigned in Mathematics', time: '2 hours ago', child: 'John' },
    { type: 'grade', message: 'New grade posted for English essay', time: '5 hours ago', child: 'Jane' },
    { type: 'attendance', message: 'Attendance marked for today', time: '1 day ago', child: 'Both' },
  ];

  return (
    <DashboardLayout
      sidebarItems={parentNav}
      tenantName="Sunshine High School"
      title="Parent Dashboard"
    >
      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {children.map((child) => (
          <Card key={child.id}>
            <div className="flex items-start gap-4 mb-4">
              <Avatar name={child.name} size="lg" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                <p className="text-sm text-gray-600">{child.class}</p>
              </div>
              <Badge variant="success">{child.grade}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Attendance</p>
                <p className="text-sm font-semibold text-gray-900">{child.attendance}</p>
              </div>
              <div className="text-center">
                <BookOpen className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Subjects</p>
                <p className="text-sm font-semibold text-gray-900">{child.subjects}</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Performance</p>
                <p className="text-sm font-semibold text-gray-900">Excellent</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card title="Upcoming Events">
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.event}</p>
                  <p className="text-sm text-gray-600">{event.date}</p>
                  <p className="text-xs text-gray-500">{event.child}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Notifications */}
        <Card title="Recent Notifications">
          <div className="space-y-3">
            {recentNotifications.map((notification, index) => (
              <div key={index} className="flex items-start gap-3 py-2">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'assignment' ? 'bg-blue-600' :
                  notification.type === 'grade' ? 'bg-green-600' :
                  'bg-orange-600'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500">{notification.child} • {notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
