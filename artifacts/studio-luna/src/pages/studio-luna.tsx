import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { motion } from "framer-motion";
import { MapPin, Heart, ArrowRight, Mail, Phone, Instagram } from "lucide-react";
import { IMAGES } from "@/lib/images";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const DEFAULT_TEKSTEN = {
  home_hero: "It takes a village.\nStudio Luna is jouw mama tribe.",
  home_missie_heading: "Een plek om\nte landen.",
  home_missie_tekst: "Het moederschap hoef je niet alleen te doen. De missie van Studio Luna is het faciliteren van een community voor alle vrouwen in Nieuwerkerk aan den IJssel en omgeving, van zwangerschap tot ver daarna. Een veilige haven om fysiek op te laden, mentaal tot rust te komen en bovenal in verbinding te staan met andere moeders in dezelfde fase.",
  home_missie_bullets: "Een plek om te landen.\nEen plek om fysiek sterk, gezond en in balans te blijven.\nEen plek om vertrouwen te vinden in je veranderende lichaam.\nEen plek om te connecten met andere moeders.\nStudio Luna is jouw mama tribe.",
  home_village_tagline: "Welkom in jouw village.",
  home_aanbod_heading: "Alles wat je nodig hebt\nop weg naar de bevalling.",
  home_aanbod_items: "Kleine groepen, veel aandacht en persoonlijk contact.\nZwangerschapsyoga: bevalling voorbereiden, kracht van de adem en fysieke balans.\nNa afloop altijd tijd voor een kopje thee en verbinding.\nInstromen mogelijk vanaf 14 weken zwangerschap.\nWhatsApp-community voor vragen en tips tussen lessen door.\nAandacht voor zowel het fysieke als het mentale aspect van moederschap.",
  home_locatie_naam: "Huize Mooisteen",
  home_locatie_adres: "Pr. Beatrixstraat 2\nNieuwerkerk aan den IJssel",
  home_contact_email: "info@studiolunazuidplas.nl",
  home_contact_telefoon: "+31 6 43 73 53 43",
  home_contact_instagram: "@studiolunazuidplas",
  foto_hero: "",
  foto_hero_positie: "center",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1], delay },
  }),
};

