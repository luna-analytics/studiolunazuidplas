import { useAuth, getToken } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { LoginModal } from "@/components/login-modal";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  FileText, Video, BookOpen, LogIn, Lock, Headphones, Baby, Heart,
  X, CheckCircle2, Share2, Calendar, Sparkles, MessageCircle,
  MapPin, Clock, Pencil, Check, ChevronRight,
} from "lucide-react";
import { format, parseISO, differenceInDays, differenceInWeeks } from "date-fns";
import { nl } from "date-fns/locale";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function authFetch(path: string, opts?: RequestInit) {
  return fetch(`${BASE}/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts?.headers ?? {}) },
  });
}

type VillageData = {
  profile: { memberId: string; dueDate?: string; intro?: string; checkedItems: string[] };
  tip: { id: string; text: string; emoji: string } | null;
  events: { id: string; title: string; date: string; time?: string; description: string; location?: string }[];
  question: { id: string; question: string } | null;
  myAnswer: { text: string; anonymous: boolean } | null;
  births: { id: string; memberName: string; note?: string; createdAt: string }[];
  checklistItems: { id: string; text: string }[];
};

// ─── MODALS ──────────────────────────────────────────────────────────────────

function BevallenModal({ onClose }: { onClose: () => void }) {
  const [shareConsent, setShareConsent] = useState(true);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await authFetch("/village/bevallen", { method: "POST", body: JSON.stringify({ shareConsent, note }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={!done ? onClose : undefined} />
      <motion.div className="relative w-full max-w-sm bg-background rounded-t-3xl md:rounded-3xl shadow-2xl mx-0 md:mx-4 z-10"
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
        {!done ? (
          <div className="p-7">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary transition-colors"><X className="w-4 h-4 text-foreground/50" /></button>
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3"><Baby className="w-8 h-8 text-pink-400" /></div>
              <h2 className="font-display text-2xl font-medium mb-1">Gefeliciteerd! 🎉</h2>
              <p className="text-sm text-foreground/60 leading-relaxed">Er ligt een cadeautje voor jou klaar bij Studio Luna!</p>
            </div>
            <div className="bg-secondary rounded-2xl px-4 py-3 mb-4">
              <p className="text-sm font-semibold text-foreground mb-0.5 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400 shrink-0" /> Een cadeautje van Marjolein</p>
              <p className="text-sm text-foreground/60 leading-relaxed">Kom het ophalen wanneer je er klaar voor bent!</p>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">Berichtje (optioneel)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="bijv. naam baby, wanneer je langskomt…" rows={2}
                className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            <button onClick={() => setShareConsent(!shareConsent)}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-4 border-2 transition-all text-left ${shareConsent ? "border-primary/40 bg-primary/5" : "border-border/30 bg-secondary"}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${shareConsent ? "border-primary bg-primary" : "border-foreground/30"}`}>
                {shareConsent && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Deel met de community</p>
                <p className="text-xs text-foreground/55 mt-0.5">Studio Luna mag dit delen in de WhatsApp-groep.</p>
              </div>
            </button>
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2 mb-3">{error}</p>}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {loading ? "Bezig…" : "Stuur door 🎀"}
            </button>
          </div>
        ) : (
          <div className="p-7 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-3"><Baby className="w-8 h-8 text-pink-400" /></div>
            <h2 className="font-display text-2xl font-medium mb-2">Doorgegeven! 💕</h2>
            <p className="text-sm text-foreground/60 leading-relaxed mb-4">Je cadeautje ligt klaar bij Studio Luna.</p>
            {shareConsent && <div className="flex items-center gap-2 bg-secondary rounded-2xl px-4 py-3 mb-4 w-full"><Share2 className="w-4 h-4 text-primary shrink-0" /><p className="text-xs text-foreground/65">Jouw nieuws wordt gedeeld met de community 🎉</p></div>}
            <button onClick={onClose} className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">Sluiten</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function DueDateModal({ current, onSave, onClose }: { current?: string; onSave: (d: string) => void; onClose: () => void }) {
  const [date, setDate] = useState(current ?? "");
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-sm bg-background rounded-t-3xl md:rounded-3xl p-7 shadow-2xl z-10"
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary transition-colors"><X className="w-4 h-4 text-foreground/50" /></button>
        <h2 className="font-display text-xl font-medium mb-1">Uitgerekende datum</h2>
        <p className="text-sm text-foreground/60 mb-5">Jouw persoonlijke countdown in de Village.</p>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <button onClick={() => { if (date) { onSave(date); onClose(); } }}
          className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
          Opslaan
        </button>
      </motion.div>
    </div>
  );
}

