import { db, tips } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export type Tip = typeof tips.$inferSelect;

const SEED_TIPS: Tip[] = [
  {
    id: "t1",
    text: "Adem in voor 4 tellen, houd vast voor 4, adem uit voor 8. Dit kalmeert je zenuwstelsel in minder dan een minuut.",
    emoji: "🌬️",
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export async function readTips(): Promise<Tip[]> {
  const list = await db.select().from(tips);
  if (list.length === 0) {
    for (const t of SEED_TIPS) {
      await db.insert(tips).values(t);
    }
    return SEED_TIPS;
  }
  return list;
}

export async function getActiveTip(): Promise<Tip | null> {
  const list = await readTips();
  return list.find((t) => t.active) ?? null;
}

export async function createTip(data: { text: string; emoji?: string }): Promise<Tip> {
  // deactivate others
  await db.update(tips).set({ active: false });
  
  const tip: Tip = {
    id: crypto.randomUUID(),
    text: data.text,
    emoji: data.emoji ?? "🌿",
    active: true,
    createdAt: new Date().toISOString()
  };
  const result = await db.insert(tips).values(tip).returning();
  return result[0];
}

export async function activateTip(id: string): Promise<Tip> {
  await db.update(tips).set({ active: false });
  const result = await db.update(tips).set({ active: true }).where(eq(tips.id, id)).returning();
  return result[0];
}

export async function deleteTip(id: string): Promise<void> {
  await db.delete(tips).where(eq(tips.id, id));
}
