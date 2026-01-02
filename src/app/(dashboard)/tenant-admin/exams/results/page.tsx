'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import examService, { Exam, ExamResult } from '@/services/examService';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { FileText, Download, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { tenantAdminNav } from '@/config/navigation';

export default function ExamResultsPage() {
  const searchParams = useSearchParams();
  const examIdFromUrl = searchParams.get('exam');
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (examIdFromUrl && exams.length > 0) {
      setSelectedExam(examIdFromUrl);
      loadResults(examIdFromUrl);
    }
  }, [examIdFromUrl, exams]);

  const loadResults = async (examId: string) => {
    try {
      setLoading(true);
      const data = await examService.getExamResults(examId);
      setResults(data);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExams = async () => {
    try {
      const data = await examService.getAll();
      setExams(data);
    } catch (error) {
      console.error('Failed to load exams:', error);
    }
  };

  const handleExamChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedExam(e.target.value);
    if (!e.target.value) {
      setResults([]);
      return;
    }
    loadResults(e.target.value);
  };

  const getGradeBadge = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-green-600',
      'A': 'bg-green-500',
      'B+': 'bg-blue-500',
      'B': 'bg-blue-400',
      'C': 'bg-yellow-500',
      'D': 'bg-orange-500',
      'F': 'bg-red-500',
    };
    return <Badge className={`${colors[grade] || 'bg-gray-500'} text-white`}>{grade}</Badge>;
  };

  const filteredResults = results.filter(r =>
    r.student_name.toLowerCase().includes(search.toLowerCase()) ||
    r.student_roll_number.includes(search)
  );

  const stats = {
    total: results.length,
    passed: results.filter(r => r.result_status === 'pass').length,
    failed: results.filter(r => r.result_status === 'fail').length,
    average: results.length > 0 ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2) : '0',
    passPercentage: results.length > 0 ? ((results.filter(r => r.result_status === 'pass').length / results.length) * 100).toFixed(1) : '0',
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="School Management"
      title="Exam Results"
    >
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Exam</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exam">Exam</Label>
              <Select id="exam" value={selectedExam} onChange={handleExamChange}>
                <option value="">Select exam</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} - {exam.class_name} {exam.section}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search Student</Label>
              <Input
                id="search"
                placeholder="Search by name or roll number"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Students</p>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Passed</p>
                <div className="text-2xl font-bold text-green-600 flex items-center">
                  {stats.passed}
                  <TrendingUp className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Failed</p>
                <div className="text-2xl font-bold text-red-600 flex items-center">
                  {stats.failed}
                  <TrendingDown className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Average %</p>
                <div className="text-2xl font-bold text-blue-600">{stats.average}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Pass Rate</p>
                <div className="text-2xl font-bold text-purple-600">{stats.passPercentage}%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Student Results</h3>
                <Button variant="primary">
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading results...</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-gray-600">No results found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table
                    columns={[
                      { key: 'roll_number', label: 'Roll No' },
                      { key: 'student_name', label: 'Student Name' },
                      { key: 'marks', label: 'Marks' },
                      { key: 'percentage', label: 'Percentage' },
                      { key: 'grade', label: 'Grade' },
                      { key: 'status', label: 'Status' },
                      { key: 'actions', label: 'Actions' },
                    ]}
                    data={filteredResults.map(result => ({
                      roll_number: result.student_roll_number,
                      student_name: result.student_name,
                      marks: `${result.total_marks_obtained} / ${result.total_max_marks}`,
                      percentage: (
                        <span className={result.percentage >= 75 ? 'text-green-600 font-medium' : result.percentage >= 60 ? 'text-yellow-600 font-medium' : 'text-red-600 font-medium'}>
                          {result.percentage.toFixed(2)}%
                        </span>
                      ),
                      grade: getGradeBadge(result.grade),
                      status: result.result_status === 'pass' ? (
                        <Badge variant="success">Pass</Badge>
                      ) : (
                        <Badge variant="danger">Fail</Badge>
                      ),
                      actions: (
                        <Button variant="primary" className="p-1 text-xs" title="View Report Card">
                          <Eye className="w-4 h-4" />
                        </Button>
                      ),
                    }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedExam && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Select an exam to view results</p>
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  );
}
