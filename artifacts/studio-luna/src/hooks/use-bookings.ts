import { useState, useEffect } from "react";

export type Booking = {
  id: string;
  classId: string;
  className: string;
  date: string; // ISO string
  time: string;
  type: 'yoga' | 'circle';
  bookedAt: string;
};

const STORAGE_KEY = "studio_luna_bookings";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBookings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse bookings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const addBooking = (newBooking: Omit<Booking, "id" | "bookedAt">) => {
    const booking: Booking = {
      ...newBooking,
      id: Math.random().toString(36).substring(2, 9),
      bookedAt: new Date().toISOString(),
    };
    
    const updated = [...bookings, booking];
    setBookings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return booking;
  };

  const cancelBooking = (id: string) => {
    const updated = bookings.filter(b => b.id !== id);
    setBookings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const isBooked = (classId: string, date: string) => {
    return bookings.some(b => b.classId === classId && b.date === date);
  };

  return {
    bookings,
    isLoaded,
    addBooking,
    cancelBooking,
    isBooked
  };
}
