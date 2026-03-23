import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Coffee, Sparkles } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-28 flex justify-center">
      <div className="w-full max-w-md bg-background min-h-screen relative shadow-2xl shadow-black/5 md:border-x border-border/30">

        {/* HERO */}
        <div className="relative pt-12 pb-10 px-6 rounded-b-[2.5rem] bg-secondary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-secondary/90 to-secondary" />
          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <img
                src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`}
                alt="Studio Luna"
                className="h-40 w-auto mb-5 object-contain mx-auto block"
              />
              <h1 className="font-display text-4xl font-medium text-foreground leading-[1.15] mb-3">
                It takes a village.<br />Studio Luna is jouw mama tribe.
              </h1>
              <p className="text-foreground/65 leading-relaxed mb-6">
                Een plek om te ontspannen, te bewegen en te connecten — met jezelf, je baby én andere vrouwen.
              </p>
              <button
                onClick={() => navigate("/rooster")}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all group"
              >
                Reserveer jouw plekje
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* QUICK INFO STRIP */}
        <div className="mx-6 mt-6 rounded-2xl border border-border/40 bg-card/60 px-4 py-3 grid grid-cols-2 gap-x-3 gap-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Calendar className="w-4 h-4 shrink-0 text-primary" />
            <span>Elke dinsdag 19:00</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <MapPin className="w-4 h-4 shrink-0 text-primary" />
            <span>Pr. Beatrixstraat 2, Nieuwerkerk a/d IJssel</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Sparkles className="w-4 h-4 shrink-0 text-primary" />
            <span>Proefles € 10,-</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Coffee className="w-4 h-4 shrink-0 text-primary" />
            <span>Inclusief thee</span>
          </div>
        </div>

        {/* OVER DE LES */}
        <div className="px-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-2xl font-medium mb-3">Sterk, ontspannen en vol vertrouwen</h2>
            <p className="text-foreground/65 leading-relaxed mb-3">
              Een moment van rust in een mooie maar ook intense periode. Met zachte houdingen houden we je veranderende lichaam sterk en flexibel.
            </p>
            <p className="text-foreground/65 leading-relaxed">
              Je leert luisteren naar de signalen van je lijf, we oefenen met de ademhaling en maken contact met je baby. Zodat jij vol vertrouwen richting de bevalling gaat.
            </p>
          </motion.div>
        </div>

        {/* DE LOCATIE */}
        <div className="mx-6 mt-6 rounded-3xl bg-secondary/80 border border-border/30 p-5">
          <h3 className="font-semibold text-foreground mb-1">📍 Huize Mooisteen</h3>
          <p className="text-xs text-foreground/45 mb-2">Pr. Beatrixstraat 2, 2911 AL Nieuwerkerk aan den IJssel</p>
          <p className="text-sm text-foreground/65 leading-relaxed">
            Met vloerverwarming, zacht dimbaar licht en alle yoga props (kussens, blokken en dekens) die al voor je klaarliggen. Je hoeft alleen jezelf mee te brengen. 🤍
          </p>
        </div>

        {/* NA DE LES */}
        <div className="mx-6 mt-4 mb-6 rounded-3xl border border-dashed border-accent/60 bg-accent/10 p-5">
          <h3 className="font-semibold text-foreground mb-2">☕️ Na de les</h3>
          <p className="text-sm text-foreground/65 leading-relaxed">
            Je hoeft na de les niet meteen naar huis. Er is tijd voor verse thee en verbinden met andere (aanstaande) mama's. Een veilige plek om ervaringen te delen, herkenning te vinden en samen op te laden. Je hoeft het niet alleen te doen.
          </p>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
