import Database from "@replit/database";
import crypto from "crypto";

const db = new Database();
const KEY = "studio_luna:tips";

export type Tip = {
  id: string;
  text: string;
  emoji: string;
  active: boolean;
  createdAt: string;
};

const SEED_TIPS: Tip[] = [
  {
    id: "t1",
    text: "Adem in voor 4 tellen, houd vast voor 4, adem uit voor 8. Dit kalmeert je zenuwstelsel in minder dan een minuut.",
    emoji: "🌬️",
    active: true,
    createdAt: new Date().toISOString(),
  },
];

async function read(): Promise<Tip[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return SEED_TIPS;
    const data = result?.value ?? result;
    if (!Array.isArray(data) || data.length === 0) return SEED_TIPS;
    return data;
  } catch { return SEED_TIPS; }
}

async function save(tips: Tip[]): Promise<void> {
  await db.set(KEY, tips);
}

export async function readTips(): Promise<Tip[]> {
  return read();
}

export async function getActiveTip(): Promise<Tip | null> {
  return (await read()).find((t) => t.active) ?? null;
}

export async function createTip(data: { text: string; emoji?: string }): Promise<Tip> {
  const tips = (await read()).map((t) => ({ ...t, active: false }));
  const tip: Tip = { id: crypto.randomUUID(), text: data.text, emoji: data.emoji ?? "🌿", active: true, createdAt: new Date().toISOString() };
  tips.push(tip);
  await save(tips);
  return tip;
}

export async function activateTip(id: string): Promise<Tip> {
  const tips = (await read()).map((t) => ({ ...t, active: t.id === id }));
  await save(tips);
  return tips.find((t) => t.id === id)!;
}

export async function deleteTip(id: string): Promise<void> {
  await save((await read()).filter((t) => t.id !== id));
}
