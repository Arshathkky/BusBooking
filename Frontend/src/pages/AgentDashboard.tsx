import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Download, Star } from 'lucide-react';

interface Booking {
  id: string;
  busName: string;
  route: string;
  date: string;
  time: string;
  seats: number[];
  status: 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  bookingId: string;
}

const AgentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const mockBookings: Booking[] = [
    {
      id: '1',
      busName: 'Express Luxury',
      route: 'Colombo → Kandy',
      date: '2024-01-15',
      time: '06:00',
      seats: [12, 13],
      status: 'confirmed',
      amount: 2500,
      bookingId: 'BB123456'
    },
    {
      id: '2',
      busName: 'Comfort Plus',
      route: 'Kandy → Galle',
      date: '2023-12-20',
      time: '14:30',
      seats: [8],
      status: 'completed',
      amount: 980,
      bookingId: 'BB123455'
    }
  ];

  const upcomingBookings = mockBookings.filter(b => b.status === 'confirmed');
  const pastBookings = mockBookings.filter(b => b.status !== 'confirmed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'completed': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'cancelled': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Agent Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage bookings and assist customers</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 transition-colors">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'text-[#fdc106] border-b-2 border-[#fdc106]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Upcoming Trips ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-[#fdc106] border-b-2 border-[#fdc106]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Booking History ({pastBookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => (
          <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{booking.busName}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Booking ID: {booking.bookingId}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Route</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{booking.route}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(booking.date).toLocaleDateString()} at {booking.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Seats</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {booking.seats.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    LKR {booking.amount.toLocaleString()}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    
                    {booking.status === 'completed' && (
                      <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                        <Star className="w-4 h-4" />
                        <span>Rate</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No {activeTab === 'upcoming' ? 'upcoming trips' : 'booking history'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'upcoming' 
                ? 'Book trips for customers to see them here'
                : 'Completed bookings will appear here'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;