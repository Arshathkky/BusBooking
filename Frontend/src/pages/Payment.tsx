import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, Lock } from 'lucide-react';

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, selectedSeats, searchData, totalAmount, passengerDetails } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [processing, setProcessing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const bookingId = `TM${Date.now().toString().slice(-6)}`;
      const referenceId = `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      navigate('/booking-confirmation', {
        state: {
          booking: {
            bookingId,
            referenceId,
            bus,
            selectedSeats,
            searchData,
            totalAmount,
            passengerDetails,
            paymentStatus: 'success',
            bookingDate: new Date().toISOString()
          }
        }
      });
    }, 3000);
  };

  if (!bus || !selectedSeats || !searchData || !passengerDetails) {
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

  const isFormValid = cardDetails.cardNumber && cardDetails.expiryDate && cardDetails.cvv && cardDetails.cardholderName;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-[#fdc106] hover:text-[#e6ad05] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Details</span>
        </button>
        <div className="text-gray-400">|</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Secure Payment</h2>
          <p className="text-gray-600 dark:text-gray-400">Complete your booking payment</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Secure Payment</h3>
              <Lock className="w-4 h-4 text-gray-400" />
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Method</h4>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-[#fdc106] bg-[#fdc106] bg-opacity-10'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Credit Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('debit')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === 'debit'
                      ? 'border-[#fdc106] bg-[#fdc106] bg-opacity-10'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Debit Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('mobile')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    paymentMethod === 'mobile'
                      ? 'border-[#fdc106] bg-[#fdc106] bg-opacity-10'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="w-6 h-6 mx-auto mb-2 bg-gray-700 dark:bg-gray-300 rounded"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Mobile Pay</span>
                </button>
              </div>
            </div>

            {/* Card Details Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardDetails.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fdc106] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-green-800 dark:text-green-200 text-sm">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Summary</h3>
            
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
                <span className="text-gray-600 dark:text-gray-400">Passengers:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedSeats.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Seats:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedSeats.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{passengerDetails.name}</span>
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
              onClick={handlePayment}
              disabled={!isFormValid || processing}
              className={`w-full py-4 rounded-lg font-bold transition-colors ${
                isFormValid && !processing
                  ? 'bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                `Pay LKR ${totalAmount.toLocaleString()}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;