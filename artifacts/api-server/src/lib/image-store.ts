import { db, assets } from "@workspace/db";
import { eq } from "drizzle-orm";

const prefixKey = (key: string) => `img_${key}`;

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
