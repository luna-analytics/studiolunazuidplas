import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { findMemberById } from "../lib/users.js";
import { createAnnouncement, readAnnouncements } from "../lib/announcements.js";

const router = Router();

// Bevallen aankondiging
router.post("/village/bevallen", requireAuth, (req: any, res: any) => {
  const { userId, isAdmin } = req.user;
  if (isAdmin) { res.status(403).json({ error: "Geen toegang" }); return; }

  const member = findMemberById(userId);
  if (!member) { res.status(404).json({ error: "Lid niet gevonden" }); return; }

  const { shareConsent, note } = req.body as { shareConsent?: boolean; note?: string };

  // Check if already announced
  const existing = readAnnouncements().find((a) => a.memberId === userId && a.type === "bevallen");
  if (existing) {
    res.status(400).json({ error: "Je hebt al een bevallings-aankondiging gestuurd" }); return;
  }

  const announcement = createAnnouncement({
    type: "bevallen",
    memberId: userId,
    memberName: member.name,
    shareConsent: shareConsent ?? false,
    note: note || undefined,
  });

  res.json(announcement);
});

export default router;
