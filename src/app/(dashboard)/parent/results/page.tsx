'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { parentNav } from '@/config/navigation';
import { Trophy, TrendingUp, BookOpen, Award, FileText, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface Child {
  id: string;
  name: string;
  class: string;
  section: string;
  admission_number: string;
}

interface ExamResult {
  id: string;
  exam_name: string;
  subject: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  exam_date: string;
  remarks?: string;
}

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchResults(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get('/parents/my-children/');
      const childrenData = response.data || [];
      setChildren(childrenData.map((c: any) => ({
        id: c.id,
        name: c.full_name,
        class: c.class_name,
        section: c.section,
        admission_number: c.admission_number,
      })));
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0].id);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch children:', err);
      setError(err.response?.data?.error || 'Failed to load children data');
      setLoading(false);
    }
  };

  const fetchResults = async (studentId: string) => {
    try {
      setLoadingResults(true);
      // This endpoint may need to be created in the backend
      const response = await api.get(`/exams/student/${studentId}/results/`);
      setResults(response.data || []);
      setLoadingResults(false);
    } catch (err: any) {
      console.error('Failed to fetch results:', err);
      // If endpoint doesn't exist, show empty state
      setResults([]);
      setLoadingResults(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeUpper = grade.toUpperCase();
    if (gradeUpper === 'A+' || gradeUpper === 'A') return 'success';
    if (gradeUpper === 'B+' || gradeUpper === 'B') return 'info';
    if (gradeUpper === 'C+' || gradeUpper === 'C') return 'warning';
    return 'danger';
  };

  const calculateOverallStats = () => {
    if (results.length === 0) {
      return {
        totalExams: 0,
        averagePercentage: 0,
        highestMarks: 0,
        totalSubjects: 0,
      };
    }

    const totalMarks = results.reduce((sum, r) => sum + r.marks_obtained, 0);
    const totalPossible = results.reduce((sum, r) => sum + r.total_marks, 0);
    const uniqueSubjects = new Set(results.map(r => r.subject)).size;
    const highestPercentage = Math.max(...results.map(r => r.percentage));

    return {
      totalExams: results.length,
      averagePercentage: totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(2) : 0,
      highestMarks: highestPercentage.toFixed(2),
      totalSubjects: uniqueSubjects,
    };
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={parentNav} title="Results">
        <Loading />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout sidebarItems={parentNav} title="Results">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (children.length === 0) {
    return (
      <DashboardLayout sidebarItems={parentNav} title="Results">
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No children found</p>
        </div>
      </DashboardLayout>
    );
  }

  const selectedChildData = children.find((c) => c.id === selectedChild);
  const stats = calculateOverallStats();

  return (
    <DashboardLayout sidebarItems={parentNav} title="Results">
      <div className="space-y-6">
        {/* Child Selector */}
        <div className="flex flex-wrap gap-3">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedChild === child.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>

        {selectedChildData && (
          <>
            {/* Student Info Card */}
            <Card>
              <div className="flex items-center gap-4">
                <Avatar name={selectedChildData.name} size="lg" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedChildData.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedChildData.class} {selectedChildData.section ? `- Section ${selectedChildData.section}` : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    Admission No: {selectedChildData.admission_number}
                  </p>
                </div>
              </div>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <div className="text-center">
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.totalExams}
                  </p>
                  <p className="text-sm text-gray-600">Total Exams</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.averagePercentage}%
                  </p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.highestMarks}%
                  </p>
                  <p className="text-sm text-gray-600">Highest Score</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.totalSubjects}
                  </p>
                  <p className="text-sm text-gray-600">Subjects</p>
                </div>
              </Card>
            </div>

            {/* Results Table */}
            <Card title="Exam Results">
              {loadingResults ? (
                <div className="py-8">
                  <Loading />
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No exam results available yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Results will appear here once exams are conducted and graded
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Exam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {result.exam_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {result.subject}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {result.marks_obtained} / {result.total_marks}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${result.percentage}%` }}
                                />
                              </div>
                              <span className="font-medium text-gray-900">
                                {result.percentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getGradeColor(result.grade)}>
                              {result.grade}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(result.exam_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {result.remarks || '-'}
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
