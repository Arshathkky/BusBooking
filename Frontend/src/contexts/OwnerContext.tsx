import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  password?: string;
}

interface OwnerContextType {
  owners: Owner[];
  owner: Owner | null;
  loading: boolean;
  error: string | null;
  fetchOwners: () => Promise<void>;
  setOwner: (owner: Owner | null) => void;
  addOwner: (data: Omit<Owner, "_id" | "status"> & { status?: Owner["status"] }) => Promise<void>;
  updateOwner: (id: string, data: Partial<Owner>) => Promise<void>;
  deleteOwner: (id: string) => Promise<void>;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

export const useOwner = (): OwnerContextType => {
  const context = useContext(OwnerContext);
  if (!context) throw new Error("useOwner must be used within an OwnerProvider");
  return context;
};

export const OwnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "https://bus-booking-nt91.onrender.com/api/owner";

  const handleError = (err: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.message || defaultMessage);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError(defaultMessage);
    }
    console.error(err);
  };

  const fetchOwners = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<Owner[]>(API_URL);
      setOwners(data);
    } catch (err) {
      handleError(err, "Failed to fetch owners");
    } finally {
      setLoading(false);
    }
  };

  const addOwner = async (data: Omit<Owner, "_id" | "status"> & { status?: Owner["status"] }) => {
    setLoading(true);
    setError(null);
    try {
      const { data: newOwner } = await axios.post<Owner>(API_URL, data);
      setOwners(prev => [...prev, newOwner]);
      setOwner(newOwner);
    } catch (err) {
      handleError(err, "Failed to add owner");
    } finally {
      setLoading(false);
    }
  };

  const updateOwner = async (id: string, data: Partial<Owner>) => {
    setLoading(true);
    setError(null);
    try {
      const { data: updatedOwner } = await axios.put<Owner>(`${API_URL}/${id}`, data);
      setOwners(prev => prev.map(o => (o._id === id ? updatedOwner : o)));
      if (owner?._id === id) setOwner(updatedOwner);
    } catch (err) {
      handleError(err, "Failed to update owner");
    } finally {
      setLoading(false);
    }
  };

  const deleteOwner = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setOwners(prev => prev.filter(o => o._id !== id));
      if (owner?._id === id) setOwner(null);
    } catch (err) {
      handleError(err, "Failed to delete owner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  return (
    <OwnerContext.Provider
      value={{
        owners,
        owner,
        setOwner,
        loading,
        error,
        fetchOwners,
        addOwner,
        updateOwner,
        deleteOwner,
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
};
