import { db, events } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export type VillageEvent = typeof events.$inferSelect;

export async function readEvents(): Promise<VillageEvent[]> {
  return await db.select().from(events);
}

export async function getUpcomingEvents(): Promise<VillageEvent[]> {
  const today = new Date().toISOString().split("T")[0];
  const list = await db.select().from(events);
  return list
    .filter((e) => (e.date || "") >= today)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
}

export async function createEvent(data: Omit<VillageEvent, "id" | "createdAt">): Promise<VillageEvent> {
  const ev: VillageEvent = {
    ...data,
    time: data.time ?? null,
    location: data.location ?? null,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  const result = await db.insert(events).values(ev).returning();
  return result[0];
}

export async function deleteEvent(id: string): Promise<void> {
  await db.delete(events).where(eq(events.id, id));
}
