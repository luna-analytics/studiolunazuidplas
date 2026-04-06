import Database from "@replit/database";

const db = new Database();
const KEY = "studio_luna:blog";

export type BlogPost = {
  id: string;
  title: string;
  category: string;
  body: string;
  publishedAt: string;
  published: boolean;
  createdAt: string;
};

export async function readPosts(): Promise<BlogPost[]> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return [];
    const data = result?.value ?? result;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function savePosts(posts: BlogPost[]): Promise<void> {
  await db.set(KEY, posts);
}

export async function createPost(
  input: Omit<BlogPost, "id" | "createdAt">
): Promise<BlogPost> {
  const posts = await readPosts();
  const post: BlogPost = {
    ...input,
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
  posts[idx] = { ...posts[idx], ...updates };
  await savePosts(posts);
  return posts[idx];
}

export async function deletePost(id: string): Promise<void> {
  const posts = await readPosts();
  await savePosts(posts.filter((p) => p.id !== id));
}
