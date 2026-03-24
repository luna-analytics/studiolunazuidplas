import { useState, useEffect } from "react";
import { useAuth, getToken } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, PlusCircle, MinusCircle, ChevronDown, ChevronUp, X,
  BookOpen, Users, ClipboardList, Check, CalendarDays,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Member = { id: string; name: string; email: string; credits: number; notes: string; createdAt: string };
type StudioClass = { id: string; title: string; time: string; teacher: string; spotsTotal: number; description: string; type: "yoga" | "circle"; dates: string[] };
type RRequest = { id: string; name: string; email: string; package: string; createdAt: string; done: boolean };

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
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls.type === "yoga" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent"}`}>{cls.type}</span>
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

  const load = async () => {
    setLoading(true);
    const res = await apiFetch("/admin/requests");
    if (res.ok) setRequests(await res.json());
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
                    <span className="text-xs font-semibold bg-accent/20 text-accent px-2 py-0.5 rounded-full mt-1.5 inline-block">{pkgLabel(req.package)}</span>
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
    </div>
  );
}

// ─── MAIN ADMIN PAGE ─────────────────────────────────────────────────────────
type AdminTab = "leden" | "lessen" | "aanvragen";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<AdminTab>("leden");

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) navigate("/");
  }, [user, loading]);

  if (loading) return null;
  if (!user?.isAdmin) return null;

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: "leden", label: "Leden", icon: <Users className="w-4 h-4" /> },
    { key: "lessen", label: "Lessen", icon: <BookOpen className="w-4 h-4" /> },
    { key: "aanvragen", label: "Aanvragen", icon: <ClipboardList className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        <div className="px-6 md:px-12 lg:px-16 pt-12 md:pt-10 pb-6 bg-secondary md:rounded-3xl md:mx-6 md:mt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Beheer</p>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">Studio Luna Admin</h1>
          </motion.div>

          <div className="mt-5 flex gap-2">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-semibold text-sm transition-all ${tab === t.key ? "bg-primary text-primary-foreground shadow-sm" : "bg-background/60 text-foreground/60 hover:text-foreground hover:bg-background/80"}`}>
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
            </motion.div>
          </AnimatePresence>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
