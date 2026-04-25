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
  const { updatePaymentStatus } = useBooking();

  const {
    bus,
    selectedSeats,
    searchData,
    totalAmount,
    busNumber,
    passengerDetails,
    bookingMongoId,
    bookingId,
    referenceId,
  } = location.state || {};

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Setup PayHere callbacks on mount
    window.payhere.onCompleted = async function onCompleted(orderId: string) {
      console.log("Payment completed. OrderID:" + orderId);
      
      try {
        // Fallback status update for local testing where notify_url might not be reachable
        await updatePaymentStatus(bookingMongoId, "Paid");
      } catch (error) {
        console.error("Local status update failed:", error);
      }

      navigate("/booking-confirmation", {
        state: {
          booking: {
            bookingMongoId,
            bookingId,
            referenceId,
            bus,
            selectedSeats,
            searchData,
            totalAmount,
            busNumber,
            passengerDetails,
            paymentStatus: "Paid",
            bookingDate: new Date().toISOString(),
          },
        },
      });
    };

    window.payhere.onDismissed = function onDismissed() {
      console.log("Payment dismissed");
      setProcessing(false);
    };

    window.payhere.onError = function onError(error: any) {
      console.error("Payment Error:", error);
      alert("Payment failed. Please try again.");
      setProcessing(false);
    };
  }, [bookingMongoId, bookingId, referenceId, bus, selectedSeats, searchData, totalAmount, busNumber, passengerDetails, navigate, updatePaymentStatus]);

  const handlePayment = async () => {
    if (!bookingMongoId || !bookingId) {
      alert("Booking ID missing. Cannot proceed.");
      return;
    }

    setProcessing(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      
      // 1. Fetch payment hash from backend
      const response = await fetch(`${baseUrl}/bookings/payhere/hash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: bookingId,
          amount: totalAmount,
          currency: "LKR",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to generate payment hash");
      }

      const { hash, merchant_id } = data;

      // 2. Setup PayHere object
      const firstName = passengerDetails.name.split(' ')[0] || "Passenger";
      const lastName = passengerDetails.name.split(' ').slice(1).join(' ') || "Name";

      const paymentObj = {
        sandbox: false,
        merchant_id: merchant_id,
        return_url: window.location.origin + "/booking-confirmation",
        cancel_url: window.location.origin + "/payment",
        notify_url: "https://bus-booking-nt91.onrender.com/api/bookings/payhere/notify",
        order_id: bookingId,
        items: `Bus Booking - ${bus.name}`,
        amount: Number(totalAmount).toFixed(2),
        currency: "LKR",
        hash: hash,
        first_name: firstName,
        last_name: lastName,
        email: "passenger@example.com", // PayHere requires an email
        phone: passengerDetails.phone,
        address: passengerDetails.address,
        city: "Colombo",
        country: "Sri Lanka",
      };

      // 3. Start Payment
      window.payhere.startPayment(paymentObj);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Could not start payment. Please check your connection and try again.");
      setProcessing(false);
    }
  };

  const handleTestPayment = async () => {
    if (!bookingMongoId || !bookingId) {
      alert("Booking ID missing. Cannot proceed.");
      return;
    }

    setProcessing(true);
    try {
      await updatePaymentStatus(bookingMongoId, "Paid");
      navigate("/booking-confirmation", {
        state: {
          booking: {
            bookingMongoId,
            bookingId,
            referenceId,
            bus,
            selectedSeats,
            searchData,
            totalAmount,
            busNumber,
            passengerDetails,
            paymentStatus: "Paid",
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
  if (!bus || !selectedSeats || !searchData || !passengerDetails || !bookingId) {
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
            Booking No: <b>{bookingId}</b> • Ref: <b>{referenceId}</b>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Options Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold">PayHere Gateway</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              You will be redirected to the secure PayHere payment gateway to complete your transaction. You can pay using your Credit/Debit Card, Mobile Wallet, or Internet Banking.
            </p>

            <div className="flex gap-4 items-center justify-center py-6 border rounded-lg bg-gray-50">
               {/* Display PayHere supported methods logos if desired, or just text */}
               <span className="font-semibold text-gray-500">Secured by PayHere</span>
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
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-4 rounded-lg font-bold transition-colors ${
              !processing
                ? "bg-[#fdc106] hover:bg-[#e6ad05]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {processing ? "Starting Payment..." : `Pay LKR ${totalAmount} with PayHere`}
          </button>

          <button
            onClick={handleTestPayment}
            disabled={processing}
            className={`w-full mt-4 py-4 rounded-lg font-bold transition-colors border-2 ${
              !processing
                ? "border-gray-800 text-gray-800 hover:bg-gray-100"
                : "border-gray-300 text-gray-400 cursor-not-allowed"
            }`}
          >
            Simulate Test Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
