import { Router } from "express";
import { signToken, requireAuth } from "../middlewares/auth.js";
import { verifyMemberPassword, findMemberById, createMember } from "../lib/users.js";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@studioluna.nl";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "studioluna2025";

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "E-mail en wachtwoord zijn verplicht" });
    return;
  }

  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
    const token = signToken({ userId: "admin", isAdmin: true });
    res.json({ token, user: { id: "admin", name: "Admin", email: ADMIN_EMAIL, isAdmin: true, credits: 0 } });
    return;
  }

  const member = await verifyMemberPassword(email, password);
  if (!member) {
    res.status(401).json({ error: "Onjuist e-mailadres of wachtwoord" });
    return;
  }

  const token = signToken({ userId: member.id, isAdmin: false });
  res.json({
    token,
    user: { id: member.id, name: member.name, email: member.email, isAdmin: false, credits: member.credits },
  });
});

router.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
  if (!name || !email || !password) {
    res.status(400).json({ error: "Naam, e-mail en wachtwoord zijn verplicht" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Wachtwoord moet minimaal 6 tekens zijn" });
    return;
  }
  try {
    const member = await createMember({ name, email, password, credits: 0 });
    const token = signToken({ userId: member.id, isAdmin: false });
    res.json({ token, user: { id: member.id, name: member.name, email: member.email, isAdmin: false, credits: 0 } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const user = (req as any).user as { userId: string; isAdmin: boolean };
  if (user.isAdmin) {
    res.json({ id: "admin", name: "Admin", email: ADMIN_EMAIL, isAdmin: true, credits: 0 });
    return;
  }
  const member = await findMemberById(user.userId);
  if (!member) {
    res.status(404).json({ error: "Lid niet gevonden" });
    return;
  }
  res.json({ id: member.id, name: member.name, email: member.email, isAdmin: false, credits: member.credits });
});

export default router;
