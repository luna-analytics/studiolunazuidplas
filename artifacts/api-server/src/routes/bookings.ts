import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getMemberBookings, getMemberBookingCount, createBooking, deleteBooking, getAllBookings } from "../lib/bookings.js";
import { findMemberById, updateMemberCredits } from "../lib/users.js";
import { readClasses } from "../lib/classes.js";

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

  // Check spots available
  const classes = readClasses();
  const studioClass = classes.find((c) => c.id === classId);
  if (studioClass) {
    const allBookings = getAllBookings();
    const taken = allBookings.filter((b) => b.classId === classId && b.date === date).length;
    if (taken >= studioClass.spotsTotal) {
      res.status(400).json({ error: "Deze les is helaas vol" }); return;
    }
  }

  const hasCredits = member.credits > 0;
  const bookingCount = getMemberBookingCount(userId);
  const isProefles = !hasCredits && bookingCount === 0;
  const isLosseLes = !hasCredits && bookingCount > 0;

  try {
    const booking = createBooking({
      memberId: userId, classId, className, date, time, type,
      isProefles,
      isLosseLes,
    });
    const credits = hasCredits ? updateMemberCredits(userId, -1).credits : member.credits;
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

  // Check 7-hour cancellation rule for credit bookings
  let withinSevenHours = false;
  if (!booking.isProefles && !booking.isLosseLes) {
    try {
      const [year, month, day] = booking.date.split("-").map(Number);
      const [hours, minutes] = booking.time.split(":").map(Number);
      const classDateTime = new Date(year, month - 1, day, hours, minutes);
      const cutoffTime = new Date(classDateTime.getTime() - 7 * 60 * 60 * 1000);
      withinSevenHours = new Date() >= cutoffTime;
    } catch {
      withinSevenHours = false;
    }
  }

  const cancelled = deleteBooking(req.params.id, userId);
  if (!cancelled) { res.status(404).json({ error: "Boeking niet gevonden" }); return; }

  const member = findMemberById(userId);
  let credits = member?.credits ?? 0;

  // Only restore credit if it was a regular booking AND outside the 7-hour window
  if (!booking.isProefles && !booking.isLosseLes && !withinSevenHours) {
    credits = updateMemberCredits(userId, 1).credits;
  }

  res.json({
    ok: true,
    credits,
    creditRestored: !booking.isProefles && !booking.isLosseLes && !withinSevenHours,
    withinSevenHours,
  });
});

export default router;
