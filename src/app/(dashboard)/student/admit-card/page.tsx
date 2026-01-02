'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { studentNav } from '@/config/navigation';
import { CreditCard, Download, Search, Calendar, Clock, MapPin, Eye } from 'lucide-react';

interface AdmitCard {
  id: string;
  examName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  room: string;
  seatNumber: string;
  studentName: string;
  admissionNumber: string;
  rollNumber: string;
  className: string;
  examType: string;
  instructions: string[];
  issuedDate: string;
  status: 'available' | 'downloaded' | 'expired';
}

export default function AdmitCardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<AdmitCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<AdmitCard | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadAdmitCards();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCards(admitCards);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = admitCards.filter(
        (card) =>
          card.examName.toLowerCase().includes(query) ||
          card.subject.toLowerCase().includes(query) ||
          card.examType.toLowerCase().includes(query)
      );
      setFilteredCards(filtered);
    }
  }, [searchQuery, admitCards]);

  const loadAdmitCards = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await admitCardService.getMyAdmitCards();
      
      // Mock data
      const mockCards: AdmitCard[] = [
        {
          id: '1',
          examName: 'Mid-Term Examination 2025',
          subject: 'Mathematics',
          date: '2025-02-15',
          startTime: '09:00 AM',
          endTime: '12:00 PM',
          venue: 'Main Building',
          room: 'A-101',
          seatNumber: 'S-25',
          studentName: 'Adeeb Jamil',
          admissionNumber: '1254',
          rollNumber: '21',
          className: '8 - C',
          examType: 'Mid-Term',
          issuedDate: '2025-02-01',
          status: 'available',
          instructions: [
            'Report to the exam hall 15 minutes before the scheduled time',
            'Carry this admit card and your student ID card',
            'Mobile phones and electronic devices are strictly prohibited',
            'Use only blue or black pen for writing',
            'Do not write anything on the admit card',
          ],
        },
        {
          id: '2',
          examName: 'Physics Practical Examination',
          subject: 'Physics',
          date: '2025-02-18',
          startTime: '11:00 AM',
          endTime: '01:00 PM',
          venue: 'Science Block',
          room: 'Lab B-205',
          seatNumber: 'L-12',
          studentName: 'Adeeb Jamil',
          admissionNumber: '1254',
          rollNumber: '21',
          className: '8 - C',
          examType: 'Practical',
          issuedDate: '2025-02-05',
          status: 'available',
          instructions: [
            'Bring your lab manual and required instruments',
            'Wear appropriate lab attire (lab coat mandatory)',
            'Follow all safety protocols',
            'Report any equipment malfunction immediately',
            'Complete all experiments within the allotted time',
          ],
        },
        {
          id: '3',
          examName: 'Chemistry Quiz',
          subject: 'Chemistry',
          date: '2025-02-20',
          startTime: '02:00 PM',
          endTime: '03:00 PM',
          venue: 'Academic Block',
          room: 'C-302',
          seatNumber: 'S-18',
          studentName: 'Adeeb Jamil',
          admissionNumber: '1254',
          rollNumber: '21',
          className: '8 - C',
          examType: 'Quiz',
          issuedDate: '2025-02-10',
          status: 'available',
          instructions: [
            'This is a closed-book examination',
            'Calculators are not allowed',
            'Write your answers clearly',
            'Check all questions before starting',
          ],
        },
      ];

      setAdmitCards(mockCards);
      setFilteredCards(mockCards);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load admit cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cardId: string) => {
    try {
      // TODO: Implement actual download API
      // await admitCardService.downloadAdmitCard(cardId);
      
      // Mock download
      const card = admitCards.find(c => c.id === cardId);
      if (card) {
        // Update status to downloaded
        setAdmitCards(admitCards.map(c => 
          c.id === cardId ? { ...c, status: 'downloaded' as const } : c
        ));
        alert(`Admit card for ${card.examName} downloaded successfully!`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to download admit card');
    }
  };

  const handlePreview = (card: AdmitCard) => {
    setSelectedCard(card);
    setShowPreview(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      downloaded: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <DashboardLayout
      sidebarItems={studentNav}
      tenantName="Sunshine High School"
      title="Admit Cards"
    >
      <div className="space-y-6">
        {/* Header with Search */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admit Cards</h2>
            <p className="text-gray-600 mt-1">View and download your hall tickets</p>
          </div>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by exam name, subject, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-600 mt-2">
                Showing {filteredCards.length} of {admitCards.length} admit cards
              </p>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <Loading />
        ) : filteredCards.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>
                {searchQuery
                  ? 'No admit cards match your search'
                  : 'No admit cards available at the moment'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCards.map((card) => (
              <Card key={card.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{card.examName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{card.subject}</p>
                    </div>
                    {getStatusBadge(card.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(card.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{card.startTime} - {card.endTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{card.venue} - {card.room}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Seat Number:</span>
                          <span className="ml-2 font-medium text-gray-900">{card.seatNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Exam Type:</span>
                          <span className="ml-2 font-medium text-gray-900">{card.examType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handlePreview(card)}
                        className="flex-1"
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        icon={<Download className="w-4 h-4" />}
                        onClick={() => handleDownload(card.id)}
                        className="flex-1"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Admit Card Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Admit Card Content */}
                <div className="border-2 border-gray-300 rounded-lg p-6 space-y-4">
                  <div className="text-center border-b pb-4">
                    <h4 className="text-2xl font-bold text-gray-900">Sunshine High School</h4>
                    <p className="text-lg font-semibold text-gray-700 mt-2">{selectedCard.examName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Student Name</p>
                      <p className="font-medium text-gray-900">{selectedCard.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Admission Number</p>
                      <p className="font-medium text-gray-900">{selectedCard.admissionNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Roll Number</p>
                      <p className="font-medium text-gray-900">{selectedCard.rollNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Class</p>
                      <p className="font-medium text-gray-900">{selectedCard.className}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Examination Details</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Subject</p>
                        <p className="font-medium text-gray-900">{selectedCard.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedCard.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-medium text-gray-900">
                          {selectedCard.startTime} - {selectedCard.endTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Venue</p>
                        <p className="font-medium text-gray-900">{selectedCard.venue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Room</p>
                        <p className="font-medium text-gray-900">{selectedCard.room}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Seat Number</p>
                        <p className="font-medium text-gray-900">{selectedCard.seatNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Important Instructions</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {selectedCard.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="font-medium">{index + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-4 text-center text-sm text-gray-600">
                    <p>Issued on: {new Date(selectedCard.issuedDate).toLocaleDateString()}</p>
                    <p className="mt-2 font-medium">
                      This is a computer-generated document. No signature required.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => {
                      handleDownload(selectedCard.id);
                      setShowPreview(false);
                    }}
                    className="flex-1"
                  >
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
