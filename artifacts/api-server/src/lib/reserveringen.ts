import { db, reserveringen } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export type Reservering = typeof reserveringen.$inferSelect;

export async function readReserveringen(): Promise<Reservering[]> {
  return await db.select().from(reserveringen);
}

export async function createReservering(
  data: Omit<Reservering, "id" | "createdAt" | "aanwezig" | "notitie" | "mailVerstuurd" | "betaaldContant" | "betaaldStripe"> & { betaaldStripe?: boolean, betaaldContant?: boolean }
): Promise<Reservering> {
  const r: Reservering = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    aanwezig: false,
    notitie: null,
    mailVerstuurd: false,
    betaaldContant: data.betaaldContant ?? false,
    betaaldStripe: data.betaaldStripe ?? false,
  };
  const result = await db.insert(reserveringen).values(r).returning();
  return result[0];
}

export async function toggleAanwezig(id: string): Promise<Reservering> {
  const r = await db.select().from(reserveringen).where(eq(reserveringen.id, id)).limit(1);
  if (r.length === 0) throw new Error("Reservering niet gevonden");
  const updated = await db.update(reserveringen)
    .set({ aanwezig: !r[0].aanwezig })
    .where(eq(reserveringen.id, id))
    .returning();
  return updated[0];
}

export async function updateNotitie(id: string, notitie: string): Promise<Reservering> {
  const updated = await db.update(reserveringen)
    .set({ notitie })
    .where(eq(reserveringen.id, id))
    .returning();
  if (updated.length === 0) throw new Error("Reservering niet gevonden");
  return updated[0];
}

export async function markBetaaldContant(id: string): Promise<void> {
  await db.update(reserveringen).set({ betaaldContant: true }).where(eq(reserveringen.id, id));
}

export async function markMailVerstuurd(id: string): Promise<void> {
  await db.update(reserveringen).set({ mailVerstuurd: true }).where(eq(reserveringen.id, id));
}

export async function deleteReservering(id: string): Promise<void> {
  await db.delete(reserveringen).where(eq(reserveringen.id, id));
}
