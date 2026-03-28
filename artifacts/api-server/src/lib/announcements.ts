import Database from "@replit/database";
import crypto from "crypto";

const db = new Database();
const KEY = "studio_luna:announcements";

export type Announcement = {
  id: string;
  type: "bevallen";
  memberId: string;
  memberName: string;
  shareConsent: boolean;
  note?: string;
  createdAt: string;
  seenByAdmin: boolean;
};

async function read(): Promise<Announcement[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return [];
    const data = result?.value ?? result;
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function save(items: Announcement[]): Promise<void> {
  await db.set(KEY, items);
}

export async function readAnnouncements(): Promise<Announcement[]> {
  return read();
}

export async function saveAnnouncements(items: Announcement[]): Promise<void> {
  await save(items);
}

export async function createAnnouncement(data: Omit<Announcement, "id" | "createdAt" | "seenByAdmin">): Promise<Announcement> {
  const items = await read();
  const item: Announcement = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    seenByAdmin: false,
  };
  items.push(item);
  await save(items);
  return item;
}

export async function markAnnouncementSeen(id: string): Promise<Announcement> {
  const items = await read();
  const item = items.find((a) => a.id === id);
  if (!item) throw new Error("Niet gevonden");
  item.seenByAdmin = true;
  await save(items);
  return item;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await save((await read()).filter((a) => a.id !== id));
}
