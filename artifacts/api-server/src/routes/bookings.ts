import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getMemberBookings, getMemberBookingCount, createBooking, deleteBooking, getAllBookings } from "../lib/bookings.js";
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

  const { classId, className, date, time, type } = req.body;
  if (!classId || !className || !date || !time || !type) {
    res.status(400).json({ error: "Ongeldige gegevens" }); return;
  }

  const hasCredits = member.credits > 0;
  const bookingCount = getMemberBookingCount(userId);
  const isProefles = !hasCredits && bookingCount === 0;

  if (!hasCredits && !isProefles) {
    res.status(400).json({ error: "Niet genoeg credits" }); return;
  }

  if (!hasCredits && bookingCount > 0) {
    res.status(400).json({ error: "Niet genoeg credits" }); return;
  }

  try {
    const booking = createBooking({ memberId: userId, classId, className, date, time, type, isProefles });
    const credits = isProefles ? member.credits : updateMemberCredits(userId, -1).credits;
    res.json({ booking, credits });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/bookings/:id", requireAuth, (req, res) => {
  const { userId, isAdmin } = (req as any).user;
  if (isAdmin) { res.status(403).json({ error: "Geen toegang" }); return; }

  const allBookings = getAllBookings();
  const booking = allBookings.find((b) => b.id === req.params.id && b.memberId === userId);
  if (!booking) { res.status(404).json({ error: "Boeking niet gevonden" }); return; }

  const cancelled = deleteBooking(req.params.id, userId);
  if (!cancelled) { res.status(404).json({ error: "Boeking niet gevonden" }); return; }

  const member = findMemberById(userId);
  let credits = member?.credits ?? 0;
  if (!booking.isProefles) {
    credits = updateMemberCredits(userId, 1).credits;
  }

  res.json({ ok: true, credits });
});

export default router;
