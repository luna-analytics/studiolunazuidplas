import { db, classes } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export type StudioClass = typeof classes.$inferSelect;

export async function readClasses(): Promise<StudioClass[]> {
  return await db.select().from(classes);
}

export async function saveClasses(classList: StudioClass[]): Promise<void> {
  if (classList.length === 0) return;
  for (const c of classList) {
    await db.insert(classes).values(c).onConflictDoUpdate({
      target: classes.id,
      set: c,
    });
  }
}

export async function createClass(data: Omit<StudioClass, "id" | "stripeBetaling" | "stripeBedrag"> & { stripeBetaling?: boolean | null, stripeBedrag?: number | null }): Promise<StudioClass> {
  const newClass: StudioClass = { 
    ...data, 
    id: crypto.randomUUID(),
    title: data.title ?? null,
    time: data.time ?? null,
    teacher: data.teacher ?? null,
    spotsTotal: data.spotsTotal ?? null,
    description: data.description ?? null,
    type: data.type ?? null,
    dates: data.dates ?? null,
    stripeBetaling: data.stripeBetaling ?? null,
    stripeBedrag: data.stripeBedrag ?? null,
  };
  const result = await db.insert(classes).values(newClass).returning();
  return result[0];
}

export async function updateClass(id: string, data: Partial<Omit<StudioClass, "id">>): Promise<StudioClass> {
  const updated = await db.update(classes).set(data).where(eq(classes.id, id)).returning();
  if (updated.length === 0) throw new Error("Les niet gevonden");
  return updated[0];
}

export async function deleteClass(id: string): Promise<void> {
  await db.delete(classes).where(eq(classes.id, id));
}
