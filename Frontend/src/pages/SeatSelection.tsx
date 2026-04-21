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
  ladiesOnlySeats: Set<number>;
  conductorSeatMap: Map<number, string>;
  selectedSeats: number[];
  onSeatClick: (seatNumber: number) => void;
  maxSeats: number;
  seatLayout: SeatLayoutType;
  seatNumberingType?: "driver_side" | "door_side";
  lastRowSeats: LastRowType;
  seatsData: any[]; // 👈 Array of SeatType objects
}



// -------------------- Seat Layout --------------------

const SeatLayout: React.FC<SeatLayoutProps> = ({
  totalSeats,
  occupiedSeats,
  reservedSeats,
  ladiesOnlySeats,
  conductorSeatMap,
  selectedSeats,
  onSeatClick,
  maxSeats,
  seatLayout,
  seatNumberingType = "driver_side",
  lastRowSeats,
  seatsData,
}) => {
  const renderSeat = (i: number) => {
    const seatObj = seatsData.find(s => s.seatNumber === i);
    const isOccupied = occupiedSeats.has(i);
    const isReserved = reservedSeats.has(i);
    const isLadies = ladiesOnlySeats.has(i);
    const conductorId = conductorSeatMap.get(i);
    const isConductor = Boolean(conductorId);
    const isSelected = selectedSeats.includes(i);
    
    // Check if outside online range 👈 NEW
    const isBlockedForOnline = seatObj && seatObj.isOnline === false;

    let style =
      "w-12 h-12 rounded-lg border-2 text-xs font-semibold flex flex-col items-center justify-center transition";

    if (isOccupied) {
      style += " bg-gray-500 text-white cursor-not-allowed";
    } else if (isSelected) {
      style += " bg-yellow-400 border-yellow-500 cursor-pointer";
    } else if (isReserved) {
      style += " bg-orange-400 text-white cursor-not-allowed";
    } else if (isConductor) {
      style += " bg-purple-300 cursor-not-allowed";
    } else if (isBlockedForOnline) {
      // Manual Booking Only 👈 NEW
      style += " bg-red-100 text-red-700 border-red-200 cursor-not-allowed";
    } else if (isLadies) {
      style += " bg-pink-300 cursor-pointer text-pink-900";
    } else {
      style += " bg-white border-gray-300 hover:bg-yellow-50 cursor-pointer text-gray-700";
    }

    return (
      <button
        key={i}
        onClick={() => onSeatClick(i)}
        disabled={
          isOccupied ||
          (isReserved && !isSelected) ||
          isConductor ||
          isBlockedForOnline || 
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
        ) : isConductor ? (
          <span className="text-[10px]">{conductorId}</span>
        ) : isBlockedForOnline ? (
          <span className="text-[10px] uppercase font-bold text-red-500">M</span>
        ) : isLadies ? (
          <span className="text-[10px]">L</span>
        ) : null}

        <div className="text-[11px] font-bold">{i}</div>
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
    <div className="bg-gray-50 p-6 rounded-3xl shadow-lg border border-gray-100">
      {/* Legend at Top */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <Legend color="bg-gray-500" label="Booked (Paid)" />
        <Legend color="bg-orange-400" label="Reserved (Pending)" />
        <Legend color="bg-yellow-400" label="Selected" />
        <Legend color="bg-pink-300" label="Ladies Only" />
        <Legend color="bg-purple-300" label="Conductor" />
        <Legend color="bg-red-100 border-red-200" label="Manual Only (Blocked)" />
        <Legend color="bg-white border-gray-200" label="Available" />
      </div>

      <div className="flex justify-end mb-4">
        <div className="w-20 h-10 bg-gray-200 flex items-center justify-center rounded-t-2xl shadow-inner">
          <Steering className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* Normal rows (2x2 or 2x3) */}
      {Array.from({ length: normalRowCount }).map((_, row) => {
        const start = row * seatsPerRow;
        const end = Math.min(start + seatsPerRow, normalSeatCount);
        let rowSeats = allSeats.slice(start, end);

        // If numbering starts from door side, visually reverse the row
        if (seatNumberingType === "door_side") {
          rowSeats = [...rowSeats].reverse();
        }

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
          {seatNumberingType === "door_side" 
            ? [...allSeats.slice(normalSeatCount, normalSeatCount + lastRowSeats)].reverse()
            : allSeats.slice(normalSeatCount, normalSeatCount + lastRowSeats)
          }
        </div>
      )}
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
  const [isContinuing, setIsContinuing] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);

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

  // ---------------- CLICK SEAT ----------------
  const handleSeatClick = async (seat: number) => {
    if (occupiedSeats.has(seat)) return;
    if (reservedSeats.has(seat)) return;

    if (selectedSeats.includes(seat)) {
      deselectSeat(seat);
    } else {
      selectSeat(seat);
    }
  };

  if (!searchData || !busSeats) return <p>Loading...</p>;

  const ladiesSeats = new Set(
    busSeats.seats.filter((s: any) => s.isLadiesOnly).map((s: any) => s.seatNumber)
  );

  const conductorMap = new Map<number, string>();
  busSeats.seats.forEach((s: any) => {
    if (s.isReservedForConductor) conductorMap.set(s.seatNumber, s.conductorId || "A");
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
        ladiesOnlySeats={ladiesSeats}
        conductorSeatMap={conductorMap}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
        maxSeats={searchData.passengers}
        seatLayout={busSeats.seatLayout}
        seatNumberingType={busSeats.seatNumberingType}
        lastRowSeats={busSeats.lastRowSeats}
        seatsData={busSeats.seats}
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