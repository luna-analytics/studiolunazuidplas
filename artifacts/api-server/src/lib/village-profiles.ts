import fs from "fs";
import path from "path";

export type VillageProfile = {
  memberId: string;
  dueDate?: string;
  intro?: string;
  checkedItems: string[];
  updatedAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "village-profiles.json");

function ensureFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}

export function readProfiles(): VillageProfile[] {
  try { ensureFile(); return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); } catch { return []; }
}

function save(profiles: VillageProfile[]) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(profiles, null, 2));
}

export function getProfile(memberId: string): VillageProfile {
  return readProfiles().find((p) => p.memberId === memberId)
    ?? { memberId, checkedItems: [], updatedAt: new Date().toISOString() };
}

export function updateProfile(memberId: string, data: Partial<Pick<VillageProfile, "dueDate" | "intro" | "checkedItems">>): VillageProfile {
  const profiles = readProfiles();
  const idx = profiles.findIndex((p) => p.memberId === memberId);
  const existing = profiles[idx] ?? { memberId, checkedItems: [], updatedAt: "" };
  const updated: VillageProfile = { ...existing, ...data, updatedAt: new Date().toISOString() };
  if (idx >= 0) profiles[idx] = updated; else profiles.push(updated);
  save(profiles);
  return updated;
}

export const CHECKLIST_ITEMS = [
  { id: "c1", text: "Geboorteplan klaar" },
  { id: "c2", text: "Kraamhulp geregeld" },
  { id: "c3", text: "Tas inpakken voor het ziekenhuis" },
  { id: "c4", text: "Kinderkamer ingericht" },
  { id: "c5", text: "Autostoel geïnstalleerd en gecontroleerd" },
  { id: "c6", text: "Luiers en rompertjes klaargelegd" },
  { id: "c7", text: "Verloskundige, kraamverzorgster & ziekenhuis opgeslagen in je telefoon" },
  { id: "c8", text: "Bevallingsplaylist gemaakt" },
  { id: "c9", text: "Opvang oudere kinderen of huisdieren geregeld" },
  { id: "c10", text: "Eten ingevroren voor na de bevalling" },
];
