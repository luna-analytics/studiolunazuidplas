import { Router } from "express";
import { db, studioSettings } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";
import { sendAdminNotification, sendReeksAanmeldingBevestiging } from "../lib/email.js";

// Interesselijst en zorgkaart-feedback, allebei opgeslagen in studio_settings
// (het lokale JSON-bestand van vroeger werkt niet op Vercel: die schijf is
// tijdelijk, dus aanmeldingen zouden verdwijnen).

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// De onderwerpregel van de mailnotificatie bevat deze naam. Twee tips met
// dezelfde onderwerpregel vouwt een mailprogramma samen tot één gesprek,
// waardoor de tweede tip ongelezen blijft. Vandaar een eigen aanhef per tip.
function eersteWoorden(tekst: string, max = 60): string {
  const schoon = tekst.trim().replace(/\s+/g, " ");
  return schoon.length <= max ? schoon : schoon.slice(0, max).trimEnd() + "...";
}

type Interest = { email: string; timestamp: string };
type Feedback = { bericht: string; email: string; timestamp: string };
type Aanmelding = { naam: string; email: string; timestamp: string };
type ZorgverlenerAanmelding = { praktijk: string; website: string; bericht: string; email: string; timestamp: string };
type Kennismaking = { naam: string; email: string; telefoon: string; bericht: string; timestamp: string };

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
    name: `Zorgkaart-tip: ${eersteWoorden(bericht)}`,
    email,
    details: bericht.trim(),
  }).catch(() => {});
  return res.json({ message: "Ontvangen" });
});

router.get("/admin/geboortereeks-aanmeldingen", requireAdmin, async (_req: any, res: any) => {
  res.json(await readList<Aanmelding>("geboortereeks_aanmeldingen"));
});

// Openbare teller voor de reekspagina: hoeveel aanmeldingen er zijn op de
// acht plekken. Alleen het aantal, nooit namen of adressen.
router.get("/geboortereeks-plekken", async (_req, res) => {
  const list = await readList<Aanmelding>("geboortereeks_aanmeldingen");
  res.json({ aanmeldingen: list.length, plekken: 8 });
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
  // De aanmelder krijgt direct een bevestiging, zodat ze weet dat het gelukt
  // is en wat er nu gebeurt; de aanmelding zelf is dan al veilig opgeslagen.
  sendReeksAanmeldingBevestiging({ toEmail: email, toName: naam.trim() }).catch(() => {});
  return res.json({ message: "Aangemeld" });
});

// Verwijderen van een e-mailadres van de interesselijst, bijvoorbeeld een
// testaanmelding of iemand die zich afmeldt.
router.delete("/admin/interests", requireAdmin, async (req: any, res: any) => {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: "Geen e-mailadres opgegeven" });
  const list = await readList<Interest>("interests");
  const nieuw = list.filter((i) => i.email !== email);
  await saveList("interests", nieuw);
  res.json({ verwijderd: list.length - nieuw.length });
});

router.get("/admin/zorgverlener-aanmeldingen", requireAdmin, async (_req: any, res: any) => {
  res.json(await readList<ZorgverlenerAanmelding>("zorgverlener_aanmeldingen"));
});

router.post("/zorgverlener-aanmelding", async (req, res) => {
  const { praktijk, website, bericht, email } = req.body as {
    praktijk?: string; website?: string; bericht?: string; email?: string;
  };
  if (!praktijk || !praktijk.trim() || praktijk.length > 160) {
    return res.status(400).json({ error: "Vul de naam van je praktijk in" });
  }
  if (!bericht || !bericht.trim() || bericht.length > 2000) {
    return res.status(400).json({ error: "Vertel kort wat je doet (maximaal 2000 tekens)" });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Ongeldig e-mailadres" });
  }
  const list = await readList<ZorgverlenerAanmelding>("zorgverlener_aanmeldingen");
  list.push({
    praktijk: praktijk.trim(),
    website: (website ?? "").trim().slice(0, 300),
    bericht: bericht.trim(),
    email,
    timestamp: new Date().toISOString(),
  });
  await saveList("zorgverlener_aanmeldingen", list);
  sendAdminNotification({
    type: "aanvraag",
    name: `Zorgkaart-vermelding: ${praktijk.trim()}`,
    email,
    details: `Website: ${(website ?? "").trim() || "niet opgegeven"}\n\n${bericht.trim()}`,
  }).catch(() => {});
  return res.json({ message: "Ontvangen" });
});

// Vragen en telefonische kennismaking vanaf de reekspagina. Bewust een eigen
// lijst en niet de interesselijst: hier verwacht iemand dat Marjolein zelf
// contact opneemt, dus de mailnotificatie is het belangrijkste onderdeel.
router.get("/admin/kennismakingen", requireAdmin, async (_req: any, res: any) => {
  res.json(await readList<Kennismaking>("kennismakingen"));
});

router.post("/kennismaking", async (req, res) => {
  const { naam, email, telefoon, bericht } = req.body as {
    naam?: string; email?: string; telefoon?: string; bericht?: string;
  };
  if (!naam || !naam.trim() || naam.length > 120) {
    return res.status(400).json({ error: "Vul je naam in" });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Ongeldig e-mailadres" });
  }
  if (!bericht || !bericht.trim() || bericht.length > 1000) {
    return res.status(400).json({ error: "Schrijf een bericht van maximaal 1000 tekens" });
  }
  const tel = (telefoon ?? "").trim().slice(0, 40);
  const list = await readList<Kennismaking>("kennismakingen");
  list.push({ naam: naam.trim(), email, telefoon: tel, bericht: bericht.trim(), timestamp: new Date().toISOString() });
  await saveList("kennismakingen", list);
  sendAdminNotification({
    type: "aanvraag",
    name: `Kennismaking: ${naam.trim()}`,
    email,
    details: `Telefoon: ${tel || "niet opgegeven"}

${bericht.trim()}`,
  }).catch(() => {});
  return res.json({ message: "Ontvangen" });
});

export default router;
