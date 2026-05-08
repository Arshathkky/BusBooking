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

interface OccupiedSeatInfo {
  seatNumber: string | number;
  passengerName: string;
  bookingId?: string | number;
  status: string;
  pickupLocation?: string;
}

interface OccupiedSeatsResponse {
  success: boolean;
  occupiedSeats: OccupiedSeatInfo[];
  reservedSeats?: OccupiedSeatInfo[];
  blockedSeats?: OccupiedSeatInfo[];
  offlineSeats?: OccupiedSeatInfo[];
}


interface SeatLayoutProps {
  totalSeats: number;
  occupiedSeats: Map<string | number, OccupiedSeatInfo>;
  reservedSeats: Map<string | number, OccupiedSeatInfo>;
  blockedSeats: Map<string | number, OccupiedSeatInfo>;
  offlineSeats: Map<string | number, OccupiedSeatInfo>;
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
    const occupantInfo = occupiedSeats.get(sid) || reservedSeats.get(sid) || blockedSeats.get(sid) || offlineSeats.get(sid);

    // If occupantInfo says it's BLOCKED, treat it as a block seat regardless of which map it came from
    const isActuallyBlocked = occupantInfo?.status === "BLOCKED" || blockedSeats.has(sid) || blockedSeats.has(seatId);
    
    const isPermanent = (seatObj && seatObj.isPermanent === true) || isActuallyBlocked;
    const isOwnerBlocked = (seatObj && seatObj.isBlocked === true);
    const isBlockedForOnline = (seatObj && seatObj.isOnline === false) || offlineSeats.has(sid) || offlineSeats.has(seatId);

    const isActuallyOccupied = isOccupied && !isActuallyBlocked;

    let style =
      "w-12 h-12 rounded-full border-2 text-xs font-semibold flex flex-col items-center justify-center transition group relative";

    if (isSelected) {
      style += " bg-yellow-400 border-yellow-500 cursor-pointer";
    } else if (isActuallyOccupied) {
      style += " bg-cyan-600 text-white cursor-not-allowed border-cyan-700";
    } else if (isReserved) {
      style += " bg-blue-600 text-white cursor-not-allowed border-blue-700";
    } else if (isPermanent) {
      style += " bg-slate-900 border-black text-white cursor-not-allowed shadow-inner";
    } else if (isConductor) {
      style += " bg-purple-300 cursor-not-allowed";
    } else if (isOwnerBlocked || isBlockedForOnline) {
      // Manual Booking Only 👈
      style += " bg-orange-500 text-white border-orange-600 cursor-not-allowed";
    } else if (isLadies) {
      style += " bg-pink-300 cursor-pointer text-pink-900";
    } else {
      style += " bg-white border-gray-300 hover:bg-yellow-50 cursor-pointer text-gray-700";
    }

    return (
      <button
        key={String(seatId)}
        onClick={() => !isPermanent && !isActuallyOccupied && !isReserved && !isConductor && !isOwnerBlocked && !isBlockedForOnline && onSeatClick(seatId)}
        disabled={
          isPermanent ||
          isActuallyOccupied ||
          (isReserved && !isSelected) ||
          isConductor ||
          isOwnerBlocked ||
          isBlockedForOnline ||
          (!isSelected && selectedSeats.length >= maxSeats)
        }
        className={style}
        title={occupantInfo ? `Occupied by: ${occupantInfo.passengerName}` : ""}
      >
        {occupantInfo && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
            {occupantInfo.passengerName}
          </div>
        )}

