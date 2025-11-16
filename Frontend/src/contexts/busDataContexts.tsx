import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

// ------------------------------
// Types
// ------------------------------
export interface SeatType {
  seatNumber: number;
  isLadiesOnly: boolean;
  isOccupied: boolean;      // REQUIRED
  agentAssigned?: boolean;
  agentCode?: string | null;
  agentId?: string | null;
}


export interface BusType {
  id: string;
  name: string;
  companyName: string;
  type: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  totalSeats: number;
  ladiesOnlySeats: number[];
  price: number;
  status: "active" | "inactive";
  amenities: string[];
  isSpecial?: boolean;
  specialTime?: string;
  ownerId?: string;
  seats: SeatType[];
  busNumber: string;
}

interface BusFromDB extends Omit<BusType, "id"> {
  _id: string;
}

export interface SeatUpdate {
  seatNumber: number;
  isOccupied: boolean;
}

// ------------------------------
// Context Type
// ------------------------------
interface BusContextType {
  buses: BusType[];
  fetchBuses: () => Promise<void>;
  addBus: (bus: Omit<BusType, "id">) => Promise<void>;
  updateBus: (id: string, bus: Partial<Omit<BusType, "id">>) => Promise<void>;
  deleteBus: (id: string) => Promise<void>;
  toggleBusStatus: (id: string) => Promise<void>;
  selectedSeats: number[];
  selectSeat: (busId: string, seatNumber: number) => void;
  deselectSeat: (seatNumber: number) => void;
  clearSelectedSeats: () => void;
  updateSeats: (busId: string, seats: SeatUpdate[]) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// ------------------------------
// Context Setup
// ------------------------------
const BusContext = createContext<BusContextType | undefined>(undefined);

export const useBus = (): BusContextType => {
  const context = useContext(BusContext);
  if (!context) throw new Error("useBus must be used within BusProvider");
  return context;
};

// ------------------------------
// Provider
// ------------------------------
export const BusProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:5000/api/buses";

  // Helper to map _id → id
  const mapBus = (bus: BusFromDB): BusType => ({
    ...bus,
    id: bus._id,
  });

  // ------------------------------
  // Fetch All Buses
  // ------------------------------
  const fetchBuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ success: boolean; data: BusFromDB[] }>(
        API_URL
      );
      const mapped = res.data.data.map(mapBus);
      setBuses(mapped);
      localStorage.setItem("buses", JSON.stringify(mapped)); // cache
    } catch (err) {
      console.error(err);
      setError("Failed to fetch buses");
      // fallback to cached data if available
      const cached = localStorage.getItem("buses");
      if (cached) setBuses(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Add Bus
  // ------------------------------
  const addBus = async (bus: Omit<BusType, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post<{ success: boolean; data: BusFromDB }>(
        API_URL,
        bus
      );
      const newBus = mapBus(res.data.data);
      setBuses((prev) => [...prev, newBus]);
    } catch (err) {
      console.error(err);
      setError("Failed to add bus");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Update Bus
  // ------------------------------
  const updateBus = async (id: string, bus: Partial<Omit<BusType, "id">>) => {
    setError(null);
    try {
      const res = await axios.put<{ success: boolean; data: BusFromDB }>(
        `${API_URL}/${id}`,
        bus
      );
      const updated = mapBus(res.data.data);
      setBuses((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      console.error(err);
      setError("Failed to update bus");
    }
  };

  // ------------------------------
  // Delete Bus
  // ------------------------------
  const deleteBus = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setBuses((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete bus");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Toggle Bus Status
  // ------------------------------
  const toggleBusStatus = async (id: string) => {
    const bus = buses.find((b) => b.id === id);
    if (!bus) return;
    const newStatus = bus.status === "active" ? "inactive" : "active";
    await updateBus(id, { status: newStatus });
  };

  // ------------------------------
  // Seat Selection Logic
  // ------------------------------
  const selectSeat = (busId: string, seatNumber: number) => {
    const bus = buses.find((b) => b.id === busId);
    if (!bus) return;

    const seat = bus.seats.find((s) => s.seatNumber === seatNumber);
    if (!seat) return;

    if (seat.isLadiesOnly) {
      alert("This seat is reserved for ladies only!");
      return;
    }

    if (seat.isOccupied) {
      alert("This seat is already occupied!");
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((n) => n !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const deselectSeat = (seatNumber: number) => {
    setSelectedSeats((prev) => prev.filter((s) => s !== seatNumber));
  };

  const clearSelectedSeats = () => setSelectedSeats([]);

  // ------------------------------
  // Update Seat Status
  // ------------------------------
  const updateSeats = async (busId: string, seatUpdates: SeatUpdate[]) => {
    try {
      const res = await axios.put<{ success: boolean; data: BusFromDB }>(
        `${API_URL}/${busId}/update-seats`,
        { seats: seatUpdates }
      );
      const updatedBus = mapBus(res.data.data);
      setBuses((prev) =>
        prev.map((b) => (b.id === busId ? updatedBus : b))
      );
    } catch (err) {
      console.error("Seat update failed", err);
      setError("Failed to update seats");
    }
  };

  // ------------------------------
  // Initial Fetch
  // ------------------------------
  useEffect(() => {
    fetchBuses();
  }, []);

  return (
    <BusContext.Provider
      value={{
        buses,
        fetchBuses,
        addBus,
        updateBus,
        deleteBus,
        toggleBusStatus,
        selectedSeats,
        selectSeat,
        deselectSeat,
        clearSelectedSeats,
        updateSeats,
        loading,
        error,
      }}
    >
      {children}
    </BusContext.Provider>
  );
};
