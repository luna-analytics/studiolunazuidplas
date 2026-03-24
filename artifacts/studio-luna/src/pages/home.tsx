import { useState } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { InterestModal } from "@/components/interest-modal";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Coffee, Mail } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const [isInterestOpen, setIsInterestOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 ">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        {/* HEADER */}
        <div className="px-6 md:px-12 lg:px-16 pt-14 md:pt-12 pb-12 bg-secondary md:rounded-3xl md:mx-6 md:mt-6 flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">Aanbod</h1>
          </motion.div>
          <div className="overflow-hidden shrink-0" style={{ height: '82px' }}>
            <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-28 w-auto" />
          </div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-5 space-y-4 mb-8">

          {/* 1 — ZWANGERSCHAPSYOGA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-3xl bg-secondary border border-border/30 p-5"
          >
            <h3 className="font-display text-lg font-medium text-foreground mb-2">Zwangerschapsyoga</h3>
            <p className="text-sm text-foreground/65 leading-relaxed mb-3">
              Sterk, ontspannen en vol vertrouwen richting je bevalling. Met zachte houdingen houden we je veranderende lichaam in balans. We oefenen met ademhaling en maken contact met je baby.
            </p>
            <p className="text-sm text-foreground/65 leading-relaxed mb-3">
              Elke les heeft een net andere focus, zoals het bekken, de kracht van je adem of ruimte in je rug. Instromen is op elk moment mogelijk vanaf 14 weken zwangerschap.
            </p>
            <div className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3 text-sm text-foreground/60 space-y-1 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span>Elke dinsdag 19:00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span>Huize Mooisteen, Pr. Beatrixstraat 2, Nieuwerkerk a/d IJssel</span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span>Na afloop: verse thee en tijd voor verbinding</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/rooster")}
              className="w-full py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              Bekijk het rooster
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* 2 — ZWANGER & MAMA CIRCLE */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl border border-dashed border-accent/60 bg-accent/10 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">Binnenkort</span>
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-0.5">Zwanger & Mama Circle</h3>
            <p className="text-xs text-foreground/45 mb-3">90 min · € 29,-</p>
            <p className="text-sm text-foreground/65 leading-relaxed mb-4">
              Bij Studio Luna geloven we in de kracht van de 'village'. Naast de fysieke lessen creëren we een veilige cirkel waarin je ervaringen deelt, vragen stelt en naar elkaar omkijkt. We gebruiken zachte yoga- en ademhalingsoefeningen om samen te vertragen, zodat er ruimte ontstaat om echt te luisteren naar jezelf en elkaar. Echte verbinding met andere zwangeren en mama's in Zuidplas!
            </p>
            <button
              onClick={() => setIsInterestOpen(true)}
              className="w-full py-2.5 rounded-2xl border border-primary/40 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Houd mij op de hoogte
            </button>
          </motion.div>

          {/* 3 — BEVALLINGS SPECIALS */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-3xl bg-secondary border border-border/30 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">Binnenkort</span>
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-3">Bevallings Specials 🌙</h3>

            <div className="space-y-3 mb-4">
              {[
                { title: "Bevallings Yoga Workshop", sub: "Focus & Vertrouwen", price: "€ 49,-" },
                { title: "Partner Workshop", sub: "Verbinding & Support", price: "€ 79,-" },
                { title: "Mama Spa", sub: "Ultiem ontspannen", price: "€ 49,-" },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-foreground/45 mt-0.5">{item.sub} · 120 min</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3 mb-4">
              <p className="text-sm font-semibold text-foreground mb-0.5">De Geboorte-Bundel</p>
              <p className="text-sm font-semibold text-foreground mb-2">€ 155,- <span className="text-xs font-normal text-foreground/45">(bespaar € 22,-)</span></p>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Boek de drie specials samen voor de meest complete en zachte voorbereiding op jouw reis naar het moederschap. Ideaal tussen je 28e en 36e week.
              </p>
            </div>

            <div className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-foreground mb-1">💡 Tip: Check je zorgverzekering!</p>
              <p className="text-xs text-foreground/55 leading-relaxed">
                Wist je dat veel zorgverzekeraars (een deel van) een cursus geboortevoorbereiding vergoeden vanuit de aanvullende verzekering? Je kunt de factuur van de Bevallings Specials na afloop zelf indienen bij je verzekeraar om te zien of je in aanmerking komt voor een vergoeding.
              </p>
            </div>

            <button
              onClick={() => setIsInterestOpen(true)}
              className="w-full py-2.5 rounded-2xl border border-primary/40 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Houd mij op de hoogte
            </button>
          </motion.div>

        </div>

        <InterestModal isOpen={isInterestOpen} onClose={() => setIsInterestOpen(false)} />
        <BottomNav />
      </div>
    </div>
  );
}
