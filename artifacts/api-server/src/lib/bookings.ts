import Database from "@replit/database";
import crypto from "crypto";

export type Booking = {
  id: string;
  memberId: string;
  classId: string;
  className: string;
  date: string;
  time: string;
  type: "yoga" | "circle";
  isProefles: boolean;
  isLosseLes: boolean;
  bookedAt: string;
};

const db = new Database();
const BOOKINGS_KEY = "studio_luna:bookings";

export async function readBookings(): Promise<Booking[]> {
  try {
    const result = (await db.get(BOOKINGS_KEY)) as any;
    const data = result?.value ?? result;
    return Array.isArray(data) ? (data as Booking[]) : [];
  } catch {
    return [];
  }
}

export async function saveBookings(bookings: Booking[]): Promise<void> {
  await db.set(BOOKINGS_KEY, bookings);
}

export async function getMemberBookings(memberId: string): Promise<Booking[]> {
  const bookings = await readBookings();
  return bookings.filter((b) => b.memberId === memberId);
}

export async function getMemberBookingCount(memberId: string): Promise<number> {
  const bookings = await readBookings();
  return bookings.filter((b) => b.memberId === memberId).length;
}

export async function getAllBookings(): Promise<Booking[]> {
  return readBookings();
}

export async function createBooking(
  data: Omit<Booking, "id" | "bookedAt"> & { isProefles?: boolean; isLosseLes?: boolean }
): Promise<Booking> {
  const bookings = await readBookings();
  const existing = bookings.find(
    (b) => b.memberId === data.memberId && b.classId === data.classId && b.date === data.date
  );
  if (existing) throw new Error("Je hebt deze les al geboekt");
  const booking: Booking = {
    ...data,
    isProefles: data.isProefles ?? false,
    isLosseLes: data.isLosseLes ?? false,
    id: crypto.randomUUID(),
    bookedAt: new Date().toISOString(),
  };
  bookings.push(booking);
  await saveBookings(bookings);
  return booking;
}

export async function deleteBooking(id: string, memberId: string): Promise<boolean> {
  const bookings = await readBookings();
  const booking = bookings.find((b) => b.id === id && b.memberId === memberId);
  if (!booking) return false;
  await saveBookings(bookings.filter((b) => b.id !== id));
  return true;
}
