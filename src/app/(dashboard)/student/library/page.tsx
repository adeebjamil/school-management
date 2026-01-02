'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { studentNav } from '@/config/navigation';
import { BookOpen, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

interface IssuedBook {
  id: string;
  book_details: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
  };
  issue_date: string;
  due_date: string;
  status: string;
  days_overdue: number;
  calculated_fine: number;
}

export default function StudentLibraryPage() {
  const [books, setBooks] = useState<IssuedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyBooks();
  }, []);

  const loadMyBooks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/library/issues/my_books/');
      // Handle paginated response - books are in response.data.results
      const booksData = Array.isArray(response.data) 
        ? response.data 
        : (Array.isArray(response.data.results) ? response.data.results : []);
      setBooks(booksData);
      setLoading(false);
      
    } catch (err: any) {
      console.error('Failed to load issued books:', err);
      setError('Failed to load your issued books');
      setBooks([]); // Reset to empty array on error
      setLoading(false);
    }
  };
  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusBadge = (book: IssuedBook) => {
    if (book.days_overdue > 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Overdue
        </span>
      );
    }
    
    const daysRemaining = getDaysRemaining(book.due_date);
    if (daysRemaining <= 3) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Due Soon
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    );
  };

  const totalFine = Array.isArray(books) ? books.reduce((sum, book) => sum + book.calculated_fine, 0) : 0;

  return (
    <DashboardLayout
      sidebarItems={studentNav}
      tenantName="Sunshine High School"
      title="My Library"
    >
      <div className="h-full overflow-y-auto">
        <div className="space-y-5">
          {error && <Alert type="error">{error}</Alert>}

          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Issued Books</h2>
            <p className="text-gray-600">View your borrowed books and due dates</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Total Borrowed</p>
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{Array.isArray(books) ? books.length : 0}</p>
              </div>
            </Card>
            <Card className="border-l-4 border-l-red-500 shadow-sm">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Overdue Books</p>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {Array.isArray(books) ? books.filter(b => b.days_overdue > 0).length : 0}
                </p>
              </div>
            </Card>
            <Card className="border-l-4 border-l-yellow-500 shadow-sm">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Total Fine</p>
                  <Calendar className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">₹{totalFine.toFixed(2)}</p>
              </div>
            </Card>
          </div>

          {/* Books List */}
          <Card>
            <div className="p-0">
              {loading ? (
                <div className="p-8"><Loading /></div>
              ) : !Array.isArray(books) || books.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-lg font-medium">No books issued</p>
                  <p className="text-sm">You haven't borrowed any books yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {Array.isArray(books) && books.map((issue) => (
                    <div key={issue.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{issue.book_details.title}</h3>
                              <p className="text-sm text-gray-600">by {issue.book_details.author}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>ISBN: {issue.book_details.isbn}</span>
                                <span className="px-2 py-0.5 bg-gray-100 rounded">
                                  {issue.book_details.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">Issued:</span>
                              <span>{new Date(issue.issue_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">Due:</span>
                              <span className={issue.days_overdue > 0 ? 'text-red-600 font-semibold' : ''}>
                                {new Date(issue.due_date).toLocaleDateString()}
                              </span>
                            </div>
                            {issue.days_overdue > 0 ? (
                              <div className="mt-2 text-red-600 font-medium text-xs">
                                Fine: ₹{issue.calculated_fine} ({issue.days_overdue} days overdue)
                              </div>
                            ) : (
                              <div className="mt-2 text-green-600 font-medium text-xs">
                                {getDaysRemaining(issue.due_date)} days remaining
                              </div>
                            )}
                          </div>
                          
                          <div>
                            {getStatusBadge(issue)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Note:</span> Contact the library to return this book early
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Info Box */}
          {Array.isArray(books) && books.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <div className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Library Rules:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Books must be returned on or before the due date</li>
                      <li>Late fine: ₹1 per day after the due date</li>
                      <li>Contact the librarian if you need an extension</li>
                      <li>Lost or damaged books must be reported immediately</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
