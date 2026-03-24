import fs from "fs";
import path from "path";
import crypto from "crypto";

export type VillageEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  description: string;
  location?: string;
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "events.json");

function ensureFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}

export function readEvents(): VillageEvent[] {
  try { ensureFile(); return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); } catch { return []; }
}

function save(events: VillageEvent[]) { ensureFile(); fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2)); }

export function getUpcomingEvents(): VillageEvent[] {
  const today = new Date().toISOString().split("T")[0];
  return readEvents()
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function createEvent(data: Omit<VillageEvent, "id" | "createdAt">): VillageEvent {
  const events = readEvents();
  const ev: VillageEvent = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  events.push(ev);
  save(events);
  return ev;
}

export function deleteEvent(id: string) { save(readEvents().filter((e) => e.id !== id)); }
