import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useBooking } from "../contexts/BookingContext";

declare global {
  interface Window {
    payhere: any;
  }
}

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addBooking, updatePaymentStatus } = useBooking();

  const {
    bus,
    selectedSeats,
    searchData,
    totalAmount,
    busNumber,
    passengerDetails,
    pickupLocation,
  } = location.state || {};

  const [processing, setProcessing] = useState(false);
  const [existingBookingId, setExistingBookingId] = useState<string | null>(null);

  const handlePayment = async (method: string = "genie") => {
    setProcessing(true);

    try {
      let currentBookingId = existingBookingId;

      if (!currentBookingId) {
        // 1. Create Booking First (Status: PENDING)
        const newBooking = await addBooking({
          bus: { id: bus._id || bus.id, name: bus.name, type: bus.type || "Standard", busNumber: bus.busNumber },
          searchData,
          selectedSeats: selectedSeats.map(String),
          totalAmount,
          passengerDetails,
          pickupLocation,
          paymentStatus: "PENDING",
        });

        if (!newBooking) throw new Error("Failed to create booking.");
        currentBookingId = String(newBooking.bookingId);
        setExistingBookingId(currentBookingId);
      }

      const baseUrl = import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api";

      // 2. Initiate Genie Payment via Backend
      const response = await fetch(`${baseUrl}/genie/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: currentBookingId,
          amount: totalAmount,
          customerDetails: {
            name: passengerDetails.name,
            phone: passengerDetails.phone,
            email: passengerDetails.email || "passenger@example.com"
          },
          paymentMethod: method
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to initiate Genie payment");
      }

      // 3. Redirect to Genie Payment URL
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("Genie payment URL not found in response");
      }
    } catch (error: any) {
      console.error("Genie Payment failed:", error);
      alert(error.message || "Could not start payment. Please try again.");
      setProcessing(false);
    }
  };

  const handleTestPayment = async () => {
    setProcessing(true);
    try {
      // 1. Create Booking First
      const newBooking = await addBooking({
        bus: { id: bus._id || bus.id, name: bus.name, type: bus.type || "Standard", busNumber: bus.busNumber },
        searchData,
        selectedSeats: selectedSeats.map(String),
        totalAmount,
        passengerDetails,
        pickupLocation,
        paymentStatus: "PENDING",
      });

      if (!newBooking) throw new Error("Failed to create booking.");

      if (newBooking._id) {
        await updatePaymentStatus(newBooking._id, "PAID");
      }
      
      navigate("/booking-confirmation", {
        state: {
          booking: {
            bookingMongoId: newBooking._id,
            bookingId: newBooking.bookingId,
            referenceId: newBooking.referenceId,
            bus,
            selectedSeats,
            searchData,
            totalAmount,
            busNumber: newBooking.bus.busNumber,
            passengerDetails,
            paymentStatus: "PAID",
            bookingDate: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error("Test payment failed:", error);
      alert("Test payment failed. Please try again.");
      setProcessing(false);
    }
  };

  // -------------------- Fallback --------------------
  if (!bus || !selectedSeats || !searchData || !passengerDetails) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-600">Invalid booking data. Please start over.</p>
        <button
          onClick={() => navigate("/search")}
          className="mt-4 bg-[#fdc106] px-6 py-2 rounded-lg"
        >
          Go to Search
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-[#fdc106] hover:text-[#e6ad05] transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Details</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold">Secure Checkout</h2>
          <p className="text-gray-600">
            Please complete the payment to finalize your booking
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Options Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold">Genie by Dialog</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              You will be redirected to the secure Genie payment gateway to complete your transaction. You can pay using your Genie Wallet, Credit/Debit Card, or Internet Banking.
            </p>

            <div className="flex gap-4 items-center justify-center py-6 border rounded-lg bg-gray-50">
               <span className="font-semibold text-gray-500">Secured by Genie</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
          <h3 className="text-lg font-bold mb-4">Payment Summary</h3>

          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Passenger:</span>
              <span className="font-semibold">{passengerDetails.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Bus:</span>
              <span className="font-semibold">{bus.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Seats ({selectedSeats.length}):</span>
              <span className="font-semibold">{selectedSeats.join(", ")}</span>
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-green-600">
                LKR {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => handlePayment("genie")}
            disabled={processing}
            className={`w-full py-4 rounded-lg font-bold transition-colors ${
              !processing
                ? "bg-[#fdc106] hover:bg-[#e6ad05]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {processing ? "Redirecting..." : `Pay LKR ${totalAmount} with Genie`}
          </button>

          <button
            onClick={handleTestPayment}
            disabled={processing}
            className={`w-full mt-4 py-4 rounded-lg font-medium transition-colors text-gray-500 hover:text-gray-700 text-xs`}
          >
            Simulate Test Payment (Internal)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
