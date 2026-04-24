import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interestsRouter from "./interests";
import authRouter from "./auth";
import adminRouter from "./admin";
import bookingsRouter from "./bookings";
import classesRouter from "./classes";
import villageRouter from "./village";
import stripeRouter from "./stripe";

// Public rittenkaart request endpoint
import { createRequest } from "../lib/requests.js";
import { findMemberById } from "../lib/users.js";
import { requireAuth } from "../middlewares/auth.js";
import { readClassTypes } from "../lib/class-types.js";
import { readTarieven } from "../lib/tarieven.js";
import { createReservering, readReserveringen } from "../lib/reserveringen.js";
import { sendAdminNotification } from "../lib/email.js";
import { readClasses } from "../lib/classes.js";
import { getAllBookings } from "../lib/bookings.js";
import { readPaginaTeksten } from "../lib/pagina-teksten.js";
import { getAllFotos } from "../lib/foto-store.js";
import { readPosts } from "../lib/blog.js";
import { getImage } from "../lib/image-store.js";
import { getCommentsForPost, addComment } from "../lib/blog-comments.js";
import { readReviewsConfig } from "../lib/reviews.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interestsRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(bookingsRouter);
router.use(classesRouter);
router.use(villageRouter);
router.use(stripeRouter);

// Publieke class-types endpoint
router.get("/class-types", async (_req, res) => {
  res.json((await readClassTypes()).filter((t) => t.actief));
});

// Publieke tarieven endpoint
router.get("/tarieven", async (_req, res) => {
  res.json(await readTarieven());
});

// Publieke pagina-teksten endpoint (inclusief foto's van aparte sleutels)
router.get("/pagina-teksten", async (_req, res) => {
  const [teksten, fotos] = await Promise.all([readPaginaTeksten(), getAllFotos()]);
  res.json({ ...teksten, ...fotos });
});

// Publieke blog-endpoint (alleen gepubliceerde artikelen)
router.get("/blog", async (_req, res) => {
  const posts = (await readPosts()).filter((p) => p.published);
  const withCovers = await Promise.all(
    posts.map(async (p) => ({ ...p, coverImage: await getImage(`blog_cover_${p.id}`) }))
  );
  res.json(withCovers);
});

// Enkel artikel ophalen (publiek)
router.get("/blog/:id", async (req, res) => {
  const posts = await readPosts();
  const param = req.params.id;
  const post = posts.find((p) => p.published && (p.slug === param || p.id === param));
  if (!post) { res.status(404).json({ error: "Niet gevonden" }); return; }
  const coverImage = await getImage(`blog_cover_${post.id}`);
  res.json({ ...post, coverImage });
});

// Blog reacties (publiek: lezen + insturen)
router.get("/blog/:id/comments", async (req, res) => {
  const comments = await getCommentsForPost(req.params.id, true);
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
  const comment = await addComment(req.params.id, name, body, email);
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

// Reserveringen voor ingelogde gebruiker (op basis van e-mail)
router.get("/reserveringen/mijn", requireAuth, async (req: any, res: any) => {
  try {
    const member = await findMemberById(req.userId);
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
