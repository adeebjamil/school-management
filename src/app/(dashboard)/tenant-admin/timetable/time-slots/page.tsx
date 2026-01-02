'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { tenantAdminNav } from '@/config/navigation';
import { Clock, Plus, Edit, Trash2, ArrowLeft, Save, X } from 'lucide-react';
import api from '@/lib/api';

interface TimeSlot {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
}

export default function TimeSlotsPage() {
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    period_number: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/timetable/time-slots/');
      const slotsData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setTimeSlots(slotsData.sort((a: TimeSlot, b: TimeSlot) => a.period_number - b.period_number));
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load time slots:', err);
      setError('Failed to load time slots');
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/timetable/time-slots/', formData);
      setShowCreateForm(false);
      setFormData({ period_number: '', start_time: '', end_time: '' });
      loadTimeSlots();
    } catch (err: any) {
      console.error('Failed to create time slot:', err);
      setError(err.response?.data?.error || 'Failed to create time slot');
    }
  };

  const handleUpdate = async (slot: TimeSlot) => {
    try {
      await api.put(`/timetable/time-slots/${slot.id}/`, {
        period_number: slot.period_number,
        start_time: slot.start_time,
        end_time: slot.end_time,
      });
      setEditingSlot(null);
      loadTimeSlots();
    } catch (err: any) {
      console.error('Failed to update time slot:', err);
      setError('Failed to update time slot');
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot? This may affect existing timetable entries.')) {
      return;
    }

    try {
      await api.delete(`/timetable/time-slots/${slotId}/`);
      loadTimeSlots();
    } catch (err: any) {
      console.error('Failed to delete time slot:', err);
      setError('Failed to delete time slot');
    }
  };

  const handleEditChange = (field: string, value: string) => {
    if (editingSlot) {
      setEditingSlot({ ...editingSlot, [field]: field === 'period_number' ? parseInt(value) : value });
    }
  };

  return (
    <DashboardLayout
      sidebarItems={tenantAdminNav}
      tenantName="Sunshine High School"
      title="Time Slot Management"
    >
      <div className="h-full overflow-y-auto">
        <div className="space-y-5">
          {error && <Alert type="error">{error}</Alert>}

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Time Slots</h2>
              <p className="text-gray-600">Manage period timings for winter and summer schedules</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.push('/tenant-admin/timetable')}
              >
                Back
              </Button>
              <Button
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateForm(true)}
              >
                Add Time Slot
              </Button>
            </div>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Create New Time Slot</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Period Number
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.period_number}
                      onChange={(e) => setFormData({ ...formData, period_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full">
                      Create
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Time Slots List */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8"><Loading /></div>
              ) : timeSlots.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Time Slots Configured
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create time slots to define period timings for your timetable.
                  </p>
                  <Button
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowCreateForm(true)}
                  >
                    Add Time Slot
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {timeSlots.map((slot) => (
                        <tr key={slot.id} className="hover:bg-gray-50">
                          {editingSlot?.id === slot.id ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={editingSlot.period_number}
                                  onChange={(e) => handleEditChange('period_number', e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="time"
                                  value={editingSlot.start_time}
                                  onChange={(e) => handleEditChange('start_time', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="time"
                                  value={editingSlot.end_time}
                                  onChange={(e) => handleEditChange('end_time', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="info">Editing...</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => handleUpdate(editingSlot)}
                                  className="text-green-600 hover:text-green-800 mr-3"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingSlot(null)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="default">Period {slot.period_number}</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {slot.start_time}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {slot.end_time}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(() => {
                                  const start = new Date(`2000-01-01T${slot.start_time}`);
                                  const end = new Date(`2000-01-01T${slot.end_time}`);
                                  const diff = (end.getTime() - start.getTime()) / 60000;
                                  return `${diff} minutes`;
                                })()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => setEditingSlot(slot)}
                                  className="text-blue-600 hover:text-blue-800 mr-3"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(slot.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
              <p className="text-sm text-blue-700">
                You can create different time slot sets for different seasons (Winter/Summer schedule). 
                Simply update the timings here when seasons change, and all timetables will automatically use the new timings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
