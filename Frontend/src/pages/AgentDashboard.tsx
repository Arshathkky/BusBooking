import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Download, Star, TrendingUp, CheckCircle, Bus, LogOut } from 'lucide-react';

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

interface AgentDashboardProps {
  agent: { name: string; area: string };
  onLogout: () => void;
}

// Example mock bookings
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
  },
  {
    id: '3',
    busName: 'City Express',
    route: 'Colombo → Galle',
    date: '2024-01-18',
    time: '08:30',
    seats: [1, 2, 3],
    status: 'confirmed',
    amount: 1500,
    bookingId: 'BB123457'
  }
];

const AgentDashboard: React.FC<AgentDashboardProps> = ({ agent, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const upcomingBookings = mockBookings.filter(b => b.status === 'confirmed');
  const pastBookings = mockBookings.filter(b => b.status !== 'confirmed');

  const totalBookings = mockBookings.length;
  const completedBookings = mockBookings.filter(b => b.status === 'completed').length;
  const totalRevenue = mockBookings.reduce((sum, b) => sum + b.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Bus className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xl font-bold text-gray-900">{agent.name}</p>
                <p className="text-sm text-gray-600">{agent.area} Area</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all transform hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">Manage bookings and track performance</p>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalBookings}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Bookings</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</span>
            </div>
            <p className="text-gray-600 font-medium">Upcoming Trips</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{completedBookings}</span>
            </div>
            <p className="text-gray-600 font-medium">Completed Trips</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-cyan-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">LKR {totalRevenue.toLocaleString()}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Revenue</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6 transition-colors">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'text-[#fdc106] border-b-2 border-[#fdc106]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming Trips ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-[#fdc106] border-b-2 border-[#fdc106]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Booking History ({pastBookings.length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-[1.02]"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{booking.busName}</h3>
                    <p className="text-gray-600">Booking ID: {booking.bookingId}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="font-medium">{booking.route}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-2 text-cyan-600" />
                    <span>{new Date(booking.date).toLocaleDateString()} at {booking.time}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-2 text-green-600" />
                    <span>Seats: {booking.seats.join(', ')}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    LKR {booking.amount.toLocaleString()}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  {booking.status === 'completed' && (
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                      <Star className="w-4 h-4" /> Rate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab === 'upcoming' ? 'upcoming trips' : 'booking history'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'upcoming' ? 'Book trips for customers to see them here' : 'Completed bookings will appear here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
