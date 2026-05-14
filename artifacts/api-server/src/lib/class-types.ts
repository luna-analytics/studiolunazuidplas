import Database from "@replit/database";
import crypto from "crypto";

const db = new Database();
const KEY = "studio_luna:class_types";

export type LesType = {
  id: string;
  naam: string;
  kleur: "groen" | "terra" | "roze" | "beige" | "donkergroen" | "lila" | "geel" | "blauw";
  proeflesGeldig: boolean;
  actief: boolean;
  intakeVereist: boolean;
  beschrijving?: string;
  locatie?: string;
  tijd?: string;
  boekingType?: "tarieven" | "vast_tarief";
  vastTarief?: number;
};

const SEED: LesType[] = [
  { id: "yoga", naam: "Yoga", kleur: "groen", proeflesGeldig: true, actief: true, intakeVereist: true },
  { id: "circle", naam: "Circle", kleur: "roze", proeflesGeldig: false, actief: true, intakeVereist: false },
];

async function read(): Promise<LesType[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return SEED;
    const data = result?.value ?? result;
    if (!Array.isArray(data) || data.length === 0) return SEED;
    return data;
  } catch { return SEED; }
}

async function save(items: LesType[]): Promise<void> {
  await db.set(KEY, items);
}

export async function readClassTypes(): Promise<LesType[]> {
  return read();
}

export async function createClassType(data: Omit<LesType, "id">): Promise<LesType> {
  const items = await read();
  const item: LesType = { ...data, id: crypto.randomUUID() };
  items.push(item);
  await save(items);
  return item;
}

export async function updateClassType(id: string, data: Partial<Omit<LesType, "id">>): Promise<LesType> {
  const items = await read();
  const item = items.find((t) => t.id === id);
  if (!item) throw new Error("Lestype niet gevonden");
  Object.assign(item, data);
  await save(items);
  return item;
}

export async function deleteClassType(id: string): Promise<void> {
  await save((await read()).filter((t) => t.id !== id));
}
