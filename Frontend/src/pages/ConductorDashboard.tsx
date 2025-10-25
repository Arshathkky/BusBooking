import React, { useState } from 'react';
import { Calendar, MapPin, Users, CheckCircle, Clock, Search, Phone, Navigation, Bus, DollarSign } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const ConductorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'bookings' | 'verify'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const { buses, bookings, routes, conductors, getBookingsByDate, getBookingsByBus } = useData();
  const { user } = useAuth();

  // Find conductor's assigned bus
  const conductor = conductors.find(c => c.email === user?.email);
  const assignedBus = conductor?.assignedBusId ? buses.find(b => b.id === conductor.assignedBusId) : null;
  const busRoute = assignedBus ? routes.find(r => r.id === assignedBus.routeId) : null;

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = assignedBus ? getBookingsByBus(assignedBus.id).filter(b => b.travelDate === today) : [];
  const allBusBookings = assignedBus ? getBookingsByBus(assignedBus.id) : [];

  const handleVerifyPassenger = (bookingId: string) => {
    // In a real app, this would update the booking status
    console.log(`Verifying booking ${bookingId}`);
  };

  const filteredBookings = todayBookings.filter(booking =>
    booking.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.selectedSeats.some(seat => seat.toString().includes(searchTerm))
  );

  const stats = {
    todayBookings: todayBookings.length,
    todayPassengers: todayBookings.reduce((sum, b) => sum + b.selectedSeats.length, 0),
    todayEarnings: todayBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    occupancyRate: assignedBus ? Math.round((todayBookings.reduce((sum, b) => sum + b.selectedSeats.length, 0) / assignedBus.totalSeats) * 100) : 0
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Conductor Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {assignedBus ? `Managing ${assignedBus.name} - ${busRoute?.startPoint} → ${busRoute?.endPoint}` : 'No bus assigned'}
        </p>
      </div>

      {!assignedBus && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">No Bus Assigned</h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            Please contact your bus owner to assign you to a bus.
          </p>
        </div>
      )}

      {assignedBus && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.todayBookings}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Passengers</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.todayPassengers}</p>
                </div>
                <Users className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.occupancyRate}%</p>
                </div>
                <CheckCircle className="w-12 h-12 text-[#fdc106]" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    LKR {stats.todayEarnings.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Bus Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-[#fdc106] rounded-full flex items-center justify-center">
                <Bus className="w-8 h-8 text-gray-900" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{assignedBus.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{assignedBus.companyName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {busRoute?.startPoint} → {busRoute?.endPoint} • {assignedBus.type}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Departure</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{assignedBus.departureTime}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Arrival</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{assignedBus.arrivalTime}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Capacity</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{assignedBus.totalSeats} seats</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                  <p className="font-semibold text-gray-900 dark:text-white">LKR {assignedBus.price}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 transition-colors">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('today')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'today'
                    ? 'text-[#fdc106] border-b-2 border-[#fdc106]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Today's Passengers ({todayBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'bookings'
                    ? 'text-[#fdc106] border-b-2 border-[#fdc106]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All Bookings ({allBusBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('verify')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'verify'
                    ? 'text-[#fdc106] border-b-2 border-[#fdc106]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Verify Passengers
              </button>
            </div>
          </div>

          {/* Today's Passengers */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Today's Passenger List</h3>
                
                {todayBookings.map((booking) => (
                  <div key={booking.id} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#fdc106] rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{booking.passengerName}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span>{booking.passengerPhone}</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Seats: {booking.selectedSeats.join(', ')} • {booking.bookingId}
                          </p>
                          {booking.pickupLocation && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                              <Navigation className="w-3 h-3 mr-1" />
                              Pickup: {booking.pickupLocation}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Address: {booking.passengerAddress}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          LKR {booking.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {booking.selectedSeats.length} passengers
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {todayBookings.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No passengers for today</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Bookings */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {allBusBookings.map((booking) => (
                <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{booking.passengerName}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{booking.passengerPhone}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Travel Date: {new Date(booking.travelDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Seats: {booking.selectedSeats.join(', ')} • {booking.bookingId}
                      </p>
                      {booking.pickupLocation && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                          <Navigation className="w-3 h-3 mr-1" />
                          Pickup: {booking.pickupLocation}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        LKR {booking.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.selectedSeats.length} passengers
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : booking.status === 'completed'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {allBusBookings.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Bookings for your bus will appear here</p>
                </div>
              )}
            </div>
          )}

          {/* Verify Passengers */}
          {activeTab === 'verify' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Today's Passenger Verification</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, booking ID, or seat..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#fdc106] rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-900" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{booking.passengerName}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span>{booking.passengerPhone}</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Seats: {booking.selectedSeats.join(', ')} • {booking.bookingId}
                          </p>
                          {booking.pickupLocation && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                              <Navigation className="w-3 h-3 mr-1" />
                              Pickup: {booking.pickupLocation}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-bold text-green-600 dark:text-green-400">
                            LKR {booking.totalAmount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.selectedSeats.length} passengers
                          </p>
                        </div>
                        <button
                          onClick={() => handleVerifyPassenger(booking.id)}
                          className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredBookings.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm ? 'No passengers found matching your search' : 'No passengers to verify today'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConductorDashboard;