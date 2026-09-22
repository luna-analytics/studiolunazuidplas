import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { CtaBlock } from "@/components/cta-block";
import { motion } from "framer-motion";
import { Instagram, Mail } from "lucide-react";
import { usePageMeta } from "@/lib/seo";
import { IMAGES } from "@/lib/images";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const DEFAULTS = {
  over_mij_naam: "Marjolein",
  over_mij_functie: "Zwangerschapsyoga docente & oprichter Studio Luna",
  over_mij_quote: "Ik geloof dat elke vrouw kracht in zich draagt, soms moet je die alleen even leren voelen.",
  over_mij_tekst: "",
  over_mij_foto: "",
};

// Geen inloopanimaties meer: de inhoud staat er gewoon.
const fadeUp = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

export default function OverMij() {
  const [data, setData] = useState(DEFAULTS);

  usePageMeta({
    title: "Over Marjolein, zwangerschapsyoga docente in Nieuwerkerk aan den IJssel | Studio Luna",
    description: "Maak kennis met Marjolein: moeder, gepromoveerd onderzoeker en yogadocente. Zij geeft de Geboortereeks van Studio Luna in Nieuwerkerk aan den IJssel, gemeente Zuidplas.",
  });

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
      <div className="w-full max-w-6xl bg-background min-h-screen relative overflow-x-hidden">

        {/* ── LABEL + NAAM ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="px-7 md:px-14 lg:px-18 pt-14 md:pt-12 pb-6"
        >
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
            Over mij
          </h1>
          <p className="text-foreground/60 text-[15px] mt-3">{data.over_mij_functie}</p>
        </motion.div>

        {/* ── FOTO + QUOTE (asymmetrisch) ── */}
        <section className="relative py-10 md:py-16">

          <div className="relative px-7 md:px-14 lg:px-18">
            <div className="md:grid md:grid-cols-[1fr_1.15fr] md:gap-16 md:items-start">

              {/* Foto */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-60px" }} custom={0}
              >
                {(
                  <div className="overflow-hidden" style={{ aspectRatio: "3/4" }}>
                    <img
                      src={IMAGES.overMij}
                      alt={data.over_mij_naam}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
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
                  “{data.over_mij_quote}”
                </blockquote>

                <p className="text-[15px] font-semibold text-foreground/75">
                  {data.over_mij_naam}
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
                <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.2]">
                  Mijn verhaal
                </h2>
              </motion.div>

              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-80px" }} custom={0.1}
                className="space-y-6"
              >
                {alineas.map((alinea, i) => (
                  <p key={i} className="text-[15px] text-foreground/80 leading-[1.95]">
                    {alinea}
                  </p>
                ))}
              </motion.div>

            </div>
          </section>
        )}

        {/* ── CONTACT STRIP ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-16 md:py-24 mb-4">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-80px" }} custom={0}
            className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-8"
          >
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.2]">
                Neem gerust contact op,<br />ik vertel je er alles over.
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <a href="mailto:info@studiolunazuidplas.nl"
                className="inline-flex items-center gap-2 text-[15px] text-foreground/75 hover:text-foreground">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                info@studiolunazuidplas.nl
              </a>
              <a href="https://www.instagram.com/studiolunazuidplas" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[15px] text-foreground/75 hover:text-foreground">
                <Instagram className="w-4 h-4 text-primary shrink-0" />
                @studiolunazuidplas
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
