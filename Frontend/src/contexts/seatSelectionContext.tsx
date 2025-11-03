import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";

// --------------------
// Types
// --------------------
export interface Seat {
  seatNumber: number;
  isLadiesOnly: boolean;
  isOccupied: boolean;
}

export interface BusSeats {
  id: string;
  name: string;
  type: string;
  price: number;
  totalSeats: number;
  seats: Seat[];
}

interface SeatContextType {
  busSeats: BusSeats | null;
  selectedSeats: number[];
  selectSeat: (seatNumber: number) => void;
  deselectSeat: (seatNumber: number) => void;
  fetchBusSeats: (busId: string) => Promise<void>;
  updateSeats: (busId: string, seats: Seat[]) => Promise<void>;
  clearSelection: () => void;
}

// --------------------
// Backend types
// --------------------
interface SeatFromBackend {
  seatNumber: number;
  isLadiesOnly: boolean;
  isOccupied?: boolean;
}

interface BusFromBackend {
  _id: string;
  name: string;
  type: string;
  price: number;
  totalSeats: number;
  seats: SeatFromBackend[];
}

// --------------------
// Context setup
// --------------------
const SeatContext = createContext<SeatContextType | undefined>(undefined);

export const useSeat = (): SeatContextType => {
  const context = useContext(SeatContext);
  if (!context) {
    throw new Error("useSeat must be used within SeatProvider");
  }
  return context;
};

// --------------------
// Provider
// --------------------
export const SeatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [busSeats, setBusSeats] = useState<BusSeats | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const API_URL = "http://localhost:5000/api/buses";

  // ✅ Fetch bus seats (memoized)
  const fetchBusSeats = useCallback(async (busId: string) => {
    try {
      const res = await axios.get<BusFromBackend>(`${API_URL}/${busId}`);
      const busData = res.data;

      const seats: Seat[] = busData.seats.map((s) => ({
        seatNumber: s.seatNumber,
        isLadiesOnly: s.isLadiesOnly,
        isOccupied: s.isOccupied ?? false,
      }));

      setBusSeats({
        id: busData._id,
        name: busData.name,
        type: busData.type,
        price: busData.price,
        totalSeats: busData.totalSeats,
        seats,
      });
      setSelectedSeats([]);
    } catch (error) {
      console.error("❌ Failed to fetch bus seats:", error);
    }
  }, []);

  // ✅ Update seat layout (memoized)
  const updateSeats = useCallback(async (busId: string, seats: Seat[]) => {
    try {
      await axios.put(`${API_URL}/${busId}/seats`, { seats });
      setBusSeats((prev) => (prev ? { ...prev, seats } : null));
    } catch (error) {
      console.error("❌ Failed to update seat layout:", error);
    }
  }, []);

  // ✅ Select/Deselect seats
  const selectSeat = (seatNumber: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev : [...prev, seatNumber]
    );
  };

  const deselectSeat = (seatNumber: number) => {
    setSelectedSeats((prev) => prev.filter((s) => s !== seatNumber));
  };

  // ✅ Clear selection (memoized)
  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  return (
    <SeatContext.Provider
      value={{
        busSeats,
        selectedSeats,
        selectSeat,
        deselectSeat,
        fetchBusSeats,
        updateSeats,
        clearSelection,
      }}
    >
      {children}
    </SeatContext.Provider>
  );
};
