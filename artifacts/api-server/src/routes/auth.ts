import { Router } from "express";
import { signToken, requireAuth } from "../middlewares/auth.js";
import { verifyMemberPassword, findMemberById, createMember, readMembers, saveMembers, savePasswordResetToken, getPasswordResetToken, deletePasswordResetToken } from "../lib/users.js";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

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

// ─── WACHTWOORD VERGETEN ──────────────────────────────────────────────────────
router.post("/auth/wachtwoord-vergeten", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) { res.status(400).json({ error: "E-mailadres verplicht" }); return; }
  const members = await readMembers();
  const member = members.find((m) => m.email.toLowerCase() === email.toLowerCase());
  // Altijd 200 teruggeven — geen info lekken of account bestaat
  if (!member) { res.json({ ok: true }); return; }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
  await savePasswordResetToken(token, member.email, expiresAt);

  const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0];
  const baseUrl = process.env.SITE_URL
    ?? (replitDomain ? `https://${replitDomain}` : "http://localhost:23125");
  const link = `${baseUrl}/wachtwoord-reset?token=${token}`;

  try {
    await resend.emails.send({
      from: "Studio Luna <info@studiolunazuidplas.nl>",
      to: member.email,
      subject: "Wachtwoord opnieuw instellen — Studio Luna",
      html: `<p>Hoi ${member.name},</p><p>Klik op de link om je wachtwoord opnieuw in te stellen. De link is 30 minuten geldig.</p><p><a href="${link}">${link}</a></p><p>Met warme groet,<br/>Studio Luna</p>`,
    });
  } catch (err) {
    console.error("[auth] Reset mail fout:", err);
  }
  res.json({ ok: true });
});

router.post("/auth/wachtwoord-reset", async (req, res) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) { res.status(400).json({ error: "Token en wachtwoord zijn verplicht" }); return; }
  if (password.length < 6) { res.status(400).json({ error: "Wachtwoord moet minimaal 6 tekens zijn" }); return; }

  const entry = await getPasswordResetToken(token);
  if (!entry || Date.now() > new Date(entry.expiresAt).getTime()) {
    res.status(400).json({ error: "Link is verlopen of ongeldig. Vraag een nieuwe aan." }); return;
  }

  const members = await readMembers();
  const member = members.find((m) => m.email === entry.email);
  if (!member) { res.status(404).json({ error: "Gebruiker niet gevonden" }); return; }

  const bcrypt = await import("bcryptjs");
  member.passwordHash = await bcrypt.hash(password, 10);
  await saveMembers(members);
  await deletePasswordResetToken(token);

  res.json({ ok: true });
});

export default router;
