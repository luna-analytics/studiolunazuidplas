import { db, bookings } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import crypto from "node:crypto";

export type Booking = typeof bookings.$inferSelect;

export async function readBookings(): Promise<Booking[]> {
  return await db.select().from(bookings);
}

export async function saveBookings(bookingList: Booking[]): Promise<void> {
  if (bookingList.length === 0) return;
  for (const b of bookingList) {
    await db.insert(bookings).values(b).onConflictDoUpdate({
      target: bookings.id,
      set: b,
    });
  }
}

export async function getMemberBookings(memberId: string): Promise<Booking[]> {
  return await db.select().from(bookings).where(eq(bookings.memberId, memberId));
}

export async function getMemberBookingCount(memberId: string): Promise<number> {
  const list = await getMemberBookings(memberId);
  return list.length;
}

export async function getAllBookings(): Promise<Booking[]> {
  return await readBookings();
}

export async function createBooking(
  data: Omit<Booking, "id" | "bookedAt"> & { isProefles?: boolean; isLosseLes?: boolean }
): Promise<Booking> {
  const existingList = await db.select().from(bookings).where(
    and(
      eq(bookings.memberId, data.memberId!),
      eq(bookings.classId, data.classId!),
      eq(bookings.date, data.date!)
    )
  );
  if (existingList.length > 0) throw new Error("Je hebt deze les al geboekt");
  
  const booking: Booking = {
    ...data,
    memberId: data.memberId ?? null,
    classId: data.classId ?? null,
    className: data.className ?? null,
    date: data.date ?? null,
    time: data.time ?? null,
    type: data.type ?? null,
    isProefles: data.isProefles ?? false,
    isLosseLes: data.isLosseLes ?? false,
    id: crypto.randomUUID(),
    bookedAt: new Date().toISOString(),
  };
  
  const result = await db.insert(bookings).values(booking).returning();
  return result[0];
}

export async function deleteBooking(id: string, memberId: string): Promise<boolean> {
  const list = await db.select().from(bookings).where(and(eq(bookings.id, id), eq(bookings.memberId, memberId)));
  if (list.length === 0) return false;
  await db.delete(bookings).where(eq(bookings.id, id));
  return true;
}
