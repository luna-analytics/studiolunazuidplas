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

const router: IRouter = Router();

router.use(healthRouter);
router.use(interestsRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(bookingsRouter);
router.use(classesRouter);
router.use(villageRouter);

// Rittenkaart aanvraag (public of ingelogd)
router.post("/rittenkaart-request", (req: any, res: any) => {
  const { name, email, package: pkg } = req.body as { name?: string; email?: string; package?: string };
  if (!name || !email || !pkg) {
    res.status(400).json({ error: "Naam, e-mail en pakket zijn verplicht" }); return;
  }
  const validPkgs = ["5-rittenkaart", "10-rittenkaart", "losse_les"];
  if (!validPkgs.includes(pkg)) {
    res.status(400).json({ error: "Ongeldig pakket" }); return;
  }
  try {
    const request = createRequest({ name, email, package: pkg as any });
    res.json(request);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
