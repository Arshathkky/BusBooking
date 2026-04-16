import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, UserX, CircleDot as Steering } from "lucide-react";
import { useSeat } from "../contexts/seatSelectionContext";
import axios from "axios";

// -------------------- Types --------------------

interface SearchData {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

interface OccupiedSeatsResponse {
  success: boolean;
  occupiedSeats: number[];
}

type SeatLayoutType = "2x2" | "2x3";
type LastRowType = 4 | 6;

interface SeatLayoutProps {
  totalSeats: number;
  occupiedSeats: Set<number>;
  heldSeats: Map<number, number>;
  ladiesOnlySeats: Set<number>;
  agentSeatMap: Map<number, string>;
  selectedSeats: number[];
  onSeatClick: (seatNumber: number) => void;
  maxSeats: number;
  seatLayout: SeatLayoutType;
  lastRowSeats: LastRowType;
}



// -------------------- Seat Layout --------------------

const SeatLayout: React.FC<SeatLayoutProps> = ({
  totalSeats,
  occupiedSeats,
  heldSeats,
  ladiesOnlySeats,
  agentSeatMap,
  selectedSeats,
  onSeatClick,
  maxSeats,
  seatLayout,
  lastRowSeats,
}) => {
  const renderSeat = (i: number) => {
    const isOccupied = occupiedSeats.has(i);
    const isHeld = heldSeats.has(i);
    const holdTime = heldSeats.get(i);

    const isLadies = ladiesOnlySeats.has(i);
    const agentId = agentSeatMap.get(i);
    const isAgent = Boolean(agentId);
    const isSelected = selectedSeats.includes(i);

    let style =
      "w-12 h-12 rounded-lg border-2 text-xs font-semibold flex flex-col items-center justify-center transition";

    if (isOccupied) {
      style += " bg-gray-500 text-white cursor-not-allowed";
    } else if (isHeld && !isSelected) {
      style += " bg-orange-300 cursor-not-allowed";
    } else if (isAgent) {
      style += " bg-purple-300 cursor-not-allowed";
    } else if (isLadies) {
      style += isSelected
        ? " bg-yellow-400 cursor-pointer"
        : " bg-pink-300 cursor-pointer";
    } else if (isSelected) {
      style += " bg-yellow-400 cursor-pointer";
    } else {
      style += " bg-gray-200 hover:bg-gray-300 cursor-pointer";
    }

    return (
      <button
        key={i}
        onClick={() => onSeatClick(i)}
        disabled={
          isOccupied ||
          isAgent ||
          (isHeld && !isSelected) ||
          (!isSelected && selectedSeats.length >= maxSeats)
        }
        className={style}
      >
        {isOccupied ? (
          <UserX className="w-4 h-4" />
        ) : isHeld ? (
          <span className="text-[10px]">{holdTime ? `${holdTime}s` : "H"}</span>
        ) : isSelected ? (
          <User className="w-4 h-4" />
        ) : isAgent ? (
          <span className="text-[10px]">{agentId}</span>
        ) : isLadies ? (
          <span className="text-[10px]">L</span>
        ) : null}

        <div className="text-[11px]">{i}</div>
      </button>
    );
  };

  const seats = Array.from({ length: totalSeats }, (_, i) => renderSeat(i + 1));

  const seatsPerRow = seatLayout === "2x2" ? 4 : 5;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-end mb-4">
        <div className="w-16 h-10 bg-gray-300 flex items-center justify-center rounded-t-lg">
          <Steering className="w-6 h-6" />
        </div>
      </div>

      {Array.from({ length: Math.ceil(totalSeats / seatsPerRow) }).map(
        (_, row) => {
          const start = row * seatsPerRow;
          const isLast = row === Math.floor(totalSeats / seatsPerRow);

          const rowSeats = isLast
            ? seats.slice(start, start + lastRowSeats)
            : seats.slice(start, start + seatsPerRow);

          return (
            <div key={row} className="flex justify-center space-x-2 mb-2">
              <div className="flex space-x-1">{rowSeats.slice(0, 2)}</div>
              <div className="w-8" />
              <div className="flex space-x-1">{rowSeats.slice(2)}</div>
            </div>
          );
        }
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 text-sm">
        <Legend color="bg-gray-500" label="Booked" />
        <Legend color="bg-yellow-400" label="Selected" />
        <Legend color="bg-orange-300" label="Held" />
        <Legend color="bg-pink-300" label="Ladies" />
        <Legend color="bg-purple-300" label="Agent" />
      </div>
    </div>
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded ${color}`} />
    <span>{label}</span>
  </div>
);

// -------------------- MAIN --------------------

const HOLD_DURATION = 10 * 60;

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

  const [occupiedSeats, setOccupiedSeats] = useState<Set<number>>(new Set());
  const [heldSeats, setHeldSeats] = useState<Map<number, number>>(new Map());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionId = useRef(
  sessionStorage.getItem("sessionId") ||
  crypto.randomUUID()
);

useEffect(() => {
  sessionStorage.setItem("sessionId", sessionId.current);
}, []);

  // ---------------- FETCH OCCUPIED ----------------
  const fetchOccupied = useCallback(async () => {
    if (!busId || !searchData?.date) return;

    const res = await axios.get<OccupiedSeatsResponse>(
      `https://bus-booking-nt91.onrender.com/api/bookings/occupied-seats`,
      { params: { busId, date: searchData.date } }
    );

    setOccupiedSeats(new Set(res.data.occupiedSeats || []));
  }, [busId, searchData?.date]);

