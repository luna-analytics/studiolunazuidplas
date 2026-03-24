import { useAuth, getToken } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { LoginModal } from "@/components/login-modal";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FileText, Video, BookOpen, LogIn, Lock, Headphones, Baby, Heart, X, CheckCircle2, Share2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function BevallenModal({ onClose, memberName }: { onClose: () => void; memberName: string }) {
  const [shareConsent, setShareConsent] = useState(true);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE}/api/village/bevallen`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ shareConsent, note }),
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

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={!done ? onClose : undefined} />
        <motion.div
          className="relative w-full max-w-sm bg-background rounded-t-3xl md:rounded-3xl shadow-2xl mx-0 md:mx-4 z-10 overflow-hidden"
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {!done ? (
            <div className="p-7">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-foreground/50" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Baby className="w-8 h-8 text-pink-400" />
                </div>
                <h2 className="font-display text-2xl font-medium mb-1">Gefeliciteerd! 🎉</h2>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  Wat een bijzonder moment. Er ligt een cadeautje voor jou klaar bij Studio Luna!
                </p>
              </div>

              <div className="bg-secondary rounded-2xl px-4 py-4 mb-4">
                <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400 shrink-0" /> Een cadeautje van Studio Luna
                </p>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  Marjolein heeft een persoonlijk cadeautje voor jou klaarliggen. Kom het ophalen wanneer je er klaar voor bent!
                </p>
              </div>

              <div className="mb-5">
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2 block">
                  Voeg een berichtje toe (optioneel)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="bijv. naam van de baby, wanneer je een moment kunt komen…"
                  rows={2}
                  className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <button
                onClick={() => setShareConsent(!shareConsent)}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-5 border-2 transition-all text-left ${
                  shareConsent ? "border-primary/40 bg-primary/5" : "border-border/30 bg-secondary"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${shareConsent ? "border-primary bg-primary" : "border-foreground/30"}`}>
                  {shareConsent && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Deel dit met de community</p>
                  <p className="text-xs text-foreground/55 leading-relaxed mt-0.5">Studio Luna mag dit nieuws delen in de WhatsApp-community.</p>
                </div>
              </button>

              {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2 mb-4">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {loading ? "Bezig…" : "Ik ben bevallen! Stuur het door 🎀"}
              </button>
            </div>
          ) : (
            <div className="p-7 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Baby className="w-8 h-8 text-pink-400" />
              </div>
              <h2 className="font-display text-2xl font-medium mb-2">Doorgegeven! 💕</h2>
              <p className="text-sm text-foreground/60 leading-relaxed mb-2">
                Marjolein is op de hoogte. Je cadeautje ligt voor jou klaar bij Studio Luna.
              </p>
              {shareConsent && (
                <div className="flex items-center gap-2 bg-secondary rounded-2xl px-4 py-3 mb-5 w-full">
                  <Share2 className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs text-foreground/65">Jouw nieuws wordt gedeeld met de community 🎉</p>
                </div>
              )}
              <button onClick={onClose}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                Sluiten
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Village() {
  const { user, loading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [bevallenOpen, setBevallenOpen] = useState(false);

  const isVillager = user && !user.isAdmin && user.credits > 0;

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        <div className="px-6 md:px-12 lg:px-16 pt-14 md:pt-12 pb-12 bg-secondary md:rounded-3xl md:mx-6 md:mt-6 flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">De Village</h1>
            <p className="text-foreground/55 text-sm mt-1">Exclusief voor Studio Luna leden</p>
          </motion.div>
          <div className="overflow-hidden shrink-0" style={{ height: '95px' }}>
            <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-32 w-auto" />
          </div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-6 mb-8 space-y-4">

          {loading ? null : !isVillager ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/30 rounded-3xl p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-foreground/50" />
              </div>
              <h2 className="font-display text-xl font-medium mb-2">Alleen voor leden</h2>
              <p className="text-sm text-foreground/60 mb-6 leading-relaxed max-w-xs">
                {!user
                  ? "De Village is een besloten plek voor Studio Luna leden. Log in om te zien of je toegang hebt."
                  : "De Village wordt vrijgegeven zodra jij een pakket hebt. Neem contact op met Studio Luna."
                }
              </p>
              {!user && (
                <button onClick={() => setLoginOpen(true)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                  <LogIn className="w-4 h-4" /> Inloggen
                </button>
              )}
            </motion.div>

          ) : (
            <>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-foreground/60 leading-relaxed">
                Welkom in jouw eigen village, {user.name.split(" ")[0]} 🌿
              </motion.p>

              {/* BEVALLEN CARD */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
                className="rounded-3xl overflow-hidden border border-pink-200/60"
                style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)" }}>
                <div className="px-5 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                      <Baby className="w-6 h-6 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-0.5">Ik ben bevallen! 🎉</p>
                      <p className="text-sm text-foreground/60 leading-relaxed mb-4">
                        Grote gefeliciteerd! Geef het door — er ligt een persoonlijk cadeautje van Marjolein voor je klaar. Je kiest zelf of je het ook mag delen met de community.
                      </p>
                      <button onClick={() => setBevallenOpen(true)}
                        className="flex items-center gap-2 bg-white text-pink-500 border border-pink-200 px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-pink-50 transition-colors shadow-sm">
                        <Baby className="w-4 h-4" /> Meld het door
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* DOWNLOADS */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
                className="rounded-3xl bg-secondary border border-border/30 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display text-lg font-medium text-foreground">Downloads</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Geboorte-affirmaties van Studio Luna", sub: "PDF · binnenkort beschikbaar" },
                    { title: "Ademhalingsoefeningen voor thuis", sub: "PDF · binnenkort beschikbaar" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3 flex items-center justify-between gap-3 opacity-50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-foreground/50 mt-0.5">{item.sub}</p>
                      </div>
                      <FileText className="w-4 h-4 text-foreground/30 shrink-0" />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* VIDEO'S */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
                className="rounded-3xl bg-secondary border border-border/30 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display text-lg font-medium text-foreground">Video's</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "3 minuten ademhaling voor rust", sub: "Video · binnenkort beschikbaar" },
                    { title: "Zachte bekkenoefeningen", sub: "Video · binnenkort beschikbaar" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3 flex items-center justify-between gap-3 opacity-50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-foreground/50 mt-0.5">{item.sub}</p>
                      </div>
                      <Video className="w-4 h-4 text-foreground/30 shrink-0" />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* BOEKEN & PODCASTS */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-3xl bg-secondary border border-border/30 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display text-lg font-medium text-foreground">Boeken & Podcasts</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Aanbevolen boeken", sub: "Lijst · binnenkort beschikbaar", icon: BookOpen },
                    { title: "Favoriete podcasts", sub: "Lijst · binnenkort beschikbaar", icon: Headphones },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3 flex items-center justify-between gap-3 opacity-50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-foreground/50 mt-0.5">{item.sub}</p>
                      </div>
                      <item.icon className="w-4 h-4 text-foreground/30 shrink-0" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>

        <BottomNav />
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        {bevallenOpen && <BevallenModal onClose={() => setBevallenOpen(false)} memberName={user?.name ?? ""} />}
      </div>
    </div>
  );
}
