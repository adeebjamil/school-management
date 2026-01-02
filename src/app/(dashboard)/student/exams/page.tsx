'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { studentNav } from '@/config/navigation';
import { ClipboardCheck, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface Exam {
  id: string;
  subject: string;
  examName: string;
  examType: 'midterm' | 'final' | 'quiz' | 'practical';
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  room: string;
  status: 'upcoming' | 'completed' | 'ongoing';
  syllabus?: string[];
}

export default function StudentExamsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [completedExams, setCompletedExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await examService.getMyExams();
      
      // Mock data
      const mockUpcoming: Exam[] = [
        {
          id: '1',
          subject: 'Mathematics',
          examName: 'Mid-Term Examination',
          examType: 'midterm',
          date: '2025-02-15',
          startTime: '09:00',
          endTime: '12:00',
          duration: 180,
          totalMarks: 100,
          passingMarks: 40,
          room: 'Room A-101',
          status: 'upcoming',
          syllabus: ['Calculus', 'Algebra', 'Geometry', 'Trigonometry'],
        },
        {
          id: '2',
          subject: 'Physics',
          examName: 'Practical Examination',
          examType: 'practical',
          date: '2025-02-18',
          startTime: '11:00',
          endTime: '13:00',
          duration: 120,
          totalMarks: 50,
          passingMarks: 20,
          room: 'Lab B-205',
          status: 'upcoming',
          syllabus: ['Mechanics Experiments', 'Wave Motion', 'Optics Lab'],
        },
        {
          id: '3',
          subject: 'Chemistry',
          examName: 'Quiz - Organic Chemistry',
          examType: 'quiz',
          date: '2025-02-20',
          startTime: '14:00',
          endTime: '15:00',
          duration: 60,
          totalMarks: 25,
          passingMarks: 10,
          room: 'Room C-302',
          status: 'upcoming',
        },
      ];

      const mockCompleted: Exam[] = [
        {
          id: '4',
          subject: 'English',
          examName: 'Unit Test 1',
          examType: 'quiz',
          date: '2025-01-10',
          startTime: '10:00',
          endTime: '11:00',
          duration: 60,
          totalMarks: 25,
          passingMarks: 10,
          room: 'Room D-401',
          status: 'completed',
        },
        {
          id: '5',
          subject: 'History',
          examName: 'Mid-Term Examination',
          examType: 'midterm',
          date: '2025-01-05',
          startTime: '09:00',
          endTime: '11:00',
          duration: 120,
          totalMarks: 75,
          passingMarks: 30,
          room: 'Room E-501',
          status: 'completed',
        },
      ];

      setUpcomingExams(mockUpcoming);
      setCompletedExams(mockCompleted);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const getExamTypeBadge = (type: string) => {
    const styles = {
      midterm: 'bg-blue-100 text-blue-800',
      final: 'bg-purple-100 text-purple-800',
      quiz: 'bg-green-100 text-green-800',
      practical: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[type as keyof typeof styles]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getDaysUntilExam = (examDate: string) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Completed';
    return `In ${diffDays} days`;
  };

  const renderExamCard = (exam: Exam) => (
    <Card key={exam.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900">{exam.subject}</h4>
              {getExamTypeBadge(exam.examType)}
            </div>
            <p className="text-sm text-gray-600">{exam.examName}</p>
          </div>
          {exam.status === 'upcoming' && (
            <div className="text-right">
              <p className="text-sm font-medium text-blue-600">
                {getDaysUntilExam(exam.date)}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(exam.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {exam.startTime} - {exam.endTime} ({exam.duration} minutes)
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>Room: {exam.room}</span>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Marks:</span>
              <span className="font-medium text-gray-900">{exam.totalMarks}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Passing Marks:</span>
              <span className="font-medium text-gray-900">{exam.passingMarks}</span>
            </div>
          </div>
          {exam.syllabus && exam.syllabus.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Syllabus:</p>
              <div className="flex flex-wrap gap-2">
                {exam.syllabus.map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout
      sidebarItems={studentNav}
      tenantName="Sunshine High School"
      title="Exam Section"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Section</h2>
          <p className="text-gray-600 mt-1">View your upcoming and completed exams</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'upcoming'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upcoming Exams ({upcomingExams.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'completed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Completed Exams ({completedExams.length})
                </button>
              </nav>
            </div>

            {/* Upcoming Exams */}
            {activeTab === 'upcoming' && (
              <div>
                {upcomingExams.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No upcoming exams scheduled</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Alert type="info" className="mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Important Reminders</p>
                          <ul className="text-sm mt-1 space-y-1 list-disc list-inside">
                            <li>Arrive 15 minutes before the exam start time</li>
                            <li>Bring your admit card and student ID</li>
                            <li>Electronic devices are not allowed in the exam hall</li>
                          </ul>
                        </div>
                      </div>
                    </Alert>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcomingExams.map((exam) => renderExamCard(exam))}
                    </div>
                  </>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedExams.map((exam) => renderExamCard(exam))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
