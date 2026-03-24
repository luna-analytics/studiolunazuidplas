import { useState, useEffect } from "react";
import { useAuth, getToken } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, PlusCircle, MinusCircle, ChevronDown, ChevronUp, X,
  BookOpen, Users, ClipboardList, Check, CalendarDays, Baby, Share2,
  Sparkles, MessageCircle, MapPin, Clock, Mail,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Member = { id: string; name: string; email: string; credits: number; notes: string; createdAt: string };
type StudioClass = { id: string; title: string; time: string; teacher: string; spotsTotal: number; description: string; type: "yoga" | "circle"; dates: string[] };
type RRequest = { id: string; name: string; email: string; package: string; createdAt: string; done: boolean };
type Announcement = { id: string; type: "bevallen"; memberId: string; memberName: string; shareConsent: boolean; note?: string; createdAt: string; seenByAdmin: boolean };

function apiFetch(path: string, opts?: RequestInit) {
  return fetch(`${BASE}/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts?.headers ?? {}) },
  });
}

// ─── LEDEN TAB ───────────────────────────────────────────────────────────────
function LedenTab() {
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", credits: "0", notes: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creditDelta, setCreditDelta] = useState<Record<string, string>>({});

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
            onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}>
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
                <div className="flex items-center gap-2">
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
function LessenTab() {
  const [classes, setClasses] = useState<StudioClass[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", time: "19:00", teacher: "Marjolein", spotsTotal: "8", description: "", type: "yoga" as "yoga" | "circle", newDate: "" });
  const [classDates, setClassDates] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    const res = await apiFetch("/admin/classes");
    if (res.ok) setClasses(await res.json());
  };

  useEffect(() => { load(); }, []);

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setFormLoading(true);
    try {
      const res = await apiFetch("/admin/classes", {
        method: "POST",
        body: JSON.stringify({ ...form, spotsTotal: Number(form.spotsTotal), dates: classDates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClasses((c) => [...c, data]);
      setForm({ title: "", time: "19:00", teacher: "Marjolein", spotsTotal: "8", description: "", type: "yoga", newDate: "" });
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
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="yoga">Yoga</option>
                <option value="circle">Circle</option>
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
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${cls.type === "yoga" ? "bg-primary/15 text-primary" : "bg-accent/15 text-foreground"}`}>{cls.type === "yoga" ? "Yoga" : "Circle"}</span>
              {expandedId === cls.id ? <ChevronUp className="w-4 h-4 text-foreground/40" /> : <ChevronDown className="w-4 h-4 text-foreground/40" />}
            </div>
          </div>

          {expandedId === cls.id && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              className="border-t border-border/20 px-5 py-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">Datums beheren</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {cls.dates.map((d) => (
                    <span key={d} className="flex items-center gap-1 bg-secondary text-foreground/70 text-xs font-medium px-3 py-1 rounded-full">
                      <CalendarDays className="w-3 h-3" /> {d}
                      <button onClick={() => removeDateFromClass(cls, d)} className="ml-0.5 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {cls.dates.length === 0 && <p className="text-xs text-foreground/40">Nog geen datums</p>}
                </div>
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

  const pkgLabel = (pkg: string) => pkg === "5-rittenkaart" ? "5-rittenkaart (€ 105,-)" : pkg === "10-rittenkaart" ? "10-rittenkaart (€ 195,-)" : "Losse les (€ 22,50)";

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
    </div>
  );
}

// ─── VILLAGE BEHEER TAB ───────────────────────────────────────────────────────
function VillageBeheerTab() {
  const [section, setSection] = useState<"tips" | "events" | "journal" | "intros">("tips");

  // Tips
  const [tips, setTips] = useState<{ id: string; text: string; emoji: string; active: boolean; createdAt: string }[]>([]);
  const [newTipText, setNewTipText] = useState("");
  const [newTipEmoji, setNewTipEmoji] = useState("🌿");

  // Events
  const [events, setEvents] = useState<{ id: string; title: string; date: string; time?: string; description: string; location?: string }[]>([]);
  const [evForm, setEvForm] = useState({ title: "", date: "", time: "", description: "", location: "" });

  // Journal
  const [questions, setQuestions] = useState<{ id: string; question: string; active: boolean; answers: { memberName: string; anonymous: boolean; text: string }[]; createdAt: string }[]>([]);
  const [newQ, setNewQ] = useState("");
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  // Intros
  const [intros, setIntros] = useState<{ memberId: string; intro: string }[]>([]);

  useEffect(() => {
    apiFetch("/admin/tips").then((r) => r.ok && r.json().then(setTips));
    apiFetch("/admin/events").then((r) => r.ok && r.json().then(setEvents));
    apiFetch("/admin/journal").then((r) => r.ok && r.json().then(setQuestions));
    apiFetch("/admin/village/intros").then((r) => r.ok && r.json().then(setIntros));
  }, []);

  const addTip = async () => {
    if (!newTipText.trim()) return;
    const res = await apiFetch("/admin/tips", { method: "POST", body: JSON.stringify({ text: newTipText.trim(), emoji: newTipEmoji }) });
    if (res.ok) { const t = await res.json(); setTips((prev) => prev.map((x) => ({ ...x, active: false })).concat(t)); setNewTipText(""); }
  };
  const activateTip = async (id: string) => {
    const res = await apiFetch(`/admin/tips/${id}/activate`, { method: "POST" });
    if (res.ok) setTips((prev) => prev.map((t) => ({ ...t, active: t.id === id })));
  };
  const deleteTip = async (id: string) => {
    await apiFetch(`/admin/tips/${id}`, { method: "DELETE" });
    setTips((prev) => prev.filter((t) => t.id !== id));
  };

  const addEvent = async () => {
    if (!evForm.title || !evForm.date) return;
    const res = await apiFetch("/admin/events", { method: "POST", body: JSON.stringify(evForm) });
    if (res.ok) { const e = await res.json(); setEvents((prev) => [...prev, e]); setEvForm({ title: "", date: "", time: "", description: "", location: "" }); }
  };
  const deleteEvent = async (id: string) => {
    await apiFetch(`/admin/events/${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const addQuestion = async () => {
    if (!newQ.trim()) return;
    const res = await apiFetch("/admin/journal", { method: "POST", body: JSON.stringify({ question: newQ.trim() }) });
    if (res.ok) { const q = await res.json(); setQuestions((prev) => prev.map((x) => ({ ...x, active: false })).concat(q)); setNewQ(""); }
  };
  const activateQ = async (id: string) => {
    const res = await apiFetch(`/admin/journal/${id}/activate`, { method: "POST" });
    if (res.ok) setQuestions((prev) => prev.map((q) => ({ ...q, active: q.id === id })));
  };
  const deleteQ = async (id: string) => {
    await apiFetch(`/admin/journal/${id}`, { method: "DELETE" });
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const sections = [
    { key: "tips" as const, label: "Tip vd week", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: "events" as const, label: "Evenementen", icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { key: "journal" as const, label: "Journal", icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { key: "intros" as const, label: "Introducties", icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all border ${section === s.key ? "bg-primary/10 border-primary/30 text-primary" : "border-border/30 text-foreground/55 hover:text-foreground"}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* TIPS */}
      {section === "tips" && (
        <div className="space-y-3">
          <div className="bg-card border border-border/30 rounded-3xl p-5">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-3">Nieuwe tip toevoegen</p>
            <div className="flex gap-2 mb-3">
              <input value={newTipEmoji} onChange={(e) => setNewTipEmoji(e.target.value)} placeholder="🌿" className="w-14 bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <textarea value={newTipText} onChange={(e) => setNewTipText(e.target.value)} rows={2} placeholder="De tip voor deze week…"
                className="flex-1 bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <button onClick={addTip} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Tip activeren
            </button>
          </div>
          {tips.map((tip) => (
            <div key={tip.id} className={`bg-card border rounded-3xl px-5 py-4 flex items-start gap-3 ${tip.active ? "border-primary/30 bg-primary/3" : "border-border/30"}`}>
              <span className="text-xl shrink-0">{tip.emoji}</span>
              <div className="flex-1">
                <p className="text-sm text-foreground/75 leading-relaxed">{tip.text}</p>
                {tip.active && <span className="text-xs font-bold text-primary mt-1 block">✓ Actief</span>}
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                {!tip.active && <button onClick={() => activateTip(tip.id)} className="text-xs text-primary font-semibold hover:underline">Activeer</button>}
                <button onClick={() => deleteTip(tip.id)} className="text-xs text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EVENTS */}
      {section === "events" && (
        <div className="space-y-3">
          <div className="bg-card border border-border/30 rounded-3xl p-5">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-3">Nieuw evenement</p>
            <div className="space-y-2">
              <input value={evForm.title} onChange={(e) => setEvForm({ ...evForm, title: e.target.value })} placeholder="Titel"
                className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={evForm.date} onChange={(e) => setEvForm({ ...evForm, date: e.target.value })}
                  className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input value={evForm.time} onChange={(e) => setEvForm({ ...evForm, time: e.target.value })} placeholder="Tijd (optioneel)"
                  className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <input value={evForm.location} onChange={(e) => setEvForm({ ...evForm, location: e.target.value })} placeholder="Locatie (optioneel)"
                className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <textarea value={evForm.description} onChange={(e) => setEvForm({ ...evForm, description: e.target.value })} rows={2} placeholder="Omschrijving"
                className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={addEvent} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Aanmaken
              </button>
            </div>
          </div>
          {events.length === 0 && <div className="text-center py-6 text-sm text-foreground/40">Nog geen evenementen.</div>}
          {events.map((ev) => (
            <div key={ev.id} className="bg-card border border-border/30 rounded-3xl px-5 py-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground text-sm">{ev.title}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-foreground/50">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{ev.date}</span>
                  {ev.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.time}</span>}
                  {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>}
                </div>
                {ev.description && <p className="text-xs text-foreground/50 mt-1">{ev.description}</p>}
              </div>
              <button onClick={() => deleteEvent(ev.id)} className="text-foreground/30 hover:text-red-400 transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {/* JOURNAL */}
      {section === "journal" && (
        <div className="space-y-3">
          <div className="bg-card border border-border/30 rounded-3xl p-5">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-3">Nieuwe vraag van de week</p>
            <textarea value={newQ} onChange={(e) => setNewQ(e.target.value)} rows={2} placeholder="bijv. Hoe gaat het met jou deze week?"
              className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={addQuestion} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Vraag activeren
            </button>
          </div>
          {questions.map((q) => (
            <div key={q.id} className={`bg-card border rounded-3xl overflow-hidden ${q.active ? "border-primary/30" : "border-border/30"}`}>
              <div className="px-5 py-4 flex items-start justify-between gap-3 cursor-pointer" onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground leading-relaxed">"{q.question}"</p>
                  <div className="flex items-center gap-3 mt-1">
                    {q.active && <span className="text-xs font-bold text-primary">✓ Actief</span>}
                    <span className="text-xs text-foreground/40">{q.answers.length} {q.answers.length === 1 ? "antwoord" : "antwoorden"}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!q.active && <button onClick={(e) => { e.stopPropagation(); activateQ(q.id); }} className="text-xs text-primary font-semibold hover:underline">Activeer</button>}
                  <button onClick={(e) => { e.stopPropagation(); deleteQ(q.id); }} className="text-foreground/30 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {expandedQ === q.id && q.answers.length > 0 && (
                <div className="border-t border-border/20 px-5 py-3 space-y-2">
                  {q.answers.map((a, i) => (
                    <div key={i} className="bg-secondary rounded-2xl px-4 py-3">
                      <p className="text-xs font-semibold text-foreground/50 mb-1">{a.anonymous ? "Anoniem" : a.memberName}</p>
                      <p className="text-sm text-foreground/75 italic">"{a.text}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* INTROS */}
      {section === "intros" && (
        <div className="space-y-3">
          {intros.length === 0 && <div className="text-center py-6 text-sm text-foreground/40">Nog geen introducties ingevuld.</div>}
          {intros.map((p, i) => (
            <div key={p.memberId} className="bg-card border border-border/30 rounded-3xl px-5 py-4">
              <p className="text-xs text-foreground/40 mb-1">Lid #{i + 1}</p>
              <p className="text-sm text-foreground/75 italic leading-relaxed">"{p.intro}"</p>
            </div>
          ))}
        </div>
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
type EmailSettings = { welkomstTekst: string; persoonlijkBericht: string; annuleringsNote: string };

function EmailInstellingenTab() {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [form, setForm] = useState<EmailSettings>({ welkomstTekst: "", persoonlijkBericht: "", annuleringsNote: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/email-settings").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setForm(data);
      }
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await apiFetch("/admin/email-settings", { method: "PUT", body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      setSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <form onSubmit={save} className="space-y-6 max-w-xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">E-mail beheer</p>
        <p className="text-sm text-foreground/60">Pas de teksten in de bevestigingsmail aan. Leden ontvangen deze mail automatisch na een reservering.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-secondary rounded-2xl p-5 space-y-2">
          <label className="text-sm font-semibold text-foreground">Welkomstbericht</label>
          <p className="text-xs text-foreground/50">De tekst direct na "Hoi [naam],"</p>
          <textarea
            value={form.welkomstTekst}
            onChange={(e) => setForm({ ...form, welkomstTekst: e.target.value })}
            rows={3}
            className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="Je reservering is bevestigd…"
          />
        </div>

        <div className="bg-secondary rounded-2xl p-5 space-y-2">
          <label className="text-sm font-semibold text-foreground">Persoonlijk bericht <span className="font-normal text-foreground/40">(optioneel)</span></label>
          <p className="text-xs text-foreground/50">Extra berichtje onderaan, bijv. een tip of persoonlijke noot</p>
          <textarea
            value={form.persoonlijkBericht}
            onChange={(e) => setForm({ ...form, persoonlijkBericht: e.target.value })}
            rows={3}
            className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="Bijv: Draag comfortabele kleding en neem een flesje water mee!"
          />
        </div>

        <div className="bg-secondary rounded-2xl p-5 space-y-2">
          <label className="text-sm font-semibold text-foreground">Annuleringsherinnering</label>
          <p className="text-xs text-foreground/50">Tekst over de annuleringsregel (7 uur van tevoren)</p>
          <textarea
            value={form.annuleringsNote}
            onChange={(e) => setForm({ ...form, annuleringsNote: e.target.value })}
            rows={3}
            className="w-full bg-background border border-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="Kun je toch niet komen?…"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
      >
        <Mail className="w-4 h-4" />
        {saving ? "Opslaan…" : saved ? "✓ Opgeslagen!" : "Wijzigingen opslaan"}
      </button>
    </form>
  );
}

// ─── MAIN ADMIN PAGE ─────────────────────────────────────────────────────────
type AdminTab = "leden" | "lessen" | "aanvragen" | "mededelingen" | "village" | "email";

export default function Admin() {
  const { user, loading, login } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<AdminTab>("leden");
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
    { key: "leden", label: "Leden", icon: <Users className="w-4 h-4" /> },
    { key: "lessen", label: "Lessen", icon: <BookOpen className="w-4 h-4" /> },
    { key: "aanvragen", label: "Aanvragen", icon: <ClipboardList className="w-4 h-4" /> },
    { key: "mededelingen", label: "Mededelingen", icon: <Baby className="w-4 h-4" /> },
    { key: "village", label: "Village", icon: <Sparkles className="w-4 h-4" /> },
    { key: "email", label: "E-mail", icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        <div className="px-6 md:px-12 lg:px-16 pt-12 md:pt-10 pb-6 bg-secondary md:rounded-3xl md:mx-6 md:mt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Beheer</p>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">Studio Luna Admin</h1>
          </motion.div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
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
              {tab === "leden" && <LedenTab />}
              {tab === "lessen" && <LessenTab />}
              {tab === "aanvragen" && <AanvragenTab />}
              {tab === "mededelingen" && <MededelingenTab />}
              {tab === "village" && <VillageBeheerTab />}
              {tab === "email" && <EmailInstellingenTab />}
            </motion.div>
          </AnimatePresence>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
