import { db, requests } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export type RittenkaartRequest = typeof requests.$inferSelect;

export async function readRequests(): Promise<RittenkaartRequest[]> {
  return await db.select().from(requests);
}

export async function saveRequests(reqs: RittenkaartRequest[]): Promise<void> {
  if (reqs.length === 0) return;
  for (const r of reqs) {
    await db.insert(requests).values(r).onConflictDoUpdate({
      target: requests.id,
      set: r,
    });
  }
}

export async function createRequest(data: Omit<RittenkaartRequest, "id" | "createdAt" | "done">): Promise<RittenkaartRequest> {
  const req: RittenkaartRequest = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    done: false,
    name: data.name ?? null,
    email: data.email ?? null,
    package: data.package ?? null,
    userId: data.userId ?? null,
  };
  const result = await db.insert(requests).values(req).returning();
  return result[0];
}

export async function markRequestDone(id: string): Promise<RittenkaartRequest> {
  const updated = await db.update(requests).set({ done: true }).where(eq(requests.id, id)).returning();
  if (updated.length === 0) throw new Error("Aanvraag niet gevonden");
  return updated[0];
}

export async function deleteRequest(id: string): Promise<void> {
  await db.delete(requests).where(eq(requests.id, id));
}
