import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  Download,
  RotateCcw,
  MapPin,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";
import axios from "axios";

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [booking, setBooking] = useState<any>(location.state?.booking);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState<string | null>(null);

  const status = searchParams.get("status");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const fetchBookingByNumericId = async (id: string) => {
      try {
        setLoading(true);
        // Parse the booking ID (it might have a timestamp suffix)
        const cleanId = id.split("_")[0];
        const baseUrl = import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api";
        
        // We need a backend route to fetch by numeric bookingId or we search all and filter
        // For now, let's assume we have a way to fetch it. 
        // If not, we might need to add a route /api/bookings/numeric/:id
        const { data } = await axios.get(`${baseUrl}/bookings`);
        if (data.success) {
          const found = data.bookings.find((b: any) => String(b.bookingId) === cleanId);
          if (found) {
            setBooking(found);
          } else {
            setError("Booking not found.");
          }
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    if (!booking && orderId) {
      fetchBookingByNumericId(orderId);
    } else if (!booking && !orderId) {
      setLoading(false);
    }
  }, [booking, orderId]);

  /* -------------------- DOWNLOAD TICKET -------------------- */
  /* -------------------- PRINT TICKET -------------------- */
  const handlePrint = () => {
    window.print();
  };

  /* -------------------- LOADING -------------------- */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#fdc106] animate-spin mb-4" />
        <p className="text-gray-600">Verifying your booking...</p>
      </div>
    );
  }

  /* -------------------- FAILURE -------------------- */
  if (status === "FAILED" || error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-8">
          {error || "We could not process your payment. Please try again or contact support."}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="bg-[#fdc106] px-6 py-3 rounded-lg font-bold"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/search")}
            className="text-gray-600 hover:underline"
          >
            Return to Search
          </button>
        </div>
      </div>
    );
  }

  /* -------------------- FALLBACK -------------------- */
  if (!booking) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-600">No booking data found.</p>
        <button
          onClick={() => navigate("/search")}
          className="mt-4 bg-[#fdc106] px-6 py-2 rounded-lg"
        >
          Go to Search
        </button>
      </div>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <style>
        {`
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .shadow-2xl { shadow: none !important; border: 1px solid #eee; }
            .bg-gradient-to-r { background: #fdc106 !important; -webkit-print-color-adjust: exact; }
          }
          .print-only { display: none; }
        `}
      </style>

      {/* Success Header */}
      <div className="text-center mb-8 no-print">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 text-lg">
          Your bus tickets have been confirmed
        </p>
      </div>

      {/* Ticket Card */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[#fdc106] to-[#e6ad05] p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">TouchMe+ e-Ticket</h2>
              <p>Booking No: {booking.bookingId}</p>
              <p>Reference: {booking.referenceId}</p>
            </div>
            <div className="text-right">
              <p>Total Amount</p>
              <p className="text-3xl font-bold">
                LKR {booking.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Journey */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-[#fdc106]" />
              Journey Details
            </h3>
            <div className="space-y-2">
              <p><b>Bus:</b> {booking.bus.name}</p>
              <p><b>Bus Number:</b> {booking.bus.busNumber}</p>
              <p><b>Type:</b> {booking.bus.type}</p>
              <p><b>Route:</b> {booking.searchData.from} → {booking.searchData.to}</p>
              <p>
                <b>Date:</b>{" "}
                {new Date(booking.searchData.date).toLocaleDateString("en-GB")}
              </p>
              <p><b>Seats:</b> {booking.selectedSeats.join(", ")}</p>
            </div>
          </div>

          {/* Passenger */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#fdc106]" />
              Passenger Details
            </h3>
            <div className="space-y-2">
              <p><b>Name:</b> {booking.passengerDetails.name}</p>
              <p><b>Phone:</b> {booking.passengerDetails.phone}</p>
              <p><b>Address:</b> {booking.passengerDetails.address}</p>
              <p><b>NIC:</b> {booking.passengerDetails.nic}</p>
              <p><b>Passengers:</b> {booking.selectedSeats.length}</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-yellow-50 p-4 mx-8 mb-8 rounded-lg">
          <h4 className="font-bold mb-2">Important Information</h4>
          <ul className="text-sm space-y-1">
            <li>• Arrive 15 minutes before departure</li>
            <li>• Keep this ticket for verification</li>
            <li>• Contact support for cancellation</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pb-8 no-print">
          <button
            onClick={handlePrint}
            className="bg-[#fdc106] px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#e6ad05] transition-colors"
          >
            <Download className="w-5 h-5" /> Print Ticket (PDF)
          </button>

          <button
            onClick={() => navigate("/search")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" /> Book Another Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
