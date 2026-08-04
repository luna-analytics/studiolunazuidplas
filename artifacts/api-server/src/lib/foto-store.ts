import { db, assets } from "@workspace/db";
import { eq } from "drizzle-orm";

export const FOTO_KEYS = ["foto_hero", "foto_yoga", "foto_circle", "over_mij_foto"] as const;
export type FotoKey = typeof FOTO_KEYS[number];

const dbKey = (k: FotoKey) => `foto_${k}`;

export async function getFoto(key: FotoKey): Promise<string> {
  const result = await db.select().from(assets).where(eq(assets.key, dbKey(key))).limit(1);
  if (result.length === 0) return "";
  return result[0].data;
}

export async function setFoto(key: FotoKey, data: string): Promise<void> {
  await db.insert(assets).values({ key: dbKey(key), data }).onConflictDoUpdate({
    target: assets.key,
    set: { data },
  });
}

export async function getAllFotos(): Promise<Record<FotoKey, string>> {
  const results = await Promise.all(FOTO_KEYS.map((k) => getFoto(k)));
  return Object.fromEntries(FOTO_KEYS.map((k, i) => [k, results[i]])) as Record<FotoKey, string>;
}
