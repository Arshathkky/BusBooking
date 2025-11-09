import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// -------------------- Types --------------------
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'conductor' | 'agent';
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

      // ✅ Try Owner login
      try {
        const ownerResponse = await axios.post('http://localhost:5000/api/owner/login', { email, password });
        console.log('Owner login response:', ownerResponse.data);

        if (ownerResponse.data && ownerResponse.data._id) {
          const ownerUser: User = {
            id: ownerResponse.data._id,
            name: ownerResponse.data.name,
            email: ownerResponse.data.email,
            role: 'owner',
          };
          setUser(ownerUser);
          localStorage.setItem('user', JSON.stringify(ownerUser));
          return ownerUser;
        }
      } catch (ownerErr) {
        console.log('Owner login failed:', ownerErr);
      }

      // ✅ Try Conductor / Agent login
      try {
        const conductorResponse = await axios.post('http://localhost:5000/api/conductors/login', { email, password });
        console.log('Conductor login response:', conductorResponse.data);

        const data = conductorResponse.data;
        if (data && data._id) {
          const conductorUser: User = {
            id: data._id,
            name: data.name,
            email: data.email,
            role: data.role as 'conductor' | 'agent',
          };
          setUser(conductorUser);
          localStorage.setItem('user', JSON.stringify(conductorUser));
          return conductorUser;
        }
      } catch (condErr) {
        console.log('Conductor login failed:', condErr);
      }

      // ❌ If both failed
      return null;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('Login error (Axios):', err.response?.data || err.message);
      } else if (err instanceof Error) {
        console.error('Login error:', err.message);
      } else {
        console.error('Unexpected error:', err);
      }
      return null;
    }
  };

  // -------------------- Logout --------------------
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
