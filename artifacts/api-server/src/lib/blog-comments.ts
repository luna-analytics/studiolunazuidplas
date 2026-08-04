import { db, blogComments } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export type BlogComment = typeof blogComments.$inferSelect;

export async function getAllComments(): Promise<BlogComment[]> {
  const all = await db.select().from(blogComments);
  return all.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
}

export async function getCommentsForPost(postId: string, approvedOnly = true): Promise<BlogComment[]> {
  const all = await db.select().from(blogComments).where(eq(blogComments.postId, postId));
  return all
    .filter((c) => (approvedOnly ? c.approved : true))
    .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
}

export async function addComment(postId: string, name: string, body: string, email?: string): Promise<BlogComment> {
  const comment: BlogComment = {
    id: Date.now().toString(),
    postId,
    name: name.trim(),
    body: body.trim(),
    email: email?.trim() || null,
    createdAt: new Date().toISOString(),
    approved: false,
    reply: null,
    repliedAt: null,
  };
  const result = await db.insert(blogComments).values(comment).returning();
  return result[0];
}

export async function approveComment(id: string): Promise<BlogComment> {
  const updated = await db.update(blogComments).set({ approved: true }).where(eq(blogComments.id, id)).returning();
  if (updated.length === 0) throw new Error("Reactie niet gevonden");
  return updated[0];
}

export async function replyToComment(id: string, reply: string): Promise<BlogComment> {
  const updated = await db.update(blogComments).set({ 
    reply: reply.trim(), 
    repliedAt: new Date().toISOString(), 
    approved: true 
  }).where(eq(blogComments.id, id)).returning();
  
  if (updated.length === 0) throw new Error("Reactie niet gevonden");
  return updated[0];
}

export async function deleteComment(id: string): Promise<void> {
  await db.delete(blogComments).where(eq(blogComments.id, id));
}
