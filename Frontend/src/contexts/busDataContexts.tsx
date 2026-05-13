import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// ------------------------------
// Types
// ------------------------------
export interface SeatType {
  seatNumber: string | number;
  x?: number;
  y?: number;
  isWindow?: boolean;
  isLadiesOnly: boolean;
  isOccupied: boolean;
  conductorAssigned?: boolean;
  conductorCode?: string | null;
  conductorId?: string | null;
  isOnline?: boolean;
  isBlocked?: boolean;   // Manual block (e.g. for conductor/owner)
  isPermanent?: boolean; // Permanently unavailable
}

// Seat layout type
export type SeatLayoutType = "2x2" | "2x3";

// Last row type
export type LastRowType = number;

// Bus type
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
  ladiesOnlySeats: (string | number)[];
  price: number;
  status: "active" | "inactive";
  amenities: string[];
  isSpecial?: boolean;
  specialTime?: string;
  ownerId?: string;
  seats: SeatType[];
  busNumber: string;
  seatLayout: SeatLayoutType; // main layout
  seatNumberingType: "driver_side" | "door_side";
  lastRowSeats?: LastRowType;  // last row layout
  scheduleMode?: "weekly" | "custom";
  weeklySchedule?: string[];
  customSchedule?: {
    date: string;
    routeId: string;
    departureTime?: string;
    arrivalTime?: string;
    price?: number;
  }[];
  useCustomLayout?: boolean; // 👈 NEW
  notifyOwnerOnBooking?: boolean;
  ownerPhoneForSMS?: string;
}

interface BusFromDB extends Omit<BusType, "id"> {
  _id: string;
}

export interface SeatUpdate {
  seatNumber: string | number;
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
  selectedSeats: (string | number)[];
  selectSeat: (busId: string, seatNumber: string | number) => void;
  deselectSeat: (seatNumber: string | number) => void;
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
export const BusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = `${import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api"}/buses`;

  // ------------------------------
  // Map _id to id
  // ------------------------------
  const mapBus = (bus: BusFromDB): BusType => ({
    ...bus,
    id: bus._id,
    lastRowSeats: bus.lastRowSeats ?? undefined,
  });

  // ------------------------------
  // Fetch all buses
  // ------------------------------
  const fetchBuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ success: boolean; data: BusFromDB[] }>(API_URL);
      const mapped = res.data.data.map(mapBus);
      setBuses(mapped);
      localStorage.setItem("buses", JSON.stringify(mapped));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch buses");
      const cached = localStorage.getItem("buses");
      if (cached) setBuses(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Add bus
  // ------------------------------
  const addBus = async (bus: Omit<BusType, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post<{ success: boolean; data: BusFromDB }>(API_URL, bus);
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
  // Update bus
  // ------------------------------
  const updateBus = async (id: string, bus: Partial<Omit<BusType, "id">>) => {
    setError(null);
    try {
      const res = await axios.put<{ success: boolean; data: BusFromDB }>(`${API_URL}/${id}`, bus);
      const updated = mapBus(res.data.data);
      setBuses((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      console.error(err);
      setError("Failed to update bus");
    }
  };

  // ------------------------------
  // Delete bus
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
  // Toggle bus status
  // ------------------------------
  const toggleBusStatus = async (id: string) => {
    const bus = buses.find((b) => b.id === id);
    if (!bus) return;
    const newStatus = bus.status === "active" ? "inactive" : "active";
    await updateBus(id, { status: newStatus });
  };

  // ------------------------------
  // Seat selection
  // ------------------------------
  const selectSeat = (busId: string, seatNumber: string | number) => {
    const bus = buses.find((b) => b.id === busId);
    if (!bus) return;

    const seat = bus.seats.find((s) => String(s.seatNumber) === String(seatNumber));
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

  const deselectSeat = (seatNumber: string | number) => {
    setSelectedSeats((prev) => prev.filter((s) => String(s) !== String(seatNumber)));
  };

  const clearSelectedSeats = () => setSelectedSeats([]);

  // ------------------------------
  // Update seat status
  // ------------------------------
  const updateSeats = async (busId: string, seatUpdates: SeatUpdate[]) => {
    try {
      const res = await axios.put<{ success: boolean; data: BusFromDB }>(
        `${API_URL}/${busId}/update-seats`,
        { seats: seatUpdates }
      );
      const updatedBus = mapBus(res.data.data);
      setBuses((prev) => prev.map((b) => (b.id === busId ? updatedBus : b)));
    } catch (err) {
      console.error("Seat update failed", err);
      setError("Failed to update seats");
    }
  };

  // ------------------------------
  // Initial fetch
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
