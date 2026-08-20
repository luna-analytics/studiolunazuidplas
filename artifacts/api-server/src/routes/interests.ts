import { Router } from "express";
import { db, studioSettings } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";
import { sendAdminNotification } from "../lib/email.js";

// Interesselijst en zorgkaart-feedback, allebei opgeslagen in studio_settings
// (het lokale JSON-bestand van vroeger werkt niet op Vercel: die schijf is
// tijdelijk, dus aanmeldingen zouden verdwijnen).

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Interest = { email: string; timestamp: string };
type Feedback = { bericht: string; email: string; timestamp: string };
type Aanmelding = { naam: string; email: string; timestamp: string };

async function readList<T>(key: string): Promise<T[]> {
  const result = await db.select().from(studioSettings).where(eq(studioSettings.key, key)).limit(1);
  if (result.length === 0) return [];
  const data = result[0].value;
  return Array.isArray(data) ? (data as T[]) : [];
}

async function saveList<T>(key: string, list: T[]) {
  await db.insert(studioSettings).values({ key, value: list }).onConflictDoUpdate({
    target: studioSettings.key,
    set: { value: list },
  });
}

router.get("/admin/interests", requireAdmin, async (_req: any, res: any) => {
  res.json(await readList<Interest>("interests"));
});

router.post("/interests", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Ongeldig e-mailadres" });
  }
  const list = await readList<Interest>("interests");
  if (list.some((i) => i.email === email)) {
    return res.json({ message: "Al geregistreerd" });
  }
  list.push({ email, timestamp: new Date().toISOString() });
  await saveList("interests", list);
  return res.json({ message: "Geregistreerd" });
});

router.get("/admin/zorgkaart-feedback", requireAdmin, async (_req: any, res: any) => {
  res.json(await readList<Feedback>("zorgkaart_feedback"));
});

router.post("/zorgkaart-feedback", async (req, res) => {
  const { bericht, email } = req.body as { bericht?: string; email?: string };
  if (!bericht || !bericht.trim() || bericht.length > 2000) {
    return res.status(400).json({ error: "Schrijf een bericht van maximaal 2000 tekens" });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Ongeldig e-mailadres" });
  }
  const list = await readList<Feedback>("zorgkaart_feedback");
  list.push({ bericht: bericht.trim(), email, timestamp: new Date().toISOString() });
  await saveList("zorgkaart_feedback", list);
  // Mailnotificatie naar de beheerder; als die faalt is de feedback zelf al bewaard
  sendAdminNotification({
    type: "aanvraag",
    name: "Zorgkaart-feedback",
    email,
    details: bericht.trim(),
  }).catch(() => {});
  return res.json({ message: "Ontvangen" });
});

router.get("/admin/geboortereeks-aanmeldingen", requireAdmin, async (_req: any, res: any) => {
  res.json(await readList<Aanmelding>("geboortereeks_aanmeldingen"));
});

router.post("/geboortereeks-aanmelding", async (req, res) => {
  const { naam, email } = req.body as { naam?: string; email?: string };
  if (!naam || !naam.trim() || naam.length > 120) {
    return res.status(400).json({ error: "Vul je naam in" });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Ongeldig e-mailadres" });
  }
  const list = await readList<Aanmelding>("geboortereeks_aanmeldingen");
  if (list.some((a) => a.email === email)) {
    return res.json({ message: "Al aangemeld" });
  }
  list.push({ naam: naam.trim(), email, timestamp: new Date().toISOString() });
  await saveList("geboortereeks_aanmeldingen", list);
  sendAdminNotification({
    type: "aanvraag",
    name: naam.trim(),
    email,
    details: "Aanmelding Geboortereeks (start 29 september). Stuur het intakeformulier en de factuur per mail.",
  }).catch(() => {});
  return res.json({ message: "Aangemeld" });
});

export default router;
