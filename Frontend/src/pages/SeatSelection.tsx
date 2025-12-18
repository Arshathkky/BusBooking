import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, UserX, CircleDot as Steering } from "lucide-react";
import { useSeat } from "../contexts/seatSelectionContext";
import axios from "axios";

/* -------------------- Types -------------------- */
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
  agentSeats: Set<number>;
  selectedSeats: number[];
  onSeatClick: (seatNumber: number) => void;
  maxSeats: number;
}

/* -------------------- Seat Layout -------------------- */
const SeatLayout: React.FC<SeatLayoutProps> = ({
  totalSeats,
  occupiedSeats,
  ladiesOnlySeats,
  agentSeats,
  selectedSeats,
  onSeatClick,
  maxSeats,
}) => {
  const seats: JSX.Element[] = [];

  for (let i = 1; i <= totalSeats; i++) {
    const isOccupied = occupiedSeats.has(i);
    const isLadiesOnly = ladiesOnlySeats.has(i);
    const isAgentSeat = agentSeats.has(i);
    const isSelected = selectedSeats.includes(i);

    let seatClass =
      "w-12 h-12 rounded-lg border-2 text-xs font-semibold transition-all duration-200 flex flex-col items-center justify-center ";

    if (isOccupied) {
      seatClass += "bg-gray-400 border-gray-500 text-white cursor-not-allowed";
    } else if (isAgentSeat && !isSelected) {
      seatClass += "bg-purple-300 border-purple-400 text-purple-900 cursor-pointer";
    } else if (isLadiesOnly) {
      seatClass += isSelected
        ? "bg-[#fdc106] border-[#e6ad05] scale-105"
        : "bg-pink-200 border-pink-300 hover:bg-pink-300 cursor-pointer";
    } else if (isSelected) {
      seatClass += "bg-[#fdc106] border-[#e6ad05] scale-105 cursor-pointer";
    } else {
      seatClass += "bg-gray-200 border-gray-300 hover:bg-gray-300 cursor-pointer";
    }

    seats.push(
      <button
        key={i}
        onClick={() => onSeatClick(i)}
        disabled={isOccupied || (!isSelected && selectedSeats.length >= maxSeats)}
        className={seatClass}
      >
        {isOccupied ? (
          <UserX className="w-4 h-4 mb-1" />
        ) : isAgentSeat ? (
          <span className="text-[10px] font-bold">AG</span>
        ) : isSelected ? (
          <User className="w-4 h-4 mb-1" />
        ) : isLadiesOnly ? (
          <span className="text-[10px] font-bold">L</span>
        ) : null}
        <div className="text-[11px]">{i}</div>
      </button>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="mb-6 flex justify-end">
        <div className="bg-gray-300 w-16 h-10 rounded-t-lg flex items-center justify-center">
          <Steering className="w-6 h-6 text-gray-600" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: Math.ceil(totalSeats / 5) }).map((_, row) => (
          <div key={row} className="flex justify-center space-x-2">
            <div className="flex space-x-1">
              {[0, 1, 2].map((o) => {
                const n = row * 5 + o + 1;
                return n <= totalSeats ? seats[n - 1] : null;
              })}
            </div>
            <div className="w-8" />
            <div className="flex space-x-1">
              {[3, 4].map((o) => {
                const n = row * 5 + o + 1;
                return n <= totalSeats ? seats[n - 1] : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------- Seat Selection Page -------------------- */
const HOLD_DURATION = 5 * 60;

const SeatSelection: React.FC = () => {
  const { busId } = useParams<{ busId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state?.searchData as SearchData;

  const {
    busSeats,
    selectedSeats,
    fetchBusSeats,
    selectSeat,
    deselectSeat,
    clearSelection,
  } = useSeat();

  const [dateOccupiedSeats, setDateOccupiedSeats] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* -------------------- Fetch Date-wise Occupied Seats -------------------- */
  const fetchDateBooking = async (busId: string, date: string) => {
    const res = await axios.get(
      "http://localhost:5000/api/bookings/occupied-seats",
      { params: { busId, date } }
    );
    setDateOccupiedSeats(new Set(res.data.occupiedSeats.map(Number)));
  };

  useEffect(() => {
    if (busId) {
      fetchBusSeats(busId);
      if (searchData?.date) fetchDateBooking(busId, searchData.date);
    }
    return () => clearSelection();
  }, [busId, searchData?.date]);

  /* -------------------- Seat Hold Timer -------------------- */
  useEffect(() => {
    if (selectedSeats.length === 1 && timeLeft === null) {
      setTimeLeft(HOLD_DURATION);
    }

    if (selectedSeats.length === 0) {
      setTimeLeft(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [selectedSeats]);

  useEffect(() => {
    if (timeLeft === null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(timerRef.current!);
          alert("Seat hold expired. Please select again.");
          clearSelection();
          navigate(-1);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  if (!searchData || !busSeats) {
    return <p className="text-center mt-8">Loading...</p>;
  }

  const occupiedSeats = new Set([
    ...busSeats.seats.filter((s) => s.isOccupied).map((s) => s.seatNumber),
    ...dateOccupiedSeats,
  ]);

  const ladiesOnlySeats = new Set(
    busSeats.seats.filter((s) => s.isLadiesOnly).map((s) => s.seatNumber)
  );

  const agentSeats = new Set(
    busSeats.seats.filter((s) => s.isReservedForAgent).map((s) => s.seatNumber)
  );

  /* -------------------- Seat Click -------------------- */
  const handleSeatClick = (seat: number) => {
  if (occupiedSeats.has(seat)) return;

  if (selectedSeats.includes(seat)) {
    deselectSeat(seat);
  } else {
    selectSeat(seat);
  }
};


  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#fdc106] mb-4"
      >
        <ArrowLeft /> Back
      </button>

      {timeLeft !== null && (
        <div className="text-center font-bold text-red-600 mb-4">
          Seat hold expires in {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      )}

      <SeatLayout
        totalSeats={busSeats.totalSeats}
        occupiedSeats={occupiedSeats}
        ladiesOnlySeats={ladiesOnlySeats}
        agentSeats={agentSeats}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
        maxSeats={searchData.passengers}
      />

      <button
        disabled={selectedSeats.length !== searchData.passengers}
        onClick={() =>
          navigate("/passenger-details", {
            state: {
              bus: busSeats,
              selectedSeats,
              searchData,
              totalAmount: busSeats.price * selectedSeats.length,
            },
          })
        }
        className="w-full mt-6 py-4 bg-[#fdc106] rounded-lg font-bold disabled:bg-gray-300"
      >
        Continue
      </button>
    </div>
  );
};

export default SeatSelection;
