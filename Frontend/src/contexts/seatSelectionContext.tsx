import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import axios from "axios";

// -------------------- Types --------------------

export type SeatLayoutType = "2x2" | "2x3";
export type LastRowType = 4 | 6;

export interface Seat {
  seatNumber: number;
  isLadiesOnly: boolean;
  isOccupied: boolean;
  conductorAssigned?: boolean;
  isReservedForConductor?: boolean;
  conductorId?: string | null;
}

export interface Bus {
  id: string;
  name: string;
  type: string;
  totalSeats: number;
  price: number;
  seats: Seat[];
  busNumber: string;
  seatLayout: SeatLayoutType;
  lastRowSeats: LastRowType;
  seatNumberingType: "driver_side" | "door_side"; // 👈 NEW
  onlineSeatRange?: { start: number; end: number }; // 👈 NEW
}

// Backend response wrapper
interface BusResponse {
  success: boolean;
  data: BusFromBackend;
}

interface BusFromBackend {
  _id: string;
  name: string;
  type: string;
  totalSeats: number;
  price: number;
  seats: Seat[];
  busNumber: string;
  seatLayout?: SeatLayoutType;
  lastRowSeats?: LastRowType;
  seatNumberingType?: "driver_side" | "door_side"; // 👈 NEW
  onlineSeatRange?: { start: number; end: number }; // 👈 NEW
}

// -------------------- Context Type --------------------

interface SeatContextType {
  busSeats: Bus | null;
  selectedSeats: number[];
  selectSeat: (seatNumber: number) => void;
  deselectSeat: (seatNumber: number) => void;
  clearSelection: () => void;
  fetchBusSeats: (busId: string) => Promise<void>;
  updateSeats: (
    busId: string,
    updatedSeats: { seatNumber: number; isOccupied: boolean }[]
  ) => Promise<void>;
}

// -------------------- Context --------------------

const SeatContext = createContext<SeatContextType | undefined>(undefined);

export const useSeat = (): SeatContextType => {
  const context = useContext(SeatContext);
  if (!context) throw new Error("useSeat must be used within SeatProvider");
  return context;
};

// -------------------- Provider --------------------

export const SeatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [busSeats, setBusSeats] = useState<Bus | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const API_URL = `${import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api"}/buses`;

  // -------------------- Fetch bus seats --------------------
  const fetchBusSeats = useCallback(async (busId: string) => {
    try {
      const res = await axios.get<BusResponse>(`${API_URL}/${busId}`);
      const busData = res.data.data;

      if (!busData || !busData.seats) return;

      setBusSeats({
        id: busData._id,
        name: busData.name,
        type: busData.type,
        totalSeats: busData.totalSeats,
        price: busData.price,
        busNumber: busData.busNumber,
        seatLayout: busData.seatLayout ?? "2x2",
        lastRowSeats: busData.lastRowSeats ?? 6,
        seatNumberingType: busData.seatNumberingType ?? "driver_side", // 👈 NEW
        onlineSeatRange: busData.onlineSeatRange, // 👈 NEW
        seats: busData.seats.map((s) => ({
          seatNumber: s.seatNumber,
          isLadiesOnly: s.isLadiesOnly,
          isOccupied: s.isOccupied ?? false,
          conductorAssigned: s.conductorAssigned ?? false,
          isReservedForConductor: s.isReservedForConductor ?? false,
          conductorId: s.conductorId ?? null,
        })),
      });

      setSelectedSeats([]);
    } catch (err) {
      console.error("❌ Failed to fetch bus seats:", err);
    }
  }, []);

  // -------------------- Update seat occupancy --------------------
  const updateSeats = useCallback(
    async (
      busId: string,
      updatedSeats: { seatNumber: number; isOccupied: boolean }[]
    ) => {
      if (!busSeats) return;

      const newSeats: Seat[] = busSeats.seats.map((seat) => {
        const updated = updatedSeats.find((s) => s.seatNumber === seat.seatNumber);
        return updated ? { ...seat, isOccupied: updated.isOccupied } : seat;
      });

      try {
        await axios.put(`${API_URL}/${busId}/seats`, { seats: newSeats });
        setBusSeats((prev) => (prev ? { ...prev, seats: newSeats } : null));
      } catch (err) {
        console.error("❌ Failed to update seat layout:", err);
      }
    },
    [busSeats]
  );

  // -------------------- Seat Selection --------------------
  const selectSeat = (seatNumber: number) => {
    setSelectedSeats((prev) => (prev.includes(seatNumber) ? prev : [...prev, seatNumber]));
  };

  const deselectSeat = (seatNumber: number) => {
    setSelectedSeats((prev) => prev.filter((s) => s !== seatNumber));
  };

  const clearSelection = () => {
    setSelectedSeats([]);
  };

  return (
    <SeatContext.Provider
      value={{
        busSeats,
        selectedSeats,
        selectSeat,
        deselectSeat,
        clearSelection,
        fetchBusSeats,
        updateSeats,
      }}
    >
      {children}
    </SeatContext.Provider>
  );
};  