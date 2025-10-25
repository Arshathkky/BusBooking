import React, { useState } from 'react';
import { ArrowLeft, User, UserX, Settings } from 'lucide-react';
import { SearchData, Bus, Booking } from '../App';

interface SeatSelectionProps {
  bus: Bus;
  searchData: SearchData;
  onConfirm: (booking: Booking) => void;
  onBack: () => void;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ bus, searchData, onConfirm, onBack }) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengerDetails, setPassengerDetails] = useState<any[]>([]);

  // Generate seat layout (45 seats for this bus)
  const generateSeats = () => {
    const seats = [];
    const occupiedSeats = new Set([2, 5, 8, 12, 15, 19, 23, 28, 31, 35, 38, 41]); // Mock occupied seats
    
    for (let i = 1; i <= bus.totalSeats; i++) {
      seats.push({
        number: i,
        isOccupied: occupiedSeats.has(i),
        isSelected: selectedSeats.includes(i),
        type: i <= 4 ? 'front' : i <= 16 ? 'middle' : 'back'
      });
    }
    return seats;
  };

  const seats = generateSeats();

  const handleSeatClick = (seatNumber: number) => {
    const seat = seats.find(s => s.number === seatNumber);
    if (seat?.isOccupied) return;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
    } else if (selectedSeats.length < searchData.passengers) {
      setSelectedSeats(prev => [...prev, seatNumber]);
    }
  };

  const handlePassengerDetailChange = (index: number, field: string, value: string) => {
    const newDetails = [...passengerDetails];
    if (!newDetails[index]) {
      newDetails[index] = {};
    }
    newDetails[index][field] = value;
    setPassengerDetails(newDetails);
  };

  const handleConfirmBooking = () => {
    const booking: Booking = {
      bus,
      selectedSeats,
      passengerDetails,
      totalAmount: bus.price * selectedSeats.length
    };
    onConfirm(booking);
  };

  const isFormValid = selectedSeats.length === searchData.passengers && 
    passengerDetails.length === searchData.passengers &&
    passengerDetails.every(p => p.name && p.age && p.gender);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Buses</span>
        </button>
        <div className="text-gray-400">|</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Select Seats</h2>
          <p className="text-gray-600">{bus.name} • {searchData.from} → {searchData.to}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Choose Your Seats</h3>
                <p className="text-sm text-gray-600">
                  {selectedSeats.length} of {searchData.passengers} selected
                </p>
              </div>
              
              {/* Legend */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 border border-red-600 rounded"></div>
                  <span>Occupied</span>
                </div>
              </div>
            </div>

            {/* Bus Layout */}
            <div className="bg-gray-50 rounded-lg p-4 relative">
              {/* Driver Section */}
              <div className="mb-4 flex justify-end">
                <div className="bg-gray-300 w-12 h-8 rounded-t-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-gray-600" />
                </div>
              </div>

              {/* Seats Grid */}
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                {seats.map((seat) => (
                  <div key={seat.number} className="relative">
                    {/* Aisle after seat 2 */}
                    {seat.number % 4 === 2 && (
                      <div className="absolute -right-3 top-0 bottom-0 w-6"></div>
                    )}
                    
                    <button
                      onClick={() => handleSeatClick(seat.number)}
                      disabled={seat.isOccupied}
                      className={`
                        w-12 h-12 rounded-lg border-2 text-xs font-semibold transition-all duration-200
                        ${seat.isOccupied 
                          ? 'bg-red-500 border-red-600 text-white cursor-not-allowed' 
                          : seat.isSelected
                          ? 'bg-blue-500 border-blue-600 text-white transform scale-105'
                          : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300 hover:scale-105'
                        }
                      `}
                    >
                      {seat.isOccupied ? (
                        <UserX className="w-4 h-4 mx-auto" />
                      ) : (
                        <div>
                          {seat.isSelected && <User className="w-4 h-4 mx-auto mb-1" />}
                          <div className="text-xs">{seat.number}</div>
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Details & Summary */}
        <div className="space-y-6">
          {/* Passenger Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Passenger Details</h3>
            
            {selectedSeats.map((seatNumber, index) => (
              <div key={seatNumber} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-semibold text-gray-800">Seat {seatNumber}</span>
                </div>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => handlePassengerDetailChange(index, 'name', e.target.value)}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Age"
                      min="1"
                      max="120"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => handlePassengerDetailChange(index, 'age', e.target.value)}
                    />
                    
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => handlePassengerDetailChange(index, 'gender', e.target.value)}
                    >
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Bus:</span>
                <span className="font-semibold">{bus.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Route:</span>
                <span className="font-semibold">{searchData.from} → {searchData.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {new Date(searchData.date).toLocaleDateString('en-GB')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Seats:</span>
                <span className="font-semibold">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Passengers:</span>
                <span className="font-semibold">{selectedSeats.length}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  LKR {(bus.price * selectedSeats.length).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={!isFormValid}
              className={`w-full py-4 rounded-lg font-bold transition-all duration-200 ${
                isFormValid
                  ? 'bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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

export default SeatSelection;