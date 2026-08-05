import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interestsRouter from "./interests";
import authRouter from "./auth";
import adminRouter from "./admin";
import bookingsRouter from "./bookings";
import classesRouter from "./classes";
import stripeRouter from "./stripe";

// Public rittenkaart request endpoint
import { createRequest } from "../lib/requests.js";
import { findMemberById } from "../lib/users.js";
import { requireAuth } from "../middlewares/auth.js";
import { readClassTypes } from "../lib/class-types.js";
import { readTarieven } from "../lib/tarieven.js";
import { createReservering, readReserveringen, deleteReservering } from "../lib/reserveringen.js";
import { sendAdminNotification, sendReservationConfirmation } from "../lib/email.js";
import { updateMemberCredits } from "../lib/users.js";
import { readClasses } from "../lib/classes.js";
import { getAllBookings } from "../lib/bookings.js";
import { readPaginaTeksten } from "../lib/pagina-teksten.js";
import { getAllFotos, getFoto, FOTO_KEYS, type FotoKey } from "../lib/foto-store.js";
import { readPosts } from "../lib/blog.js";
import { getImage, listImageKeys } from "../lib/image-store.js";
import { getCommentsForPost, addComment } from "../lib/blog-comments.js";
import { readReviewsConfig } from "../lib/reviews.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interestsRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(bookingsRouter);
router.use(classesRouter);
router.use(stripeRouter);

// Publieke class-types endpoint
router.get("/class-types", async (_req, res) => {
  res.json((await readClassTypes()).filter((t) => t.actief));
});

// Publieke tarieven endpoint
router.get("/tarieven", async (_req, res) => {
  res.json(await readTarieven());
});

// Data-URL (base64) uit de database als echte afbeelding serveren, met caching
function sendDataUrlImage(res: any, dataUrl: string) {
  const m = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/.exec(dataUrl);
  if (!m) { res.status(404).end(); return; }
  const mime = m[1] || "image/jpeg";
  const buf = m[2] ? Buffer.from(m[3], "base64") : Buffer.from(decodeURIComponent(m[3]));
  res.set("Content-Type", mime);
  res.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
  res.send(buf);
}

// Paginafoto's als afbeeldings-URL (bijv. /api/foto/foto_hero)
router.get("/foto/:naam", async (req, res) => {
  const naam = req.params.naam as FotoKey;
  if (!FOTO_KEYS.includes(naam)) { res.status(404).end(); return; }
  const data = await getFoto(naam);
  if (!data) { res.status(404).end(); return; }
  sendDataUrlImage(res, data);
});

// Blog-omslagfoto als afbeeldings-URL
router.get("/blog-cover/:id", async (req, res) => {
  const data = await getImage(`blog_cover_${req.params.id}`);
  if (!data) { res.status(404).end(); return; }
  sendDataUrlImage(res, data);
});

// Publieke pagina-teksten endpoint. Foto's gaan als URL mee in plaats van
// base64: dat scheelt megabytes per paginabezoek.
router.get("/pagina-teksten", async (_req, res) => {
  const [teksten, fotos] = await Promise.all([readPaginaTeksten(), getAllFotos()]);
  const fotoUrls = Object.fromEntries(
    Object.entries(fotos).map(([k, v]) => [k, v ? `/api/foto/${k}` : ""])
  );
  res.json({ ...teksten, ...fotoUrls });
});

// Publieke blog-endpoint (alleen gepubliceerde artikelen); covers als URL
router.get("/blog", async (_req, res) => {
  const posts = (await readPosts()).filter((p) => p.published);
  const coverKeys = new Set(await listImageKeys("blog_cover_"));
  const withCovers = posts.map((p) => ({
    ...p,
    coverImage: coverKeys.has(`blog_cover_${p.id}`) ? `/api/blog-cover/${p.id}` : "",
  }));
  res.json(withCovers);
});

