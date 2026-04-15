import Database from "@replit/database";

const db = new Database();
const KEY = "studio_luna:blog";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  body: string;
  publishedAt: string;
  published: boolean;
  createdAt: string;
};

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

  // Add suffix if slug already exists (for a different post)
  let n = 2;
  while (existingSlugs.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function readPosts(): Promise<BlogPost[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return [];
    const data = result?.value ?? result;
    const posts: BlogPost[] = Array.isArray(data) ? data : [];
    // Migrate: add slug to posts that don't have one yet
    let dirty = false;
    const usedSlugs: string[] = posts.filter((p) => p.slug).map((p) => p.slug);
    for (const p of posts) {
      if (!p.slug) {
        p.slug = generateSlug(p.title, usedSlugs);
        usedSlugs.push(p.slug);
        dirty = true;
      }
    }
    if (dirty) await db.set(KEY, posts);
    return posts;
  } catch {
    return [];
  }
}

async function savePosts(posts: BlogPost[]): Promise<void> {
  await db.set(KEY, posts);
}

export async function createPost(
  input: Omit<BlogPost, "id" | "createdAt" | "slug"> & { slug?: string }
): Promise<BlogPost> {
  const posts = await readPosts();
  const usedSlugs = posts.map((p) => p.slug);
  const slug = input.slug?.trim()
    ? generateSlug(input.slug, usedSlugs)
    : generateSlug(input.title, usedSlugs);
  const post: BlogPost = {
    ...input,
    slug,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  await savePosts([post, ...posts]);
  return post;
}

export async function updatePost(
  id: string,
  updates: Partial<BlogPost>
): Promise<BlogPost> {
  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Artikel niet gevonden");

  // Regenerate slug if title changed and no explicit slug provided
  if (updates.title && !updates.slug) {
    const otherSlugs = posts.filter((_, i) => i !== idx).map((p) => p.slug);
    updates.slug = generateSlug(updates.title, otherSlugs);
  } else if (updates.slug) {
    const otherSlugs = posts.filter((_, i) => i !== idx).map((p) => p.slug);
    updates.slug = generateSlug(updates.slug, otherSlugs);
  }

  posts[idx] = { ...posts[idx], ...updates };
  await savePosts(posts);
  return posts[idx];
}

export async function deletePost(id: string): Promise<void> {
  const posts = await readPosts();
  await savePosts(posts.filter((p) => p.id !== id));
}
