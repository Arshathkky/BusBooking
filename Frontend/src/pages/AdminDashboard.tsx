import React, { useState } from 'react';
import { Users, Bus, CheckCircle, XCircle, CreditCard as Edit, Trash2, Plus, DollarSign, Calendar,  } from 'lucide-react';
import { useRouteData } from '../contexts/RouteDataContext';
import AddRouteModal from '../components/AddRouteModal';
import AddUserModal from '../components/AddUserModal';

import { useBus } from '../contexts/busDataContexts';
import { useData } from '../contexts/DataContext';

const AdminDashboard: React.FC = () => {
  type TabKey = 'overview' | 'owners' | 'buses' | 'routes' | 'users';

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const { routes,   deleteRoute } = useRouteData();
  const {  users, bookings, updateUser, deleteUser, getTodayStats } = useData();
const {buses} = useBus();
  const pendingOwners = users.filter(u => u.role === 'owner' && u.status === 'pending');
  const allOwners = users.filter(u => u.role === 'owner');
  const todayStats = getTodayStats();
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.bookingDate === today);

  const stats = {
    totalUsers: users.length,
    totalOwners: allOwners.length,
    pendingApprovals: pendingOwners.length,
    totalBuses: buses.length,
    activeBuses: buses.filter(b => b.status === 'active').length,
    ...todayStats
  };

  const handleApproveOwner = (userId: string) => {
    updateUser(userId, { status: 'active' });
  };

  const handleRejectOwner = (userId: string) => {
    updateUser(userId, { status: 'suspended' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
      case 'approved': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'rejected': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Complete system management and oversight</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 transition-colors">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'owners', label: 'Bus Owners' },
            { key: 'buses', label: 'Buses' },
            { key: 'routes', label: 'Routes' },
            { key: 'users', label: 'Users' }
          ].map(tab => (
            <button
              key={tab.key}
             onClick={() => setActiveTab(tab.key as TabKey)}

              className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'text-[#fdc106] border-b-2 border-[#fdc106]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Earnings</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    LKR {stats.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Buses</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeBuses}</p>
                </div>
                <Bus className="w-12 h-12 text-[#fdc106]" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Passengers</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPassengers}</p>
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

          {/* Today's Bookings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Today's Bookings</h3>
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{todayBookings.length}</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Total Bookings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    LKR {todayBookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200">Today's Revenue</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {todayBookings.reduce((sum, b) => sum + b.selectedSeats.length, 0)}
                  </p>
                  <p className="text-sm text-purple-800 dark:text-purple-200">Passengers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#fdc106]">
                    {buses.filter(b => b.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">Active Buses</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {todayBookings.slice(0, 5).map((booking) => {
                const bus = buses.find(b => b.id === booking.busId);
                const route = routes.find(r => r.id === booking.routeId);
                return (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{booking.passengerName}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {bus?.name} • {route?.startPoint} → {route?.endPoint}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Seats: {booking.selectedSeats.join(', ')} • {booking.bookingId}
                      </p>
                      {booking.pickupLocation && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.passengerPhone}
                      </p>
                    </div>
                  </div>
                );
              })}
              {todayBookings.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No bookings today</p>
              )}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pending Owner Approvals</h3>
            <div className="space-y-4">
              {pendingOwners.slice(0, 3).map((owner) => (
                <div key={owner.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{owner.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{owner.email} • {owner.phone}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Registered: {new Date(owner.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApproveOwner(owner.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectOwner(owner.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent System Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-gray-700 dark:text-gray-300">New bus owner registration: Rajesh Kumar</p>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-gray-700 dark:text-gray-300">Bus "Express Luxury" approved for operation</p>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">4 hours ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-gray-700 dark:text-gray-300">Route modification request submitted</p>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bus Owners Tab */}
      {activeTab === 'owners' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bus Owner Management</h3>
            <button
                onClick={() => setShowAddUserModal(true)}
                className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Owner</span>
              </button>

          </div>

          <div className="grid gap-4">
            {allOwners.map((owner) => (
              <div key={owner.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#fdc106] rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-900" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{owner.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{owner.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {owner.phone} • {owner.address}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Registered: {new Date(owner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(owner.status)}`}>
                      {owner.status.charAt(0).toUpperCase() + owner.status.slice(1)}
                    </span>
                    {owner.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveOwner(owner.id)}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejectOwner(owner.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteUser(owner.id)}
                      className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Route Management</h3>
            <button 
              onClick={() => setShowAddRouteModal(true)}
              className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Route</span>
            </button>
          </div>
          
          <div className="grid gap-4">
            {routes.map((route) => (
              <div key={route.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{route.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {route.startPoint} → {route.endPoint} • {route.distance}km • {route.duration}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(route.status)}`}>
                    {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteRoute(route.id)}
                    className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h3>
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
          
          <div className="grid gap-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{user.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email} • {user.phone} • {user.role}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buses Tab */}
      {activeTab === 'buses' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bus Management</h3>
          </div>
          
          <div className="grid gap-4">
            {buses.map((bus) => (
              <div key={bus.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{bus.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {bus.type} • {bus.totalSeats} seats • LKR {bus.price}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bus.status)}`}>
                    {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddRouteModal && (
        <AddRouteModal onClose={() => setShowAddRouteModal(false)} />
      )}
      
      {showAddUserModal && (
        <AddUserModal onClose={() => setShowAddUserModal(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;