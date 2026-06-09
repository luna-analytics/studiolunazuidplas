import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.js";
import { readMembers, createMember, updateMember, deleteMember, updateMemberCredits, findMemberById } from "../lib/users.js";
import { readClasses, createClass, updateClass, deleteClass } from "../lib/classes.js";
import { readRequests, markRequestDone, deleteRequest } from "../lib/requests.js";
import { getMemberBookings, readBookings, saveBookings } from "../lib/bookings.js";
import { readAnnouncements, markAnnouncementSeen, deleteAnnouncement } from "../lib/announcements.js";
import { readTips, createTip, activateTip, deleteTip } from "../lib/tips.js";
import { readEvents, createEvent, deleteEvent } from "../lib/events.js";
import { readJournal, createQuestion, activateQuestion, deleteQuestion } from "../lib/journal.js";
import { getEmailSettings, saveEmailSettings } from "../lib/email-settings.js";
import { readClassTypes, createClassType, updateClassType, deleteClassType } from "../lib/class-types.js";
import { readTarieven, saveTarieven, addRittenkaart, updateRittenkaart, deleteRittenkaart, addSpecial, updateSpecial, deleteSpecial } from "../lib/tarieven.js";
import { readPaginaTeksten, savePaginaTeksten } from "../lib/pagina-teksten.js";
import { getAllFotos, setFoto, FOTO_KEYS, type FotoKey } from "../lib/foto-store.js";
import { readReserveringen, createReservering, toggleAanwezig, deleteReservering, markMailVerstuurd, markBetaaldContant } from "../lib/reserveringen.js";
import { sendReminderEmail, sendCustomEmail } from "../lib/email.js";
import { readPosts, createPost, updatePost, deletePost } from "../lib/blog.js";
import { getAllComments, approveComment, replyToComment, deleteComment } from "../lib/blog-comments.js";
import { getImage, setImage, deleteImage } from "../lib/image-store.js";
import { readReviewsConfig, createReview, updateReview, deleteReview, setReviewsVisible } from "../lib/reviews.js";

const router = Router();

// ─── MEMBERS ─────────────────────────────────────────────────────────────────

