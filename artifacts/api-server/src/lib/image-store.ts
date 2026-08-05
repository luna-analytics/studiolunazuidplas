import { db, assets } from "@workspace/db";
import { eq, like } from "drizzle-orm";

const prefixKey = (key: string) => `img_${key}`;

/** Sleutels (zonder img_-prefix) van alle opgeslagen afbeeldingen met dit voorvoegsel. */
export async function listImageKeys(prefix: string): Promise<string[]> {
  const rows = await db.select({ key: assets.key }).from(assets).where(like(assets.key, `img_${prefix}%`));
  return rows.map((r) => r.key.slice(4));
}

export async function getImage(key: string): Promise<string> {
  const result = await db.select().from(assets).where(eq(assets.key, prefixKey(key))).limit(1);
  if (result.length === 0) return "";
  return result[0].data;
}

export async function setImage(key: string, data: string): Promise<void> {
  await db.insert(assets).values({ key: prefixKey(key), data }).onConflictDoUpdate({
    target: assets.key,
    set: { data },
  });
}

export async function deleteImage(key: string): Promise<void> {
  await db.delete(assets).where(eq(assets.key, prefixKey(key)));
}
