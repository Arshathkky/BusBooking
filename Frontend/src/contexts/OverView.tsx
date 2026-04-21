import React, { useState } from "react";
import { Users, Bus as BusIcon,  Calendar, DollarSign } from "lucide-react";
import { useBus } from "../contexts/busDataContexts";
import { useBooking } from "../contexts/BookingContext";

const Overview: React.FC = () => {
  const { buses } = useBus();
  const { bookings } = useBooking();

  // -------------------- Filters --------------------
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const [selectedOwner, setSelectedOwner] = useState<string | "all">("all");
  const [selectedBus, setSelectedBus] = useState<string | "all">("all");
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // -------------------- Filtered Bookings --------------------
  const filteredBookings = bookings.filter((b) => {
    const ownerMatch =
      selectedOwner === "all" ||
      buses.find((bus) => bus.id === b.bus.id)?.ownerId === selectedOwner;

    const busMatch = selectedBus === "all" || b.bus.id === selectedBus;

    const dateMatch = selectedDate === "all" || b.searchData.date === selectedDate;

    return ownerMatch && busMatch && dateMatch;
  });

  // -------------------- Stats --------------------
  const totalPassengers = filteredBookings.reduce(
    (sum, b) => sum + b.selectedSeats.length,
    0
  );

  const totalEarnings = filteredBookings.reduce(
    (sum, b) => sum + b.totalAmount,
    0
  );

  const activeBuses = buses.filter((b) => b.status === "active");

  const users = bookings.flatMap((b) => [b.passengerDetails]);

  const owners = buses
    .map((b) => ({ id: b.ownerId, name: b.companyName }))
    .filter((v, i, a) => a.findIndex((o) => o.id === v.id) === i);

  const stats = {
    totalUsers: users.length,
    totalOwners: owners.length,
    totalBuses: buses.length,
    activeBuses: activeBuses.length,
    totalBookings: filteredBookings.length,
    totalPassengers,
    totalEarnings,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* -------------------- Filters -------------------- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest hidden md:block">Analytics Filter</h3>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Owner Filter */}
        <select
          className="border p-2 rounded"
          value={selectedOwner}
          onChange={(e) => setSelectedOwner(e.target.value)}
        >
          <option value="all">All Owners</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>

        {/* Bus Filter */}
        <select
          className="border p-2 rounded"
          value={selectedBus}
          onChange={(e) => setSelectedBus(e.target.value)}
        >
          <option value="all">All Buses</option>
          {buses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <input
          type="date"
          className="border p-2 rounded"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* -------------------- Stats Cards -------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={<Calendar className="w-12 h-12 text-blue-500" />}
        />
        <StatCard
          title="Total Earnings"
          value={`LKR ${stats.totalEarnings.toLocaleString()}`}
          icon={<DollarSign className="w-12 h-12 text-green-500" />}
        />
        <StatCard
          title="Active Buses"
          value={stats.activeBuses}
          icon={<BusIcon className="w-12 h-12 text-[#fdc106]" />}
        />
        <StatCard
          title="Total Passengers"
          value={stats.totalPassengers}
          icon={<Users className="w-12 h-12 text-purple-500" />}
        />
      </div>

      </div>

      {/* -------------------- Analysis Progress Bars -------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {/* Active Bus Ratio */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Fleet Utilization</h4>
           <div className="flex justify-between items-end mb-2">
             <span className="text-3xl font-black">{stats.activeBuses} <span className="text-lg text-gray-400 font-medium">/ {stats.totalBuses}</span></span>
             <span className="text-sm font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">{stats.totalBuses > 0 ? Math.round((stats.activeBuses/stats.totalBuses)*100) : 0}% Active</span>
           </div>
           <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
             <div className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${stats.totalBuses > 0 ? (stats.activeBuses/stats.totalBuses)*100 : 0}%` }}></div>
           </div>
           <p className="text-[11px] text-gray-400 mt-3 font-medium">Higher fleet utilization indicates better operational efficiency.</p>
        </div>

        {/* User to Passenger Conversion (Rough Metric) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Passenger Engagement</h4>
           <div className="flex justify-between items-end mb-2">
             <span className="text-3xl font-black">{stats.totalPassengers}</span>
             <span className="text-sm font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">Passengers</span>
           </div>
           <div className="flex gap-2">
             <div className="flex-1 bg-yellow-50 dark:bg-gray-700 rounded-xl p-3 border border-yellow-100 dark:border-gray-600">
               <p className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold uppercase mb-1">Total Bookings</p>
               <p className="text-xl font-black text-gray-900 dark:text-white">{stats.totalBookings}</p>
             </div>
             <div className="flex-1 bg-blue-50 dark:bg-gray-700 rounded-xl p-3 border border-blue-100 dark:border-gray-600">
               <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Avg per Booking</p>
               <p className="text-xl font-black text-gray-900 dark:text-white">{stats.totalBookings > 0 ? (stats.totalPassengers / stats.totalBookings).toFixed(1) : 0}</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;

// -------------------- StatCard Component --------------------
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-md transition-shadow group relative overflow-hidden">
    <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
      {icon}
    </div>
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center shadow-inner">
        {icon}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white mt-1 leading-none">{value}</p>
    </div>
  </div>
);
