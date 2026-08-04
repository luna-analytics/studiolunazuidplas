import { db, blogPosts } from "@workspace/db";
import { eq } from "drizzle-orm";

export type BlogPost = typeof blogPosts.$inferSelect;

export function generateSlug(title: string, existingSlugs: string[] = [], currentId?: string): string {
  let base = title
    .toLowerCase()
    .replace(/&/g, "en")
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  if (!existingSlugs.includes(base)) return base;

  let n = 2;
  while (existingSlugs.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function readPosts(): Promise<BlogPost[]> {
  const posts = await db.select().from(blogPosts);
  let dirty = false;
  const usedSlugs: string[] = posts.filter((p) => p.slug).map((p) => p.slug!);
  
  for (const p of posts) {
    if (!p.slug) {
      p.slug = generateSlug(p.title || "", usedSlugs);
      usedSlugs.push(p.slug);
      await db.update(blogPosts).set({ slug: p.slug }).where(eq(blogPosts.id, p.id));
    }
  }
  
  if (dirty) {
    return await db.select().from(blogPosts);
  }
  return posts;
}

export async function createPost(
  input: Omit<BlogPost, "id" | "createdAt" | "slug"> & { slug?: string }
): Promise<BlogPost> {
  const posts = await db.select().from(blogPosts);
  const usedSlugs = posts.map((p) => p.slug!);
  const slug = input.slug?.trim()
    ? generateSlug(input.slug, usedSlugs)
    : generateSlug(input.title || "", usedSlugs);
    
  const post: BlogPost = {
    ...input,
    slug,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    published: input.published ?? false,
    category: input.category ?? null,
    title: input.title ?? null,
    body: input.body ?? null,
    publishedAt: input.publishedAt ?? null,
  };
  
  const result = await db.insert(blogPosts).values(post).returning();
  return result[0];
}

export async function updatePost(
  id: string,
  updates: Partial<BlogPost>
): Promise<BlogPost> {
  const posts = await db.select().from(blogPosts);
  const post = posts.find((p) => p.id === id);
  if (!post) throw new Error("Artikel niet gevonden");

  let slug = updates.slug;
  if (updates.title && !updates.slug) {
    const otherSlugs = posts.filter((p) => p.id !== id).map((p) => p.slug!);
    slug = generateSlug(updates.title, otherSlugs);
  } else if (updates.slug) {
    const otherSlugs = posts.filter((p) => p.id !== id).map((p) => p.slug!);
    slug = generateSlug(updates.slug, otherSlugs);
  }
  
  const toUpdate = { ...updates };
  if (slug) toUpdate.slug = slug;

  const updated = await db.update(blogPosts).set(toUpdate).where(eq(blogPosts.id, id)).returning();
  return updated[0];
}

export async function deletePost(id: string): Promise<void> {
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}
