import Database from "@replit/database";
import crypto from "crypto";

const db = new Database();
const KEY = "studio_luna:events";

export type VillageEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  description: string;
  location?: string;
  createdAt: string;
};

async function read(): Promise<VillageEvent[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return [];
    const data = result?.value ?? result;
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function save(events: VillageEvent[]): Promise<void> {
  await db.set(KEY, events);
}

export async function readEvents(): Promise<VillageEvent[]> {
  return read();
}

export async function getUpcomingEvents(): Promise<VillageEvent[]> {
  const today = new Date().toISOString().split("T")[0];
  return (await read())
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function createEvent(data: Omit<VillageEvent, "id" | "createdAt">): Promise<VillageEvent> {
  const events = await read();
  const ev: VillageEvent = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  events.push(ev);
  await save(events);
  return ev;
}

export async function deleteEvent(id: string): Promise<void> {
  await save((await read()).filter((e) => e.id !== id));
}
