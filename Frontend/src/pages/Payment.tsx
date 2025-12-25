import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock } from "lucide-react";
import { useBooking } from "../contexts/BookingContext";

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updatePaymentStatus } = useBooking();

  // ✅ MUST MATCH PassengerDetails navigate() keys
  const {
    bus,
    selectedSeats,
    searchData,
    totalAmount,
    busNumber,
    passengerDetails,
    bookingMongoId, // ✅ FIXED
    bookingId,
    referenceId,
  } = location.state || {};

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [processing, setProcessing] = useState(false);

  // -------------------- Input Handlers --------------------
  const handleCardNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    setCardDetails((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setCardDetails((prev) => ({ ...prev, expiryDate: digits }));
  };

  const handleCvvChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 3);
    setCardDetails((prev) => ({ ...prev, cvv: digits }));
  };

  // -------------------- Handle Payment --------------------
  const handlePayment = async () => {
    if (!bookingMongoId) {
      alert("Booking ID missing. Cannot proceed.");
      return;
    }

    setProcessing(true);

    try {
      // 🔹 Simulate payment gateway delay
      await new Promise((res) => setTimeout(res, 1000));

      // 🔹 Update payment status in backend
      await updatePaymentStatus(bookingMongoId, "Paid");
      console.log("Booking created successfully!");
          console.log("Booking ID:", bookingId);
          console.log("Reference ID:",referenceId);

      // 🔹 Navigate to confirmation page
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
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // -------------------- Form Validation --------------------
  const isFormValid =
    cardDetails.cardholderName &&
    cardDetails.cardNumber.replace(/\s/g, "").length === 16 &&
    cardDetails.expiryDate.length === 4 &&
    cardDetails.cvv.length === 3;

  // -------------------- Fallback --------------------
  if (!bus || !selectedSeats || !searchData || !passengerDetails || !bookingId) {
    return (
      <div className="text-center">
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-[#fdc106]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Details</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold">Secure Payment</h2>
          <p className="text-gray-600">
            Booking No: <b>{bookingId}</b> • Ref: <b>{referenceId}</b>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold">Credit / Debit Card</h3>
              <Lock className="w-4 h-4 text-gray-400" />
            </div>

            <input
              placeholder="Cardholder Name"
              value={cardDetails.cardholderName}
              onChange={(e) =>
                setCardDetails((prev) => ({
                  ...prev,
                  cardholderName: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border rounded-lg mb-4"
            />

            <input
              placeholder="1234 5678 9012 3456"
              value={cardDetails.cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-4"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="MMYY"
                value={cardDetails.expiryDate}
                onChange={(e) => handleExpiryChange(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />
              <input
                placeholder="CVV"
                value={cardDetails.cvv}
                onChange={(e) => handleCvvChange(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Payment Summary</h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Bus:</span>
              <span className="font-semibold">{bus.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Seats:</span>
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
            disabled={!isFormValid || processing}
            className={`w-full py-4 rounded-lg font-bold ${
              isFormValid && !processing
                ? "bg-[#fdc106] hover:bg-[#e6ad05]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {processing ? "Processing..." : `Pay LKR ${totalAmount}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
