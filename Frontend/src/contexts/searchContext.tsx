import React, { createContext, useContext, useState, ReactNode } from "react";
import axios, { AxiosError } from "axios";

export interface SearchData {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

export interface BusInfo {
  id: string;
  name: string;
  type: string;
  company: string;
  routeId: string;
  startPoint: string;
  endPoint: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatsAvailable: number;
  totalSeats: number;
  stops: string[];
}

export interface SearchResults {
  buses: BusInfo[];
  busesByCompany: Record<string, BusInfo[]>;
}

interface SearchContextType {
  searchData: SearchData;
  setSearchData: React.Dispatch<React.SetStateAction<SearchData>>;
  results: SearchResults;
  loading: boolean;
  error: string | null;
  searchBuses: (data?: SearchData) => Promise<void>;
  clearResults: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchData, setSearchData] = useState<SearchData>({
    from: "",
    to: "",
    date: "",
    passengers: 1,
  });

  const [results, setResults] = useState<SearchResults>({
    buses: [],
    busesByCompany: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "https://bus-booking-nt91.onrender.com/api/search";

  const searchBuses = async (data?: SearchData): Promise<void> => {
    const query = data || searchData;

    if (!query.from || !query.to || !query.date) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Use GET request with query params
      const response = await axios.get<{ buses: BusInfo[] }>(`${API_URL}/buses`, {
        params: query,
      });

      const buses = response.data.buses || [];

      // ✅ Filter buses by available seats
      const filteredBuses = buses.filter(bus => bus.seatsAvailable >= query.passengers);

      // ✅ Group buses by company
      const grouped = filteredBuses.reduce<Record<string, BusInfo[]>>((acc, bus) => {
        if (!acc[bus.company]) acc[bus.company] = [];
        acc[bus.company].push(bus);
        return acc;
      }, {});

      setResults({ buses: filteredBuses, busesByCompany: grouped });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message ?? "Failed to search buses");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = (): void =>
    setResults({ buses: [], busesByCompany: {} });

  return (
    <SearchContext.Provider
      value={{
        searchData,
        setSearchData,
        results,
        loading,
        error,
        searchBuses,
        clearResults,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch must be used within a SearchProvider");
  return context;
};
