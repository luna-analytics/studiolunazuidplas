import fs from "fs";
import path from "path";
import crypto from "crypto";

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

const DATA_FILE = path.join(process.cwd(), "data", "announcements.json");

function ensureFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export function readAnnouncements(): Announcement[] {
  try {
    ensureFile();
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function saveAnnouncements(items: Announcement[]) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

export function createAnnouncement(data: Omit<Announcement, "id" | "createdAt" | "seenByAdmin">): Announcement {
  const items = readAnnouncements();
  const item: Announcement = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    seenByAdmin: false,
  };
  items.push(item);
  saveAnnouncements(items);
  return item;
}

export function markAnnouncementSeen(id: string): Announcement {
  const items = readAnnouncements();
  const item = items.find((a) => a.id === id);
  if (!item) throw new Error("Niet gevonden");
  item.seenByAdmin = true;
  saveAnnouncements(items);
  return item;
}

export function deleteAnnouncement(id: string) {
  saveAnnouncements(readAnnouncements().filter((a) => a.id !== id));
}
