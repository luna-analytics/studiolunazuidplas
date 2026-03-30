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
import { createReservering, readReserveringen } from "../lib/reserveringen.js";
import { sendReservationConfirmation } from "../lib/email.js";
import { readClasses } from "../lib/classes.js";
import { getAllBookings } from "../lib/bookings.js";
import { readPaginaTeksten } from "../lib/pagina-teksten.js";

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

// Publieke pagina-teksten endpoint
router.get("/pagina-teksten", async (_req, res) => {
  res.json(await readPaginaTeksten());
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
