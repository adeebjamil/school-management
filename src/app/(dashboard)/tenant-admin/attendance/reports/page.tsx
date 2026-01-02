'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { tenantAdminNav } from '@/config/navigation';
import { attendanceService, AttendanceStats } from '@/services/attendanceService';
import { ArrowLeft, Download, Calendar } from 'lucide-react';

export default function AttendanceReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    class_name: '',
    section: '',
    report_type: 'summary',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await attendanceService.getReport({
        start_date: filters.start_date,
        end_date: filters.end_date,
        class_name: filters.class_name || undefined,
        section: filters.section || undefined,
      });
      setReportData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export functionality would go here
    alert('Export functionality coming soon!');
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Attendance Reports"
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

        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="End Date"
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleChange}
                    required
                  />
                  <Select
                    label="Report Type"
                    name="report_type"
                    value={filters.report_type}
                    onChange={handleChange}
                  >
                    <option value="summary">Summary</option>
                    <option value="detailed">Detailed</option>
                    <option value="student_wise">Student Wise</option>
                    <option value="class_wise">Class Wise</option>
                  </Select>
                  <Input
                    label="Class (Optional)"
                    name="class_name"
                    value={filters.class_name}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                  />
                  <Input
                    label="Section (Optional)"
                    name="section"
                    value={filters.section}
                    onChange={handleChange}
                    placeholder="e.g., A"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <Button type="submit" loading={loading}>
                    Generate Report
                  </Button>
                  {reportData && (
                    <Button
                      type="button"
                      variant="outline"
                      icon={<Download className="w-4 h-4" />}
                      onClick={handleExport}
                    >
                      Export PDF
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Report Display */}
          {reportData && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Attendance Report
                  {filters.class_name && ` - Class ${filters.class_name}`}
                  {filters.section && ` Section ${filters.section}`}
                </h3>
                <p className="text-sm text-gray-600">
                  Period: {filters.start_date} to {filters.end_date}
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Late
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.students?.map((student: any) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Roll: {student.roll_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.total_days}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {student.present_days}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {student.absent_days}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                            {student.late_days}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-medium ${
                                student.percentage >= 75
                                  ? 'text-green-600'
                                  : student.percentage >= 60
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {student.percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportData.students?.length || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Avg. Present</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reportData.summary?.avg_present?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Avg. Absent</p>
                    <p className="text-2xl font-bold text-red-600">
                      {reportData.summary?.avg_absent?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Overall %</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reportData.summary?.overall_percentage?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!reportData && !loading && (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Select date range and click Generate Report to view attendance statistics
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
