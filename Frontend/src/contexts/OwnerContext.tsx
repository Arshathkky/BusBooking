import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

export interface Owner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  address?: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  registrationDocumentUrl?: string;
  status: "pending" | "active" | "suspended";
  createdAt?: string;
}

interface OwnerContextType {
  owners: Owner[];
  owner: Owner | null; // ✅ Add current owner
  loading: boolean;
  error: string | null;
  fetchOwners: () => Promise<void>;
  setOwner: (owner: Owner | null) => void; // ✅ Add setter
  addOwner: (data: Omit<Owner, "_id" | "status">) => Promise<void>;
  updateOwner: (id: string, data: Partial<Owner>) => Promise<void>;
  deleteOwner: (id: string) => Promise<void>;
  approveOwner: (id: string) => Promise<void>;
  rejectOwner: (id: string) => Promise<void>;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

export const useOwner = (): OwnerContextType => {
  const context = useContext(OwnerContext);
  if (!context) throw new Error("useOwner must be used within an OwnerProvider");
  return context;
};

export const OwnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [owner, setOwner] = useState<Owner | null>(null); // ✅ current logged owner
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:5000/api/owner";

  const fetchOwners = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<Owner[]>(API_URL);
      setOwners(data);
    } catch (err) {
      console.error("Failed to fetch owners", err);
      setError("Failed to fetch owners");
    } finally {
      setLoading(false);
    }
  };

  const addOwner = async (data: Omit<Owner, "_id" | "status">) => {
    setLoading(true);
    setError(null);
    try {
      const { data: newOwner } = await axios.post<Owner>(API_URL, data);
      setOwners((prev) => [...prev, newOwner]);
      setOwner(newOwner); // ✅ Automatically set newly added owner
    } catch (err) {
      console.error("Failed to add owner", err);
      setError("Failed to add owner");
    } finally {
      setLoading(false);
    }
  };

  const updateOwner = async (id: string, data: Partial<Owner>) => {
    try {
      const { data: updated } = await axios.put<Owner>(`${API_URL}/${id}`, data);
      setOwners((prev) => prev.map((o) => (o._id === id ? updated : o)));
      if (owner?._id === id) setOwner(updated); // ✅ keep current owner in sync
    } catch (err) {
      console.error("Failed to update owner", err);
    }
  };

  const approveOwner = async (id: string) => updateOwner(id, { status: "active" });
  const rejectOwner = async (id: string) => updateOwner(id, { status: "suspended" });

  const deleteOwner = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setOwners((prev) => prev.filter((o) => o._id !== id));
      if (owner?._id === id) setOwner(null);
    } catch (err) {
      console.error("Failed to delete owner", err);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  return (
    <OwnerContext.Provider
      value={{
        owners,
        owner,       // ✅ include
        setOwner,    // ✅ include
        loading,
        error,
        fetchOwners,
        addOwner,
        updateOwner,
        deleteOwner,
        approveOwner,
        rejectOwner,
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
};
