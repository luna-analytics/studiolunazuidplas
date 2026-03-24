import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.js";
import { readMembers, createMember, updateMember, deleteMember, updateMemberCredits, findMemberById } from "../lib/users.js";
import { readClasses, createClass, updateClass, deleteClass } from "../lib/classes.js";
import { readRequests, markRequestDone, deleteRequest } from "../lib/requests.js";
import { getMemberBookings } from "../lib/bookings.js";
import { readAnnouncements, markAnnouncementSeen, deleteAnnouncement } from "../lib/announcements.js";
import { readTips, createTip, activateTip, deleteTip } from "../lib/tips.js";
import { readEvents, createEvent, deleteEvent } from "../lib/events.js";
import { readJournal, createQuestion, activateQuestion, deleteQuestion } from "../lib/journal.js";
import { readProfiles } from "../lib/village-profiles.js";
import { getEmailSettings, saveEmailSettings } from "../lib/email-settings.js";

const router = Router();

// ─── MEMBERS ─────────────────────────────────────────────────────────────────

router.get("/admin/members", requireAdmin, async (_req, res) => {
  const members = (await readMembers()).map((m) => ({
    id: m.id, name: m.name, email: m.email, credits: m.credits, notes: m.notes, createdAt: m.createdAt,
  }));
  res.json(members);
});

router.post("/admin/members", requireAdmin, async (req, res) => {
  const { name, email, password, credits, notes } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Naam, e-mail en wachtwoord zijn verplicht" }); return;
  }
  try {
    const member = await createMember({ name, email, password, credits: credits ?? 0, notes });
    res.json({ id: member.id, name: member.name, email: member.email, credits: member.credits, notes: member.notes, createdAt: member.createdAt });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/admin/members/:id", requireAdmin, async (req, res) => {
  const { name, email, credits, notes } = req.body;
  try {
    const member = await updateMember(req.params.id, { name, email, credits, notes });
    res.json({ id: member.id, name: member.name, email: member.email, credits: member.credits, notes: member.notes });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/admin/members/:id/credits", requireAdmin, async (req, res) => {
  const { delta } = req.body as { delta?: number };
  if (delta === undefined || isNaN(delta)) {
    res.status(400).json({ error: "Geef een aantal credits op" }); return;
  }
  try {
    const member = await updateMemberCredits(req.params.id, delta);
    res.json({ id: member.id, credits: member.credits });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/admin/members/:id", requireAdmin, async (req, res) => {
  await deleteMember(req.params.id);
  res.json({ ok: true });
});

// ─── CLASSES ─────────────────────────────────────────────────────────────────

router.get("/admin/classes", requireAdmin, (_req, res) => {
  res.json(readClasses());
});

router.post("/admin/classes", requireAdmin, (req, res) => {
  const { title, time, teacher, spotsTotal, description, type, dates } = req.body;
  if (!title || !time || !type) {
    res.status(400).json({ error: "Titel, tijd en type zijn verplicht" }); return;
  }
  try {
    const cls = createClass({ title, time, teacher: teacher ?? "Marjolein", spotsTotal: spotsTotal ?? 8, description: description ?? "", type, dates: dates ?? [] });
    res.json(cls);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/admin/classes/:id", requireAdmin, (req, res) => {
  try {
    const cls = updateClass(req.params.id, req.body);
    res.json(cls);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/admin/classes/:id", requireAdmin, (req, res) => {
  deleteClass(req.params.id);
  res.json({ ok: true });
});

// ─── RITTENKAART REQUESTS ─────────────────────────────────────────────────────

router.get("/admin/requests", requireAdmin, (_req, res) => {
  res.json(readRequests());
});

router.post("/admin/requests/:id/done", requireAdmin, (req, res) => {
  try {
    const req2 = markRequestDone(req.params.id);
    res.json(req2);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/admin/requests/:id", requireAdmin, (req, res) => {
  deleteRequest(req.params.id);
  res.json({ ok: true });
});

// ─── MEDEDELINGEN (VILLAGE ANNOUNCEMENTS) ────────────────────────────────────

router.get("/admin/announcements", requireAdmin, (_req, res) => {
  res.json(readAnnouncements());
});

router.post("/admin/announcements/:id/seen", requireAdmin, (req, res) => {
  try {
    const a = markAnnouncementSeen(req.params.id);
    res.json(a);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/admin/announcements/:id", requireAdmin, (req, res) => {
  deleteAnnouncement(req.params.id);
  res.json({ ok: true });
});

// ─── TIPS ────────────────────────────────────────────────────────────────────

router.get("/admin/tips", requireAdmin, (_req, res) => { res.json(readTips()); });

router.post("/admin/tips", requireAdmin, (req, res) => {
  const { text, emoji } = req.body as { text?: string; emoji?: string };
  if (!text?.trim()) { res.status(400).json({ error: "Tekst is verplicht" }); return; }
  res.json(createTip({ text: text.trim(), emoji }));
});

router.post("/admin/tips/:id/activate", requireAdmin, (req, res) => {
  try { res.json(activateTip(req.params.id)); } catch (e: any) { res.status(400).json({ error: e.message }); }
});

router.delete("/admin/tips/:id", requireAdmin, (req, res) => {
  deleteTip(req.params.id); res.json({ ok: true });
});

// ─── EVENTS ──────────────────────────────────────────────────────────────────

router.get("/admin/events", requireAdmin, (_req, res) => { res.json(readEvents()); });

router.post("/admin/events", requireAdmin, (req, res) => {
  const { title, date, time, description, location } = req.body;
  if (!title || !date) { res.status(400).json({ error: "Titel en datum zijn verplicht" }); return; }
  res.json(createEvent({ title, date, time, description: description ?? "", location }));
});

router.delete("/admin/events/:id", requireAdmin, (req, res) => {
  deleteEvent(req.params.id); res.json({ ok: true });
});

// ─── JOURNAL ─────────────────────────────────────────────────────────────────

router.get("/admin/journal", requireAdmin, (_req, res) => { res.json(readJournal()); });

router.post("/admin/journal", requireAdmin, (req, res) => {
  const { question } = req.body as { question?: string };
  if (!question?.trim()) { res.status(400).json({ error: "Vraag is verplicht" }); return; }
  res.json(createQuestion(question.trim()));
});

router.post("/admin/journal/:id/activate", requireAdmin, (req, res) => {
  try { res.json(activateQuestion(req.params.id)); } catch (e: any) { res.status(400).json({ error: e.message }); }
});

router.delete("/admin/journal/:id", requireAdmin, (req, res) => {
  deleteQuestion(req.params.id); res.json({ ok: true });
});

// ─── VILLAGE INTROS ──────────────────────────────────────────────────────────

router.get("/admin/village/intros", requireAdmin, (_req, res) => {
  const profiles = readProfiles().filter((p) => p.intro?.trim());
  res.json(profiles);
});

// ─── EMAIL INSTELLINGEN ───────────────────────────────────────────────────────

router.get("/admin/email-settings", requireAdmin, async (_req, res) => {
  const settings = await getEmailSettings();
  res.json(settings);
});

router.put("/admin/email-settings", requireAdmin, async (req, res) => {
  try {
    const settings = await saveEmailSettings(req.body);
    res.json(settings);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
