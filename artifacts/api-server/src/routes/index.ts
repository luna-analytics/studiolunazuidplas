import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interestsRouter from "./interests";
import authRouter from "./auth";
import adminRouter from "./admin";
import bookingsRouter from "./bookings";
import classesRouter from "./classes";
import villageRouter from "./village";

// Public rittenkaart request endpoint
import { createRequest } from "../lib/requests.js";
import { findMemberById } from "../lib/users.js";
import { requireAuth } from "../middlewares/auth.js";
import { readClassTypes } from "../lib/class-types.js";
import { readTarieven } from "../lib/tarieven.js";
import { createReservering } from "../lib/reserveringen.js";
import { sendReservationConfirmation } from "../lib/email.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interestsRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(bookingsRouter);
router.use(classesRouter);
router.use(villageRouter);

// Publieke class-types endpoint
router.get("/class-types", async (_req, res) => {
  res.json((await readClassTypes()).filter((t) => t.actief));
});

// Publieke tarieven endpoint
router.get("/tarieven", async (_req, res) => {
  res.json(await readTarieven());
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
    const reservering = await createReservering({ name, email, classId, classTitle, dateStr, time, type });
    // Stuur bevestigingsmail (fire-and-forget, blokkeer response niet)
    sendReservationConfirmation({ toEmail: email, toName: name, classTitle, dateStr, time, type }).catch(console.error);
    res.json(reservering);
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
    res.json(request);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
