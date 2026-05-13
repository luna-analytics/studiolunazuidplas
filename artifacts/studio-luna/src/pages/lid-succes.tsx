import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function LidSucces() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"bezig" | "klaar" | "fout">("bezig");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const memberId = params.get("memberId") ?? "";
    const pakketId = params.get("pakketId") ?? "";
    const credits = params.get("credits") ?? "1";

    if (!memberId || !credits) { setStatus("fout"); return; }

    fetch(`${BASE}/api/stripe/lid-pakket-bevestig`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, pakketId, credits }),
    })
      .then((r) => r.ok ? setStatus("klaar") : setStatus("fout"))
      .catch(() => setStatus("fout"));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full text-center space-y-6"
      >
        {status === "bezig" && (
          <>
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
            <p className="text-foreground/60 text-sm">Credits worden bijgeschreven…</p>
          </>
        )}

        {status === "klaar" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-medium text-foreground mb-2">Pakket gekocht!</h1>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Je tegoed is bijgeschreven op je account. Je kunt nu lessen reserveren.
              </p>
            </div>
            <button
              onClick={() => navigate("/rooster")}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Naar het rooster
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {status === "fout" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-medium text-foreground mb-2">Er ging iets mis</h1>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Neem contact op via WhatsApp of e-mail zodat we je credits handmatig kunnen bijschrijven.
              </p>
            </div>
            <button
              onClick={() => navigate("/tarieven")}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Terug naar tarieven
            </button>
          </>
        )}
      </motion.div>
      <BottomNav />
    </div>
  );
}
