import React, { createContext, useContext, useState, ReactNode } from "react";

// -------------------- Types --------------------
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "customer" | "owner" | "conductor" | "admin";
  status: "active" | "pending" | "suspended";
  createdAt: string;
}

export interface Booking {
  id: string;
  busId: string;
  routeId: string;
  passengerName: string;
  passengerPhone: string;
  passengerAddress: string;
  selectedSeats: number[];
  totalAmount: number;
  bookingDate: string;
  travelDate: string;
  status: "confirmed" | "completed" | "cancelled";
  bookingId: string;
  referenceId: string;
  pickupLocation?: string;
}

// -------------------- Context Type --------------------
interface DataContextType {
  users: User[];
  bookings: Booking[];

  addUser: (user: Omit<User, "id" | "createdAt">) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  addBooking: (booking: Omit<Booking, "id">) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;

  getBookingsByBus: (busId: string) => Booking[];
  getBookingsByDate: (date: string) => Booking[];
  getTodayStats: () => {
    totalBookings: number;
    totalEarnings: number;
    totalPassengers: number;
  };
}

// -------------------- Context --------------------
const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};

// -------------------- Dummy Initial Data --------------------
const initialUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@busbook.com",
    phone: "+94 11 250 8888",
    address: "Colombo 07",
    role: "admin",
    status: "active",
    createdAt: "2024-01-01",
  },
];

const initialBookings: Booking[] = [];

// -------------------- Provider --------------------
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  // -------------------- Users CRUD --------------------
  const addUser = (user: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (id: string, user: Partial<User>) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...user } : u)));

  const deleteUser = (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id));

  // -------------------- Bookings CRUD --------------------
  const addBooking = (booking: Omit<Booking, "id">) => {
    const newBooking: Booking = { ...booking, id: Date.now().toString() };
    setBookings((prev) => [...prev, newBooking]);
  };

  const updateBooking = (id: string, booking: Partial<Booking>) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...booking } : b)));

  // -------------------- Queries --------------------
  const getBookingsByBus = (busId: string) => bookings.filter((b) => b.busId === busId);

  const getBookingsByDate = (date: string) => bookings.filter((b) => b.travelDate === date);

  const getTodayStats = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayBookings = bookings.filter((b) => b.bookingDate === today);
    return {
      totalBookings: todayBookings.length,
      totalEarnings: todayBookings.reduce((sum, b) => sum + b.totalAmount, 0),
      totalPassengers: todayBookings.reduce((sum, b) => sum + b.selectedSeats.length, 0),
    };
  };

  return (
    <DataContext.Provider
      value={{
        users,
        bookings,
        addUser,
        updateUser,
        deleteUser,
        addBooking,
        updateBooking,
        getBookingsByBus,
        getBookingsByDate,
        getTodayStats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
