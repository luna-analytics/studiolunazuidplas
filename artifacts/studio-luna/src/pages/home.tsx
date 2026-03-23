import { useState } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { InterestModal } from "@/components/interest-modal";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Coffee, Sparkles, Mail } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const [isInterestOpen, setIsInterestOpen] = useState(false);

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

        {/* ONS AANBOD */}
        <div className="px-6 pt-8 pb-2">
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <h2 className="font-display text-2xl font-medium text-foreground mb-1">Ons aanbod</h2>
            <p className="text-sm text-foreground/50">Wat Studio Luna voor jou in huis heeft.</p>
          </motion.div>
        </div>

        <div className="px-6 pt-5 space-y-4 mb-6">

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

          {/* 2 — ZWANGER & MAMA CIRCLES */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl border border-dashed border-accent/60 bg-accent/10 p-5"
          >
            <h3 className="font-display text-lg font-medium text-foreground mb-2">Zwanger & Mama Circle</h3>
            <p className="text-sm text-foreground/65 leading-relaxed">
              Bij Studio Luna geloven we in de kracht van de 'village'. Naast de fysieke lessen creëren we een veilige cirkel waarin je ervaringen deelt, vragen stelt en vriendschappen sluit. De thee staat altijd klaar. ☕️
            </p>
          </motion.div>

          {/* 3 — BEVALLINGS SPECIALS */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-3xl bg-secondary border border-border/30 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">Binnenkort</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/30 text-accent-foreground font-semibold">Bij genoeg animo</span>
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-1">Bevallings Specials 🌙</h3>
            <p className="text-sm text-foreground/55 mb-4">Los te boeken of als bundel (€ 155,- · Tribe Members € 145,-).</p>

            <div className="space-y-3 mb-4">
              {[
                {
                  title: "Focus & Vertrouwen",
                  sub: "De Beval-yoga workshop",
                  description: "Ademhaling, visualisatie en natuurlijke bevalhoudingen.",
                  price: "€ 45,-",
                },
                {
                  title: "Verbinding & Support",
                  sub: "De Partner-workshop",
                  description: "Jouw partner als anker, zachte aanraking en samenwerken als team.",
                  price: "€ 75,-",
                },
                {
                  title: "De Mama Spa",
                  sub: "Ultiem ontspannen",
                  description: "Restorative yoga, zelfmassage en volledige ontspanning.",
                  price: "€ 45,-",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-foreground/45">{item.sub} · 120 min</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">{item.price}</span>
                  </div>
                  <p className="text-xs text-foreground/60 mt-1.5">{item.description}</p>
                </div>
              ))}
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
