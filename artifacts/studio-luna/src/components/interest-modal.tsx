import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InterestModal({ isOpen, onClose }: InterestModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/interests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Er ging iets mis");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Kan geen verbinding maken. Probeer het opnieuw.");
      setStatus("error");
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setEmail("");
      setErrorMsg("");
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
          >
            <div className="w-full max-w-md bg-background rounded-t-3xl px-6 pt-6 pb-12 shadow-2xl">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-display text-xl font-medium text-foreground">Houd mij op de hoogte</h3>
                  <p className="text-sm text-foreground/60 mt-1">Laat je e-mailadres achter en we laten je weten zodra een Mama Circle start of de bevallings workshops starten.</p>
                </div>
                <button onClick={handleClose} className="text-foreground/40 hover:text-foreground ml-4 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {status === "success" ? (
                <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center">
                  <p className="text-2xl mb-2">🌙</p>
                  <p className="font-semibold text-foreground mb-1">Fijn, je staat op de lijst!</p>
                  <p className="text-sm text-foreground/60">We laten je weten zodra er genoeg animo is.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jouw@email.nl"
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-border/60 bg-card/60 text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                  {status === "error" && (
                    <p className="text-xs text-red-500">{errorMsg}</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3 rounded-2xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-opacity disabled:opacity-60"
                  >
                    {status === "loading" ? "Bezig…" : "Meld mij aan ✨"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
