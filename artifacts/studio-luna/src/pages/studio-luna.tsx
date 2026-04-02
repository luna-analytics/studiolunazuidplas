import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { motion } from "framer-motion";
import { MapPin, Heart, Sparkles, Users, ArrowRight, Mail, Phone, Instagram } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const DEFAULT_TEKSTEN = {
  home_hero: "It takes a village.\nStudio Luna is jouw mama tribe.",
  home_missie_tekst:
    "Het moederschap hoef je niet alleen te doen. De missie van Studio Luna is het faciliteren van een community voor alle vrouwen in Nieuwerkerk aan den IJssel en omgeving, van zwangerschap tot ver daarna. Een veilige haven om fysiek op te laden, mentaal tot rust te komen en bovenal in verbinding te staan met andere moeders in dezelfde fase.",
  home_missie_bullets:
    "Een plek om te landen.\nEen plek om fysiek sterk, gezond en in balans te blijven.\nEen plek om vertrouwen te vinden in je veranderende lichaam.\nEen plek om te connecten met andere moeders.\nStudio Luna is jouw mama tribe.",
};


export default function StudioLuna() {
  const [, navigate] = useLocation();
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

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
          className="relative overflow-hidden md:mx-6 md:mt-6 md:rounded-3xl"
          style={{ minHeight: 380 }}
        >
          <img
            src={`${BASE}/images/hero-yoga.png`}
            alt="Zwangerschapsyoga Studio Luna"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70 md:bg-gradient-to-r md:from-black/60 md:via-black/30 md:to-transparent" />

          <div className="relative z-10 flex flex-col justify-end md:justify-center px-6 md:px-12 lg:px-16 pt-20 pb-10 md:py-16 min-h-[380px]">
            <div className="md:max-w-lg">
              <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3"
              >
                Nieuwerkerk aan den IJssel · Zuidplas
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="font-display text-4xl md:text-5xl font-medium text-white leading-[1.15] mb-5"
              >
                {teksten.home_hero.split("\n").map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <button
                  onClick={() => navigate("/rooster")}
                  className="inline-flex items-center gap-2 bg-white text-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-white/90 transition-all duration-200 shadow-md group"
                >
                  Reserveer jouw plekje
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate("/aanbod")}
                  className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-white/25 transition-all duration-200"
                >
                  Bekijk aanbod
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>


        {/* ── DE MISSIE ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="px-6 md:px-12 lg:px-16 pt-14 pb-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Heart className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-medium text-foreground">De missie</h2>
          </div>

          <div className="md:grid md:grid-cols-2 md:gap-14 md:items-start">
            <ul className="space-y-4 mb-8 md:mb-0">
              {teksten.home_missie_bullets.split("\n").filter(Boolean).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/70 leading-[1.85]">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div>
              <p className="text-sm text-foreground/60 leading-[1.85]">
                {teksten.home_missie_tekst}
              </p>
              <p className="text-sm font-semibold text-foreground/75 mt-5 tracking-wide">Welkom in jouw village.</p>
            </div>
          </div>
        </motion.div>

        {/* ── WAT BIEDT STUDIO LUNA ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
          className="mx-6 md:mx-12 lg:mx-16 rounded-3xl bg-secondary px-7 py-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-7">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-medium text-foreground">Wat biedt Studio Luna</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              "Kleine groepen, veel aandacht en persoonlijk contact.",
              "Zwangerschapsyoga: bevalling voorbereiden, kracht van de adem en fysieke balans.",
              "Na afloop altijd tijd voor een kopje thee en verbinding.",
              "Instromen mogelijk vanaf 14 weken zwangerschap.",
              "WhatsApp-community voor vragen en tips tussen lessen door.",
              "Aandacht voor zowel het fysieke als het mentale aspect van moederschap.",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-background/50 rounded-2xl px-4 py-4 border border-border/15 shadow-soft">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary font-bold text-xs">{i + 1}</span>
                <p className="text-sm text-foreground/65 leading-[1.8]">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── LOCATIE & CONTACT ── */}
        <div className="px-6 md:px-12 lg:px-16 mb-14 md:grid md:grid-cols-2 md:gap-5">

          <motion.div
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="card-luxe mb-4 md:mb-0"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-foreground/60" />
              </div>
              <h2 className="font-display text-lg font-medium text-foreground">Locatie</h2>
            </div>
            <p className="text-foreground/65 text-sm leading-[1.85]">
              Onze lessen vinden plaats bij <span className="font-semibold text-foreground/80">Huize Mooisteen</span>
            </p>
            <p className="text-foreground/50 text-sm mt-2">Pr. Beatrixstraat 2, Nieuwerkerk aan den IJssel</p>
            <a href="https://maps.google.com/?q=Pr.+Beatrixstraat+2,+Nieuwerkerk+aan+den+IJssel"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-primary group">
              <MapPin className="w-3.5 h-3.5" />
              Bekijk op kaart
              <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            className="card-luxe"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5 text-foreground/60" />
              </div>
              <h2 className="font-display text-lg font-medium text-foreground">Contact</h2>
            </div>
            <div className="space-y-4">
              <a href="mailto:info@studiolunazuidplas.nl"
                className="flex items-center gap-3 text-sm text-foreground/65 hover:text-foreground group">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>info@studiolunazuidplas.nl</span>
              </a>
              <a href="https://wa.me/31643735343" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-foreground/65 hover:text-foreground group">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+31 6 43 73 53 43</span>
              </a>
              <a href="https://www.instagram.com/studiolunazuidplas" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-foreground/65 hover:text-foreground group">
                <Instagram className="w-4 h-4 text-primary shrink-0" />
                <span>@studiolunazuidplas</span>
              </a>
            </div>
          </motion.div>

        </div>

        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
