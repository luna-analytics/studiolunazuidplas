import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { CtaBlock } from "@/components/cta-block";
import { motion } from "framer-motion";
import { Instagram, Mail, ArrowRight } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const DEFAULTS = {
  over_mij_naam: "Jouw naam",
  over_mij_functie: "Zwangerschapsyoga docente & oprichter Studio Luna",
  over_mij_quote: "Ik geloof dat elke vrouw kracht in zich draagt — soms moet je die alleen even leren voelen.",
  over_mij_tekst: "",
  over_mij_foto: "",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1], delay },
  }),
};

export default function OverMij() {
  const [data, setData] = useState(DEFAULTS);

  useEffect(() => {
    fetch(`${BASE}/api/pagina-teksten`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData((prev) => ({ ...prev, ...d })); })
      .catch(() => {});
  }, []);

  const alineas = data.over_mij_tekst
    .split("\n")
    .reduce<string[][]>((acc, line) => {
      if (line.trim() === "") { acc.push([]); } else { acc[acc.length - 1].push(line); }
      return acc;
    }, [[]])
    .map((group) => group.join(" "))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative overflow-x-hidden">

        {/* ── LABEL + NAAM ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="px-7 md:px-14 lg:px-18 pt-14 md:pt-12 pb-6"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-primary/40" />
            Studio Luna
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
            Over mij
          </h1>
          <p className="text-foreground/45 text-sm mt-3 tracking-wide">{data.over_mij_functie}</p>
        </motion.div>

        {/* ── FOTO + QUOTE (asymmetrisch) ── */}
        <section className="relative py-10 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/25 to-background pointer-events-none" />

          <div className="relative px-7 md:px-14 lg:px-18">
            <div className="md:grid md:grid-cols-[1fr_1.15fr] md:gap-16 md:items-start">

              {/* Foto */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-60px" }} custom={0}
              >
                {data.over_mij_foto ? (
                  <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "3/4" }}>
                    <img
                      src={data.over_mij_foto}
                      alt={data.over_mij_naam}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    className="overflow-hidden rounded-2xl bg-secondary flex items-center justify-center"
                    style={{ aspectRatio: "3/4" }}
                  >
                    <p className="text-foreground/30 text-sm text-center px-6">
                      Voeg via de admin-pagina een foto toe
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Quote + naam rechts, iets lager voor dynamiek */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-60px" }} custom={0.15}
                className="md:pt-20 mt-8 md:mt-0"
              >
                <blockquote className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.3] mb-6">
                  <span className="text-primary/40 text-5xl leading-none font-serif mr-1">"</span>
                  {data.over_mij_quote}
                  <span className="text-primary/40 text-5xl leading-none font-serif ml-1">"</span>
                </blockquote>

                <p className="text-sm font-semibold text-foreground/55 tracking-widest uppercase">
                  — {data.over_mij_naam}
                </p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── BIOGRAFIE TEKST ── */}
        {alineas.length > 0 && (
          <section className="px-7 md:px-14 lg:px-18 py-12 md:py-20">
            <div className="md:grid md:grid-cols-[1fr_2fr] md:gap-20">

              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-80px" }} custom={0}
                className="mb-8 md:mb-0"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-primary/40" />
                  Mijn verhaal
                </p>
                <p className="font-display text-2xl font-medium text-foreground mt-4 leading-[1.3]">
                  {data.over_mij_naam}
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-80px" }} custom={0.1}
                className="space-y-6"
              >
                {alineas.map((alinea, i) => (
                  <p key={i} className="text-[15px] text-foreground/60 leading-[1.95]">
                    {alinea}
                  </p>
                ))}
              </motion.div>

            </div>
          </section>
        )}

        {/* ── CONTACT STRIP ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-16 md:py-24 mb-4">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-80px" }} custom={0}
            className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-8"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-4 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                In contact
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.2]">
                Neem gerust contact op,<br />ik vertel je er alles over.
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <a href="mailto:info@studiolunazuidplas.nl"
                className="inline-flex items-center gap-2 text-[15px] text-foreground/55 hover:text-foreground group">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                info@studiolunazuidplas.nl
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
              </a>
              <a href="https://www.instagram.com/studiolunazuidplas" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[15px] text-foreground/55 hover:text-foreground group">
                <Instagram className="w-4 h-4 text-primary shrink-0" />
                @studiolunazuidplas
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>
        </section>

        <CtaBlock />
        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
