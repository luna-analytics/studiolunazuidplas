import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export type Member = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  credits: number;
  notes: string;
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "members.json");

function ensureFile() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export function readMembers(): Member[] {
  try {
    ensureFile();
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function saveMembers(members: Member[]) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2));
}

export function findMemberByEmail(email: string): Member | undefined {
  return readMembers().find((m) => m.email.toLowerCase() === email.toLowerCase());
}

export function findMemberById(id: string): Member | undefined {
  return readMembers().find((m) => m.id === id);
}

export async function createMember(data: {
  name: string;
  email: string;
  password: string;
  credits?: number;
  notes?: string;
}): Promise<Member> {
  const members = readMembers();
  if (members.some((m) => m.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("E-mailadres is al in gebruik");
  }
  const member: Member = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash: await bcrypt.hash(data.password, 10),
    credits: data.credits ?? 0,
    notes: data.notes ?? "",
    createdAt: new Date().toISOString(),
  };
  members.push(member);
  saveMembers(members);
  return member;
}

export async function verifyMemberPassword(email: string, password: string): Promise<Member | null> {
  const member = findMemberByEmail(email);
  if (!member) return null;
  const ok = await bcrypt.compare(password, member.passwordHash);
  return ok ? member : null;
}

export function updateMemberCredits(id: string, delta: number): Member {
  const members = readMembers();
  const member = members.find((m) => m.id === id);
  if (!member) throw new Error("Lid niet gevonden");
  member.credits = Math.max(0, member.credits + delta);
  saveMembers(members);
  return member;
}

export function updateMember(id: string, data: Partial<Pick<Member, "name" | "email" | "credits" | "notes">>): Member {
  const members = readMembers();
  const member = members.find((m) => m.id === id);
  if (!member) throw new Error("Lid niet gevonden");
  if (data.name !== undefined) member.name = data.name;
  if (data.email !== undefined) member.email = data.email.toLowerCase();
  if (data.credits !== undefined) member.credits = Math.max(0, data.credits);
  if (data.notes !== undefined) member.notes = data.notes;
  saveMembers(members);
  return member;
}

export function deleteMember(id: string) {
  const members = readMembers().filter((m) => m.id !== id);
  saveMembers(members);
}
