import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function PakketSucces() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"bezig" | "klaar" | "fout">("bezig");
  const [heeftAccount, setHeeftAccount] = useState(false);
  const [pakketNaam, setPakketNaam] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name") ?? "";
    const email = params.get("email") ?? "";
    const pakketId = params.get("pakketId") ?? "";
    const classId = params.get("classId") ?? "";
    const classTitle = params.get("classTitle") ?? "";
    const dateStr = params.get("dateStr") ?? "";
    const time = params.get("time") ?? "";
    const type = params.get("type") ?? "";
    const credits = params.get("credits") ?? "1";

    if (!name || !email || !classId || !classTitle || !dateStr || !time || !type) {
      setStatus("fout");
      return;
    }

    const labels: Record<string, string> = { proefles: "Proefles", losse_les: "Losse les" };
    setPakketNaam(labels[pakketId] ?? pakketId);

    fetch(`${BASE}/api/stripe/pakket-bevestig`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, pakketId, classId, classTitle, dateStr, time, type, credits }),
    })
      .then(async (r) => {
        if (r.ok) {
          const d = await r.json();
          setHeeftAccount(!!d.heeftAccount);
          setStatus("klaar");
        } else {
          setStatus("fout");
        }
      })
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
            <p className="text-foreground/60 text-sm">Betaling bevestigen…</p>
          </>
        )}

        {status === "klaar" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-medium text-foreground mb-2">Betaling geslaagd!</h1>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Je reservering is bevestigd. Je ontvangt een bevestigingsmail.
              </p>
              {!heeftAccount && (pakketNaam.includes("rittenkaart") || pakketNaam.includes("rit")) && (
                <div className="mt-4 bg-secondary rounded-2xl px-4 py-3 text-left">
                  <p className="text-xs font-semibold text-foreground mb-1">Maak een gratis account aan</p>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    Sla je rittenkaart op in je account en boek toekomstige lessen eenvoudig terug.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/rooster")}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Terug naar het rooster
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
                Neem contact op via WhatsApp of e-mail zodat we je reservering handmatig kunnen bevestigen.
              </p>
            </div>
            <button
              onClick={() => navigate("/rooster")}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Terug naar het rooster
            </button>
          </>
        )}
      </motion.div>
      <BottomNav />
    </div>
  );
}