  // ---------------- INIT ----------------
  useEffect(() => {
    if (!busId) return;

    fetchBusSeats(busId);
    fetchOccupied();

    return () => clearSelection();
  }, [busId]);

  // ---------------- TIMER ----------------
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setHeldSeats((prev) => {
        const now = Date.now();
        const updated = new Map(prev);

        for (const [seat, expiry] of updated.entries()) {
          if (expiry <= now) updated.delete(seat);
        }

        return updated;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
      if (!busId) {
        return <p>Invalid Bus ID</p>;
      }
  // ---------------- CLICK SEAT ----------------
  const handleSeatClick = async (seat: number) => {
    if (occupiedSeats.has(seat)) return;
    if (heldSeats.has(seat)) return;

    if (selectedSeats.includes(seat)) {
  deselectSeat(seat);

  // 🔥 RELEASE API CALL
  await axios.post(
    `https://bus-booking-nt91.onrender.com/api/buses/${busId}/release-seats`,
    {
      seatNumbers: [seat],
      sessionId: sessionId.current,
    }
  );

  // 🔥 REFRESH SEATS AFTER RELEASE
   fetchBusSeats(busId);
    } else {
  selectSeat(seat);

  const expiry = Date.now() + HOLD_DURATION * 1000;

  setHeldSeats((prev) => new Map(prev).set(seat, expiry));

  // 🔥 HOLD API CALL
  await axios.post(
    `https://bus-booking-nt91.onrender.com/api/buses/${busId}/hold-seats`,
    {
      busId,
      seatNumbers: [seat],
      sessionId: sessionId.current,
    }
  );

  // 🔥 REFRESH SEATS AFTER HOLD
  fetchBusSeats(busId);
} 
  };

  if (!searchData || !busSeats) return <p>Loading...</p>;

  const ladiesSeats = new Set(
    busSeats.seats.filter((s: any) => s.isLadiesOnly).map((s: any) => s.seatNumber)
  );

  const agentMap = new Map<number, string>();
  busSeats.seats.forEach((s: any) => {
    if (s.isReservedForAgent) agentMap.set(s.seatNumber, s.agentId || "A");
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4">
        <ArrowLeft /> Back
      </button>

      <SeatLayout
        totalSeats={busSeats.totalSeats}
        occupiedSeats={occupiedSeats}
        heldSeats={heldSeats}
        ladiesOnlySeats={ladiesSeats}
        agentSeatMap={agentMap}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
        maxSeats={searchData.passengers}
        seatLayout={busSeats.seatLayout}
        lastRowSeats={busSeats.lastRowSeats}
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
        className="w-full mt-6 py-4 bg-yellow-400 rounded-lg font-bold disabled:bg-gray-300"
      >
        Continue
      </button>
    </div>
  );
};

export default SeatSelection;