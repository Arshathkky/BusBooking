import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Download,
  RotateCcw,
  MapPin,
  Users,
} from "lucide-react";

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;

  /* -------------------- DOWNLOAD TICKET -------------------- */
  const handleDownloadPDF = () => {
    if (!booking) return;

    const ticketContent = `
TouchMe+ Bus Ticket
==================

Booking No: ${booking.bookingId}
Reference ID: ${booking.referenceId}

Journey Details
---------------
Bus: ${booking.bus.name}
Bus Number: ${booking.bus.busNumber}
Type: ${booking.bus.type}
Route: ${booking.searchData.from} → ${booking.searchData.to}
Date: ${new Date(booking.searchData.date).toLocaleDateString("en-GB")}
Seats: ${booking.selectedSeats.join(", ")}

Passenger Details
-----------------
Name: ${booking.passengerDetails.name}
Phone: ${booking.passengerDetails.phone}
Address: ${booking.passengerDetails.address}
NIC: ${booking.passengerDetails.nic}

Total Amount: LKR ${booking.totalAmount.toLocaleString()}

Important Instructions
----------------------
• Arrive 15 minutes before departure
• Keep this ticket for verification

Support: support@touchmeplus.com
Phone: +94 11 250 8888
`;

    const blob = new Blob([ticketContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TouchMe-Ticket-${booking.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* -------------------- FALLBACK -------------------- */
  if (!booking) {
    return (
      <div className="text-center">
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
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
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
        <div className="flex justify-center gap-4 pb-8">
          <button
            onClick={handleDownloadPDF}
            className="bg-[#fdc106] px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <Download className="w-5 h-5" /> Download Ticket
          </button>

          <button
            onClick={() => navigate("/search")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Book Another Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
