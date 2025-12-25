import React, { useState, useMemo, useEffect } from "react";
import { useBooking,} from "../contexts/BookingContext";
import { useAuth } from "../contexts/AuthContext";
import { useConductor } from "../contexts/conductorDataContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

type SeatBookingRow = {
  seat: string | number;
  name: string;
  phone: string;
  address: string;
  nic: string;
  bookingId: string | number;
  referenceId: string;
};

const ConductorDashboard: React.FC = () => {
  const { bookings } = useBooking();
  const { user } = useAuth();
  const { conductors } = useConductor();

  const [paymentFilter, setPaymentFilter] = useState<
    "All" | "Paid" | "Pending" | "Cancelled"
  >("All");

  // Default date is today
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const [assignedBusId, setAssignedBusId] = useState<string | null>(null);

  // Get assigned bus for current conductor
  useEffect(() => {
    if (!user) return;
    const conductor = conductors.find((c) => c.email === user.email);
    setAssignedBusId(conductor?.assignedBusId ?? null);
  }, [user, conductors]);

  // Filter bookings for assigned bus + selected date + payment
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (!assignedBusId) return false;

      if ((b.bus?.id ?? b.bus?.id) !== assignedBusId) return false;

      // Payment filter
      if (paymentFilter !== "All" && b.paymentStatus !== paymentFilter)
        return false;

      // Selected date filter
      const bookingDate = b.searchData?.date || b.createdAt?.split("T")[0];
      if (!bookingDate) return false;
      if (selectedDate && bookingDate !== selectedDate) return false;

      return true;
    });
  }, [bookings, paymentFilter, selectedDate, assignedBusId]);

  // Flatten seat rows
  const seatBookings: SeatBookingRow[] = useMemo(() => {
    return filteredBookings.flatMap((b) =>
      b.selectedSeats.map((seat) => ({
        seat,
        name: b.passengerDetails.name,
        phone: b.passengerDetails.phone,
        address: b.passengerDetails.address,
        nic: b.passengerDetails.nic,
        bookingId: b.bookingId ?? "-",
        referenceId: b.referenceId ?? "-",
      }))
    );
  }, [filteredBookings]);

  // Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(seatBookings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "BookedSeats.xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const columns = [
      "Seat",
      "Passenger Name",
      "Phone",
      "Address",
      "NIC",
      "Booking ID",
      "Reference No",
    ];
    const rows = seatBookings.map((row) => [
      row.seat,
      row.name,
      row.phone,
      row.address,
      row.nic,
      row.bookingId,
      row.referenceId,
    ]);
    doc.autoTable({ head: [columns], body: rows });
    doc.save("BookedSeats.pdf");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Conductor Dashboard</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Date Selector */}
        <div>
          <label className="block font-medium mb-1">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>

        {/* Payment Filter */}
        <div>
          <label className="block font-medium mb-1">Payment Status:</label>
          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(
                e.target.value as "All" | "Paid" | "Pending" | "Cancelled"
              )
            }
            className="border px-2 py-1 rounded"
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Export Excel
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-3">
          Booked Seats ({seatBookings.length})
        </h2>

        {seatBookings.length === 0 ? (
          <p className="text-gray-500">No booked seats found.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="border px-3 py-2">Seat</th>
                <th className="border px-3 py-2">Passenger Name</th>
                <th className="border px-3 py-2">Phone</th>
                <th className="border px-3 py-2">Address</th>
                <th className="border px-3 py-2">NIC</th>
                <th className="border px-3 py-2">Booking ID</th>
                <th className="border px-3 py-2">Reference No</th>
              </tr>
            </thead>
            <tbody>
              {seatBookings.map((row, index) => (
                <tr
                  key={`${row.bookingId}-${row.seat}-${index}`}
                  className="border-b dark:border-gray-700"
                >
                  <td className="border px-3 py-2 font-bold text-blue-600">
                    {row.seat}
                  </td>
                  <td className="border px-3 py-2">{row.name}</td>
                  <td className="border px-3 py-2">{row.phone}</td>
                  <td className="border px-3 py-2">{row.address}</td>
                  <td className="border px-3 py-2">{row.nic}</td>
                  <td className="border px-3 py-2">{row.bookingId}</td>
                  <td className="border px-3 py-2">{row.referenceId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ConductorDashboard;
