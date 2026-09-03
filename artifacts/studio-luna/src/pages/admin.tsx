import { useState, useEffect } from "react";
import { useAuth, getToken } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { BlogEditor } from "@/components/blog-editor";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, PlusCircle, MinusCircle, ChevronDown, ChevronUp, X,
  BookOpen, Users, ClipboardList, Check, CalendarDays, Baby, Share2,
  Sparkles, MessageCircle, MapPin, Clock, Mail, Palette, Tag, Receipt, Edit2, Save,
  Copy, BellRing, UserPlus, CheckCircle2, Circle, RefreshCw, FileText, Feather, Eye, EyeOff, ArrowLeft, Star, Banknote,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Member = { id: string; name: string; email: string; credits: number; notes: string; createdAt: string };
type StudioClass = { id: string; title: string; time: string; teacher: string; spotsTotal: number; description: string; type: string; dates: string[]; stripeBetaling?: boolean; stripeBedrag?: number };
type RRequest = { id: string; name: string; email: string; package: string; createdAt: string; done: boolean };
type LesType = { id: string; naam: string; kleur: string; proeflesGeldig: boolean; actief: boolean; intakeVereist: boolean; beschrijving?: string; locatie?: string; tijd?: string; boekingType?: "tarieven" | "vast_tarief"; vastTarief?: number };
type Rittenkaart = { id: string; naam: string; prijs: number; geldigheid: string; communityAccess: boolean; beschrijving?: string };
type SpeciaalPakket = { id: string; naam: string; prijs: number; beschrijving?: string; typeId?: string; proeflesGeldig: boolean; actief: boolean };
type TarievenData = { proeflesPrijs: number; losseLes: number; rittenkaarten: Rittenkaart[]; specials: SpeciaalPakket[]; betalingInfo: string };

const KLEUR_OPTIONS = [
  { id: "groen", label: "Salie groen", hex: "#8fa89b" },
  { id: "terra", label: "Terracotta", hex: "#c78d76" },
  { id: "roze", label: "Dusty roze", hex: "#d5b9b2" },
  { id: "beige", label: "Beige", hex: "#d9cfc4" },
  { id: "donkergroen", label: "Donker groen", hex: "#3a4f41" },
  { id: "lila", label: "Lila", hex: "#9b8ea8" },
  { id: "geel", label: "Goud", hex: "#d4b96a" },
  { id: "blauw", label: "Blauw", hex: "#7a9eb5" },
] as const;

function getKleurStyle(kleur: string): { bg: string; text: string } {
  const found = KLEUR_OPTIONS.find((k) => k.id === kleur);
  const hex = found?.hex ?? "#8fa89b";
  const dark = ["donkergroen"].includes(kleur);
  return { bg: hex, text: dark ? "#ffffff" : "#3a3a3a" };
}
type Announcement = { id: string; type: "bevallen"; memberId: string; memberName: string; shareConsent: boolean; note?: string; createdAt: string; seenByAdmin: boolean };

