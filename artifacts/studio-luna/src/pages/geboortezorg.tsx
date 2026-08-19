import { useMemo, useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { motion } from "framer-motion";
import { Search, ArrowUpRight, Mail, X } from "lucide-react";
import { ZORGKAART, TAG_LABELS, type ZorgTag, type Zorgverlener } from "@/data/zorgkaart";
import { usePageMeta } from "@/lib/seo";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] as [number, number, number, number], delay },
  }),
};

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function matcht(aanbieder: Zorgverlener, categorieTekst: string, zoek: string): boolean {
  const doel = normalize(
    `${aanbieder.naam} ${aanbieder.plaats} ${aanbieder.beschrijving} ${categorieTekst} ${aanbieder.tags.map((t) => TAG_LABELS[t].label).join(" ")}`
  );
  return zoek.split(/\s+/).filter(Boolean).every((term) => doel.includes(term));
}

const ALLE_TAGS = Object.keys(TAG_LABELS) as ZorgTag[];

export default function Geboortezorg() {
  const [zoek, setZoek] = useState("");
  const [actieveTags, setActieveTags] = useState<ZorgTag[]>([]);

  const aantalAanbieders = useMemo(() => ZORGKAART.reduce((n, c) => n + c.aanbieders.length, 0), []);

  usePageMeta({
    title: "Geboortezorg in Zuidplas: verloskundigen, kraamzorg en meer | Studio Luna",
    description: "Alle geboortezorg in de regio Zuidplas op één plek: verloskundigen, kraamzorg, echo's, bekkenfysiotherapie, doula's, lactatiekundigen, zwangerschapscursussen en zwanger sporten in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht en Moerkapelle.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Geboortezorg in regio Zuidplas",
        description: "Overzicht van verloskundigen, kraamzorg, echocentra, bekkenfysiotherapie, doula's, lactatiekundigen, cursussen en beweegaanbod voor zwangeren en moeders in gemeente Zuidplas.",
        url: "https://www.studiolunazuidplas.nl/geboortezorg-zuidplas",
        isPartOf: { "@type": "WebSite", name: "Studio Luna", url: "https://www.studiolunazuidplas.nl/" },
        about: ZORGKAART.map((c) => ({ "@type": "Thing", name: `${c.titel} in regio Zuidplas` })),
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Geboortezorg-aanbieders in regio Zuidplas",
        numberOfItems: ZORGKAART.reduce((n, c) => n + c.aanbieders.length, 0),
        itemListElement: ZORGKAART.flatMap((c) => c.aanbieders).map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: { "@type": "LocalBusiness", name: a.naam, url: a.website, address: { "@type": "PostalAddress", addressLocality: a.plaats, addressCountry: "NL" } },
        })),
      },
    ],
  });

  const toggleTag = (tag: ZorgTag) =>
    setActieveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const zoekNorm = normalize(zoek.trim());
  const filterActief = zoekNorm.length > 0 || actieveTags.length > 0;

  const gefilterd = ZORGKAART.map((cat) => ({
    ...cat,
    aanbieders: cat.aanbieders.filter((a) => {
      const tagsOk = actieveTags.every((t) => a.tags.includes(t));
      const zoekOk = zoekNorm.length === 0 || matcht(a, `${cat.titel} ${cat.zoektermen}`, zoekNorm);
      return tagsOk && zoekOk;
    }),
  })).filter((cat) => cat.aanbieders.length > 0);

  const aantalGevonden = gefilterd.reduce((n, c) => n + c.aanbieders.length, 0);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative overflow-x-hidden">

        {/* ── PAGE TITLE + ZOEK ── */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-secondary/20 to-background pointer-events-none" />
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="relative px-7 md:px-14 lg:px-18 pt-14 md:pt-12 pb-10"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary/40" />
              Regio Zuidplas
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
              Alles over <em className="not-italic text-primary">geboortezorg</em><br className="hidden md:block" /> in de regio Zuidplas
            </h1>
            <p className="text-[15px] text-foreground/55 leading-[1.9] mt-5 max-w-2xl">
              Zwanger of net bevallen in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht of
              Moerkapelle? Op deze pagina vind je alle zorg en ondersteuning uit de regio op één
              plek, van verloskundige en kraamzorg tot bekkenfysiotherapie, cursussen en sporten
              met je baby. Studio Luna houdt deze kaart bij zodat jij niet hoeft te zoeken.
            </p>

            {/* Zoekbalk */}
            <div className="mt-8 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/35" />
                <input
                  type="search"
                  value={zoek}
                  onChange={(e) => setZoek(e.target.value)}
                  placeholder="Waar ben je naar op zoek? Bijv. verloskundige, kraamzorg, echo…"
                  className="w-full pr-5 py-4 rounded-2xl border border-border/50 bg-card shadow-soft text-[15px] text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  style={{ paddingLeft: "3.25rem" }}
                  aria-label="Zoek in de zorgkaart"
                />
              </div>

              {/* Tagfilters */}
              <div className="flex flex-wrap gap-2 mt-4">
                {ALLE_TAGS.map((tag) => {
                  const actief = actieveTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      title={TAG_LABELS[tag].uitleg}
                      className={
                        actief
                          ? "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground"
                          : "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-secondary/70 text-foreground/55 hover:bg-secondary hover:text-foreground transition-colors"
                      }
                    >
                      {TAG_LABELS[tag].label}
                      {actief && <X className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>

              {filterActief && (
                <p className="text-sm text-foreground/45 mt-4">
                  {aantalGevonden === 0
                    ? "Niets gevonden. Probeer een ander woord of haal een filter weg."
                    : `${aantalGevonden} van ${aantalAanbieders} aanbieders gevonden`}
                  {filterActief && (
                    <button
                      onClick={() => { setZoek(""); setActieveTags([]); }}
                      className="ml-3 text-primary font-semibold hover:text-primary/75"
                    >
                      Wis filters
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* Sprong naar categorie */}
            {!filterActief && (
              <div className="flex flex-wrap gap-2 mt-6 max-w-3xl">
                {ZORGKAART.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className="text-xs font-semibold text-foreground/45 hover:text-primary border border-border/40 hover:border-primary/40 rounded-full px-3.5 py-1.5 transition-colors"
                  >
                    {cat.titel}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── CATEGORIEËN ── */}
        <div className="px-7 md:px-14 lg:px-18 pb-8">
          {gefilterd.map((cat, ci) => (
            <section key={cat.id} id={cat.id} className="py-10 md:py-14 scroll-mt-24">
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-40px" }} custom={0}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-4 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-primary/40" />
                  {String(ci + 1).padStart(2, "0")}
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15]">{cat.titel}</h2>
                <p className="text-sm text-foreground/50 leading-[1.85] mt-2 max-w-2xl">{cat.intro}</p>
              </motion.div>

              <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.aanbieders.map((a, i) => (
                  <motion.a
                    key={a.naam}
                    href={a.website}
                    target="_blank" rel="noopener noreferrer"
                    variants={fadeUp} initial="hidden" whileInView="show"
                    viewport={{ once: true, margin: "-30px" }} custom={Math.min(i * 0.05, 0.3)}
                    className="group rounded-2xl border border-border/30 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-soft transition-all p-6 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors">{a.naam}</p>
                        <p className="text-xs text-foreground/45 mt-0.5">{a.plaats}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-foreground/25 group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                    <p className="text-sm text-foreground/55 leading-[1.8] flex-1">{a.beschrijving}</p>
                    {a.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {a.tags.map((tag) => (
                          <span
                            key={tag}
                            title={TAG_LABELS[tag].uitleg}
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-secondary/70 text-foreground/50"
                          >
                            {TAG_LABELS[tag].label}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.a>
                ))}
              </div>
            </section>
          ))}

          {gefilterd.length === 0 && filterActief && (
            <div className="py-20 text-center">
              <p className="font-display text-2xl text-foreground/60 mb-2">Niets gevonden</p>
              <p className="text-sm text-foreground/45">Probeer een ander zoekwoord of haal een filter weg.</p>
            </div>
          )}
        </div>

        {/* ── UITLEG TAGS ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-14 md:py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/25 to-background pointer-events-none" />
          <div className="relative">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-40px" }} custom={0}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-4 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Wat betekenen de labels
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-8">
                Zo lees je de kaart
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5 max-w-4xl">
              {ALLE_TAGS.map((tag) => (
                <div key={tag} className="flex items-start gap-4 text-sm">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-secondary/70 text-foreground/55 shrink-0 mt-0.5">
                    {TAG_LABELS[tag].label}
                  </span>
                  <p className="text-foreground/55 leading-[1.8]">{TAG_LABELS[tag].uitleg}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-foreground/40 leading-[1.8] mt-8 max-w-2xl">
              De labels zijn gebaseerd op wat aanbieders zelf op hun website vermelden. Deze kaart
              wordt met zorg bijgehouden, maar aanbod verandert. Klopt er iets niet of mis je
              iemand? Laat het weten via het adres hieronder.
            </p>
          </div>
        </section>

        {/* ── CTA VOOR ZORGVERLENERS ── */}
        <section className="mx-5 md:mx-8 lg:mx-12 mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-3xl bg-primary px-8 md:px-14 py-11 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55 mb-2">Voor zorgverleners</p>
              <p className="font-display text-2xl md:text-3xl font-medium text-white leading-snug max-w-xl">
                Ben jij zorgverlener in de regio Zuidplas en wil je op deze kaart staan?
              </p>
              <p className="text-sm text-white/70 leading-[1.85] mt-3 max-w-xl">
                Vermelding is gratis. Stuur een mail met je naam, website en wat je doet, dan
                zetten we je erbij.
              </p>
            </div>
            <a
              href="mailto:zorgverleners@studiolunazuidplas.nl?subject=Vermelding%20op%20de%20zorgkaart%20Zuidplas"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-2xl font-semibold text-sm hover:bg-white/92 shadow-md group transition-colors shrink-0"
            >
              <Mail className="w-4 h-4" />
              zorgverleners@studiolunazuidplas.nl
            </a>
          </motion.div>
        </section>

        {/* Lokale SEO-tekst, zichtbaar voor zoekmachines */}
        <div className="sr-only">
          <h2>Verloskundige in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht en Moerkapelle</h2>
          <p>Op zoek naar een verloskundige in gemeente Zuidplas? Op deze pagina vind je alle verloskundigenpraktijken die zwangeren uit Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht en Moerkapelle begeleiden, inclusief caseload-verloskundigen en praktijken die thuisbevallingen begeleiden.</p>
          <h2>Kraamzorg in regio Zuidplas</h2>
          <p>Kraamzorg regelen doe je het liefst voor week 20 van je zwangerschap. Deze kaart toont kraamzorgorganisaties die leveren in gemeente Zuidplas en omgeving, waaronder Nieuwerkerk aan den IJssel, Capelle aan den IJssel en Gouda.</p>
          <h2>Zwangerschapsyoga en geboortevoorbereiding in Zuidplas</h2>
          <p>Studio Luna biedt zwangerschapsyoga en de Geboortereeks in Nieuwerkerk aan den IJssel. Daarnaast vind je op deze kaart hypnobirthing, zwangerschapscursussen en babyEHBO in de regio.</p>
          <h2>Bekkenfysiotherapie, lactatiekundigen en doula's in de regio Zuidplas</h2>
          <p>Ook bekkenfysiotherapeuten, lactatiekundigen, doula's, echocentra, babymassage, draagconsulenten en postpartum-ondersteuning in en rond gemeente Zuidplas staan op deze pagina, elk met labels voor caseload, holistisch werken, aan huis, op locatie of online.</p>
        </div>

        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
