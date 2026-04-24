import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Mail, User, ClipboardList, ExternalLink } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface ReserveerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  classTitle: string;
  dateLabel: string;
  dateStr: string;
  time: string;
  type: string;
  intakeVereist?: boolean;
  stripeBetaling?: boolean;
  stripeBedrag?: number;
}

export function ReserveerModal({
  isOpen, onClose, classId, classTitle, dateLabel, dateStr, time, type, intakeVereist = true,
  stripeBetaling = false, stripeBedrag,
}: ReserveerModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [betalingInfo, setBetalingInfo] = useState("Betaling vindt in de studio plaats — contant of via Tikkie");

  useEffect(() => {
    fetch(`${BASE}/api/tarieven`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.betalingInfo) setBetalingInfo(d.betalingInfo); })
      .catch(() => {});
  }, []);

  const showIntake = intakeVereist;

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Vul je naam en e-mailadres in.");
      return;
    }
    setStripeLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, classId, classTitle, dateStr, time, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Vol") throw new Error("Deze les is helaas vol.");
        if (data.error === "DubbelReservering") throw new Error("Je hebt al een plek gereserveerd voor deze les.");
        throw new Error(data.message ?? data.error ?? "Er ging iets mis.");
      }
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStripeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/reserveer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, classId, classTitle, dateStr, time, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Vol") {
          throw new Error("Deze les is helaas vol. Neem contact op via WhatsApp als je op de wachtlijst wil staan.");
        }
        if (data.error === "DubbelReservering") {
          throw new Error("Je hebt al een plek gereserveerd voor deze les.");
        }
        throw new Error(data.message ?? data.error ?? "Er ging iets mis, probeer het opnieuw.");
      }
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setDone(false);
      setError("");
      setName("");
      setEmail("");
    }, 350);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-background rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <button onClick={handleClose} className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 pt-10">
              {done ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-8 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold mb-2">Gereserveerd!</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Je plekje voor <strong className="text-foreground">{classTitle}</strong> op {dateLabel} is gereserveerd.
                      Je ontvangt een bevestiging op <strong className="text-foreground">{email}</strong>.
                    </p>
                  </div>
                  {showIntake && (
                    <a
                      href="https://tally.so/r/XxED7j"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary text-sm font-semibold underline underline-offset-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Intake invullen (yoga)
                    </a>
                  )}
                  <button onClick={handleClose} className="text-sm text-foreground/40 hover:text-foreground/70 transition-colors underline underline-offset-2 pt-2">
                    Sluiten
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Plekje reserveren</p>
                    <h2 className="font-display text-2xl font-semibold text-foreground mb-1">{classTitle}</h2>
                    <p className="text-foreground/70 font-medium capitalize">{dateLabel} · {time}</p>
                  </div>

                  {showIntake && (
                    <div className="bg-secondary rounded-2xl px-4 py-3 mb-4 flex items-start gap-3">
                      <ClipboardList className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Intake invullen</p>
                        <p className="text-xs text-foreground/60 mt-0.5 leading-relaxed">
                          Vul het korte intakeformulier in zodat Studio Luna je goed kan begeleiden.{" "}
                          <a href="https://tally.so/r/XxED7j" target="_blank" rel="noopener noreferrer"
                            className="text-primary underline underline-offset-2 font-medium">Intake invullen</a>
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={stripeBetaling ? handleStripeCheckout : handleSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">Naam</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                        <input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jouw naam"
                          className="w-full bg-secondary border border-border/40 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">E-mailadres</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jouw@email.nl"
                          className="w-full bg-secondary border border-border/40 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading || stripeLoading}
                      className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {(loading || stripeLoading) ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      ) : stripeBetaling ? (
                        <>Betalen{stripeBedrag ? ` — € ${stripeBedrag.toFixed(2).replace(".", ",")}` : ""}</>
                      ) : "Plekje reserveren"}
                    </button>

                    <p className="text-xs text-center text-foreground/40 pt-1">
                      {stripeBetaling
                        ? "Je wordt doorgestuurd naar Stripe voor veilige betaling"
                        : betalingInfo}
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
