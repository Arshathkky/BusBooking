import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, UserX, CircleDot as Steering } from "lucide-react";
import { useSeat } from "../contexts/seatSelectionContext";
import { useBooking } from "../contexts/BookingContext";
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
  reservedSeats?: number[];
}

type SeatLayoutType = "2x2" | "2x3";
type LastRowType = 4 | 6;

interface SeatLayoutProps {
  totalSeats: number;
  occupiedSeats: Set<number>;
  reservedSeats: Set<number>;
  heldSeats: Map<number, number>;
  backendHeldSeats: Set<number>;
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
  reservedSeats,
  heldSeats,
  backendHeldSeats,
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
    const isReserved = reservedSeats.has(i);
    const isHeld = heldSeats.has(i) || backendHeldSeats.has(i);
    const holdTime = heldSeats.get(i);

    const isLadies = ladiesOnlySeats.has(i);
    const agentId = agentSeatMap.get(i);
    const isAgent = Boolean(agentId);
    const isSelected = selectedSeats.includes(i);

    let style =
      "w-12 h-12 rounded-lg border-2 text-xs font-semibold flex flex-col items-center justify-center transition";

    if (isOccupied) {
      // Booked (PAID) → gray
      style += " bg-gray-500 text-white cursor-not-allowed";
    } else if (isSelected) {
      // Current user's selection → yellow (check BEFORE reserved so own seats stay yellow)
      style += " bg-yellow-400 border-yellow-500 cursor-pointer";
    } else if (isReserved) {
      // Reserved by another user (PENDING booking) → orange (NOT gray!)
      style += " bg-orange-400 text-white cursor-not-allowed";
    } else if (isHeld) {
      // Held by another user (before booking) → blue
      style += " bg-blue-300 text-white cursor-not-allowed";
    } else if (isAgent) {
      style += " bg-purple-300 cursor-not-allowed";
    } else if (isLadies) {
      style += " bg-pink-300 cursor-pointer";
    } else {
      style += " bg-gray-200 hover:bg-gray-300 cursor-pointer";
    }

