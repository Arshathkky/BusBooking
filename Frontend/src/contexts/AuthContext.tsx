import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
//import { useOwner } from './OwnerContext';
import { useConductor } from '../contexts/conductorDataContext';

// -------------------- Types --------------------
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'agent' | 'conductor';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

// -------------------- Context --------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

// -------------------- Provider --------------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { conductors } = useConductor();
  //const { owners } = useOwner();

  // Load user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  // -------------------- Login Logic --------------------
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // ✅ Admin login hardcoded
      if (email === 'admin@touchmeplus.com' && password === 'admin123') {
        const adminUser: User = { id: '1', name: 'Admin', email, role: 'admin' };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return true;
      }

      // ✅ Owner login via backend
      const ownerResponse = await axios.post('http://localhost:5000/api/owner/login', { email, password });
      if (ownerResponse.data) {
        const ownerUser: User = {
          id: ownerResponse.data._id,
          name: ownerResponse.data.name,
          email: ownerResponse.data.email,
          role: 'owner'
        };
        setUser(ownerUser);
        localStorage.setItem('user', JSON.stringify(ownerUser));
        return true;
      }

      // ✅ Conductor login (if you have a backend endpoint, replace this with axios call)
      const conductor = conductors.find(c => c.email === email && c.password === password);
      if (conductor) {
        const conductorUser: User = {
          id: conductor.id,
          name: conductor.name,
          email,
          role: conductor.role
        };
        setUser(conductorUser);
        localStorage.setItem('user', JSON.stringify(conductorUser));
        return true;
      }

      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
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
