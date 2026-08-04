import { db, classTypes } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export type LesType = typeof classTypes.$inferSelect;

const SEED: LesType[] = [
  { id: "yoga", naam: "Yoga", kleur: "groen", proeflesGeldig: true, actief: true, intakeVereist: true, beschrijving: null, locatie: null, tijd: null, boekingType: null, vastTarief: null },
  { id: "circle", naam: "Circle", kleur: "roze", proeflesGeldig: false, actief: true, intakeVereist: false, beschrijving: null, locatie: null, tijd: null, boekingType: null, vastTarief: null },
];

export async function readClassTypes(): Promise<LesType[]> {
  const list = await db.select().from(classTypes);
  if (list.length === 0) {
    for (const s of SEED) {
      await db.insert(classTypes).values(s);
    }
    return SEED;
  }
  return list;
}

export async function createClassType(data: Omit<LesType, "id">): Promise<LesType> {
  const item: LesType = { 
    ...data, 
    beschrijving: data.beschrijving ?? null,
    locatie: data.locatie ?? null,
    tijd: data.tijd ?? null,
    boekingType: data.boekingType ?? null,
    vastTarief: data.vastTarief ?? null,
    id: crypto.randomUUID()
  };
  const result = await db.insert(classTypes).values(item).returning();
  return result[0];
}

export async function updateClassType(id: string, data: Partial<Omit<LesType, "id">>): Promise<LesType> {
  const updated = await db.update(classTypes).set(data).where(eq(classTypes.id, id)).returning();
  if (updated.length === 0) throw new Error("Lestype niet gevonden");
  return updated[0];
}

export async function deleteClassType(id: string): Promise<void> {
  await db.delete(classTypes).where(eq(classTypes.id, id));
}
