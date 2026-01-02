'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { parentNav } from '@/config/navigation';
import { Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import api from '@/lib/api';

interface ChildAttendance {
  student: {
    id: string;
    name: string;
    admission_number: string;
    class: string;
    section: string;
  };
  statistics: {
    total_days: number;
    present: number;
    absent: number;
    attendance_percentage: number;
  };
  is_primary: boolean;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  status_display: string;
  remarks?: string;
  marked_by: string;
  marked_at: string;
}

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [childrenAttendance, setChildrenAttendance] = useState<ChildAttendance[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [detailedRecords, setDetailedRecords] = useState<AttendanceRecord[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChildrenAttendance();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchDetailedAttendance(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildrenAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/parents/dashboard/attendance/');
      setChildrenAttendance(response.data.children || []);
      if (response.data.children?.length > 0) {
        setSelectedChild(response.data.children[0].student.id);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch attendance:', err);
      setError(err.response?.data?.error || 'Failed to load attendance data');
      setLoading(false);
    }
  };

  const fetchDetailedAttendance = async (studentId: string) => {
    try {
      setLoadingDetails(true);
      const response = await api.get(`/parents/child/${studentId}/attendance/`);
      setDetailedRecords(response.data.records || []);
      setLoadingDetails(false);
    } catch (err: any) {
      console.error('Failed to fetch detailed attendance:', err);
      setLoadingDetails(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4" />;
      case 'absent':
        return <AlertCircle className="w-4 h-4" />;
      case 'late':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={parentNav} title="Attendance">
        <Loading />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout sidebarItems={parentNav} title="Attendance">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (childrenAttendance.length === 0) {
    return (
      <DashboardLayout sidebarItems={parentNav} title="Attendance">
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No attendance records found</p>
        </div>
      </DashboardLayout>
    );
  }

  const selectedChildData = childrenAttendance.find(
    (c) => c.student.id === selectedChild
  );

  return (
    <DashboardLayout sidebarItems={parentNav} title="Attendance">
      <div className="space-y-6">
        {/* Child Selector */}
        <div className="flex flex-wrap gap-3">
          {childrenAttendance.map((child) => (
            <button
              key={child.student.id}
              onClick={() => setSelectedChild(child.student.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedChild === child.student.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {child.student.name}
            </button>
          ))}
        </div>

        {selectedChildData && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedChildData.statistics.total_days}
                  </p>
                  <p className="text-sm text-gray-600">Total Days</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedChildData.statistics.present}
                  </p>
                  <p className="text-sm text-gray-600">Present</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedChildData.statistics.absent}
                  </p>
                  <p className="text-sm text-gray-600">Absent</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedChildData.statistics.attendance_percentage}%
                  </p>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
              </Card>
            </div>

            {/* Student Info Card */}
            <Card>
              <div className="flex items-center gap-4">
                <Avatar name={selectedChildData.student.name} size="lg" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedChildData.student.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedChildData.student.class} {selectedChildData.student.section ? `- Section ${selectedChildData.student.section}` : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    Admission No: {selectedChildData.student.admission_number}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900">
                        {selectedChildData.statistics.attendance_percentage}%
                      </p>
                      <p className="text-xs text-blue-600">Attendance</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Detailed Records */}
            <Card title="Attendance Records (Last 30 Days)">
              {loadingDetails ? (
                <div className="py-8">
                  <Loading />
                </div>
              ) : detailedRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No attendance records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marked By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailedRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {getStatusIcon(record.status)}
                              {record.status_display}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record.remarks || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {record.marked_by}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
