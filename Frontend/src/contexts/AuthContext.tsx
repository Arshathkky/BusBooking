import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// -------------------- Types --------------------
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'conductor' | 'agent';
  area?: string; // ✅ Added for AgentDashboard
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

// -------------------- Context --------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

// -------------------- Provider --------------------
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  // -------------------- Login --------------------
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      // ✅ Admin login hardcoded
      if (email === 'admin@touchmeplus.com' && password === 'admin123') {
        const adminUser: User = { id: '1', name: 'Admin', email, role: 'admin' };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return adminUser;
      }

      // ✅ Owner login
      try {
        const ownerResponse = await axios.post('https://bus-booking-nt91.onrender.com/api/owner/login', { email, password });
        if (ownerResponse.data && ownerResponse.data._id) {
          const ownerUser: User = {
            id: ownerResponse.data._id,
            name: ownerResponse.data.name,
            email: ownerResponse.data.email,
            role: 'owner',
            area: ownerResponse.data.area || 'Unknown',
          };
          setUser(ownerUser);
          localStorage.setItem('user', JSON.stringify(ownerUser));
          return ownerUser;
        }
      } catch (ownerErr) {
        console.error('Owner login failed:', ownerErr);
      }

      // ✅ Conductor / Agent login
      try {
        const condResp = await axios.post('https://bus-booking-nt91.onrender.com/api/conductors/login', { email, password });
        const data = condResp.data;
        if (data && data._id) {
          const condUser: User = {
            id: data._id,
            name: data.name,
            email: data.email,
            role: data.role as 'conductor' | 'agent',
            area: data.area || 'Unknown',
          };
          setUser(condUser);
          localStorage.setItem('user', JSON.stringify(condUser));
          return condUser;
        }
      } catch (condErr) {
        console.error('Conductor/Agent login failed:', condErr);
      }

      return null;
    } catch (err) {
      console.error('Login error:', err);
      return null;
    }
  };

  // -------------------- Logout --------------------
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};
