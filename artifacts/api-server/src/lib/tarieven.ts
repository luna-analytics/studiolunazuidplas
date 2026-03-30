import Database from "@replit/database";
import crypto from "crypto";

const db = new Database();
const KEY = "studio_luna:tarieven";

export type Rittenkaart = {
  id: string;
  naam: string;
  prijs: number;
  geldigheid: string;
  communityAccess: boolean;
  beschrijving?: string;
};

export type SpeciaalPakket = {
  id: string;
  naam: string;
  prijs: number;
  beschrijving?: string;
  typeId?: string;
  proeflesGeldig: boolean;
  actief: boolean;
};

export type TarievenData = {
  proeflesPrijs: number;
  losseLes: number;
  rittenkaarten: Rittenkaart[];
  specials: SpeciaalPakket[];
  betalingInfo: string;
};

const DEFAULT: TarievenData = {
  proeflesPrijs: 10,
  losseLes: 22.5,
  rittenkaarten: [
    {
      id: "rk5",
      naam: "5-rittenkaart",
      prijs: 105,
      geldigheid: "2 maanden",
      communityAccess: true,
      beschrijving: "Inclusief toegang tot de Studio Luna WhatsApp-community",
    },
    {
      id: "rk10",
      naam: "10-rittenkaart",
      prijs: 195,
      geldigheid: "4 maanden",
      communityAccess: true,
      beschrijving: "Inclusief toegang tot de Studio Luna WhatsApp-community",
    },
  ],
  specials: [],
  betalingInfo: "Betalen kan contant in de studio of via Tikkie.",
};

async function read(): Promise<TarievenData> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return DEFAULT;
    const data = result?.value ?? result;
    if (!data || typeof data !== "object" || !data.rittenkaarten) return DEFAULT;
    return data as TarievenData;
  } catch { return DEFAULT; }
}

async function save(data: TarievenData): Promise<void> {
  await db.set(KEY, data);
}

export async function readTarieven(): Promise<TarievenData> {
  return read();
}

export async function saveTarieven(data: Partial<TarievenData>): Promise<TarievenData> {
  const current = await read();
  const updated = { ...current, ...data };
  await save(updated);
  return updated;
}

export async function addRittenkaart(data: Omit<Rittenkaart, "id">): Promise<TarievenData> {
  const current = await read();
  current.rittenkaarten.push({ ...data, id: crypto.randomUUID() });
  await save(current);
  return current;
}

export async function updateRittenkaart(id: string, data: Partial<Omit<Rittenkaart, "id">>): Promise<TarievenData> {
  const current = await read();
  const item = current.rittenkaarten.find((r) => r.id === id);
  if (!item) throw new Error("Rittenkaart niet gevonden");
  Object.assign(item, data);
  await save(current);
  return current;
}

export async function deleteRittenkaart(id: string): Promise<TarievenData> {
  const current = await read();
  current.rittenkaarten = current.rittenkaarten.filter((r) => r.id !== id);
  await save(current);
  return current;
}

export async function addSpecial(data: Omit<SpeciaalPakket, "id">): Promise<TarievenData> {
  const current = await read();
  current.specials.push({ ...data, id: crypto.randomUUID() });
  await save(current);
  return current;
}

export async function updateSpecial(id: string, data: Partial<Omit<SpeciaalPakket, "id">>): Promise<TarievenData> {
  const current = await read();
  const item = current.specials.find((s) => s.id === id);
  if (!item) throw new Error("Speciaal pakket niet gevonden");
  Object.assign(item, data);
  await save(current);
  return current;
}

export async function deleteSpecial(id: string): Promise<TarievenData> {
  const current = await read();
  current.specials = current.specials.filter((s) => s.id !== id);
  await save(current);
  return current;
}
