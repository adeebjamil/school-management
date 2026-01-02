'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { tenantAdminNav } from '@/config/navigation';
import examService, { Exam } from '@/services/examService';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Edit, Trash2, Calendar, FileText, Users } from 'lucide-react';

export default function ExamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (examId) {
      loadExam();
    }
  }, [examId]);

  const loadExam = async () => {
    try {
      setLoading(true);
      const data = await examService.getById(examId);
      setExam(data);
    } catch (err: any) {
      console.error('Failed to load exam:', err);
      setError(err.response?.data?.error || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this exam? This will delete all associated results.')) {
      return;
    }

    try {
      await examService.delete(examId);
      alert('Exam deleted successfully');
      router.push('/tenant-admin/exams');
    } catch (err: any) {
      console.error('Failed to delete exam:', err);
      alert('Failed to delete exam');
    }
  };

  const getExamTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      midterm: 'bg-blue-500',
      final: 'bg-purple-500',
      unit_test: 'bg-green-500',
      quarterly: 'bg-yellow-500',
      annual: 'bg-red-500',
    };
    return (
      <Badge className={`${colors[type] || 'bg-gray-500'} text-white`}>
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  const isOngoing = (startDate: string, endDate: string) => {
    const now = new Date();
    return new Date(startDate) <= now && now <= new Date(endDate);
  };

  const getStatusBadge = (exam: Exam) => {
    if (isUpcoming(exam.start_date)) {
      return <Badge variant="info">Upcoming</Badge>;
    } else if (isOngoing(exam.start_date, exam.end_date)) {
      return <Badge variant="success">Ongoing</Badge>;
    } else {
      return <Badge variant="default">Completed</Badge>;
    }
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Exam Details"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {exam && (
            <div className="flex gap-2">
              <Button onClick={() => router.push(`/tenant-admin/exams/${examId}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <Loading />
        ) : exam ? (
          <>
            {/* Exam Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{exam.name}</h2>
                  <div className="flex gap-2">
                    {getExamTypeBadge(exam.exam_type)}
                    {getStatusBadge(exam)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Class/Section</h3>
                    <p className="text-lg">{exam.class_name} - {exam.section}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Academic Year</h3>
                    <p className="text-lg">{exam.created_at ? new Date(exam.created_at).getFullYear() : 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Start Date</h3>
                    <p className="text-lg flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(exam.start_date)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">End Date</h3>
                    <p className="text-lg flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(exam.end_date)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subjects */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Subjects ({exam.subjects?.length || 0})</h3>
              </CardHeader>
              <CardContent>
                {exam.subjects && exam.subjects.length > 0 ? (
                  <div className="space-y-4">
                    {exam.subjects.map((subject, index) => (
                      <Card key={subject.id || index} className="border border-gray-200">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-semibold">{subject.subject_name}</h4>
                              <p className="text-sm text-gray-600">Code: {subject.subject_code}</p>
                            </div>
                            <Badge>{subject.max_marks} marks</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Exam Date:</span>
                              <p className="font-medium">{formatDate(subject.exam_date)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Max Marks:</span>
                              <p className="font-medium">{subject.max_marks}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Passing Marks:</span>
                              <p className="font-medium">{subject.passing_marks}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <p className="font-medium">{subject.duration_minutes} min</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No subjects added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="cursor-pointer" onClick={() => router.push(`/tenant-admin/exams/mark-entry?exam=${examId}`)}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                      <Edit className="w-5 h-5 mr-2 text-blue-600" />
                      Mark Entry
                    </h3>
                    <p className="text-sm text-gray-600">Enter marks for this exam</p>
                  </CardContent>
                </Card>
              </div>
              <div className="cursor-pointer" onClick={() => router.push(`/tenant-admin/exams/results?exam=${examId}`)}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                      <FileText className="w-5 h-5 mr-2 text-green-600" />
                      View Results
                    </h3>
                    <p className="text-sm text-gray-600">Check exam results</p>
                  </CardContent>
                </Card>
              </div>
              <div className="cursor-pointer" onClick={() => router.push(`/tenant-admin/exams/${examId}/admit-cards`)}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                      <Users className="w-5 h-5 mr-2 text-purple-600" />
                      Admit Cards
                    </h3>
                    <p className="text-sm text-gray-600">Generate admit cards</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              <p>Exam not found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
