'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { teacherNav } from '@/config/navigation';
import { ClipboardCheck, Plus, Calendar, Clock, Edit2, Trash2, Users } from 'lucide-react';

interface Exam {
  id: string;
  courseId: string;
  courseName: string;
  className: string;
  examName: string;
  examType: 'midterm' | 'final' | 'quiz' | 'practical';
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  room: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  studentsAppeared?: number;
  totalStudents: number;
}

interface Course {
  id: string;
  name: string;
  class: string;
  section: string;
}

export default function TeacherExamSectionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'scheduled' | 'completed'>('scheduled');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    examName: '',
    examType: 'midterm' as 'midterm' | 'final' | 'quiz' | 'practical',
    date: '',
    startTime: '',
    endTime: '',
    totalMarks: '',
    passingMarks: '',
    room: '',
  });

  useEffect(() => {
    loadExams();
    loadCourses();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await examService.getMyExams();
      
      // Mock data
      const mockExams: Exam[] = [
        {
          id: '1',
          courseId: '1',
          courseName: 'Advanced Mathematics',
          className: 'Grade 10A',
          examName: 'Mid-Term Examination',
          examType: 'midterm',
          date: '2025-02-15',
          startTime: '09:00',
          endTime: '12:00',
          duration: 180,
          totalMarks: 100,
          passingMarks: 40,
          room: 'A-101',
          status: 'scheduled',
          totalStudents: 35,
        },
        {
          id: '2',
          courseId: '2',
          courseName: 'Mathematics',
          className: 'Grade 10B',
          examName: 'Unit Test - Trigonometry',
          examType: 'quiz',
          date: '2025-02-10',
          startTime: '10:00',
          endTime: '11:00',
          duration: 60,
          totalMarks: 25,
          passingMarks: 10,
          room: 'B-205',
          status: 'scheduled',
          totalStudents: 32,
        },
        {
          id: '3',
          courseId: '3',
          courseName: 'Algebra',
          className: 'Grade 9A',
          examName: 'Mid-Term Examination',
          examType: 'midterm',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '11:00',
          duration: 120,
          totalMarks: 75,
          passingMarks: 30,
          room: 'B-201',
          status: 'completed',
          studentsAppeared: 28,
          totalStudents: 30,
        },
      ];

      setExams(mockExams);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await courseService.getMyCourses();
      
      // Mock data
      const mockCourses: Course[] = [
        { id: '1', name: 'Advanced Mathematics', class: 'Grade 10', section: 'A' },
        { id: '2', name: 'Mathematics', class: 'Grade 10', section: 'B' },
        { id: '3', name: 'Algebra', class: 'Grade 9', section: 'A' },
        { id: '4', name: 'Calculus', class: 'Grade 11', section: 'A' },
      ];

      setCourses(mockCourses);
    } catch (err: any) {
      console.error('Failed to load courses:', err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // await examService.createExam(formData);

      // Mock creation
      const course = courses.find(c => c.id === formData.courseId);
      const newExam: Exam = {
        id: Date.now().toString(),
        courseId: formData.courseId,
        courseName: course?.name || '',
        className: `${course?.class} ${course?.section}`,
        examName: formData.examName,
        examType: formData.examType,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: calculateDuration(formData.startTime, formData.endTime),
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
        room: formData.room,
        status: 'scheduled',
        totalStudents: 30, // Mock value
      };

      setExams([newExam, ...exams]);
      setSuccess('Exam created successfully');
      setShowCreateModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const resetForm = () => {
    setFormData({
      courseId: '',
      examName: '',
      examType: 'midterm',
      date: '',
      startTime: '',
      endTime: '',
      totalMarks: '',
      passingMarks: '',
      room: '',
    });
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      // TODO: Replace with actual API call
      // await examService.deleteExam(examId);

      setExams(exams.filter(e => e.id !== examId));
      setSuccess('Exam deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete exam');
    }
  };

  const scheduledExams = exams.filter(e => e.status === 'scheduled');
  const completedExams = exams.filter(e => e.status === 'completed');

  return (
    <DashboardLayout
      sidebarItems={teacherNav}
      tenantName="Sunshine High School"
      title="Exam Section"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Exam Section</h2>
            <p className="text-gray-600 mt-1">Create and manage exams</p>
          </div>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Exam
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                <button
                  onClick={() => setActiveTab('scheduled')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'scheduled'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Scheduled ({scheduledExams.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'completed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Completed ({completedExams.length})
                </button>
              </nav>
            </div>

            {/* Scheduled Exams */}
            {activeTab === 'scheduled' && (
              <div>
                {scheduledExams.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No scheduled exams</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduledExams.map((exam) => (
                      <Card key={exam.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{exam.examName}</h4>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {exam.examType.charAt(0).toUpperCase() + exam.examType.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{exam.courseName}</p>
                              <p className="text-xs text-gray-500 mt-1">{exam.className}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                title="Edit Exam"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExam(exam.id)}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                title="Delete Exam"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(exam.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{exam.startTime} - {exam.endTime} ({exam.duration} minutes)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>Room: {exam.room} • {exam.totalStudents} Students</span>
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Marks:</span>
                                <span className="font-medium text-gray-900">{exam.totalMarks}</span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-600">Passing Marks:</span>
                                <span className="font-medium text-gray-900">{exam.passingMarks}</span>
                              </div>
                            </div>
                            <div className="pt-2">
                              <Button size="sm" className="w-full">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Exams */}
            {activeTab === 'completed' && (
              <div>
                {completedExams.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No completed exams</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedExams.map((exam) => (
                      <Card key={exam.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{exam.examName}</h4>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Completed
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{exam.courseName}</p>
                              <p className="text-xs text-gray-500 mt-1">{exam.className}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(exam.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>
                                {exam.studentsAppeared}/{exam.totalStudents} Students Appeared
                              </span>
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                              <div className="flex gap-2">
                                <Button size="sm" className="flex-1">
                                  Submit Grades
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1">
                                  View Report
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Create Exam Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Create New Exam</h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Course *
                    </label>
                    <select
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name} - {course.class} {course.section}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Exam Name *"
                    name="examName"
                    value={formData.examName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Mid-Term Examination"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Type *
                    </label>
                    <select
                      name="examType"
                      value={formData.examType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="midterm">Mid-Term</option>
                      <option value="final">Final</option>
                      <option value="quiz">Quiz</option>
                      <option value="practical">Practical</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Date *"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Room *"
                      name="room"
                      value={formData.room}
                      onChange={handleChange}
                      required
                      placeholder="e.g., A-101"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Time *"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="End Time *"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Total Marks *"
                      name="totalMarks"
                      type="number"
                      min="1"
                      value={formData.totalMarks}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Passing Marks *"
                      name="passingMarks"
                      type="number"
                      min="1"
                      value={formData.passingMarks}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" loading={submitting} className="flex-1">
                      Create Exam
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
