import fs from "fs";
import path from "path";
import crypto from "crypto";

export type StudioClass = {
  id: string;
  title: string;
  time: string;
  teacher: string;
  spotsTotal: number;
  description: string;
  type: "yoga" | "circle";
  dates: string[];
};

const DATA_FILE = path.join(process.cwd(), "data", "classes.json");

const DEFAULT_CLASSES: StudioClass[] = [
  {
    id: "c1",
    title: "Restorative Zwangerschapsyoga",
    time: "19:00",
    teacher: "Marjolein",
    spotsTotal: 8,
    description: "Een zachte start: Vind diepe ontspanning en maak ruimte voor je baby met zachte yoga, kussens en dekens. Even helemaal niets moeten.",
    type: "yoga",
    dates: ["2026-04-28", "2026-05-05", "2026-05-12"],
  },
  {
    id: "c2",
    title: "Zwangerschapsyoga",
    time: "19:00",
    teacher: "Marjolein",
    spotsTotal: 8,
    description: "Een versterkende en ontspannende yogales die jou ondersteunt in je reis naar de bevalling. Elke les focussen we op een ander thema.",
    type: "yoga",
    dates: ["2026-05-26", "2026-06-02", "2026-06-09"],
  },
];

function ensureFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_CLASSES, null, 2));
  }
}

export function readClasses(): StudioClass[] {
  try {
    ensureFile();
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return DEFAULT_CLASSES;
  }
}

export function saveClasses(classes: StudioClass[]) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(classes, null, 2));
}

export function createClass(data: Omit<StudioClass, "id">): StudioClass {
  const classes = readClasses();
  const newClass: StudioClass = { ...data, id: crypto.randomUUID() };
  classes.push(newClass);
  saveClasses(classes);
  return newClass;
}

export function updateClass(id: string, data: Partial<Omit<StudioClass, "id">>): StudioClass {
  const classes = readClasses();
  const cls = classes.find((c) => c.id === id);
  if (!cls) throw new Error("Les niet gevonden");
  Object.assign(cls, data);
  saveClasses(classes);
  return cls;
}

export function deleteClass(id: string) {
  const classes = readClasses().filter((c) => c.id !== id);
  saveClasses(classes);
}