    return (
      <button
        key={i}
        onClick={() => onSeatClick(i)}
        disabled={
          isOccupied ||
          (isReserved && !isSelected) ||
          isAgent ||
          (isHeld && !isSelected) ||
          (!isSelected && selectedSeats.length >= maxSeats)
        }
        className={style}
      >
        {isOccupied ? (
          <UserX className="w-4 h-4" />
        ) : isSelected ? (
          <User className="w-4 h-4" />
        ) : isReserved ? (
          <span className="text-[10px]">R</span>
        ) : isHeld ? (
          <span className="text-[10px]">{holdTime ? `${holdTime}s` : "H"}</span>
        ) : isAgent ? (
          <span className="text-[10px]">{agentId}</span>
        ) : isLadies ? (
          <span className="text-[10px]">L</span>
        ) : null}

        <div className="text-[11px]">{i}</div>
      </button>
    );
  };

  // ---- Compute row structure: last row first, then standard rows ----
  const seatsPerRow = seatLayout === "2x2" ? 4 : 5;
  const leftCols = seatLayout === "2x2" ? 2 : 2;
  const rightCols = seatLayout === "2x2" ? 2 : 3;

  // Fill last row first, then divide the rest into standard rows
  const normalSeatCount = totalSeats - lastRowSeats;
  const normalRowCount = Math.ceil(normalSeatCount / seatsPerRow);

  // Build all seat buttons
  const allSeats = Array.from({ length: totalSeats }, (_, i) => renderSeat(i + 1));

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-end mb-4">
        <div className="w-16 h-10 bg-gray-300 flex items-center justify-center rounded-t-lg">
          <Steering className="w-6 h-6" />
        </div>
      </div>

      {/* Normal rows (2x2 or 2x3) */}
      {Array.from({ length: normalRowCount }).map((_, row) => {
        const start = row * seatsPerRow;
        const end = Math.min(start + seatsPerRow, normalSeatCount);
        const rowSeats = allSeats.slice(start, end);

        return (
          <div key={row} className="flex justify-center space-x-2 mb-2">
            <div className="flex space-x-1">{rowSeats.slice(0, leftCols)}</div>
            <div className="w-8" />
            <div className="flex space-x-1">{rowSeats.slice(leftCols, leftCols + rightCols)}</div>
          </div>
        );
      })}

      {/* Last row (fills across the full width) */}
      {lastRowSeats > 0 && (
        <div key="lastRow" className="flex justify-center space-x-1 mb-2 mt-1 border-t pt-2 border-dashed border-gray-300">
          {allSeats.slice(normalSeatCount, normalSeatCount + lastRowSeats)}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4 text-sm">
        <Legend color="bg-gray-500" label="Booked (Paid)" />
        <Legend color="bg-orange-400" label="Reserved (Pending)" />
        <Legend color="bg-yellow-400" label="Selected" />
        <Legend color="bg-blue-300" label="Held" />
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

const HOLD_DURATION = 15 * 60;

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

  const { addBooking } = useBooking();

  const [occupiedSeats, setOccupiedSeats] = useState<Set<number>>(new Set());
  const [reservedSeats, setReservedSeats] = useState<Set<number>>(new Set());
  const [heldSeats, setHeldSeats] = useState<Map<number, number>>(new Map());
  const [isContinuing, setIsContinuing] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);

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
    setReservedSeats(new Set(res.data.reservedSeats || []));
  }, [busId, searchData?.date]);

  // ---------------- INIT ----------------
  useEffect(() => {
    if (!busId) return;

    fetchBusSeats(busId);
    fetchOccupied();

    // Poll every 5 seconds so other users see reserved/held seats in real-time
    const pollInterval = setInterval(() => {
      fetchOccupied();
      fetchBusSeats(busId);
    }, 5000);

    return () => {
      clearSelection();
      clearInterval(pollInterval);
    };
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
    if (reservedSeats.has(seat)) return;
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

  const backendHeld = new Set(
    busSeats.seats.filter((s: any) => s.isHeld).map((s: any) => s.seatNumber)
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
        reservedSeats={reservedSeats}
        heldSeats={heldSeats}
        backendHeldSeats={backendHeld}
        ladiesOnlySeats={ladiesSeats}
        agentSeatMap={agentMap}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
        maxSeats={searchData.passengers}
        seatLayout={busSeats.seatLayout}
        lastRowSeats={busSeats.lastRowSeats}
      />

      {continueError && (
        <p className="mt-4 text-red-600 text-sm font-medium text-center">{continueError}</p>
      )}

      <button
        disabled={selectedSeats.length !== searchData.passengers || isContinuing}
        onClick={async () => {
          if (!busSeats || !busId) return;
          setContinueError(null);
          setIsContinuing(true);
          try {
            // Create a PENDING booking immediately to lock the seats
            const newBooking = await addBooking({
              bus: {
                id: busSeats.id,
                name: busSeats.name,
                type: busSeats.type,
                busNumber: busSeats.busNumber,
              },
              searchData,
              selectedSeats: selectedSeats.map(String),
              totalAmount: busSeats.price * selectedSeats.length,
              passengerDetails: { name: "", phone: "", address: "", nic: "" },
              paymentStatus: "Pending",
            });

            if (!newBooking) {
              setContinueError("Failed to reserve seats. They may have just been taken. Please try again.");
              // Refresh seats so user sees updated availability
              fetchOccupied();
              fetchBusSeats(busId);
              return;
            }

            navigate("/passenger-details", {
              state: {
                bus: busSeats,
                selectedSeats,
                searchData,
                totalAmount: busSeats.price * selectedSeats.length,
                bookingMongoId: newBooking._id,
                bookingId: newBooking.bookingId,
                referenceId: newBooking.referenceId,
              },
            });
          } catch (err) {
            setContinueError("An error occurred. Please try again.");
          } finally {
            setIsContinuing(false);
          }
        }}
        className="w-full mt-6 py-4 bg-yellow-400 rounded-lg font-bold disabled:bg-gray-300"
      >
        {isContinuing ? "Reserving seats..." : "Continue"}
      </button>
    </div>
  );
};

export default SeatSelection;