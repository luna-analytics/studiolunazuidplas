import Database from "@replit/database";
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

const db = new Database();
const MEMBERS_KEY = "studio_luna:members";

export async function readMembers(): Promise<Member[]> {
  try {
    const result = (await db.get(MEMBERS_KEY)) as any;
    const data = result?.value ?? result;
    return Array.isArray(data) ? (data as Member[]) : [];
  } catch {
    return [];
  }
}

export async function saveMembers(members: Member[]): Promise<void> {
  await db.set(MEMBERS_KEY, members);
}

export async function findMemberByEmail(email: string): Promise<Member | undefined> {
  const members = await readMembers();
  return members.find((m) => m.email.toLowerCase() === email.toLowerCase());
}

export async function findMemberById(id: string): Promise<Member | undefined> {
  const members = await readMembers();
  return members.find((m) => m.id === id);
}

export async function createMember(data: {
  name: string;
  email: string;
  password: string;
  credits?: number;
  notes?: string;
}): Promise<Member> {
  const members = await readMembers();
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
  await saveMembers(members);
  return member;
}

export async function verifyMemberPassword(email: string, password: string): Promise<Member | null> {
  const member = await findMemberByEmail(email);
  if (!member) return null;
  const ok = await bcrypt.compare(password, member.passwordHash);
  return ok ? member : null;
}

export async function updateMemberCredits(id: string, delta: number): Promise<Member> {
  const members = await readMembers();
  const member = members.find((m) => m.id === id);
  if (!member) throw new Error("Lid niet gevonden");
  member.credits = Math.max(0, member.credits + delta);
  await saveMembers(members);
  return member;
}

export async function updateMember(
  id: string,
  data: Partial<Pick<Member, "name" | "email" | "credits" | "notes">>
): Promise<Member> {
  const members = await readMembers();
  const member = members.find((m) => m.id === id);
  if (!member) throw new Error("Lid niet gevonden");
  if (data.name !== undefined) member.name = data.name;
  if (data.email !== undefined) member.email = data.email.toLowerCase();
  if (data.credits !== undefined) member.credits = Math.max(0, data.credits);
  if (data.notes !== undefined) member.notes = data.notes;
  await saveMembers(members);
  return member;
}

export async function deleteMember(id: string): Promise<void> {
  const members = (await readMembers()).filter((m) => m.id !== id);
  await saveMembers(members);
}
