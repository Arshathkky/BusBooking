  // src/contexts/DataContext.tsx
  import React, { createContext, useContext, useState, ReactNode } from "react";

  export interface Route {
    id: string;
    name: string;
    startPoint: string;
    endPoint: string;
    distance: number;
    duration: string;
    status: "active" | "inactive";
    createdAt: string;
  }

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

  export interface Conductor {
    id: string;
    name: string;
    phone: string;
    email: string;
    assignedBusId?: string;
    ownerId: string;
    status: "active" | "inactive";
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

  interface DataContextType {
    routes: Route[];
    users: User[];
    conductors: Conductor[];
    bookings: Booking[];

    addRoute: (route: Omit<Route, "id" | "createdAt">) => void;
    updateRoute: (id: string, route: Partial<Route>) => void;
    deleteRoute: (id: string) => void;

    addUser: (user: Omit<User, "id" | "createdAt">) => void;
    updateUser: (id: string, user: Partial<User>) => void;
    deleteUser: (id: string) => void;

    addConductor: (conductor: Omit<Conductor, "id">) => void;
    updateConductor: (id: string, conductor: Partial<Conductor>) => void;
    deleteConductor: (id: string) => void;

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

  const DataContext = createContext<DataContextType | undefined>(undefined);

  export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within a DataProvider");
    return context;
  };

  // Dummy initial data
  const initialRoutes: Route[] = [
    {
      id: "1",
      name: "Colombo - Kandy Express",
      startPoint: "Colombo",
      endPoint: "Kandy",
      distance: 115,
      duration: "3h 30m",
      status: "active",
      createdAt: "2024-01-01",
    },
  ];

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

  const initialConductors: Conductor[] = [];
  const initialBookings: Booking[] = [];

  export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [routes, setRoutes] = useState<Route[]>(initialRoutes);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [conductors, setConductors] = useState<Conductor[]>(initialConductors);
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);

    // 🔹 Routes CRUD
    const addRoute = (route: Omit<Route, "id" | "createdAt">) => {
      const newRoute: Route = {
        ...route,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setRoutes((prev) => [...prev, newRoute]);
    };

    const updateRoute = (id: string, route: Partial<Route>) =>
      setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, ...route } : r)));

    const deleteRoute = (id: string) => setRoutes((prev) => prev.filter((r) => r.id !== id));

    // 🔹 Users CRUD
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

    // 🔹 Conductors CRUD
    const addConductor = (conductor: Omit<Conductor, "id">) => {
      const newConductor: Conductor = { ...conductor, id: Date.now().toString() };
      setConductors((prev) => [...prev, newConductor]);
    };

    const updateConductor = (id: string, conductor: Partial<Conductor>) =>
      setConductors((prev) => prev.map((c) => (c.id === id ? { ...c, ...conductor } : c)));

    const deleteConductor = (id: string) => setConductors((prev) => prev.filter((c) => c.id !== id));

    // 🔹 Bookings CRUD
    const addBooking = (booking: Omit<Booking, "id">) => {
      const newBooking: Booking = { ...booking, id: Date.now().toString() };
      setBookings((prev) => [...prev, newBooking]);
    };

    const updateBooking = (id: string, booking: Partial<Booking>) =>
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...booking } : b)));

    // 🔹 Queries
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
          routes,
          users,
          conductors,
          bookings,
          addRoute,
          updateRoute,
          deleteRoute,
          addUser,
          updateUser,
          deleteUser,
          addConductor,
          updateConductor,
          deleteConductor,
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