function apiFetch(path: string, opts?: RequestInit) {
  return fetch(`${BASE}/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts?.headers ?? {}) },
  });
}

// ─── LEDEN TAB ───────────────────────────────────────────────────────────────
type MemberBooking = { id: string; classId: string; className: string; date: string; time: string; type: string; isProefles: boolean; isLosseLes: boolean; bookedAt: string };

function LedenTab() {
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", credits: "0", notes: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creditDelta, setCreditDelta] = useState<Record<string, string>>({});
  const [memberBookings, setMemberBookings] = useState<Record<string, { loaded: boolean; list: MemberBooking[] }>>({});

  const loadMembers = async () => {
    const res = await apiFetch("/admin/members");
    if (res.ok) setMembers(await res.json());
  };

  useEffect(() => { loadMembers(); }, []);

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setFormLoading(true);
    try {
      const res = await apiFetch("/admin/members", {
        method: "POST",
        body: JSON.stringify({ ...form, credits: Number(form.credits) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembers((m) => [...m, data]);
      setForm({ name: "", email: "", password: "", credits: "0", notes: "" });
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const adjustCredits = async (id: string, delta: number) => {
    const res = await apiFetch(`/admin/members/${id}/credits`, { method: "POST", body: JSON.stringify({ delta }) });
    if (res.ok) {
      const { credits } = await res.json();
      setMembers((m) => m.map((mb) => mb.id === id ? { ...mb, credits } : mb));
    }
  };

  const removeMember = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit lid wilt verwijderen?")) return;
    await apiFetch(`/admin/members/${id}`, { method: "DELETE" });
    setMembers((m) => m.filter((mb) => mb.id !== id));
  };

  const loadMemberBookings = async (memberId: string) => {
    if (memberBookings[memberId]?.loaded) return;
    const res = await apiFetch(`/admin/members/${memberId}/bookings`);
    if (res.ok) {
      const list = await res.json();
      setMemberBookings((prev) => ({ ...prev, [memberId]: { loaded: true, list } }));
    }
  };

  const cancelMemberBooking = async (bookingId: string, memberId: string) => {
    if (!confirm("Boeking annuleren? Credits worden waar van toepassing teruggestort.")) return;
    const res = await apiFetch(`/admin/bookings/${bookingId}`, { method: "DELETE" });
    if (res.ok) {
      setMemberBookings((prev) => ({
        ...prev,
        [memberId]: { ...prev[memberId], list: prev[memberId].list.filter((b) => b.id !== bookingId) },
      }));
      loadMembers();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{members.length} {members.length === 1 ? "lid" : "leden"}</p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Annuleren" : "Nieuw lid"}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/30 rounded-3xl p-5">
          <h3 className="font-display text-lg font-medium mb-4">Nieuw lid</h3>
          <form onSubmit={addMember} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Naam</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Naam" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Credits</label>
                <input type="number" min="0" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })}
                  className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">E-mailadres</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@adres.nl" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Tijdelijk wachtwoord</label>
              <input required type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Geef door aan het lid" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Notities (optioneel)</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="bijv. 5-rittenkaart, betaald jan 2025" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            {formError && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-3 py-2">{formError}</p>}
            <button type="submit" disabled={formLoading}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60">
              {formLoading ? "Opslaan…" : "Lid aanmaken"}
            </button>
          </form>
        </motion.div>
      )}

      {members.length === 0 && !showForm && (
        <div className="bg-card/50 border border-dashed border-border rounded-3xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Nog geen leden.</p>
        </div>
      )}

      {members.map((member, i) => (
        <motion.div key={member.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          className="bg-card border border-border/30 rounded-3xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between cursor-pointer"
            onClick={() => { const newId = expandedId === member.id ? null : member.id; setExpandedId(newId); if (newId) loadMemberBookings(newId); }}>
            <div>
              <p className="font-semibold text-foreground text-sm">{member.name}</p>
              <p className="text-xs text-foreground/50">{member.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary font-bold text-sm px-3 py-1 rounded-full">{member.credits} credits</span>
              {expandedId === member.id ? <ChevronUp className="w-4 h-4 text-foreground/40" /> : <ChevronDown className="w-4 h-4 text-foreground/40" />}
            </div>
          </div>

          {expandedId === member.id && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              className="border-t border-border/20 px-5 py-4 space-y-4">
              {member.notes && <p className="text-xs text-foreground/55 italic">{member.notes}</p>}
              <div>
                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">Credits aanpassen</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="number" min="1" value={creditDelta[member.id] ?? "1"}
                    onChange={(e) => setCreditDelta({ ...creditDelta, [member.id]: e.target.value })}
                    className="w-20 bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={() => adjustCredits(member.id, Number(creditDelta[member.id] ?? 1))}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-xl font-semibold text-xs hover:bg-primary/20 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Toevoegen
                  </button>
                  <button onClick={() => adjustCredits(member.id, -Number(creditDelta[member.id] ?? 1))}
                    className="flex items-center gap-1.5 bg-secondary text-foreground/60 px-4 py-2 rounded-xl font-semibold text-xs hover:bg-border/30 transition-colors">
                    <MinusCircle className="w-4 h-4" /> Aftrekken
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">Geboekte lessen</p>
                {!memberBookings[member.id]?.loaded ? (
                  <p className="text-xs text-foreground/40">Laden…</p>
                ) : memberBookings[member.id].list.length === 0 ? (
                  <p className="text-xs text-foreground/40 italic">Geen actieve boekingen</p>
                ) : (
                  <div className="space-y-2">
                    {[...memberBookings[member.id].list].sort((a, b) => a.date.localeCompare(b.date)).map((b) => (
                      <div key={b.id} className="flex items-center justify-between bg-secondary rounded-xl px-3 py-2 gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{b.className}</p>
                          <p className="text-xs text-foreground/50">{b.date} · {b.time}{b.isProefles ? " · proefles" : b.isLosseLes ? " · los" : " · rittenkaart"}</p>
                        </div>
                        <button onClick={() => cancelMemberBooking(b.id, member.id)}
                          className="shrink-0 text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => removeMember(member.id)}
                className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-xs font-semibold transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Lid verwijderen
              </button>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── LESSEN TAB ───────────────────────────────────────────────────────────────
type ClassBookings = Record<string, Record<string, { count: number; bookings: (MemberBooking & { memberName: string; memberEmail: string })[] }>>;

function LessenTab() {
  const [classes, setClasses] = useState<StudioClass[]>([]);
  const [lesTypes, setLesTypes] = useState<LesType[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", time: "19:00", teacher: "Marjolein", spotsTotal: "8", description: "", type: "", newDate: "", stripeBetaling: false, stripeBedrag: "" });
  const [classDates, setClassDates] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [classBookings, setClassBookings] = useState<ClassBookings>({});
  const [editSpots, setEditSpots] = useState<Record<string, string>>({});

  const load = async () => {
    const [classesRes, bookingsRes, typesRes] = await Promise.all([
      apiFetch("/admin/classes"),
      apiFetch("/admin/classes/bookings"),
      apiFetch("/admin/class-types"),
    ]);
    if (classesRes.ok) setClasses(await classesRes.json());
    if (bookingsRes.ok) setClassBookings(await bookingsRes.json());
    if (typesRes.ok) {
      const types = await typesRes.json();
      setLesTypes(types);
      if (types.length > 0) setForm((f) => ({ ...f, type: f.type || types[0].id }));
    }
  };

  useEffect(() => { load(); }, []);

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setFormLoading(true);
    try {
      const res = await apiFetch("/admin/classes", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          spotsTotal: Number(form.spotsTotal),
          dates: classDates,
          stripeBetaling: form.stripeBetaling,
          stripeBedrag: form.stripeBetaling && form.stripeBedrag ? Number(form.stripeBedrag) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClasses((c) => [...c, data]);
      setForm({ title: "", time: "19:00", teacher: "Marjolein", spotsTotal: "8", description: "", type: lesTypes[0]?.id ?? "", newDate: "", stripeBetaling: false, stripeBedrag: "" });
      setClassDates([]);
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const addDate = () => {
    if (form.newDate && !classDates.includes(form.newDate)) {
      setClassDates((d) => [...d, form.newDate].sort());
      setForm({ ...form, newDate: "" });
    }
  };

  const addDateToClass = async (cls: StudioClass, date: string) => {
    if (!date || cls.dates.includes(date)) return;
    const newDates = [...cls.dates, date].sort();
    const res = await apiFetch(`/admin/classes/${cls.id}`, { method: "PATCH", body: JSON.stringify({ dates: newDates }) });
    if (res.ok) { const updated = await res.json(); setClasses((c) => c.map((x) => x.id === cls.id ? updated : x)); }
  };

  const removeDateFromClass = async (cls: StudioClass, date: string) => {
    const newDates = cls.dates.filter((d) => d !== date);
    const res = await apiFetch(`/admin/classes/${cls.id}`, { method: "PATCH", body: JSON.stringify({ dates: newDates }) });
    if (res.ok) { const updated = await res.json(); setClasses((c) => c.map((x) => x.id === cls.id ? updated : x)); }
  };

  const deleteClass = async (id: string) => {
    if (!confirm("Les verwijderen?")) return;
    await apiFetch(`/admin/classes/${id}`, { method: "DELETE" });
    setClasses((c) => c.filter((x) => x.id !== id));
  };

  const updateSpots = async (cls: StudioClass, newSpots: number) => {
    if (isNaN(newSpots) || newSpots < 1) return;
    const res = await apiFetch(`/admin/classes/${cls.id}`, { method: "PATCH", body: JSON.stringify({ spotsTotal: newSpots }) });
    if (res.ok) { const updated = await res.json(); setClasses((c) => c.map((x) => x.id === cls.id ? updated : x)); }
  };

  const cancelClassBooking = async (bookingId: string, classId: string, date: string, isReservering: boolean) => {
    if (!confirm("Boeking annuleren? Credits worden waar van toepassing teruggestort.")) return;
    const endpoint = isReservering ? `/admin/reserveringen/${bookingId}` : `/admin/bookings/${bookingId}`;
    const res = await apiFetch(endpoint, { method: "DELETE" });
    if (res.ok) {
      setClassBookings((prev) => {
        const updated = { ...prev };
        if (updated[classId]?.[date]) {
          updated[classId] = { ...updated[classId], [date]: {
            ...updated[classId][date],
            bookings: updated[classId][date].bookings.filter((b) => b.id !== bookingId),
            count: updated[classId][date].count - 1,
          }};
        }
        return updated;
      });
    }
  };

  const [editDateInputs, setEditDateInputs] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{classes.length} lessen</p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Annuleren" : "Nieuwe les"}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/30 rounded-3xl p-5">
          <h3 className="font-display text-lg font-medium mb-4">Nieuwe les</h3>
          <form onSubmit={createClass} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Naam</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="bijv. Zwangerschapsyoga" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Tijd</label>
                <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="19:00" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Plekken</label>
                <input type="number" min="1" value={form.spotsTotal} onChange={(e) => setForm({ ...form, spotsTotal: e.target.value })}
                  className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {lesTypes.map((t) => <option key={t.id} value={t.id}>{t.naam}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Omschrijving</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2} placeholder="Korte beschrijving van de les"
                className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Datums</label>
              <div className="flex gap-2 mb-2">
                <input type="date" value={form.newDate} onChange={(e) => setForm({ ...form, newDate: e.target.value })}
                  className="flex-1 bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button type="button" onClick={addDate}
                  className="px-4 py-2 bg-secondary border border-border/40 rounded-2xl text-sm font-semibold hover:bg-border/30 transition-colors">
                  + Datum
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {classDates.map((d) => (
                  <span key={d} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                    {d} <button type="button" onClick={() => setClassDates(classDates.filter((x) => x !== d))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="border border-border/30 rounded-2xl p-3 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.stripeBetaling} onChange={(e) => setForm({ ...form, stripeBetaling: e.target.checked })} className="w-4 h-4 rounded" />
                <span className="text-sm font-semibold text-foreground/70">Online betaling via Stripe</span>
              </label>
              {form.stripeBetaling && (
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Bedrag (€)</label>
                  <input type="number" min="0" step="0.01" value={form.stripeBedrag} onChange={(e) => setForm({ ...form, stripeBedrag: e.target.value })}
                    placeholder="bijv. 12.50"
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              )}
            </div>
            {formError && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-3 py-2">{formError}</p>}
            <button type="submit" disabled={formLoading}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60">
              {formLoading ? "Opslaan…" : "Les aanmaken"}
            </button>
          </form>
        </motion.div>
      )}

      {classes.length === 0 && !showForm && (
        <div className="bg-card/50 border border-dashed border-border rounded-3xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Nog geen lessen.</p>
        </div>
      )}

      {classes.map((cls, i) => (
        <motion.div key={cls.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          className="bg-card border border-border/30 rounded-3xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedId(expandedId === cls.id ? null : cls.id)}>
            <div>
              <p className="font-semibold text-foreground text-sm">{cls.title}</p>
              <p className="text-xs text-foreground/50">{cls.time} · {cls.dates.length} datums · {cls.spotsTotal} plekken</p>
            </div>
            <div className="flex items-center gap-3">
              {(() => {
                const lesType = lesTypes.find((t) => t.id === cls.type);
                const style = getKleurStyle(lesType?.kleur ?? "groen");
                return (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: style.bg + "33", color: style.bg }}>
                    {lesType?.naam ?? cls.type}
                  </span>
                );
              })()}
              {expandedId === cls.id ? <ChevronUp className="w-4 h-4 text-foreground/40" /> : <ChevronDown className="w-4 h-4 text-foreground/40" />}
            </div>
          </div>

          {expandedId === cls.id && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              className="border-t border-border/20 px-5 py-4 space-y-5">

              <ClassInfoEditor cls={cls} onUpdate={(updated) => setClasses((c) => c.map((x) => x.id === updated.id ? updated : x))} />

              <div>
                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">Aantal plekken</p>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" max="50"
                    value={editSpots[cls.id] ?? String(cls.spotsTotal)}
                    onChange={(e) => setEditSpots({ ...editSpots, [cls.id]: e.target.value })}
                    className="w-20 bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={() => { updateSpots(cls, Number(editSpots[cls.id] ?? cls.spotsTotal)); setEditSpots({ ...editSpots, [cls.id]: "" }); }}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition-colors">
                    Opslaan
                  </button>
                  <span className="text-xs text-foreground/40">(huidig: {cls.spotsTotal})</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">Deelnemers per datum</p>
                <div className="space-y-3">
                  {cls.dates.sort().map((d) => {
                    const dateInfo = classBookings[cls.id]?.[d];
                    const taken = dateInfo?.count ?? 0;
                    return (
                      <div key={d} className="bg-secondary rounded-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5 text-foreground/40" />
                            <span className="text-sm font-semibold text-foreground">{d}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${taken >= cls.spotsTotal ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"}`}>
                              {taken}/{cls.spotsTotal} geboekt
                            </span>
                            <button onClick={() => removeDateFromClass(cls, d)} className="text-foreground/30 hover:text-red-500 transition-colors ml-1">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {dateInfo && dateInfo.bookings.length > 0 && (
                          <div className="border-t border-border/20 px-4 py-2 space-y-1.5">
                            {dateInfo.bookings.map((b) => (
                              <div key={b.id} className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <span className="text-xs font-semibold text-foreground">{b.memberName}</span>
                                  <span className="text-xs text-foreground/40 ml-2">
                                    {b.isReservering
                                      ? (b.betaaldStripe ? "Stripe" : b.betaaldContant ? "contant" : "handmatig")
                                      : (b.isProefles ? "proefles" : b.isLosseLes ? "los" : "rittenkaart")}
                                  </span>
                                </div>
                                <button onClick={() => cancelClassBooking(b.id, cls.id, d, b.isReservering ?? false)}
                                  className="shrink-0 text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {taken === 0 && (
                          <div className="border-t border-border/20 px-4 py-2">
                            <p className="text-xs text-foreground/35 italic">Nog geen boekingen</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {cls.dates.length === 0 && <p className="text-xs text-foreground/40">Nog geen datums</p>}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">Datum toevoegen</p>
                <div className="flex gap-2">
                  <input type="date" value={editDateInputs[cls.id] ?? ""}
                    onChange={(e) => setEditDateInputs({ ...editDateInputs, [cls.id]: e.target.value })}
                    className="flex-1 bg-secondary border border-border/40 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={() => { addDateToClass(cls, editDateInputs[cls.id] ?? ""); setEditDateInputs({ ...editDateInputs, [cls.id]: "" }); }}
                    className="px-4 py-2 bg-secondary border border-border/40 rounded-2xl text-sm font-semibold hover:bg-border/30 transition-colors">
                    + Datum
                  </button>
                </div>
              </div>

              <StripeBetalingEditor cls={cls} onUpdate={(updated) => setClasses((c) => c.map((x) => x.id === updated.id ? updated : x))} />

              <button onClick={() => deleteClass(cls.id)}
                className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-xs font-semibold transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Les verwijderen
              </button>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function ClassInfoEditor({ cls, onUpdate }: { cls: StudioClass; onUpdate: (c: StudioClass) => void }) {
  const [title, setTitle] = useState(cls.title);
  const [time, setTime] = useState(cls.time);
  const [description, setDescription] = useState(cls.description ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await apiFetch(`/admin/classes/${cls.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, time, description }),
    });
    if (res.ok) { onUpdate(await res.json()); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  return (
    <div>
      <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">Lesgegevens</p>
      <div className="bg-secondary rounded-2xl p-3 space-y-3">
        <div>
          <label className="text-xs text-foreground/50 mb-1 block">Titel</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-background border border-border/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs text-foreground/50 mb-1 block">Tijd</label>
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="bijv. 19:00"
            className="w-full bg-background border border-border/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="text-xs text-foreground/50 mb-1 block">Korte beschrijving</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full bg-background border border-border/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        <button onClick={save} disabled={saving}
          className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-60">
          {saving ? "Opslaan…" : saved ? "✓ Opgeslagen" : "Opslaan"}
        </button>
      </div>
    </div>
  );
}

function StripeBetalingEditor({ cls, onUpdate }: { cls: StudioClass; onUpdate: (c: StudioClass) => void }) {
  const [stripeBetaling, setStripeBetaling] = useState(cls.stripeBetaling ?? false);
  const [stripeBedrag, setStripeBedrag] = useState(cls.stripeBedrag ? String(cls.stripeBedrag) : "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const body: any = { stripeBetaling };
    if (stripeBetaling && stripeBedrag) body.stripeBedrag = Number(stripeBedrag);
    else body.stripeBedrag = null;
    const res = await apiFetch(`/admin/classes/${cls.id}`, { method: "PATCH", body: JSON.stringify(body) });
    if (res.ok) onUpdate(await res.json());
    setSaving(false);
  };

  return (
    <div>
      <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">Online betaling (Stripe)</p>
      <div className="bg-secondary rounded-2xl p-3 space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={stripeBetaling} onChange={(e) => setStripeBetaling(e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm text-foreground/70">Online betaling verplicht voor deze les</span>
        </label>
        {stripeBetaling && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/60">€</span>
            <input type="number" min="0" step="0.01" value={stripeBedrag} onChange={(e) => setStripeBedrag(e.target.value)}
              placeholder="0.00"
              className="w-32 bg-background border border-border/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        )}
        <button onClick={save} disabled={saving}
          className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-60">
          {saving ? "Opslaan…" : "Opslaan"}
        </button>
      </div>
    </div>
  );
}

// ─── LESTYPES TAB ────────────────────────────────────────────────────────────
function LestypesTab() {
  const [types, setTypes] = useState<LesType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ naam: "", kleur: "groen", proeflesGeldig: true, intakeVereist: true, beschrijving: "", locatie: "", tijd: "", boekingType: "tarieven" as "tarieven" | "vast_tarief", vastTarief: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ naam: "", kleur: "groen", proeflesGeldig: true, actief: true, intakeVereist: true, beschrijving: "", locatie: "", tijd: "", boekingType: "tarieven" as "tarieven" | "vast_tarief", vastTarief: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    const res = await apiFetch("/admin/class-types");
    if (res.ok) setTypes(await res.json());
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const payload = { ...form, vastTarief: form.boekingType === "vast_tarief" && form.vastTarief ? Number(form.vastTarief) : undefined };
      const res = await apiFetch("/admin/class-types", { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTypes((t) => [...t, data]);
      setForm({ naam: "", kleur: "groen", proeflesGeldig: true, intakeVereist: true, beschrijving: "", locatie: "", tijd: "", boekingType: "tarieven", vastTarief: "" });
      setShowForm(false);
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  };

  const startEdit = (t: LesType) => {
    setEditId(t.id);
    setEditForm({ naam: t.naam, kleur: t.kleur, proeflesGeldig: t.proeflesGeldig, actief: t.actief, intakeVereist: t.intakeVereist ?? true, beschrijving: t.beschrijving ?? "", locatie: t.locatie ?? "", tijd: t.tijd ?? "", boekingType: t.boekingType ?? "tarieven", vastTarief: t.vastTarief ? String(t.vastTarief) : "" });
  };

  const saveEdit = async (id: string) => {
    const payload = { ...editForm, vastTarief: editForm.boekingType === "vast_tarief" && editForm.vastTarief ? Number(editForm.vastTarief) : undefined };
    const res = await apiFetch(`/admin/class-types/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    if (res.ok) { const updated = await res.json(); setTypes((t) => t.map((x) => x.id === id ? updated : x)); setEditId(null); }
  };

  const del = async (id: string) => {
    if (!confirm("Lestype verwijderen?")) return;
    await apiFetch(`/admin/class-types/${id}`, { method: "DELETE" });
    setTypes((t) => t.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{types.length} lestypes</p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Annuleren" : "Nieuw type"}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/30 rounded-3xl p-5">
          <h3 className="font-display text-lg font-medium mb-4">Nieuw lestype</h3>
          <form onSubmit={create} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Naam</label>
              <input required value={form.naam} onChange={(e) => setForm({ ...form, naam: e.target.value })}
                placeholder="bijv. Workshop" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Kleur</label>
              <div className="grid grid-cols-4 gap-2">
                {KLEUR_OPTIONS.map((k) => (
                  <button key={k.id} type="button" onClick={() => setForm({ ...form, kleur: k.id })}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all ${form.kleur === k.id ? "border-foreground/40" : "border-transparent"}`}>
                    <span className="w-7 h-7 rounded-full block" style={{ backgroundColor: k.hex }} />
                    <span className="text-xs text-foreground/60 leading-tight text-center">{k.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.proeflesGeldig} onChange={(e) => setForm({ ...form, proeflesGeldig: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm text-foreground/70">Proefles geldig voor dit type</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.intakeVereist} onChange={(e) => setForm({ ...form, intakeVereist: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm text-foreground/70">Intake vereist (tally-formulier tonen)</span>
            </label>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Beschrijving (voor Aanbod-pagina)</label>
              <textarea rows={4} value={form.beschrijving} onChange={(e) => setForm({ ...form, beschrijving: e.target.value })}
                placeholder="Uitgebreide omschrijving van dit aanbod…"
                className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Locatie</label>
              <input value={form.locatie} onChange={(e) => setForm({ ...form, locatie: e.target.value })}
                placeholder="bijv. Mamamo, Nieuwerkerk a/d IJssel"
                className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Tijdstip</label>
              <input value={form.tijd} onChange={(e) => setForm({ ...form, tijd: e.target.value })}
                placeholder="bijv. Elke vrijdag 10:00"
                className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">Boekingsflow</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm({ ...form, boekingType: "tarieven" })}
                  className={`flex-1 py-2.5 rounded-2xl border text-sm font-semibold transition-all ${form.boekingType === "tarieven" ? "bg-primary/10 border-primary/40 text-primary" : "border-border/30 text-foreground/50 hover:text-foreground"}`}>
                  Tarieven opties
                </button>
                <button type="button" onClick={() => setForm({ ...form, boekingType: "vast_tarief" })}
                  className={`flex-1 py-2.5 rounded-2xl border text-sm font-semibold transition-all ${form.boekingType === "vast_tarief" ? "bg-primary/10 border-primary/40 text-primary" : "border-border/30 text-foreground/50 hover:text-foreground"}`}>
                  Vast tarief
                </button>
              </div>
              {form.boekingType === "vast_tarief" && (
                <div className="mt-2">
                  <label className="text-xs text-foreground/50 mb-1 block">Prijs (bijv. 14.95)</label>
                  <input type="number" min="0" step="0.01" value={form.vastTarief} onChange={(e) => setForm({ ...form, vastTarief: e.target.value })}
                    placeholder="14.95" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              )}
            </div>
            {err && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-3 py-2">{err}</p>}
            <button type="submit" disabled={loading}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {loading ? "Opslaan…" : "Lestype aanmaken"}
            </button>
          </form>
        </motion.div>
      )}

      {types.map((t, i) => {
        const style = getKleurStyle(t.kleur);
        return (
          <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-card border border-border/30 rounded-3xl overflow-hidden">
            {editId === t.id ? (
              <div className="p-5 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Naam</label>
                  <input value={editForm.naam} onChange={(e) => setEditForm({ ...editForm, naam: e.target.value })}
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Kleur</label>
                  <div className="grid grid-cols-4 gap-2">
                    {KLEUR_OPTIONS.map((k) => (
                      <button key={k.id} type="button" onClick={() => setEditForm({ ...editForm, kleur: k.id })}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all ${editForm.kleur === k.id ? "border-foreground/40" : "border-transparent"}`}>
                        <span className="w-7 h-7 rounded-full block" style={{ backgroundColor: k.hex }} />
                        <span className="text-xs text-foreground/60 leading-tight text-center">{k.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.proeflesGeldig} onChange={(e) => setEditForm({ ...editForm, proeflesGeldig: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm text-foreground/70">Proefles geldig</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.actief} onChange={(e) => setEditForm({ ...editForm, actief: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm text-foreground/70">Actief (zichtbaar in rooster)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.intakeVereist} onChange={(e) => setEditForm({ ...editForm, intakeVereist: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm text-foreground/70">Intake vereist</span>
                  </label>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Beschrijving (voor Aanbod-pagina)</label>
                  <textarea rows={4} value={editForm.beschrijving} onChange={(e) => setEditForm({ ...editForm, beschrijving: e.target.value })}
                    placeholder="Uitgebreide omschrijving van dit aanbod…"
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Locatie</label>
                  <input value={editForm.locatie} onChange={(e) => setEditForm({ ...editForm, locatie: e.target.value })}
                    placeholder="bijv. Mamamo, Nieuwerkerk a/d IJssel"
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Tijdstip</label>
                  <input value={editForm.tijd} onChange={(e) => setEditForm({ ...editForm, tijd: e.target.value })}
                    placeholder="bijv. Elke vrijdag 10:00"
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">Boekingsflow</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditForm({ ...editForm, boekingType: "tarieven" })}
                      className={`flex-1 py-2.5 rounded-2xl border text-sm font-semibold transition-all ${editForm.boekingType === "tarieven" ? "bg-primary/10 border-primary/40 text-primary" : "border-border/30 text-foreground/50 hover:text-foreground"}`}>
                      Tarieven opties
                    </button>
                    <button type="button" onClick={() => setEditForm({ ...editForm, boekingType: "vast_tarief" })}
                      className={`flex-1 py-2.5 rounded-2xl border text-sm font-semibold transition-all ${editForm.boekingType === "vast_tarief" ? "bg-primary/10 border-primary/40 text-primary" : "border-border/30 text-foreground/50 hover:text-foreground"}`}>
                      Vast tarief
                    </button>
                  </div>
                  {editForm.boekingType === "vast_tarief" && (
                    <div className="mt-2">
                      <label className="text-xs text-foreground/50 mb-1 block">Prijs (bijv. 14.95)</label>
                      <input type="number" min="0" step="0.01" value={editForm.vastTarief} onChange={(e) => setEditForm({ ...editForm, vastTarief: e.target.value })}
                        placeholder="14.95" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => saveEdit(t.id)}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                    <Save className="w-3.5 h-3.5" /> Opslaan
                  </button>
                  <button onClick={() => setEditId(null)} className="px-4 py-2 rounded-xl text-sm text-foreground/50 hover:text-foreground transition-colors">Annuleren</button>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: style.bg }} />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.naam}</p>
                    <p className="text-xs text-foreground/45 mt-0.5">
                      {t.proeflesGeldig ? "Proefles geldig" : "Geen proefles"} · {t.actief ? "Actief" : "Inactief"} · {t.boekingType === "vast_tarief" ? `€ ${t.vastTarief?.toFixed(2).replace(".", ",")}` : "Tarieven opties"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(t)} className="p-2 text-foreground/40 hover:text-foreground/70 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => del(t.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── E-MAIL COMPOSE MODAL ────────────────────────────────────────────────────
function EmailComposeModal({ defaultTo, defaultToName, defaultSubject, defaultBody, onClose, onSent, reserveringId }: {
  defaultTo: string;
  defaultToName: string;
  defaultSubject: string;
  defaultBody: string;
  onClose: () => void;
  onSent?: () => void;
  reserveringId?: string;
}) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    setSending(true);
    setError("");
    try {
      const res = await apiFetch("/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, toName: defaultToName, subject, body, reserveringId }),
      });
      if (res.ok) {
        setSent(true);
        onSent?.();
        setTimeout(onClose, 3000);
      } else {
        const data = await res.json();
        setError(data.error ?? "Er ging iets mis bij het verzenden.");
      }
    } catch {
      setError("Kan geen verbinding maken. Probeer opnieuw.");
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4">
      <div className="bg-background rounded-t-3xl md:rounded-3xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-border/20 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-medium">E-mail samenstellen</h3>
            <p className="text-xs text-foreground/50 mt-0.5">Wordt verstuurd via Studio Luna</p>
          </div>
          <button onClick={onClose} className="p-2 text-foreground/40 hover:text-foreground transition-colors rounded-xl hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Aan</label>
            <input value={to} onChange={(e) => setTo(e.target.value)} type="email"
              className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Onderwerp</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Bericht</label>
            <p className="text-xs text-foreground/40 mb-1.5">Schrijf het bericht zoals je dat wilt. Dubbele enters worden nieuwe alinea's.</p>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10}
              className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y font-sans leading-relaxed" />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-2">{error}</p>}
          {sent && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-2xl px-4 py-2">✓ E-mail verstuurd!</p>}
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end border-t border-border/10 pt-4">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-foreground/60 hover:text-foreground transition-colors rounded-2xl hover:bg-secondary">
            Annuleren
          </button>
          <button onClick={send} disabled={sending || sent}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60">
            {sent ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            {sent ? "Verstuurd!" : sending ? "Verzenden…" : "Verzenden"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AANVRAGEN TAB ───────────────────────────────────────────────────────────
function AanvragenTab() {
  const [requests, setRequests] = useState<RRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<{ email: string; timestamp: string }[]>([]);

  const load = async () => {
    setLoading(true);
    const res = await apiFetch("/admin/requests");
    if (res.ok) setRequests(await res.json());
    const resI = await apiFetch("/admin/interests");
    if (resI.ok) setInterests(await resI.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markDone = async (id: string) => {
    const res = await apiFetch(`/admin/requests/${id}/done`, { method: "POST" });
    if (res.ok) setRequests((r) => r.map((x) => x.id === id ? { ...x, done: true } : x));
  };

  const deleteReq = async (id: string) => {
    await apiFetch(`/admin/requests/${id}`, { method: "DELETE" });
    setRequests((r) => r.filter((x) => x.id !== id));
  };

  const [composeFor, setComposeFor] = useState<{ id: string; name: string; email: string; subject: string; body: string } | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const pkgLabel = (pkg: string) => pkg === "5-rittenkaart" ? "5-rittenkaart (€ 105,-)" : pkg === "10-rittenkaart" ? "10-rittenkaart (€ 195,-)" : "Losse les (€ 22,50)";

  const openCompose = (req: RRequest) => {
    setComposeFor({
      id: req.id,
      name: req.name,
      email: req.email,
      subject: `Studio Luna — Jouw aanvraag ${pkgLabel(req.package)}`,
      body: `Bedankt voor je aanvraag voor een ${pkgLabel(req.package)}!\n\n\n\nMet warme groet,\nStudio Luna`,
    });
  };

  const open = requests.filter((r) => !r.done);
  const done = requests.filter((r) => r.done);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{open.length} openstaand · {done.length} afgehandeld</p>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className="bg-card/50 border border-dashed border-border rounded-3xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Geen aanvragen.</p>
        </div>
      )}

      {open.length > 0 && (
        <div>
          <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-2">Open</p>
          <div className="space-y-3">
            {open.map((req, i) => (
              <motion.div key={req.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card border border-border/30 rounded-3xl px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{req.name}</p>
                    <p className="text-xs text-foreground/50">{req.email}</p>
                    <span className="text-xs font-semibold bg-accent/15 text-foreground px-2.5 py-0.5 rounded-full mt-1.5 inline-block">{pkgLabel(req.package)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button onClick={() => openCompose(req)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${sentIds.has(req.id) ? "bg-green-50 text-green-600" : "bg-secondary text-foreground/70 hover:bg-border/30"}`}>
                      {sentIds.has(req.id) ? <Check className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                      {sentIds.has(req.id) ? "Verstuurd" : "Stuur e-mail"}
                    </button>
                    <button onClick={() => markDone(req.id)}
                      className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary/20 transition-colors">
                      <Check className="w-3.5 h-3.5" /> Afhandelen
                    </button>
                    <button onClick={() => deleteReq(req.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors">Verwijderen</button>
                  </div>
                </div>
                <p className="text-xs text-foreground/35 mt-2">{new Date(req.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-foreground/35 uppercase tracking-widest mb-2">Afgehandeld</p>
          <div className="space-y-2">
            {done.map((req) => (
              <div key={req.id} className="bg-card/60 border border-border/20 rounded-3xl px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground/60 text-sm">{req.name}</p>
                  <p className="text-xs text-foreground/35">{pkgLabel(req.package)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary/60 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Klaar
                  </span>
                  <button onClick={() => deleteReq(req.id)} className="text-xs text-foreground/30 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {interests.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-2">
            Interesse Mama Circle / Workshops ({interests.length})
          </p>
          <div className="bg-card border border-border/30 rounded-3xl overflow-hidden">
            {interests.map((item, i) => (
              <div key={i} className={`px-5 py-3 flex items-center justify-between gap-3 ${i > 0 ? "border-t border-border/20" : ""}`}>
                <p className="text-sm text-foreground/70">{item.email}</p>
                <p className="text-xs text-foreground/35 shrink-0">
                  {new Date(item.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {composeFor && (
        <EmailComposeModal
          defaultTo={composeFor.email}
          defaultToName={composeFor.name}
          defaultSubject={composeFor.subject}
          defaultBody={composeFor.body}
          onClose={() => setComposeFor(null)}
          onSent={() => setSentIds((prev) => new Set(prev).add(composeFor.id))}
        />
      )}
    </div>
  );
}

// ─── MEDEDELINGEN TAB ────────────────────────────────────────────────────────
function MededelingenTab() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await apiFetch("/admin/announcements");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markSeen = async (id: string) => {
    const res = await apiFetch(`/admin/announcements/${id}/seen`, { method: "POST" });
    if (res.ok) setItems((prev) => prev.map((a) => a.id === id ? { ...a, seenByAdmin: true } : a));
  };

  const del = async (id: string) => {
    await apiFetch(`/admin/announcements/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((a) => a.id !== id));
  };

  const unseen = items.filter((a) => !a.seenByAdmin);
  const seen = items.filter((a) => a.seenByAdmin);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{unseen.length} nieuw · {seen.length} afgehandeld</p>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-card/50 border border-dashed border-border rounded-3xl p-8 text-center">
          <Baby className="w-7 h-7 text-foreground/25 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nog geen bevallings-aankondigingen.</p>
        </div>
      )}

      {unseen.length > 0 && (
        <div>
          <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-2">Nieuw</p>
          <div className="space-y-3">
            {unseen.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-3xl overflow-hidden border border-pink-200/60"
                style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)" }}>
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                        <Baby className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{a.memberName} is bevallen! 🎉</p>
                        <p className="text-xs text-foreground/50 mt-0.5">
                          {new Date(a.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        {a.note && (
                          <p className="text-sm text-foreground/70 mt-2 italic leading-relaxed">"{a.note}"</p>
                        )}
                        <div className={`flex items-center gap-1.5 mt-2 text-xs font-semibold ${a.shareConsent ? "text-primary" : "text-foreground/40"}`}>
                          <Share2 className="w-3.5 h-3.5" />
                          {a.shareConsent ? "Toestemming gegeven om te delen in de WhatsApp-community" : "Niet delen met de community"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button onClick={() => markSeen(a.id)}
                        className="flex items-center gap-1.5 bg-white text-pink-500 border border-pink-200 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-pink-50 transition-colors shadow-sm">
                        <Check className="w-3.5 h-3.5" /> Gezien
                      </button>
                      <button onClick={() => del(a.id)} className="text-xs text-foreground/30 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {seen.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-foreground/35 uppercase tracking-widest mb-2">Afgehandeld</p>
          <div className="space-y-2">
            {seen.map((a) => (
              <div key={a.id} className="bg-card/60 border border-border/20 rounded-3xl px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Baby className="w-4 h-4 text-pink-300 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground/55 text-sm">{a.memberName}</p>
                    {a.shareConsent && <p className="text-xs text-foreground/35 flex items-center gap-1"><Share2 className="w-3 h-3" /> Gedeeld</p>}
                  </div>
                </div>
                <button onClick={() => del(a.id)} className="text-xs text-foreground/30 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EMAIL INSTELLINGEN TAB ───────────────────────────────────────────────────
type EmailSharedSettings = {
  emailOndertitel: string;
  persoonlijkBericht: string;
  annuleringsNote: string;
};

type LesTypeTemplate = { welkomst: string; herinnering: string; ondertitel: string; emailSubject: string; emailBody: string };

function EmailInstellingenTab() {
  const [shared, setShared] = useState<EmailSharedSettings>({
    emailOndertitel: "Zwangerschapsyoga · Nieuwerkerk a/d IJssel",
    persoonlijkBericht: "",
    annuleringsNote: "Kun je toch niet komen? Annuleer dan minimaal 7 uur voor de les via de website of via WhatsApp, zodat anderen jouw plek kunnen overnemen.",
  });
  const [lesTypeTemplates, setLesTypeTemplates] = useState<Record<string, LesTypeTemplate>>({});
  const [adminLesTypes, setAdminLesTypes] = useState<{ id: string; naam: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("gedeeld");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/admin/email-settings").then((r) => r.ok ? r.json() : {}),
      fetch(`${BASE}/api/class-types`).then((r) => r.ok ? r.json() : []),
    ]).then(([settings, types]) => {
      setShared({
        emailOndertitel: settings.emailOndertitel ?? "Zwangerschapsyoga · Nieuwerkerk a/d IJssel",
        persoonlijkBericht: settings.persoonlijkBericht ?? "",
        annuleringsNote: settings.annuleringsNote ?? "Kun je toch niet komen? Annuleer dan minimaal 7 uur voor de les via de website of via WhatsApp, zodat anderen jouw plek kunnen overnemen.",
      });
      const savedTemplates: Record<string, LesTypeTemplate> = settings.lesTypeTemplates ?? {};
      const typesArr = Array.isArray(types) ? types : [];
      setAdminLesTypes(typesArr.map((t: any) => ({ id: t.id, naam: t.naam })));
      const merged: Record<string, LesTypeTemplate> = {};
      for (const t of typesArr) {
        merged[t.id] = {
          welkomst: savedTemplates[t.id]?.welkomst ?? (t.id === "circle"
            ? "Je plekje in de Circle is gereserveerd! We kijken ernaar uit je te verwelkomen in de kring. 🌙"
            : "Je plekje is gereserveerd! We kijken er naar uit je te zien op de mat. 🌙"),
          herinnering: savedTemplates[t.id]?.herinnering ?? (t.id === "circle"
            ? "Dit is een vriendelijke herinnering dat je morgen bij ons in de Circle verwacht wordt! We kijken er naar uit. 🌙"
            : "Dit is een vriendelijke herinnering dat je morgen bij ons verwacht wordt op de mat! We kijken er naar uit. 🌙"),
          ondertitel: (savedTemplates[t.id] as any)?.ondertitel ?? "",
          emailSubject: (savedTemplates[t.id] as any)?.emailSubject ?? "",
          emailBody: (savedTemplates[t.id] as any)?.emailBody ?? "",
        };
      }
      setLesTypeTemplates(merged);
      if (typesArr.length > 0) setActiveSection(typesArr[0].id);
      setLoaded(true);
    });
  }, []);

  const setTemplate = (typeId: string, field: "welkomst" | "herinnering" | "ondertitel" | "emailSubject" | "emailBody", value: string) => {
    setLesTypeTemplates((prev) => ({ ...prev, [typeId]: { ...prev[typeId], [field]: value } }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      const payload = { ...shared, lesTypeTemplates };
      const res = await apiFetch("/admin/email-settings", { method: "PUT", body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const allSections = [
    ...adminLesTypes.map((t) => ({ key: t.id, label: t.naam })),
    { key: "gedeeld", label: "Gedeeld" },
  ];

  const activeLesType = adminLesTypes.find((t) => t.id === activeSection);

  return (
    <form onSubmit={save} className="space-y-5 max-w-xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">E-mail teksten</p>
        <p className="text-sm text-foreground/60">Stel per lestype de teksten in voor bevestigings- en herinneringsmails.</p>
      </div>

      <div className="flex flex-wrap gap-1.5 bg-secondary rounded-2xl p-1">
        {allSections.map((s) => (
          <button key={s.key} type="button" onClick={() => setActiveSection(s.key)}
            className={`flex-1 min-w-fit py-2 px-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeSection === s.key ? "bg-card shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {activeLesType && lesTypeTemplates[activeLesType.id] && (
        <div className="space-y-4">
          <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
            <h3 className="font-display text-base font-medium">{activeLesType.naam} — E-mail koptekst</h3>
            <p className="text-xs text-foreground/45">Staat onder "Studio Luna" in de kop van bevestigings- en herinneringsmails voor dit lestype. Laat leeg om de algemene ondertitel te gebruiken.</p>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Ondertitel</label>
              <input
                type="text"
                value={lesTypeTemplates[activeLesType.id].ondertitel}
                onChange={(e) => setTemplate(activeLesType.id, "ondertitel", e.target.value)}
                className="w-full bg-background border border-border/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Bijv. Mama Circle · Nieuwerkerk a/d IJssel"
              />
            </div>
          </div>
          <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
            <h3 className="font-display text-base font-medium">{activeLesType.naam} — Bevestigingsmail</h3>
            <p className="text-xs text-foreground/45">Vul hier de volledige bevestigingsmail in. Wordt automatisch ingevuld als je op het mail-icoontje klikt bij een reservering. Gebruik tokens: <span className="font-mono bg-secondary px-1 rounded">{"{naam}"}</span> <span className="font-mono bg-secondary px-1 rounded">{"{les}"}</span> <span className="font-mono bg-secondary px-1 rounded">{"{datum}"}</span> <span className="font-mono bg-secondary px-1 rounded">{"{tijd}"}</span></p>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Onderwerp</label>
              <input
                type="text"
                value={lesTypeTemplates[activeLesType.id].emailSubject}
                onChange={(e) => setTemplate(activeLesType.id, "emailSubject", e.target.value)}
                className="w-full bg-background border border-border/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={`Bevestiging jouw plek — {les}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Berichttekst</label>
              <textarea
                value={lesTypeTemplates[activeLesType.id].emailBody}
                onChange={(e) => setTemplate(activeLesType.id, "emailBody", e.target.value)}
                rows={8}
                className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed font-sans"
                placeholder={`Bedankt voor je aanmelding! Jouw plek is bevestigd voor:\n\n{les}\n{datum} · {tijd} uur\nNieuwerkerk aan den IJssel\n\n\nMet warme groet,\nStudio Luna`}
              />
            </div>
          </div>
          <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
            <h3 className="font-display text-base font-medium">{activeLesType.naam} — Automatische bevestiging <span className="text-xs font-sans font-normal text-foreground/40">(via rooster)</span></h3>
            <p className="text-xs text-foreground/45">Tekst direct na "Lieve [naam]," in de <em>automatische</em> bevestigingsmail bij aanmelden via het rooster.</p>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Welkomsttekst</label>
              <textarea
                value={lesTypeTemplates[activeLesType.id].welkomst}
                onChange={(e) => setTemplate(activeLesType.id, "welkomst", e.target.value)}
                rows={5}
                className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed"
              />
            </div>
          </div>
          <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
            <h3 className="font-display text-base font-medium">{activeLesType.naam} — Herinnering</h3>
            <p className="text-xs text-foreground/45">Tekst in de herinneringsmail (verstuurd de dag voor de les).</p>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Herinneringstekst</label>
              <textarea
                value={lesTypeTemplates[activeLesType.id].herinnering}
                onChange={(e) => setTemplate(activeLesType.id, "herinnering", e.target.value)}
                rows={5}
                className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {activeSection === "gedeeld" && (
        <div className="space-y-4">
          <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
            <h3 className="font-display text-base font-medium">Annuleringsregel</h3>
            <p className="text-xs text-foreground/45">Geldt voor alle lestypes.</p>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Annuleringstekst</label>
              <textarea value={shared.annuleringsNote}
                onChange={(e) => setShared({ ...shared, annuleringsNote: e.target.value })}
                rows={3} placeholder="Kun je toch niet komen? Annuleer dan minimaal 7 uur van tevoren…"
                className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed" />
            </div>
          </div>
          <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
            <h3 className="font-display text-base font-medium">Persoonlijk bericht <span className="text-foreground/40 font-normal text-sm">(optioneel)</span></h3>
            <p className="text-xs text-foreground/45">Verschijnt cursief onderaan de bevestigingsmail bij alle lestypes.</p>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Extra bericht</label>
              <textarea value={shared.persoonlijkBericht}
                onChange={(e) => setShared({ ...shared, persoonlijkBericht: e.target.value })}
                rows={3} placeholder="Bijv: Draag comfortabele kleding en neem een flesje water mee!"
                className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed" />
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{error}</p>}

      <button type="submit" disabled={saving}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors">
        <Mail className="w-4 h-4" />
        {saving ? "Opslaan…" : saved ? "✓ Opgeslagen!" : "Wijzigingen opslaan"}
      </button>
    </form>
  );
}

// ─── TARIEVEN TAB ────────────────────────────────────────────────────────────
function TarievenTab() {
  const [data, setData] = useState<TarievenData | null>(null);
  const [lesTypes, setLesTypes] = useState<LesType[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Basisprijs form
  const [basis, setBasis] = useState({ proeflesPrijs: "10", losseLes: "22.50", betalingInfo: "" });

  // Rittenkaart forms
  const [showRkForm, setShowRkForm] = useState(false);
  const [rkForm, setRkForm] = useState({ naam: "", prijs: "", geldigheid: "", communityAccess: false, beschrijving: "" });
  const [editRkId, setEditRkId] = useState<string | null>(null);
  const [editRkForm, setEditRkForm] = useState({ naam: "", prijs: "", geldigheid: "", communityAccess: false, beschrijving: "" });

  // Special forms
  const [showSpForm, setShowSpForm] = useState(false);
  const [spForm, setSpForm] = useState({ naam: "", prijs: "", beschrijving: "", typeId: "", proeflesGeldig: false, actief: true });
  const [editSpId, setEditSpId] = useState<string | null>(null);
  const [editSpForm, setEditSpForm] = useState({ naam: "", prijs: "", beschrijving: "", typeId: "", proeflesGeldig: false, actief: true });
  const [volgordeSaving, setVolgordeSaving] = useState(false);

  const computeVolgorde = (d: TarievenData): string[] => {
    if (d.volgorde && d.volgorde.length > 0) {
      const known = new Set([
        "proefles", "losseles",
        ...d.rittenkaarten.map((r) => "rit-" + r.id),
        ...d.specials.map((s) => "special-" + s.id),
      ]);
      const filtered = d.volgorde.filter((k) => known.has(k));
      const missing = [...known].filter((k) => !d.volgorde!.includes(k));
      return [...filtered, ...missing];
    }
    return ["proefles", "losseles", ...d.rittenkaarten.map((r) => "rit-" + r.id), ...d.specials.map((s) => "special-" + s.id)];
  };

  const getVolgordeLabel = (key: string): string => {
    if (key === "proefles") return "Proefles";
    if (key === "losseles") return "Losse les";
    if (key.startsWith("rit-")) return data?.rittenkaarten.find((r) => r.id === key.slice(4))?.naam ?? key;
    if (key.startsWith("special-")) return data?.specials.find((s) => s.id === key.slice(8))?.naam ?? key;
    return key;
  };

  const saveVolgorde = async (v: string[]) => {
    setVolgordeSaving(true);
    const res = await apiFetch("/admin/tarieven/volgorde", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volgorde: v }),
    });
    if (res.ok) setData(await res.json());
    setVolgordeSaving(false);
  };

  const moveVolgorde = async (index: number, direction: "up" | "down") => {
    if (!data) return;
    const v = [...computeVolgorde(data)];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= v.length) return;
    [v[index], v[swapIdx]] = [v[swapIdx], v[index]];
    await saveVolgorde(v);
  };

  const load = async () => {
    const [tarRes, typesRes] = await Promise.all([apiFetch("/admin/tarieven"), apiFetch("/admin/class-types")]);
    if (tarRes.ok) {
      const d: TarievenData = await tarRes.json();
      setData(d);
      setBasis({ proeflesPrijs: String(d.proeflesPrijs), losseLes: String(d.losseLes), betalingInfo: d.betalingInfo });
    }
    if (typesRes.ok) setLesTypes(await typesRes.json());
  };
  useEffect(() => { load(); }, []);

  const saveBasis = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaved(false);
    const res = await apiFetch("/admin/tarieven", { method: "PUT", body: JSON.stringify({ proeflesPrijs: Number(basis.proeflesPrijs), losseLes: Number(basis.losseLes), betalingInfo: basis.betalingInfo }) });
    if (res.ok) { setData(await res.json()); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  const addRk = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch("/admin/tarieven/rittenkaarten", { method: "POST", body: JSON.stringify({ ...rkForm, prijs: Number(rkForm.prijs) }) });
    if (res.ok) { setData(await res.json()); setRkForm({ naam: "", prijs: "", geldigheid: "", communityAccess: false, beschrijving: "" }); setShowRkForm(false); }
  };

  const saveRk = async (id: string) => {
    const res = await apiFetch(`/admin/tarieven/rittenkaarten/${id}`, { method: "PATCH", body: JSON.stringify({ ...editRkForm, prijs: Number(editRkForm.prijs) }) });
    if (res.ok) { setData(await res.json()); setEditRkId(null); }
  };

  const deleteRk = async (id: string) => {
    if (!confirm("Rittenkaart verwijderen?")) return;
    const res = await apiFetch(`/admin/tarieven/rittenkaarten/${id}`, { method: "DELETE" });
    if (res.ok) setData(await res.json());
  };

  const addSp = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch("/admin/tarieven/specials", { method: "POST", body: JSON.stringify({ ...spForm, prijs: Number(spForm.prijs), typeId: spForm.typeId || undefined }) });
    if (res.ok) { setData(await res.json()); setSpForm({ naam: "", prijs: "", beschrijving: "", typeId: "", proeflesGeldig: false, actief: true }); setShowSpForm(false); }
  };

  const saveSp = async (id: string) => {
    const res = await apiFetch(`/admin/tarieven/specials/${id}`, { method: "PATCH", body: JSON.stringify({ ...editSpForm, prijs: Number(editSpForm.prijs), typeId: editSpForm.typeId || undefined }) });
    if (res.ok) { setData(await res.json()); setEditSpId(null); }
  };

  const deleteSp = async (id: string) => {
    if (!confirm("Speciaal pakket verwijderen?")) return;
    const res = await apiFetch(`/admin/tarieven/specials/${id}`, { method: "DELETE" });
    if (res.ok) setData(await res.json());
  };

  const fmtPrijs = (p: number) => `€ ${p % 1 === 0 ? p + ",-" : p.toFixed(2).replace(".", ",")}`;

  if (!data) return <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">

      {/* BASISTARIEVEN */}
      <div className="bg-card border border-border/30 rounded-3xl p-5">
        <h3 className="font-display text-lg font-medium mb-4">Basistarieven</h3>
        <form onSubmit={saveBasis} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Proefles (€)</label>
              <input type="number" step="0.01" min="0" value={basis.proeflesPrijs} onChange={(e) => setBasis({ ...basis, proeflesPrijs: e.target.value })}
                className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Losse les (€)</label>
              <input type="number" step="0.01" min="0" value={basis.losseLes} onChange={(e) => setBasis({ ...basis, losseLes: e.target.value })}
                className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Betaalinformatie</label>
            <input value={basis.betalingInfo} onChange={(e) => setBasis({ ...basis, betalingInfo: e.target.value })}
              placeholder="Betalen kan contant of via Tikkie"
              className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors">
            <Save className="w-3.5 h-3.5" />
            {saving ? "Opslaan…" : saved ? "✓ Opgeslagen!" : "Basistarieven opslaan"}
          </button>
        </form>
      </div>

      {/* RITTENKAARTEN */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-medium">Rittenkaarten</h3>
          <button onClick={() => setShowRkForm(!showRkForm)}
            className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-primary/20 transition-colors">
            {showRkForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showRkForm ? "Annuleren" : "Toevoegen"}
          </button>
        </div>

        {showRkForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/30 rounded-3xl p-4 mb-3">
            <form onSubmit={addRk} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Naam</label>
                  <input required value={rkForm.naam} onChange={(e) => setRkForm({ ...rkForm, naam: e.target.value })} placeholder="bijv. 5-rittenkaart"
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Prijs (€)</label>
                  <input required type="number" step="0.01" min="0" value={rkForm.prijs} onChange={(e) => setRkForm({ ...rkForm, prijs: e.target.value })}
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Geldigheid</label>
                  <input value={rkForm.geldigheid} onChange={(e) => setRkForm({ ...rkForm, geldigheid: e.target.value })} placeholder="bijv. 2 maanden"
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-5">
                  <input type="checkbox" checked={rkForm.communityAccess} onChange={(e) => setRkForm({ ...rkForm, communityAccess: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-sm text-foreground/70">Community toegang</span>
                </label>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Extra omschrijving</label>
                <input value={rkForm.beschrijving} onChange={(e) => setRkForm({ ...rkForm, beschrijving: e.target.value })} placeholder="Optionele toelichting"
                  className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <button type="submit" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                Rittenkaart aanmaken
              </button>
            </form>
          </motion.div>
        )}

        <div className="space-y-2">
          {data.rittenkaarten.map((rk) => (
            <div key={rk.id} className="bg-card border border-border/30 rounded-3xl overflow-hidden">
              {editRkId === rk.id ? (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Naam</label>
                      <input value={editRkForm.naam} onChange={(e) => setEditRkForm({ ...editRkForm, naam: e.target.value })}
                        className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Prijs (€)</label>
                      <input type="number" step="0.01" min="0" value={editRkForm.prijs} onChange={(e) => setEditRkForm({ ...editRkForm, prijs: e.target.value })}
                        className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Geldigheid</label>
                      <input value={editRkForm.geldigheid} onChange={(e) => setEditRkForm({ ...editRkForm, geldigheid: e.target.value })}
                        className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-5">
                      <input type="checkbox" checked={editRkForm.communityAccess} onChange={(e) => setEditRkForm({ ...editRkForm, communityAccess: e.target.checked })} className="w-4 h-4 rounded" />
                      <span className="text-sm text-foreground/70">Community</span>
                    </label>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Omschrijving</label>
                    <input value={editRkForm.beschrijving} onChange={(e) => setEditRkForm({ ...editRkForm, beschrijving: e.target.value })}
                      className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveRk(rk.id)} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                      <Save className="w-3.5 h-3.5" /> Opslaan
                    </button>
                    <button onClick={() => setEditRkId(null)} className="px-4 py-2 rounded-xl text-sm text-foreground/50 hover:text-foreground transition-colors">Annuleren</button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{rk.naam}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">
                      {fmtPrijs(rk.prijs)}{rk.geldigheid ? ` · ${rk.geldigheid}` : ""}{rk.communityAccess ? " · incl. community" : ""}
                    </p>
                    {rk.beschrijving && <p className="text-xs text-foreground/40 mt-0.5">{rk.beschrijving}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => { setEditRkId(rk.id); setEditRkForm({ naam: rk.naam, prijs: String(rk.prijs), geldigheid: rk.geldigheid, communityAccess: rk.communityAccess, beschrijving: rk.beschrijving ?? "" }); }}
                      className="p-2 text-foreground/40 hover:text-foreground/70 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteRk(rk.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SPECIALE PAKKETTEN */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-medium">Speciale pakketten</h3>
          <button onClick={() => setShowSpForm(!showSpForm)}
            className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-2xl text-sm font-semibold hover:bg-primary/20 transition-colors">
            {showSpForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showSpForm ? "Annuleren" : "Toevoegen"}
          </button>
        </div>

        {showSpForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/30 rounded-3xl p-4 mb-3">
            <form onSubmit={addSp} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Naam</label>
                  <input required value={spForm.naam} onChange={(e) => setSpForm({ ...spForm, naam: e.target.value })} placeholder="bijv. 3 Zwanger Circles"
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Prijs (€)</label>
                  <input required type="number" step="0.01" min="0" value={spForm.prijs} onChange={(e) => setSpForm({ ...spForm, prijs: e.target.value })}
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Voor type (optioneel)</label>
                  <select value={spForm.typeId} onChange={(e) => setSpForm({ ...spForm, typeId: e.target.value })}
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Alle types</option>
                    {lesTypes.map((t) => <option key={t.id} value={t.id}>{t.naam}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer pt-4">
                    <input type="checkbox" checked={spForm.proeflesGeldig} onChange={(e) => setSpForm({ ...spForm, proeflesGeldig: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm text-foreground/70">Proefles geldig</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Omschrijving</label>
                <input value={spForm.beschrijving} onChange={(e) => setSpForm({ ...spForm, beschrijving: e.target.value })} placeholder="Bijv. openingsaanbieding"
                  className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <button type="submit" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                Pakket aanmaken
              </button>
            </form>
          </motion.div>
        )}

        <div className="space-y-2">
          {data.specials.map((sp) => {
            const lesType = lesTypes.find((t) => t.id === sp.typeId);
            return (
              <div key={sp.id} className="bg-card border border-border/30 rounded-3xl overflow-hidden">
                {editSpId === sp.id ? (
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Naam</label>
                        <input value={editSpForm.naam} onChange={(e) => setEditSpForm({ ...editSpForm, naam: e.target.value })}
                          className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Prijs (€)</label>
                        <input type="number" step="0.01" min="0" value={editSpForm.prijs} onChange={(e) => setEditSpForm({ ...editSpForm, prijs: e.target.value })}
                          className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Type</label>
                        <select value={editSpForm.typeId} onChange={(e) => setEditSpForm({ ...editSpForm, typeId: e.target.value })}
                          className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="">Alle types</option>
                          {lesTypes.map((t) => <option key={t.id} value={t.id}>{t.naam}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer pt-4">
                          <input type="checkbox" checked={editSpForm.proeflesGeldig} onChange={(e) => setEditSpForm({ ...editSpForm, proeflesGeldig: e.target.checked })} className="w-4 h-4 rounded" />
                          <span className="text-sm text-foreground/70">Proefles geldig</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Omschrijving</label>
                      <input value={editSpForm.beschrijving} onChange={(e) => setEditSpForm({ ...editSpForm, beschrijving: e.target.value })}
                        className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editSpForm.actief} onChange={(e) => setEditSpForm({ ...editSpForm, actief: e.target.checked })} className="w-4 h-4 rounded" />
                      <span className="text-sm text-foreground/70">Actief (zichtbaar op tarieven-pagina)</span>
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => saveSp(sp.id)} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                        <Save className="w-3.5 h-3.5" /> Opslaan
                      </button>
                      <button onClick={() => setEditSpId(null)} className="px-4 py-2 rounded-xl text-sm text-foreground/50 hover:text-foreground transition-colors">Annuleren</button>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">{sp.naam}</p>
                        {!sp.actief && <span className="text-xs bg-foreground/10 text-foreground/40 px-2 py-0.5 rounded-full">Inactief</span>}
                      </div>
                      <p className="text-xs text-foreground/50 mt-0.5">
                        {fmtPrijs(sp.prijs)}{lesType ? ` · alleen voor ${lesType.naam}` : ""}{sp.proeflesGeldig ? "" : " · geen proefles"}
                      </p>
                      {sp.beschrijving && <p className="text-xs text-foreground/40 mt-0.5">{sp.beschrijving}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => { setEditSpId(sp.id); setEditSpForm({ naam: sp.naam, prijs: String(sp.prijs), beschrijving: sp.beschrijving ?? "", typeId: sp.typeId ?? "", proeflesGeldig: sp.proeflesGeldig, actief: sp.actief }); }}
                        className="p-2 text-foreground/40 hover:text-foreground/70 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteSp(sp.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {data.specials.length === 0 && (
            <div className="bg-card/50 border border-dashed border-border rounded-3xl p-6 text-center">
              <p className="text-sm text-muted-foreground">Nog geen speciale pakketten. Voeg er een toe hierboven.</p>
            </div>
          )}
        </div>
      </div>

      {/* VOLGORDE */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-medium">Volgorde op tarieven-pagina</h3>
          {volgordeSaving && <span className="text-xs text-foreground/40 animate-pulse">Opslaan…</span>}
        </div>
        <p className="text-xs text-foreground/50 mb-3">Gebruik de pijltjes om de blokken te schuiven. De volgorde is direct zichtbaar op de tarieven-pagina.</p>
        <div className="space-y-2">
          {computeVolgorde(data).map((key, index, arr) => (
            <div key={key} className="bg-card border border-border/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground/25 w-5 text-right shrink-0">{index + 1}</span>
                <p className="text-sm font-medium text-foreground">{getVolgordeLabel(key)}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button disabled={index === 0 || volgordeSaving} onClick={() => moveVolgorde(index, "up")}
                  className="p-2 rounded-xl text-foreground/40 hover:text-foreground/70 hover:bg-secondary transition-colors disabled:opacity-25">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button disabled={index === arr.length - 1 || volgordeSaving} onClick={() => moveVolgorde(index, "down")}
                  className="p-2 rounded-xl text-foreground/40 hover:text-foreground/70 hover:bg-secondary transition-colors disabled:opacity-25">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── RESERVERINGEN TAB ───────────────────────────────────────────────────────
type Reservering = {
  id: string; name: string; email: string; classId: string;
  classTitle: string; dateStr: string; time: string; type: string;
  aanwezig?: boolean; mailVerstuurd?: boolean; betaaldContant?: boolean; betaaldStripe?: boolean; createdAt: string;
};

function ReserveeringenTab() {
  const [items, setItems] = useState<Reservering[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<StudioClass[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string; email: string; credits: number }[]>([]);
  const [showInboeken, setShowInboeken] = useState(false);
  const [inboekForm, setInboekForm] = useState({ memberId: "", name: "", email: "", classId: "", dateStr: "", heelReeks: false, gebruikCredit: false });
  const [composeFor, setComposeFor] = useState<{ id: string; name: string; email: string; subject: string; body: string } | null>(null);
  const [emailTemplates, setEmailTemplates] = useState<Record<string, { emailSubject: string; emailBody: string }>>({});
  const [inboekLoading, setInboekLoading] = useState(false);
  const [inboekError, setInboekError] = useState("");
  const [inboekVolWaarschuwing, setInboekVolWaarschuwing] = useState(false);
  const [reminderState, setReminderState] = useState<Record<string, "idle" | "sending" | "done">>({});
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [res, clsRes, settingsRes, membersRes] = await Promise.all([
      apiFetch("/admin/reserveringen"),
      apiFetch("/classes"),
      apiFetch("/admin/email-settings"),
      apiFetch("/admin/members"),
    ]);
    if (res.ok) setItems(await res.json());
    if (clsRes.ok) setClasses(await clsRes.json());
    if (membersRes.ok) setMembers(await membersRes.json());
    if (settingsRes.ok) {
      const s = await settingsRes.json();
      const tpl: Record<string, { emailSubject: string; emailBody: string }> = {};
      const lesTypeTemplates = s.lesTypeTemplates ?? {};
      for (const [typeId, t] of Object.entries(lesTypeTemplates as Record<string, any>)) {
        tpl[typeId] = {
          emailSubject: t.emailSubject ?? "",
          emailBody: t.emailBody ?? "",
        };
      }
      setEmailTemplates(tpl);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await apiFetch(`/admin/reserveringen/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleAanwezig = async (id: string) => {
    const res = await apiFetch(`/admin/reserveringen/${id}/aanwezig`, { method: "PATCH" });
    if (res.ok) {
      const updated: Reservering = await res.json();
      setItems((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  };

  const sendHerinnering = async (key: string, classTitle: string, dateStr: string, time: string, type: string) => {
    setReminderState((prev) => ({ ...prev, [key]: "sending" }));
    const res = await apiFetch("/admin/reserveringen/herinnering", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classTitle, dateStr, time, type }),
    });
    if (res.ok) {
      const data = await res.json();
      setReminderState((prev) => ({ ...prev, [key]: "done" }));
      setTimeout(() => setReminderState((prev) => ({ ...prev, [key]: "idle" })), 3000);
      alert(`Herinnering verstuurd naar ${data.sent} deelnemer${data.sent !== 1 ? "s" : ""}!`);
    }
  };

  const copyEmails = (group: Reservering[], key: string) => {
    const emails = group.map((r) => r.email).join(", ");
    navigator.clipboard.writeText(emails);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const openCompose = (r: Reservering) => {
    const [y, m, d] = r.dateStr.split("-").map(Number);
    const dateLabel = new Date(y, m - 1, d).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
    const tokens = (s: string) => s
      .replace(/\{naam\}/gi, r.name)
      .replace(/\{les\}/gi, r.classTitle)
      .replace(/\{datum\}/gi, dateLabel)
      .replace(/\{tijd\}/gi, r.time);
    const tpl = emailTemplates[r.type];
    const fallbackSubject = `Bevestiging jouw plek — ${r.classTitle}`;
    const fallbackBody = `Bedankt voor je aanmelding! Jouw plek is bevestigd voor:\n\n${r.classTitle}\n${dateLabel} · ${r.time} uur\nNieuwerkerk aan den IJssel\n\n\n\nMet warme groet,\nStudio Luna`;
    setComposeFor({
      id: r.id,
      name: r.name,
      email: r.email,
      subject: tpl?.emailSubject ? tokens(tpl.emailSubject) : fallbackSubject,
      body: tpl?.emailBody ? tokens(tpl.emailBody) : fallbackBody,
    });
  };

  const doInboeken = async (forceOverCapacity = false) => {
    const cls = classes.find((c) => c.id === inboekForm.classId);
    if (!cls) return;
    setInboekLoading(true);
    setInboekError("");

    const datesToBook = inboekForm.heelReeks
      ? [...cls.dates].sort()
      : [inboekForm.dateStr];

    const newItems: Reservering[] = [];
    let hasError = false;
    let isVol = false;

    for (const dateStr of datesToBook) {
      const res = await apiFetch("/admin/reserveringen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inboekForm.name,
          email: inboekForm.email,
          classId: cls.id,
          classTitle: cls.title,
          dateStr,
          time: cls.time,
          type: cls.type,
          forceOverCapacity,
          memberId: inboekForm.memberId || undefined,
          gebruikCredit: inboekForm.gebruikCredit,
        }),
      });
      if (res.ok) {
        const r: Reservering = await res.json();
        newItems.push(r);
      } else {
        const data = await res.json();
        if (res.status === 409 && data.error === "Vol") {
          isVol = true;
        } else {
          hasError = true;
          setInboekError(data.error ?? "Er ging iets mis");
        }
        break;
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }
    if (isVol) {
      setInboekVolWaarschuwing(true);
    } else if (!hasError) {
      setInboekForm({ memberId: "", name: "", email: "", classId: "", dateStr: "", heelReeks: false, gebruikCredit: false });
      setShowInboeken(false);
      load(); // refresh members zodat credits direct bijgewerkt zijn
      setInboekVolWaarschuwing(false);
    }
    setInboekLoading(false);
  };

  const submitInboeken = async (e: React.FormEvent) => {
    e.preventDefault();
    setInboekVolWaarschuwing(false);
    await doInboeken(false);
  };

  const grouped = items.reduce<Record<string, Reservering[]>>((acc, r) => {
    const key = r.dateStr + "||" + r.classTitle;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const sortedKeys = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  const selectedClass = classes.find((c) => c.id === inboekForm.classId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">{items.length} reservering{items.length !== 1 ? "en" : ""} totaal</p>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 text-foreground/40 hover:text-foreground/60 transition-colors rounded-xl hover:bg-secondary">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowInboeken(!showInboeken)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
            {showInboeken ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {showInboeken ? "Sluiten" : "Inboeken"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showInboeken && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-card border border-border/30 rounded-3xl p-5">
            <h3 className="font-display text-lg font-medium mb-4">Iemand inboeken</h3>
            <form onSubmit={submitInboeken} className="space-y-3">
              {/* Lid kiezen of handmatig invullen */}
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Lid</label>
                <select
                  value={inboekForm.memberId}
                  onChange={(e) => {
                    const m = members.find((x) => x.id === e.target.value);
                    setInboekForm({ ...inboekForm, memberId: e.target.value, name: m?.name ?? "", email: m?.email ?? "", gebruikCredit: false });
                  }}
                  className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">— Extern (geen lid) —</option>
                  {[...members].sort((a, b) => a.name.localeCompare(b.name)).map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.credits} credit{m.credits !== 1 ? "s" : ""})</option>
                  ))}
                </select>
              </div>
              {/* Credits aftrekken optie */}
              {inboekForm.memberId && (() => {
                const m = members.find((x) => x.id === inboekForm.memberId);
                return m ? (
                  <label className={`flex items-center gap-2.5 cursor-pointer rounded-2xl px-4 py-3 border ${m.credits > 0 ? "bg-primary/5 border-primary/20" : "bg-secondary border-border/30 opacity-60"}`}>
                    <input
                      type="checkbox"
                      checked={inboekForm.gebruikCredit}
                      disabled={m.credits <= 0}
                      onChange={(e) => setInboekForm({ ...inboekForm, gebruikCredit: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-foreground/80">
                      Trek 1 credit af <span className="text-foreground/50">({m.credits} beschikbaar)</span>
                    </span>
                  </label>
                ) : null;
              })()}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Naam</label>
                  <input required value={inboekForm.name} onChange={(e) => setInboekForm({ ...inboekForm, name: e.target.value })}
                    placeholder="Naam deelnemer" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">E-mail</label>
                  <input required type="email" value={inboekForm.email} onChange={(e) => setInboekForm({ ...inboekForm, email: e.target.value })}
                    placeholder="email@adres.nl" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Les</label>
                <select required value={inboekForm.classId} onChange={(e) => setInboekForm({ ...inboekForm, classId: e.target.value, dateStr: "" })}
                  className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Kies een les…</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.time})</option>)}
                </select>
              </div>
              {selectedClass && selectedClass.dates.length > 1 && (
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={inboekForm.heelReeks}
                    onChange={(e) => setInboekForm({ ...inboekForm, heelReeks: e.target.checked, dateStr: "" })}
                    className="rounded" />
                  <span className="text-sm text-foreground/70">
                    Inboeken voor de hele reeks ({selectedClass.dates.length} lessen)
                  </span>
                </label>
              )}
              {selectedClass && !inboekForm.heelReeks && (
                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Datum</label>
                  <select required value={inboekForm.dateStr} onChange={(e) => setInboekForm({ ...inboekForm, dateStr: e.target.value })}
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Kies een datum…</option>
                    {[...selectedClass.dates].sort().map((d) => {
                      const [y, m, day] = d.split("-").map(Number);
                      const label = new Date(y, m - 1, day).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "long" });
                      return <option key={d} value={d}>{label}</option>;
                    })}
                  </select>
                </div>
              )}
              {selectedClass && inboekForm.heelReeks && (
                <div className="bg-primary/5 rounded-2xl px-4 py-2.5 text-xs text-foreground/60 space-y-0.5">
                  {[...selectedClass.dates].sort().map((d) => {
                    const [y, m, day] = d.split("-").map(Number);
                    return <p key={d}>{new Date(y, m - 1, day).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "long" })}</p>;
                  })}
                </div>
              )}
              <p className="text-xs text-foreground/50 bg-secondary rounded-2xl px-4 py-2.5">
                Bevestigingsmail stuur je zelf vanuit de reserveringenlijst.
              </p>
              {inboekError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{inboekError}</p>
              )}
              {inboekVolWaarschuwing && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 space-y-2">
                  <p className="text-sm font-semibold text-orange-700">⚠️ Deze les is vol</p>
                  <p className="text-xs text-orange-600">Je kunt toch inboeken (als extra deelnemer buiten de capaciteit).</p>
                  <button type="button" onClick={() => doInboeken(true)} disabled={inboekLoading}
                    className="bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-orange-700 transition-colors disabled:opacity-60">
                    {inboekLoading ? "Inboeken…" : "Toch inboeken"}
                  </button>
                </div>
              )}
              {!inboekVolWaarschuwing && (
                <button type="submit" disabled={inboekLoading}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {inboekLoading ? "Inboeken…" : "Inboeken"}
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-card/50 border border-dashed border-border rounded-3xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Nog geen reserveringen.</p>
        </div>
      )}

      {sortedKeys.map((key) => {
        const [dateStr, classTitle] = key.split("||");
        const group = grouped[key];
        const [year, month, day] = dateStr.split("-").map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dateLabel = dateObj.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
        const time = group[0]?.time ?? "";
        const type = group[0]?.type ?? "";
        const classId = group[0]?.classId ?? "";
        const aanwezig = group.filter((r) => r.aanwezig).length;
        const rState = reminderState[key] ?? "idle";
        const cls = classes.find((c) => c.id === classId);
        const spotsTotal = cls?.spotsTotal ?? null;
        const isFull = spotsTotal !== null && group.length >= spotsTotal;
        return (
          <div key={key} className="bg-card border border-border/30 rounded-3xl overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-border/20">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-foreground text-sm capitalize">{dateLabel} · {time}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    {classTitle} —{" "}
                    <span className={isFull ? "text-red-500 font-semibold" : "text-foreground/50"}>
                      {group.length}{spotsTotal !== null ? `/${spotsTotal}` : ""} plek{group.length !== 1 ? "ken" : ""}
                      {isFull ? " (vol)" : ""}
                    </span>
                  </p>
                </div>
                {aanwezig > 0 && (
                  <span className="shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {aanwezig}/{group.length} aanwezig
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => copyEmails(group, key)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary hover:bg-border/30 transition-colors text-foreground/60">
                  {copied === key ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === key ? "Gekopieerd!" : "Kopieer e-mails"}
                </button>
                <button onClick={() => sendHerinnering(key, classTitle, dateStr, time, type)} disabled={rState === "sending"}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary hover:bg-border/30 transition-colors text-foreground/60 disabled:opacity-60">
                  {rState === "done" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <BellRing className="w-3.5 h-3.5" />}
                  {rState === "sending" ? "Versturen…" : rState === "done" ? "Verstuurd!" : "Herinnering sturen"}
                </button>
              </div>
            </div>
            <div className="divide-y divide-border/20">
              {group.map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-foreground/50">{r.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {r.betaaldStripe && (
                      <span title="Betaald via Stripe" className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">Stripe</span>
                    )}
                    {!r.betaaldStripe && r.betaaldContant === false && (
                      <button
                        onClick={async () => {
                          await apiFetch(`/admin/reserveringen/${r.id}/betaald-contant`, { method: "PATCH" });
                          setItems((prev) => prev.map((x) => x.id === r.id ? { ...x, betaaldContant: true } : x));
                        }}
                        title="Contant betaald — klik om af te vinken"
                        className="p-1.5 rounded-xl text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        <Banknote className="w-4 h-4" />
                      </button>
                    )}
                    {!r.betaaldStripe && r.betaaldContant === true && (
                      <span title="Contant betaald" className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold">Contant ✓</span>
                    )}
                    <button onClick={() => openCompose(r)}
                      title={r.mailVerstuurd ? "Mail verstuurd — klik om opnieuw te openen" : "Bevestigingsmail sturen"}
                      className={`p-1.5 rounded-xl transition-colors ${r.mailVerstuurd ? "text-green-600 bg-green-50" : "text-foreground/40 hover:text-primary hover:bg-primary/10"}`}>
                      {r.mailVerstuurd ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </button>
                    <button onClick={() => toggleAanwezig(r.id)}
                      title={r.aanwezig ? "Aanwezig — klik om te wisselen" : "Afwezig — klik om te markeren"}
                      className={`p-1.5 rounded-xl transition-colors ${r.aanwezig ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-foreground/30 hover:text-primary hover:bg-primary/10"}`}>
                      {r.aanwezig ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => remove(r.id)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {composeFor && (
        <EmailComposeModal
          defaultTo={composeFor.email}
          defaultToName={composeFor.name}
          defaultSubject={composeFor.subject}
          defaultBody={composeFor.body}
          reserveringId={composeFor.id}
          onClose={() => setComposeFor(null)}
          onSent={() => setItems((prev) => prev.map((r) => r.id === composeFor.id ? { ...r, mailVerstuurd: true } : r))}
        />
      )}
    </div>
  );
}

// ─── INHOUD TAB ──────────────────────────────────────────────────────────────
type PaginaTeksten = {
  home_hero: string; home_missie_tekst: string; home_missie_bullets: string;
  aanbod_yoga_tekst1: string; aanbod_yoga_tekst2: string;
  aanbod_yoga_tijd: string; aanbod_yoga_locatie: string; aanbod_yoga_extra: string;
  aanbod_circle_titel: string; aanbod_circle_tekst: string;
  tarieven_ondertitel: string;
  tarieven_aanvraag_tekst: string;
  over_mij_naam: string; over_mij_functie: string;
  over_mij_quote: string; over_mij_tekst: string; over_mij_foto: string;
  foto_hero: string; foto_yoga: string; foto_circle: string;
  foto_hero_positie: string;
  foto_yoga_hoogte: string; foto_yoga_positie: string;
  foto_circle_hoogte: string; foto_circle_positie: string;
  home_missie_heading: string; home_village_tagline: string;
  home_aanbod_heading: string; home_aanbod_items: string;
  home_locatie_naam: string; home_locatie_adres: string;
  home_contact_email: string; home_contact_telefoon: string; home_contact_instagram: string;
  aanbod_yoga_heading: string;
  aanbod_specials_heading: string; aanbod_specials_items: string;
  aanbod_specials_bundel: string; aanbod_verzekering_tekst: string;
  cta_url: string; cta_label: string;
};

const DEFAULT_PT: PaginaTeksten = {
  home_hero: "It takes a village.\nStudio Luna is jouw mama tribe.",
  home_missie_tekst: "Het moederschap hoef je niet alleen te doen. De missie van Studio Luna is het faciliteren van een community voor alle vrouwen in Nieuwerkerk aan den IJssel en omgeving, van zwangerschap tot ver daarna. Een veilige haven om fysiek op te laden, mentaal tot rust te komen en bovenal in verbinding te staan met andere moeders in dezelfde fase.",
  home_missie_bullets: "Een plek om te landen.\nEen plek om fysiek sterk, gezond en in balans te blijven.\nEen plek om vertrouwen te vinden in je veranderende lichaam.\nEen plek om te connecten met andere moeders.\nStudio Luna is jouw mama tribe.",
  aanbod_yoga_tekst1: "Sterk, ontspannen en vol vertrouwen richting je bevalling. Met zachte houdingen houden we je veranderende lichaam in balans. We oefenen met ademhaling en maken contact met je baby.",
  aanbod_yoga_tekst2: "Elke les heeft een net andere focus, zoals het bekken, de kracht van je adem of ruimte in je rug. De lessen vormen samen de Geboortereeks, waarin je in een vaste groep naar je bevalling toewerkt.",
  aanbod_yoga_tijd: "Elke dinsdag 19:00",
  aanbod_yoga_locatie: "Waldorfhaus de Perenboom · Raadhuisplein 28, Nieuwerkerk aan den IJssel",
  aanbod_yoga_extra: "Na afloop: verse thee en tijd voor verbinding",
  aanbod_circle_titel: "Zwanger & Mama Circle",
  aanbod_circle_tekst: "Bij Studio Luna geloven we in de kracht van de 'village'. Naast de fysieke lessen creëren we een veilige cirkel waarin je ervaringen deelt, vragen stelt en naar elkaar omkijkt. We gebruiken zachte yoga- en ademhalingsoefeningen om samen te vertragen, zodat er ruimte ontstaat om echt te luisteren naar jezelf en elkaar. Echte verbinding met andere zwangeren en mama's in Zuidplas!",
  tarieven_ondertitel: "Gun jezelf dit wekelijkse rustmoment tijdens je zwangerschap.",
  tarieven_aanvraag_tekst: "Studio Luna voegt zo snel mogelijk je credits toe aan je account. De betaling vindt in de studio plaats bij je eerstvolgende les.",
  over_mij_naam: "Jouw naam",
  over_mij_functie: "Zwangerschapsyoga docente & oprichter Studio Luna",
  over_mij_quote: "Ik geloof dat elke vrouw kracht in zich draagt — soms moet je die alleen even leren voelen.",
  over_mij_tekst: "",
  over_mij_foto: "",
  foto_hero: "",
  foto_yoga: "",
  foto_circle: "",
  foto_hero_positie: "center",
  foto_yoga_hoogte: "normaal",
  foto_yoga_positie: "center",
  foto_circle_hoogte: "hoog",
  foto_circle_positie: "center",
  home_missie_heading: "Een plek om\nte landen.",
  home_village_tagline: "Welkom in jouw village.",
  home_aanbod_heading: "Alles wat je nodig hebt\nop weg naar de bevalling.",
  home_aanbod_items: "Kleine groepen, veel aandacht en persoonlijk contact.\nZwangerschapsyoga: bevalling voorbereiden, kracht van de adem en fysieke balans.\nNa afloop altijd tijd voor een kopje thee en verbinding.\nEen vaste groep die samen naar de bevalling toewerkt.\nWhatsApp-community voor vragen en tips tussen lessen door.\nAandacht voor zowel het fysieke als het mentale aspect van moederschap.",
  home_locatie_naam: "Waldorfhaus de Perenboom",
  home_locatie_adres: "Raadhuisplein 28\n2914 KM Nieuwerkerk aan den IJssel",
  home_contact_email: "info@studiolunazuidplas.nl",
  home_contact_telefoon: "+31 6 43 73 53 43",
  home_contact_instagram: "@studiolunazuidplas",
  aanbod_yoga_heading: "Sterk en vol\nvertrouwen richting\nje bevalling.",
  aanbod_specials_heading: "Bevallings Specials",
  aanbod_specials_items: "Bevallings Yoga Workshop | Focus & Vertrouwen · 120 min | € 49,-\nPartner Workshop | Verbinding & Support · 120 min | € 79,-\nMama Spa | Ultiem ontspannen · 120 min | € 49,-",
  aanbod_specials_bundel: "De Geboorte-Bundel | Alle drie workshops · meest complete voorbereiding | bespaar € 22,- | € 155,-",
  aanbod_verzekering_tekst: "Veel verzekeraars vergoeden (een deel van) geboortevoorbereiding vanuit de aanvullende verzekering.",
  cta_url: "/geboortereeks",
  cta_label: "Bekijk de Geboortereeks",
};

// Verkleint een gekozen foto in de browser voordat hij naar de database gaat.
// Zonder dit kwamen foto's op volle grootte (megabytes) in de opslag terecht
// en werd elke pagina traag; de blog-uploads deden dit al, deze velden nog niet.
function verkleinFoto(file: File, maxBreedte: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const schaal = Math.min(1, maxBreedte / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * schaal);
      canvas.height = Math.round(img.height * schaal);
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas niet beschikbaar")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Foto kon niet gelezen worden")); };
    img.src = url;
  });
}

function InhoudTab() {
  const [teksten, setTeksten] = useState<PaginaTeksten>(DEFAULT_PT);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/admin/pagina-teksten").then(async (r) => {
      if (r.ok) { const d = await r.json(); setTeksten((prev) => ({ ...prev, ...d })); }
    }).catch(() => {});
  }, []);

  const saveSection = async (section: string, fields: Partial<PaginaTeksten>) => {
    setSaving(section); setSaved(null); setSaveError(null);
    try {
      const res = await apiFetch("/admin/pagina-teksten", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        const d = await res.json();
        setTeksten((prev) => ({ ...prev, ...d }));
        setSaved(section);
        setTimeout(() => setSaved(null), 2500);
      } else {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.error || `Fout bij opslaan (${res.status})`);
        setTimeout(() => setSaveError(null), 4000);
      }
    } catch (e: any) {
      setSaveError("Verbindingsfout — probeer opnieuw.");
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setSaving(null);
    }
  };

  const field = (label: string, key: keyof PaginaTeksten, multiline = false, hint?: string) => (
    <div>
      <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">{label}</label>
      {hint && <p className="text-xs text-foreground/40 mb-1.5">{hint}</p>}
      {multiline ? (
        <textarea rows={4} value={teksten[key]} onChange={(e) => setTeksten({ ...teksten, [key]: e.target.value })}
          className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed" />
      ) : (
        <input value={teksten[key]} onChange={(e) => setTeksten({ ...teksten, [key]: e.target.value })}
          className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      )}
    </div>
  );

  const saveBtn = (section: string, fields: Partial<PaginaTeksten>) => (
    <button onClick={() => saveSection(section, fields)} disabled={saving === section}
      className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors">
      <Save className="w-3.5 h-3.5" />
      {saving === section ? "Opslaan…" : saved === section ? "✓ Opgeslagen!" : "Opslaan"}
    </button>
  );

  return (
    <div className="space-y-6">
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">
          {saveError}
        </div>
      )}
      {/* CTA-KNOP INSTELLINGEN */}
      <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
        <div>
          <h3 className="font-display text-lg font-medium">Reserveerknop</h3>
          <p className="text-xs text-foreground/50 mt-1">De grote actieknop bovenaan de startpagina en onderaan elke pagina.</p>
        </div>
        {field("Knoptekst", "cta_label", false, "Bijv. 'Bekijk de Geboortereeks' of 'Meld je aan'")}
        <div>
          <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Bestemming (URL)</label>
          <p className="text-xs text-foreground/40 mb-1.5">Vul een interne pagina in (/geboortereeks, /aanbod, /geboortezorg-zuidplas) of een externe URL (https://…)</p>
          <input value={teksten.cta_url} onChange={(e) => setTeksten({ ...teksten, cta_url: e.target.value })}
            placeholder="/geboortereeks"
            className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="flex flex-wrap gap-2 mt-2">
            {["/geboortereeks", "/aanbod", "/geboortezorg-zuidplas"].map(url => (
              <button key={url} type="button" onClick={() => setTeksten({ ...teksten, cta_url: url })}
                className={`text-xs px-3 py-1 rounded-xl border transition-colors ${teksten.cta_url === url ? "bg-primary text-white border-primary" : "border-border/40 text-foreground/60 hover:border-primary/50"}`}>
                {url}
              </button>
            ))}
          </div>
        </div>
        {saveBtn("cta", { cta_url: teksten.cta_url, cta_label: teksten.cta_label })}
      </div>

      {/* STUDIO LUNA PAGINA — HERO */}
      <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
        <h3 className="font-display text-lg font-medium">Studio Luna pagina — Hero</h3>
        {field("Hero tekst (grote koptekst)", "home_hero", true, "Gebruik een nieuwe regel voor een regeleinde.")}
        {saveBtn("home_hero", { home_hero: teksten.home_hero })}
      </div>

      {/* STUDIO LUNA PAGINA — MISSIE */}
      <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
        <h3 className="font-display text-lg font-medium">Studio Luna pagina — Missie</h3>
        {field("Missie koptekst", "home_missie_heading", true, "De grote kop boven de bullets. Gebruik een nieuwe regel voor een regeleinde.")}
        {field("Missie bullets", "home_missie_bullets", true, "Eén bullet per regel.")}
        {field("Missie alinea (rechterkolom)", "home_missie_tekst", true)}
        {field("Afsluitende tagline", "home_village_tagline", false, "Kleine zin onderaan de missie-sectie, bijv. 'Welkom in jouw village.'")}
        {saveBtn("home_missie", {
          home_missie_heading: teksten.home_missie_heading,
          home_missie_bullets: teksten.home_missie_bullets,
          home_missie_tekst: teksten.home_missie_tekst,
          home_village_tagline: teksten.home_village_tagline,
        })}
      </div>

      {/* STUDIO LUNA PAGINA — WAT WE BIEDEN */}
      <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
        <h3 className="font-display text-lg font-medium">Studio Luna pagina — Wat we bieden</h3>
        {field("Koptekst", "home_aanbod_heading", true, "Gebruik een nieuwe regel voor een regeleinde.")}
        {field("Items (genummerde lijst)", "home_aanbod_items", true, "Eén item per regel. Worden automatisch genummerd.")}
        {saveBtn("home_aanbod", { home_aanbod_heading: teksten.home_aanbod_heading, home_aanbod_items: teksten.home_aanbod_items })}
      </div>

      {/* STUDIO LUNA PAGINA — LOCATIE & CONTACT */}
      <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
        <h3 className="font-display text-lg font-medium">Studio Luna pagina — Locatie en contact</h3>
        <p className="text-xs text-foreground/50 leading-[1.7]">
          De leslocatie is Waldorfhaus de Perenboom, Raadhuisplein 28 in Nieuwerkerk aan den IJssel. Laat deze velden
          leeg om die standaardtekst te gebruiken; vul je ze wel in, dan wint jouw tekst.
          Zolang het adres een huisnummer bevat verschijnt ook de knop Bekijk op kaart.
        </p>
        {field("Locatienaam", "home_locatie_naam", false, "Leeg laten voor de standaardnaam van de leslocatie.")}
        {field("Adres", "home_locatie_adres", true, "Leeg laten voor het standaardadres. Straat op regel 1, postcode en plaats op regel 2.")}
        {field("E-mailadres", "home_contact_email")}
        {field("Telefoonnummer", "home_contact_telefoon")}
        {field("Instagram handle (zonder @)", "home_contact_instagram", false, "Bijv. @studiolunazuidplas")}
        {saveBtn("home_contact", {
          home_locatie_naam: teksten.home_locatie_naam,
          home_locatie_adres: teksten.home_locatie_adres,
          home_contact_email: teksten.home_contact_email,
          home_contact_telefoon: teksten.home_contact_telefoon,
          home_contact_instagram: teksten.home_contact_instagram,
        })}
      </div>

      {/* AANBOD — YOGA */}
      <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
        <h3 className="font-display text-lg font-medium">Aanbod — Zwangerschapsyoga</h3>
        {field("Koptekst", "aanbod_yoga_heading", true, "De grote kop. Gebruik een nieuwe regel voor een regeleinde.")}
        {field("Beschrijving (alinea 1)", "aanbod_yoga_tekst1", true)}
        {field("Beschrijving (alinea 2)", "aanbod_yoga_tekst2", true)}
        <div className="grid grid-cols-1 gap-3">
          {field("Tijdstip", "aanbod_yoga_tijd", false, "Leeg laten voor de standaardtekst met de startdatum erbij.")}
          {field("Locatie", "aanbod_yoga_locatie", false, "Leeg laten voor de standaardregel met de leslocatie.")}
          {field("Extra detail (thee, etc.)", "aanbod_yoga_extra")}
        </div>
        {saveBtn("yoga", {
          aanbod_yoga_heading: teksten.aanbod_yoga_heading,
          aanbod_yoga_tekst1: teksten.aanbod_yoga_tekst1,
          aanbod_yoga_tekst2: teksten.aanbod_yoga_tekst2,
          aanbod_yoga_tijd: teksten.aanbod_yoga_tijd,
          aanbod_yoga_locatie: teksten.aanbod_yoga_locatie,
          aanbod_yoga_extra: teksten.aanbod_yoga_extra,
        })}
      </div>

      {/* AANBOD — CIRCLE (pagina staat uit) */}
      <div className={`bg-card border border-border/30 rounded-3xl p-5 space-y-4 ${TOON_OUD ? "" : "hidden"}`}>
        <h3 className="font-display text-lg font-medium">Aanbod — Mama Circle</h3>
        {field("Titel", "aanbod_circle_titel")}
        {field("Beschrijving", "aanbod_circle_tekst", true)}
        {saveBtn("circle", { aanbod_circle_titel: teksten.aanbod_circle_titel, aanbod_circle_tekst: teksten.aanbod_circle_tekst })}
      </div>

      {/* AANBOD — BEVALLINGS SPECIALS (staat uit via TOON_SPECIALS) */}
      <div className={`bg-card border border-border/30 rounded-3xl p-5 space-y-4 ${TOON_OUD ? "" : "hidden"}`}>
        <h3 className="font-display text-lg font-medium">Aanbod — Bevallings Specials</h3>
        {field("Koptekst", "aanbod_specials_heading")}
        {field("Workshops (één per regel)", "aanbod_specials_items", true, "Formaat per regel: Naam | Ondertitel | Prijs — bijv. 'Mama Spa | Ultiem ontspannen · 120 min | € 49,-'")}
        {field("Bundel (één regel)", "aanbod_specials_bundel", false, "Formaat: Naam | Ondertitel | Kortingsregel | Prijs")}
        {field("Verzekeraars-tekst (onder de lijst)", "aanbod_verzekering_tekst", true)}
        {saveBtn("aanbod_specials", {
          aanbod_specials_heading: teksten.aanbod_specials_heading,
          aanbod_specials_items: teksten.aanbod_specials_items,
          aanbod_specials_bundel: teksten.aanbod_specials_bundel,
          aanbod_verzekering_tekst: teksten.aanbod_verzekering_tekst,
        })}
      </div>

      {/* TARIEVEN (pagina staat uit) */}
      <div className={`bg-card border border-border/30 rounded-3xl p-5 space-y-4 ${TOON_OUD ? "" : "hidden"}`}>
        <h3 className="font-display text-lg font-medium">Tarieven pagina</h3>
        <p className="text-xs text-foreground/50">Teksten op de tarieven-pagina.</p>
        {field("Ondertitel (onder 'Tarieven')", "tarieven_ondertitel", false, "bijv. Gun jezelf dit wekelijkse rustmoment…")}
        {field("Informatietekst in aanvraagformulier", "tarieven_aanvraag_tekst", true)}
        {saveBtn("tarieven_aanvraag", { tarieven_ondertitel: teksten.tarieven_ondertitel, tarieven_aanvraag_tekst: teksten.tarieven_aanvraag_tekst })}
      </div>

      {/* OVER MIJ */}
      <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
        <h3 className="font-display text-lg font-medium">Over mij pagina</h3>
        <p className="text-xs text-foreground/50">Alles wat je hier invult verschijnt direct op de 'Over mij' tab in de app.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {field("Naam", "over_mij_naam")}
          {field("Functie / ondertitel", "over_mij_functie")}
        </div>
        {field("Quote (groot citaat bovenaan)", "over_mij_quote", false, "Korte, krachtige zin die jou typeert.")}
        {field("Jouw verhaal (biografie)", "over_mij_tekst", true, "Gebruik een lege regel tussen alinea's. Je kunt zo lang schrijven als je wilt.")}

        {/* FOTO UPLOAD */}
        <div>
          <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Profielfoto</label>
          <p className="text-xs text-foreground/40 mb-2">Upload een foto (max. 4 MB, JPG of PNG). De foto wordt direct opgeslagen.</p>
          <div className="flex items-start gap-4">
            {teksten.over_mij_foto && (
              <div className="shrink-0 w-20 h-24 rounded-xl overflow-hidden border border-border/30">
                <img src={teksten.over_mij_foto} alt="Profielfoto" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center gap-2 bg-secondary border border-border/40 text-foreground/70 hover:text-foreground px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Kies foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 15 * 1024 * 1024) { alert("Foto is te groot (max 15 MB)."); return; }
                    verkleinFoto(file, 800)
                      .then((dataUrl) => setTeksten((prev) => ({ ...prev, over_mij_foto: dataUrl })))
                      .catch(() => alert("Foto kon niet gelezen worden."));
                  }}
                />
              </label>
              {teksten.over_mij_foto && (
                <button
                  onClick={() => setTeksten((prev) => ({ ...prev, over_mij_foto: "" }))}
                  className="ml-2 text-xs text-foreground/40 hover:text-red-500 transition-colors"
                >
                  Verwijder foto
                </button>
              )}
            </div>
          </div>
        </div>

        {saveBtn("over_mij", {
          over_mij_naam: teksten.over_mij_naam,
          over_mij_functie: teksten.over_mij_functie,
          over_mij_quote: teksten.over_mij_quote,
          over_mij_tekst: teksten.over_mij_tekst,
          over_mij_foto: teksten.over_mij_foto,
        })}
      </div>

      {/* FOTO'S */}
      <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-6">
        <div>
          <h3 className="font-display text-lg font-medium">Foto's op de website</h3>
          <p className="text-xs text-foreground/50 mt-1">Upload foto's en stel per foto de hoogte en het beeldgedeelte in. Max. 4 MB, JPG of PNG.</p>
        </div>

        {/* ─ HERO FOTO ─ */}
        {(() => {
          const fotoKey = "foto_hero" as const;
          const positieKey = "foto_hero_positie" as const;
          return (
            <div className="border-t border-border/20 pt-5 first:border-0 first:pt-0">
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Headerfoto (Studio Luna pagina)</label>
              <p className="text-xs text-foreground/40 mb-3">Grote achtergrondafbeelding bovenaan. Liggend formaat, bij voorkeur 1400×900 px of groter.</p>
              <div className="flex items-start gap-4 mb-4">
                {teksten[fotoKey] ? (
                  <div className="shrink-0 overflow-hidden rounded-xl border border-border/30 bg-secondary w-32 h-20">
                    <img src={teksten[fotoKey]} alt="Hero" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="shrink-0 rounded-xl border border-dashed border-border/40 bg-secondary/50 flex items-center justify-center w-32 h-20">
                    <svg className="w-6 h-6 text-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-secondary border border-border/40 text-foreground/70 hover:text-foreground px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {teksten[fotoKey] ? "Andere foto" : "Kies foto"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      if (file.size > 15 * 1024 * 1024) { alert("Foto is te groot (max 15 MB)."); return; }
                      verkleinFoto(file, 1600)
                        .then((dataUrl) => setTeksten((prev) => ({ ...prev, [fotoKey]: dataUrl })))
                        .catch(() => alert("Foto kon niet gelezen worden."));
                    }} />
                  </label>
                  {teksten[fotoKey] && <button onClick={() => setTeksten((prev) => ({ ...prev, [fotoKey]: "" }))} className="text-xs text-foreground/40 hover:text-red-500 transition-colors text-left">Verwijder foto</button>}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-2">Beeldgedeelte</p>
                <div className="flex gap-2 flex-wrap">
                  {[{ v: "top", l: "Boven" }, { v: "center", l: "Midden" }, { v: "bottom", l: "Onder" }].map(({ v, l }) => (
                    <button key={v} onClick={() => setTeksten((prev) => ({ ...prev, [positieKey]: v }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${teksten[positieKey] === v ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border/40 text-foreground/60 hover:text-foreground"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4">{saveBtn("foto_hero", { foto_hero: teksten.foto_hero, foto_hero_positie: teksten.foto_hero_positie })}</div>
            </div>
          );
        })()}

        {/* ─ YOGA FOTO ─ */}
        {(() => {
          const fotoKey = "foto_yoga" as const;
          const hoogte = "foto_yoga_hoogte" as const;
          const positie = "foto_yoga_positie" as const;
          return (
            <div className="border-t border-border/20 pt-5">
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Zwangerschapsyoga foto (Aanbod pagina)</label>
              <p className="text-xs text-foreground/40 mb-3">Grote sfeerfoto boven de yoga-beschrijving.</p>
              <div className="flex items-start gap-4 mb-4">
                {teksten[fotoKey] ? (
                  <div className="shrink-0 overflow-hidden rounded-xl border border-border/30 bg-secondary w-20 h-24">
                    <img src={teksten[fotoKey]} alt="Yoga" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="shrink-0 rounded-xl border border-dashed border-border/40 bg-secondary/50 flex items-center justify-center w-20 h-24">
                    <svg className="w-6 h-6 text-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-secondary border border-border/40 text-foreground/70 hover:text-foreground px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {teksten[fotoKey] ? "Andere foto" : "Kies foto"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      if (file.size > 15 * 1024 * 1024) { alert("Foto is te groot (max 15 MB)."); return; }
                      verkleinFoto(file, 1600)
                        .then((dataUrl) => setTeksten((prev) => ({ ...prev, [fotoKey]: dataUrl })))
                        .catch(() => alert("Foto kon niet gelezen worden."));
                    }} />
                  </label>
                  {teksten[fotoKey] && <button onClick={() => setTeksten((prev) => ({ ...prev, [fotoKey]: "" }))} className="text-xs text-foreground/40 hover:text-red-500 transition-colors text-left">Verwijder foto</button>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-2">Hoogte foto</p>
                  <div className="flex gap-2 flex-wrap">
                    {[{ v: "smal", l: "Smal" }, { v: "normaal", l: "Normaal" }, { v: "hoog", l: "Hoog" }, { v: "portret", l: "Portret" }].map(({ v, l }) => (
                      <button key={v} onClick={() => setTeksten((prev) => ({ ...prev, [hoogte]: v }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${teksten[hoogte] === v ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border/40 text-foreground/60 hover:text-foreground"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-2">Beeldgedeelte</p>
                  <div className="flex gap-2 flex-wrap">
                    {[{ v: "top", l: "Boven" }, { v: "center", l: "Midden" }, { v: "bottom", l: "Onder" }].map(({ v, l }) => (
                      <button key={v} onClick={() => setTeksten((prev) => ({ ...prev, [positie]: v }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${teksten[positie] === v ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border/40 text-foreground/60 hover:text-foreground"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4">{saveBtn("foto_yoga", { foto_yoga: teksten.foto_yoga, foto_yoga_hoogte: teksten.foto_yoga_hoogte, foto_yoga_positie: teksten.foto_yoga_positie })}</div>
            </div>
          );
        })()}

        {/* ─ CIRCLE FOTO ─ */}
        {(() => {
          const fotoKey = "foto_circle" as const;
          const hoogte = "foto_circle_hoogte" as const;
          const positie = "foto_circle_positie" as const;
          return (
            <div className="border-t border-border/20 pt-5">
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1 block">Mama Circle foto (Aanbod pagina)</label>
              <p className="text-xs text-foreground/40 mb-3">Foto naast de Mama Circle beschrijving.</p>
              <div className="flex items-start gap-4 mb-4">
                {teksten[fotoKey] ? (
                  <div className="shrink-0 overflow-hidden rounded-xl border border-border/30 bg-secondary w-20 h-24">
                    <img src={teksten[fotoKey]} alt="Circle" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="shrink-0 rounded-xl border border-dashed border-border/40 bg-secondary/50 flex items-center justify-center w-20 h-24">
                    <svg className="w-6 h-6 text-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-secondary border border-border/40 text-foreground/70 hover:text-foreground px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {teksten[fotoKey] ? "Andere foto" : "Kies foto"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      if (file.size > 15 * 1024 * 1024) { alert("Foto is te groot (max 15 MB)."); return; }
                      verkleinFoto(file, 1600)
                        .then((dataUrl) => setTeksten((prev) => ({ ...prev, [fotoKey]: dataUrl })))
                        .catch(() => alert("Foto kon niet gelezen worden."));
                    }} />
                  </label>
                  {teksten[fotoKey] && <button onClick={() => setTeksten((prev) => ({ ...prev, [fotoKey]: "" }))} className="text-xs text-foreground/40 hover:text-red-500 transition-colors text-left">Verwijder foto</button>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-2">Hoogte foto</p>
                  <div className="flex gap-2 flex-wrap">
                    {[{ v: "smal", l: "Smal" }, { v: "normaal", l: "Normaal" }, { v: "hoog", l: "Hoog" }, { v: "portret", l: "Portret" }].map(({ v, l }) => (
                      <button key={v} onClick={() => setTeksten((prev) => ({ ...prev, [hoogte]: v }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${teksten[hoogte] === v ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border/40 text-foreground/60 hover:text-foreground"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-2">Beeldgedeelte</p>
                  <div className="flex gap-2 flex-wrap">
                    {[{ v: "top", l: "Boven" }, { v: "center", l: "Midden" }, { v: "bottom", l: "Onder" }].map(({ v, l }) => (
                      <button key={v} onClick={() => setTeksten((prev) => ({ ...prev, [positie]: v }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${teksten[positie] === v ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border/40 text-foreground/60 hover:text-foreground"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4">{saveBtn("foto_circle", { foto_circle: teksten.foto_circle, foto_circle_hoogte: teksten.foto_circle_hoogte, foto_circle_positie: teksten.foto_circle_positie })}</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── BLOG BEHEER TAB ─────────────────────────────────────────────────────────

type BlogPost = {
  id: string; slug: string; title: string; category: string; body: string;
  publishedAt: string; published: boolean; coverImage: string; createdAt: string;
};
const BLOG_CATEGORIES = ["Zwangerschapsyoga", "Geboortevoorbereiding", "Community", "Mama", "Over Studio Luna"];

function blogFormatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

type BlogComment = { id: string; postId: string; name: string; body: string; createdAt: string; approved: boolean; reply?: string; repliedAt?: string };

function BlogBeheerTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [coverPreview, setCoverPreview] = useState("");
  const [err, setErr] = useState("");
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySaving, setReplySaving] = useState(false);

  useEffect(() => {
    apiFetch("/admin/blog").then((r) => r.json()).then(setPosts).catch(() => {});
    apiFetch("/admin/blog/comments").then((r) => r.json()).then(setComments).catch(() => {});
  }, []);

  const startNew = () => {
    setEditing({ title: "", category: "Zwangerschapsyoga", body: "", publishedAt: new Date().toISOString().slice(0, 10), published: false });
    setCoverPreview("");
    setErr("");
  };

  const startEdit = (post: BlogPost) => {
    setEditing({ ...post });
    setCoverPreview(post.coverImage || "");
    setErr("");
  };

  const cancel = () => { setEditing(null); setCoverPreview(""); setErr(""); };

  const save = async () => {
    if (!editing || saving) return;
    setSaving(true); setErr("");
    try {
      const payload = { ...editing, coverImage: coverPreview };
      const method = editing.id ? "PATCH" : "POST";
      const path = editing.id ? `/admin/blog/${editing.id}` : "/admin/blog";
      const res = await apiFetch(path, { method, body: JSON.stringify(payload) });
      if (!res.ok) {
        let msg = `Fout bij opslaan (${res.status})`;
        try { const body = await res.json(); if (body?.error) msg = body.error; } catch {}
        throw new Error(msg);
      }
      const saved: BlogPost = await res.json();
      setPosts((prev) => editing.id ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev]);
      setEditing(null); setCoverPreview("");
    } catch (e: any) {
      setErr(e.message || "Onbekende fout");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Artikel verwijderen? Dit kan niet ongedaan worden gemaakt.")) return;
    await apiFetch(`/admin/blog/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const approveComment = async (commentId: string) => {
    const res = await apiFetch(`/admin/blog/comments/${commentId}/approve`, { method: "PATCH" });
    const updated: BlogComment = await res.json();
    setComments((prev) => prev.map((c) => c.id === updated.id ? updated : c));
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("Reactie verwijderen?")) return;
    await apiFetch(`/admin/blog/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const sendReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    setReplySaving(true);
    const res = await apiFetch(`/admin/blog/comments/${commentId}/reply`, {
      method: "PATCH", body: JSON.stringify({ reply: replyText }),
    });
    const updated: BlogComment = await res.json();
    setComments((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    setReplyingTo(null); setReplyText(""); setReplySaving(false);
  };

  const togglePublished = async (post: BlogPost) => {
    const res = await apiFetch(`/admin/blog/${post.id}`, { method: "PATCH", body: JSON.stringify({ published: !post.published }) });
    const updated: BlogPost = await res.json();
    setPosts((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const original = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const MAX = 1400;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.85);
        setCoverPreview(compressed);
        setEditing((prev) => prev ? { ...prev, coverImage: compressed } : prev);
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
  };

  const inputCls = "w-full bg-secondary border-0 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 outline-none focus:ring-2 focus:ring-primary/30";
  const btnPrimary = "flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors";
  const btnSecondary = "flex items-center gap-2 bg-secondary text-foreground/70 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-secondary/70 transition-colors";

  // ── EDIT / NEW FORM ────────────────────────────────────────────────────────
  if (editing !== null) {
    return (
      <div className="max-w-2xl">
        <button onClick={cancel} className="flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Terug naar overzicht
        </button>

        <h2 className="font-display text-2xl font-medium mb-6">{editing.id ? "Artikel bewerken" : "Nieuw artikel"}</h2>

        <div className="space-y-4">
          {/* Titel */}
          <div>
            <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">Titel</label>
            <input className={inputCls} placeholder="Geef je artikel een titel..." value={editing.title || ""} onChange={(e) => setEditing((p) => p ? { ...p, title: e.target.value } : p)} />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">URL-slug <span className="normal-case font-normal text-foreground/35">(bijv. zwanger-en-yoga — laat leeg voor automatisch)</span></label>
            <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-4 py-3">
              <span className="text-sm text-foreground/35 shrink-0">/blog/</span>
              <input
                className="flex-1 bg-transparent border-0 text-sm text-foreground placeholder:text-foreground/35 outline-none"
                placeholder="automatisch-vanuit-titel"
                value={editing.slug || ""}
                onChange={(e) => setEditing((p) => p ? { ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") } : p)}
              />
            </div>
          </div>

          {/* Categorie + Datum */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">Categorie</label>
              <select className={inputCls} value={editing.category || "Zwangerschapsyoga"} onChange={(e) => setEditing((p) => p ? { ...p, category: e.target.value } : p)}>
                {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">Datum</label>
              <input type="date" className={inputCls} value={editing.publishedAt || ""} onChange={(e) => setEditing((p) => p ? { ...p, publishedAt: e.target.value } : p)} />
            </div>
          </div>

          {/* Coverfoto */}
          <div>
            <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">Coverfoto</label>
            {coverPreview && (
              <div className="relative mb-2">
                <img src={coverPreview} alt="Cover preview" className="w-full max-h-52 object-cover rounded-2xl" />
                <button onClick={() => { setCoverPreview(""); setEditing((p) => p ? { ...p, coverImage: "" } : p); }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/70">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <label className="cursor-pointer inline-flex items-center gap-2 bg-secondary rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground/70 hover:bg-secondary/70 transition-colors">
              <Plus className="w-4 h-4" /> {coverPreview ? "Andere foto kiezen" : "Coverfoto toevoegen"}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
          </div>

          {/* Tekst */}
          <div>
            <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5">Artikel tekst</label>
            <BlogEditor
              value={editing.body || ""}
              onChange={(html) => setEditing((p) => p ? { ...p, body: html } : p)}
            />
          </div>

          {/* Publiceren */}
          <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
            <button onClick={() => setEditing((p) => p ? { ...p, published: !p.published } : p)}
              className={`w-10 h-6 rounded-full transition-colors duration-200 ${editing.published ? "bg-primary" : "bg-foreground/20"} relative shrink-0`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${editing.published ? "translate-x-4" : ""}`} />
            </button>
            <div>
              <p className="text-sm font-semibold">{editing.published ? "Gepubliceerd" : "Concept"}</p>
              <p className="text-xs text-foreground/45">{editing.published ? "Zichtbaar voor bezoekers" : "Alleen zichtbaar voor jou als admin"}</p>
            </div>
          </div>
        </div>

        {err && <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{err}</p>}

        <div className="flex gap-3 mt-6">
          <button onClick={save} disabled={saving} className={btnPrimary}>
            <Save className="w-4 h-4" /> {saving ? "Opslaan..." : "Opslaan"}
          </button>
          <button onClick={cancel} className={btnSecondary}>Annuleren</button>
        </div>
      </div>
    );
  }

  // ── OVERZICHT LIJST ────────────────────────────────────────────────────────
  const gepubliceerd = posts.filter((p) => p.published);
  const concepten = posts.filter((p) => !p.published);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-medium">Blog artikelen</h2>
          <p className="text-sm text-foreground/45 mt-0.5">{posts.length} artikel{posts.length !== 1 ? "en" : ""} · {gepubliceerd.length} gepubliceerd</p>
        </div>
        <button onClick={startNew} className={btnPrimary}>
          <Plus className="w-4 h-4" /> Nieuw artikel
        </button>
      </div>

      {posts.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border/40 rounded-3xl">
          <Feather className="w-8 h-8 text-foreground/20 mx-auto mb-3" />
          <p className="font-medium text-foreground/40">Nog geen artikelen</p>
          <p className="text-sm text-foreground/30 mt-1">Schrijf je eerste blog artikel</p>
          <button onClick={startNew} className={`${btnPrimary} mx-auto mt-5`}><Plus className="w-4 h-4" /> Nieuw artikel</button>
        </div>
      )}

      {gepubliceerd.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/35 mb-3">Gepubliceerd</p>
          <div className="space-y-3">
            {gepubliceerd.map((post) => (
              <div key={post.id} className="flex items-start gap-3 border border-border/20 rounded-2xl p-4 bg-background">
                {post.coverImage
                  ? <img src={post.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  : <div className="w-16 h-16 rounded-xl bg-secondary shrink-0 flex items-center justify-center"><Feather className="w-5 h-5 text-foreground/25" /></div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug truncate">{post.title || "(Zonder titel)"}</p>
                  <p className="text-xs text-foreground/40 mt-0.5">{post.category} · {blogFormatDate(post.publishedAt)}</p>
                  <p className="text-xs text-foreground/55 mt-1 line-clamp-2">{post.body?.slice(0, 120)}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => startEdit(post)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/70 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Bewerken
                  </button>
                  <button onClick={() => togglePublished(post)} className="flex items-center gap-1 text-xs font-semibold text-foreground/40 hover:text-foreground/70 transition-colors">
                    <EyeOff className="w-3.5 h-3.5" /> Depubliceren
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Verwijderen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {concepten.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/35 mb-3">Concepten</p>
          <div className="space-y-3">
            {concepten.map((post) => (
              <div key={post.id} className="flex items-start gap-3 border border-dashed border-border/30 rounded-2xl p-4 bg-secondary/30">
                {post.coverImage
                  ? <img src={post.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 opacity-60" />
                  : <div className="w-16 h-16 rounded-xl bg-secondary shrink-0 flex items-center justify-center"><Feather className="w-5 h-5 text-foreground/20" /></div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug truncate text-foreground/70">{post.title || "(Zonder titel)"}</p>
                  <p className="text-xs text-foreground/35 mt-0.5">{post.category} · {blogFormatDate(post.publishedAt)}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => startEdit(post)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/70 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Bewerken
                  </button>
                  <button onClick={() => togglePublished(post)} className="flex items-center gap-1 text-xs font-semibold text-foreground/40 hover:text-foreground/70 transition-colors">
                    <Eye className="w-3.5 h-3.5" /> Publiceren
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Verwijderen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REACTIES BEHEER ── */}
      {comments.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/35">Reacties</p>
            {comments.filter((c) => !c.approved).length > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                {comments.filter((c) => !c.approved).length} nieuw
              </span>
            )}
          </div>
          <div className="space-y-3">
            {comments.map((comment) => {
              const postTitle = posts.find((p) => p.id === comment.postId)?.title ?? comment.postId;
              const isReplying = replyingTo === comment.id;
              return (
                <div key={comment.id} className={`border rounded-2xl p-4 ${comment.approved ? "border-border/20 bg-background" : "border-primary/20 bg-primary/5"}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-semibold">{comment.name}</p>
                      <p className="text-xs text-foreground/40">{postTitle} · {new Date(comment.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!comment.approved && (
                        <button onClick={() => approveComment(comment.id)} className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors">
                          Goedkeuren
                        </button>
                      )}
                      <button onClick={() => deleteComment(comment.id)} className="text-foreground/30 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed mb-3">{comment.body}</p>

                  {comment.reply && (
                    <div className="bg-primary/8 border-l-2 border-primary/30 rounded-r-xl px-3 py-2 mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Jouw reactie</p>
                      <p className="text-sm text-foreground/70">{comment.reply}</p>
                    </div>
                  )}

                  {isReplying ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        placeholder="Schrijf je reactie..."
                        className="w-full bg-secondary border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => sendReply(comment.id)} disabled={replySaving}
                          className="text-xs font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors">
                          {replySaving ? "Versturen..." : "Versturen"}
                        </button>
                        <button onClick={() => { setReplyingTo(null); setReplyText(""); }}
                          className="text-xs font-semibold text-foreground/50 hover:text-foreground transition-colors px-2">
                          Annuleren
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setReplyingTo(comment.id); setReplyText(comment.reply ?? ""); }}
                      className="text-xs font-semibold text-primary/70 hover:text-primary transition-colors">
                      {comment.reply ? "Reactie aanpassen" : "Reageren"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REVIEWS BEHEER ──────────────────────────────────────────────────────────
type Review = { id: string; name: string; role: string; text: string; stars: number };
type ReviewsConfig = { visible: boolean; items: Review[] };

function ReviewsBeheerTab() {
  const [config, setConfig] = useState<ReviewsConfig>({ visible: false, items: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", text: "", stars: 5 });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Review | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch("/admin/reviews").then(async r => {
      if (r.ok) setConfig(await r.json());
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleVisible = async () => {
    setSaving(true);
    const res = await apiFetch("/admin/reviews/visible", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !config.visible }),
    });
    if (res.ok) setConfig(c => ({ ...c, visible: !c.visible }));
    setSaving(false);
  };

  const addReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await apiFetch("/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { load(); setForm({ name: "", role: "", text: "", stars: 5 }); }
    setSaving(false);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editForm) return;
    setSaving(true);
    const res = await apiFetch(`/admin/reviews/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) { load(); setEditId(null); setEditForm(null); }
    setSaving(false);
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Review verwijderen?")) return;
    await apiFetch(`/admin/reviews/${id}`, { method: "DELETE" });
    load();
  };

  const iBase = "w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  const taBase = `${iBase} resize-none`;

  if (loading) return <p className="text-sm text-foreground/50 py-8 text-center">Laden…</p>;

  return (
    <div className="space-y-6">
      {/* Zichtbaarheid toggle */}
      <div className="bg-card border border-border/30 rounded-3xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-medium">Reviews op de website</h3>
            <p className="text-xs text-foreground/50 mt-1">
              {config.visible ? "Reviews zijn zichtbaar voor bezoekers." : "Reviews zijn verborgen — alleen jij ziet ze als admin."}
            </p>
          </div>
          <button
            onClick={toggleVisible}
            disabled={saving}
            className={`px-5 py-2.5 rounded-2xl font-semibold text-sm transition-colors ${config.visible ? "bg-primary text-white" : "bg-secondary border border-border/40 text-foreground/70 hover:bg-primary/10"}`}
          >
            {config.visible ? "Aan — zet uit" : "Uit — zet aan"}
          </button>
        </div>
      </div>

      {/* Bestaande reviews */}
      {config.items.length > 0 && (
        <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
          <h3 className="font-display text-lg font-medium">Geplaatste reviews ({config.items.length})</h3>
          {config.items.map((review) => (
            <div key={review.id} className="border border-border/20 rounded-2xl p-4 space-y-2">
              {editId === review.id && editForm ? (
                <form onSubmit={saveEdit} className="space-y-3">
                  <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Naam" className={iBase} required />
                  <input value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} placeholder="Rol (bijv. deelneemster zwangerschapsyoga)" className={iBase} />
                  <textarea rows={3} value={editForm.text} onChange={e => setEditForm({...editForm, text: e.target.value})} placeholder="Reviewtekst" className={taBase} required />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-foreground/60">Sterren:</label>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setEditForm({...editForm, stars: s})}
                        className={`text-lg ${s <= editForm.stars ? "text-primary" : "text-foreground/20"}`}>★</button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="flex-1 bg-primary text-white py-2 rounded-2xl text-sm font-semibold">Opslaan</button>
                    <button type="button" onClick={() => { setEditId(null); setEditForm(null); }} className="flex-1 bg-secondary py-2 rounded-2xl text-sm font-semibold">Annuleer</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-semibold">{review.name}</p>
                      {review.role && <p className="text-xs text-foreground/50">{review.role}</p>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => { setEditId(review.id); setEditForm({...review}); }}
                        className="text-xs text-foreground/50 hover:text-primary px-3 py-1 rounded-xl border border-border/30">Bewerken</button>
                      <button onClick={() => deleteReview(review.id)}
                        className="text-xs text-red-500/70 hover:text-red-600 px-3 py-1 rounded-xl border border-red-200/40">Verwijder</button>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({length:5}).map((_,s) => (
                      <span key={s} className={`text-sm ${s < review.stars ? "text-primary" : "text-foreground/15"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-foreground/65 leading-relaxed">"{review.text}"</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Nieuwe review toevoegen */}
      <div className="bg-card border border-border/30 rounded-3xl p-5 space-y-4">
        <h3 className="font-display text-lg font-medium">Review toevoegen</h3>
        <form onSubmit={addReview} className="space-y-3">
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Naam" className={iBase} required />
          <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="Rol (bijv. deelneemster zwangerschapsyoga)" className={iBase} />
          <textarea rows={3} value={form.text} onChange={e => setForm({...form, text: e.target.value})} placeholder="Reviewtekst (schrijf in 1e persoon, bijv. &quot;De lessen zijn...&quot;)" className={taBase} required />
          <div className="flex items-center gap-2">
            <label className="text-xs text-foreground/60 font-medium">Sterren:</label>
            {[1,2,3,4,5].map(s => (
              <button key={s} type="button" onClick={() => setForm({...form, stars: s})}
                className={`text-lg transition-colors ${s <= form.stars ? "text-primary" : "text-foreground/20"}`}>★</button>
            ))}
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors">
            <Save className="w-3.5 h-3.5 inline mr-2" />
            Review toevoegen
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── AANMELDINGEN TAB ────────────────────────────────────────────────────────
// Alles wat via de site binnenkomt op één plek: aanmeldingen voor de reeks,
// de interesselijst, feedback op de zorgkaart en zorgverleners die erop willen.
type ReeksAanmelding = { naam: string; email: string; timestamp: string };
type Interesse = { email: string; timestamp: string };
type ZorgkaartFeedback = { bericht: string; email: string; timestamp: string };
type ZorgverlenerAanmelding = { praktijk: string; website: string; bericht: string; email: string; timestamp: string };
type Kennismaking = { naam: string; email: string; telefoon: string; bericht: string; timestamp: string };

const datumKort = (iso: string) =>
  new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });

function LegeLijst({ tekst }: { tekst: string }) {
  return (
    <div className="bg-card/50 border border-dashed border-border rounded-3xl px-5 py-6 text-center">
      <p className="text-sm text-muted-foreground">{tekst}</p>
    </div>
  );
}

function Lijstblok({ titel, aantal, children }: { titel: string; aantal: number; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-2">
        {titel} {aantal > 0 && `(${aantal})`}
      </p>
      {children}
    </div>
  );
}

function AanmeldingenTab() {
  const [laden, setLaden] = useState(true);
  const [aanmeldingen, setAanmeldingen] = useState<ReeksAanmelding[]>([]);
  const [interesse, setInteresse] = useState<Interesse[]>([]);
  const [feedback, setFeedback] = useState<ZorgkaartFeedback[]>([]);
  const [zorgverleners, setZorgverleners] = useState<ZorgverlenerAanmelding[]>([]);
  const [kennismakingen, setKennismakingen] = useState<Kennismaking[]>([]);

  const laad = async () => {
    setLaden(true);
    const haal = async <T,>(pad: string): Promise<T[]> => {
      const res = await apiFetch(pad);
      return res.ok ? await res.json() : [];
    };
    const [a, i, f, z, k] = await Promise.all([
      haal<ReeksAanmelding>("/admin/geboortereeks-aanmeldingen"),
      haal<Interesse>("/admin/interests"),
      haal<ZorgkaartFeedback>("/admin/zorgkaart-feedback"),
      haal<ZorgverlenerAanmelding>("/admin/zorgverlener-aanmeldingen"),
      haal<Kennismaking>("/admin/kennismakingen"),
    ]);
    setAanmeldingen(a); setInteresse(i); setFeedback(f); setZorgverleners(z); setKennismakingen(k);
    setLaden(false);
  };

  useEffect(() => { laad(); }, []);

  if (laden) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/60">
          {aanmeldingen.length} aangemeld voor de Geboortereeks · {interesse.length} op de interesselijst
        </p>
        <button onClick={laad} className="flex items-center gap-1.5 text-xs font-semibold text-foreground/50 hover:text-foreground transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Vernieuwen
        </button>
      </div>

      <Lijstblok titel="Aanmeldingen Geboortereeks" aantal={aanmeldingen.length}>
        {aanmeldingen.length === 0 ? (
          <LegeLijst tekst="Nog geen aanmeldingen. Ze komen hier binnen en je krijgt er ook een mail van." />
        ) : (
          <div className="bg-card border border-border/30 rounded-3xl overflow-hidden">
            {aanmeldingen.map((a, i) => (
              <div key={i} className={`px-5 py-4 flex items-start justify-between gap-3 ${i > 0 ? "border-t border-border/20" : ""}`}>
                <div>
                  <p className="font-semibold text-foreground text-sm">{a.naam}</p>
                  <a href={`mailto:${a.email}`} className="text-xs text-primary hover:underline">{a.email}</a>
                </div>
                <p className="text-xs text-foreground/35 shrink-0">{datumKort(a.timestamp)}</p>
              </div>
            ))}
          </div>
        )}
        {aanmeldingen.length > 0 && (
          <p className="text-xs text-foreground/45 leading-[1.7] mt-2">
            Stuur elke aanmelding zelf het intakeformulier en de factuur per mail.
          </p>
        )}
      </Lijstblok>

      <Lijstblok titel="Interesselijst" aantal={interesse.length}>
        {interesse.length === 0 ? (
          <LegeLijst tekst="Nog niemand op de interesselijst." />
        ) : (
          <div className="bg-card border border-border/30 rounded-3xl overflow-hidden">
            {interesse.map((item, i) => (
              <div key={i} className={`px-5 py-3 flex items-center justify-between gap-3 ${i > 0 ? "border-t border-border/20" : ""}`}>
                <a href={`mailto:${item.email}`} className="text-sm text-foreground/75 hover:text-primary">{item.email}</a>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-xs text-foreground/35">{datumKort(item.timestamp)}</p>
                  <button
                    aria-label={`Verwijder ${item.email} van de lijst`}
                    onClick={async () => {
                      if (!confirm(`${item.email} van de interesselijst halen?`)) return;
                      const res = await apiFetch("/admin/interests", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: item.email }),
                      });
                      if (res.ok) setInteresse((prev) => prev.filter((x) => x.email !== item.email));
                    }}
                    className="text-foreground/30 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Lijstblok>

      <Lijstblok titel="Feedback op de zorgkaart" aantal={feedback.length}>
        {feedback.length === 0 ? (
          <LegeLijst tekst="Nog geen feedback op de zorgkaart." />
        ) : (
          <div className="space-y-3">
            {feedback.map((f, i) => (
              <div key={i} className="bg-card border border-border/30 rounded-3xl px-5 py-4">
                <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap">{f.bericht}</p>
                <div className="flex items-center justify-between gap-3 mt-3">
                  <a href={`mailto:${f.email}`} className="text-xs text-primary hover:underline">{f.email}</a>
                  <p className="text-xs text-foreground/35 shrink-0">{datumKort(f.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Lijstblok>

      <Lijstblok titel="Vragen en kennismakingen" aantal={kennismakingen.length}>
        {kennismakingen.length === 0 ? (
          <LegeLijst tekst="Nog geen berichtjes via de reekspagina. Je krijgt er ook een mail van." />
        ) : (
          <div className="space-y-3">
            {kennismakingen.map((k, i) => (
              <div key={i} className="bg-card border border-border/30 rounded-3xl px-5 py-4">
                <p className="font-semibold text-foreground text-sm mb-1.5">{k.naam}</p>
                <p className="text-sm text-foreground/80 leading-[1.8] whitespace-pre-wrap">{k.bericht}</p>
                <div className="flex items-center justify-between gap-3 mt-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <a href={`mailto:${k.email}`} className="text-xs text-primary hover:underline">{k.email}</a>
                    {k.telefoon && (
                      <a href={`tel:${k.telefoon.replace(/\s/g, "")}`} className="text-xs text-primary hover:underline">{k.telefoon}</a>
                    )}
                  </div>
                  <p className="text-xs text-foreground/35 shrink-0">{datumKort(k.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Lijstblok>

      <Lijstblok titel="Zorgverleners die op de kaart willen" aantal={zorgverleners.length}>
        {zorgverleners.length === 0 ? (
          <LegeLijst tekst="Nog geen aanmeldingen van zorgverleners." />
        ) : (
          <div className="space-y-3">
            {zorgverleners.map((z, i) => (
              <div key={i} className="bg-card border border-border/30 rounded-3xl px-5 py-4">
                <p className="font-semibold text-foreground text-sm">{z.praktijk}</p>
                {z.website && (
                  <a href={z.website.startsWith("http") ? z.website : `https://${z.website}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline">{z.website}</a>
                )}
                {z.bericht && <p className="text-sm text-foreground/75 leading-[1.8] mt-2 whitespace-pre-wrap">{z.bericht}</p>}
                <div className="flex items-center justify-between gap-3 mt-3">
                  <a href={`mailto:${z.email}`} className="text-xs text-primary hover:underline">{z.email}</a>
                  <p className="text-xs text-foreground/35 shrink-0">{datumKort(z.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Lijstblok>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ─────────────────────────────────────────────────────────
// Zichtbaar in het menu staat alleen wat bij de Geboortereeks hoort. De schermen
// van het oude boekingssysteem (leden, lessen, lestypes, tarieven, aanvragen,
// reserveringen) blijven in de code staan en komen terug door TOON_OUD op true
// te zetten; ze horen bij de losse lessen en het rittenkaartmodel dat uit staat.
const TOON_OUD = false;

type AdminTab = "aanmeldingen" | "inhoud" | "blog" | "reviews" | "mededelingen" | "email" | "leden" | "lessen" | "lestypes" | "tarieven" | "aanvragen" | "reserveringen";

export default function Admin() {
  const { user, loading, login } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<AdminTab>("aanmeldingen");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setAdminLoading(true);
    try {
      await login(adminEmail, adminPassword);
    } catch (err: any) {
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  if (loading) return null;

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-medium">Admin toegang</h1>
            <p className="text-sm text-foreground/50 mt-1">Studio Luna beheer</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-3">
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              placeholder="E-mailadres"
              className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              placeholder="Wachtwoord"
              className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {adminError && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{adminError}</p>}
            <button
              type="submit"
              disabled={adminLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {adminLoading ? "Bezig…" : "Inloggen"}
            </button>
          </form>
          <button onClick={() => navigate("/")} className="mt-4 w-full text-xs text-foreground/40 hover:text-foreground/60 transition-colors text-center">
            Terug naar de app
          </button>
        </motion.div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: "aanmeldingen", label: "Aanmeldingen", icon: <ClipboardList className="w-4 h-4" /> },
    { key: "inhoud", label: "Teksten en foto's", icon: <FileText className="w-4 h-4" /> },
    { key: "blog", label: "Blog", icon: <Feather className="w-4 h-4" /> },
    { key: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
    { key: "mededelingen", label: "Mededelingen", icon: <Baby className="w-4 h-4" /> },
    { key: "email", label: "E-mail", icon: <Mail className="w-4 h-4" /> },
    ...(TOON_OUD ? [
      { key: "leden" as AdminTab, label: "Leden", icon: <Users className="w-4 h-4" /> },
      { key: "lessen" as AdminTab, label: "Lessen", icon: <BookOpen className="w-4 h-4" /> },
      { key: "lestypes" as AdminTab, label: "Lestypes", icon: <Palette className="w-4 h-4" /> },
      { key: "tarieven" as AdminTab, label: "Tarieven", icon: <Tag className="w-4 h-4" /> },
      { key: "aanvragen" as AdminTab, label: "Aanvragen", icon: <ClipboardList className="w-4 h-4" /> },
      { key: "reserveringen" as AdminTab, label: "Reserveringen", icon: <CalendarDays className="w-4 h-4" /> },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        <div className="px-6 md:px-12 lg:px-16 pt-12 md:pt-10 pb-6 bg-secondary md:rounded-3xl md:mx-6 md:mt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Beheer</p>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">Studio Luna Admin</h1>
            <p className="text-sm text-foreground/55 leading-[1.8] mt-3 max-w-xl">
              Aanmeldingen is je dagelijkse scherm. Bij Teksten en foto's pas je de site aan;
              een veld dat je leeg laat gebruikt automatisch de standaardtekst van de site.
            </p>
          </motion.div>

          <div className="mt-5 flex gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:flex-wrap" style={{ scrollbarWidth: "none" }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-semibold text-sm transition-all shrink-0 ${tab === t.key ? "bg-primary text-primary-foreground shadow-sm" : "bg-background/60 text-foreground/60 hover:text-foreground hover:bg-background/80"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-6 mb-8">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}>
              {tab === "aanmeldingen" && <AanmeldingenTab />}
              {tab === "leden" && <LedenTab />}
              {tab === "lessen" && <LessenTab />}
              {tab === "lestypes" && <LestypesTab />}
              {tab === "tarieven" && <TarievenTab />}
              {tab === "aanvragen" && <AanvragenTab />}
              {tab === "reserveringen" && <ReserveeringenTab />}
              {tab === "mededelingen" && <MededelingenTab />}
              {tab === "email" && <EmailInstellingenTab />}
              {tab === "inhoud" && <InhoudTab />}
              {tab === "blog" && <BlogBeheerTab />}
              {tab === "reviews" && <ReviewsBeheerTab />}
            </motion.div>
          </AnimatePresence>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
