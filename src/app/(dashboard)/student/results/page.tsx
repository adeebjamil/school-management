'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { studentNav } from '@/config/navigation';
import { Trophy, TrendingUp, TrendingDown, AlertCircle, Send } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface Result {
  id: string;
  examId: string;
  examName: string;
  subject: string;
  examType: string;
  date: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  rank?: number;
  remarks?: string;
  status: 'published' | 'pending' | 'under_review';
}

interface Ticket {
  id: string;
  resultId: string;
  subject: string;
  examName: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
  createdAt: string;
  resolvedAt?: string;
}

export default function StudentResultsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<'results' | 'tickets'>('results');
  const [showRaiseTicket, setShowRaiseTicket] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResults();
    loadTickets();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await resultService.getMyResults();
      
      // Mock data
      const mockResults: Result[] = [
        {
          id: '1',
          examId: 'exam1',
          examName: 'Mid-Term Examination',
          subject: 'Mathematics',
          examType: 'midterm',
          date: '2025-01-15',
          marksObtained: 85,
          totalMarks: 100,
          percentage: 85,
          grade: 'A',
          rank: 5,
          remarks: 'Excellent performance',
          status: 'published',
        },
        {
          id: '2',
          examId: 'exam2',
          examName: 'Unit Test 1',
          subject: 'Physics',
          examType: 'quiz',
          date: '2025-01-10',
          marksObtained: 42,
          totalMarks: 50,
          percentage: 84,
          grade: 'A',
          status: 'published',
        },
        {
          id: '3',
          examId: 'exam3',
          examName: 'Mid-Term Examination',
          subject: 'English',
          examType: 'midterm',
          date: '2025-01-12',
          marksObtained: 68,
          totalMarks: 100,
          percentage: 68,
          grade: 'B',
          rank: 12,
          status: 'published',
        },
        {
          id: '4',
          examId: 'exam4',
          examName: 'Practical Examination',
          subject: 'Chemistry',
          examType: 'practical',
          date: '2025-01-08',
          marksObtained: 45,
          totalMarks: 50,
          percentage: 90,
          grade: 'A+',
          remarks: 'Outstanding practical skills',
          status: 'published',
        },
      ];

      setResults(mockResults);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await ticketService.getMyTickets();
      
      // Mock data
      const mockTickets: Ticket[] = [
        {
          id: '1',
          resultId: '1',
          subject: 'Mathematics',
          examName: 'Mid-Term Examination',
          message: 'I believe there is an error in question 5 marking. I wrote the correct formula but got 0 marks.',
          status: 'resolved',
          response: 'We have reviewed your answer. The formula was correct, but the final calculation had an error. Marks have been updated from 85 to 88.',
          createdAt: '2025-01-16',
          resolvedAt: '2025-01-18',
        },
      ];

      setTickets(mockTickets);
    } catch (err: any) {
      console.error('Failed to load tickets:', err);
    }
  };

  const handleRaiseTicket = async () => {
    if (!selectedResult || !ticketMessage.trim()) {
      setError('Please provide a message for your concern');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      // TODO: Replace with actual API call
      // await ticketService.raiseTicket({
      //   resultId: selectedResult.id,
      //   message: ticketMessage,
      // });

      // Mock ticket creation
      const newTicket: Ticket = {
        id: Date.now().toString(),
        resultId: selectedResult.id,
        subject: selectedResult.subject,
        examName: selectedResult.examName,
        message: ticketMessage,
        status: 'open',
        createdAt: new Date().toISOString(),
      };

      setTickets([newTicket, ...tickets]);
      setSuccess('Ticket raised successfully. Faculty will review your concern.');
      setShowRaiseTicket(false);
      setTicketMessage('');
      setSelectedResult(null);
      setActiveTab('tickets');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to raise ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const getGradeBadge = (grade: string) => {
    const styles: Record<string, string> = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-green-100 text-green-700',
      'B+': 'bg-blue-100 text-blue-800',
      'B': 'bg-blue-100 text-blue-700',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[grade] || 'bg-gray-100 text-gray-800'}`}>
        Grade {grade}
      </span>
    );
  };

  const getTicketStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const calculateOverallPerformance = () => {
    if (results.length === 0) return { average: 0, totalMarks: 0, obtainedMarks: 0 };
    const totalMarks = results.reduce((sum, r) => sum + r.totalMarks, 0);
    const obtainedMarks = results.reduce((sum, r) => sum + r.marksObtained, 0);
    const average = Math.round((obtainedMarks / totalMarks) * 100);
    return { average, totalMarks, obtainedMarks };
  };

  const performance = calculateOverallPerformance();

  return (
    <DashboardLayout
      sidebarItems={studentNav}
      tenantName="Sunshine High School"
      title="Results"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Results</h2>
          <p className="text-gray-600 mt-1">View your exam results and raise concerns</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Overall Performance Card */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Overall Performance</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-gray-900">{performance.average}%</p>
                    <p className="text-sm text-gray-600 mt-1">Average Percentage</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{performance.obtainedMarks}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Marks Obtained</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{results.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Exams Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                <button
                  onClick={() => setActiveTab('results')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'results'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Results ({results.length})
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'tickets'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  My Tickets ({tickets.length})
                </button>
              </nav>
            </div>

            {/* Results Tab */}
            {activeTab === 'results' && (
              <div>
                {results.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No results available yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <Card key={result.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900">{result.subject}</h4>
                                {getGradeBadge(result.grade)}
                                {result.rank && (
                                  <span className="text-sm text-gray-600">
                                    Rank: <span className="font-medium">#{result.rank}</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{result.examName}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(result.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="text-3xl font-bold text-gray-900">
                                    {result.marksObtained}
                                    <span className="text-lg text-gray-500">/{result.totalMarks}</span>
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">{result.percentage}%</p>
                                </div>
                                {result.percentage >= 85 ? (
                                  <TrendingUp className="w-6 h-6 text-green-500" />
                                ) : result.percentage < 60 ? (
                                  <TrendingDown className="w-6 h-6 text-red-500" />
                                ) : null}
                              </div>
                            </div>
                          </div>
                          {result.remarks && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Remarks:</span> {result.remarks}
                              </p>
                            </div>
                          )}
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<AlertCircle className="w-4 h-4" />}
                              onClick={() => {
                                setSelectedResult(result);
                                setShowRaiseTicket(true);
                              }}
                            >
                              Raise Concern
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div>
                {tickets.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No tickets raised yet</p>
                      <p className="text-sm mt-2">
                        You can raise concerns about your results from the Results tab
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <Card key={ticket.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{ticket.subject}</h4>
                              <p className="text-sm text-gray-600 mt-1">{ticket.examName}</p>
                            </div>
                            {getTicketStatusBadge(ticket.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Your Message:</p>
                              <p className="text-sm text-gray-600 mt-1">{ticket.message}</p>
                            </div>
                            {ticket.response && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-blue-900">Faculty Response:</p>
                                <p className="text-sm text-blue-800 mt-1">{ticket.response}</p>
                              </div>
                            )}
                            <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                              <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                              {ticket.resolvedAt && (
                                <span>Resolved: {new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                              )}
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

        {/* Raise Ticket Modal */}
        {showRaiseTicket && selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Raise Concern</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedResult.subject} - {selectedResult.examName}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowRaiseTicket(false);
                      setTicketMessage('');
                      setSelectedResult(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe your concern
                    </label>
                    <Textarea
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      rows={5}
                      placeholder="Please describe your concern about this result. Be specific about the question number or marking if applicable."
                      className="w-full"
                    />
                  </div>

                  <Alert type="info">
                    <p className="text-sm">
                      Faculty will review your concern and respond within 2-3 working days.
                    </p>
                  </Alert>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRaiseTicket(false);
                        setTicketMessage('');
                        setSelectedResult(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      icon={<Send className="w-4 h-4" />}
                      onClick={handleRaiseTicket}
                      loading={submitting}
                      disabled={!ticketMessage.trim()}
                      className="flex-1"
                    >
                      Submit Ticket
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
