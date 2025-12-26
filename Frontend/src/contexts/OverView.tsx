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
    <div className="space-y-6">
      {/* -------------------- Filters -------------------- */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
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

      {/* -------------------- Additional Stats -------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-12 h-12 text-indigo-500" />}
        />
        <StatCard
          title="Bus Owners"
          value={stats.totalOwners}
          icon={<Users className="w-12 h-12 text-teal-500" />}
        />
        <StatCard
          title="Total Buses"
          value={stats.totalBuses}
          icon={<BusIcon className="w-12 h-12 text-orange-500" />}
        />
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
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);
