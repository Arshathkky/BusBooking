import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

// -------------------- Types --------------------
export interface RouteType {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  stops: string[];
  distance: number;
  duration: string;
  status: "active" | "inactive";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface RouteFromDB extends Omit<RouteType, "id"> {
  _id: string;
}

export interface BusType {
  _id: string;
  name: string;
  companyName: string;
  type: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  totalSeats: number;
  price: number;
  amenities: string[];
  isSpecial: boolean;
  specialTime?: string;
  routeName?: string;
  startPoint?: string;
  endPoint?: string;
  stops?: string[];
}

interface SearchData {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

// -------------------- Context Type --------------------
interface RouteContextType {
  routes: RouteType[];
  fetchRoutes: (ownerId?: string) => Promise<void>;
  addRoute: (
    route: Omit<RouteType, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateRoute: (id: string, route: Partial<RouteType>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  toggleRouteStatus: (id: string) => Promise<void>;

  // 🔍 New Search Features
  searchData: SearchData;
  setSearchData: React.Dispatch<React.SetStateAction<SearchData>>;
  searchResults: BusType[];
  searchBuses: () => Promise<void>;

  loading: boolean;
  error: string | null;
}

// -------------------- Context --------------------
const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const useRouteData = (): RouteContextType => {
  const context = useContext(RouteContext);
  if (!context)
    throw new Error("useRouteData must be used within a RouteProvider");
  return context;
};

// -------------------- Provider --------------------
export const RouteProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 New states for search
  const [searchData, setSearchData] = useState<SearchData>({
    from: "",
    to: "",
    date: "",
    passengers: 1,
  });
  const [searchResults, setSearchResults] = useState<BusType[]>([]);

  const API_URL = "http://localhost:5000/api/routes";
  const SEARCH_API_URL = "http://localhost:5000/api/search/buses";

  // -------------------- Fetch Routes --------------------
  const fetchRoutes = async (ownerId?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const url = ownerId ? `${API_URL}?ownerId=${ownerId}` : API_URL;
      const response = await axios.get<RouteFromDB[]>(url);

      const mappedRoutes: RouteType[] = response.data.map((route) => ({
        ...route,
        id: route._id,
      }));
      setRoutes(mappedRoutes);
    } catch (err) {
      console.error("Fetch routes error:", err);
      setError("Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Add Route --------------------
  const addRoute = async (
    route: Omit<RouteType, "id" | "createdAt" | "updatedAt">
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<RouteFromDB>(API_URL, route);
      const newRoute: RouteType = { ...response.data, id: response.data._id };
      setRoutes((prev) => [...prev, newRoute]);
    } catch (err) {
      console.error("Add route error:", err);
      setError("Failed to add route");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Update Route --------------------
  const updateRoute = async (
    id: string,
    route: Partial<RouteType>
  ): Promise<void> => {
    setError(null);
    try {
      const response = await axios.put<RouteFromDB>(`${API_URL}/${id}`, route);
      const updatedRoute: RouteType = { ...response.data, id: response.data._id };
      setRoutes((prev) =>
        prev.map((r) => (r.id === id ? updatedRoute : r))
      );
    } catch (err) {
      console.error("Update route error:", err);
      setError("Failed to update route");
    }
  };

  // -------------------- Delete Route --------------------
  const deleteRoute = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete route error:", err);
      setError("Failed to delete route");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Toggle Route Status --------------------
  const toggleRouteStatus = async (id: string): Promise<void> => {
    const route = routes.find((r) => r.id === id);
    if (!route) return;

    const newStatus: RouteType["status"] =
      route.status === "active" ? "inactive" : "active";

    try {
      await updateRoute(id, { status: newStatus });
    } catch (err) {
      console.error("Toggle route status error:", err);
      setError("Failed to toggle route status");
    }
  };

  // -------------------- Search Buses --------------------
  const searchBuses = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { from, to } = searchData;
      if (!from || !to) {
        setError("Please enter both From and To locations");
        return;
      }

      const response = await axios.get<BusType[]>(
        `${SEARCH_API_URL}?from=${from}&to=${to}`
      );
      setSearchResults(response.data);
    } catch (err) {
      console.error("Search buses error:", err);
      setError("Failed to fetch buses");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Load Routes on Mount --------------------
  useEffect(() => {
    fetchRoutes();
  }, []);

  return (
    <RouteContext.Provider
      value={{
        routes,
        fetchRoutes,
        addRoute,
        updateRoute,
        deleteRoute,
        toggleRouteStatus,
        searchData,
        setSearchData,
        searchResults,
        searchBuses,
        loading,
        error,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
};
