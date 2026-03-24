import fs from "fs";
import path from "path";
import crypto from "crypto";

export type JournalAnswer = {
  memberId: string;
  memberName: string;
  anonymous: boolean;
  text: string;
  createdAt: string;
};

export type JournalQuestion = {
  id: string;
  question: string;
  active: boolean;
  answers: JournalAnswer[];
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "journal.json");

const DEFAULTS: JournalQuestion[] = [
  {
    id: "j1",
    question: "Hoe gaat het met jou deze week? Wat geeft je energie?",
    active: true,
    answers: [],
    createdAt: new Date().toISOString(),
  },
];

function ensureFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULTS, null, 2));
}

export function readJournal(): JournalQuestion[] {
  try { ensureFile(); return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); } catch { return DEFAULTS; }
}

function save(items: JournalQuestion[]) { ensureFile(); fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2)); }

export function getActiveQuestion(): JournalQuestion | null {
  return readJournal().find((q) => q.active) ?? null;
}

export function createQuestion(question: string): JournalQuestion {
  const items = readJournal().map((q) => ({ ...q, active: false }));
  const q: JournalQuestion = { id: crypto.randomUUID(), question, active: true, answers: [], createdAt: new Date().toISOString() };
  items.push(q);
  save(items);
  return q;
}

export function activateQuestion(id: string): JournalQuestion {
  const items = readJournal().map((q) => ({ ...q, active: q.id === id }));
  save(items);
  return items.find((q) => q.id === id)!;
}

export function addAnswer(questionId: string, answer: Omit<JournalAnswer, "createdAt">): JournalQuestion {
  const items = readJournal();
  const q = items.find((x) => x.id === questionId);
  if (!q) throw new Error("Vraag niet gevonden");
  q.answers = q.answers.filter((a) => a.memberId !== answer.memberId);
  q.answers.push({ ...answer, createdAt: new Date().toISOString() });
  save(items);
  return q;
}

export function deleteQuestion(id: string) { save(readJournal().filter((q) => q.id !== id)); }

export function getMyAnswer(questionId: string, memberId: string): JournalAnswer | undefined {
  return readJournal().find((q) => q.id === questionId)?.answers.find((a) => a.memberId === memberId);
}
