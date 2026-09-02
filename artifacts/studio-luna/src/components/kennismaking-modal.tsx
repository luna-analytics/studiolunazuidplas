import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Laagdrempelige tussenstap tussen "niets doen" en de hele reeks boeken:
// een vraag stellen of even telefonisch kennismaken. Marjolein neemt zelf
// contact op, dus het telefoonnummer mag, maar hoeft niet.

interface KennismakingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KennismakingModal({ isOpen, onClose }: KennismakingModalProps) {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [bericht, setBericht] = useState("");
  const [status, setStatus] = useState<"idle" | "bezig" | "klaar" | "fout">("idle");
  const [foutmelding, setFoutmelding] = useState("");

  const verstuur = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("bezig");
    setFoutmelding("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/kennismaking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam, email, telefoon, bericht }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFoutmelding(data.error ?? "Er ging iets mis, probeer het nog eens");
        setStatus("fout");
      } else {
        setStatus("klaar");
      }
    } catch {
      setFoutmelding("Kan geen verbinding maken, probeer het nog eens");
      setStatus("fout");
    }
  };

  const sluit = () => {
    onClose();
    setTimeout(() => {
      setStatus("idle");
      setNaam("");
      setEmail("");
      setTelefoon("");
      setBericht("");
      setFoutmelding("");
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
            onClick={sluit}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kennismaking-titel"
          >
            <div className="w-full max-w-md bg-background rounded-t-3xl px-6 pt-6 pb-12 shadow-2xl">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 id="kennismaking-titel" className="font-display text-xl font-medium text-foreground">
                    Even contact
                  </h3>
                  <p className="text-sm text-foreground/60 mt-1">
                    Laat hieronder achter hoe ik je kan bereiken, dan neem ik contact met je op.
                  </p>
                </div>
                <button onClick={sluit} aria-label="Sluiten"
                  className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center rounded-2xl text-foreground/60 hover:text-foreground ml-2 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {status === "klaar" ? (
                <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5">
                  <p className="font-semibold text-foreground mb-1">Dankjewel, je bericht is bij mij binnen.</p>
                  <p className="text-sm text-foreground/60">
                    Ik neem binnen één werkdag contact met je op.
                  </p>
                </div>
              ) : (
                <form onSubmit={verstuur} className="space-y-3">
                  <div>
                    <label htmlFor="kennismaking-naam" className="block text-xs font-semibold text-foreground/70 mb-1.5">
                      Je naam
                    </label>
                    <input
                      id="kennismaking-naam"
                      type="text"
                      value={naam}
                      onChange={(e) => setNaam(e.target.value)}
                      placeholder="Je naam"
                      required
                      maxLength={120}
                      className="w-full px-4 py-3 rounded-2xl border border-border/60 bg-card/60 text-foreground placeholder:text-foreground/55 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="kennismaking-email" className="block text-xs font-semibold text-foreground/70 mb-1.5">
                      E-mailadres
                    </label>
                    <input
                      id="kennismaking-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jouw@email.nl"
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-border/60 bg-card/60 text-foreground placeholder:text-foreground/55 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="kennismaking-telefoon" className="block text-xs font-semibold text-foreground/70 mb-1.5">
                      Telefoonnummer <span className="font-normal text-foreground/50">(als je liever gebeld wordt)</span>
                    </label>
                    <input
                      id="kennismaking-telefoon"
                      type="tel"
                      value={telefoon}
                      onChange={(e) => setTelefoon(e.target.value)}
                      placeholder="06 12345678"
                      maxLength={40}
                      className="w-full px-4 py-3 rounded-2xl border border-border/60 bg-card/60 text-foreground placeholder:text-foreground/55 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="kennismaking-bericht" className="block text-xs font-semibold text-foreground/70 mb-1.5">
                      Je berichtje
                    </label>
                    <textarea
                      id="kennismaking-bericht"
                      value={bericht}
                      onChange={(e) => setBericht(e.target.value)}
                      placeholder="Waar kan ik je mee helpen?"
                      required
                      rows={3}
                      maxLength={1000}
                      className="w-full px-4 py-3 rounded-2xl border border-border/60 bg-card/60 text-foreground placeholder:text-foreground/55 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  {status === "fout" && <p className="text-xs text-red-500">{foutmelding}</p>}
                  <button
                    type="submit"
                    disabled={status === "bezig"}
                    className="w-full py-3 rounded-2xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-opacity disabled:opacity-60"
                  >
                    {status === "bezig" ? "Versturen…" : "Verstuur mijn berichtje"}
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
