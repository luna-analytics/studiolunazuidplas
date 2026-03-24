import fs from "fs";
import path from "path";
import crypto from "crypto";

export type Tip = {
  id: string;
  text: string;
  emoji: string;
  active: boolean;
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "tips.json");

const DEFAULTS: Tip[] = [
  {
    id: "t1",
    text: "Adem in voor 4 tellen, houd vast voor 4, adem uit voor 8. Dit kalmeert je zenuwstelsel in minder dan een minuut.",
    emoji: "🌬️",
    active: true,
    createdAt: new Date().toISOString(),
  },
];

function ensureFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULTS, null, 2));
}

export function readTips(): Tip[] {
  try { ensureFile(); return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); } catch { return DEFAULTS; }
}

function save(tips: Tip[]) { ensureFile(); fs.writeFileSync(DATA_FILE, JSON.stringify(tips, null, 2)); }

export function getActiveTip(): Tip | null {
  return readTips().find((t) => t.active) ?? null;
}

export function createTip(data: { text: string; emoji?: string }): Tip {
  const tips = readTips().map((t) => ({ ...t, active: false }));
  const tip: Tip = { id: crypto.randomUUID(), text: data.text, emoji: data.emoji ?? "🌿", active: true, createdAt: new Date().toISOString() };
  tips.push(tip);
  save(tips);
  return tip;
}

export function activateTip(id: string): Tip {
  const tips = readTips().map((t) => ({ ...t, active: t.id === id }));
  save(tips);
  return tips.find((t) => t.id === id)!;
}

export function deleteTip(id: string) { save(readTips().filter((t) => t.id !== id)); }
