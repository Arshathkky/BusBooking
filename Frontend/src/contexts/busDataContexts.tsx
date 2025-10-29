import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

// --------------------
// Types
// --------------------
export interface SeatType {
  seatNumber: number;
  isLadiesOnly: boolean;
}

export interface BusType {
  id: string; // frontend-friendly
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
}

// Raw data from backend (_id)
interface BusFromDB extends Omit<BusType, "id"> {
  _id: string;
}

// --------------------
// Context Type
// --------------------
interface BusContextType {
  buses: BusType[];
  fetchBuses: () => Promise<void>;
  addBus: (bus: Omit<BusType, "id">) => Promise<void>;
  updateBus: (id: string, bus: Partial<Omit<BusType, "id">>) => Promise<void>;
  deleteBus: (id: string) => Promise<void>;
  toggleBusStatus: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// --------------------
// Context Setup
// --------------------
const BusContext = createContext<BusContextType | undefined>(undefined);

export const useBus = (): BusContextType => {
  const context = useContext(BusContext);
  if (!context) throw new Error("useBus must be used within BusProvider");
  return context;
};

// --------------------
// Provider
// --------------------
export const BusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:5000/api/buses";

  // Fetch all buses
  const fetchBuses = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<BusFromDB[]>(API_URL);
      const mappedBuses: BusType[] = response.data.map((bus) => ({
        ...bus,
        id: bus._id,
      }));
      setBuses(mappedBuses);
    } catch (err) {
      setError("Failed to fetch buses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add bus
  const addBus = async (bus: Omit<BusType, "id">): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<BusFromDB>(API_URL, bus);
      setBuses((prev) => [...prev, { ...response.data, id: response.data._id }]);
    } catch (err) {
      setError("Failed to add bus");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update bus
  const updateBus = async (
    id: string,
    bus: Partial<Omit<BusType, "id">>
  ): Promise<void> => {
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/${id}`, bus);
      const updatedBus: BusType = { ...response.data, id: response.data._id };
      setBuses((prev) => prev.map((b) => (b.id === id ? updatedBus : b)));
    } catch (err) {
      setError("Failed to update bus");
      console.error(err);
    }
  };

  // Delete bus
  const deleteBus = async (id: string): Promise<void> => {
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

  // Toggle bus status
  const toggleBusStatus = async (id: string): Promise<void> => {
    const bus = buses.find((b) => b.id === id);
    if (!bus) return;
    const newStatus: BusType["status"] = bus.status === "active" ? "inactive" : "active";
    await updateBus(id, { status: newStatus });
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
        loading,
        error,
      }}
    >
      {children}
    </BusContext.Provider>
  );
};
