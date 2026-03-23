import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { Tag, Info } from "lucide-react";

const tarieven = [
  {
    label: "Proefles",
    prijs: "€ 10,-",
    info: "Maak kennis met Studio Luna",
    highlight: true,
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
  },
  {
    label: "10-rittenkaart",
    prijs: "€ 195,-",
    info: "4 maanden geldig",
    highlight: false,
  },
];

export default function Tarieven() {
  return (
    <div className="min-h-screen bg-background pb-28 flex justify-center">
      <div className="w-full max-w-md bg-background min-h-screen relative shadow-2xl shadow-black/5 md:border-x border-border/30">

        {/* HEADER */}
        <div className="px-6 pt-12 pb-8 bg-secondary rounded-b-[2.5rem]">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Studio Luna</p>
            <h1 className="font-display text-3xl font-medium text-foreground">Tarieven</h1>
            <p className="text-foreground/60 mt-2 text-sm leading-relaxed">
              Gun jezelf dit wekelijkse rustmoment tijdens je zwangerschap.
            </p>
          </motion.div>
        </div>

        {/* TARIEVEN LIJST */}
        <div className="px-6 pt-8 space-y-3">
          {tarieven.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-3xl px-5 py-4 flex items-center justify-between border ${
                item.highlight
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card border-border/30"
              }`}
            >
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
              <span className={`text-lg font-bold ${item.highlight ? "text-primary" : "text-foreground"}`}>
                {item.prijs}
              </span>
            </motion.div>
          ))}
        </div>

        {/* VOETNOOT */}
        <div className="mx-6 mt-6 rounded-3xl border border-dashed border-accent/50 bg-accent/10 px-5 py-4">
          <p className="text-sm text-foreground/65 leading-relaxed">
            ✨ Start met de proefles op <strong>28 april</strong> en ontdek of Studio Luna iets voor jou is. Rittenkaarten zijn persoonlijk en niet overdraagbaar.
          </p>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
