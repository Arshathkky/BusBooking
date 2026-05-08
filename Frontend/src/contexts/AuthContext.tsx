import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

/* ===================== TYPES ===================== */

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "owner" | "conductor";

  // Optional fields
  area?: string;
  assignedBusId?: string | null;
  conductorCode?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

/* ===================== CONTEXT ===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

/* ===================== PROVIDER ===================== */

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Load user from localStorage ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  /* ===================== LOGIN ===================== */
  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    try {
      /* ===== 1️⃣ ADMIN (Hardcoded) ===== */
      if (email === "admin@touchmeplus.com" && password === "admin123") {
        const adminUser: User = {
          id: "1",
          name: "Admin",
          email,
          role: "admin",
        };

        setUser(adminUser);
        localStorage.setItem("user", JSON.stringify(adminUser));
        return adminUser;
      }

      /* ===== 2️⃣ OWNER LOGIN ===== */
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api";
        const ownerResponse = await axios.post(
          `${API_BASE}/owner/login`,
          { email, password }
        );

        const data = ownerResponse.data;

        if (data && data._id) {
          const ownerUser: User = {
            id: data._id,
            name: data.name,
            email: data.email,
            role: "owner",
            area: data.area || "Unknown",
          };

          setUser(ownerUser);
          localStorage.setItem("user", JSON.stringify(ownerUser));
          return ownerUser;
        }
      } catch {
        // silent fail → try next login type
      }

      /* ===== 3️⃣ CONDUCTOR / AGENT LOGIN ===== */
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api";
        const condResp = await axios.post(
          `${API_BASE}/conductors/login`,
          { email, password }
        );

        const data = condResp.data;

        if (data && data._id) {
          const condUser: User = {
            id: data._id,
            name: data.name,
            email: data.email,
            role: data.role as "conductor",
            area: data.city || "Unknown",

            // 🔥 Important for conductor dashboard
            assignedBusId: data.assignedBusId || null,
            conductorCode: data.conductorCode || null,
          };

          setUser(condUser);
          localStorage.setItem("user", JSON.stringify(condUser));
          return condUser;
        }
      } catch {
        // silent fail
      }

      return null;
    } catch (err) {
      console.error("Login error:", err);
      return null;
    }
  };

  /* ===================== LOGOUT ===================== */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};  
