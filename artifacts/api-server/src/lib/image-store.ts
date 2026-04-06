import Database from "@replit/database";

const db = new Database();

export async function getImage(key: string): Promise<string> {
  try {
    const result = (await db.get(`studio_luna:image:${key}`)) as any;
    if (result?.ok === false) return "";
    const data = result?.value ?? result;
    return typeof data === "string" ? data : "";
  } catch {
    return "";
  }
}

export async function setImage(key: string, data: string): Promise<void> {
  await db.set(`studio_luna:image:${key}`, data);
}

export async function deleteImage(key: string): Promise<void> {
  await (db as any).delete(`studio_luna:image:${key}`);
}
