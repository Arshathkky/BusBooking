import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

// Enable sending cookies automatically with cross-origin requests
axios.defaults.withCredentials = true;

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
      const API_BASE = import.meta.env.VITE_API_URL || "https://busbooking-backend-development.onrender.com/api";

      /* ===== 1️⃣ OWNER / ADMIN LOGIN (same endpoint, role returned from backend) ===== */
      try {
        const ownerResponse = await axios.post(
          `${API_BASE}/owner/login`,
          { email, password }
        );

        const data = ownerResponse.data;

        if (data && data.success && data.user) {
          // Token is stored as HttpOnly cookie by backend — do NOT store in localStorage
          const loggedUser: User = {
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role as "admin" | "owner" | "conductor",
            area: data.user.companyName || undefined,
          };

          setUser(loggedUser);
          localStorage.setItem("user", JSON.stringify(loggedUser));
          return loggedUser;
        }
      } catch (err) {
        // Not an owner/admin — try conductor login
      }

      /* ===== 2️⃣ CONDUCTOR LOGIN ===== */
      try {
        const condResp = await axios.post(
          `${API_BASE}/conductors/login`,
          { email, password }
        );

        const data = condResp.data;

        if (data && data.success && data.user) {
          // Token is stored as HttpOnly cookie by backend — do NOT store in localStorage
          const condUser: User = {
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role as "conductor",
            area: data.user.city || "Unknown",

            // 🔥 Important for conductor dashboard
            assignedBusId: data.user.assignedBusId || null,
            conductorCode: data.user.conductorCode || null,
          };

          setUser(condUser);
          localStorage.setItem("user", JSON.stringify(condUser));
          return condUser;
        }
      } catch (err) {
        // silent fail
      }

      return null;
    } catch (err) {
      console.error("Login error:", err);
      return null;
    }
  };

  /* ===================== LOGOUT ===================== */
  const logout = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "https://busbooking-backend-development.onrender.com/api";
      await axios.post(`${API_BASE}/logout`);
    } catch (err) {
      console.error("Failed to call logout on backend:", err);
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};  
