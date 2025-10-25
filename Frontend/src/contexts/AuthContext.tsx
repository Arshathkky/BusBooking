import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'owner' | 'conductor' | 'admin';
  phone?: string;
  address?: string;
  approved?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demonstration
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@touchmeplus.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Bus Owner',
    email: 'owner@touchmeplus.com',
    password: 'owner123',
    role: 'owner',
    approved: true
  },
  {
    id: '3',
    name: 'Conductor',
    email: 'conductor@touchmeplus.com',
    password: 'conductor123',
    role: 'conductor'
  },
  {
    id: '4',
    name: 'Agent',
    email: 'agent@touchmeplus.com',
    password: 'agent123',
    role: 'agent'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    // Mock registration - in real app, this would call an API
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'agent',
      phone: userData.phone,
      address: userData.address,
      approved: userData.role === 'agent' ? true : false
    };
    
    mockUsers.push({ ...newUser, password: userData.password });
    
    if (userData.role === 'agent') {
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};