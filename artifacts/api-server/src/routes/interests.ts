import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const DATA_FILE = path.join(process.cwd(), "data", "interests.json");

function readInterests(): { email: string; timestamp: string }[] {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveInterests(list: { email: string; timestamp: string }[]) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

router.post("/interests", (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Ongeldig e-mailadres" });
  }
  const list = readInterests();
  if (list.some((i) => i.email === email)) {
    return res.json({ message: "Al geregistreerd" });
  }
  list.push({ email, timestamp: new Date().toISOString() });
  saveInterests(list);
  return res.json({ message: "Geregistreerd" });
});

export default router;
