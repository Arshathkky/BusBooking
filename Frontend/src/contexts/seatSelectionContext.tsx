import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import axios from "axios";

// -------------------- Types --------------------
export interface Seat {
  seatNumber: number;
  isLadiesOnly: boolean;
  isOccupied: boolean;
  agentAssigned?: boolean;
  isReservedForAgent?: boolean;
  agentId?: string | null;
}

export interface Bus {
  id: string;
  name: string;
  type: string;
  totalSeats: number;
  price: number;
  seats: Seat[];
  busNumber: string;
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
}

// -------------------- Context Type --------------------
interface SeatContextType {
  busSeats: Bus | null;
  selectedSeats: number[];
  selectSeat: (seatNumber: number) => void;
  deselectSeat: (seatNumber: number) => void;
  clearSelection: () => void;
  fetchBusSeats: (busId: string) => Promise<void>;
  updateSeats: (busId: string, updatedSeats: { seatNumber: number; isOccupied: boolean }[]) => Promise<void>;
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
  const API_URL = "https://bus-booking-nt91.onrender.com/api/buses";

  // -------------------- Fetch bus seats from backend --------------------
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
        seats: busData.seats.map((s) => ({
          seatNumber: s.seatNumber,
          isLadiesOnly: s.isLadiesOnly,
          isOccupied: s.isOccupied ?? false,
          agentAssigned: s.agentAssigned ?? false,
          isReservedForAgent: s.isReservedForAgent ?? false,
          agentId: s.agentId ?? null,
        })),
      });

      setSelectedSeats([]);
    } catch (err) {
      console.error("❌ Failed to fetch bus seats:", err);
    }
  }, []);

  // -------------------- Update seat occupancy --------------------
  const updateSeats = useCallback(
    async (busId: string, updatedSeats: { seatNumber: number; isOccupied: boolean }[]) => {
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
