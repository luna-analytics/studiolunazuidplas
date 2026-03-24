import { useState, useEffect, useCallback } from "react";
import { getToken } from "./use-auth";

export type Booking = {
  id: string;
  classId: string;
  className: string;
  date: string;
  time: string;
  type: "yoga" | "circle";
  isProefles: boolean;
  isLosseLes: boolean;
  bookedAt: string;
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function useBookings(userId?: string | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchBookings = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setBookings([]);
      setIsLoaded(true);
      return;
    }
    try {
      const res = await fetch(`${BASE}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBookings(await res.json());
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    setIsLoaded(false);
    fetchBookings();
  }, [fetchBookings, userId]);

  const addBooking = async (
    data: Omit<Booking, "id" | "bookedAt">
  ): Promise<{ credits: number }> => {
    const token = getToken();
    if (!token) throw new Error("Niet ingelogd");
    const res = await fetch(`${BASE}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error ?? "Boeken mislukt");
    setBookings((prev) => [...prev, result.booking]);
    return { credits: result.credits };
  };

  const cancelBooking = async (id: string): Promise<{ credits: number }> => {
    const token = getToken();
    if (!token) throw new Error("Niet ingelogd");
    const res = await fetch(`${BASE}/api/bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error ?? "Annuleren mislukt");
    setBookings((prev) => prev.filter((b) => b.id !== id));
    return { credits: result.credits };
  };

  const isBooked = (classId: string, date: string) =>
    bookings.some((b) => b.classId === classId && b.date === date);

  return { bookings, isLoaded, addBooking, cancelBooking, isBooked, refetch: fetchBookings };
}
