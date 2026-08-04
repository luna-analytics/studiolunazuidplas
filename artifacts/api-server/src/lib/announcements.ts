import { db, announcements } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export type Announcement = typeof announcements.$inferSelect;

export async function readAnnouncements(): Promise<Announcement[]> {
  return await db.select().from(announcements);
}

export async function saveAnnouncements(items: Announcement[]): Promise<void> {
  if (items.length === 0) return;
  for (const a of items) {
    await db.insert(announcements).values(a).onConflictDoUpdate({
      target: announcements.id,
      set: a,
    });
  }
}

export async function createAnnouncement(data: Omit<Announcement, "id" | "createdAt" | "seenByAdmin">): Promise<Announcement> {
  const item: Announcement = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    seenByAdmin: false,
    type: data.type ?? null,
    memberId: data.memberId ?? null,
    memberName: data.memberName ?? null,
    shareConsent: data.shareConsent ?? null,
    note: data.note ?? null,
  };
  const result = await db.insert(announcements).values(item).returning();
  return result[0];
}

export async function markAnnouncementSeen(id: string): Promise<Announcement> {
  const updated = await db.update(announcements).set({ seenByAdmin: true }).where(eq(announcements.id, id)).returning();
  if (updated.length === 0) throw new Error("Niet gevonden");
  return updated[0];
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await db.delete(announcements).where(eq(announcements.id, id));
}
