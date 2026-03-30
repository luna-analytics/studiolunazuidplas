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
  aanwezig?: boolean;
  notitie?: string;
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

async function saveReserveringen(list: Reservering[]): Promise<void> {
  await db.set(KEY, list);
}

export async function createReservering(
  data: Omit<Reservering, "id" | "createdAt">
): Promise<Reservering> {
  const list = await readReserveringen();
  const r: Reservering = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  list.push(r);
  await saveReserveringen(list);
  return r;
}

export async function toggleAanwezig(id: string): Promise<Reservering> {
  const list = await readReserveringen();
  const r = list.find((x) => x.id === id);
  if (!r) throw new Error("Reservering niet gevonden");
  r.aanwezig = !r.aanwezig;
  await saveReserveringen(list);
  return r;
}

export async function updateNotitie(id: string, notitie: string): Promise<Reservering> {
  const list = await readReserveringen();
  const r = list.find((x) => x.id === id);
  if (!r) throw new Error("Reservering niet gevonden");
  r.notitie = notitie;
  await saveReserveringen(list);
  return r;
}

export async function deleteReservering(id: string): Promise<void> {
  const list = await readReserveringen();
  await saveReserveringen(list.filter((r) => r.id !== id));
}
