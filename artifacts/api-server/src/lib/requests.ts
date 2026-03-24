import fs from "fs";
import path from "path";
import crypto from "crypto";

export type RittenkaartRequest = {
  id: string;
  name: string;
  email: string;
  package: "5-rittenkaart" | "10-rittenkaart" | "losse_les";
  userId?: string;
  createdAt: string;
  done: boolean;
};

const DATA_FILE = path.join(process.cwd(), "data", "requests.json");

function ensureFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export function readRequests(): RittenkaartRequest[] {
  try {
    ensureFile();
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function saveRequests(requests: RittenkaartRequest[]) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2));
}

export function createRequest(data: Omit<RittenkaartRequest, "id" | "createdAt" | "done">): RittenkaartRequest {
  const requests = readRequests();
  const req: RittenkaartRequest = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    done: false,
  };
  requests.push(req);
  saveRequests(requests);
  return req;
}

export function markRequestDone(id: string): RittenkaartRequest {
  const requests = readRequests();
  const req = requests.find((r) => r.id === id);
  if (!req) throw new Error("Aanvraag niet gevonden");
  req.done = true;
  saveRequests(requests);
  return req;
}

export function deleteRequest(id: string) {
  saveRequests(readRequests().filter((r) => r.id !== id));
}
