import Database from "@replit/database";

const db = new Database();
const KEY = "studio_luna:blog_comments";

export type BlogComment = {
  id: string;
  postId: string;
  name: string;
  email?: string;
  body: string;
  createdAt: string;
  approved: boolean;
  reply?: string;
  repliedAt?: string;
};

async function readAll(): Promise<BlogComment[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return [];
    const data = result?.value ?? result;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function saveAll(comments: BlogComment[]): Promise<void> {
  await db.set(KEY, comments);
}

export async function getCommentsForPost(postId: string, approvedOnly = true): Promise<BlogComment[]> {
  const all = await readAll();
  return all
    .filter((c) => c.postId === postId && (approvedOnly ? c.approved : true))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function getAllComments(): Promise<BlogComment[]> {
  const all = await readAll();
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addComment(postId: string, name: string, body: string, email?: string): Promise<BlogComment> {
  const all = await readAll();
  const comment: BlogComment = {
    id: Date.now().toString(),
    postId,
    name: name.trim(),
    body: body.trim(),
    email: email?.trim() || undefined,
    createdAt: new Date().toISOString(),
    approved: false,
  };
  await saveAll([...all, comment]);
  return comment;
}

export async function approveComment(id: string): Promise<BlogComment> {
  const all = await readAll();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Reactie niet gevonden");
  all[idx] = { ...all[idx], approved: true };
  await saveAll(all);
  return all[idx];
}

export async function replyToComment(id: string, reply: string): Promise<BlogComment> {
  const all = await readAll();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Reactie niet gevonden");
  all[idx] = { ...all[idx], reply: reply.trim(), repliedAt: new Date().toISOString(), approved: true };
  await saveAll(all);
  return all[idx];
}

export async function deleteComment(id: string): Promise<void> {
  const all = await readAll();
  await saveAll(all.filter((c) => c.id !== id));
}
