import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// -------------------- Types --------------------
export interface PassengerDetails {
  name: string;
  phone: string;
  address: string;
}

export interface BusInfo {
  id: string;
  name: string;
  type?: string;
}

export interface SearchData {
  from: string;
  to: string;
  date: string;
}

export type PaymentStatus = "Pending" | "Paid" | "Cancelled";

export interface Booking {
  _id?: string;
  bus: BusInfo;
  searchData: SearchData;
  selectedSeats: string[];
  totalAmount: number;
  passengerDetails: PassengerDetails;
  paymentStatus?: PaymentStatus;
  createdAt?: string;
  updatedAt?: string;
}

// -------------------- Context Type --------------------
interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error?: string;
  fetchBookings: () => Promise<void>;
  addBooking: (booking: Omit<Booking, "_id">) => Promise<Booking | null>;
  updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
  getBookingById: (id: string) => Promise<Booking | null>;
}

// -------------------- Context --------------------
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// -------------------- Hook --------------------
export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within a BookingProvider");
  return context;
};

// -------------------- Provider --------------------
export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/bookings`
    : "http://localhost:5000/api/bookings";

  // -------------------- Error Handling --------------------
  const handleError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.message || err.message);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("An unknown error occurred");
    }
  };

  // -------------------- Fetch all bookings --------------------
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<{ success: boolean; bookings: Booking[] }>(API_URL);
      if (data.success) setBookings(data.bookings);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Add a new booking --------------------
  const addBooking = async (booking: Omit<Booking, "_id">): Promise<Booking | null> => {
    try {
      setLoading(true);
      const { data } = await axios.post<{ success: boolean; booking: Booking }>(API_URL, booking);
      if (data.success) {
        setBookings((prev) => [...prev, data.booking]);
        return data.booking;
      }
      return null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Get booking by ID --------------------
  const getBookingById = async (id: string): Promise<Booking | null> => {
    try {
      setLoading(true);
      const { data } = await axios.get<{ success: boolean; booking: Booking }>(`${API_URL}/${id}`);
      return data.success ? data.booking : null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Update payment status --------------------
  const updatePaymentStatus = async (id: string, status: PaymentStatus) => {
    try {
      setLoading(true);
      const { data } = await axios.put<{ success: boolean; booking: Booking }>(
        `${API_URL}/${id}/payment`,
        { paymentStatus: status }
      );
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? data.booking : b))
        );
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Fetch bookings on mount --------------------
  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,
        fetchBookings,
        addBooking,
        updatePaymentStatus,
        getBookingById,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