// Enkel artikel ophalen (publiek); cover als URL
router.get("/blog/:id", async (req, res) => {
  const posts = await readPosts();
  const param = req.params.id as string;
  const post = posts.find((p) => p.published && (p.slug === param || p.id === param));
  if (!post) { res.status(404).json({ error: "Niet gevonden" }); return; }
  const heeftCover = (await getImage(`blog_cover_${post.id}`)).length > 0;
  res.json({ ...post, coverImage: heeftCover ? `/api/blog-cover/${post.id}` : "" });
});

// Blog reacties (publiek: lezen + insturen)
router.get("/blog/:id/comments", async (req, res) => {
  const comments = await getCommentsForPost(req.params.id as string, true);
  res.json(comments);
});

router.post("/blog/:id/comments", async (req, res) => {
  const { name, body, email } = req.body as { name?: string; body?: string; email?: string };
  if (!name?.trim() || !body?.trim()) {
    res.status(400).json({ error: "Naam en reactie zijn verplicht" }); return;
  }
  if (body.trim().length > 1000) {
    res.status(400).json({ error: "Reactie is te lang (max 1000 tekens)" }); return;
  }
  const comment = await addComment(req.params.id as string, name, body, email);
  res.json({ ok: true, id: comment.id });
});

// Reservering voor openingsreeks (publiek, geen login nodig)
router.post("/reserveer", async (req: any, res: any) => {
  const { name, email, classId, classTitle, dateStr, time, type } = req.body as {
    name?: string; email?: string; classId?: string; classTitle?: string;
    dateStr?: string; time?: string; type?: string;
  };
  if (!name || !email || !classId || !classTitle || !dateStr || !time || !type) {
    res.status(400).json({ error: "Alle velden zijn verplicht" }); return;
  }
  try {
    // Capaciteitscontrole: tel bestaande boekingen + reserveringen voor deze les + datum
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
        res.status(409).json({ error: "Vol", message: "Deze les is helaas vol. Neem contact op met Studio Luna als je op de wachtlijst wil." });
        return;
      }
      // Voorkom dubbele reservering voor zelfde e-mail + les + datum
      const dubbel = allReserveringen.find((r) => r.classId === classId && r.dateStr === dateStr && r.email.toLowerCase() === email.toLowerCase());
      if (dubbel) {
        res.status(409).json({ error: "DubbelReservering", message: "Je hebt al een plek gereserveerd voor deze les." });
        return;
      }
    }
    const reservering = await createReservering({ name, email, classId, classTitle, dateStr, time, type });
    sendAdminNotification({
      type: "reservering",
      name,
      email,
      details: `Les: ${classTitle}\nDatum: ${dateStr}\nTijd: ${time}`,
    }).catch(console.error);
    res.json(reservering);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Ingelogd lid boekt les met credits
router.post("/boek-les", requireAuth, async (req: any, res: any) => {
  const { classId, classTitle, dateStr, time, type } = req.body as {
    classId?: string; classTitle?: string; dateStr?: string; time?: string; type?: string;
  };
  if (!classId || !classTitle || !dateStr || !time || !type) {
    res.status(400).json({ error: "Verplichte velden ontbreken" }); return;
  }
  try {
    const member = await findMemberById(req.user.userId);
    if (!member) { res.status(404).json({ error: "Lid niet gevonden" }); return; }
    if ((member.credits ?? 0) < 1) {
      res.status(400).json({ error: "Onvoldoende tegoed. Koop een pakket om lessen te reserveren." }); return;
    }

    const [classes, allBookings, allReserveringen] = await Promise.all([
      readClasses(), getAllBookings(), readReserveringen(),
    ]);
    const cls = classes.find((c) => c.id === classId);
    if (cls) {
      const takenByBookings = allBookings.filter((b) => b.classId === classId && b.date === dateStr).length;
      const takenByReserveringen = allReserveringen.filter((r) => r.classId === classId && r.dateStr === dateStr).length;
      if (cls.spotsTotal - takenByBookings - takenByReserveringen <= 0) {
        res.status(409).json({ error: "Vol", message: "Deze les is helaas vol." }); return;
      }
      const dubbel = allReserveringen.find(
        (r) => r.classId === classId && r.dateStr === dateStr && r.email.toLowerCase() === member.email.toLowerCase()
      );
      if (dubbel) {
        res.status(409).json({ error: "DubbelReservering", message: "Je hebt al een plek gereserveerd voor deze les." }); return;
      }
    }

    // Schrijf credit af
    await updateMemberCredits(member.id, -1);

    // Maak reservering aan
    const reservering = await createReservering({
      name: member.name, email: member.email, classId, classTitle, dateStr, time, type, betaaldStripe: true,
    });

    sendReservationConfirmation({ toEmail: member.email, toName: member.name, classTitle, dateStr, time, type }).catch(console.error);
    sendAdminNotification({
      type: "reservering", name: member.name, email: member.email,
      details: `Les: ${classTitle}\nDatum: ${dateStr}\nTijd: ${time}\n(lid met rittenkaart)`,
    }).catch(console.error);

    res.json({ ok: true, id: reservering.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Annuleer eigen reservering
router.delete("/reserveringen/:id", requireAuth, async (req: any, res: any) => {
  try {
    const member = await findMemberById(req.user.userId);
    if (!member) { res.status(404).json({ error: "Lid niet gevonden" }); return; }

    const alle = await readReserveringen();
    const r = alle.find((x) => x.id === req.params.id as string);
    if (!r) { res.status(404).json({ error: "Reservering niet gevonden" }); return; }
    if (r.email.toLowerCase() !== member.email.toLowerCase()) {
      res.status(403).json({ error: "Geen toegang" }); return;
    }

    // 7-uur annuleringsgrens
    try {
      const [y, mo, d] = r.dateStr.split("-").map(Number);
      const [h, min] = r.time.split(":").map(Number);
      const lesStart = new Date(y, mo - 1, d, h, min);
      const grens = new Date(lesStart.getTime() - 7 * 60 * 60 * 1000);
      if (new Date() >= grens) {
        res.status(400).json({ error: "Te laat om te annuleren. Annuleren is mogelijk tot 7 uur voor de les." }); return;
      }
    } catch { /* laat door als datum niet parseable */ }

    await deleteReservering(r.id);

    // Credit terugstorten als lid een account heeft
    let credits = member.credits ?? 0;
    if (r.betaaldStripe === true && member.credits !== undefined) {
      credits = (await updateMemberCredits(member.id, 1)).credits;
    }

    res.json({ ok: true, credits });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reserveringen voor ingelogde gebruiker (op basis van e-mail)
router.get("/reserveringen/mijn", requireAuth, async (req: any, res: any) => {
  try {
    const member = await findMemberById(req.user.userId);
    if (!member) { res.status(404).json({ error: "Lid niet gevonden" }); return; }
    const alle = await readReserveringen();
    const mijn = alle.filter((r) => r.email.toLowerCase() === member.email.toLowerCase());
    res.json(mijn);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Rittenkaart aanvraag (public of ingelogd) — ook voor specials
router.post("/rittenkaart-request", async (req: any, res: any) => {
  const { name, email, package: pkg } = req.body as { name?: string; email?: string; package?: string };
  if (!name || !email || !pkg) {
    res.status(400).json({ error: "Naam, e-mail en pakket zijn verplicht" }); return;
  }
  try {
    const request = await createRequest({ name, email, package: pkg as any });
    sendAdminNotification({
      type: "aanvraag",
      name,
      email,
      details: `Pakket: ${pkg}`,
    }).catch(console.error);
    res.json(request);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Publieke reviews-endpoint (alleen zichtbaar als admin reviews heeft aangezet)
router.get("/reviews", async (_req, res) => {
  const config = await readReviewsConfig();
  if (!config.visible) { res.json({ visible: false, items: [] }); return; }
  res.json({ visible: true, items: config.items });
});

// Reviews-config ophalen als admin (altijd, ongeacht visible)
router.get("/admin/reviews", async (_req, res) => {
  const config = await readReviewsConfig();
  res.json(config);
});

export default router;
