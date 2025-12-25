import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useBooking } from "../../contexts/BookingContext";
import { useBus } from "../../contexts/busDataContexts";

const BookingOverviewByDate: React.FC = () => {
  const { bookings } = useBooking();
  const { buses } = useBus();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedBusId, setSelectedBusId] = useState<string>("");

  // Convert string to Date for datepicker
  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

  const bookingsByDate = useMemo(() => {
    if (!selectedDate) return [];
    return bookings.filter((b) => b.searchData.date === selectedDate);
  }, [selectedDate, bookings]);

  const busesForDate = useMemo(() => {
    const ids = new Set(bookingsByDate.map((b) => b.bus.id));
    return buses.filter((bus) => ids.has(bus.id));
  }, [bookingsByDate, buses]);

  const selectedBus = buses.find((b) => b.id === selectedBusId);

  const busBookings = useMemo(() => {
    if (!selectedBusId) return [];
    return bookingsByDate.filter((b) => b.bus.id === selectedBusId);
  }, [bookingsByDate, selectedBusId]);

  const totalPassengers = busBookings.reduce(
    (sum, b) => sum + b.selectedSeats.length,
    0
  );

  const totalEarnings = busBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Booking Details by Date
      </h2>

      {/* ---------- Date Picker (Popup Calendar) ---------- */}
      <DatePicker
        selected={selectedDateObj}
        onChange={(date: Date | null) => {
          if (date) {
            const formatted = date.toISOString().split("T")[0];
            setSelectedDate(formatted);
            setSelectedBusId("");
          } else {
            setSelectedDate("");
          }
        }}
        className="p-2 border rounded-lg w-full"
        placeholderText="Select a date"
        dateFormat="yyyy-MM-dd"
      />

      {/* ---------- Bus Dropdown ---------- */}
      {selectedDate && (
        <select
          value={selectedBusId}
          onChange={(e) => setSelectedBusId(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4 mt-4"
        >
          <option value="">Select Bus</option>
          {busesForDate.map((bus) => (
            <option key={bus.id} value={bus.id}>
              {bus.name} ({bus.type}) - {bus.busNumber}
            </option>
          ))}
        </select>
      )}

      {/* No booking message */}
      {selectedDate && bookingsByDate.length === 0 && (
        <p className="text-red-500 font-semibold">No bookings found for this date.</p>
      )}

      {/* ---------- Bus Info ---------- */}
      {selectedBus && (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-bold mb-2">Bus Information</h3>

          <p>
            <strong>Name:</strong> {selectedBus.name}
          </p>
          <p>
            <strong>Type:</strong> {selectedBus.type}
          </p>
          <p>
            <strong>Total Seats:</strong> {selectedBus.totalSeats}
          </p>

          <p>
            <strong>Departure:</strong> {selectedBus.departureTime}
          </p>
          <p>
            <strong>Arrival:</strong> {selectedBus.arrivalTime}
          </p>

          <hr className="my-3" />

          <p>
            <strong>Total Bookings:</strong> {busBookings.length}
          </p>
          <p>
            <strong>Total Passengers:</strong> {totalPassengers}
          </p>
          <p>
            <strong>Total Earnings:</strong> Rs. {totalEarnings}
          </p>
        </div>
      )}

      {/* ---------- Passenger List ---------- */}
      {busBookings.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Passenger List</h3>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">NIC No</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Seats</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Payment</th>
              </tr>
            </thead>
            <tbody>
              {busBookings.map((b) => (
                <tr key={b._id} className="text-center">
                  <td className="p-2 border">{b.passengerDetails.name}</td>
                  <td className="p-2 border">{b.passengerDetails.phone}</td>
                  <td className="p-2 border">{b.passengerDetails.nic}</td>
                  <td className="p-2 border">{b.selectedSeats.join(", ")}</td>
                  <td className="p-2 border">Rs. {b.totalAmount}</td>
                  <td className="p-2 border">{b.paymentStatus || "Pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Seat Layout ---------- */}
      {selectedBus && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3">Seat Layout</h3>

          <div className="grid gap-2">
            {Array.from(
              { length: Math.ceil(selectedBus.seats.length / 5) },
              (_, rowIndex) => (
                <div key={rowIndex} className="flex justify-center space-x-2">
                  {[0, 1, 2].map((i) => {
                    const seat = selectedBus.seats[rowIndex * 5 + i];
                    if (!seat) return null;

                    const isBooked = busBookings.some((b) =>
                      b.selectedSeats.includes(seat.seatNumber.toString())
                    );

                    return (
                      <div
                        key={seat.seatNumber}
                        className={`w-12 h-12 flex items-center justify-center rounded-lg border text-sm font-bold
                          ${
                            isBooked
                              ? "bg-red-400 text-white"
                              : seat.isLadiesOnly
                              ? "bg-pink-300"
                              : "bg-gray-200 dark:bg-gray-600"
                          }
                        `}
                      >
                        {seat.seatNumber}
                      </div>
                    );
                  })}

                  <div className="w-8" />

                  {[3, 4].map((i) => {
                    const seat = selectedBus.seats[rowIndex * 5 + i];
                    if (!seat) return null;

                    const isBooked = busBookings.some((b) =>
                      b.selectedSeats.includes(seat.seatNumber.toString())
                    );

                    return (
                      <div
                        key={seat.seatNumber}
                        className={`w-12 h-12 flex items-center justify-center rounded-lg border text-sm font-bold
                          ${
                            isBooked
                              ? "bg-red-400 text-white"
                              : seat.isLadiesOnly
                              ? "bg-pink-300"
                              : "bg-gray-200 dark:bg-gray-600"
                          }
                        `}
                      >
                        {seat.seatNumber}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingOverviewByDate;
