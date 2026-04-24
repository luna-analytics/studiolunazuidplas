import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { CtaBlock } from "@/components/cta-block";
import { InterestModal } from "@/components/interest-modal";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Coffee, Mail, ClipboardList } from "lucide-react";
import { IMAGES } from "@/lib/images";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type LesType = { id: string; naam: string; kleur: string; beschrijving?: string; locatie?: string; tijd?: string; actief: boolean };

const DEFAULT_TEKSTEN = {
  aanbod_yoga_heading: "Sterk en vol\nvertrouwen richting\nje bevalling.",
  aanbod_yoga_tekst1: "Sterk, ontspannen en vol vertrouwen richting je bevalling. Met zachte houdingen houden we je veranderende lichaam in balans. We oefenen met ademhaling en maken contact met je baby.",
  aanbod_yoga_tekst2: "Elke les heeft een net andere focus, zoals het bekken, de kracht van je adem of ruimte in je rug. Instromen is op elk moment mogelijk vanaf 14 weken zwangerschap.",
  aanbod_yoga_tijd: "Elke dinsdag 19:00",
  aanbod_yoga_locatie: "Huize Mooisteen, Pr. Beatrixstraat 2, Nieuwerkerk a/d IJssel",
  aanbod_yoga_extra: "Na afloop: verse thee en tijd voor verbinding",
  aanbod_circle_titel: "Zwanger & Mama Circle",
  aanbod_circle_tekst: "Bij Studio Luna geloven we in de kracht van de 'village'. Naast de fysieke lessen creëren we een veilige cirkel waarin je ervaringen deelt, vragen stelt en naar elkaar omkijkt. We gebruiken zachte yoga- en ademhalingsoefeningen om samen te vertragen, zodat er ruimte ontstaat om echt te luisteren naar jezelf en elkaar. Echte verbinding met andere zwangeren en mama's in Zuidplas!",
  aanbod_specials_heading: "Bevallings Specials",
  aanbod_specials_items: "Bevallings Yoga Workshop | Focus & Vertrouwen · 120 min | € 49,-\nPartner Workshop | Verbinding & Support · 120 min | € 79,-\nMama Spa | Ultiem ontspannen · 120 min | € 49,-",
  aanbod_specials_bundel: "De Geboorte-Bundel | Alle drie workshops · meest complete voorbereiding | bespaar € 22,- | € 155,-",
  aanbod_verzekering_tekst: "Veel verzekeraars vergoeden (een deel van) geboortevoorbereiding vanuit de aanvullende verzekering.",
  foto_yoga: "",
  foto_circle: "",
  foto_yoga_hoogte: "normaal",
  foto_yoga_positie: "center",
  foto_circle_hoogte: "hoog",
  foto_circle_positie: "center",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1], delay },
  }),
};

const RATIO_MAP: Record<string, string> = {
  smal: "21/9",
  normaal: "16/9",
  hoog: "4/3",
  portret: "3/4",
};

const POS_MAP: Record<string, string> = {
  top: "top",
  center: "center",
  bottom: "bottom",
};

