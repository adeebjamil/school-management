'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { teacherNav } from '@/config/navigation';
import { Calendar, Users, CheckCircle, XCircle, Clock, Filter, X, History, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

interface ClassSection {
  id: string;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  totalStudents: number;
}

interface Student {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  admissionNumber: string;
  status: 'present' | 'absent' | 'late' | null;
}

interface AttendanceStats {
  totalClasses: number;
  classesConducted: number;
  averageAttendance: number;
  presentToday: number;
  absentToday: number;
}

export default function TeacherAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [historyStats, setHistoryStats] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadClasses();
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass, selectedDate]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      
      // Get teacher's profile to find assigned class
      const profileResponse = await api.get('/teachers/profile/');
      const teacherData = profileResponse.data;
      
      if (!teacherData.id) {
        setError('Teacher profile not found');
        setLoading(false);
        return;
      }
      
      // Get classes where this teacher is the class teacher
      const classesResponse = await api.get(`/classes/?class_teacher=${teacherData.id}`);
      const classesData = Array.isArray(classesResponse.data) 
        ? classesResponse.data 
        : classesResponse.data.results || [];
      
      const formattedClasses: ClassSection[] = classesData.map((cls: any) => ({
        id: cls.id,
        name: cls.class_name || cls.className,
        grade: cls.grade,
        section: cls.section,
        academicYear: cls.academic_year || cls.academicYear,
        totalStudents: cls.student_count || cls.studentCount || 0,
      }));
      
      setClasses(formattedClasses);
      
      // Auto-select first class if available
      if (formattedClasses.length > 0) {
        setSelectedClass(formattedClasses[0]);
      } else {
        setError('You are not assigned as a class teacher to any class yet.');
      }
    } catch (err: any) {
      console.error('Error loading classes:', err);
      setError(err.response?.data?.error || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from loaded data
      const totalClasses = classes.length;
      const studentsCount = students.length;
      
      // TODO: Once attendance records are implemented, fetch real stats
      // For now, use calculated values from current data
      setStats({
        totalClasses: totalClasses,
        classesConducted: 0, // Will be updated when attendance records are implemented
        averageAttendance: 0,
        presentToday: 0,
        absentToday: 0,
      });
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadStudents = async () => {
    if (!selectedClass) return;
    
    try {
      setLoading(true);
      
      // Get all students from the selected class
      const response = await api.get('/students/');
      const studentsData = response.data;
      
      // Filter students by class ID
      const classStudents = studentsData.filter((student: any) => 
        student.school_class === selectedClass.id
      );
      
      const formattedStudents: Student[] = classStudents.map((student: any) => ({
        id: student.id,
        firstName: student.user?.first_name || '',
        lastName: student.user?.last_name || '',
        name: `${student.user?.first_name || ''} ${student.user?.last_name || ''}`.trim(),
        rollNumber: student.roll_number || '',
        admissionNumber: student.admission_number || '',
        status: null,
      }));

      setStudents(formattedStudents);
    } catch (err: any) {
      console.error('Error loading students:', err);
      setError(err.response?.data?.error || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const markStudentAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, status } : student
    ));
  };

  const markAllPresent = () => {
    setStudents(students.map(student => ({ ...student, status: 'present' as const })));
  };

  const markAllAbsent = () => {
    setStudents(students.map(student => ({ ...student, status: 'absent' as const })));
  };

  const handleSubmitAttendance = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      // Check if all students are marked
      const unmarkedStudents = students.filter(s => !s.status);
      if (unmarkedStudents.length > 0) {
        setError(`Please mark attendance for all students. ${unmarkedStudents.length} students remaining.`);
        return;
      }

      // Prepare attendance records
      const attendanceRecords = students
        .filter(s => s.status) // Only include students with marked status
        .map(s => ({
          student_id: s.id,
          status: s.status!,
          remarks: '',
        }));

      if (attendanceRecords.length === 0) {
        setError('Please mark attendance for at least one student');
        return;
      }

      console.log('Submitting attendance with data:', {
        date: selectedDate,
        attendance_records: attendanceRecords,
      });

      // Submit to backend
      const response = await api.post('/attendance/mark/', {
        date: selectedDate,
        attendance_records: attendanceRecords,
      });
      
      console.log('Attendance submission response:', response.data);

      setSuccess('Attendance submitted successfully');
      setIsMarkingAttendance(false);
      loadStats();
    } catch (err: any) {
      console.error('Attendance submission error:', err);
      console.error('Error response:', err.response?.data);
      
      // Extract error message properly
      let errorMessage = 'Failed to submit attendance';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.attendance_records) {
          errorMessage = JSON.stringify(err.response.data.attendance_records);
        } else if (err.response.data.date) {
          errorMessage = JSON.stringify(err.response.data.date);
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const loadStudentHistory = async (student: Student) => {
    try {
      setLoadingHistory(true);
      setSelectedStudentForHistory(student);
      setShowHistoryModal(true);
      
      // Get last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Fetch history and stats in parallel
      const [historyResponse, statsResponse] = await Promise.all([
        api.get(`/attendance/student/${student.id}/history/?start_date=${startDate}&end_date=${endDate}`),
        api.get(`/attendance/student/${student.id}/stats/?start_date=${startDate}&end_date=${endDate}`),
      ]);
      
      setAttendanceHistory(historyResponse.data);
      setHistoryStats(statsResponse.data);
    } catch (err: any) {
      console.error('Error loading history:', err);
      setError('Failed to load attendance history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const getAttendanceCounts = () => {
    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const late = students.filter(s => s.status === 'late').length;
    const unmarked = students.filter(s => !s.status).length;
    return { present, absent, late, unmarked };
  };

  const counts = getAttendanceCounts();

  return (
    <DashboardLayout
      sidebarItems={teacherNav}
      tenantName="Sunshine High School"
      title="Attendance"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600 mt-1">Mark and manage student attendance</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Classes</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Conducted</p>
                    <p className="text-3xl font-bold text-green-600">{stats.classesConducted}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Attendance</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.averageAttendance}%</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Present Today</p>
                    <p className="text-3xl font-bold text-green-600">{stats.presentToday}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading && !selectedClass ? (
          <Loading />
        ) : (
          <>
            {/* Class Selection */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Select Class</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {classes.map((classItem) => (
                    <button
                      key={classItem.id}
                      onClick={() => {
                        setSelectedClass(classItem);
                        setIsMarkingAttendance(false);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedClass?.id === classItem.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900">{classItem.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">Grade {classItem.grade}-{classItem.section}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {classItem.totalStudents} Students
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mark Attendance Section */}
            {selectedClass && (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedClass.name} - {selectedClass.academicYear}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedClass.totalStudents} Students
                    </p>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date().toISOString().slice(0, 10)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {!isMarkingAttendance && (
                      <Button onClick={() => setIsMarkingAttendance(true)}>
                        Mark Attendance
                      </Button>
                    )}
                  </div>
                </div>

                {isMarkingAttendance && (
                  <>
                    {/* Quick Actions */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Present:</span>
                              <span className="ml-2 font-medium text-green-600">{counts.present}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Absent:</span>
                              <span className="ml-2 font-medium text-red-600">{counts.absent}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Late:</span>
                              <span className="ml-2 font-medium text-yellow-600">{counts.late}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Unmarked:</span>
                              <span className="ml-2 font-medium text-gray-600">{counts.unmarked}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={markAllPresent}>
                              Mark All Present
                            </Button>
                            <Button variant="outline" size="sm" onClick={markAllAbsent}>
                              Mark All Absent
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Students List */}
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Students</h3>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <Loading />
                        ) : (
                          <div className="space-y-2">
                            {students.map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-gray-900 w-12">
                                    {student.rollNumber}
                                  </span>
                                  <span className="text-gray-900">{student.name}</span>
                                  <button
                                    onClick={() => loadStudentHistory(student)}
                                    className="ml-auto text-blue-600 hover:text-blue-800 p-1"
                                    title="View attendance history"
                                  >
                                    <History className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => markStudentAttendance(student.id, 'present')}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                      student.status === 'present'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Present
                                  </button>
                                  <button
                                    onClick={() => markStudentAttendance(student.id, 'late')}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                      student.status === 'late'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Late
                                  </button>
                                  <button
                                    onClick={() => markStudentAttendance(student.id, 'absent')}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                      student.status === 'absent'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Absent
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Submit Actions */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsMarkingAttendance(false);
                              loadStudents();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSubmitAttendance}
                            loading={submitting}
                            disabled={counts.unmarked > 0}
                          >
                            Submit Attendance
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Attendance History Modal */}
        {showHistoryModal && selectedStudentForHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Attendance History
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedStudentForHistory.name} (Roll No: {selectedStudentForHistory.rollNumber})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedStudentForHistory(null);
                    setAttendanceHistory([]);
                    setHistoryStats(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <Loading />
                ) : (
                  <div className="space-y-6">
                    {/* Statistics */}
                    {historyStats && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Total Days</p>
                          <p className="text-2xl font-bold text-blue-600">{historyStats.total_days}</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Present</p>
                          <p className="text-2xl font-bold text-green-600">{historyStats.present_days}</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <p className="text-sm text-gray-600">Absent</p>
                          <p className="text-2xl font-bold text-red-600">{historyStats.absent_days}</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-gray-600">Late</p>
                          <p className="text-2xl font-bold text-yellow-600">{historyStats.late_days}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600">Percentage</p>
                          <p className="text-2xl font-bold text-purple-600">{historyStats.attendance_percentage}%</p>
                        </div>
                      </div>
                    )}

                    {/* History List */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Last 30 Days</h4>
                      {attendanceHistory.length > 0 ? (
                        <div className="space-y-2">
                          {attendanceHistory.map((record: any) => (
                            <div 
                              key={record.id}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-4">
                                <div className="text-sm">
                                  <p className="font-medium text-gray-900">
                                    {new Date(record.date).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  {record.marked_by_name && (
                                    <p className="text-xs text-gray-500">Marked by: {record.marked_by_name}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {record.remarks && (
                                  <span className="text-sm text-gray-600 max-w-xs truncate">
                                    {record.remarks}
                                  </span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  record.status === 'present' 
                                    ? 'bg-green-100 text-green-800' 
                                    : record.status === 'absent'
                                    ? 'bg-red-100 text-red-800'
                                    : record.status === 'late'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No attendance records found for the last 30 days</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
