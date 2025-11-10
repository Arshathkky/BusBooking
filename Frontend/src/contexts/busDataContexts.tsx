import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";
import axios from "axios";

// ------------------------------
// Types
// ------------------------------
export interface SeatType {
  seatNumber: number;
  isLadiesOnly: boolean;
  isOccupied?: boolean;       // ✅ ADD THIS if missing
}

export interface BusType {
  id: string;
  name: string;
  type: string;
  companyName: string;
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
  busNumber:string;
}

interface BusFromDB extends Omit<BusType, "id"> {
  _id: string;
}

// ✅ seats coming from PassengerDetails update
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

  // Seat selection (frontend UI)
  selectedSeats: number[];
  selectSeat: (seatNumber: number) => void;
  deselectSeat: (seatNumber: number) => void;
  clearSelectedSeats: () => void;

  // ✅ Backend seat update
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
export const BusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:5000/api/buses";

  // ------------------------------
  // Fetch all buses
  // ------------------------------
  const fetchBuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<BusFromDB[]>(API_URL);

      const mapped = response.data.map((b) => ({
        ...b,
        id: b._id
      }));

      setBuses(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch buses");
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
      const res = await axios.post<BusFromDB>(API_URL, bus);
      setBuses((prev) => [...prev, { ...res.data, id: res.data._id }]);
    } catch (err) {
      setError("Failed to add bus");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Update Bus
  // ------------------------------
  const updateBus = async (
    id: string,
    bus: Partial<Omit<BusType, "id">>
  ) => {
    setError(null);
    try {
      const res = await axios.put(`${API_URL}/${id}`, bus);
      const updated: BusType = { ...res.data, id: res.data._id };

      setBuses((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError("Failed to update bus");
      console.error(err);
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
      setError("Failed to delete bus");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Toggle bus active status
  // ------------------------------
  const toggleBusStatus = async (id: string) => {
    const bus = buses.find((b) => b.id === id);
    if (!bus) return;

    const newStatus = bus.status === "active" ? "inactive" : "active";

    await updateBus(id, { status: newStatus });
  };

  // ------------------------------
  // ✅ FRONTEND Seat Selection Logic
  // ------------------------------
  const selectSeat = (seatNumber: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev : [...prev, seatNumber]
    );
  };

  const deselectSeat = (seatNumber: number) => {
    setSelectedSeats((prev) => prev.filter((s) => s !== seatNumber));
  };

  const clearSelectedSeats = () => setSelectedSeats([]);

  // ------------------------------
  // ✅ BACKEND Seat Update Logic
  // ------------------------------
  const updateSeats = async (busId: string, seatUpdates: SeatUpdate[]) => {
    try {
      await axios.put(`${API_URL}/${busId}/update-seats`, {
        seats: seatUpdates
      });

      // ✅ update local state so UI updates instantly
      setBuses((prev) =>
        prev.map((bus) =>
          bus.id === busId
            ? {
                ...bus,
                seats: bus.seats.map((s) => {
                  const update = seatUpdates.find(
                    (u) => u.seatNumber === s.seatNumber
                  );
                  return update ? { ...s, isOccupied: update.isOccupied } : s;
                })
              }
            : bus
        )
      );
    } catch (err) {
      console.error("Seat update failed", err);
      setError("Failed to update seats");
      throw err;
    }
  };

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
        updateSeats,        // ✅ EXPORTED
        loading,
        error
      }}
    >
      {children}
    </BusContext.Provider>
  );
};
