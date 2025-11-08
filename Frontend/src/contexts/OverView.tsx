import React from 'react';
import { Users, Bus, CheckCircle, Calendar, DollarSign } from 'lucide-react';
//import { useRouteData } from '../contexts/RouteDataContext';
import { useBus } from '../contexts/busDataContexts';
import { useBooking } from '../contexts/BookingContext';

const Overview: React.FC = () => {
  //const { routes } = useRouteData();
  const { buses } = useBus();
  const { bookings, todayBookings, totalPassengersToday, totalEarningsToday } = useBooking();

  // If you have users from DataContext
  // const { users } = useData(); 
  // For demo, let's assume users are from bookings:
  const users = bookings.map(b => b.passengerDetails);

  const pendingOwners = []; // You can replace with your logic if needed
  const allOwners = [];     // You can replace with your logic if needed

  const stats = {
    totalUsers: users.length,
    totalOwners: allOwners.length,
    pendingApprovals: pendingOwners.length,
    totalBuses: buses.length,
    activeBuses: buses.filter(b => b.status === 'active').length,
    totalBookingsToday: todayBookings.length,
    totalPassengersToday,
    totalEarningsToday
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'pending': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
  //     case 'approved': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
  //     case 'rejected': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
  //     default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
  //   }
  // };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Bookings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBookingsToday}</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        {/* Today's Earnings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Earnings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                LKR {stats.totalEarningsToday.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Active Buses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Buses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeBuses}</p>
            </div>
            <Bus className="w-12 h-12 text-[#fdc106]" />
          </div>
        </div>

        {/* Today's Passengers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Passengers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPassengersToday}</p>
            </div>
            <Users className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
            <Users className="w-12 h-12 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bus Owners</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalOwners}</p>
            </div>
            <Users className="w-12 h-12 text-teal-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingApprovals}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Buses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBuses}</p>
            </div>
            <Bus className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
