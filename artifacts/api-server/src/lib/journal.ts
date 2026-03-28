import Database from "@replit/database";
import crypto from "crypto";

const db = new Database();
const KEY = "studio_luna:journal";

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

const SEED: JournalQuestion[] = [
  {
    id: "j1",
    question: "Hoe gaat het met jou deze week? Wat geeft je energie?",
    active: true,
    answers: [],
    createdAt: new Date().toISOString(),
  },
];

async function read(): Promise<JournalQuestion[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return SEED;
    const data = result?.value ?? result;
    if (!Array.isArray(data) || data.length === 0) return SEED;
    return data;
  } catch { return SEED; }
}

async function save(items: JournalQuestion[]): Promise<void> {
  await db.set(KEY, items);
}

export async function readJournal(): Promise<JournalQuestion[]> {
  return read();
}

export async function getActiveQuestion(): Promise<JournalQuestion | null> {
  return (await read()).find((q) => q.active) ?? null;
}

export async function createQuestion(question: string): Promise<JournalQuestion> {
  const items = (await read()).map((q) => ({ ...q, active: false }));
  const q: JournalQuestion = { id: crypto.randomUUID(), question, active: true, answers: [], createdAt: new Date().toISOString() };
  items.push(q);
  await save(items);
  return q;
}

export async function activateQuestion(id: string): Promise<JournalQuestion> {
  const items = (await read()).map((q) => ({ ...q, active: q.id === id }));
  await save(items);
  return items.find((q) => q.id === id)!;
}

export async function addAnswer(questionId: string, answer: Omit<JournalAnswer, "createdAt">): Promise<JournalQuestion> {
  const items = await read();
  const q = items.find((x) => x.id === questionId);
  if (!q) throw new Error("Vraag niet gevonden");
  q.answers = q.answers.filter((a) => a.memberId !== answer.memberId);
  q.answers.push({ ...answer, createdAt: new Date().toISOString() });
  await save(items);
  return q;
}

export async function deleteQuestion(id: string): Promise<void> {
  await save((await read()).filter((q) => q.id !== id));
}

export async function getMyAnswer(questionId: string, memberId: string): Promise<JournalAnswer | undefined> {
  return (await read()).find((q) => q.id === questionId)?.answers.find((a) => a.memberId === memberId);
}
