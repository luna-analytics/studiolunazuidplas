import Database from "@replit/database";
import crypto from "crypto";

const db = new Database();
const KEY = "studio_luna:classes";

export type StudioClass = {
  id: string;
  title: string;
  time: string;
  teacher: string;
  spotsTotal: number;
  description: string;
  type: string;
  dates: string[];
  stripeBetaling?: boolean;
  stripeBedrag?: number;
};

export async function readClasses(): Promise<StudioClass[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return [];
    const data = result?.value ?? result;
    return Array.isArray(data) ? (data as StudioClass[]) : [];
  } catch {
    return [];
  }
}

export async function saveClasses(classes: StudioClass[]): Promise<void> {
  await db.set(KEY, classes);
}

export async function createClass(data: Omit<StudioClass, "id">): Promise<StudioClass> {
  const classes = await readClasses();
  const newClass: StudioClass = { ...data, id: crypto.randomUUID() };
  classes.push(newClass);
  await saveClasses(classes);
  return newClass;
}

export async function updateClass(id: string, data: Partial<Omit<StudioClass, "id">>): Promise<StudioClass> {
  const classes = await readClasses();
  const cls = classes.find((c) => c.id === id);
  if (!cls) throw new Error("Les niet gevonden");
  Object.assign(cls, data);
  await saveClasses(classes);
  return cls;
}

export async function deleteClass(id: string): Promise<void> {
  const classes = await readClasses();
  await saveClasses(classes.filter((c) => c.id !== id));
}
