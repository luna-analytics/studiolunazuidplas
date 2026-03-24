import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { X, LogIn, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = { isOpen: boolean; onClose: () => void };

export function LoginModal({ isOpen, onClose }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onClose();
      setEmail("");
      setPassword("");
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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-sm bg-background rounded-t-3xl md:rounded-3xl p-6 shadow-2xl mx-0 md:mx-4 z-10"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-foreground/50" />
            </button>

            <div className="mb-6">
              <h2 className="font-display text-2xl font-medium text-foreground mb-1">Inloggen</h2>
              <p className="text-sm text-foreground/55">Toegang tot jouw ledengedeelte</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">E-mailadres</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jouw@email.nl"
                  className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-1.5 block">Wachtwoord</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-secondary border border-border/40 rounded-2xl px-4 py-3 pr-12 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground/70">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Bezig…" : "Inloggen"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
