import React, { useEffect, useState } from "react";
import { Users, DollarSign, Calendar, Bus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useBooking } from "../contexts/BookingContext";
import { useBus } from "../contexts/busDataContexts";
import { useConductor } from "../contexts/conductorDataContext";

// -------------------- Types --------------------
interface BusType {
  id: string;
  name: string;
  type?: string;
}

interface PassengerDetails {
  name: string;
  phone: string;
}

interface SearchData {
  from: string;
  to: string;
  date: string;
}

interface Booking {
  _id?: string;
  passengerDetails: PassengerDetails;
  selectedSeats: string[];
  totalAmount: number;
  searchData: SearchData;
  bus: BusType;
}

// -------------------- Component --------------------
const ConductorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { bookings } = useBooking();
  const { buses } = useBus();
  const { conductors } = useConductor();

  const [assignedBus, setAssignedBus] = useState<BusType | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);

  // -------------------- Find assigned bus --------------------
  useEffect(() => {
    if (!user) return;

    // get conductor from context
    const currentConductor = conductors.find((c) => c.email === user.email);
    const busId = currentConductor?.assignedBusId;

    if (busId && buses.length > 0) {
      const bus = buses.find((b) => b.id === busId);
      setAssignedBus(bus || null);
    } else {
      setAssignedBus(null);
    }
  }, [user, conductors, buses]);

  // -------------------- Filter today's bookings --------------------
  useEffect(() => {
    if (!assignedBus) {
      setTodayBookings([]);
      return;
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const busBookings = bookings.filter(
      (b) => b.bus.id === assignedBus.id && b.searchData.date === today
    );

    setTodayBookings(busBookings);
  }, [assignedBus, bookings]);

  // -------------------- Stats --------------------
  const totalPassengers = todayBookings.reduce(
    (sum, b) => sum + b.selectedSeats.length,
    0
  );

  const totalEarnings = todayBookings.reduce(
    (sum, b) => sum + b.totalAmount,
    0
  );

  // -------------------- Render --------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Conductor Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome, {user?.name || "Conductor"}!
        </p>
      </div>

      {/* Assigned Bus */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        {assignedBus ? (
          <div>
            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <Bus className="text-yellow-500" /> {assignedBus.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Type: {assignedBus.type || "-"}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No assigned bus found.</p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Today's Bookings</p>
            <h3 className="text-2xl font-bold">{todayBookings.length}</h3>
          </div>
          <Calendar className="text-yellow-500 w-8 h-8" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Passengers</p>
            <h3 className="text-2xl font-bold">{totalPassengers}</h3>
          </div>
          <Users className="text-yellow-500 w-8 h-8" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Earnings (LKR)</p>
            <h3 className="text-2xl font-bold">{totalEarnings.toLocaleString()}</h3>
          </div>
          <DollarSign className="text-yellow-500 w-8 h-8" />
        </div>
      </div>

      {/* Today's Bookings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Today's Bookings ({todayBookings.length})
        </h2>

        {todayBookings.length === 0 ? (
          <p className="text-gray-500">No bookings found for today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3">Passenger Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-3 font-medium">{booking.passengerDetails.name}</td>
                    <td className="px-4 py-3">{booking.passengerDetails.phone}</td>
                    <td className="px-4 py-3">{booking.searchData.from}</td>
                    <td className="px-4 py-3">{booking.searchData.to}</td>
                    <td className="px-4 py-3">{booking.selectedSeats.join(", ")}</td>
                    <td className="px-4 py-3 text-right font-semibold">{booking.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConductorDashboard;
