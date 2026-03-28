import Database from "@replit/database";

const db = new Database();
const KEY = "studio_luna:village_profiles";

export type VillageProfile = {
  memberId: string;
  dueDate?: string;
  intro?: string;
  checkedItems: string[];
  updatedAt: string;
};

async function read(): Promise<VillageProfile[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return [];
    const data = result?.value ?? result;
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function save(profiles: VillageProfile[]): Promise<void> {
  await db.set(KEY, profiles);
}

export async function readProfiles(): Promise<VillageProfile[]> {
  return read();
}

export async function getProfile(memberId: string): Promise<VillageProfile> {
  const profiles = await read();
  return profiles.find((p) => p.memberId === memberId)
    ?? { memberId, checkedItems: [], updatedAt: new Date().toISOString() };
}

export async function updateProfile(memberId: string, data: Partial<Pick<VillageProfile, "dueDate" | "intro" | "checkedItems">>): Promise<VillageProfile> {
  const profiles = await read();
  const idx = profiles.findIndex((p) => p.memberId === memberId);
  const existing = profiles[idx] ?? { memberId, checkedItems: [], updatedAt: "" };
  const updated: VillageProfile = { ...existing, ...data, updatedAt: new Date().toISOString() };
  if (idx >= 0) profiles[idx] = updated; else profiles.push(updated);
  await save(profiles);
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
