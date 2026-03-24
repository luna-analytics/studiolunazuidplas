import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { findMemberById } from "../lib/users.js";
import { createAnnouncement, readAnnouncements } from "../lib/announcements.js";
import { getProfile, updateProfile, CHECKLIST_ITEMS } from "../lib/village-profiles.js";
import { getActiveTip } from "../lib/tips.js";
import { getUpcomingEvents } from "../lib/events.js";
import { getActiveQuestion, addAnswer, getMyAnswer } from "../lib/journal.js";

const router = Router();

// ─── VILLAGE DATA FEED ────────────────────────────────────────────────────────

router.get("/village/data", requireAuth, (req: any, res: any) => {
  const { userId, isAdmin } = req.user;
  if (isAdmin) { res.status(403).json({ error: "Geen toegang" }); return; }

  const profile = getProfile(userId);
  const tip = getActiveTip();
  const events = getUpcomingEvents();
  const question = getActiveQuestion();
  const myAnswer = question ? getMyAnswer(question.id, userId) ?? null : null;
  const births = readAnnouncements()
    .filter((a) => a.shareConsent && a.seenByAdmin)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ profile, tip, events, question, myAnswer, births, checklistItems: CHECKLIST_ITEMS });
});

// ─── PROFILE (DUE DATE + INTRO) ───────────────────────────────────────────────

router.put("/village/profile", requireAuth, (req: any, res: any) => {
  const { userId, isAdmin } = req.user;
  if (isAdmin) { res.status(403).json({ error: "Geen toegang" }); return; }
  const { dueDate, intro } = req.body as { dueDate?: string; intro?: string };
  const profile = updateProfile(userId, { dueDate, intro });
  res.json(profile);
});

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

router.post("/village/checklist", requireAuth, (req: any, res: any) => {
  const { userId, isAdmin } = req.user;
  if (isAdmin) { res.status(403).json({ error: "Geen toegang" }); return; }
  const { checkedItems } = req.body as { checkedItems: string[] };
  const profile = updateProfile(userId, { checkedItems });
  res.json(profile);
});

// ─── JOURNAL ─────────────────────────────────────────────────────────────────

router.post("/village/journal/:id/answer", requireAuth, (req: any, res: any) => {
  const { userId, isAdmin } = req.user;
  if (isAdmin) { res.status(403).json({ error: "Geen toegang" }); return; }
  const member = findMemberById(userId);
  if (!member) { res.status(404).json({ error: "Lid niet gevonden" }); return; }
  const { text, anonymous } = req.body as { text?: string; anonymous?: boolean };
  if (!text?.trim()) { res.status(400).json({ error: "Antwoord mag niet leeg zijn" }); return; }
  try {
    const q = addAnswer(req.params.id, { memberId: userId, memberName: member.name, anonymous: anonymous ?? false, text: text.trim() });
    res.json(q);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── BEVALLEN ────────────────────────────────────────────────────────────────

router.post("/village/bevallen", requireAuth, (req: any, res: any) => {
  const { userId, isAdmin } = req.user;
  if (isAdmin) { res.status(403).json({ error: "Geen toegang" }); return; }
  const member = findMemberById(userId);
  if (!member) { res.status(404).json({ error: "Lid niet gevonden" }); return; }
  const { shareConsent, note } = req.body as { shareConsent?: boolean; note?: string };
  const existing = readAnnouncements().find((a) => a.memberId === userId && a.type === "bevallen");
  if (existing) { res.status(400).json({ error: "Je hebt al een aankondiging gestuurd" }); return; }
  const announcement = createAnnouncement({ type: "bevallen", memberId: userId, memberName: member.name, shareConsent: shareConsent ?? false, note: note || undefined });
  res.json(announcement);
});

export default router;
