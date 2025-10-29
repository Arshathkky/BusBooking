import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, UserX, Printer as Steering } from 'lucide-react';
import { useSeat } from '../contexts/seatSelectionContext';

// --------------------
// Types
// --------------------
interface SearchData {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

interface SeatLayoutProps {
  totalSeats: number;
  occupiedSeats: Set<number>;
  ladiesOnlySeats: Set<number>;
  selectedSeats: number[];
  onSeatClick: (seatNumber: number) => void;
  maxSeats: number;
}

// --------------------
// Seat Layout Component
// --------------------
const SeatLayout: React.FC<SeatLayoutProps> = ({
  totalSeats,
  occupiedSeats,
  ladiesOnlySeats,
  selectedSeats,
  onSeatClick,
  maxSeats,
}) => {
  const seats: JSX.Element[] = [];

  for (let i = 1; i <= totalSeats; i++) {
    const isOccupied = occupiedSeats.has(i);
    const isLadiesOnly = ladiesOnlySeats.has(i);
    const isSelected = selectedSeats.includes(i);

    let seatClass =
      'w-12 h-12 rounded-lg border-2 text-xs font-semibold transition-all duration-200 cursor-pointer ';

    if (isOccupied) {
      seatClass += 'bg-gray-400 border-gray-500 text-white cursor-not-allowed';
    } else if (isSelected) {
      seatClass += 'bg-[#fdc106] border-[#e6ad05] text-gray-900 transform scale-105';
    } else if (isLadiesOnly) {
      seatClass +=
        'bg-pink-200 dark:bg-pink-800 border-pink-300 dark:border-pink-700 text-pink-800 dark:text-pink-200 hover:bg-pink-300 dark:hover:bg-pink-700';
    } else {
      seatClass +=
        'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500';
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
      <div className="mb-6 flex justify-end">
        <div className="bg-gray-300 dark:bg-gray-600 w-16 h-10 rounded-t-lg flex items-center justify-center">
          <Steering className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: Math.ceil(totalSeats / 5) }, (_, rowIndex) => (
          <div key={rowIndex} className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              {[0, 1, 2].map((seatOffset) => {
                const seatNumber = rowIndex * 5 + seatOffset + 1;
                return seatNumber <= totalSeats ? seats[seatNumber - 1] : null;
              })}
            </div>
            <div className="w-8"></div>
            <div className="flex space-x-1">
              {[3, 4].map((seatOffset) => {
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

// --------------------
// Seat Selection Page
// --------------------
const SeatSelection: React.FC = () => {
  const { busId } = useParams<{ busId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state?.searchData as SearchData;

  const { busSeats, selectedSeats, fetchBusSeats, selectSeat, deselectSeat, clearSelection } = useSeat();

  useEffect(() => {
    if (busId) fetchBusSeats(busId);
    return () => clearSelection();
  }, [busId, fetchBusSeats, clearSelection]);

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

  if (!busSeats) return <p className="text-center mt-6">Loading bus data...</p>;

  const occupiedSeats = new Set<number>(busSeats.seats.filter((s) => s.isOccupied).map((s) => s.seatNumber));
  const ladiesOnlySeats = new Set<number>(busSeats.seats.filter((s) => s.isLadiesOnly).map((s) => s.seatNumber));

  // ✅ Fixed ESLint warning here
  const handleSeatClick = (seatNumber: number) => {
    if (occupiedSeats.has(seatNumber)) return;

    if (selectedSeats.includes(seatNumber)) {
      deselectSeat(seatNumber);
    } else {
      selectSeat(seatNumber);
    }
  };

  const handleProceedToDetails = () => {
    if (selectedSeats.length === searchData.passengers) {
      navigate('/passenger-details', {
        state: {
          bus: busSeats,
          selectedSeats,
          searchData,
          totalAmount: busSeats.price * selectedSeats.length,
        },
      });
    }
  };

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
            {busSeats.name} • {searchData.from} → {searchData.to}
          </p>
        </div>
      </div>

      {/* Seat Layout */}
      <SeatLayout
        totalSeats={busSeats.totalSeats}
        occupiedSeats={occupiedSeats}
        ladiesOnlySeats={ladiesOnlySeats}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
        maxSeats={searchData.passengers}
      />

      {/* Continue Button */}
      <button
        onClick={handleProceedToDetails}
        disabled={selectedSeats.length !== searchData.passengers}
        className={`w-full py-4 mt-6 rounded-lg font-bold transition-colors ${
          selectedSeats.length === searchData.passengers
            ? 'bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900'
            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        }`}
      >
        Continue to Passenger Details
      </button>
    </div>
  );
};

export default SeatSelection;
