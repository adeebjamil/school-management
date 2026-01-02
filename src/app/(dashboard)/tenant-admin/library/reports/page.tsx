'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { ArrowLeft, BookOpen, AlertCircle, TrendingUp, DollarSign, Users, Download, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

interface LibraryStats {
  total_books: number;
  total_copies: number;
  available_copies: number;
  issued_count: number;
  overdue_count: number;
}

interface OverdueIssue {
  id: string;
  book: {
    title: string;
    author: string;
    isbn: string;
  };
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  issue_date: string;
  due_date: string;
  days_overdue: number;
  calculated_fine: number;
}

interface BookIssue {
  id: string;
  book_details: {
    title: string;
    author: string;
    isbn: string;
  };
  user_details: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  fine_amount: number;
  days_overdue: number;
  calculated_fine: number;
}

export default function LibraryReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState<LibraryStats>({
    total_books: 0,
    total_copies: 0,
    available_copies: 0,
    issued_count: 0,
    overdue_count: 0,
  });
  
  const [overdueIssues, setOverdueIssues] = useState<OverdueIssue[]>([]);
  const [allIssues, setAllIssues] = useState<BookIssue[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'overdue' | 'history'>('overview');
  
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<OverdueIssue | BookIssue | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState('');
  const [returnData, setReturnData] = useState({
    condition: 'good',
    remarks: ''
  });

  useEffect(() => {
    loadReports();
  }, []);

  const handleReturnBook = async () => {
    if (!selectedIssue) return;
    
    try {
      setReturnLoading(true);
      setReturnError('');
      
      await api.post('/library/issues/return_book/', {
        issue_id: selectedIssue.id,
        ...returnData
      });
      
      // Reload reports
      await loadReports();
      
      // Close modal and reset
      setShowReturnModal(false);
      setSelectedIssue(null);
      setReturnData({ condition: 'good', remarks: '' });
      setReturnLoading(false);
      
    } catch (err: any) {
      console.error('Failed to return book:', err);
      setReturnError(err.response?.data?.error || 'Failed to return book');
      setReturnLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load statistics
      const statsResponse = await api.get('/library/books/stats/');
      setStats(statsResponse.data);
      
      // Load overdue books
      const overdueResponse = await api.get('/library/issues/overdue/');
      const overdueData = Array.isArray(overdueResponse.data) 
        ? overdueResponse.data 
        : (Array.isArray(overdueResponse.data.results) ? overdueResponse.data.results : []);
      setOverdueIssues(overdueData);
      
      // Load all issues
      const issuesResponse = await api.get('/library/issues/');
      const issuesData = Array.isArray(issuesResponse.data) 
        ? issuesResponse.data 
        : (Array.isArray(issuesResponse.data.results) ? issuesResponse.data.results : []);
      setAllIssues(issuesData);
      
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError('Failed to load library reports');
      setLoading(false);
    }
  };

  const totalFines = overdueIssues.reduce((sum, issue) => sum + issue.calculated_fine, 0);
  const collectedFines = allIssues
    .filter(issue => issue.status === 'returned' && issue.fine_amount > 0)
    .reduce((sum, issue) => sum + issue.fine_amount, 0);
  const pendingFines = overdueIssues.reduce((sum, issue) => sum + issue.calculated_fine, 0);

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Library Reports"
    >
      <div className="h-full overflow-y-auto">
        <div className="space-y-5">
          {error && <Alert type="error">{error}</Alert>}

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.back()}
              >
                Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Library Reports</h2>
                <p className="text-gray-600">View books, dues, and payment records</p>
              </div>
            </div>
            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={() => alert('Export functionality coming soon!')}
            >
              Export Report
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : (
            <>
              {/* Statistics Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Total Books</p>
                      <BookOpen className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_books}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.total_copies} total copies</p>
                  </div>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Available</p>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.available_copies}</p>
                    <p className="text-xs text-gray-500 mt-1">Copies available</p>
                  </div>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-sm">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Issued</p>
                      <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{stats.issued_count}</p>
                    <p className="text-xs text-gray-500 mt-1">Currently issued</p>
                  </div>
                </Card>

                <Card className="border-l-4 border-l-red-500 shadow-sm">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Overdue</p>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{stats.overdue_count}</p>
                    <p className="text-xs text-gray-500 mt-1">Books overdue</p>
                  </div>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Pending Fines</p>
                      <DollarSign className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">₹{pendingFines.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">To be collected</p>
                  </div>
                </Card>
              </div>

              {/* Fines Summary */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Fine Collection Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Fines</p>
                      <p className="text-2xl font-bold text-gray-900">₹{totalFines.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Collected</p>
                      <p className="text-2xl font-bold text-green-600">₹{collectedFines.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending</p>
                      <p className="text-2xl font-bold text-red-600">₹{pendingFines.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex gap-4">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'overdue', label: `Overdue (${overdueIssues.length})` },
                    { id: 'history', label: 'Issue History' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <Card>
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Library Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-gray-600">Total Book Titles</span>
                        <span className="font-semibold">{stats.total_books}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-gray-600">Total Copies</span>
                        <span className="font-semibold">{stats.total_copies}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-gray-600">Available for Issue</span>
                        <span className="font-semibold text-green-600">{stats.available_copies}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-gray-600">Currently Issued</span>
                        <span className="font-semibold text-orange-600">{stats.issued_count}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-gray-600">Overdue Books</span>
                        <span className="font-semibold text-red-600">{stats.overdue_count}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600">Utilization Rate</span>
                        <span className="font-semibold">
                          {stats.total_copies > 0 
                            ? ((stats.issued_count / stats.total_copies) * 100).toFixed(1) 
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'overdue' && (
                <Card>
                  <div className="p-0">
                    {overdueIssues.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No overdue books</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Student</th>
                              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Book</th>
                              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">ISBN</th>
                              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Due Date</th>
                              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Days Overdue</th>
                              <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Fine</th>
                              <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {overdueIssues.map((issue) => (
                              <tr key={issue.id} className="hover:bg-gray-50">
                                <td className="py-4 px-6">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {issue.user.first_name} {issue.user.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">{issue.user.email}</p>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div>
                                    <p className="font-medium text-gray-900">{issue.book.title}</p>
                                    <p className="text-xs text-gray-500">{issue.book.author}</p>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-sm font-mono text-gray-600">
                                  {issue.book.isbn}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">
                                  {new Date(issue.due_date).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6">
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                    {issue.days_overdue} days
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right font-semibold text-red-600">
                                  ₹{issue.calculated_fine.toFixed(2)}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedIssue(issue);
                                      setShowReturnModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors"
                                  >
                                    Return Book
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {activeTab === 'history' && (
                <Card>
                  <div className="p-0">
                    {allIssues.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No issue history</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Student</th>
                              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Book</th>
                              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Issue Date</th>
                              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Due Date</th>
                              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Return Date</th>
                              <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                              <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Fine</th>
                              <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {allIssues.map((issue) => (
                              <tr key={issue.id} className="hover:bg-gray-50">
                                <td className="py-4 px-6">
                                  <div>
                                    <p className="font-medium text-gray-900">{issue.user_details.name}</p>
                                    <p className="text-xs text-gray-500">{issue.user_details.email}</p>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div>
                                    <p className="font-medium text-gray-900">{issue.book_details.title}</p>
                                    <p className="text-xs text-gray-500">{issue.book_details.author}</p>
                                    <p className="text-xs text-gray-500 font-mono">{issue.book_details.isbn}</p>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">
                                  {new Date(issue.issue_date).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">
                                  {new Date(issue.due_date).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">
                                  {issue.return_date ? new Date(issue.return_date).toLocaleDateString() : '-'}
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                                    issue.status === 'returned' 
                                      ? 'bg-green-100 text-green-800'
                                      : issue.status === 'issued'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {issue.status}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right text-sm">
                                  {issue.fine_amount > 0 ? (
                                    <span className="font-semibold text-red-600">
                                      ₹{issue.fine_amount.toFixed(2)}
                                    </span>
                                  ) : issue.status === 'issued' && issue.calculated_fine > 0 ? (
                                    <span className="font-semibold text-orange-600">
                                      ₹{issue.calculated_fine.toFixed(2)} (pending)
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  {issue.status === 'issued' && (
                                    <button
                                      onClick={() => {
                                        setSelectedIssue(issue);
                                        setShowReturnModal(true);
                                      }}
                                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors"
                                    >
                                      Return Book
                                    </button>
                                  )}
                                  {issue.status === 'returned' && (
                                    <span className="text-xs text-gray-500">Returned</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
        
        {/* Return Book Modal */}
        {showReturnModal && selectedIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Book</h3>
                
                {returnError && <Alert type="error" className="mb-4">{returnError}</Alert>}
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Book</p>
                    <p className="font-semibold text-gray-900">
                      {'book' in selectedIssue ? selectedIssue.book.title : selectedIssue.book_details.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {'book' in selectedIssue ? selectedIssue.book.author : selectedIssue.book_details.author}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Student</p>
                    <p className="font-semibold text-gray-900">
                      {'user' in selectedIssue 
                        ? `${selectedIssue.user.first_name} ${selectedIssue.user.last_name}`
                        : selectedIssue.user_details.name
                      }
                    </p>
                  </div>
                  
                  {selectedIssue.days_overdue > 0 ? (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-red-600 font-medium">Overdue Fine</p>
                          <p className="text-xs text-red-500 mt-1">
                            {selectedIssue.days_overdue} days overdue
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                          ₹{selectedIssue.calculated_fine.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-green-600 font-medium">Early Return - No Fine</p>
                          <p className="text-xs text-green-500 mt-1">
                            Book being returned before due date
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={returnData.condition}
                      onChange={(e) => setReturnData({ ...returnData, condition: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="good">Good - No damage</option>
                      <option value="damaged">Damaged - Minor wear/tear</option>
                      <option value="lost">Lost - Book not returned</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks (Optional)
                    </label>
                    <textarea
                      value={returnData.remarks}
                      onChange={(e) => setReturnData({ ...returnData, remarks: e.target.value })}
                      placeholder="Add any notes about the return..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleReturnBook}
                    disabled={returnLoading}
                    className="flex-1"
                  >
                    {returnLoading ? 'Processing...' : 'Confirm Return'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReturnModal(false);
                      setSelectedIssue(null);
                      setReturnData({ condition: 'good', remarks: '' });
                      setReturnError('');
                    }}
                    disabled={returnLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
