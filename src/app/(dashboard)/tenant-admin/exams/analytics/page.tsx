'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import examService, { Exam, ExamResult } from '@/services/examService';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Target,
  BarChart3,
  PieChart,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { tenantAdminNav } from '@/config/navigation';

interface ExamAnalytics {
  exam_id: string;
  exam_name: string;
  total_students: number;
  appeared: number;
  passed: number;
  failed: number;
  absent: number;
  average_percentage: number;
  highest_percentage: number;
  lowest_percentage: number;
  pass_rate: number;
  grade_distribution: {
    [key: string]: number;
  };
  subject_wise_performance: {
    subject_name: string;
    average_marks: number;
    max_marks: number;
    pass_percentage: number;
  }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await examService.getAll();
      // Filter only completed exams
      const completedExams = data.filter((e: Exam) => new Date(e.end_date) < new Date());
      setExams(completedExams);
    } catch (error) {
      console.error('Failed to load exams:', error);
    }
  };

  const handleExamChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedExam(e.target.value);
    if (!e.target.value) {
      setAnalytics(null);
      return;
    }

    try {
      setLoading(true);
      // Simulated analytics data - should come from backend API
      const mockAnalytics: ExamAnalytics = {
        exam_id: e.target.value,
        exam_name: exams.find(ex => ex.id === e.target.value)?.name || '',
        total_students: 45,
        appeared: 43,
        passed: 38,
        failed: 5,
        absent: 2,
        average_percentage: 76.5,
        highest_percentage: 98.2,
        lowest_percentage: 42.5,
        pass_rate: 88.4,
        grade_distribution: {
          'A+': 8,
          'A': 12,
          'B+': 10,
          'B': 8,
          'C': 3,
          'D': 2,
          'F': 2,
        },
        subject_wise_performance: [
          { subject_name: 'Mathematics', average_marks: 72.5, max_marks: 100, pass_percentage: 85.0 },
          { subject_name: 'Science', average_marks: 78.2, max_marks: 100, pass_percentage: 90.5 },
          { subject_name: 'English', average_marks: 80.1, max_marks: 100, pass_percentage: 92.3 },
          { subject_name: 'Social Studies', average_marks: 75.8, max_marks: 100, pass_percentage: 87.2 },
          { subject_name: 'Hindi', average_marks: 82.3, max_marks: 100, pass_percentage: 95.1 },
        ],
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-green-600',
      'A': 'bg-green-500',
      'B+': 'bg-blue-500',
      'B': 'bg-blue-400',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'F': 'bg-red-500',
    };
    return colors[grade] || 'bg-gray-500';
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="School Management"
      title="Exam Analytics"
    >
      <div className="space-y-6">
        <div className="flex justify-end items-center">
          <Button variant="secondary" onClick={() => router.push('/tenant-admin/exams')}>
            Back to Exams
          </Button>
        </div>

        {/* Exam Selection */}
        <Card>
          <CardContent className="p-6">
            <div className="max-w-md">
              <Label htmlFor="exam">Select Exam</Label>
              <Select id="exam" value={selectedExam} onChange={handleExamChange}>
                <option value="">Select an exam to view analytics</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} - {exam.class_name} {exam.section}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600">Loading analytics...</p>
            </CardContent>
          </Card>
        )}

        {!loading && analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                      <div className="text-2xl font-bold">{analytics.total_students}</div>
                      <p className="text-xs text-gray-500 mt-1">Appeared: {analytics.appeared}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Pass Rate</p>
                      <div className="text-2xl font-bold text-green-600">{analytics.pass_rate}%</div>
                      <p className="text-xs text-gray-500 mt-1">{analytics.passed} passed</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Average %</p>
                      <div className="text-2xl font-bold text-blue-600">{analytics.average_percentage}%</div>
                      <p className="text-xs text-gray-500 mt-1">Class average</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Highest Score</p>
                      <div className="text-2xl font-bold text-purple-600">{analytics.highest_percentage}%</div>
                      <p className="text-xs text-gray-500 mt-1">Top performer</p>
                    </div>
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pass/Fail Distribution */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Result Distribution
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                        <span className="text-sm">Passed</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{analytics.passed}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({((analytics.passed / analytics.appeared) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                        <span className="text-sm">Failed</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{analytics.failed}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({((analytics.failed / analytics.appeared) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                        <span className="text-sm">Absent</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{analytics.absent}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({((analytics.absent / analytics.total_students) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grade Distribution */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Grade Distribution
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.grade_distribution).map(([grade, count]) => (
                      <div key={grade} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className={`${getGradeColor(grade)} text-white mr-2 min-w-[40px] justify-center`}>
                            {grade}
                          </Badge>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className={`${getGradeColor(grade)} h-2 rounded-full`}
                              style={{
                                width: `${(count / analytics.appeared) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right min-w-[60px]">
                          <span className="font-semibold">{count}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({((count / analytics.appeared) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject-wise Performance */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Subject-wise Performance
                </h3>
                <div className="space-y-4">
                  {analytics.subject_wise_performance.map((subject) => (
                    <div key={subject.subject_name} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{subject.subject_name}</h4>
                          <p className="text-sm text-gray-600">
                            Average: {subject.average_marks.toFixed(1)} / {subject.max_marks}
                          </p>
                        </div>
                        <Badge
                          variant={subject.pass_percentage >= 80 ? 'success' : subject.pass_percentage >= 60 ? 'warning' : 'danger'}
                        >
                          {subject.pass_percentage.toFixed(1)}% Pass Rate
                        </Badge>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            subject.average_marks / subject.max_marks >= 0.75
                              ? 'bg-green-500'
                              : subject.average_marks / subject.max_marks >= 0.6
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${(subject.average_marks / subject.max_marks) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Best Performing Subject</p>
                    <p className="text-lg font-bold text-blue-700">
                      {analytics.subject_wise_performance.reduce((prev, current) =>
                        prev.average_marks > current.average_marks ? prev : current
                      ).subject_name}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-900 mb-1">Needs Attention</p>
                    <p className="text-lg font-bold text-orange-700">
                      {analytics.subject_wise_performance.reduce((prev, current) =>
                        prev.average_marks < current.average_marks ? prev : current
                      ).subject_name}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-1">Performance Trend</p>
                    <p className="text-lg font-bold text-green-700">
                      {analytics.pass_rate >= 75 ? 'Excellent' : analytics.pass_rate >= 60 ? 'Good' : 'Needs Improvement'}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 mb-1">Class Rank Range</p>
                    <p className="text-lg font-bold text-purple-700">
                      {analytics.lowest_percentage.toFixed(1)}% - {analytics.highest_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!loading && !analytics && !selectedExam && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Select an exam to view detailed analytics</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
