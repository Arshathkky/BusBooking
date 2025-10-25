import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin } from 'lucide-react';

const PassengerDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, selectedSeats, searchData, totalAmount } = location.state || {};

  const [passengerDetails, setPassengerDetails] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setPassengerDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleProceedToPayment = () => {
    if (passengerDetails.name && passengerDetails.phone && passengerDetails.address) {
      navigate('/payment', {
        state: {
          bus,
          selectedSeats,
          searchData,
          totalAmount,
          passengerDetails
        }
      });
    }
  };

  if (!bus || !selectedSeats || !searchData) {
    return (
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Invalid booking data. Please start over.</p>
        <button
          onClick={() => navigate('/search')}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Passenger Details</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {bus.name} • {searchData.from} → {searchData.to}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Passenger Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>
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
                  onChange={(e) => handleInputChange('name', e.target.value)}
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
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  placeholder="Address"
                  value={passengerDetails.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  required
                />
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Important Note:</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                These contact details will be used for all passengers in this booking. 
                Please ensure the information is accurate for ticket confirmation and travel updates.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
            
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
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedSeats.join(', ')}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  LKR {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={!isFormValid}
              className={`w-full py-4 rounded-lg font-bold transition-colors ${
                isFormValid
                  ? 'bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;