import Database from "@replit/database";

const db = new Database();

export const FOTO_KEYS = ["foto_hero", "foto_yoga", "foto_circle", "over_mij_foto"] as const;
export type FotoKey = typeof FOTO_KEYS[number];

const dbKey = (k: FotoKey) => `studio_luna:foto:${k}`;

export async function getFoto(key: FotoKey): Promise<string> {
  try {
    const result = (await db.get(dbKey(key))) as any;
    if (result?.ok === false) return "";
    const data = result?.value ?? result;
    return typeof data === "string" ? data : "";
  } catch {
    return "";
  }
}

export async function setFoto(key: FotoKey, data: string): Promise<void> {
  await db.set(dbKey(key), data);
}

export async function getAllFotos(): Promise<Record<FotoKey, string>> {
  const results = await Promise.all(FOTO_KEYS.map((k) => getFoto(k)));
  return Object.fromEntries(FOTO_KEYS.map((k, i) => [k, results[i]])) as Record<FotoKey, string>;
}

/**
 * Migreer foto-data die vroeger in het pagina-teksten object zat naar aparte sleutels.
 * Wordt één keer uitgevoerd als de nieuwe sleutels nog leeg zijn.
 */
export async function migrateFotosIfNeeded(oldData: Record<string, any>): Promise<void> {
  for (const key of FOTO_KEYS) {
    const existing = await getFoto(key);
    if (!existing && oldData[key] && typeof oldData[key] === "string" && oldData[key].length > 10) {
      await setFoto(key, oldData[key]);
    }
  }
}
