'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { formatDate } from '@/lib/utils';
import { Calendar, Plus, FileText, Search, Eye } from 'lucide-react';
import api from '@/lib/api';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  remarks: string;
  marked_by_name: string;
  marked_at: string;
  student_details: {
    id: string;
    admission_number: string;
    roll_number: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export default function AttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    class_id: '',
    status: '',
  });

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (filters.date) {
      loadAttendance();
    }
  }, [filters.date, filters.class_id, filters.status]);

  const loadClasses = async () => {
    try {
      const response = await api.get('/classes/');
      setClasses(response.data.results || []);
    } catch (err: any) {
      console.error('Failed to load classes:', err);
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      
      let params = `?date=${filters.date}`;
      if (filters.class_id) {
        params += `&class_id=${filters.class_id}`;
      }
      
      const response = await api.get(`/attendance/date/${params}`);
      let data = response.data;
      
      // Filter by status if selected
      if (filters.status) {
        data = data.filter((record: AttendanceRecord) => record.status === filters.status);
      }
      
      setRecords(data);
    } catch (err: any) {
      console.error('Failed to load attendance:', err);
      setError(err.response?.data?.error || 'Failed to load attendance');
      setRecords([]);
    } finally {
      setLoading(false);
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    half_day: records.filter((r) => r.status === 'half_day').length,
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Attendance Management"
    >
      <div className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Attendance Records</h2>
            <p className="text-gray-600">Track and manage student attendance</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<FileText className="w-4 h-4" />}
              onClick={() => router.push('/tenant-admin/attendance/reports')}
            >
              Reports
            </Button>
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/tenant-admin/attendance/mark')}
            >
              Mark Attendance
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-600">Half Day</p>
              <p className="text-2xl font-bold text-blue-600">{stats.half_day}</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Date"
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  name="class_id"
                  value={filters.class_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.grade} - {cls.section}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Attendance Table */}
        <Card>
          <div className="p-4">
            {loading ? (
              <Loading />
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No attendance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Roll No.</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Admission No.</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Marked By</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono text-gray-900">
                          {record.student_details?.roll_number || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {record.student_details?.user?.first_name} {record.student_details?.user?.last_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {record.student_details?.admission_number || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {record.marked_by_name || 'System'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {record.remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {records.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-sm text-gray-600 text-center">
              Showing {records.length} attendance records
              {stats.total > 0 && (
                <span className="ml-2">
                  ({((stats.present / stats.total) * 100).toFixed(1)}% present)
                </span>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
