import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// -------------------- Types --------------------
export interface ConductorType {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;   // ✅ NEW
  assignedBusId?: string;
  ownerId: string;
  status: "active" | "inactive";
  role: "conductor" | "agent";
  agentCode?:string;
}

interface ConductorFromDB extends Omit<ConductorType, "id"> {
  _id: string;
}

interface ConductorContextType {
  conductors: ConductorType[];
  fetchConductors: (ownerId?: string) => Promise<void>;
  addConductor: (conductor: Omit<ConductorType, "id">) => Promise<void>;
  updateConductor: (id: string, data: Partial<ConductorType>) => Promise<void>;
  deleteConductor: (id: string) => Promise<void>;
  toggleConductorStatus: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// -------------------- Context --------------------
const ConductorContext = createContext<ConductorContextType | undefined>(undefined);

export const useConductor = (): ConductorContextType => {
  const context = useContext(ConductorContext);
  if (!context) throw new Error("useConductor must be used within ConductorProvider");
  return context;
};

// -------------------- Provider --------------------
export const ConductorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conductors, setConductors] = useState<ConductorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:5000/api/conductors";

  // -------------------- Fetch --------------------
  const fetchConductors = async (ownerId?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const url = ownerId ? `${API_URL}/owner/${ownerId}` : API_URL;
      const response = await axios.get<ConductorFromDB[]>(url);
      const mapped = response.data.map((c) => ({ ...c, id: c._id }));
      setConductors(mapped);
    } catch (err) {
      setError("Failed to fetch conductors");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Add --------------------
  const addConductor = async (conductor: Omit<ConductorType, "id">): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<ConductorFromDB>(API_URL, conductor);
      const newConductor: ConductorType = { ...response.data, id: response.data._id };
      setConductors((prev) => [...prev, newConductor]);
    } catch (err) {
      setError("Failed to add conductor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Update --------------------
  const updateConductor = async (id: string, data: Partial<ConductorType>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put<ConductorFromDB>(`${API_URL}/${id}`, data);
      const updated: ConductorType = { ...response.data, id: response.data._id };
      setConductors((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      setError("Failed to update conductor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Delete --------------------
  const deleteConductor = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setConductors((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError("Failed to delete conductor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Toggle Status --------------------
  const toggleConductorStatus = async (id: string): Promise<void> => {
    setError(null);
    try {
      // Optimistic update (immediate UI feedback)
      setConductors((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c
        )
      );

      await axios.patch<ConductorFromDB>(`${API_URL}/${id}/toggle-status`);
    } catch (err) {
      setError("Failed to toggle conductor status");
      console.error(err);
      // Re-fetch to correct state if error occurs
      fetchConductors();
    }
  };

  // -------------------- Load on Mount --------------------
  useEffect(() => {
    fetchConductors();
  }, []);

  return (
    <ConductorContext.Provider
      value={{
        conductors,
        fetchConductors,
        addConductor,
        updateConductor,
        deleteConductor,
        toggleConductorStatus,
        loading,
        error,
      }}
    >
      {children}
    </ConductorContext.Provider>
  );
};
