import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.js";
import { readMembers, createMember, updateMember, deleteMember, updateMemberCredits } from "../lib/users.js";

const router = Router();

router.use(requireAdmin);

router.get("/admin/members", (_req, res) => {
  const members = readMembers().map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    credits: m.credits,
    notes: m.notes,
    createdAt: m.createdAt,
  }));
  res.json(members);
});

router.post("/admin/members", async (req, res) => {
  const { name, email, password, credits, notes } = req.body as {
    name?: string; email?: string; password?: string; credits?: number; notes?: string;
  };
  if (!name || !email || !password) {
    res.status(400).json({ error: "Naam, e-mail en wachtwoord zijn verplicht" });
    return;
  }
  try {
    const member = await createMember({ name, email, password, credits: credits ?? 0, notes });
    res.json({ id: member.id, name: member.name, email: member.email, credits: member.credits, notes: member.notes, createdAt: member.createdAt });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/admin/members/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, credits, notes } = req.body as {
    name?: string; email?: string; credits?: number; notes?: string;
  };
  try {
    const member = updateMember(id, { name, email, credits, notes });
    res.json({ id: member.id, name: member.name, email: member.email, credits: member.credits, notes: member.notes });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/admin/members/:id/credits", (req, res) => {
  const { id } = req.params;
  const { delta } = req.body as { delta?: number };
  if (delta === undefined || isNaN(delta)) {
    res.status(400).json({ error: "Geef een aantal credits op" });
    return;
  }
  try {
    const member = updateMemberCredits(id, delta);
    res.json({ id: member.id, credits: member.credits });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/admin/members/:id", (req, res) => {
  deleteMember(req.params.id);
  res.json({ ok: true });
});

export default router;
