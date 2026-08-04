import { db, studioSettings } from "@workspace/db";
import { eq } from "drizzle-orm";

const KEY = "reviews";

export type Review = {
  id: string;
  name: string;
  role: string;
  text: string;
  stars: number;
  createdAt: string;
};

export type ReviewsConfig = {
  visible: boolean;
  items: Review[];
};

const DEFAULT_CONFIG: ReviewsConfig = { visible: false, items: [] };

export async function readReviewsConfig(): Promise<ReviewsConfig> {
  const result = await db.select().from(studioSettings).where(eq(studioSettings.key, KEY)).limit(1);
  if (result.length === 0) return DEFAULT_CONFIG;
  const data = result[0].value;
  if (!data || typeof data !== "object") return DEFAULT_CONFIG;
  return { visible: (data as any).visible ?? false, items: Array.isArray((data as any).items) ? (data as any).items : [] };
}

async function saveConfig(config: ReviewsConfig) {
  await db.insert(studioSettings).values({ key: KEY, value: config }).onConflictDoUpdate({
    target: studioSettings.key,
    set: { value: config },
  });
}

export async function createReview(input: Omit<Review, "id" | "createdAt">): Promise<Review> {
  const config = await readReviewsConfig();
  const review: Review = { ...input, id: Date.now().toString(), createdAt: new Date().toISOString() };
  config.items = [review, ...config.items];
  await saveConfig(config);
  return review;
}

export async function updateReview(id: string, updates: Partial<Review>): Promise<Review> {
  const config = await readReviewsConfig();
  const idx = config.items.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Review niet gevonden");
  config.items[idx] = { ...config.items[idx], ...updates };
  await saveConfig(config);
  return config.items[idx];
}

export async function deleteReview(id: string): Promise<void> {
  const config = await readReviewsConfig();
  config.items = config.items.filter((r) => r.id !== id);
  await saveConfig(config);
}

export async function setReviewsVisible(visible: boolean): Promise<void> {
  const config = await readReviewsConfig();
  config.visible = visible;
  await saveConfig(config);
}
