import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { X, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Props = { isOpen: boolean; onClose: () => void; defaultMode?: "login" | "register" };

export function LoginModal({ isOpen, onClose, defaultMode = "login" }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "vergeten">(defaultMode);

  useEffect(() => {
    if (isOpen) setMode(defaultMode);
  }, [isOpen, defaultMode]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vergetenVerzonden, setVergetenVerzonden] = useState(false);

  const reset = () => {
    setName(""); setEmail(""); setPassword(""); setError(""); setShowPw(false); setVergetenVerzonden(false);
  };

  const switchMode = (m: "login" | "register" | "vergeten") => {
    reset();
    setMode(m);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        handleClose();
      } else if (mode === "register") {
        await register(name, email, password);
        handleClose();
      } else {
        // wachtwoord vergeten
        await fetch(`${BASE}/api/auth/wachtwoord-vergeten`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setVergetenVerzonden(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            className="relative w-full max-w-sm bg-background rounded-t-3xl md:rounded-3xl p-6 shadow-2xl mx-0 md:mx-4 z-10"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-foreground/50" />
            </button>

            {/* TAB SWITCHER (alleen bij login/register) */}
            {mode !== "vergeten" && (
              <div className="flex rounded-2xl bg-secondary p-1 mb-6">
                <button
                  onClick={() => switchMode("login")}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${mode === "login" ? "bg-background shadow-sm text-foreground" : "text-foreground/50"}`}
                >
                  Inloggen
                </button>
                <button
                  onClick={() => switchMode("register")}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${mode === "register" ? "bg-background shadow-sm text-foreground" : "text-foreground/50"}`}
                >
                  Registreren
                </button>
              </div>
            )}

            <div className="mb-5">
              <h2 className="font-display text-2xl font-medium text-foreground mb-1">
                {mode === "login" ? "Welkom terug" : mode === "register" ? "Account aanmaken" : "Wachtwoord vergeten"}
              </h2>
              <p className="text-sm text-foreground/55">
                {mode === "login" ? "Toegang tot jouw ledengedeelte"
                  : mode === "register" ? "Gratis registreren en proefles inboeken"
                  : "Vul je e-mailadres in — je ontvangt een resetlink."}
              </p>
            </div>

            {/* VERGETEN: bevestiging */}
            {mode === "vergeten" && vergetenVerzonden ? (
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-4 text-center">
                  <p className="text-sm font-semibold text-primary mb-1">E-mail verstuurd</p>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    Als je e-mailadres bekend is bij ons, ontvang je een resetlink. Controleer ook je spam.
                  </p>
                </div>
                <button onClick={() => switchMode("login")}
                  className="w-full text-sm text-foreground/50 hover:text-foreground/80 underline underline-offset-2">
                  Terug naar inloggen
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "register" && (
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">Naam</label>
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)} required
                      placeholder="Jouw naam"
                      className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">E-mailadres</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="jouw@email.nl"
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {mode !== "vergeten" && (
                  <div>
                    <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">Wachtwoord</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                        placeholder={mode === "register" ? "Minimaal 6 tekens" : "••••••••"}
                        className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 pr-12 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground/70">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <p className="text-xs text-foreground/50 text-right -mt-1">
                    <button type="button" onClick={() => switchMode("vergeten")} className="text-primary underline underline-offset-2 hover:text-primary/80">
                      Wachtwoord vergeten?
                    </button>
                  </p>
                )}

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{error}</p>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {mode === "login" ? <LogIn className="w-4 h-4" /> : mode === "register" ? <UserPlus className="w-4 h-4" /> : null}
                  {loading ? "Bezig…" : mode === "login" ? "Inloggen" : mode === "register" ? "Account aanmaken" : "Resetlink versturen"}
                </button>

                {mode === "vergeten" && (
                  <button type="button" onClick={() => switchMode("login")}
                    className="w-full text-sm text-foreground/40 hover:text-foreground/70 underline underline-offset-2">
                    Terug naar inloggen
                  </button>
                )}
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