        {isPermanent ? (
          <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-md">
            <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
        ) : isActuallyOccupied ? (
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
        <Legend color="bg-cyan-600" label="Paid" />
        <Legend color="bg-blue-600" label="Reserved" />
        <Legend color="bg-yellow-400" label="Selected" />
        <Legend color="bg-pink-300" label="Ladies Only" />
        <Legend color="bg-orange-500" label="Manual Only" />
        <Legend color="bg-slate-900" label="Permanent Block" />
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
                const isOccupied = occupiedSeats.has(sid);
                const isReserved = reservedSeats.has(sid);
                const isSelected = selectedSeats.map(String).includes(String(seat.seatNumber));
                const isLadies = seat.isLadiesOnly;
                const conductorId = conductorSeatMap.get(String(seat.seatNumber));
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
              const isOccupied = occupiedSeats.has(sid);
              const isReserved = reservedSeats.has(sid);
              const isSelected = selectedSeats.map(String).includes(String(num));
              const isLadies = ladiesOnlySeats.has(String(num)) || ladiesOnlySeats.has(num);
              const conductorId = conductorSeatMap.get(String(num));
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
                  const isOccupied = occupiedSeats.has(sid);
                  const isReserved = reservedSeats.has(sid);
                  const isSelected = selectedSeats.map(String).includes(String(num));
                  const isLadies = ladiesOnlySeats.has(String(num)) || ladiesOnlySeats.has(num);
                  const conductorId = conductorSeatMap.get(String(num));
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
  <div className="flex items-center gap-2 text-sm font-medium">
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

  const [occupiedSeats, setOccupiedSeats] = useState<Map<string | number, OccupiedSeatInfo>>(new Map());
  const [reservedSeats, setReservedSeats] = useState<Map<string | number, OccupiedSeatInfo>>(new Map());
  const [blockedSeats, setBlockedSeats] = useState<Map<string | number, OccupiedSeatInfo>>(new Map());
  const [offlineSeats, setOfflineSeats] = useState<Map<string | number, OccupiedSeatInfo>>(new Map());
  const [isContinuing, setIsContinuing] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);
  const [pickupLocation, setPickupLocation] = useState("");

  // ---------------- FETCH OCCUPIED ----------------
  const fetchOccupied = useCallback(async () => {
    if (!busId || !searchData?.date) return;

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const res = await axios.get<OccupiedSeatsResponse>(
      `${API_BASE}/bookings/occupied-seats`,
      { params: { busId, date: searchData.date } }
    );

    const occMap = new Map();
    res.data.occupiedSeats.forEach(s => occMap.set(String(s.seatNumber), s));
    setOccupiedSeats(occMap);

    const resMap = new Map();
    res.data.reservedSeats?.forEach(s => resMap.set(String(s.seatNumber), s));
    setReservedSeats(resMap);

    const blockMap = new Map();
    res.data.blockedSeats?.forEach(s => blockMap.set(String(s.seatNumber), s));
    setBlockedSeats(blockMap);

    const offMap = new Map();
    res.data.offlineSeats?.forEach(s => offMap.set(String(s.seatNumber), s));
    setOfflineSeats(offMap);
  }, [busId, searchData?.date]);

  // ---------------- INIT ----------------
  useEffect(() => {
    if (!busId) return;

    // Initial fetch
    fetchBusSeats(busId);
    fetchOccupied();

    // Poll every 5 seconds so other users see reserved/held seats in real-time
    const pollInterval = setInterval(() => {
      fetchOccupied();
      fetchBusSeats(busId);
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      // We don't necessarily want to clear selection on every small dependency change,
      // only on actual unmount or bus change.
    };
  }, [busId, fetchBusSeats, fetchOccupied]);

  // Separate effect for clearSelection on unmount or bus change
  useEffect(() => {
    return () => {
      clearSelection();
    };
  }, [busId, clearSelection]);

  // ---------------- CLICK SEAT ----------------
  const handleSeatClick = async (seat: string | number) => {
    const sid = String(seat);
    const seatObj = busSeats?.seats.find((s: Seat) => String(s.seatNumber) === sid);
    const isSelected = selectedSeats.map(String).includes(sid);

    if (occupiedSeats.has(sid)) return;
    if (reservedSeats.has(sid)) return;
    if (blockedSeats.has(sid)) return;
    if (offlineSeats.has(sid)) return;

    if (seatObj?.isPermanent) return;
    if (seatObj?.isBlocked) return;
    if (seatObj?.isOnline === false) return;

    if (isSelected) {
      deselectSeat(seat);
    } else {
      if (selectedSeats.length >= (searchData?.passengers || 1)) {
          alert(`You can only select ${searchData?.passengers || 1} seat(s).`);
          return;
      }
      selectSeat(seat);
    }
  };

  if (!searchData || !busSeats) return <p className="p-20 text-center font-bold">Loading bus layout...</p>;

  const ladiesSeats = new Set<string | number>(
    busSeats.seats.filter((s: any) => s.isLadiesOnly).map((s: any) => s.seatNumber)
  );

  const conductorMap = new Map<string, string>();
  busSeats.seats.forEach((s: any) => {
    if (s.isReservedForConductor) conductorMap.set(String(s.seatNumber), s.conductorId || "A");
  });

  // Calculate Online Availability
  const totalOnlineSeats = busSeats.useCustomLayout 
    ? busSeats.seats.filter(s => s.isOnline !== false && !s.isPermanent).length 
    : (busSeats.totalSeats - busSeats.seats.filter(s => s.isOnline === false || s.isPermanent).length);
  const onlineBookedOrBlocked = [...occupiedSeats.values(), ...reservedSeats.values(), ...blockedSeats.values()].filter(s => {
      const seatObj = busSeats.seats.find(bs => String(bs.seatNumber) === String(s.seatNumber));
      return seatObj && seatObj.isOnline !== false;
  }).length;
  const availableOnlineCount = Math.max(0, totalOnlineSeats - onlineBookedOrBlocked - selectedSeats.length);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#fdc106] font-bold mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">{busSeats.name}</h1>
          <p className="text-gray-500 font-bold text-sm tracking-tight">{searchData.from} → {searchData.to} • {new Date(searchData.date).toLocaleDateString()}</p>
        </div>

        <div className="bg-[#fdc106] px-6 py-4 rounded-3xl shadow-lg border-b-4 border-black/10">
           <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-1">Online Availability</p>
           <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black italic tracking-tighter leading-none">{availableOnlineCount}</span>
              <span className="text-sm font-bold uppercase opacity-80">Seats Left Online</span>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
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
            maxSeats={searchData?.passengers || 1}
            seatLayout={busSeats.seatLayout}
            seatNumberingType={busSeats.seatNumberingType}
            lastRowSeats={busSeats.lastRowSeats}
            seatsData={busSeats.seats}
            useCustomLayout={busSeats.useCustomLayout}
          />
        </div>

        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6">Booking Details</h3>
                
                <div className="space-y-4 mb-8">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Selected Seats</label>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold text-gray-900 dark:text-white flex flex-wrap gap-2 min-h-[56px]">
                            {selectedSeats.length === 0 ? "None selected" : selectedSeats.map(s => (
                                <span key={s} className="bg-[#fdc106] text-gray-900 px-3 py-1 rounded-lg text-sm font-black italic">#{s}</span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Departure Point (Pickup)</label>
                        <input 
                            type="text" 
                            placeholder="Where should we pick you up?"
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold focus:ring-2 focus:ring-[#fdc106]"
                        />
                        <p className="text-[9px] text-gray-400 font-medium px-1 italic mt-1">Example: Near Clock Tower, Main Station, etc.</p>
                    </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-6 mb-8">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Amount</span>
                        <span className="text-3xl font-black italic text-green-600 tracking-tighter">LKR {(busSeats.price * selectedSeats.length).toLocaleString()}</span>
                    </div>
                </div>

                {continueError && (
                    <p className="mb-4 text-red-600 text-sm font-bold bg-red-50 p-4 rounded-xl border border-red-100">{continueError}</p>
                )}

                <button
                    disabled={selectedSeats.length !== (Number(searchData?.passengers) || 1) || !pickupLocation || isContinuing}
                    onClick={async () => {
                    if (!busSeats || !busId) return;
                    setContinueError(null);
                    setIsContinuing(true);
                    try {
                        navigate("/passenger-details", {
                        state: {
                            bus: busSeats,
                            selectedSeats,
                            searchData,
                            totalAmount: busSeats.price * selectedSeats.length,
                            pickupLocation
                        },
                        });
                    } catch (err) {
                        setContinueError("An error occurred. Please try again.");
                    } finally {
                        setIsContinuing(false);
                    }
                    }}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 ${
                        selectedSeats.length === (Number(searchData?.passengers) || 1) && pickupLocation && !isContinuing
                        ? "bg-[#fdc106] text-gray-900 shadow-[#fdc106]/20 hover:bg-[#e6ad05]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    }`}
                >
                    {isContinuing ? "Processing..." : "Continue to Details"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;