import { useState, useEffect } from "react";
import { useAuth, getToken } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { Plus, Trash2, PlusCircle, MinusCircle, ChevronDown, ChevronUp, X } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Member = { id: string; name: string; email: string; credits: number; notes: string; createdAt: string };

function apiFetch(path: string, opts?: RequestInit) {
  return fetch(`${BASE}/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts?.headers ?? {}) },
  });
}

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", credits: "0", notes: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creditDelta, setCreditDelta] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) navigate("/");
  }, [user, loading]);

  const loadMembers = async () => {
    const res = await apiFetch("/admin/members");
    if (res.ok) setMembers(await res.json());
  };

  useEffect(() => { if (user?.isAdmin) loadMembers(); }, [user]);

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
    const res = await apiFetch(`/admin/members/${id}/credits`, {
      method: "POST",
      body: JSON.stringify({ delta }),
    });
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

  if (loading) return null;
  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        <div className="px-6 md:px-12 lg:px-16 pt-12 md:pt-10 pb-8 bg-secondary md:rounded-3xl md:mx-6 md:mt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Beheer</p>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">Leden</h1>
            <p className="text-foreground/60 mt-2 text-sm">{members.length} {members.length === 1 ? "lid" : "leden"} geregistreerd</p>
          </motion.div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-6 mb-8 space-y-4">

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Annuleren" : "Nieuw lid toevoegen"}
          </button>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/30 rounded-3xl p-5"
            >
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
                    placeholder="Geef het door aan het lid" className="w-full bg-secondary border border-border/40 rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
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

          {members.length === 0 && (
            <div className="bg-card/50 border border-dashed border-border rounded-3xl p-8 text-center">
              <p className="text-sm text-muted-foreground">Nog geen leden. Voeg het eerste lid toe.</p>
            </div>
          )}

          {members.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card border border-border/30 rounded-3xl overflow-hidden"
            >
              <div
                className="px-5 py-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
              >
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
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-border/20 px-5 py-4 space-y-4"
                >
                  {member.notes && (
                    <p className="text-xs text-foreground/55 italic">{member.notes}</p>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">Credits aanpassen</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={creditDelta[member.id] ?? "1"}
                        onChange={(e) => setCreditDelta({ ...creditDelta, [member.id]: e.target.value })}
                        className="w-20 bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        onClick={() => adjustCredits(member.id, Number(creditDelta[member.id] ?? 1))}
                        className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-xl font-semibold text-xs hover:bg-primary/20 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" /> Toevoegen
                      </button>
                      <button
                        onClick={() => adjustCredits(member.id, -Number(creditDelta[member.id] ?? 1))}
                        className="flex items-center gap-1.5 bg-secondary text-foreground/60 px-4 py-2 rounded-xl font-semibold text-xs hover:bg-border/30 transition-colors"
                      >
                        <MinusCircle className="w-4 h-4" /> Aftrekken
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeMember(member.id)}
                    className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Lid verwijderen
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
