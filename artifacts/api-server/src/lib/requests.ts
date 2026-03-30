import Database from "@replit/database";
import crypto from "crypto";

const db = new Database();
const KEY = "studio_luna:requests";

export type RittenkaartRequest = {
  id: string;
  name: string;
  email: string;
  package: string;
  userId?: string;
  createdAt: string;
  done: boolean;
};

async function read(): Promise<RittenkaartRequest[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return [];
    const data = result?.value ?? result;
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function save(requests: RittenkaartRequest[]): Promise<void> {
  await db.set(KEY, requests);
}

export async function readRequests(): Promise<RittenkaartRequest[]> {
  return read();
}

export async function saveRequests(requests: RittenkaartRequest[]): Promise<void> {
  await save(requests);
}

export async function createRequest(data: Omit<RittenkaartRequest, "id" | "createdAt" | "done">): Promise<RittenkaartRequest> {
  const requests = await read();
  const req: RittenkaartRequest = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    done: false,
  };
  requests.push(req);
  await save(requests);
  return req;
}

export async function markRequestDone(id: string): Promise<RittenkaartRequest> {
  const requests = await read();
  const req = requests.find((r) => r.id === id);
  if (!req) throw new Error("Aanvraag niet gevonden");
  req.done = true;
  await save(requests);
  return req;
}

export async function deleteRequest(id: string): Promise<void> {
  await save((await read()).filter((r) => r.id !== id));
}
