import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { Tag, Info, MessageCircleHeart } from "lucide-react";

const tarieven: { label: string; prijs: string; info: string | null; highlight: boolean; community?: boolean }[] = [
  {
    label: "Proefles",
    prijs: "€ 10,-",
    info: null,
    highlight: false,
  },
  {
    label: "Losse les",
    prijs: "€ 22,50",
    info: null,
    highlight: false,
  },
  {
    label: "5-rittenkaart",
    prijs: "€ 105,-",
    info: "2 maanden geldig",
    highlight: false,
    community: true,
  },
  {
    label: "10-rittenkaart",
    prijs: "€ 195,-",
    info: "4 maanden geldig",
    highlight: false,
    community: true,
  },
];

export default function Tarieven() {
  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 ">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        {/* HEADER */}
        <div className="px-6 md:px-12 lg:px-16 pt-14 md:pt-12 pb-12 bg-secondary md:rounded-3xl md:mx-6 md:mt-6 flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">Tarieven</h1>
            <p className="text-foreground/60 mt-2 text-sm leading-relaxed">
              Gun jezelf dit wekelijkse rustmoment tijdens je zwangerschap.
            </p>
          </motion.div>
          <div className="overflow-hidden shrink-0" style={{ height: '82px' }}>
            <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-28 w-auto" />
          </div>
        </div>

        {/* TARIEVEN LIJST */}
        <div className="px-6 md:px-12 lg:px-16 pt-8">
          <div className="md:grid md:grid-cols-2 md:gap-4 space-y-3 md:space-y-0">
            {tarieven.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`rounded-3xl px-5 py-4 border ${
                  item.highlight
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card border-border/30"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.highlight ? "bg-primary/20" : "bg-secondary"
                    }`}>
                      <Tag className={`w-4 h-4 ${item.highlight ? "text-primary" : "text-foreground/40"}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{item.label}</p>
                      {item.info && (
                        <p className="text-xs text-foreground/45 mt-0.5 flex items-center gap-1">
                          <Info className="w-3 h-3" /> {item.info}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-lg font-bold shrink-0 ${item.highlight ? "text-primary" : "text-foreground"}`}>
                    {item.prijs}
                  </span>
                </div>
                {item.community && (
                  <div className="mt-3 pt-3 border-t border-border/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageCircleHeart className="w-3.5 h-3.5 text-accent shrink-0" />
                      <p className="text-xs font-semibold text-foreground">Inclusief toegang tot de Studio Luna WhatsApp-community</p>
                    </div>
                    <p className="text-xs text-foreground/50 leading-relaxed pl-5">
                      Ontvang tips, extra rustmomenten en blijf in verbinding met de andere moeders uit de village.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* VOETNOOT */}
        <div className="mx-6 md:mx-12 lg:mx-16 mt-6 rounded-3xl border border-dashed border-accent/50 bg-accent/10 px-5 py-4 space-y-3 md:max-w-lg">
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">💳 Betaling</p>
            <p className="text-sm text-foreground/65 leading-relaxed">
              Betalen kan contant in de studio of via Tikkie.
            </p>
          </div>
          <p className="text-sm text-foreground/50 leading-relaxed">
            Rittenkaarten zijn persoonlijk en niet overdraagbaar.
          </p>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
