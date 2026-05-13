import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function WachtwoordReset() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Wachtwoorden komen niet overeen."); return; }
    if (password.length < 6) { setError("Wachtwoord moet minimaal 6 tekens zijn."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/wachtwoord-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis.");
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full space-y-6"
      >
        <div className="text-center">
          <img
            src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`}
            alt="Studio Luna"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="font-display text-2xl font-medium text-foreground">Nieuw wachtwoord</h1>
          <p className="text-foreground/60 text-sm mt-1">Kies een nieuw wachtwoord voor je account.</p>
        </div>

        {done ? (
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">
              Je wachtwoord is opgeslagen. Je kunt nu inloggen.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Naar de app
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">Nieuw wachtwoord</label>
              <div className="relative">
                <input
                  required type={show ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimaal 6 tekens"
                  className="w-full bg-secondary border border-border/40 rounded-2xl px-4 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">Herhaal wachtwoord</label>
              <input
                required type={show ? "text" : "password"}
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="Zelfde wachtwoord"
                className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {loading ? "Opslaan…" : "Wachtwoord opslaan"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
