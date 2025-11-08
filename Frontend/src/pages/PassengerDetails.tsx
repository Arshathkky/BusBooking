import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, MapPin } from "lucide-react";
import {
  useBooking,
  PassengerDetails as PassengerDetailsType,
  BusInfo
} from "../contexts/BookingContext";
import { useSeat } from "../contexts/seatSelectionContext"; // Updated import

// -------------------- Types --------------------
interface Seat {
  seatNumber: number;
  isOccupied: boolean;
  isLadiesOnly?: boolean;
}

interface BusWithSeats extends BusInfo {
  _id?: string;
  seats: Seat[];
}

interface LocationState {
  bus: BusWithSeats;
  selectedSeats: number[];
  searchData: {
    from: string;
    to: string;
    date: string;
  };
  totalAmount: number;
}

const PassengerDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addBooking, loading } = useBooking();
  const { updateSeats } = useSeat(); // Seat context

  const state = location.state as LocationState | undefined;
  const { bus, selectedSeats, searchData, totalAmount } = state || {};

  const [passengerDetails, setPassengerDetails] = useState<PassengerDetailsType>({
    name: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof PassengerDetailsType, value: string) => {
    setPassengerDetails(prev => ({ ...prev, [field]: value }));
  };

  // -------------------- Handle Booking & Seat Update --------------------
  const handleProceedToPayment = async () => {
    if (!bus || !selectedSeats || !searchData) return;

    if (!passengerDetails.name || !passengerDetails.phone || !passengerDetails.address) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setError(null);

      const seatNumbers = selectedSeats.map(String);
      const busId = bus._id || bus.id;
      if (!busId) throw new Error("Missing bus ID");

      // ✅ Create booking
      const newBooking = await addBooking({
        bus: { id: busId, name: bus.name, type: bus.type || "Standard" },
        searchData,
        selectedSeats: seatNumbers,
        totalAmount: totalAmount ?? 0,
        passengerDetails,
        paymentStatus: "Pending",
      });

      if (!newBooking) throw new Error("Failed to create booking.");

      // ✅ Update seat occupancy
      await updateSeats(
        busId,
        selectedSeats.map(num => ({ seatNumber: num, isOccupied: true }))
      );

      // ✅ Navigate to payment page
      navigate("/payment", {
        state: { bus, selectedSeats, searchData, totalAmount, passengerDetails, bookingId: newBooking._id },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("Booking Error:", message);
      setError(message);
    }
  };

  // -------------------- Render fallback --------------------
  if (!bus || !selectedSeats || !searchData) {
    return (
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Invalid booking data. Please start over.
        </p>
        <button
          onClick={() => navigate("/search")}
          className="mt-4 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-6 py-2 rounded-lg"
        >
          Go to Search
        </button>
      </div>
    );
  }

  const isFormValid = passengerDetails.name && passengerDetails.phone && passengerDetails.address;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-[#fdc106] hover:text-[#e6ad05] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Seat Selection</span>
        </button>
        <div className="text-gray-400">|</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Passenger Details
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {bus.name} • {searchData.from} → {searchData.to}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Passenger Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Contact Information
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please provide contact details for all {selectedSeats.length} passengers
            </p>

            <div className="space-y-6">
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={passengerDetails.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={passengerDetails.phone}
                  onChange={e => handleInputChange("phone", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  placeholder="Address"
                  value={passengerDetails.address}
                  onChange={e => handleInputChange("address", e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Booking Summary
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bus:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{bus.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Route:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {searchData.from} → {searchData.to}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(searchData.date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Passengers:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedSeats.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Seats:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedSeats.join(", ")}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  LKR {totalAmount?.toLocaleString() ?? 0}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={!isFormValid || loading}
              className={`w-full py-4 rounded-lg font-bold transition-colors ${
                isFormValid && !loading
                  ? "bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
