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

// Each seat has a number and an optional ladies-only flag
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
  seats: SeatType[]; // ✅ Seat layout
}

// Raw data from MongoDB (_id instead of id)
interface BusFromDB extends Omit<BusType, "id"> {
  _id: string;
}

interface BusContextType {
  buses: BusType[];
  fetchBuses: () => Promise<void>;
  addBus: (bus: Omit<BusType, "id">) => Promise<void>;
  updateBus: (id: string, bus: Partial<BusType>) => Promise<void>;
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
// Provider Component
// --------------------
export const BusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:5000/api/buses";

  // --------------------
  // Fetch all buses
  // --------------------
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
      const errorMessage =
        axios.isAxiosError(err) && err.response
          ? err.response.data?.message || "Failed to fetch buses"
          : "Failed to fetch buses";
      setError(errorMessage);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------
  // Add new bus
  // --------------------
  const addBus = async (bus: Omit<BusType, "id">): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<BusFromDB>(API_URL, bus);
      const newBus: BusType = { ...response.data, id: response.data._id };
      setBuses((prev) => [...prev, newBus]);
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response
          ? err.response.data?.message || "Failed to add bus"
          : "Failed to add bus";
      setError(errorMessage);
      console.error("Add bus error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------
  // Update bus (instant UI update)
  // --------------------
  const updateBus = async (id: string, bus: Partial<BusType>): Promise<void> => {
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/${id}`, bus);
      const updatedBusData: BusFromDB = response.data.bus || response.data;
      const updatedBus: BusType = { ...updatedBusData, id: updatedBusData._id };

      // ✅ Instant UI update (no refresh)
      setBuses((prevBuses) =>
        prevBuses.map((b) => (b.id === id ? updatedBus : b))
      );

      console.log("Bus updated successfully:", updatedBus);
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response
          ? err.response.data?.message || "Failed to update bus"
          : "Failed to update bus";
      setError(errorMessage);
      console.error("Update bus error:", err);
    }
  };

  // --------------------
  // Delete bus
  // --------------------
  const deleteBus = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setBuses((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response
          ? err.response.data?.message || "Failed to delete bus"
          : "Failed to delete bus";
      setError(errorMessage);
      console.error("Delete bus error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------
  // Toggle bus status (active/inactive)
  // --------------------
  const toggleBusStatus = async (id: string): Promise<void> => {
    const bus = buses.find((b) => b.id === id);
    if (!bus) return;

    const newStatus: BusType["status"] =
      bus.status === "active" ? "inactive" : "active";

    try {
      await updateBus(id, { status: newStatus });
    } catch (error) {
      console.error("Toggle status error:", error);
    }
  };

  // --------------------
  // Auto-fetch on mount
  // --------------------
  useEffect(() => {
    fetchBuses();
  }, []);

  // --------------------
  // Context value
  // --------------------
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
