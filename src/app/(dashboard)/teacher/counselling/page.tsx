'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { teacherNav } from '@/config/navigation';
import api from '@/lib/api';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  Search, 
  Phone, 
  Mail, 
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  X,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  email: string;
  phone: string;
  status: 'good' | 'needs-attention' | 'critical';
}

interface CounsellingSession {
  id: string;
  studentId: string;
  date: string;
  duration: number;
  type: 'academic' | 'behavioral' | 'personal' | 'career' | 'parent-meeting';
  issue: string;
  notes: string;
  actionTaken: string;
  followUpRequired: boolean;
  followUpDate?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function TeacherCounsellingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<CounsellingSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'good' | 'needs-attention' | 'critical'>('all');
  
  const [sessionForm, setSessionForm] = useState({
    type: 'academic' as const,
    issue: '',
    notes: '',
    actionTaken: '',
    followUpRequired: false,
    followUpDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get teacher profile to find assigned class
      const teacherResponse = await api.get('/teachers/profile/');
      const teacherId = teacherResponse.data.id;
      
      // Get classes assigned to this teacher
      const classesResponse = await api.get(`/classes/?class_teacher=${teacherId}`);
      const teacherClasses = classesResponse.data.results || [];
      
      if (teacherClasses.length === 0) {
        setError('No class assigned to you as class teacher');
        setStudents([]);
        setSessions([]);
        setLoading(false);
        return;
      }
      
      // Get the first class (assuming teacher is class teacher of one class)
      const assignedClass = teacherClasses[0];
      
      // Get all students and filter by this class
      const studentsResponse = await api.get('/students/');
      const allStudents = studentsResponse.data;
      
      // Filter students by school_class and format them
      const classStudents = allStudents
        .filter((student: any) => student.school_class === assignedClass.id)
        .map((student: any) => ({
          id: student.id,
          admissionNumber: student.admission_number || '',
          firstName: student.user?.first_name || '',
          lastName: student.user?.last_name || '',
          rollNumber: student.roll_number || '',
          email: student.user?.email || '',
          phone: student.user?.phone || '',
          status: 'good' as const, // Default status, can be enhanced later
        }));
      
      setStudents(classStudents);
      // Sessions will be empty for now (can be enhanced with backend API later)
      setSessions([]);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = async () => {
    if (!selectedStudent) return;

    try {
      setError('');
      setSuccess('');

      // Validate form
      if (!sessionForm.issue || !sessionForm.notes || !sessionForm.actionTaken) {
        setError('Please fill in all required fields');
        return;
      }

      if (sessionForm.followUpRequired && !sessionForm.followUpDate) {
        setError('Please select a follow-up date');
        return;
      }

      // TODO: Replace with actual API call
      // await counsellingService.addSession({
      //   studentId: selectedStudent.id,
      //   ...sessionForm,
      //   date: new Date().toISOString().split('T')[0],
      //   duration: 30,
      //   status: 'completed',
      // });

      const newSession: CounsellingSession = {
        id: Date.now().toString(),
        studentId: selectedStudent.id,
        date: new Date().toISOString().split('T')[0],
        duration: 30,
        ...sessionForm,
        status: 'completed',
      };

      setSessions([newSession, ...sessions]);
      setSuccess('Counselling session added successfully!');
      setShowAddSession(false);
      setSessionForm({
        type: 'academic',
        issue: '',
        notes: '',
        actionTaken: '',
        followUpRequired: false,
        followUpDate: '',
      });

      // Update student's last counselling date
      setStudents(students.map(s => 
        s.id === selectedStudent.id 
          ? { ...s, lastCounselling: new Date().toISOString().split('T')[0] }
          : s
      ));

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add session');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'needs-attention':
        return <Clock className="w-4 h-4" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'behavioral':
        return 'bg-orange-100 text-orange-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      case 'career':
        return 'bg-green-100 text-green-800';
      case 'parent-meeting':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.includes(searchQuery);
    
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStudentSessions = (studentId: string) => {
    return sessions.filter(s => s.studentId === studentId);
  };

  const stats = {
    totalStudents: students.length,
    needsAttention: students.filter(s => s.status === 'needs-attention').length,
    critical: students.filter(s => s.status === 'critical').length,
    totalSessions: sessions.length,
  };

  return (
    <DashboardLayout
      sidebarItems={teacherNav}
      tenantName="Sunshine High School"
      title="Counselling"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Counselling</h2>
          <p className="text-gray-600 mt-1">Manage counselling for your assigned students</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Students</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
                    </div>
                    <Users className="w-12 h-12 text-blue-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Needs Attention</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.needsAttention}</p>
                    </div>
                    <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Critical Cases</p>
                      <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
                    </div>
                    <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Sessions</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.totalSessions}</p>
                    </div>
                    <MessageCircle className="w-12 h-12 text-purple-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search by name, student ID, or roll number..."
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setFilterStatus('all')}
                      variant={filterStatus === 'all' ? 'primary' : 'outline'}
                    >
                      All
                    </Button>
                    <Button
                      onClick={() => setFilterStatus('good')}
                      variant={filterStatus === 'good' ? 'primary' : 'outline'}
                    >
                      Good
                    </Button>
                    <Button
                      onClick={() => setFilterStatus('needs-attention')}
                      variant={filterStatus === 'needs-attention' ? 'primary' : 'outline'}
                    >
                      Needs Attention
                    </Button>
                    <Button
                      onClick={() => setFilterStatus('critical')}
                      variant={filterStatus === 'critical' ? 'primary' : 'outline'}
                    >
                      Critical
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Students</h3>
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className="cursor-pointer"
                    >
                      <Card 
                        className={`transition-all ${
                          selectedStudent?.id === student.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {student.firstName[0]}{student.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {student.firstName} {student.lastName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {student.admissionNumber} • Roll No: {student.rollNumber}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(student.status)}`}>
                                {getStatusIcon(student.status)}
                                {student.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Details and Sessions */}
              <div>
                {selectedStudent ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Student Details</h3>
                        <Button
                          onClick={() => setShowAddSession(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Session
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">Full Name</p>
                            <p className="font-medium text-gray-900">
                              {selectedStudent.firstName} {selectedStudent.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Admission Number</p>
                            <p className="font-medium text-gray-900">
                              {selectedStudent.admissionNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Roll Number</p>
                            <p className="font-medium text-gray-900">
                              {selectedStudent.rollNumber}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{selectedStudent.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{selectedStudent.phone}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Counselling History</h3>
                      <div className="space-y-3">
                        {getStudentSessions(selectedStudent.id).length > 0 ? (
                          getStudentSessions(selectedStudent.id).map((session) => (
                            <Card key={session.id}>
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(session.type)}`}>
                                    {session.type}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(session.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">{session.issue}</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <p className="text-gray-600 font-medium">Notes:</p>
                                    <p className="text-gray-700">{session.notes}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 font-medium">Action Taken:</p>
                                    <p className="text-gray-700">{session.actionTaken}</p>
                                  </div>
                                  {session.followUpRequired && (
                                    <div className="flex items-center gap-2 text-blue-600 mt-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>Follow-up: {session.followUpDate && new Date(session.followUpDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <Card>
                            <CardContent className="pt-6 text-center text-gray-500">
                              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p>No counselling sessions recorded yet</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-12 pb-12 text-center text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Select a student to view details and counselling history</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Add Session Modal */}
            {showAddSession && selectedStudent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Add Counselling Session
                    </h3>
                    <button
                      onClick={() => setShowAddSession(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Student</p>
                        <p className="font-medium text-gray-900">
                          {selectedStudent.firstName} {selectedStudent.lastName} ({selectedStudent.admissionNumber})
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Type *
                        </label>
                        <select
                          value={sessionForm.type}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSessionForm({ ...sessionForm, type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="academic">Academic</option>
                          <option value="behavioral">Behavioral</option>
                          <option value="personal">Personal</option>
                          <option value="career">Career</option>
                          <option value="parent-meeting">Parent Meeting</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issue / Concern *
                        </label>
                        <Input
                          value={sessionForm.issue}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionForm({ ...sessionForm, issue: e.target.value })}
                          placeholder="Brief description of the issue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Notes *
                        </label>
                        <textarea
                          value={sessionForm.notes}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                          placeholder="Detailed notes from the counselling session"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Action Taken *
                        </label>
                        <textarea
                          value={sessionForm.actionTaken}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSessionForm({ ...sessionForm, actionTaken: e.target.value })}
                          placeholder="Steps taken or recommendations given"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="followUp"
                          checked={sessionForm.followUpRequired}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionForm({ ...sessionForm, followUpRequired: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="followUp" className="text-sm font-medium text-gray-700">
                          Follow-up required
                        </label>
                      </div>

                      {sessionForm.followUpRequired && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Follow-up Date *
                          </label>
                          <Input
                            type="date"
                            value={sessionForm.followUpDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionForm({ ...sessionForm, followUpDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={() => setShowAddSession(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddSession}
                          className="flex-1"
                        >
                          Add Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
