import Database from "@replit/database";
import crypto from "crypto";

const db = new Database();
const KEY = "studio_luna:reserveringen";

export type Reservering = {
  id: string;
  name: string;
  email: string;
  classId: string;
  classTitle: string;
  dateStr: string;
  time: string;
  type: string;
  createdAt: string;
};

export async function readReserveringen(): Promise<Reservering[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return [];
    const data = result?.value ?? result;
    return Array.isArray(data) ? (data as Reservering[]) : [];
  } catch {
    return [];
  }
}

export async function createReservering(
  data: Omit<Reservering, "id" | "createdAt">
): Promise<Reservering> {
  const reserveringen = await readReserveringen();
  const reservering: Reservering = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  reserveringen.push(reservering);
  await db.set(KEY, reserveringen);
  return reservering;
}

export async function deleteReservering(id: string): Promise<void> {
  const reserveringen = await readReserveringen();
  await db.set(KEY, reserveringen.filter((r) => r.id !== id));
}
