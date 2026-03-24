import { Router } from "express";
import { signToken, requireAuth } from "../middlewares/auth.js";
import { verifyMemberPassword, findMemberById } from "../lib/users.js";

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

router.get("/auth/me", requireAuth, (req, res) => {
  const user = (req as any).user as { userId: string; isAdmin: boolean };
  if (user.isAdmin) {
    res.json({ id: "admin", name: "Admin", email: ADMIN_EMAIL, isAdmin: true, credits: 0 });
    return;
  }
  const member = findMemberById(user.userId);
  if (!member) {
    res.status(404).json({ error: "Lid niet gevonden" });
    return;
  }
  res.json({ id: member.id, name: member.name, email: member.email, isAdmin: false, credits: member.credits });
});

export default router;
