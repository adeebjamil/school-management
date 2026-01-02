'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { teacherNav } from '@/config/navigation';
import { Users, BookOpen, Calendar, FileCheck } from 'lucide-react';

export default function TeacherDashboard() {
  const stats = [
    {
      title: 'Total Students',
      value: '127',
      change: 'Across 4 classes',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Courses Teaching',
      value: '4',
      change: 'Active this semester',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Classes Today',
      value: '5',
      change: '2 completed',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Pending Grades',
      value: '23',
      change: 'To be submitted',
      icon: FileCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const todaySchedule = [
    { time: '08:00 AM', class: 'Grade 10A', subject: 'Mathematics', room: 'B-205', status: 'completed' },
    { time: '10:00 AM', class: 'Grade 10B', subject: 'Mathematics', room: 'B-206', status: 'completed' },
    { time: '12:00 PM', class: 'Grade 9A', subject: 'Algebra', room: 'B-201', status: 'upcoming' },
    { time: '02:00 PM', class: 'Grade 11A', subject: 'Calculus', room: 'B-210', status: 'upcoming' },
  ];

  return (
    <DashboardLayout
      sidebarItems={teacherNav}
      tenantName="Sunshine High School"
      title="Teacher Dashboard"
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
        {/* Today's Schedule */}
        <Card title="Today's Schedule">
          <div className="space-y-3">
            {todaySchedule.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    item.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <span className={`text-xs font-medium ${
                      item.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                    }`}>{item.time}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{item.class}</p>
                    {item.status === 'completed' && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Completed</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{item.subject}</p>
                  <p className="text-xs text-gray-500">Room: {item.room}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Mark Attendance</p>
              <p className="text-sm text-gray-500">Record student attendance</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Submit Grades</p>
              <p className="text-sm text-gray-500">Enter exam results</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Create Assignment</p>
              <p className="text-sm text-gray-500">Assign homework to students</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">View Timetable</p>
              <p className="text-sm text-gray-500">Check your weekly schedule</p>
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
