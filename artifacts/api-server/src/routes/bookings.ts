import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getMemberBookings, createBooking, deleteBooking } from "../lib/bookings.js";
import { findMemberById, updateMemberCredits } from "../lib/users.js";

const router = Router();

router.get("/bookings", requireAuth, (req, res) => {
  const { userId, isAdmin } = (req as any).user;
  if (isAdmin) { res.json([]); return; }
  const bookings = getMemberBookings(userId);
  res.json(bookings);
});

router.post("/bookings", requireAuth, async (req, res) => {
  const { userId, isAdmin } = (req as any).user;
  if (isAdmin) { res.status(403).json({ error: "Admin kan niet boeken" }); return; }

  const member = findMemberById(userId);
  if (!member) { res.status(404).json({ error: "Lid niet gevonden" }); return; }
  if (member.credits <= 0) { res.status(400).json({ error: "Niet genoeg credits" }); return; }

  const { classId, className, date, time, type } = req.body;
  if (!classId || !className || !date || !time || !type) {
    res.status(400).json({ error: "Ongeldige gegevens" }); return;
  }

  try {
    const booking = createBooking({ memberId: userId, classId, className, date, time, type });
    const updated = updateMemberCredits(userId, -1);
    res.json({ booking, credits: updated.credits });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/bookings/:id", requireAuth, (req, res) => {
  const { userId, isAdmin } = (req as any).user;
  if (isAdmin) { res.status(403).json({ error: "Geen toegang" }); return; }

  const cancelled = deleteBooking(req.params.id, userId);
  if (!cancelled) { res.status(404).json({ error: "Boeking niet gevonden" }); return; }

  const updated = updateMemberCredits(userId, 1);
  res.json({ ok: true, credits: updated.credits });
});

export default router;
