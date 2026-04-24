import { Router } from "express";
import { getUncachableStripeClient, getStripePublishableKey } from "../lib/stripeClient.js";
import { readClasses } from "../lib/classes.js";
import { readClassTypes } from "../lib/class-types.js";
import { createReservering, readReserveringen } from "../lib/reserveringen.js";
import { getAllBookings } from "../lib/bookings.js";
import { sendReservationConfirmation, sendAdminNotification } from "../lib/email.js";

const router = Router();

const BASE_URL = (() => {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  return domain ? `https://${domain}` : "http://localhost:8080";
})();

router.get("/stripe/publishable-key", async (_req, res) => {
  try {
    const key = await getStripePublishableKey();
    res.json({ publishableKey: key });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/stripe/checkout", async (req: any, res: any) => {
  try {
    const { name, email, classId, classTitle, dateStr, time, type } = req.body as {
      name?: string; email?: string; classId?: string; classTitle?: string;
      dateStr?: string; time?: string; type?: string;
    };

    if (!name || !email || !classId || !classTitle || !dateStr || !time || !type) {
      return res.status(400).json({ error: "Alle velden zijn verplicht" });
    }

    const [classes, allBookings, allReserveringen, lesTypes] = await Promise.all([
      readClasses(),
      getAllBookings(),
      readReserveringen(),
      readClassTypes(),
    ]);

    const cls = classes.find((c) => c.id === classId);
    if (!cls) return res.status(404).json({ error: "Les niet gevonden" });
    if (!cls.stripeBetaling || !cls.stripeBedrag) {
      return res.status(400).json({ error: "Deze les heeft geen online betaling ingesteld" });
    }

    const takenByBookings = allBookings.filter((b) => b.classId === classId && b.date === dateStr).length;
    const takenByReserveringen = allReserveringen.filter((r) => r.classId === classId && r.dateStr === dateStr).length;
    const available = cls.spotsTotal - takenByBookings - takenByReserveringen;
    if (available <= 0) {
      return res.status(409).json({ error: "Vol", message: "Deze les is helaas vol." });
    }

    const dubbel = allReserveringen.find(
      (r) => r.classId === classId && r.dateStr === dateStr && r.email.toLowerCase() === email.toLowerCase()
    );
    if (dubbel) {
      return res.status(409).json({ error: "DubbelReservering", message: "Je hebt al een plek gereserveerd voor deze les." });
    }

    const lesType = lesTypes.find((t) => t.id === type);
    const stripe = await getUncachableStripeClient();

    const params = new URLSearchParams({ name, email, classId, classTitle, dateStr, time, type });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: classTitle,
              description: `${dateStr} · ${time} uur`,
            },
            unit_amount: Math.round(cls.stripeBedrag * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      metadata: { name, email, classId, classTitle, dateStr, time, type },
      success_url: `${BASE_URL}/betaling/succes?${params.toString()}`,
      cancel_url: `${BASE_URL}/betaling/geannuleerd`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/stripe/bevestig", async (req: any, res: any) => {
  try {
    const { name, email, classId, classTitle, dateStr, time, type } = req.body as {
      name?: string; email?: string; classId?: string; classTitle?: string;
      dateStr?: string; time?: string; type?: string;
    };

    if (!name || !email || !classId || !classTitle || !dateStr || !time || !type) {
      return res.status(400).json({ error: "Alle velden zijn verplicht" });
    }

    const [allBookings, allReserveringen] = await Promise.all([getAllBookings(), readReserveringen()]);
    const dubbel = allReserveringen.find(
      (r) => r.classId === classId && r.dateStr === dateStr && r.email.toLowerCase() === email.toLowerCase()
    );
    if (dubbel) {
      return res.json({ ok: true, id: dubbel.id, alBevestigd: true });
    }

    const reservering = await createReservering({ name, email, classId, classTitle, dateStr, time, type });

    sendReservationConfirmation({ toEmail: email, toName: name, classTitle, dateStr, time, type }).catch(console.error);
    sendAdminNotification({
      type: "reservering",
      name,
      email,
      details: `Les: ${classTitle}\nDatum: ${dateStr}\nTijd: ${time} (online betaald)`,
    }).catch(console.error);

    res.json({ ok: true, id: reservering.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
