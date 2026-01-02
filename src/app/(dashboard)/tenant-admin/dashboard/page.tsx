'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { Users, GraduationCap, UserCheck, BookOpen, Calendar, ClipboardCheck, AlertCircle, TrendingUp, Bus, Clock } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

interface DashboardStats {
  students: { total: number; active: number };
  teachers: { total: number; active: number };
  classes: { total: number };
  library: { total_books: number; issued_books: number; available_books: number; overdue_books: number };
  attendance: { present: number; absent: number; total: number };
  exams: { upcoming: number; completed: number; total: number };
  transport: { total_vehicles: number; active_vehicles: number; total_routes: number; assigned_students: number };
  timetable: { total_entries: number; total_time_slots: number };
}

export default function TenantAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints with error handling
      const requests = [
        api.get('/students/').catch(() => ({ data: [] })),
        api.get('/teachers/').catch(() => ({ data: [] })),
        api.get('/classes/').catch(() => ({ data: [] })),
        api.get('/library/books/stats/').catch(() => ({ data: { total_books: 0, issued_books: 0, available_books: 0, overdue_books: 0 } })),
        api.get('/exams/').catch(() => ({ data: [] })),
        api.get('/transport/vehicles/').catch(() => ({ data: [] })),
        api.get('/transport/routes/').catch(() => ({ data: [] })),
        api.get('/transport/assignments/').catch(() => ({ data: [] })),
        api.get('/timetable/entries/').catch(() => ({ data: [] })),
        api.get('/timetable/time-slots/').catch(() => ({ data: [] })),
      ];
      
      const [
        studentsRes, 
        teachersRes, 
        classesRes, 
        libraryRes, 
        examsRes,
        vehiclesRes,
        routesRes,
        assignmentsRes,
        timetableRes,
        timeSlotsRes
      ] = await Promise.all(requests);

      // Process students data
      const students = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.results || [];
      const activeStudents = students.filter((s: any) => s.is_active).length;

      // Process teachers data
      const teachers = Array.isArray(teachersRes.data) ? teachersRes.data : teachersRes.data.results || [];
      const activeTeachers = teachers.filter((t: any) => t.is_active).length;

      // Process classes data
      const classes = Array.isArray(classesRes.data) ? classesRes.data : classesRes.data.results || [];

      // Process exams data
      const exams = Array.isArray(examsRes.data) ? examsRes.data : examsRes.data.results || [];
      const now = new Date();
      const upcomingExams = exams.filter((e: any) => new Date(e.start_date) > now).length;
      const completedExams = exams.filter((e: any) => new Date(e.end_date) < now).length;

      // Process transport data
      const vehicles = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : vehiclesRes.data.results || [];
      const activeVehicles = vehicles.filter((v: any) => v.status === 'active').length;
      const routes = Array.isArray(routesRes.data) ? routesRes.data : routesRes.data.results || [];
      const assignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : assignmentsRes.data.results || [];
      const activeAssignments = assignments.filter((a: any) => a.is_active).length;

      // Process timetable data
      const timetableEntries = Array.isArray(timetableRes.data) ? timetableRes.data : timetableRes.data.results || [];
      const timeSlots = Array.isArray(timeSlotsRes.data) ? timeSlotsRes.data : timeSlotsRes.data.results || [];

      setStats({
        students: { total: students.length, active: activeStudents },
        teachers: { total: teachers.length, active: activeTeachers },
        classes: { total: classes.length },
        library: libraryRes.data || { total_books: 0, issued_books: 0, available_books: 0, overdue_books: 0 },
        attendance: { present: 0, absent: 0, total: 0 }, // Add attendance API when available
        exams: { upcoming: upcomingExams, completed: completedExams, total: exams.length },
        transport: { 
          total_vehicles: vehicles.length, 
          active_vehicles: activeVehicles,
          total_routes: routes.length,
          assigned_students: activeAssignments
        },
        timetable: {
          total_entries: timetableEntries.length,
          total_time_slots: timeSlots.length
        },
      });

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <DashboardLayout sidebarItems={tenantAdminNav} title="Dashboard">
        <Loading />
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout sidebarItems={tenantAdminNav} title="Dashboard">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Failed to load dashboard'}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Prepare chart data
  const studentActivityData = [
    { name: 'Active', value: stats.students.active, color: '#10B981' },
    { name: 'Inactive', value: stats.students.total - stats.students.active, color: '#EF4444' },
  ];

  const libraryData = [
    { name: 'Available', value: stats.library.available_books },
    { name: 'Issued', value: stats.library.issued_books },
    { name: 'Overdue', value: stats.library.overdue_books },
  ];

  const examStatusData = [
    { name: 'Upcoming', value: stats.exams.upcoming, fill: '#3B82F6' },
    { name: 'Completed', value: stats.exams.completed, fill: '#10B981' },
  ];

  const transportData = [
    { name: 'Active Vehicles', value: stats.transport.active_vehicles },
    { name: 'Inactive Vehicles', value: stats.transport.total_vehicles - stats.transport.active_vehicles },
    { name: 'Total Routes', value: stats.transport.total_routes },
    { name: 'Students Assigned', value: stats.transport.assigned_students },
  ];

  const timetableData = [
    { name: 'Timetable Entries', value: stats.timetable.total_entries },
    { name: 'Time Slots', value: stats.timetable.total_time_slots },
  ];

  const overviewData = [
    { category: 'Students', count: stats.students.total },
    { category: 'Teachers', count: stats.teachers.total },
    { category: 'Classes', count: stats.classes.total },
    { category: 'Books', count: stats.library.total_books },
  ];

  return (
    <DashboardLayout sidebarItems={tenantAdminNav} title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Students Card */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.students.total}</p>
                <p className="text-xs text-green-600">{stats.students.active} active</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Teachers Card */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.teachers.total}</p>
                <p className="text-xs text-green-600">{stats.teachers.active} active</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Classes Card */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Classes</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.classes.total}</p>
                <p className="text-xs text-gray-500">Active classes</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Library Card */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Library Books</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.library.total_books}</p>
                <p className="text-xs text-orange-600">{stats.library.issued_books} issued</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          {/* Available Books Card */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Books</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.library.available_books}</p>
                <p className="text-xs text-green-600">Ready to issue</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Issued Books Card */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Issued Books</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.library.issued_books}</p>
                <p className="text-xs text-blue-600">Currently issued</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Transport Card */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transport Vehicles</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.transport.total_vehicles}</p>
                <p className="text-xs text-blue-600">{stats.transport.active_vehicles} active</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Routes Card */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transport Routes</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.transport.total_routes}</p>
                <p className="text-xs text-green-600">{stats.transport.assigned_students} assigned</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Bus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Timetable Card */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Timetable Entries</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.timetable.total_entries}</p>
                <p className="text-xs text-purple-600">{stats.timetable.total_time_slots} time slots</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Exams Card */}
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Exams</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stats.exams.total}</p>
                <p className="text-xs text-orange-600">{stats.exams.upcoming} upcoming</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overview Bar Chart */}
          <Card title="System Overview">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Total Count" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Student Activity Pie Chart */}
          <Card title="Student Activity Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentActivityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {studentActivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Library Status Bar Chart */}
          <Card title="Library Book Status">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={libraryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#10B981" name="Books" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Exam Status Pie Chart */}
          <Card title="Exam Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={examStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {examStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 3 - Transport & Timetable */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transport Stats Bar Chart */}
          <Card title="Transport Statistics">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Timetable Stats Bar Chart */}
          <Card title="Timetable Statistics">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timetableData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8B5CF6" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <div className="text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.exams.upcoming}</p>
              <p className="text-sm text-gray-600">Upcoming Exams</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <ClipboardCheck className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.exams.completed}</p>
              <p className="text-sm text-gray-600">Completed Exams</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.library.overdue_books}</p>
              <p className="text-sm text-gray-600">Overdue Books</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Bus className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.transport.assigned_students}</p>
              <p className="text-sm text-gray-600">Transport Assigned</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.timetable.total_time_slots}</p>
              <p className="text-sm text-gray-600">Time Slots</p>
            </div>
          </Card>
        </div>

        {/* Quick Stats Summary */}
        <Card title="Quick Summary">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">{stats.library.available_books}</p>
              <p className="text-xs text-gray-600">Available Books</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">{stats.library.issued_books}</p>
              <p className="text-xs text-gray-600">Issued Books</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">{stats.teachers.active}</p>
              <p className="text-xs text-gray-600">Active Teachers</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <GraduationCap className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">{stats.students.active}</p>
              <p className="text-xs text-gray-600">Active Students</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <Bus className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">{stats.transport.active_vehicles}</p>
              <p className="text-xs text-gray-600">Active Vehicles</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <Clock className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-gray-900">{stats.timetable.total_entries}</p>
              <p className="text-xs text-gray-600">Timetable Entries</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
