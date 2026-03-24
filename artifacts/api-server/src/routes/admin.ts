import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.js";
import { readMembers, createMember, updateMember, deleteMember, updateMemberCredits } from "../lib/users.js";
import { readClasses, createClass, updateClass, deleteClass } from "../lib/classes.js";
import { readRequests, markRequestDone, deleteRequest, createRequest } from "../lib/requests.js";
import { findMemberById } from "../lib/users.js";
import { getMemberBookings } from "../lib/bookings.js";

const router = Router();

// ─── MEMBERS ─────────────────────────────────────────────────────────────────

router.get("/admin/members", requireAdmin, (_req, res) => {
  const members = readMembers().map((m) => ({
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

router.patch("/admin/members/:id", requireAdmin, (req, res) => {
  const { name, email, credits, notes } = req.body;
  try {
    const member = updateMember(req.params.id, { name, email, credits, notes });
    res.json({ id: member.id, name: member.name, email: member.email, credits: member.credits, notes: member.notes });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/admin/members/:id/credits", requireAdmin, (req, res) => {
  const { delta } = req.body as { delta?: number };
  if (delta === undefined || isNaN(delta)) {
    res.status(400).json({ error: "Geef een aantal credits op" }); return;
  }
  try {
    const member = updateMemberCredits(req.params.id, delta);
    res.json({ id: member.id, credits: member.credits });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/admin/members/:id", requireAdmin, (req, res) => {
  deleteMember(req.params.id);
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

export default router;
