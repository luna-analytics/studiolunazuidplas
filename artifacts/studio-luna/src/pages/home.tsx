import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { InterestModal } from "@/components/interest-modal";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Coffee, Mail, ClipboardList } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const DEFAULT_TEKSTEN = {
  aanbod_yoga_tekst1: "Sterk, ontspannen en vol vertrouwen richting je bevalling. Met zachte houdingen houden we je veranderende lichaam in balans. We oefenen met ademhaling en maken contact met je baby.",
  aanbod_yoga_tekst2: "Elke les heeft een net andere focus, zoals het bekken, de kracht van je adem of ruimte in je rug. Instromen is op elk moment mogelijk vanaf 14 weken zwangerschap.",
  aanbod_yoga_tijd: "Elke dinsdag 19:00",
  aanbod_yoga_locatie: "Huize Mooisteen, Pr. Beatrixstraat 2, Nieuwerkerk a/d IJssel",
  aanbod_yoga_extra: "Na afloop: verse thee en tijd voor verbinding",
  aanbod_circle_titel: "Zwanger & Mama Circle",
  aanbod_circle_tekst: "Bij Studio Luna geloven we in de kracht van de 'village'. Naast de fysieke lessen creëren we een veilige cirkel waarin je ervaringen deelt, vragen stelt en naar elkaar omkijkt. We gebruiken zachte yoga- en ademhalingsoefeningen om samen te vertragen, zodat er ruimte ontstaat om echt te luisteren naar jezelf en elkaar. Echte verbinding met andere zwangeren en mama's in Zuidplas!",
};

export default function Home() {
  const [, navigate] = useLocation();
  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const [teksten, setTeksten] = useState(DEFAULT_TEKSTEN);

  useEffect(() => {
    fetch(`${BASE}/api/pagina-teksten`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setTeksten((prev) => ({ ...prev, ...d })); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        {/* HEADER */}
        <div className="px-6 md:px-12 lg:px-16 pt-14 md:pt-12 pb-10 bg-secondary md:rounded-3xl md:mx-6 md:mt-6 flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1.5">Studio Luna</p>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">Aanbod</h1>
            <p className="text-foreground/55 text-sm mt-1.5">Zwangerschapsyoga · Circles · Workshops</p>
          </motion.div>
          <div className="overflow-hidden shrink-0" style={{ height: '95px' }}>
            <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-32 w-auto" />
          </div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-6 space-y-5 mb-8">

          {/* 1 — ZWANGERSCHAPSYOGA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-3xl bg-card border border-border/25 shadow-sm overflow-hidden"
          >
            {/* Afbeelding */}
            <div className="relative w-full overflow-hidden" style={{ paddingTop: "45%" }}>
              <img
                src={`${BASE}/images/hero-yoga.png`}
                alt="Zwangerschapsyoga Studio Luna"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/10 to-transparent" />
              <div className="absolute bottom-3 left-5">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/15 text-primary px-2.5 py-1 rounded-full">
                  Zwangerschapsyoga
                </span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-display text-xl font-medium text-foreground mb-2">Zwangerschapsyoga</h3>
              <p className="text-sm text-foreground/65 leading-relaxed mb-2">{teksten.aanbod_yoga_tekst1}</p>
              <p className="text-sm text-foreground/65 leading-relaxed mb-4">{teksten.aanbod_yoga_tekst2}</p>

              <div className="rounded-2xl bg-secondary border border-border/20 px-4 py-3 text-sm text-foreground/60 space-y-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span>{teksten.aanbod_yoga_tijd}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span>{teksten.aanbod_yoga_locatie}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Coffee className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span>{teksten.aanbod_yoga_extra}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => navigate("/rooster")}
                  className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-200 shadow-sm group"
                >
                  Bekijk het rooster
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
                <a
                  href="https://tally.so/r/XxED7j"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-2xl border border-border/40 text-foreground/70 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-secondary hover:border-primary/30 hover:text-primary transition-all duration-200"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Vul je intake in
                </a>
              </div>
            </div>
          </motion.div>

          {/* 2 — MAMA CIRCLE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl bg-card border border-border/25 shadow-sm overflow-hidden"
          >
            <div className="bg-accent/20 px-5 pt-5 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-foreground/60">Community</span>
              <h3 className="font-display text-xl font-medium text-foreground mt-1">{teksten.aanbod_circle_titel}</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-foreground/65 leading-relaxed mb-4">{teksten.aanbod_circle_tekst}</p>
              <button
                onClick={() => setIsInterestOpen(true)}
                className="w-full py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/15 hover:border-primary/40 transition-all duration-200"
              >
                <Mail className="w-4 h-4" />
                Houd mij op de hoogte
              </button>
            </div>
          </motion.div>

          {/* 3 — BEVALLINGS SPECIALS */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-3xl bg-card border border-border/25 shadow-sm overflow-hidden"
          >
            <div className="bg-secondary px-5 pt-5 pb-4 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">Binnenkort</span>
                <h3 className="font-display text-xl font-medium text-foreground mt-1">Bevallings Specials 🌙</h3>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {[
                  { title: "Bevallings Yoga Workshop", sub: "Focus & Vertrouwen", price: "€ 49,-" },
                  { title: "Partner Workshop", sub: "Verbinding & Support", price: "€ 79,-" },
                  { title: "Mama Spa", sub: "Ultiem ontspannen", price: "€ 49,-" },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-secondary border border-border/20 px-4 py-3.5">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-foreground/45 mt-0.5">{item.sub} · 120 min</p>
                    <p className="text-sm font-bold text-primary mt-2">{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-primary/5 border border-primary/15 px-4 py-3.5 mb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">De Geboorte-Bundel</p>
                    <p className="text-xs text-foreground/55 mt-0.5 leading-relaxed">
                      Boek de drie workshops samen voor de meest complete voorbereiding. Ideaal tussen de 28e en 36e week.
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-bold text-primary">€ 155,-</p>
                    <p className="text-[10px] text-foreground/40">bespaar € 22,-</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-secondary border border-border/20 px-4 py-3 mb-4">
                <p className="text-xs font-semibold text-foreground mb-0.5">💡 Check je zorgverzekering</p>
                <p className="text-xs text-foreground/55 leading-relaxed">
                  Veel verzekeraars vergoeden (een deel van) geboortevoorbereiding vanuit de aanvullende verzekering.
                </p>
              </div>

              <button
                onClick={() => setIsInterestOpen(true)}
                className="w-full py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/15 hover:border-primary/40 transition-all duration-200"
              >
                <Mail className="w-4 h-4" />
                Houd mij op de hoogte
              </button>
            </div>
          </motion.div>

        </div>

        <InterestModal isOpen={isInterestOpen} onClose={() => setIsInterestOpen(false)} />
        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
