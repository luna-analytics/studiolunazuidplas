import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Info, MessageCircleHeart, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Rittenkaart = { id: string; naam: string; lessen: number; prijs: number; geldigheid: string; omschrijving?: string; actief: boolean };
type Special = { id: string; naam: string; prijs: number; beschrijving?: string; typeId?: string; proeflesGeldig: boolean; actief: boolean };
type TarievenData = {
  proeflesPrijs: number;
  losseLes: number;
  rittenkaarten: Rittenkaart[];
  specials: Special[];
  betalingInfo: string;
};

function fmtPrijs(n: number) {
  return `€ ${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace(".", ",")},-`;
}

function RequestModal({ isOpen, onClose, pakket, label }: { isOpen: boolean; onClose: () => void; pakket: string | null; label: string }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

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
                    Studio Luna ontvangt jouw aanvraag voor <strong>{label}</strong>. Je hoort snel!
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
                  Studio Luna voegt zo snel mogelijk je credits toe aan je account. De betaling vindt in de studio plaats bij je eerstvolgende les.
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

const DEFAULT_TARIEVEN: TarievenData = {
  proeflesPrijs: 10,
  losseLes: 22.5,
  rittenkaarten: [
    { id: "5rit", naam: "5-rittenkaart", lessen: 5, prijs: 105, geldigheid: "2 maanden", actief: true },
    { id: "10rit", naam: "10-rittenkaart", lessen: 10, prijs: 195, geldigheid: "4 maanden", actief: true },
  ],
  specials: [],
  betalingInfo: "Betalen kan contant in de studio of via Tikkie. Rittenkaarten zijn persoonlijk en niet overdraagbaar.",
};

export default function Tarieven() {
  const [, navigate] = useLocation();
  const [requestPakket, setRequestPakket] = useState<string | null>(null);
  const [requestLabel, setRequestLabel] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [tarieven, setTarieven] = useState<TarievenData>(DEFAULT_TARIEVEN);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/tarieven`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setTarieven(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openRequest = (pakket: string, label: string) => {
    setRequestPakket(pakket);
    setRequestLabel(label);
    setRequestOpen(true);
  };

  const activeRittenkaarten = tarieven.rittenkaarten.filter((r) => r.actief !== false);
  const activeSpecials = tarieven.specials.filter((s) => s.actief !== false);

  const computeVolgorde = (): string[] => {
    const all = [
      "proefles", "losseles",
      ...activeRittenkaarten.map((r) => "rit-" + r.id),
      ...activeSpecials.map((s) => "special-" + s.id),
    ];
    if (tarieven.volgorde && tarieven.volgorde.length > 0) {
      const valid = tarieven.volgorde.filter((k) => all.includes(k));
      const missing = all.filter((k) => !valid.includes(k));
      return [...valid, ...missing];
    }
    return all;
  };

  const renderBlock = (key: string, index: number) => {
    const delay = index * 0.07;
    if (key === "proefles") return (
      <motion.div key="proefles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="rounded-3xl px-5 py-4 border bg-card border-border/30">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-secondary">
              <Tag className="w-4 h-4 text-foreground/40" />
            </div>
            <p className="font-semibold text-foreground text-sm">Proefles</p>
          </div>
          <span className="text-lg font-bold text-foreground shrink-0">{fmtPrijs(tarieven.proeflesPrijs)}</span>
        </div>
        <button onClick={() => navigate("/rooster")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
          Boek een proefles <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
    if (key === "losseles") return (
      <motion.div key="losseles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="rounded-3xl px-5 py-4 border bg-card border-border/30">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-secondary">
              <Tag className="w-4 h-4 text-foreground/40" />
            </div>
            <p className="font-semibold text-foreground text-sm">Losse les</p>
          </div>
          <span className="text-lg font-bold text-foreground shrink-0">{fmtPrijs(tarieven.losseLes)}</span>
        </div>
        <button onClick={() => openRequest("losse_les", `Losse les (${fmtPrijs(tarieven.losseLes)})`)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
          Losse les aanvragen <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
    if (key.startsWith("rit-")) {
      const rk = activeRittenkaarten.find((r) => r.id === key.slice(4));
      if (!rk) return null;
      return (
        <motion.div key={rk.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
          className="rounded-3xl px-5 py-4 border bg-card border-border/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-secondary">
                <Tag className="w-4 h-4 text-foreground/40" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{rk.naam}</p>
                <p className="text-xs text-foreground/45 mt-0.5 flex items-center gap-1">
                  <Info className="w-3 h-3" /> {rk.geldigheid} geldig
                </p>
              </div>
            </div>
            <span className="text-lg font-bold text-foreground shrink-0">{fmtPrijs(rk.prijs)}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border/20">
            {rk.omschrijving ? (
              <p className="text-xs text-foreground/55 leading-relaxed mb-3">{rk.omschrijving}</p>
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageCircleHeart className="w-3.5 h-3.5 text-accent shrink-0" />
                  <p className="text-xs font-semibold text-foreground">Inclusief toegang tot de Studio Luna WhatsApp-community</p>
                </div>
                <p className="text-xs text-foreground/50 leading-relaxed pl-5 mb-3">
                  Ontvang tips, extra rustmomenten en blijf in verbinding met de andere moeders uit de village.
                </p>
              </>
            )}
            <button onClick={() => openRequest(rk.id, `${rk.naam} (${fmtPrijs(rk.prijs)})`)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              {rk.naam} aanvragen <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      );
    }
    if (key.startsWith("special-")) {
      const sp = activeSpecials.find((s) => s.id === key.slice(8));
      if (!sp) return null;
      return (
        <motion.div key={sp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
          className="rounded-3xl px-5 py-4 border bg-card border-border/30">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="font-semibold text-foreground text-sm">{sp.naam}</p>
            <span className="text-lg font-bold text-foreground shrink-0">{fmtPrijs(sp.prijs)}</span>
          </div>
          {sp.beschrijving && <p className="text-xs text-foreground/55 leading-relaxed mb-3">{sp.beschrijving}</p>}
          <button onClick={() => openRequest(sp.id, `${sp.naam} (${fmtPrijs(sp.prijs)})`)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
            Aanvragen <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      );
    }
    return null;
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

        <div className="px-6 md:px-12 lg:px-16 pt-8 space-y-3 pb-8">

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {computeVolgorde().map((key, i) => renderBlock(key, i))}

              {/* BETALING */}
              <div className="rounded-3xl border border-dashed border-accent/50 bg-accent/10 px-5 py-4">
                <p className="text-sm font-semibold text-foreground mb-1">💳 Betaling</p>
                <p className="text-sm text-foreground/65 leading-relaxed">{tarieven.betalingInfo || "Betalen kan contant in de studio of via Tikkie."}</p>
              </div>
            </>
          )}
        </div>

        <BottomNav />
        <RequestModal isOpen={requestOpen} onClose={() => setRequestOpen(false)} pakket={requestPakket} label={requestLabel} />
      </div>
    </div>
  );
}
