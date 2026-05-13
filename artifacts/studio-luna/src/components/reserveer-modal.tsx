import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Mail, User, ExternalLink, CreditCard, Banknote, Package } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Rittenkaart = { id: string; naam: string; prijs: number; geldigheid: string; beschrijving?: string };
type TarievenData = { proeflesPrijs: number; losseLes: number; rittenkaarten: Rittenkaart[] };

type Pakket = { id: string; label: string; prijs: number; credits: number; beschrijving: string };

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

type Stap = "pakket" | "gegevens" | "betaling" | "succes";

export function ReserveerModal({
  isOpen, onClose, classId, classTitle, dateLabel, dateStr, time, type, intakeVereist = true,
}: ReserveerModalProps) {
  const { user } = useAuth();

  const [stap, setStap] = useState<Stap>("pakket");
  const [tarieven, setTarieven] = useState<TarievenData | null>(null);
  const [pakketten, setPakketten] = useState<Pakket[]>([]);
  const [gekozenPakket, setGekozenPakket] = useState<Pakket | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<{ heeftAccount: boolean } | null>(null);

  // Als ingelogd lid: sla stap pakket/gegevens over als ze credits hebben
  const isLid = !!user && !user.isAdmin;
  const lidHeeftCredits = isLid && (user?.credits ?? 0) > 0;

  useEffect(() => {
    if (!isOpen) return;
    fetch(`${BASE}/api/tarieven`)
      .then((r) => r.ok ? r.json() : null)
      .then((d: TarievenData | null) => {
        if (!d) return;
        setTarieven(d);
        const lijst: Pakket[] = [
          { id: "proefles", label: "Proefles", prijs: d.proeflesPrijs, credits: 1, beschrijving: "Maak kennis met Studio Luna" },
          { id: "losse_les", label: "Losse les", prijs: d.losseLes, credits: 1, beschrijving: "Één enkele les" },
          ...d.rittenkaarten.map((rk) => {
            const match = rk.naam.match(/(\d+)/);
            const credits = match ? parseInt(match[1]) : 1;
            return { id: rk.id, label: rk.naam, prijs: rk.prijs, credits, beschrijving: rk.beschrijving ?? rk.geldigheid };
          }),
        ];
        setPakketten(lijst);
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Reset
      setError("");
      setSuccessData(null);
      if (lidHeeftCredits) {
        setStap("succes-direct");
      } else {
        setStap("pakket");
      }
    }
  }, [isOpen, lidHeeftCredits]);

  // Vul naam/email in van ingelogd lid
  useEffect(() => {
    if (user && !user.isAdmin) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStap("pakket");
      setGekozenPakket(null);
      setError("");
      setSuccessData(null);
      if (!user || user.isAdmin) { setName(""); setEmail(""); }
    }, 350);
  };

  const handleKiesPakket = (p: Pakket) => {
    setGekozenPakket(p);
    setError("");
    if (isLid) {
      setStap("betaling");
    } else {
      setStap("gegevens");
    }
  };

  const handleGegevensSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError("Vul je naam en e-mailadres in."); return; }
    setError("");
    setStap("betaling");
  };

  const handleStripe = async () => {
    if (!gekozenPakket) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/stripe/pakket-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, pakketId: gekozenPakket.id, classId, classTitle, dateStr, time, type, credits: gekozenPakket.credits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? "Er ging iets mis.");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContant = async () => {
    if (!gekozenPakket) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/stripe/contant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, pakketId: gekozenPakket.id, classId, classTitle, dateStr, time, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? "Er ging iets mis.");
      setSuccessData({ heeftAccount: data.heeftAccount });
      setStap("succes");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ingelogd lid met voldoende credits — direct boeken
  const handleLidDirectBoeken = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("sl_token");
      const res = await fetch(`${BASE}/api/boek-les`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ classId, classTitle, dateStr, time, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? "Er ging iets mis.");
      setSuccessData({ heeftAccount: true });
      setStap("succes");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const priceStr = (p: number) => `€ ${p.toFixed(2).replace(".", ",")}`;

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
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-background rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.12)] overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            <div className="absolute top-4 right-4">
              <button onClick={handleClose} className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 pt-10">
              {/* LES INFO HEADER */}
              {stap !== "succes" && (stap as string) !== "succes-direct" && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                    {stap === "pakket" ? "Plekje reserveren" : stap === "gegevens" ? "Jouw gegevens" : "Betalen"}
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-1">{classTitle}</h2>
                  <p className="text-foreground/70 font-medium capitalize">{dateLabel} · {time}</p>
                </div>
              )}

              {/* ─── STAP: SUCCES-DIRECT (lid met credits) ─── */}
              {(stap as string) === "succes-direct" && (
                <div className="flex flex-col items-center text-center py-6 space-y-4">
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Plekje reserveren</p>
                    <h2 className="font-display text-2xl font-semibold text-foreground mb-1">{classTitle}</h2>
                    <p className="text-foreground/70 font-medium capitalize">{dateLabel} · {time}</p>
                  </div>
                  <div className="w-full bg-secondary rounded-2xl px-4 py-3 text-left mb-2">
                    <p className="text-sm font-semibold text-foreground">Je hebt nog <span className="text-primary">{user?.credits} les{(user?.credits ?? 0) !== 1 ? "sen" : ""}</span> tegoed</p>
                    <p className="text-xs text-foreground/60 mt-0.5">Er wordt één les van je rittenkaart afgeschreven.</p>
                  </div>
                  {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2 w-full text-left">{error}</p>}
                  <button
                    onClick={handleLidDirectBoeken}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Spinner /> : "Plekje reserveren"}
                  </button>
                  <button
                    onClick={() => setStap("pakket")}
                    className="text-sm text-foreground/50 hover:text-foreground/80 underline underline-offset-2"
                  >
                    Toch een nieuw pakket kopen
                  </button>
                </div>
              )}

              {/* ─── STAP: PAKKET KIEZEN ─── */}
              {stap === "pakket" && (
                <div className="space-y-3">
                  {!tarieven ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : (
                    pakketten.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleKiesPakket(p)}
                        className="w-full text-left rounded-2xl border border-border/40 bg-secondary px-4 py-4 flex items-center justify-between hover:border-primary/40 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{p.label}</p>
                            <p className="text-xs text-foreground/50 mt-0.5">{p.beschrijving}</p>
                          </div>
                        </div>
                        <span className="font-bold text-foreground text-sm shrink-0 ml-3">{priceStr(p.prijs)}</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* ─── STAP: GEGEVENS (niet-ingelogd) ─── */}
              {stap === "gegevens" && (
                <form onSubmit={handleGegevensSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">Naam</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                      <input
                        required value={name} onChange={(e) => setName(e.target.value)}
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
                        required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="jouw@email.nl"
                        className="w-full bg-secondary border border-border/40 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{error}</p>}
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setStap("pakket")}
                      className="flex-1 py-3.5 rounded-2xl border border-border/40 text-foreground/70 font-semibold text-sm hover:bg-secondary transition-colors">
                      Terug
                    </button>
                    <button type="submit"
                      className="flex-[2] py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                      Verder
                    </button>
                  </div>
                </form>
              )}

              {/* ─── STAP: BETALING KIEZEN ─── */}
              {stap === "betaling" && gekozenPakket && (
                <div className="space-y-4">
                  <div className="bg-secondary rounded-2xl px-4 py-3">
                    <p className="text-xs text-foreground/50 uppercase tracking-wide font-semibold mb-0.5">Gekozen pakket</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-sm">{gekozenPakket.label}</span>
                      <span className="font-bold text-primary">{priceStr(gekozenPakket.prijs)}</span>
                    </div>
                    {!isLid && (
                      <p className="text-xs text-foreground/50 mt-0.5">{name} · {email}</p>
                    )}
                  </div>

                  {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{error}</p>}

                  <button
                    onClick={handleStripe}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2.5"
                  >
                    {loading ? <Spinner /> : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Online betalen — {priceStr(gekozenPakket.prijs)}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleContant}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl border-2 border-primary/20 text-primary font-semibold text-base hover:bg-primary/5 disabled:opacity-60 transition-colors flex items-center justify-center gap-2.5"
                  >
                    {loading ? <Spinner /> : (
                      <>
                        <Banknote className="w-4 h-4" />
                        Contant betalen in de studio
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-foreground/40 pt-1">
                    Online betalen gaat via Stripe (iDEAL of creditcard).<br />
                    Contant betalen reserveert jouw plek — betaling in de studio.
                  </p>

                  <button onClick={() => setStap(isLid ? "pakket" : "gegevens")}
                    className="w-full text-center text-sm text-foreground/40 hover:text-foreground/70 underline underline-offset-2">
                    Terug
                  </button>
                </div>
              )}

              {/* ─── STAP: SUCCES ─── */}
              {stap === "succes" && (
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
                      Je plekje voor <strong className="text-foreground">{classTitle}</strong> op <strong className="text-foreground">{dateLabel}</strong> om <strong className="text-foreground">{time}</strong> is gereserveerd.
                    </p>
                    {successData && !successData.heeftAccount && gekozenPakket && gekozenPakket.credits > 1 && (
                      <div className="mt-3 bg-secondary rounded-2xl px-4 py-3 text-left">
                        <p className="text-xs font-semibold text-foreground mb-1">Maak een account aan</p>
                        <p className="text-xs text-foreground/60 leading-relaxed">
                          Maak een gratis account aan en je rittenkaart-tegoed wordt automatisch bijgehouden.
                        </p>
                      </div>
                    )}
                  </div>
                  {intakeVereist && (
                    <a href="https://tally.so/r/XxED7j" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary text-sm font-semibold underline underline-offset-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Intake invullen (yoga)
                    </a>
                  )}
                  <button onClick={handleClose} className="text-sm text-foreground/40 hover:text-foreground/70 transition-colors underline underline-offset-2 pt-2">
                    Sluiten
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full"
    />
  );
}
