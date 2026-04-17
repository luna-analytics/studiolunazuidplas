import Database from "@replit/database";

const db = new Database();
const KEY = "studio_luna:reviews";

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
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return DEFAULT_CONFIG;
    const data = result?.value ?? result;
    if (!data || typeof data !== "object") return DEFAULT_CONFIG;
    return { visible: data.visible ?? false, items: Array.isArray(data.items) ? data.items : [] };
  } catch { return DEFAULT_CONFIG; }
}

async function saveConfig(config: ReviewsConfig) {
  await db.set(KEY, config);
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
