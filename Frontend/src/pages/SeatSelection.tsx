import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, UserX, CircleDot as Steering } from "lucide-react";
import { useSeat, Seat, SeatLayoutType, LastRowType } from "../contexts/seatSelectionContext";
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
  occupiedSeats: (string | number)[];
  reservedSeats?: (string | number)[];
  blockedSeats?: (string | number)[];
  offlineSeats?: (string | number)[];
}


interface SeatLayoutProps {
  totalSeats: number;
  occupiedSeats: Set<string | number>;
  reservedSeats: Set<string | number>;
  blockedSeats: Set<string | number>;
  offlineSeats: Set<string | number>;
  ladiesOnlySeats: Set<string | number>;
  conductorSeatMap: Map<string | number, string>;
  selectedSeats: (string | number)[];
  onSeatClick: (seatNumber: string | number) => void;
  maxSeats: number;
  seatLayout: SeatLayoutType;
  seatNumberingType?: "driver_side" | "door_side";
  lastRowSeats: LastRowType;
  seatsData: Seat[]; // Array of Seat objects
  useCustomLayout?: boolean; // 👈 NEW
}



// -------------------- Seat Layout --------------------

const SeatLayout: React.FC<SeatLayoutProps> = ({
  totalSeats,
  occupiedSeats,
  reservedSeats,
  blockedSeats,
  offlineSeats,
  ladiesOnlySeats,
  conductorSeatMap,
  selectedSeats,
  onSeatClick,
  maxSeats,
  seatLayout,
  seatNumberingType = "driver_side",
  lastRowSeats,
  seatsData,
  useCustomLayout,
}) => {
  // Optimization: Map seat status and objects for O(1) lookup
  const seatMap = new Map();
  seatsData.forEach(s => seatMap.set(String(s.seatNumber), s));

  const renderSeat = (
    seatId: string | number,
    isOccupied: boolean,
    isReserved: boolean,
    isSelected: boolean,
    isLadies: boolean,
    isConductor: boolean,
    conductorId?: string
  ) => {
    const seatObj = seatMap.get(String(seatId));

    // NEW: Advanced Operational Flags
    const sid = String(seatId);
    const isPermanent = (seatObj && seatObj.isPermanent === true) || blockedSeats.has(sid) || blockedSeats.has(seatId);
    const isOwnerBlocked = (seatObj && seatObj.isBlocked === true);
    const isBlockedForOnline = (seatObj && seatObj.isOnline === false) || offlineSeats.has(sid) || offlineSeats.has(seatId);

    let style =
      "w-12 h-12 rounded-lg border-2 text-xs font-semibold flex flex-col items-center justify-center transition";

    if (isPermanent) {
      style += " bg-red-900 border-red-950 text-white cursor-not-allowed opacity-40 shadow-inner";
    } else if (isOccupied) {
      style += " bg-gray-500 text-white cursor-not-allowed";
    } else if (isSelected) {
      style += " bg-yellow-400 border-yellow-500 cursor-pointer";
    } else if (isReserved) {
      style += " bg-orange-400 text-white cursor-not-allowed";
    } else if (isConductor) {
      style += " bg-purple-300 cursor-not-allowed";
    } else if (isOwnerBlocked || isBlockedForOnline) {
      // Manual Booking Only 👈
      style += " bg-red-100 text-red-700 border-red-200 cursor-not-allowed";
    } else if (isLadies) {
      style += " bg-pink-300 cursor-pointer text-pink-900";
    } else {
      style += " bg-white border-gray-300 hover:bg-yellow-50 cursor-pointer text-gray-700";
    }

    return (
      <button
        key={String(seatId)}
        onClick={() => !isPermanent && !isOccupied && !isReserved && !isConductor && !isOwnerBlocked && !isBlockedForOnline && onSeatClick(seatId)}
        disabled={
          isPermanent ||
          isOccupied ||
          (isReserved && !isSelected) ||
          isConductor ||
          isOwnerBlocked ||
          isBlockedForOnline ||
          (!isSelected && selectedSeats.length >= maxSeats)
        }
        className={style}
      >
        {isPermanent ? (
          <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-md">
            <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
        ) : isOccupied ? (
          <UserX className="w-4 h-4" />
        ) : isSelected ? (
          <User className="w-4 h-4" />
        ) : isReserved ? (
          <span className="text-[10px]">R</span>
        ) : isConductor ? (
          <span className="text-[10px] uppercase font-bold">{conductorId?.slice(0, 2)}</span>
        ) : (isOwnerBlocked || isBlockedForOnline) ? (
          <span className="text-[10px] uppercase font-black text-red-500 opacity-50">M</span>
        ) : isLadies ? (
          <span className="text-[10px]">L</span>
        ) : null}

        <div className="text-[11px] font-bold">{seatId}</div>
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

  return (
    <div className="bg-gray-50 p-6 rounded-3xl shadow-lg border border-gray-100">
      {/* Legend at Top */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <Legend color="bg-gray-500" label="Booked (Paid)" />
        {/* <Legend color="bg-orange-400" label="Reserved (Pending)" /> */}
        <Legend color="bg-yellow-400" label="Selected" />
        <Legend color="bg-pink-300" label="Ladies Only" />
        {/* <Legend color="bg-purple-300" label="Conductor" />
        <Legend color="bg-red-900 border-red-950" label="Blocked (Permanent)" />
        <Legend color="bg-red-100 border-red-200" label="Manual Only (Blocked)" />
        <Legend color="bg-white border-gray-200" label="Available" /> */}
      </div>

      {/* Main Layout Area */}
      {useCustomLayout ? (
        <div className="relative mx-auto border-[12px] border-gray-100 rounded-[60px] bg-white p-12 pt-20 shadow-inner" style={{ width: 'fit-content' }}>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex justify-between w-full px-16 text-gray-300">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] mt-2">Passenger Entry</div>
            <Steering className="w-8 h-8" />
          </div>

          <div
            className="grid gap-2.5"
            style={{
              gridTemplateColumns: `repeat(6, 50px)`,
              gridTemplateRows: `repeat(15, 50px)`
            }}
          >
            {(() => {
              const gridMap = new Map();
              seatsData.forEach(s => gridMap.set(`${s.x},${s.y}`, s));

              return Array.from({ length: 15 * 6 }).map((_, i) => {
                const x = i % 6;
                const y = Math.floor(i / 6);
                const seat = gridMap.get(`${x},${y}`);

                if (!seat) return <div key={i} className="w-[50px] h-[50px]" />;

                const sid = String(seat.seatNumber);
                const isOccupied = occupiedSeats.has(sid) || occupiedSeats.has(seat.seatNumber);
                const isReserved = reservedSeats.has(sid) || reservedSeats.has(seat.seatNumber);
                const isSelected = selectedSeats.includes(seat.seatNumber);
                const isLadies = seat.isLadiesOnly;
                const conductorId = conductorSeatMap.get(seat.seatNumber);
                const isConductor = Boolean(conductorId);

                return renderSeat(seat.seatNumber, isOccupied, isReserved, isSelected, isLadies, isConductor, conductorId);
              });
            })()}
          </div>
        </div>
      ) : (
        <>
          {/* Standard Auto Layout */}
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 px-10">
             <span>Door Side</span>
             <span>River Side</span>
          </div>
          <div className="flex justify-end mb-4">
            <div className="w-20 h-10 bg-gray-200 flex items-center justify-center rounded-t-2xl shadow-inner">
              <Steering className="w-6 h-6 text-gray-400" />
            </div>
          </div>

          {Array.from({ length: normalRowCount }).map((_, row) => {
            const start = row * seatsPerRow;
            const end = Math.min(start + seatsPerRow, normalSeatCount);
            // Here we need to map over standard indices and calculate occupancy
            const standardRowIndices = Array.from({ length: end - start }, (_, idx) => start + idx + 1);

            let rowSeats = standardRowIndices.map(num => {
              const sid = String(num);
              const isOccupied = occupiedSeats.has(sid) || occupiedSeats.has(num);
              const isReserved = reservedSeats.has(sid) || reservedSeats.has(num);
              const isSelected = selectedSeats.includes(num);
              const isLadies = ladiesOnlySeats.has(num);
              const conductorId = conductorSeatMap.get(num);
              const isConductor = Boolean(conductorId);
              return renderSeat(num, isOccupied, isReserved, isSelected, isLadies, isConductor, conductorId);
            });

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

          {lastRowSeats > 0 && (
            <div key="lastRow" className="flex justify-center space-x-1 mb-2 mt-1 border-t pt-2 border-dashed border-gray-300">
              {(() => {
                const lastRowIndices = Array.from({ length: lastRowSeats }, (_, i) => normalSeatCount + i + 1);
                let rowSeats = lastRowIndices.map(num => {
                  const sid = String(num);
                  const isOccupied = occupiedSeats.has(sid) || occupiedSeats.has(num);
                  const isReserved = reservedSeats.has(sid) || reservedSeats.has(num);
                  const isSelected = selectedSeats.includes(num);
                  const isLadies = ladiesOnlySeats.has(num);
                  const conductorId = conductorSeatMap.get(num);
                  const isConductor = Boolean(conductorId);
                  return renderSeat(num, isOccupied, isReserved, isSelected, isLadies, isConductor, conductorId);
                });

                return seatNumberingType === "door_side" ? rowSeats.reverse() : rowSeats;
              })()}
            </div>
          )}
        </>
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

  const [occupiedSeats, setOccupiedSeats] = useState<Set<string | number>>(new Set());
  const [reservedSeats, setReservedSeats] = useState<Set<string | number>>(new Set());
  const [blockedSeats, setBlockedSeats] = useState<Set<string | number>>(new Set());
  const [offlineSeats, setOfflineSeats] = useState<Set<string | number>>(new Set());
  const [isContinuing, setIsContinuing] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);

  // ---------------- FETCH OCCUPIED ----------------
  const fetchOccupied = useCallback(async () => {
    if (!busId || !searchData?.date) return;

    const res = await axios.get<OccupiedSeatsResponse>(
      `https://bus-booking-nt91.onrender.com/api/bookings/occupied-seats`,
      { params: { busId, date: searchData.date } }
    );

    setOccupiedSeats(new Set(res.data.occupiedSeats?.map(String) || []));
    setReservedSeats(new Set(res.data.reservedSeats?.map(String) || []));
    setBlockedSeats(new Set(res.data.blockedSeats?.map(String) || []));
    setOfflineSeats(new Set(res.data.offlineSeats?.map(String) || []));
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
  const handleSeatClick = async (seat: string | number) => {
    // Safety check: find seat object to check permanent/manual blocks
    const seatObj = busSeats?.seats.find((s: Seat) => String(s.seatNumber) === String(seat));
    const sid = String(seat);

    if (occupiedSeats.has(seat) || occupiedSeats.has(sid)) return;
    if (reservedSeats.has(seat) || reservedSeats.has(sid)) return;
    if (blockedSeats.has(seat) || blockedSeats.has(sid)) return;
    if (offlineSeats.has(seat) || offlineSeats.has(sid)) return;

    if (seatObj?.isPermanent) return;
    if (seatObj?.isBlocked) return;
    if (seatObj?.isOnline === false) return;

    if (selectedSeats.includes(seat)) {
      deselectSeat(seat);
    } else {
      selectSeat(seat);
    }
  };

  if (!searchData || !busSeats) return <p>Loading...</p>;

  const ladiesSeats = new Set<string | number>(
    busSeats.seats.filter((s: any) => s.isLadiesOnly).map((s: any) => s.seatNumber)
  );

  const conductorMap = new Map<string | number, string>();
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
        blockedSeats={blockedSeats}
        offlineSeats={offlineSeats}
        ladiesOnlySeats={ladiesSeats}
        conductorSeatMap={conductorMap}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
        maxSeats={searchData.passengers}
        seatLayout={busSeats.seatLayout}
        seatNumberingType={busSeats.seatNumberingType}
        lastRowSeats={busSeats.lastRowSeats}
        seatsData={busSeats.seats}
        useCustomLayout={busSeats.useCustomLayout}
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