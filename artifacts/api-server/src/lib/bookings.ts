import fs from "fs";
import path from "path";
import crypto from "crypto";

export type Booking = {
  id: string;
  memberId: string;
  classId: string;
  className: string;
  date: string;
  time: string;
  type: "yoga" | "circle";
  bookedAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "bookings.json");

function ensureFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export function readBookings(): Booking[] {
  try {
    ensureFile();
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function saveBookings(bookings: Booking[]) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));
}

export function getMemberBookings(memberId: string): Booking[] {
  return readBookings().filter((b) => b.memberId === memberId);
}

export function getAllBookings(): Booking[] {
  return readBookings();
}

export function createBooking(data: Omit<Booking, "id" | "bookedAt">): Booking {
  const bookings = readBookings();
  const existing = bookings.find(
    (b) => b.memberId === data.memberId && b.classId === data.classId && b.date === data.date
  );
  if (existing) throw new Error("Je hebt deze les al geboekt");
  const booking: Booking = {
    ...data,
    id: crypto.randomUUID(),
    bookedAt: new Date().toISOString(),
  };
  bookings.push(booking);
  saveBookings(bookings);
  return booking;
}

export function deleteBooking(id: string, memberId: string): boolean {
  const bookings = readBookings();
  const booking = bookings.find((b) => b.id === id && b.memberId === memberId);
  if (!booking) return false;
  saveBookings(bookings.filter((b) => b.id !== id));
  return true;
}
