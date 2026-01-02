'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { studentNav } from '@/config/navigation';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  remarks: string;
  marked_by_name: string;
  marked_at: string;
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}

export default function StudentAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    percentage: 0,
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadAttendance();
  }, [selectedMonth]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      
      // Get student profile to get student ID
      const profileResponse = await api.get('/students/profile/');
      const studentId = profileResponse.data.id;
      
      // Calculate date range for selected month
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      
      // Fetch attendance history and stats in parallel
      const [historyResponse, statsResponse] = await Promise.all([
        api.get(`/attendance/student/${studentId}/history/?start_date=${startDate}&end_date=${endDate}`),
        api.get(`/attendance/student/${studentId}/stats/?start_date=${startDate}&end_date=${endDate}`),
      ]);
      
      setAttendanceRecords(historyResponse.data);
      
      // Set stats from API response
      const apiStats = statsResponse.data;
      setStats({
        totalDays: apiStats.total_days,
        presentDays: apiStats.present_days,
        absentDays: apiStats.absent_days,
        lateDays: apiStats.late_days,
        percentage: apiStats.attendance_percentage,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      half_day: 'bg-blue-100 text-blue-800',
    };
    const displayStatus = status === 'half_day' ? 'Half Day' : status.charAt(0).toUpperCase() + status.slice(1);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {displayStatus}
      </span>
    );
  };

  return (
    <DashboardLayout
      sidebarItems={studentNav}
      tenantName="Sunshine High School"
      title="My Attendance"
    >
      <div className="space-y-6">
        {/* Header with Month Filter */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Attendance</h2>
            <p className="text-gray-600 mt-1">Track your attendance records</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.percentage}%</p>
                    </div>
                    <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Present Days</p>
                      <p className="text-3xl font-bold text-green-600">{stats.presentDays}</p>
                    </div>
                    <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Absent Days</p>
                      <p className="text-3xl font-bold text-red-600">{stats.absentDays}</p>
                    </div>
                    <XCircle className="w-12 h-12 text-red-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Late Days</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.lateDays}</p>
                    </div>
                    <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Records */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
              </CardHeader>
              <CardContent>
                {attendanceRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records found for this month
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Marked By</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((record) => (
                          <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {new Date(record.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(record.status)}
                                {getStatusBadge(record.status)}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{record.marked_by_name || 'System'}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{record.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
