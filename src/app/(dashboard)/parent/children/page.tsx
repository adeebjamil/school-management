'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { parentNav } from '@/config/navigation';
import { Users, GraduationCap, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

interface Child {
  id: string;
  link_id: string;
  admission_number: string;
  roll_number?: string;
  first_name: string;
  last_name: string;
  class_name?: string;
  section?: string;
  is_primary: boolean;
}

export default function MyChildrenPage() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get('/parents/my-children/');
      setChildren(response.data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch children:', err);
      setError(err.response?.data?.error || 'Failed to load children data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={parentNav} title="My Children">
        <Loading />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout sidebarItems={parentNav} title="My Children">
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (children.length === 0) {
    return (
      <DashboardLayout sidebarItems={parentNav} title="My Children">
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No children found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={parentNav} title="My Children">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 mb-1">{children.length}</p>
              <p className="text-sm text-gray-600">Total Children</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {children.filter(c => c.is_primary).length}
              </p>
              <p className="text-sm text-gray-600">Primary Children</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {new Set(children.map(c => c.class_name)).size}
              </p>
              <p className="text-sm text-gray-600">Different Classes</p>
            </div>
          </Card>
        </div>

        {/* Children Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {children.map((child) => (
            <Card key={child.id}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar name={`${child.first_name} ${child.last_name}`} size="lg" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {child.first_name} {child.last_name}
                        </h3>
                        {child.is_primary && (
                          <Badge variant="info">Primary</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {child.class_name} {child.section ? `- Section ${child.section}` : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        Admission No: {child.admission_number}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">
                    Active
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  {child.roll_number && (
                    <div>
                      <p className="text-xs text-gray-500">Roll Number</p>
                      <p className="text-sm font-medium text-gray-900">{child.roll_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Class</p>
                    <p className="text-sm font-medium text-gray-900">{child.class_name || 'N/A'}</p>
                  </div>
                  {child.section && (
                    <div>
                      <p className="text-xs text-gray-500">Section</p>
                      <p className="text-sm font-medium text-gray-900">{child.section}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Relationship</p>
                    <p className="text-sm font-medium text-gray-900">{child.is_primary ? 'Primary' : 'Secondary'}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    View Attendance
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                    View Results
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
