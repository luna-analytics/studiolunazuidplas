import { db, members, passwordResetTokens } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export type Member = typeof members.$inferSelect;

export async function readMembers(): Promise<Member[]> {
  return await db.select().from(members);
}

export async function saveMembers(memberList: Member[]): Promise<void> {
  if (memberList.length === 0) return;
  for (const m of memberList) {
    await db.insert(members).values(m).onConflictDoUpdate({
      target: members.id,
      set: m,
    });
  }
}

export async function findMemberByEmail(email: string): Promise<Member | undefined> {
  const result = await db.select().from(members).where(eq(members.email, email.toLowerCase())).limit(1);
  return result[0];
}

export async function findMemberById(id: string): Promise<Member | undefined> {
  const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return result[0];
}

export async function createMember(data: {
  name: string;
  email: string;
  password: string;
  credits?: number;
  notes?: string;
}): Promise<Member> {
  const existing = await findMemberByEmail(data.email);
  if (existing) {
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
  await db.insert(members).values(member);
  return member;
}

export async function verifyMemberPassword(email: string, password: string): Promise<Member | null> {
  const member = await findMemberByEmail(email);
  if (!member) return null;
  const ok = await bcrypt.compare(password, member.passwordHash);
  return ok ? member : null;
}

export async function updateMemberCredits(id: string, delta: number): Promise<Member> {
  const member = await findMemberById(id);
  if (!member) throw new Error("Lid niet gevonden");
  const newCredits = Math.max(0, member.credits + delta);
  const updated = await db.update(members).set({ credits: newCredits }).where(eq(members.id, id)).returning();
  return updated[0];
}

export async function updateMember(
  id: string,
  data: Partial<Pick<Member, "name" | "email" | "credits" | "notes">>
): Promise<Member> {
  const member = await findMemberById(id);
  if (!member) throw new Error("Lid niet gevonden");
  
  const updates: Partial<Member> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.email !== undefined) updates.email = data.email.toLowerCase();
  if (data.credits !== undefined) updates.credits = Math.max(0, data.credits);
  if (data.notes !== undefined) updates.notes = data.notes;
  
  const updated = await db.update(members).set(updates).where(eq(members.id, id)).returning();
  return updated[0];
}

export async function deleteMember(id: string): Promise<void> {
  await db.delete(members).where(eq(members.id, id));
}

// Password reset token functions
export async function savePasswordResetToken(token: string, email: string, expiresAt: string): Promise<void> {
  await db.insert(passwordResetTokens).values({ token, email, expiresAt });
}

export async function getPasswordResetToken(token: string) {
  const result = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
  return result[0];
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
}
