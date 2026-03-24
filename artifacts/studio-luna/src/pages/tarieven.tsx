import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Info, MessageCircleHeart, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Pakket = "5-rittenkaart" | "10-rittenkaart" | "losse_les";

function RittenkaartModal({ isOpen, onClose, pakket }: { isOpen: boolean; onClose: () => void; pakket: Pakket | null }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const label = pakket === "5-rittenkaart" ? "5-rittenkaart (€ 105,-)"
    : pakket === "10-rittenkaart" ? "10-rittenkaart (€ 195,-)"
    : "Losse les (€ 22,50)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE}/api/rittenkaart-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, package: pakket }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setDone(false); setError(""); if (!user) { setName(""); setEmail(""); } }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
          <motion.div className="relative w-full max-w-sm bg-background rounded-t-3xl md:rounded-3xl p-6 shadow-2xl mx-0 md:mx-4 z-10"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}>
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-foreground/50" />
            </button>

            {done ? (
              <div className="flex flex-col items-center text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-medium mb-2">Aanvraag ontvangen!</h2>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    Studio Luna ontvangt jouw aanvraag voor de <strong>{label}</strong>. Je hoort snel!
                  </p>
                </div>
                <button onClick={handleClose} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Sluiten
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h2 className="font-display text-xl font-medium mb-1">Aanvragen</h2>
                  <p className="text-sm text-foreground/60">{label}</p>
                </div>
                <p className="text-sm text-foreground/65 mb-5 leading-relaxed">
                  Stuur je aanvraag door — Studio Luna neemt contact op en regelt de betaling en credits.
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">Naam</label>
                    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jouw naam"
                      className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">E-mailadres</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jouw@email.nl"
                      className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors">
                    {loading ? "Bezig…" : "Aanvraag versturen"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Tarieven() {
  const [, navigate] = useLocation();
  const [requestPakket, setRequestPakket] = useState<Pakket | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);

  const openRequest = (pakket: Pakket) => {
    setRequestPakket(pakket);
    setRequestOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        <div className="px-6 md:px-12 lg:px-16 pt-14 md:pt-12 pb-12 bg-secondary md:rounded-3xl md:mx-6 md:mt-6 flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">Tarieven</h1>
            <p className="text-foreground/60 mt-2 text-sm leading-relaxed">Gun jezelf dit wekelijkse rustmoment tijdens je zwangerschap.</p>
          </motion.div>
          <div className="overflow-hidden shrink-0" style={{ height: '95px' }}>
            <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-32 w-auto" />
          </div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-8 space-y-3">

          {/* PROEFLES */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
            className="rounded-3xl px-5 py-4 border bg-card border-border/30">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-secondary">
                  <Tag className="w-4 h-4 text-foreground/40" />
                </div>
                <p className="font-semibold text-foreground text-sm">Proefles</p>
              </div>
              <span className="text-lg font-bold text-foreground shrink-0">€ 10,-</span>
            </div>
            <button onClick={() => navigate("/rooster")}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              Boek een proefles
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* LOSSE LES */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
            className="rounded-3xl px-5 py-4 border bg-card border-border/30">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-secondary">
                  <Tag className="w-4 h-4 text-foreground/40" />
                </div>
                <p className="font-semibold text-foreground text-sm">Losse les</p>
              </div>
              <span className="text-lg font-bold text-foreground shrink-0">€ 22,50</span>
            </div>
            <button onClick={() => navigate("/rooster")}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              Boek een losse les
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* 5-RITTENKAART */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="rounded-3xl px-5 py-4 border bg-card border-border/30">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-secondary">
                  <Tag className="w-4 h-4 text-foreground/40" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">5-rittenkaart</p>
                  <p className="text-xs text-foreground/45 mt-0.5 flex items-center gap-1">
                    <Info className="w-3 h-3" /> 2 maanden geldig
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-foreground shrink-0">€ 105,-</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageCircleHeart className="w-3.5 h-3.5 text-accent shrink-0" />
                <p className="text-xs font-semibold text-foreground">Inclusief toegang tot de Studio Luna WhatsApp-community</p>
              </div>
              <p className="text-xs text-foreground/50 leading-relaxed pl-5 mb-3">
                Ontvang tips, extra rustmomenten en blijf in verbinding met de andere moeders uit de village.
              </p>
              <button onClick={() => openRequest("5-rittenkaart")}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                5-rittenkaart aanvragen
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* 10-RITTENKAART */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}
            className="rounded-3xl px-5 py-4 border bg-card border-border/30">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-secondary">
                  <Tag className="w-4 h-4 text-foreground/40" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">10-rittenkaart</p>
                  <p className="text-xs text-foreground/45 mt-0.5 flex items-center gap-1">
                    <Info className="w-3 h-3" /> 4 maanden geldig
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-foreground shrink-0">€ 195,-</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageCircleHeart className="w-3.5 h-3.5 text-accent shrink-0" />
                <p className="text-xs font-semibold text-foreground">Inclusief toegang tot de Studio Luna WhatsApp-community</p>
              </div>
              <p className="text-xs text-foreground/50 leading-relaxed pl-5 mb-3">
                Ontvang tips, extra rustmomenten en blijf in verbinding met de andere moeders uit de village.
              </p>
              <button onClick={() => openRequest("10-rittenkaart")}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                10-rittenkaart aanvragen
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* BETALING */}
          <div className="rounded-3xl border border-dashed border-accent/50 bg-accent/10 px-5 py-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">💳 Betaling</p>
              <p className="text-sm text-foreground/65 leading-relaxed">Betalen kan contant in de studio of via Tikkie.</p>
            </div>
            <p className="text-sm text-foreground/50 leading-relaxed">Rittenkaarten zijn persoonlijk en niet overdraagbaar.</p>
          </div>

        </div>

        <div className="pb-8" />
        <BottomNav />
        <RittenkaartModal isOpen={requestOpen} onClose={() => setRequestOpen(false)} pakket={requestPakket} />
      </div>
    </div>
  );
}
