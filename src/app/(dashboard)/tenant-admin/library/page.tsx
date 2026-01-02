'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { Book, Plus, FileText, Search, Filter, BookOpen, Users, TrendingUp, CheckCircle, Clock, Edit } from 'lucide-react';
import api from '@/lib/api';

interface BookRecord {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  category: string;
  total_copies: number;
  available_copies: number;
  shelf_location?: string;
  available_status: 'available' | 'low_stock' | 'out_of_stock';
}

interface LibraryStats {
  total_books: number;
  total_copies: number;
  available_copies: number;
  issued_count: number;
  overdue_count: number;
}

export default function LibraryPage() {
  const router = useRouter();
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [stats, setStats] = useState<LibraryStats>({
    total_books: 0,
    total_copies: 0,
    available_copies: 0,
    issued_count: 0,
    overdue_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    availability: '',
  });

  useEffect(() => {
    console.log('Loading books and stats...');
    loadBooks();
    loadStats();
  }, [filters.category, filters.availability]);

  const loadStats = async () => {
    try {
      const response = await api.get('/library/books/stats/');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.availability) params.availability = filters.availability;
      // Don't send search in params, use client-side filtering
      
      const response = await api.get('/library/books/', { params });
      // Handle paginated response - books are in response.data.results
      const booksData = Array.isArray(response.data) 
        ? response.data 
        : (Array.isArray(response.data.results) ? response.data.results : []);
      console.log('Loaded books:', booksData); // Debug log
      setBooks(booksData);
      setLoading(false);
      
    } catch (err: any) {
      console.error('Failed to load books:', err);
      setError('Failed to load library records');
      setBooks([]); // Reset to empty array on error
      setLoading(false);
    }
  };

  const getStatusBadge = (available_status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
    };
    const labels = {
      available: 'Available',
      low_stock: 'Low Stock',
      out_of_stock: 'Out of Stock',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[available_status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[available_status as keyof typeof labels] || available_status}
      </span>
    );
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredBooks = Array.isArray(books) ? books.filter(book => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.isbn.toLowerCase().includes(searchLower) ||
      (book.category && book.category.toLowerCase().includes(searchLower))
    );
  }) : [];

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Library Management"
    >
      <div className="h-full overflow-y-auto">
        <div className="space-y-5">
          {error && <Alert type="error">{error}</Alert>}

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book Collection</h2>
            <p className="text-gray-600">Manage and track school library resources</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<FileText className="w-4 h-4" />}
              onClick={() => router.push('/tenant-admin/library/reports')}
            >
              Reports
            </Button>
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => router.push('/tenant-admin/library/add')}
            >
              Add Book
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Total Books</p>
                <BookOpen className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.total_books}</p>
            </div>
          </Card>
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Available Copies</p>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xl font-bold text-green-600">{stats.available_copies}</p>
            </div>
          </Card>
          <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Issued</p>
                <Users className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-xl font-bold text-orange-600">{stats.issued_count}</p>
            </div>
          </Card>
          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Overdue</p>
                <Clock className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-xl font-bold text-red-600">{stats.overdue_count}</p>
            </div>
          </Card>
          <Card className="border-l-4 border-l-gray-500 shadow-sm">
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500 uppercase">Total Copies</p>
                <TrendingUp className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{stats.total_copies}</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, author, ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Science">Science</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="History">History</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  name="availability"
                  value={filters.availability}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Books Table */}
        <Card>
          <div className="p-0">
            {loading ? (
              <div className="p-8"><Loading /></div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Book className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No books found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Book Details</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">ISBN</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Category</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Copies</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Shelf Location</th>
                      <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filteredBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{book.title}</span>
                            <span className="text-xs text-gray-500">{book.author}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 font-mono">
                          {book.isbn}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {book.category}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <span className="font-medium text-green-600">{book.available_copies}</span>
                          <span className="text-gray-400"> / </span>
                          <span className="text-gray-500">{book.total_copies}</span>
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(book.available_status)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {book.shelf_location || '-'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              className={`px-3 py-1.5 text-white text-xs rounded-md transition-colors ${
                                book.available_copies > 0 
                                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' 
                                  : 'bg-gray-400 cursor-not-allowed'
                              }`}
                              onClick={() => book.available_copies > 0 && router.push(`/tenant-admin/library/issue?book_id=${book.id}`)}
                              disabled={book.available_copies === 0}
                              title={book.available_copies > 0 ? 'Issue this book to a student' : 'No copies available'}
                            >
                              {book.available_copies > 0 ? 'Issue to Student' : 'Out of Stock'}
                            </button>
                            <button 
                              className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors" 
                              title="Edit Book"
                              onClick={() => router.push(`/tenant-admin/library/edit/${book.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filteredBooks.length > 0 && (
            <div className="p-4 border-t border-gray-100 text-xs text-gray-500 text-center">
              Showing {filteredBooks.length} books in collection
            </div>
          )}
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
}