export default function Home() {
  const [, navigate] = useLocation();
  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const [teksten, setTeksten] = useState(DEFAULT_TEKSTEN);
  const [photosReady, setPhotosReady] = useState(false);
  const [extraTypes, setExtraTypes] = useState<LesType[]>([]);
  const scrolledRef = useRef(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && !scrolledRef.current) {
      scrolledRef.current = true;
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
  }, []);

  useEffect(() => {
    fetch(`${BASE}/api/pagina-teksten`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setTeksten((prev) => ({ ...prev, ...d })); })
      .catch(() => {})
      .finally(() => setPhotosReady(true));

    fetch(`${BASE}/api/class-types`)
      .then((r) => r.ok ? r.json() : [])
      .then((types: LesType[]) => {
        setExtraTypes(types.filter((t) => t.actief && t.beschrijving?.trim()));
        const hash = window.location.hash.slice(1);
        if (hash && !scrolledRef.current) {
          scrolledRef.current = true;
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 300);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative overflow-x-hidden">

        {/* ── PAGE TITLE — minimaal, geen kader ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="px-7 md:px-14 lg:px-18 pt-14 md:pt-12 pb-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-primary/40" />
            Studio Luna
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">Aanbod</h1>
          <p className="text-foreground/45 text-sm mt-3 tracking-wide">Zwangerschapsyoga · Circles · Workshops</p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            1 — ZWANGERSCHAPSYOGA
            Grote foto boven, tekst eronder, geen kaders
        ══════════════════════════════════════════════════════════ */}
        <section id="yoga" className="relative py-16 md:py-24">
          {/* Subtiele achtergrond-overgang */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />

          <div className="relative">
            {/* Foto — iets breder dan het grid, 'bloedt' naar de rand */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-60px" }} custom={0}
              className="mx-4 md:mx-10 lg:mx-14 overflow-hidden rounded-2xl mb-12"
              style={{ aspectRatio: RATIO_MAP[teksten.foto_yoga_hoogte] ?? "16/9" }}
            >
              <img
                src={photosReady ? (teksten.foto_yoga || IMAGES.yoga) : undefined}
                alt="Zwangerschapsyoga Studio Luna"
                className="w-full h-full object-cover transition-opacity duration-700"
                style={{
                  objectPosition: POS_MAP[teksten.foto_yoga_positie] ?? "center",
                  opacity: photosReady ? 1 : 0,
                }}
                loading="lazy"
              />
            </motion.div>

            <div className="px-7 md:px-14 lg:px-18">
              {/* Label */}
              <motion.p
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-60px" }} custom={0.05}
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3"
              >
                <span className="inline-block w-8 h-px bg-primary/40" />
                Zwangerschapsyoga
              </motion.p>

              {/* Asymmetrisch: heading breed links, tekst rechts */}
              <div className="md:grid md:grid-cols-[1fr_1.1fr] md:gap-16 md:items-start">

                <motion.div
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, margin: "-60px" }} custom={0.1}
                >
                  <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15] mb-8">
                    {teksten.aanbod_yoga_heading.split("\n").map((line, i, arr) => (
                      <span key={i}>{i === arr.length - 1
                        ? <em className="not-italic text-primary">{line}</em>
                        : <>{line}<br /></>}
                      </span>
                    ))}
                  </h2>

                  {/* Praktische info — zweeft losjes */}
                  <div className="space-y-4 text-sm text-foreground/55">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                      <span className="leading-[1.8]">{teksten.aanbod_yoga_tijd}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                      <span className="leading-[1.8]">{teksten.aanbod_yoga_locatie}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Coffee className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                      <span className="leading-[1.8]">{teksten.aanbod_yoga_extra}</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, margin: "-60px" }} custom={0.2}
                  className="mt-10 md:mt-0 md:pt-2"
                >
                  <p className="text-[15px] text-foreground/60 leading-[1.95] mb-4">{teksten.aanbod_yoga_tekst1}</p>
                  <p className="text-[15px] text-foreground/60 leading-[1.95] mb-10">{teksten.aanbod_yoga_tekst2}</p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => navigate("/rooster")}
                      className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary/88 shadow-soft group w-full md:w-auto"
                    >
                      Bekijk het rooster
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    <a
                      href="https://tally.so/r/XxED7j"
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-foreground/55 hover:text-primary px-7 py-3 text-sm font-semibold w-full md:w-auto"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Vul je intake in
                    </a>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            2 — MAMA CIRCLE
            Omgekeerde volgorde: tekst breed, geen foto (sfeer door achtergrond)
        ══════════════════════════════════════════════════════════ */}
        <section id="circle" className="relative px-7 md:px-14 lg:px-18 py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background pointer-events-none" />

          <div className="relative">
            <motion.p
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} custom={0}
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3"
            >
              <span className="inline-block w-8 h-px bg-primary/40" />
              Community
            </motion.p>

            <div className="md:grid md:grid-cols-[1.2fr_1fr] md:gap-20 md:items-start">

              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-80px" }} custom={0.1}
              >
                <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15] mb-10">
                  {teksten.aanbod_circle_titel}
                </h2>
                <p className="text-[15px] text-foreground/60 leading-[1.95]">
                  {teksten.aanbod_circle_tekst}
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-80px" }} custom={0.2}
                className="md:pt-24 mt-10 md:mt-0"
              >
                {/* Eigen foto tonen zodra geüpload — anders geen placeholder */}
                {photosReady && teksten.foto_circle && (
                  <div className="overflow-hidden rounded-2xl mb-8" style={{ aspectRatio: RATIO_MAP[teksten.foto_circle_hoogte] ?? "4/3" }}>
                    <img
                      src={teksten.foto_circle}
                      alt="Mama Circle Studio Luna"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: POS_MAP[teksten.foto_circle_positie] ?? "center" }}
                      loading="lazy"
                    />
                  </div>
                )}

                <button
                  onClick={() => setIsInterestOpen(true)}
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-primary/75 group"
                >
                  <Mail className="w-4 h-4" />
                  Houd mij op de hoogte
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            2b — DYNAMISCHE EXTRA AANBOD SECTIES (beheerd via admin)
        ══════════════════════════════════════════════════════════ */}
        {extraTypes.map((type) => (
          <section key={type.id} id={type.id} className="relative px-7 md:px-14 lg:px-18 py-20 md:py-28">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/25 to-background pointer-events-none" />
            <div className="relative">
              <motion.p
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-60px" }} custom={0}
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3"
              >
                <span className="inline-block w-8 h-px bg-primary/40" />
                Nieuw aanbod
              </motion.p>

              <motion.h2
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-60px" }} custom={0.08}
                className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15] mb-8"
              >
                {type.naam}
              </motion.h2>

              <div className="md:grid md:grid-cols-[1.2fr_1fr] md:gap-20 md:items-start">
                <motion.div
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, margin: "-60px" }} custom={0.12}
                >
                  <p className="text-[15px] text-foreground/60 leading-[1.95] mb-8 whitespace-pre-line">{type.beschrijving}</p>
                  <button
                    onClick={() => navigate("/rooster")}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary/88 shadow-soft group"
                  >
                    Bekijk het rooster
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </motion.div>

                {(type.tijd || type.locatie) && (
                  <motion.div
                    variants={fadeUp} initial="hidden" whileInView="show"
                    viewport={{ once: true, margin: "-60px" }} custom={0.2}
                    className="mt-10 md:mt-0 space-y-4 text-sm text-foreground/55"
                  >
                    {type.tijd && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                        <span className="leading-[1.8]">{type.tijd}</span>
                      </div>
                    )}
                    {type.locatie && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                        <span className="leading-[1.8]">{type.locatie}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* ══════════════════════════════════════════════════════════
            3 — BEVALLINGS SPECIALS
            Clean prijslijst, geen kaarten
        ══════════════════════════════════════════════════════════ */}
        <section className="px-7 md:px-14 lg:px-18 py-16 md:py-24">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-80px" }} custom={0}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary/40" />
              Binnenkort
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15] mb-14">
              {teksten.aanbod_specials_heading}
            </h2>
          </motion.div>

          {/* Prijslijst — minimaal, gescheiden door dunne lijn */}
          <div className="space-y-0 mb-14">
            {teksten.aanbod_specials_items.split("\n").filter(Boolean).map((regel, i) => {
              const [title, sub, price] = regel.split("|").map((s) => s.trim());
              return (
                <motion.div
                  key={i}
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, margin: "-60px" }} custom={i * 0.08}
                  className="flex items-center justify-between gap-6 py-6 border-b border-border/15"
                >
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">{title}</p>
                    {sub && <p className="text-sm text-foreground/45 mt-1">{sub}</p>}
                  </div>
                  <p className="font-display text-xl font-medium text-primary shrink-0">{price}</p>
                </motion.div>
              );
            })}

            {/* Bundel */}
            {teksten.aanbod_specials_bundel && (() => {
              const [title, sub, korting, price] = teksten.aanbod_specials_bundel.split("|").map((s) => s.trim());
              return (
                <motion.div
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, margin: "-60px" }} custom={0.3}
                  className="flex items-center justify-between gap-6 py-6 border-b border-border/15"
                >
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">{title}</p>
                    {sub && <p className="text-sm text-foreground/45 mt-1">{sub}</p>}
                    {korting && <p className="text-xs text-primary/70 mt-1">{korting}</p>}
                  </div>
                  <p className="font-display text-xl font-medium text-primary shrink-0">{price}</p>
                </motion.div>
              );
            })()}
          </div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-60px" }} custom={0.4}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <p className="text-sm text-foreground/45 max-w-sm leading-[1.85]">
              {teksten.aanbod_verzekering_tekst}
            </p>
            <button
              onClick={() => setIsInterestOpen(true)}
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-primary/75 group shrink-0"
            >
              <Mail className="w-4 h-4" />
              Houd mij op de hoogte
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </motion.div>
        </section>

        <InterestModal isOpen={isInterestOpen} onClose={() => setIsInterestOpen(false)} />
        <CtaBlock />
        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
