'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { tenantAdminNav } from '@/config/navigation';
import examService, { Exam } from '@/services/examService';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Plus, Calendar, FileText, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    class_name: '',
    section: '',
    exam_type: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadExams();
  }, [filters]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await examService.getAll(filters);
      setExams(data);
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam? This will delete all associated results.')) {
      return;
    }

    try {
      await examService.delete(id);
      loadExams();
    } catch (error) {
      console.error('Failed to delete exam:', error);
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
      month: 'short',
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
      title="Exam Management"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-end items-center">
          <Link href="/tenant-admin/exams/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </Link>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Exams</p>
            <div className="text-2xl font-bold">{exams.length}</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Upcoming</p>
            <div className="text-2xl font-bold text-blue-600">
              {exams.filter(e => isUpcoming(e.start_date)).length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Ongoing</p>
            <div className="text-2xl font-bold text-green-600">
              {exams.filter(e => isOngoing(e.start_date, e.end_date)).length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
            <div className="text-2xl font-bold text-gray-600">
              {exams.filter(e => !isUpcoming(e.start_date) && !isOngoing(e.start_date, e.end_date)).length}
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="class_name">Class</Label>
              <Input
                id="class_name"
                placeholder="e.g., 10"
                value={filters.class_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, class_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                placeholder="e.g., A"
                value={filters.section}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, section: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="exam_type">Exam Type</Label>
              <Select
                id="exam_type"
                value={filters.exam_type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, exam_type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="unit_test">Unit Test</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, end_date: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/tenant-admin/exams/mark-entry">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="flex items-center text-lg font-semibold mb-2">
                <Edit className="w-5 h-5 mr-2 text-blue-600" />
                Mark Entry
              </h3>
              <p className="text-sm text-gray-600">Enter marks for students</p>
            </div>
          </Card>
        </Link>
        <Link href="/tenant-admin/exams/results">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="flex items-center text-lg font-semibold mb-2">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                View Results
              </h3>
              <p className="text-sm text-gray-600">Check exam results and report cards</p>
            </div>
          </Card>
        </Link>
        <Link href="/tenant-admin/exams/analytics">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="flex items-center text-lg font-semibold mb-2">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Analytics
              </h3>
              <p className="text-sm text-gray-600">View exam statistics and trends</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Exams Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">All Exams</h3>
          <p className="text-sm text-gray-600 mb-4">
            {loading ? 'Loading...' : `${exams.length} exam(s) found`}
          </p>
          {exams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No exams found</p>
              <p className="text-sm">Create your first exam to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                columns={[
                  { key: 'name', label: 'Exam Name' },
                  { key: 'exam_type', label: 'Type' },
                  { key: 'class', label: 'Class/Section' },
                  { key: 'start_date', label: 'Start Date' },
                  { key: 'end_date', label: 'End Date' },
                  { key: 'subjects', label: 'Subjects' },
                  { key: 'status', label: 'Status' },
                  { key: 'actions', label: 'Actions' },
                ]}
                data={exams.map((exam) => ({
                  name: <span className="font-medium">{exam.name}</span>,
                  exam_type: getExamTypeBadge(exam.exam_type),
                  class: `${exam.class_name} - ${exam.section}`,
                  start_date: formatDate(exam.start_date),
                  end_date: formatDate(exam.end_date),
                  subjects: <Badge>{exam.subjects?.length || 0} subjects</Badge>,
                  status: getStatusBadge(exam),
                  actions: (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => router.push(`/tenant-admin/exams/${exam.id}`)}
                        title="View Details"
                        className="p-1 text-xs"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => router.push(`/tenant-admin/exams/${exam.id}/edit`)}
                        title="Edit Exam"
                        className="p-1 text-xs"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(exam.id)}
                        title="Delete Exam"
                        className="p-1 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ),
                }))}
              />
            </div>
          )}
        </div>
      </Card>
      </div>
    </DashboardLayout>
  );
}