function IntroModal({ current, onSave, onClose }: { current?: string; onSave: (intro: string) => void; onClose: () => void }) {
  const [intro, setIntro] = useState(current ?? "");
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-sm bg-background rounded-t-3xl md:rounded-3xl p-7 shadow-2xl z-10"
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary transition-colors"><X className="w-4 h-4 text-foreground/50" /></button>
        <h2 className="font-display text-xl font-medium mb-1">Stel jezelf voor</h2>
        <p className="text-sm text-foreground/60 mb-4">Vertel kort iets over jezelf, we leren je graag kennen.</p>
        <textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={4}
          placeholder="bijv. Ik ben Roos, 28 weken zwanger van mijn eerste kindje. Ik woon in Nieuwerkerk en doe yoga voor mijn rust…"
          className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm resize-none mb-5 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <button onClick={() => { if (intro.trim()) { onSave(intro.trim()); onClose(); } }}
          className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
          Opslaan
        </button>
      </motion.div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Village() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user?.isAdmin) navigate("/");
  }, [loading, user, navigate]);
  const [bevallenOpen, setBevallenOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [data, setData] = useState<VillageData | null>(null);
  const [journalAnswer, setJournalAnswer] = useState("");
  const [journalAnonymous, setJournalAnonymous] = useState(false);
  const [journalSubmitting, setJournalSubmitting] = useState(false);
  const [journalDone, setJournalDone] = useState(false);

  const isVillager = user && !user.isAdmin && user.credits > 0;

  const loadData = useCallback(async () => {
    if (!isVillager) return;
    try {
      const res = await authFetch("/village/data");
      if (res.ok) setData(await res.json());
    } catch {}
  }, [isVillager]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (data?.myAnswer) { setJournalDone(true); setJournalAnswer(data.myAnswer.text); setJournalAnonymous(data.myAnswer.anonymous); }
  }, [data]);

  const saveProfile = async (update: { dueDate?: string; intro?: string }) => {
    const res = await authFetch("/village/profile", { method: "PUT", body: JSON.stringify(update) });
    if (res.ok) setData((d) => d ? { ...d, profile: { ...d.profile, ...update } } : d);
  };

  const toggleChecklist = async (id: string) => {
    if (!data) return;
    const checked = data.profile.checkedItems.includes(id)
      ? data.profile.checkedItems.filter((x) => x !== id)
      : [...data.profile.checkedItems, id];
    setData({ ...data, profile: { ...data.profile, checkedItems: checked } });
    await authFetch("/village/checklist", { method: "POST", body: JSON.stringify({ checkedItems: checked }) });
  };

  const submitJournal = async () => {
    if (!data?.question || !journalAnswer.trim()) return;
    setJournalSubmitting(true);
    try {
      const res = await authFetch(`/village/journal/${data.question.id}/answer`, { method: "POST", body: JSON.stringify({ text: journalAnswer, anonymous: journalAnonymous }) });
      if (res.ok) setJournalDone(true);
    } catch {} finally { setJournalSubmitting(false); }
  };

  const countdown = data?.profile?.dueDate ? (() => {
    const due = parseISO(data.profile.dueDate!);
    const today = new Date();
    const days = differenceInDays(due, today);
    const weeks = differenceInWeeks(due, today);
    return { days, weeks, due, passed: days < 0 };
  })() : null;

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        <div className="px-6 md:px-12 lg:px-16 pt-14 md:pt-12 pb-12 bg-secondary md:rounded-3xl md:mx-6 md:mt-6 flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4"><Lock className="w-7 h-7 text-foreground/50" /></div>
              <h2 className="font-display text-xl font-medium mb-2">Alleen voor leden</h2>
              <p className="text-sm text-foreground/60 mb-6 leading-relaxed max-w-xs">
                {!user ? "Log in om te zien of je toegang hebt tot de Village." : "De Village wordt vrijgegeven zodra jij een pakket hebt."}
              </p>
              {!user && <button onClick={() => setLoginOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"><LogIn className="w-4 h-4" /> Inloggen</button>}
            </motion.div>
          ) : (
            <>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-foreground/60 leading-relaxed">
                Welkom in jouw eigen village, {user.name.split(" ")[0]} 
              </motion.p>

              {/* 1. COUNTDOWN */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
                className="rounded-3xl overflow-hidden border border-border/30"
                style={{ background: "linear-gradient(135deg, #f0f4f1 0%, #e8f0ea 100%)" }}>
                <div className="px-5 py-5">
                  {countdown ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1">Jouw countdown</p>
                        {countdown.passed ? (
                          <p className="font-display text-2xl font-medium text-foreground">Je bent er! </p>
                        ) : (
                          <>
                            <p className="font-display text-4xl font-medium text-foreground">{countdown.days} <span className="text-2xl">dagen</span></p>
                            <p className="text-sm text-foreground/60 mt-0.5">≈ {countdown.weeks} weken · uitgerekend {format(countdown.due, "d MMMM", { locale: nl })}</p>
                          </>
                        )}
                      </div>
                      <button onClick={() => setDueDateOpen(true)} className="p-2 rounded-xl hover:bg-white/50 transition-colors"><Pencil className="w-4 h-4 text-foreground/40" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDueDateOpen(true)} className="w-full flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Calendar className="w-5 h-5 text-primary" /></div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground text-sm">Stel je uitgerekende datum in</p>
                          <p className="text-xs text-foreground/55">Jouw persoonlijke countdown verschijnt hier</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-foreground/60 transition-colors" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* 2. INTRODUCTIE */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
                className="rounded-3xl bg-card border border-border/30 px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-base"></span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm mb-0.5">
                        {data?.profile?.intro ? "Jouw introductie" : "Stel jezelf voor aan Marjolein"}
                      </p>
                      {data?.profile?.intro ? (
                        <p className="text-sm text-foreground/65 leading-relaxed italic">"{data.profile.intro}"</p>
                      ) : (
                        <p className="text-xs text-foreground/50 leading-relaxed">Vertel kort wie je bent — Marjolein leest dit graag.</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setIntroOpen(true)} className="p-2 rounded-xl hover:bg-secondary transition-colors shrink-0">
                    <Pencil className="w-4 h-4 text-foreground/40" />
                  </button>
                </div>
              </motion.div>

              {/* 3. TIP VAN DE WEEK */}
              {data?.tip && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}
                  className="rounded-3xl border border-border/30 px-5 py-5"
                  style={{ background: "linear-gradient(135deg, #f5f0eb 0%, #ede5d8 100%)" }}>
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-3">Tip van de week</p>
                  <p className="text-2xl mb-2">{data.tip.emoji}</p>
                  <p className="text-sm text-foreground/75 leading-relaxed font-medium">{data.tip.text}</p>
                </motion.div>
              )}

              {/* 4. EVENEMENTEN */}
              {data?.events && data.events.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                  className="rounded-3xl bg-card border border-border/30 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"><Calendar className="w-4 h-4 text-primary" /></div>
                    <h2 className="font-display text-lg font-medium">Evenementen</h2>
                  </div>
                  <div className="space-y-3">
                    {data.events.map((ev) => (
                      <div key={ev.id} className="rounded-2xl bg-secondary px-4 py-3">
                        <p className="font-semibold text-foreground text-sm">{ev.title}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-foreground/55">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(ev.date), "EEEE d MMMM", { locale: nl })}</span>
                          {ev.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.time}</span>}
                          {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>}
                        </div>
                        {ev.description && <p className="text-xs text-foreground/55 mt-2 leading-relaxed">{ev.description}</p>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 5. JOURNAL VRAAG VAN DE WEEK */}
              {data?.question && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="rounded-3xl bg-card border border-border/30 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"><MessageCircle className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Journal</p>
                      <h2 className="font-display text-lg font-medium leading-tight">Vraag van de week</h2>
                    </div>
                  </div>
                  <p className="text-foreground/80 text-sm font-medium leading-relaxed mb-4 bg-secondary rounded-2xl px-4 py-3">
                    "{data.question.question}"
                  </p>
                  {journalDone ? (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3">
                      <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Jouw antwoord</p>
                      <p className="text-sm text-foreground/70 italic">"{journalAnswer}"</p>
                    </div>
                  ) : (
                    <>
                      <textarea value={journalAnswer} onChange={(e) => setJournalAnswer(e.target.value)}
                        rows={3} placeholder="Deel jouw gedachten…"
                        className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      <div className="flex items-center justify-between gap-3">
                        <button onClick={() => setJournalAnonymous(!journalAnonymous)}
                          className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${journalAnonymous ? "border-primary/40 bg-primary/5 text-primary" : "border-border/30 text-foreground/50"}`}>
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${journalAnonymous ? "border-primary bg-primary" : "border-foreground/30"}`} />
                          Anoniem
                        </button>
                        <button onClick={submitJournal} disabled={journalSubmitting || !journalAnswer.trim()}
                          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
                          {journalSubmitting ? "Bezig…" : "Stuur in"}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* 6. GEBOORTEKAARTJES WALL */}
              {data?.births && data.births.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                  className="rounded-3xl bg-card border border-border/30 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-2xl bg-pink-100 flex items-center justify-center shrink-0"><Baby className="w-4 h-4 text-pink-400" /></div>
                    <h2 className="font-display text-lg font-medium">Geboortekaartjes</h2>
                  </div>
                  <div className="space-y-3">
                    {data.births.map((b) => (
                      <div key={b.id} className="rounded-2xl px-4 py-3 border border-pink-100" style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 60%)" }}>
                        <p className="font-semibold text-foreground text-sm">{b.memberName} is bevallen! 🎉</p>
                        {b.note && <p className="text-xs text-foreground/60 mt-1 italic">"{b.note}"</p>}
                        <p className="text-xs text-foreground/35 mt-1">{format(parseISO(b.createdAt), "d MMMM", { locale: nl })}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 7. CHECKLIST */}
              {data?.checklistItems && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}
                  className="rounded-3xl bg-card border border-border/30 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-primary" /></div>
                      <h2 className="font-display text-lg font-medium">Bevallingsvoorbereiding</h2>
                    </div>
                    <span className="text-xs font-bold text-primary/70 bg-primary/10 px-3 py-1 rounded-full">
                      {data.profile.checkedItems.length}/{data.checklistItems.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {data.checklistItems.map((item) => {
                      const checked = data.profile.checkedItems.includes(item.id);
                      return (
                        <button key={item.id} onClick={() => toggleChecklist(item.id)}
                          className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all border ${checked ? "border-primary/20 bg-primary/5" : "border-border/20 bg-secondary hover:bg-border/20"}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "border-primary bg-primary" : "border-foreground/25"}`}>
                            {checked && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm ${checked ? "text-foreground/50 line-through" : "text-foreground/80"}`}>{item.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* 8. BEVALLEN */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                className="rounded-3xl overflow-hidden border border-pink-200/60"
                style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)" }}>
                <div className="px-5 py-5 flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><Baby className="w-6 h-6 text-pink-400" /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-0.5">Ik ben bevallen!</p>
                    <p className="text-sm text-foreground/60 leading-relaxed mb-4">Studio Luna heeft een persoonlijk cadeautje voor je. Als je leuk vind kan dit nieuws gedeeld worden in de community.</p>
                    <button onClick={() => setBevallenOpen(true)}
                      className="flex items-center gap-2 bg-white text-pink-500 border border-pink-200 px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-pink-50 transition-colors shadow-sm">
                      <Baby className="w-4 h-4" /> Meld het door
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 9. DOWNLOADS & VIDEO'S */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}
                className="rounded-3xl bg-secondary border border-border/30 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-primary" /></div>
                  <h2 className="font-display text-lg font-medium">Downloads & Video's</h2>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: FileText, title: "Geboorte-affirmaties", sub: "PDF · binnenkort beschikbaar" },
                    { icon: FileText, title: "Ademhalingsoefeningen voor thuis", sub: "PDF · binnenkort beschikbaar" },
                    { icon: Video, title: "3 min. ademhaling voor rust", sub: "Video · binnenkort beschikbaar" },
                    { icon: BookOpen, title: "Aanbevolen boeken & podcasts", sub: "Lijst · binnenkort beschikbaar" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3 flex items-center gap-3 opacity-50">
                      <item.icon className="w-4 h-4 text-foreground/30 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-foreground/50">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>

        <SeoFooter />
        <BottomNav />
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        {bevallenOpen && <BevallenModal onClose={() => { setBevallenOpen(false); loadData(); }} />}
        {dueDateOpen && <DueDateModal current={data?.profile?.dueDate} onSave={(d) => saveProfile({ dueDate: d })} onClose={() => setDueDateOpen(false)} />}
        {introOpen && <IntroModal current={data?.profile?.intro} onSave={(i) => saveProfile({ intro: i })} onClose={() => setIntroOpen(false)} />}
      </div>
    </div>
  );
}
