import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, RotateCcw, MapPin,  Users } from 'lucide-react';

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  const handleDownloadPDF = () => {
    // Create a simple PDF-like content
    const ticketContent = `
      TouchMe+ Bus Ticket
      ==================
      
      Booking ID: ${booking.bookingId}
      Reference: ${booking.referenceId}
      
      Journey Details:
      Bus: ${booking.bus.name}
      Route: ${booking.searchData.from} → ${booking.searchData.to}
      Date: ${new Date(booking.searchData.date).toLocaleDateString()}
      Seats: ${booking.selectedSeats.join(', ')}
      
      Passenger Details:
      Name: ${booking.passengerDetails.name}
      Phone: ${booking.passengerDetails.phone}
      Address: ${booking.passengerDetails.address}
      
      Total Amount: LKR ${booking.totalAmount.toLocaleString()}
      
      Important Instructions:
      - Arrive 15 minutes before departure
      - Carry valid ID proof
      - Keep this ticket for verification
      
      Contact: support@touchmeplus.com
      Phone: +94 11 250 8888
    `;

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TouchMe-Ticket-${booking.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!booking) {
    return (
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">No booking data found.</p>
        <button
          onClick={() => navigate('/search')}
          className="mt-4 bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-6 py-2 rounded-lg"
        >
          Go to Search
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Your bus tickets have been confirmed</p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-8 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fdc106] to-[#e6ad05] text-gray-900 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">TouchMe+ e-Ticket</h2>
              <p className="text-gray-800">Booking ID: {booking.bookingId}</p>
              <p className="text-gray-800">Reference: {booking.referenceId}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-800">Total Amount</p>
              <p className="text-3xl font-bold">LKR {booking.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#fdc106]" />
                Journey Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <span className="text-gray-600 dark:text-gray-400">Bus:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{booking.bus.name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{booking.bus.type}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <span className="text-gray-600 dark:text-gray-400">Route:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {booking.searchData.from} → {booking.searchData.to}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(booking.searchData.date).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <span className="text-gray-600 dark:text-gray-400">Seats:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {booking.selectedSeats.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-[#fdc106]" />
                Passenger Details
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <div className="mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{booking.passengerDetails.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Phone: {booking.passengerDetails.phone}</p>
                    <p>Address: {booking.passengerDetails.address}</p>
                    <p>Passengers: {booking.selectedSeats.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-8 transition-colors">
            <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Important Information:</h4>
            <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
              <li>• Please arrive at the boarding point 15 minutes before departure</li>
              <li>• Carry a valid ID proof for verification</li>
              <li>• Keep this ticket handy for verification during travel</li>
              <li>• For cancellation, contact customer support</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleDownloadPDF}
              className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download Ticket</span>
            </button>
            
            <button 
              onClick={() => navigate('/search')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Book Another Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Support */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transition-colors">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Need Help?</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Contact our customer support for any assistance
        </p>
        <div className="flex justify-center space-x-8 text-sm">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Phone</p>
            <p className="text-[#fdc106]">+94 11 250 8888</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Email</p>
            <p className="text-[#fdc106]">support@touchmeplus.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;