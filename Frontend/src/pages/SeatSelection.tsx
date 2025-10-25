import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, UserX, Printer as Steering } from 'lucide-react';

interface SeatLayoutProps {
  totalSeats: number;
  occupiedSeats: Set<number>;
  ladiesOnlySeats: Set<number>;
  selectedSeats: number[];
  onSeatClick: (seatNumber: number) => void;
  maxSeats: number;
}

const SeatLayout: React.FC<SeatLayoutProps> = ({
  totalSeats,
  occupiedSeats,
  ladiesOnlySeats,
  selectedSeats,
  onSeatClick,
  maxSeats
}) => {
  const seats = [];
  
  for (let i = 1; i <= totalSeats; i++) {
    const isOccupied = occupiedSeats.has(i);
    const isLadiesOnly = ladiesOnlySeats.has(i);
    const isSelected = selectedSeats.includes(i);
    
    let seatClass = 'w-12 h-12 rounded-lg border-2 text-xs font-semibold transition-all duration-200 cursor-pointer ';
    
    if (isOccupied) {
      seatClass += 'bg-gray-400 border-gray-500 text-white cursor-not-allowed';
    } else if (isSelected) {
      seatClass += 'bg-[#fdc106] border-[#e6ad05] text-gray-900 transform scale-105';
    } else if (isLadiesOnly) {
      seatClass += 'bg-pink-200 dark:bg-pink-800 border-pink-300 dark:border-pink-700 text-pink-800 dark:text-pink-200 hover:bg-pink-300 dark:hover:bg-pink-700';
    } else {
      seatClass += 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500';
    }

    seats.push(
      <button
        key={i}
        onClick={() => onSeatClick(i)}
        disabled={isOccupied || (selectedSeats.length >= maxSeats && !isSelected)}
        className={seatClass}
      >
        {isOccupied ? (
          <UserX className="w-4 h-4 mx-auto" />
        ) : (
          <div>
            {isSelected && <User className="w-3 h-3 mx-auto mb-1" />}
            <div className="text-xs">{i}</div>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 relative transition-colors">
      {/* Driver Section */}
      <div className="mb-6 flex justify-end">
        <div className="bg-gray-300 dark:bg-gray-600 w-16 h-10 rounded-t-lg flex items-center justify-center">
          <Steering className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </div>
      </div>

      {/* Seats Grid - Driver side 3 seats, Opposite side 2 seats */}
      <div className="space-y-3">
        {Array.from({ length: Math.ceil(totalSeats / 5) }, (_, rowIndex) => (
          <div key={rowIndex} className="flex items-center justify-center space-x-2">
            {/* Driver side - 3 seats */}
            <div className="flex space-x-1">
              {[0, 1, 2].map(seatOffset => {
                const seatNumber = rowIndex * 5 + seatOffset + 1;
                return seatNumber <= totalSeats ? seats[seatNumber - 1] : null;
              })}
            </div>
            
            {/* Aisle */}
            <div className="w-8"></div>
            
            {/* Opposite side - 2 seats */}
            <div className="flex space-x-1">
              {[3, 4].map(seatOffset => {
                const seatNumber = rowIndex * 5 + seatOffset + 1;
                return seatNumber <= totalSeats ? seats[seatNumber - 1] : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SeatSelection: React.FC = () => {
  const { busId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state?.searchData;

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  // Mock bus data
  const bus = {
    id: busId,
    name: 'Express Luxury',
    type: 'AC Sleeper',
    totalSeats: 45,
    price: 1250
  };

  const occupiedSeats = new Set([2, 5, 8, 12, 15, 19, 23, 28, 31, 35, 38, 41]);
  // Continuous ladies seats - groups of 2-3 seats together
  const ladiesOnlySeats = new Set([1, 3, 6, 7, 11, 12, 16, 17, 21, 22, 26, 27, 32, 33, 37, 38, 42, 43]);

  const handleSeatClick = (seatNumber: number) => {
    if (occupiedSeats.has(seatNumber)) return;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
    } else if (selectedSeats.length < searchData?.passengers) {
      setSelectedSeats(prev => [...prev, seatNumber]);
    }
  };

  const handleProceedToDetails = () => {
    if (selectedSeats.length === searchData?.passengers) {
      navigate('/passenger-details', { 
        state: { 
          bus, 
          selectedSeats, 
          searchData,
          totalAmount: bus.price * selectedSeats.length
        } 
      });
    }
  };

  if (!searchData) {
    return (
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">No search data found. Please search for buses first.</p>
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/search')}
          className="flex items-center space-x-2 text-[#fdc106] hover:text-[#e6ad05] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Search</span>
        </button>
        <div className="text-gray-400">|</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Seats</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {bus.name} • {searchData.from} → {searchData.to}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Choose Your Seats</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedSeats.length} of {searchData.passengers} selected
                </p>
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-[#fdc106] border border-[#e6ad05] rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Occupied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-pink-200 dark:bg-pink-800 border border-pink-300 dark:border-pink-700 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Ladies Only</span>
                </div>
              </div>
            </div>

            <SeatLayout
              totalSeats={bus.totalSeats}
              occupiedSeats={occupiedSeats}
              ladiesOnlySeats={ladiesOnlySeats}
              selectedSeats={selectedSeats}
              onSeatClick={handleSeatClick}
              maxSeats={searchData.passengers}
            />
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
                <span className="font-semibold text-gray-900 dark:text-white">{searchData.passengers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Selected Seats:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  LKR {(bus.price * selectedSeats.length).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToDetails}
              disabled={selectedSeats.length !== searchData.passengers}
              className={`w-full py-4 rounded-lg font-bold transition-colors ${
                selectedSeats.length === searchData.passengers
                  ? 'bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue to Passenger Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;