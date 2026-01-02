'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { studentNav } from '@/config/navigation';
import { Bus, MapPin, Clock, Users, Lock, Phone, AlertCircle, Calendar, Receipt, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';

interface TransportAssignment {
  id: string;
  vehicle_details: {
    id: string;
    vehicle_number: string;
    vehicle_type: string;
    capacity: number;
    driver_name: string;
    driver_phone: string;
    model?: string;
  };
  route_details: {
    id: string;
    route_number: string;
    route_name: string;
    stops: string[];
    pickup_time: string | null;
    drop_time: string | null;
  };
  pickup_point: string;
  monthly_fee: number;
  status: string;
  effective_from: string;
}

export default function StudentTransportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignment, setAssignment] = useState<TransportAssignment | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadTransportData();
  }, []);

  const loadTransportData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/transport/assignments/my_transport/');
      setAssignment(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load transport data:', err);
      if (err.response?.status === 404) {
        // No assignment found
        setAssignment(null);
      } else {
        setError('Failed to load transport information');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={studentNav}
        tenantName="Sunshine High School"
        title="Transport"
      >
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={studentNav}
      tenantName="Sunshine High School"
      title="Transport"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Bus className="w-6 h-6 text-gray-700" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Transport</h2>
              <p className="text-gray-600 text-sm mt-1">View your bus route and schedule details</p>
            </div>
          </div>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {!assignment ? (
          <Card className="border border-gray-200">
            <CardContent className="py-12 text-center">
              <Bus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Transport Assignment Yet
              </h3>
              <p className="text-gray-600 mb-2">
                You haven't been assigned to a bus route yet.
              </p>
              <p className="text-sm text-gray-500">
                Contact your school administrator to get assigned to a bus route.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Transport Details</h3>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                assignment.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : assignment.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </span>
            </div>

            {/* Main Card */}
            <Card>
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Bus className="w-6 h-6 text-gray-700" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {assignment.route_details.route_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {assignment.route_details.route_number && `Route ${assignment.route_details.route_number} • `}
                      {assignment.vehicle_details.vehicle_number}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Timing */}
                  {(assignment.route_details.pickup_time || assignment.route_details.drop_time) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignment.route_details.pickup_time && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Pickup Time</p>
                              <p className="text-lg font-semibold text-gray-900">{assignment.route_details.pickup_time}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {assignment.route_details.drop_time && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Drop Time</p>
                              <p className="text-lg font-semibold text-gray-900">{assignment.route_details.drop_time}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pickup Point */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-1">Your Pickup Point</p>
                        <p className="text-base font-semibold text-gray-900">{assignment.pickup_point}</p>
                        <p className="text-xs text-gray-500 mt-1">Be ready 5 minutes before pickup time</p>
                      </div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Driver Name</p>
                          <p className="text-base font-semibold text-gray-900">{assignment.vehicle_details.driver_name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Contact Number</p>
                          <p className="text-base font-semibold text-gray-900">{assignment.vehicle_details.driver_phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Fee */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Monthly Transport Fee</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          ₹{assignment.monthly_fee}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-1">Effective From</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(assignment.effective_from).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Route Stops */}
                  {assignment.route_details.stops && assignment.route_details.stops.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <p className="text-sm font-semibold text-gray-900">Route Stops</p>
                      </div>
                      <div className="space-y-2">
                        {assignment.route_details.stops.map((stop, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              stop === assignment.pickup_point
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                stop === assignment.pickup_point
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{stop}</p>
                              {stop === assignment.pickup_point && (
                                <p className="text-xs text-blue-600">Your Stop</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vehicle Info */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Bus className="w-4 h-4 text-gray-600" />
                      <p className="text-sm font-semibold text-gray-900">Vehicle Information</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Vehicle Number</p>
                        <p className="text-sm font-medium text-gray-900">{assignment.vehicle_details.vehicle_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Type</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{assignment.vehicle_details.vehicle_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Capacity</p>
                        <p className="text-sm font-medium text-gray-900">{assignment.vehicle_details.capacity} seats</p>
                      </div>
                      {assignment.vehicle_details.model && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Model</p>
                          <p className="text-sm font-medium text-gray-900">{assignment.vehicle_details.model}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Monthly Calendar Schedule */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <p className="text-sm font-semibold text-gray-900">Monthly Schedule</p>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-xs font-medium text-gray-600 py-1">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {(() => {
                          const year = currentDate.getFullYear();
                          const month = currentDate.getMonth();
                          const firstDay = new Date(year, month, 1).getDay();
                          const daysInMonth = new Date(year, month + 1, 0).getDate();
                          const today = new Date();
                          const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
                          
                          const days = [];
                          // Empty cells for days before month starts
                          for (let i = 0; i < firstDay; i++) {
                            days.push(
                              <div key={`empty-${i}`} className="aspect-square"></div>
                            );
                          }
                          // Actual days
                          for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(year, month, day);
                            const isToday = isCurrentMonth && today.getDate() === day;
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            
                            days.push(
                              <div
                                key={day}
                                className={`aspect-square flex items-center justify-center text-sm rounded ${
                                  isToday
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : isWeekend
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {day}
                              </div>
                            );
                          }
                          return days;
                        })()}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <button
                          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                          className="text-xs text-gray-600 hover:text-gray-900"
                        >
                          ← Previous
                        </button>
                        <p className="text-sm font-medium text-gray-900">
                          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                        <button
                          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                          className="text-xs text-gray-600 hover:text-gray-900"
                        >
                          Next →
                        </button>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-900">Daily Schedule</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Pickup: {assignment.route_details.pickup_time || 'N/A'} • Drop: {assignment.route_details.drop_time || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Weekends are off (shown in gray)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                 
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