export default function StudioLuna() {
  const [, navigate] = useLocation();
  const [teksten, setTeksten] = useState(DEFAULT_TEKSTEN);
  const [photosReady, setPhotosReady] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/pagina-teksten`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setTeksten((prev) => ({ ...prev, ...d })); })
      .catch(() => {})
      .finally(() => setPhotosReady(true));
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative overflow-x-hidden">

        {/* ── HERO — full-bleed, tekst zweeft over foto ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          className="relative overflow-hidden md:mx-6 md:mt-6 md:rounded-3xl"
          style={{ minHeight: 420 }}
        >
          <img
            src={photosReady ? (teksten.foto_hero || IMAGES.hero) : undefined}
            alt="Zwangerschapsyoga Studio Luna"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{
              objectPosition: teksten.foto_hero_positie || "center",
              opacity: photosReady ? 1 : 0,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75 md:bg-gradient-to-r md:from-black/65 md:via-black/35 md:to-transparent" />

          <div className="relative z-10 flex flex-col justify-end md:justify-center px-7 md:px-14 lg:px-18 pt-24 pb-12 md:py-20 min-h-[420px]">
            <div className="md:max-w-lg">
              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/55 mb-4"
              >
                Nieuwerkerk aan den IJssel · Zuidplas
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="font-display text-[2.6rem] md:text-5xl font-medium text-white leading-[1.1] mb-7"
              >
                {teksten.home_hero.split("\n").map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="flex flex-wrap gap-3"
              >
                <button
                  onClick={() => navigate("/rooster")}
                  className="inline-flex items-center gap-2 bg-white text-foreground px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-white/92 shadow-md group"
                >
                  Reserveer jouw plekje
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate("/aanbod")}
                  className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-sm border border-white/25 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-white/22"
                >
                  Bekijk aanbod
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── MISSIE — editorial: label + grote heading + asymmetrisch ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-24 md:py-32">
          {/* Subtiele achtergrond-overgang */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background pointer-events-none" />

          <div className="relative">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} custom={0}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                De missie
              </p>
            </motion.div>

            <div className="md:grid md:grid-cols-[1fr_1.2fr] md:gap-20 md:items-start">

              {/* Linker kolom — bullets + quote */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-80px" }} custom={0.1}
              >
                <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1] mb-10">
                  {teksten.home_missie_heading.split("\n").map((line, i, arr) => (
                    <span key={i}>{i === arr.length - 1
                      ? <em className="not-italic text-primary">{line}</em>
                      : <>{line}<br /></>}
                    </span>
                  ))}
                </h2>
                <ul className="space-y-5">
                  {teksten.home_missie_bullets.split("\n").filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-[15px] text-foreground/65 leading-[1.9]">
                      <span className="mt-[11px] w-1 h-1 rounded-full bg-primary/70 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Rechter kolom — tekst, iets verlaagd voor dynamiek */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-80px" }} custom={0.2}
                className="md:pt-20"
              >
                <p className="text-[15px] text-foreground/55 leading-[1.95]">
                  {teksten.home_missie_tekst}
                </p>
                <p className="mt-8 text-sm font-semibold text-foreground/60 tracking-widest uppercase">
                  {teksten.home_village_tagline}
                </p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── WAT BIEDT STUDIO LUNA — geen kaart, vrij zwevend ── */}
        <section className="px-7 md:px-14 lg:px-18 py-16 md:py-24">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-80px" }} custom={0}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary/40" />
              Wat we bieden
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-14 leading-[1.15]">
              {teksten.home_aanbod_heading.split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br className="hidden md:block" />}</span>
              ))}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            {teksten.home_aanbod_items.split("\n").filter(Boolean).map((tekst, i) => ({
              n: String(i + 1).padStart(2, "0"), tekst,
            })).map((item, i) => (
              <motion.div
                key={item.n}
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-60px" }} custom={i * 0.07}
                className="flex items-start gap-5 pb-8 border-b border-border/15 last:border-0"
              >
                <span className="font-display text-2xl text-primary/25 font-medium leading-none mt-0.5 shrink-0">{item.n}</span>
                <p className="text-[15px] text-foreground/60 leading-[1.9]">{item.tekst}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── LOCATIE & CONTACT — plain tekst, geen kaarten ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-20 md:py-28 mb-4">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/25 to-background pointer-events-none" />

          <div className="relative md:grid md:grid-cols-2 md:gap-24">

            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} custom={0}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-6 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Locatie
              </p>
              <h2 className="font-display text-2xl font-medium text-foreground mb-5">{teksten.home_locatie_naam}</h2>
              {teksten.home_locatie_adres.split("\n").map((regel, i) => (
                <p key={i} className="text-[15px] text-foreground/55 leading-[1.9] mb-2">{regel}</p>
              ))}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(teksten.home_locatie_adres.replace("\n", ", "))}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-7 text-sm font-semibold text-primary group"
              >
                <MapPin className="w-3.5 h-3.5" />
                Bekijk op kaart
                <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} custom={0.15}
              className="mt-14 md:mt-0"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-6 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Contact
              </p>
              <div className="space-y-5">
                <a href={`mailto:${teksten.home_contact_email}`}
                  className="flex items-center gap-4 text-[15px] text-foreground/55 hover:text-foreground group">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  {teksten.home_contact_email}
                </a>
                <a href={`https://wa.me/${teksten.home_contact_telefoon.replace(/\D/g, "").replace(/^0/, "31")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 text-[15px] text-foreground/55 hover:text-foreground group">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  {teksten.home_contact_telefoon}
                </a>
                <a href={`https://www.instagram.com/${teksten.home_contact_instagram.replace("@", "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 text-[15px] text-foreground/55 hover:text-foreground group">
                  <Instagram className="w-4 h-4 text-primary shrink-0" />
                  {teksten.home_contact_instagram}
                </a>
              </div>
            </motion.div>

          </div>
        </section>

        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