router.get("/admin/members", requireAdmin, async (_req, res) => {
  const members = (await readMembers()).map((m) => ({
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

router.patch("/admin/members/:id", requireAdmin, async (req, res) => {
  const { name, email, credits, notes } = req.body;
  try {
    const member = await updateMember(req.params.id, { name, email, credits, notes });
    res.json({ id: member.id, name: member.name, email: member.email, credits: member.credits, notes: member.notes });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/admin/members/:id/credits", requireAdmin, async (req, res) => {
  const { delta } = req.body as { delta?: number };
  if (delta === undefined || isNaN(delta)) {
    res.status(400).json({ error: "Geef een aantal credits op" }); return;
  }
  try {
    const member = await updateMemberCredits(req.params.id, delta);
    res.json({ id: member.id, credits: member.credits });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/admin/members/:id", requireAdmin, async (req, res) => {
  const memberId = req.params.id;
  const allBookings = await readBookings();
  await saveBookings(allBookings.filter((b) => b.memberId !== memberId));
  await deleteMember(memberId);
  res.json({ ok: true });
});

router.get("/admin/members/:id/bookings", requireAdmin, async (req, res) => {
  const bookings = await getMemberBookings(req.params.id);
  res.json(bookings);
});

// ─── BOEKINGEN BEHEER ────────────────────────────────────────────────────────

router.delete("/admin/bookings/:id", requireAdmin, async (req, res) => {
  const allBookings = await readBookings();
  const booking = allBookings.find((b) => b.id === req.params.id);
  if (!booking) { res.status(404).json({ error: "Boeking niet gevonden" }); return; }
  if (!booking.isProefles && !booking.isLosseLes) {
    try { await updateMemberCredits(booking.memberId, 1); } catch { /* lid wellicht verwijderd */ }
  }
  await saveBookings(allBookings.filter((b) => b.id !== req.params.id));
  res.json({ ok: true });
});

// ─── CLASSES ─────────────────────────────────────────────────────────────────

router.get("/admin/classes", requireAdmin, async (_req, res) => {
  res.json(await readClasses());
});

router.post("/admin/classes", requireAdmin, async (req, res) => {
  const { title, time, teacher, spotsTotal, description, type, dates } = req.body;
  if (!title || !time || !type) {
    res.status(400).json({ error: "Titel, tijd en type zijn verplicht" }); return;
  }
  try {
    const cls = await createClass({ title, time, teacher: teacher ?? "Marjolein", spotsTotal: spotsTotal ?? 8, description: description ?? "", type, dates: dates ?? [] });
    res.json(cls);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/admin/classes/bookings", requireAdmin, async (_req, res) => {
  const [allBookings, allReserveringen, members] = await Promise.all([readBookings(), readReserveringen(), readMembers()]);
  const memberMap = Object.fromEntries(members.map((m) => [m.id, { name: m.name, email: m.email }]));
  const byClass: Record<string, Record<string, { count: number; bookings: any[] }>> = {};

  for (const b of allBookings) {
    if (!byClass[b.classId]) byClass[b.classId] = {};
    if (!byClass[b.classId][b.date]) byClass[b.classId][b.date] = { count: 0, bookings: [] };
    byClass[b.classId][b.date].count++;
    byClass[b.classId][b.date].bookings.push({ ...b, memberName: memberMap[b.memberId]?.name ?? "Onbekend", memberEmail: memberMap[b.memberId]?.email ?? "", isReservering: false });
  }

  for (const r of allReserveringen) {
    if (!byClass[r.classId]) byClass[r.classId] = {};
    if (!byClass[r.classId][r.dateStr]) byClass[r.classId][r.dateStr] = { count: 0, bookings: [] };
    byClass[r.classId][r.dateStr].count++;
    byClass[r.classId][r.dateStr].bookings.push({
      id: r.id, classId: r.classId, date: r.dateStr,
      memberName: r.name, memberEmail: r.email,
      betaaldStripe: r.betaaldStripe, betaaldContant: r.betaaldContant,
      isReservering: true, isProefles: false, isLosseLes: false,
    });
  }

  res.json(byClass);
});

router.patch("/admin/classes/:id", requireAdmin, async (req, res) => {
  try {
    const cls = await updateClass(req.params.id, req.body);
    res.json(cls);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/admin/classes/:id", requireAdmin, async (req, res) => {
  await deleteClass(req.params.id);
  res.json({ ok: true });
});

// ─── RITTENKAART REQUESTS ─────────────────────────────────────────────────────

router.get("/admin/requests", requireAdmin, async (_req, res) => {
  res.json(await readRequests());
});

router.post("/admin/requests/:id/done", requireAdmin, async (req, res) => {
  try {
    const req2 = await markRequestDone(req.params.id);
    res.json(req2);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/admin/requests/:id", requireAdmin, async (req, res) => {
  await deleteRequest(req.params.id);
  res.json({ ok: true });
});

// ─── MEDEDELINGEN (VILLAGE ANNOUNCEMENTS) ────────────────────────────────────

router.get("/admin/announcements", requireAdmin, async (_req, res) => {
  res.json(await readAnnouncements());
});

router.post("/admin/announcements/:id/seen", requireAdmin, async (req, res) => {
  try {
    const a = await markAnnouncementSeen(req.params.id);
    res.json(a);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/admin/announcements/:id", requireAdmin, async (req, res) => {
  await deleteAnnouncement(req.params.id);
  res.json({ ok: true });
});

// ─── TIPS ────────────────────────────────────────────────────────────────────

router.get("/admin/tips", requireAdmin, async (_req, res) => { res.json(await readTips()); });

router.post("/admin/tips", requireAdmin, async (req, res) => {
  const { text, emoji } = req.body as { text?: string; emoji?: string };
  if (!text?.trim()) { res.status(400).json({ error: "Tekst is verplicht" }); return; }
  res.json(await createTip({ text: text.trim(), emoji }));
});

router.post("/admin/tips/:id/activate", requireAdmin, async (req, res) => {
  try { res.json(await activateTip(req.params.id)); } catch (e: any) { res.status(400).json({ error: e.message }); }
});

router.delete("/admin/tips/:id", requireAdmin, async (req, res) => {
  await deleteTip(req.params.id); res.json({ ok: true });
});

// ─── EVENTS ──────────────────────────────────────────────────────────────────

router.get("/admin/events", requireAdmin, async (_req, res) => { res.json(await readEvents()); });

router.post("/admin/events", requireAdmin, async (req, res) => {
  const { title, date, time, description, location } = req.body;
  if (!title || !date) { res.status(400).json({ error: "Titel en datum zijn verplicht" }); return; }
  res.json(await createEvent({ title, date, time, description: description ?? "", location }));
});

router.delete("/admin/events/:id", requireAdmin, async (req, res) => {
  await deleteEvent(req.params.id); res.json({ ok: true });
});

// ─── JOURNAL ─────────────────────────────────────────────────────────────────

router.get("/admin/journal", requireAdmin, async (_req, res) => { res.json(await readJournal()); });

router.post("/admin/journal", requireAdmin, async (req, res) => {
  const { question } = req.body as { question?: string };
  if (!question?.trim()) { res.status(400).json({ error: "Vraag is verplicht" }); return; }
  res.json(await createQuestion(question.trim()));
});

router.post("/admin/journal/:id/activate", requireAdmin, async (req, res) => {
  try { res.json(await activateQuestion(req.params.id)); } catch (e: any) { res.status(400).json({ error: e.message }); }
});

router.delete("/admin/journal/:id", requireAdmin, async (req, res) => {
  await deleteQuestion(req.params.id); res.json({ ok: true });
});

// ─── EMAIL INSTELLINGEN ───────────────────────────────────────────────────────

router.get("/admin/email-settings", requireAdmin, async (_req, res) => {
  const settings = await getEmailSettings();
  res.json(settings);
});

router.put("/admin/email-settings", requireAdmin, async (req, res) => {
  try {
    const settings = await saveEmailSettings(req.body);
    res.json(settings);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── LESTYPES ─────────────────────────────────────────────────────────────────

router.get("/admin/class-types", requireAdmin, async (_req, res) => {
  res.json(await readClassTypes());
});

router.post("/admin/class-types", requireAdmin, async (req, res) => {
  const { naam, kleur, proeflesGeldig, actief } = req.body;
  if (!naam || !kleur) { res.status(400).json({ error: "Naam en kleur zijn verplicht" }); return; }
  try {
    res.json(await createClassType({ naam, kleur, proeflesGeldig: proeflesGeldig ?? true, actief: actief ?? true }));
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.patch("/admin/class-types/:id", requireAdmin, async (req, res) => {
  try {
    res.json(await updateClassType(req.params.id, req.body));
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.delete("/admin/class-types/:id", requireAdmin, async (req, res) => {
  await deleteClassType(req.params.id);
  res.json({ ok: true });
});

// ─── TARIEVEN ─────────────────────────────────────────────────────────────────

router.get("/admin/tarieven", requireAdmin, async (_req, res) => {
  res.json(await readTarieven());
});

router.put("/admin/tarieven", requireAdmin, async (req, res) => {
  try {
    const { proeflesPrijs, losseLes, betalingInfo } = req.body;
    res.json(await saveTarieven({ proeflesPrijs, losseLes, betalingInfo }));
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.post("/admin/tarieven/rittenkaarten", requireAdmin, async (req, res) => {
  const { naam, prijs, geldigheid, communityAccess, beschrijving } = req.body;
  if (!naam || prijs == null) { res.status(400).json({ error: "Naam en prijs zijn verplicht" }); return; }
  try {
    res.json(await addRittenkaart({ naam, prijs: Number(prijs), geldigheid: geldigheid ?? "", communityAccess: communityAccess ?? false, beschrijving }));
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.patch("/admin/tarieven/rittenkaarten/:id", requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.prijs != null) data.prijs = Number(data.prijs);
    res.json(await updateRittenkaart(req.params.id, data));
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.delete("/admin/tarieven/rittenkaarten/:id", requireAdmin, async (req, res) => {
  res.json(await deleteRittenkaart(req.params.id));
});

router.post("/admin/tarieven/specials", requireAdmin, async (req, res) => {
  const { naam, prijs, beschrijving, typeId, proeflesGeldig, actief } = req.body;
  if (!naam || prijs == null) { res.status(400).json({ error: "Naam en prijs zijn verplicht" }); return; }
  try {
    res.json(await addSpecial({ naam, prijs: Number(prijs), beschrijving, typeId, proeflesGeldig: proeflesGeldig ?? false, actief: actief ?? true }));
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.patch("/admin/tarieven/specials/:id", requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.prijs != null) data.prijs = Number(data.prijs);
    res.json(await updateSpecial(req.params.id, data));
  } catch (err: any) { res.status(400).json({ error: err.message }); }
});

router.delete("/admin/tarieven/specials/:id", requireAdmin, async (req, res) => {
  res.json(await deleteSpecial(req.params.id));
});

router.patch("/admin/tarieven/volgorde", requireAdmin, async (req, res) => {
  const { volgorde } = req.body;
  if (!Array.isArray(volgorde)) return res.status(400).json({ error: "volgorde moet een array zijn" });
  res.json(await saveTarieven({ volgorde }));
});

// ─── PAGINA TEKSTEN ──────────────────────────────────────────────────────────

router.get("/admin/pagina-teksten", requireAdmin, async (_req, res) => {
  const [teksten, fotos] = await Promise.all([readPaginaTeksten(), getAllFotos()]);
  res.json({ ...teksten, ...fotos });
});

router.patch("/admin/pagina-teksten", requireAdmin, async (req, res) => {
  const body = req.body as Record<string, any>;
  // Foto-velden apart opslaan in eigen DB-sleutels
  const fotoSaves = FOTO_KEYS.filter((k) => k in body).map((k) => setFoto(k as FotoKey, body[k]));
  const [saved] = await Promise.all([savePaginaTeksten(body), ...fotoSaves]);
  const fotos = await getAllFotos();
  res.json({ ...saved, ...fotos });
});

// Directe foto-route voor toekomstige uploads
router.patch("/admin/foto/:key", requireAdmin, async (req, res) => {
  const key = req.params.key as FotoKey;
  if (!(FOTO_KEYS as readonly string[]).includes(key)) {
    res.status(400).json({ error: "Onbekende foto-sleutel" }); return;
  }
  const { data } = req.body as { data: string };
  if (typeof data !== "string") {
    res.status(400).json({ error: "Verwacht { data: string }" }); return;
  }
  await setFoto(key, data);
  res.json({ ok: true });
});

// ─── RESERVERINGEN ───────────────────────────────────────────────────────────

router.get("/admin/reserveringen", requireAdmin, async (_req, res) => {
  res.json(await readReserveringen());
});

router.post("/admin/reserveringen", requireAdmin, async (req, res) => {
  const { name, email, classId, classTitle, dateStr, time, type, stuurEmail, forceOverCapacity, memberId, gebruikCredit } = req.body;
  if (!name || !email || !classId || !classTitle || !dateStr || !time || !type) {
    return res.status(400).json({ error: "Verplichte velden ontbreken" });
  }

  // Capaciteitscontrole (admin kan overschrijven met forceOverCapacity)
  if (!forceOverCapacity) {
    const { readClasses } = await import("../lib/classes.js");
    const { getAllBookings } = await import("../lib/bookings.js");
    const [classes, allBookings, allReserveringen] = await Promise.all([
      readClasses(),
      getAllBookings(),
      readReserveringen(),
    ]);
    const cls = classes.find((c) => c.id === classId);
    if (cls) {
      const takenByBookings = allBookings.filter((b) => b.classId === classId && b.date === dateStr).length;
      const takenByReserveringen = allReserveringen.filter((r) => r.classId === classId && r.dateStr === dateStr).length;
      const available = cls.spotsTotal - takenByBookings - takenByReserveringen;
      if (available <= 0) {
        return res.status(409).json({ error: "Vol", spotsTotal: cls.spotsTotal, taken: takenByBookings + takenByReserveringen });
      }
    }
  }

  // Credit aftrekken van lid indien gevraagd
  if (gebruikCredit && memberId) {
    const member = await findMemberById(memberId);
    if (!member) return res.status(404).json({ error: "Lid niet gevonden" });
    if (member.credits <= 0) return res.status(400).json({ error: `${member.name} heeft geen credits meer` });
    await updateMember(memberId, { credits: member.credits - 1 });
  }

  const r = await createReservering({ name, email, classId, classTitle, dateStr, time, type });
  res.json(r);
});

router.post("/admin/reserveringen/herinnering", requireAdmin, async (req, res) => {
  const { classTitle, dateStr, time, type } = req.body;
  if (!classTitle || !dateStr) return res.status(400).json({ error: "Verplichte velden ontbreken" });
  const all = await readReserveringen();
  const groep = all.filter((r) => r.classTitle === classTitle && r.dateStr === dateStr);
  if (groep.length === 0) return res.json({ sent: 0 });
  await Promise.all(
    groep.map((r) =>
      sendReminderEmail({ toEmail: r.email, toName: r.name, classTitle, dateStr, time: time ?? r.time, type: type ?? r.type })
    )
  );
  res.json({ sent: groep.length });
});

router.patch("/admin/reserveringen/:id/aanwezig", requireAdmin, async (req, res) => {
  try {
    const updated = await toggleAanwezig(req.params.id);
    res.json(updated);
  } catch {
    res.status(404).json({ error: "Niet gevonden" });
  }
});

router.patch("/admin/reserveringen/:id/betaald-contant", requireAdmin, async (req, res) => {
  try {
    await markBetaaldContant(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Niet gevonden" });
  }
});

router.delete("/admin/reserveringen/:id", requireAdmin, async (req, res) => {
  await deleteReservering(req.params.id);
  res.json({ ok: true });
});

// ─── BLOG ─────────────────────────────────────────────────────────────────────

router.get("/admin/blog", requireAdmin, async (_req, res) => {
  const posts = await readPosts();
  const withCovers = await Promise.all(
    posts.map(async (p) => ({ ...p, coverImage: await getImage(`blog_cover_${p.id}`) }))
  );
  res.json(withCovers);
});

router.post("/admin/blog", requireAdmin, async (req, res) => {
  try {
    const { coverImage, ...rest } = req.body;
    const post = await createPost({
      title: rest.title ?? "",
      slug: rest.slug,
      category: rest.category ?? "Inspiratie",
      body: rest.body ?? "",
      publishedAt: rest.publishedAt ?? new Date().toISOString().slice(0, 10),
      published: rest.published ?? false,
    });
    if (coverImage) await setImage(`blog_cover_${post.id}`, coverImage);
    res.json({ ...post, coverImage: coverImage ?? "" });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Aanmaken mislukt" });
  }
});

router.patch("/admin/blog/:id", requireAdmin, async (req, res) => {
  try {
    const { coverImage, ...rest } = req.body;
    let post;
    try {
      post = await updatePost(req.params.id, rest);
    } catch (err: any) {
      res.status(404).json({ error: err.message }); return;
    }
    if (coverImage !== undefined) await setImage(`blog_cover_${post.id}`, coverImage);
    const cover = await getImage(`blog_cover_${post.id}`);
    res.json({ ...post, coverImage: cover });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Opslaan mislukt" });
  }
});

router.delete("/admin/blog/:id", requireAdmin, async (req, res) => {
  await deletePost(req.params.id);
  await deleteImage(`blog_cover_${req.params.id}`);
  res.json({ ok: true });
});

// ─── BLOG REACTIES (ADMIN) ───────────────────────────────────────────────────

router.get("/admin/blog/comments", requireAdmin, async (_req, res) => {
  res.json(await getAllComments());
});

router.patch("/admin/blog/comments/:id/approve", requireAdmin, async (req, res) => {
  try { res.json(await approveComment(req.params.id)); }
  catch (e: any) { res.status(404).json({ error: e.message }); }
});

router.patch("/admin/blog/comments/:id/reply", requireAdmin, async (req, res) => {
  const { reply } = req.body as { reply?: string };
  if (!reply?.trim()) { res.status(400).json({ error: "Reactie is verplicht" }); return; }
  try { res.json(await replyToComment(req.params.id, reply)); }
  catch (e: any) { res.status(404).json({ error: e.message }); }
});

router.delete("/admin/blog/comments/:id", requireAdmin, async (req, res) => {
  try { await deleteComment(req.params.id); res.json({ ok: true }); }
  catch (e: any) { res.status(404).json({ error: e.message }); }
});

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

router.get("/admin/reviews", requireAdmin, async (_req, res) => {
  res.json(await readReviewsConfig());
});

router.post("/admin/reviews", requireAdmin, async (req, res) => {
  try {
    const { name, role, text, stars } = req.body as { name?: string; role?: string; text?: string; stars?: number };
    if (!name || !text) { res.status(400).json({ error: "Naam en tekst zijn verplicht" }); return; }
    const review = await createReview({ name, role: role ?? "", text, stars: stars ?? 5 });
    res.json(review);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch("/admin/reviews/:id", requireAdmin, async (req, res) => {
  try {
    const review = await updateReview(req.params.id, req.body);
    res.json(review);
  } catch (err: any) { res.status(404).json({ error: err.message }); }
});

router.delete("/admin/reviews/:id", requireAdmin, async (req, res) => {
  await deleteReview(req.params.id);
  res.json({ ok: true });
});

router.post("/admin/reviews/visible", requireAdmin, async (req, res) => {
  const { visible } = req.body as { visible: boolean };
  await setReviewsVisible(!!visible);
  res.json({ ok: true, visible: !!visible });
});

// ─── E-MAIL VERZENDEN (admin componeert zelf) ─────────────────────────────────
router.post("/admin/send-email", requireAdmin, async (req, res) => {
  const { to, toName, subject, body, reserveringId } = req.body as { to?: string; toName?: string; subject?: string; body?: string; reserveringId?: string };
  if (!to || !subject || !body) {
    return res.status(400).json({ error: "Aan, onderwerp en bericht zijn verplicht" });
  }
  try {
    let ondertitel: string | undefined;
    if (reserveringId) {
      const reserveringen = await readReserveringen();
      const r = reserveringen.find((x) => x.id === reserveringId);
      if (r) {
        const settings = await getEmailSettings();
        const tpl = settings.lesTypeTemplates?.[r.type];
        ondertitel = tpl?.ondertitel || settings.emailOndertitel || undefined;
      }
    }
    await sendCustomEmail({ toEmail: to, toName: toName ?? to, subject, body, ondertitel });
    if (reserveringId) await markMailVerstuurd(reserveringId);
    res.json({ ok: true });
  } catch (err: any) {
    console.error("[email] Fout bij verzenden aangepaste mail:", err);
    res.status(500).json({ error: "Mail kon niet worden verzonden. Controleer de configuratie." });
  }
});

export default router;
