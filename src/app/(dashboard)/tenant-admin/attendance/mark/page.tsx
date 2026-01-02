'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { tenantAdminNav } from '@/config/navigation';
import { attendanceService } from '@/services/attendanceService';
import { studentService } from '@/services/studentService';
import { Student } from '@/types';
import { ArrowLeft, Check, X, Clock, FileText } from 'lucide-react';

export default function MarkAttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    class_name: '',
    section: '',
  });
  const [attendance, setAttendance] = useState<
    Record<string, { status: string; remarks: string }>
  >({});

  useEffect(() => {
    if (filters.class_name && filters.section) {
      loadStudents();
    }
  }, [filters.class_name, filters.section]);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await studentService.getAll();
      const filtered = data.filter(
        (s) =>
          s.class_name === filters.class_name &&
          s.section === filters.section &&
          s.is_active
      );
      setStudents(filtered);
      
      // Initialize all students as present by default
      const initialAttendance: Record<string, { status: string; remarks: string }> = {};
      filtered.forEach((s) => {
        initialAttendance[s.id] = { status: 'present', remarks: '' };
      });
      setAttendance(initialAttendance);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const setStatus = (studentId: string, status: string) => {
    setAttendance({
      ...attendance,
      [studentId]: { ...attendance[studentId], status },
    });
  };

  const setRemarks = (studentId: string, remarks: string) => {
    setAttendance({
      ...attendance,
      [studentId]: { ...attendance[studentId], remarks },
    });
  };

  const markAllPresent = () => {
    const updatedAttendance = { ...attendance };
    students.forEach((s) => {
      updatedAttendance[s.id] = { ...updatedAttendance[s.id], status: 'present' };
    });
    setAttendance(updatedAttendance);
  };

  const markAllAbsent = () => {
    const updatedAttendance = { ...attendance };
    students.forEach((s) => {
      updatedAttendance[s.id] = { ...updatedAttendance[s.id], status: 'absent' };
    });
    setAttendance(updatedAttendance);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const attendanceData = students.map((s) => ({
        student_id: s.id,
        status: attendance[s.id]?.status || 'present',
        remarks: attendance[s.id]?.remarks || '',
      }));

      await attendanceService.bulkMarkAttendance({
        date: filters.date,
        class_name: filters.class_name,
        section: filters.section,
        attendance: attendanceData as any,
      });

      setSuccess('Attendance marked successfully!');
      setTimeout(() => {
        router.push('/tenant-admin/attendance');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <X className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'excused':
        return <FileText className="w-5 h-5 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Mark Attendance"
    >
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className="mb-4"
        >
          Back to Attendance
        </Button>

        {error && <Alert type="error" className="mb-4">{error}</Alert>}
        {success && <Alert type="success" className="mb-4">{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Select Class</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Date"
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    required
                  />
                  <Input
                    label="Class"
                    name="class_name"
                    value={filters.class_name}
                    onChange={handleFilterChange}
                    placeholder="e.g., 10"
                    required
                  />
                  <Input
                    label="Section"
                    name="section"
                    value={filters.section}
                    onChange={handleFilterChange}
                    placeholder="e.g., A"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Student List */}
            {students.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Students ({students.length})
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={markAllPresent}
                      >
                        Mark All Present
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={markAllAbsent}
                      >
                        Mark All Absent
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {student.user.first_name} {student.user.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Roll: {student.roll_number || 'N/A'}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setStatus(student.id, 'present')}
                            className={`p-2 rounded-lg border-2 ${
                              attendance[student.id]?.status === 'present'
                                ? 'border-green-600 bg-green-50'
                                : 'border-gray-300 hover:border-green-600'
                            }`}
                            title="Present"
                          >
                            <Check className="w-5 h-5 text-green-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(student.id, 'absent')}
                            className={`p-2 rounded-lg border-2 ${
                              attendance[student.id]?.status === 'absent'
                                ? 'border-red-600 bg-red-50'
                                : 'border-gray-300 hover:border-red-600'
                            }`}
                            title="Absent"
                          >
                            <X className="w-5 h-5 text-red-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(student.id, 'late')}
                            className={`p-2 rounded-lg border-2 ${
                              attendance[student.id]?.status === 'late'
                                ? 'border-yellow-600 bg-yellow-50'
                                : 'border-gray-300 hover:border-yellow-600'
                            }`}
                            title="Late"
                          >
                            <Clock className="w-5 h-5 text-yellow-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(student.id, 'excused')}
                            className={`p-2 rounded-lg border-2 ${
                              attendance[student.id]?.status === 'excused'
                                ? 'border-gray-600 bg-gray-50'
                                : 'border-gray-300 hover:border-gray-600'
                            }`}
                            title="Excused"
                          >
                            <FileText className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Remarks (optional)"
                          value={attendance[student.id]?.remarks || ''}
                          onChange={(e) => setRemarks(student.id, e.target.value)}
                          className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit */}
            {students.length > 0 && (
              <Card>
                <CardFooter>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" loading={loading}>
                      Submit Attendance
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}

            {loadingStudents && (
              <Card>
                <CardContent>
                  <p className="text-center text-gray-600 py-8">Loading students...</p>
                </CardContent>
              </Card>
            )}

            {!loadingStudents && students.length === 0 && filters.class_name && filters.section && (
              <Card>
                <CardContent>
                  <p className="text-center text-gray-600 py-8">
                    No students found for Class {filters.class_name} - Section {filters.section}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
