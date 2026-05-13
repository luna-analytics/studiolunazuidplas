import { Router } from "express";
import { getUncachableStripeClient, getStripePublishableKey } from "../lib/stripeClient.js";
import { readClasses } from "../lib/classes.js";
import { readClassTypes } from "../lib/class-types.js";
import { createReservering, readReserveringen } from "../lib/reserveringen.js";
import { getAllBookings, createBooking } from "../lib/bookings.js";
import { sendReservationConfirmation, sendAdminNotification } from "../lib/email.js";
import { readTarieven } from "../lib/tarieven.js";
import { findMemberByEmail, updateMemberCredits } from "../lib/users.js";
import { requireAuth } from "../middlewares/auth.js";

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

// ─── PAKKET CHECKOUT (proefles / losse les / rittenkaart voor niet-ingelogde bezoeker) ──
router.post("/stripe/pakket-checkout", async (req: any, res: any) => {
  try {
    const { name, email, pakketId, classId, classTitle, dateStr, time, type } = req.body as {
      name?: string; email?: string; pakketId?: string;
      classId?: string; classTitle?: string; dateStr?: string; time?: string; type?: string;
    };
    if (!name || !email || !pakketId || !classId || !classTitle || !dateStr || !time || !type) {
      return res.status(400).json({ error: "Alle velden zijn verplicht" });
    }

    const tarieven = await readTarieven();
    let label = "";
    let prijs = 0;
    let credits = 0;

    if (pakketId === "proefles") {
      label = "Proefles"; prijs = tarieven.proeflesPrijs; credits = 1;
    } else if (pakketId === "losse_les") {
      label = "Losse les"; prijs = tarieven.losseLes; credits = 1;
    } else {
      const rk = tarieven.rittenkaarten.find((r) => r.id === pakketId);
      if (!rk) return res.status(404).json({ error: "Pakket niet gevonden" });
      label = rk.naam; prijs = rk.prijs;
      // credits = lessen, haal uit naam bijv "5-rittenkaart" → 5
      const match = rk.naam.match(/(\d+)/);
      credits = match ? parseInt(match[1]) : 1;
    }

    const [classes, allBookings, allReserveringen] = await Promise.all([
      readClasses(), getAllBookings(), readReserveringen(),
    ]);
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return res.status(404).json({ error: "Les niet gevonden" });

    const takenByBookings = allBookings.filter((b) => b.classId === classId && b.date === dateStr).length;
    const takenByReserveringen = allReserveringen.filter((r) => r.classId === classId && r.dateStr === dateStr).length;
    if (cls.spotsTotal - takenByBookings - takenByReserveringen <= 0) {
      return res.status(409).json({ error: "Vol", message: "Deze les is helaas vol." });
    }

    const stripe = await getUncachableStripeClient();
    const params = new URLSearchParams({ name, email, pakketId, classId, classTitle, dateStr, time, type, credits: String(credits) });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: label, description: `${classTitle} · ${dateStr} · ${time} uur` },
          unit_amount: Math.round(prijs * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      customer_email: email,
      metadata: { name, email, pakketId, classId, classTitle, dateStr, time, type, credits: String(credits) },
      success_url: `${BASE_URL}/betaling/pakket-succes?${params.toString()}`,
      cancel_url: `${BASE_URL}/betaling/geannuleerd`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe pakket checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── PAKKET BEVESTIG (na Stripe betaling pakket) ─────────────────────────────
router.post("/stripe/pakket-bevestig", async (req: any, res: any) => {
  try {
    const { name, email, pakketId, classId, classTitle, dateStr, time, type, credits } = req.body as {
      name?: string; email?: string; pakketId?: string; classId?: string; classTitle?: string;
      dateStr?: string; time?: string; type?: string; credits?: string;
    };
    if (!name || !email || !classId || !classTitle || !dateStr || !time || !type) {
      return res.status(400).json({ error: "Verplichte velden ontbreken" });
    }

    const creditsN = credits ? parseInt(credits) : 1;
    const [allReserveringen] = await Promise.all([readReserveringen()]);

    // Voorkom dubbele reservering
    const dubbel = allReserveringen.find(
      (r) => r.classId === classId && r.dateStr === dateStr && r.email.toLowerCase() === email.toLowerCase()
    );
    if (dubbel) return res.json({ ok: true, id: dubbel.id, alBevestigd: true });

    // Maak reservering aan (betaaldStripe = true)
    const reservering = await createReservering({ name, email, classId, classTitle, dateStr, time, type, betaaldStripe: true });

    // Als er een account is, voeg credits toe
    const member = await findMemberByEmail(email);
    if (member) {
      await updateMemberCredits(member.id, creditsN);
    }

    sendReservationConfirmation({ toEmail: email, toName: name, classTitle, dateStr, time, type }).catch(console.error);
    sendAdminNotification({
      type: "reservering", name, email,
      details: `Les: ${classTitle}\nDatum: ${dateStr}\nTijd: ${time}\nPakket: ${pakketId} (Stripe betaald)`,
    }).catch(console.error);

    res.json({ ok: true, id: reservering.id, heeftAccount: !!member });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CONTANT BETALEN (direct reserveren zonder Stripe) ────────────────────────
router.post("/stripe/contant", async (req: any, res: any) => {
  try {
    const { name, email, pakketId, classId, classTitle, dateStr, time, type } = req.body as {
      name?: string; email?: string; pakketId?: string;
      classId?: string; classTitle?: string; dateStr?: string; time?: string; type?: string;
    };
    if (!name || !email || !classId || !classTitle || !dateStr || !time || !type) {
      return res.status(400).json({ error: "Verplichte velden ontbreken" });
    }

    const tarieven = await readTarieven();
    let credits = 1;
    if (pakketId && pakketId !== "proefles" && pakketId !== "losse_les") {
      const rk = tarieven.rittenkaarten.find((r) => r.id === pakketId);
      if (rk) { const m = rk.naam.match(/(\d+)/); credits = m ? parseInt(m[1]) : 1; }
    }

    const [classes, allBookings, allReserveringen] = await Promise.all([
      readClasses(), getAllBookings(), readReserveringen(),
    ]);
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return res.status(404).json({ error: "Les niet gevonden" });

    const takenByBookings = allBookings.filter((b) => b.classId === classId && b.date === dateStr).length;
    const takenByReserveringen = allReserveringen.filter((r) => r.classId === classId && r.dateStr === dateStr).length;
    if (cls.spotsTotal - takenByBookings - takenByReserveringen <= 0) {
      return res.status(409).json({ error: "Vol", message: "Deze les is helaas vol." });
    }

    const dubbel = allReserveringen.find(
      (r) => r.classId === classId && r.dateStr === dateStr && r.email.toLowerCase() === email.toLowerCase()
    );
    if (dubbel) return res.status(409).json({ error: "DubbelReservering", message: "Je hebt al een plek gereserveerd." });

    const reservering = await createReservering({ name, email, classId, classTitle, dateStr, time, type, betaaldContant: false });

    // Als er een account is, voeg credits toe
    const member = await findMemberByEmail(email);
    if (member) { await updateMemberCredits(member.id, credits); }

    sendReservationConfirmation({ toEmail: email, toName: name, classTitle, dateStr, time, type }).catch(console.error);
    sendAdminNotification({
      type: "reservering", name, email,
      details: `Les: ${classTitle}\nDatum: ${dateStr}\nTijd: ${time}\nPakket: ${pakketId ?? "onbekend"} (contant)`,
    }).catch(console.error);

    res.json({ ok: true, id: reservering.id, heeftAccount: !!member });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INGELOGD LID PAKKET KOPEN (Stripe) ──────────────────────────────────────
router.post("/stripe/lid-pakket-checkout", requireAuth, async (req: any, res: any) => {
  try {
    const { pakketId } = req.body as { pakketId?: string };
    if (!pakketId) return res.status(400).json({ error: "Pakket verplicht" });

    const { findMemberById: getMember } = await import("../lib/users.js");
    const member = await getMember(req.userId);
    if (!member) return res.status(404).json({ error: "Lid niet gevonden" });

    const tarieven = await readTarieven();
    let label = ""; let prijs = 0; let credits = 0;

    if (pakketId === "losse_les") {
      label = "Losse les"; prijs = tarieven.losseLes; credits = 1;
    } else {
      const rk = tarieven.rittenkaarten.find((r) => r.id === pakketId);
      if (!rk) return res.status(404).json({ error: "Pakket niet gevonden" });
      label = rk.naam; prijs = rk.prijs;
      const match = rk.naam.match(/(\d+)/);
      credits = match ? parseInt(match[1]) : 1;
    }

    const stripe = await getUncachableStripeClient();
    const params = new URLSearchParams({ memberId: member.id, pakketId, credits: String(credits) });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: label },
          unit_amount: Math.round(prijs * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      customer_email: member.email,
      metadata: { memberId: member.id, pakketId, credits: String(credits) },
      success_url: `${BASE_URL}/betaling/lid-succes?${params.toString()}`,
      cancel_url: `${BASE_URL}/tarieven`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INGELOGD LID PAKKET BEVESTIG ────────────────────────────────────────────
router.post("/stripe/lid-pakket-bevestig", async (req: any, res: any) => {
  try {
    const { memberId, pakketId, credits } = req.body as { memberId?: string; pakketId?: string; credits?: string };
    if (!memberId || !credits) return res.status(400).json({ error: "Verplichte velden ontbreken" });
    const creditsN = parseInt(credits);
    await updateMemberCredits(memberId, creditsN);
    res.json({ ok: true });
  } catch (err: any) {
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
