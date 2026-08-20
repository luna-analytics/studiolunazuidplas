import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { ZORGKAART, TAG_LABELS, LAATST_BIJGEWERKT, type ZorgTag, type Zorgverlener } from "@/data/zorgkaart";
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

// De kenmerken (filters, labels per aanbieder en de uitlegsectie) staan voor nu
// uit; de data blijft in zorgkaart.ts staan. Zet op true om ze weer te tonen.
const TOON_KENMERKEN = false;

// Plaatsfilter: de vier kernen van de gemeente eerst, daarna de directe omgeving.
// Er wordt gezocht in de plaats en de beschrijving, zodat ook aanbieders met een
// werkgebied over meerdere kernen gevonden worden.
const PLAATSEN = [
  "Nieuwerkerk aan den IJssel",
  "Zevenhuizen",
  "Moordrecht",
  "Moerkapelle",
  "Capelle aan den IJssel",
  "Gouda",
  "Waddinxveen",
  "Rotterdam",
];

export default function Geboortezorg() {
  const [, navigate] = useLocation();
  const [zoek, setZoek] = useState("");
  const [actieveTags, setActieveTags] = useState<ZorgTag[]>([]);
  const [plaats, setPlaats] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [fbBericht, setFbBericht] = useState("");
  const [fbEmail, setFbEmail] = useState("");
  const [fbStatus, setFbStatus] = useState<"idle" | "bezig" | "klaar" | "fout">("idle");
  const [fbFout, setFbFout] = useState("");

  const stuurFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbStatus("bezig");
    setFbFout("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/zorgkaart-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bericht: fbBericht, email: fbEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFbFout(data.error ?? "Er ging iets mis, probeer het nog eens");
        setFbStatus("fout");
      } else {
        setFbStatus("klaar");
      }
    } catch {
      setFbFout("Kan geen verbinding maken, probeer het nog eens");
      setFbStatus("fout");
    }
  };

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
        dateModified: LAATST_BIJGEWERKT.iso,
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

  // Vanuit de startpunten en de tegels: elke categorie heeft een eigen pagina
  const naarCategorie = (id: string) => navigate(`/geboortezorg-zuidplas/${id}`);

  const zoekNorm = normalize(zoek.trim());
  const filterActief = zoekNorm.length > 0 || actieveTags.length > 0 || plaats !== null;

  const gefilterd = ZORGKAART
    .map((cat) => ({
      ...cat,
      aanbieders: cat.aanbieders.filter((a) => {
        const tagsOk = actieveTags.every((t) => a.tags.includes(t));
        const plaatsOk = plaats === null || normalize(`${a.plaats} ${a.beschrijving}`).includes(normalize(plaats));
        const zoekOk = zoekNorm.length === 0 || matcht(a, `${cat.titel} ${cat.zoektermen}`, zoekNorm);
        return tagsOk && plaatsOk && zoekOk;
      }),
    }))
    .filter((cat) => cat.aanbieders.length > 0);

  const aantalGevonden = gefilterd.reduce((n, c) => n + c.aanbieders.length, 0);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative overflow-x-hidden">

        {/* ── TITEL EN INTRO ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="px-7 md:px-14 lg:px-18 pt-14 md:pt-12 pb-6"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-primary/40" />
            Regio Zuidplas
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
            Alles over <em className="not-italic text-primary">geboortezorg</em><br className="hidden md:block" /> in de regio Zuidplas
          </h1>
          <p className="text-[15px] text-foreground/75 leading-[1.9] mt-5 max-w-2xl">
            Zwanger of net bevallen in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht of
            Moerkapelle? Op deze pagina vind je alle zorg en ondersteuning uit de regio op één
            plek, van verloskundige en kraamzorg tot bekkenfysiotherapie, cursussen en sporten
            met je baby. Studio Luna houdt deze kaart bij zodat jij niet hoeft te zoeken. Ben je
            zelf zorgverlener in de regio en sta je er nog niet op?{" "}
            <a href="#voor-zorgverleners" className="text-primary font-semibold hover:text-primary/75">
              Meld je gratis aan
            </a>
            .
          </p>
          <p className="text-xs text-foreground/55 mt-3">Bijgewerkt in {LAATST_BIJGEWERKT.tekst}</p>
        </motion.div>

        {/* ── ZOEKEN EN FILTERS ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0.1}
          className="px-7 md:px-14 lg:px-18 pb-4"
        >
          <div className="max-w-3xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input
                type="search"
                value={zoek}
                onChange={(e) => setZoek(e.target.value)}
                placeholder="Waar ben je naar op zoek?"
                className="w-full pr-5 py-3.5 rounded-2xl border border-border/40 bg-card text-[15px] text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ paddingLeft: "3rem" }}
                aria-label="Zoek in de zorgkaart"
              />
            </div>

            {/* Filter: plaats */}
            <div className="mt-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3">Plaats</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {PLAATSEN.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlaats(plaats === p ? null : p)}
                    aria-pressed={plaats === p}
                    className={plaats === p
                      ? "text-sm font-semibold text-primary underline underline-offset-4 decoration-primary/40 py-1.5 -my-1.5"
                      : "text-sm text-foreground/65 hover:text-foreground transition-colors py-1.5 -my-1.5"}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter: kenmerken */}
            {TOON_KENMERKEN && (
            <div className="mt-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3">Kenmerken</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {ALLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    title={TAG_LABELS[tag].uitleg}
                    aria-pressed={actieveTags.includes(tag)}
                    className={actieveTags.includes(tag)
                      ? "text-sm font-semibold text-primary underline underline-offset-4 decoration-primary/40 py-1.5 -my-1.5"
                      : "text-sm text-foreground/65 hover:text-foreground transition-colors py-1.5 -my-1.5"}
                  >
                    {TAG_LABELS[tag].label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-foreground/55 mt-3">
                <a href="#kenmerken-uitleg" className="hover:text-foreground/70 underline underline-offset-2">
                  Wat betekenen deze kenmerken?
                </a>
              </p>
            </div>
            )}

            {/* Startpunten per moment */}
            <div className="mt-9">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3">Begin bij jouw moment</p>
              <div className="space-y-2.5 text-[15px] leading-[1.9] text-foreground/80">
                <p>
                  <span className="font-semibold text-foreground/80">Net zwanger?</span>{" "}
                  Kies een{" "}
                  <button onClick={() => naarCategorie("verloskundigen")} className="text-primary font-semibold hover:text-primary/75">verloskundige</button>,
                  plan je{" "}
                  <button onClick={() => naarCategorie("echos")} className="text-primary font-semibold hover:text-primary/75">echo's</button>{" "}
                  en regel op tijd{" "}
                  <button onClick={() => naarCategorie("kraamzorg")} className="text-primary font-semibold hover:text-primary/75">kraamzorg</button>.
                </p>
                <p>
                  <span className="font-semibold text-foreground/80">Halverwege?</span>{" "}
                  Bereid je voor met{" "}
                  <button onClick={() => naarCategorie("yoga-cursussen")} className="text-primary font-semibold hover:text-primary/75">zwangerschapsyoga of een cursus</button>,
                  blijf{" "}
                  <button onClick={() => naarCategorie("sporten")} className="text-primary font-semibold hover:text-primary/75">in beweging</button>{" "}
                  en zoek bij bekkenklachten een{" "}
                  <button onClick={() => naarCategorie("bekkenfysiotherapie")} className="text-primary font-semibold hover:text-primary/75">bekkenfysiotherapeut</button>.
                </p>
                <p>
                  <span className="font-semibold text-foreground/80">Bijna bevallen?</span>{" "}
                  Overweeg een{" "}
                  <button onClick={() => naarCategorie("doulas")} className="text-primary font-semibold hover:text-primary/75">doula</button>{" "}
                  voor extra begeleiding, of leg het vast met{" "}
                  <button onClick={() => naarCategorie("geboortefotografie")} className="text-primary font-semibold hover:text-primary/75">geboortefotografie</button>.
                </p>
                <p>
                  <span className="font-semibold text-foreground/80">Is je baby er?</span>{" "}
                  Vind hulp bij{" "}
                  <button onClick={() => naarCategorie("lactatiekundigen")} className="text-primary font-semibold hover:text-primary/75">borstvoeding</button>{" "}
                  en{" "}
                  <button onClick={() => naarCategorie("babymassage-dragen")} className="text-primary font-semibold hover:text-primary/75">babymassage en dragen</button>,
                  en bouw{" "}
                  <button onClick={() => naarCategorie("sporten")} className="text-primary font-semibold hover:text-primary/75">samen met andere moeders</button>{" "}
                  weer op.
                </p>
              </div>
            </div>

            {filterActief && (
              <p className="text-sm text-foreground/60 mt-4">
                {aantalGevonden === 0
                  ? "Niets gevonden. Probeer een ander woord of haal een filter weg."
                  : `${aantalGevonden} van ${aantalAanbieders} aanbieders`}
                <button
                  onClick={() => { setZoek(""); setActieveTags([]); setPlaats(null); }}
                  className="ml-3 text-primary font-semibold hover:text-primary/75"
                >
                  Wis filters
                </button>
              </p>
            )}
          </div>
        </motion.div>

        {/* ── DE KAART: tegels naar de categoriepagina's; bij zoeken of
               filteren verschijnen de resultaten direct als lijst ── */}
        <div className="px-7 md:px-14 lg:px-18 pt-6 pb-8">
          {!filterActief && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl">
              {ZORGKAART.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, margin: "-30px" }} custom={Math.min(i * 0.04, 0.2)}
                >
                  <Link
                    href={`/geboortezorg-zuidplas/${cat.id}`}
                    className="group flex flex-col justify-between rounded-2xl bg-secondary/45 hover:bg-secondary/75 transition-colors px-5 py-6 min-h-[7.5rem] h-full"
                  >
                    <span className="font-display text-lg md:text-xl font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                      {cat.titel}
                    </span>
                    <span className="text-xs text-foreground/55 mt-3">
                      {cat.aanbieders.length} {cat.aanbieders.length === 1 ? "aanbieder" : "aanbieders"}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <div className="max-w-3xl">
            {filterActief && gefilterd.map((cat) => (
              <section key={cat.id} className="pt-8">
                <div className="flex items-baseline gap-3 flex-wrap border-b border-border/20 pb-3">
                  <h2 className="font-display text-2xl font-medium text-foreground leading-[1.2]">{cat.titel}</h2>
                  <Link
                    href={`/geboortezorg-zuidplas/${cat.id}`}
                    className="text-xs font-semibold text-primary/80 hover:text-primary"
                  >
                    bekijk alles in deze categorie
                  </Link>
                </div>
                {cat.aanbieders.map((a, i) => (
                  <div key={a.naam} className={`py-6 ${i < cat.aanbieders.length - 1 ? "border-b border-border/10" : ""}`}>
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <a
                        href={a.website} target="_blank" rel="noopener noreferrer"
                        className="text-[16px] font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {a.naam}
                      </a>
                      <span className="text-sm text-foreground/55">{a.plaats}</span>
                    </div>
                    <p className="text-[15px] text-foreground/80 leading-[1.9] mt-1.5">{a.beschrijving}</p>
                    {a.voordeel && (
                      <p className="text-sm text-primary/90 leading-[1.85] mt-2">
                        Voordeel: {a.voordeel}
                      </p>
                    )}
                    <p className="text-xs text-foreground/60 mt-2">
                      {TOON_KENMERKEN && a.tags.length > 0 && (
                        <>{a.tags.map((tag) => TAG_LABELS[tag].label).join(" · ")}{" · "}</>
                      )}
                      <a
                        href={a.website} target="_blank" rel="noopener noreferrer"
                        className="text-primary/80 hover:text-primary font-medium"
                      >
                        bekijk de website
                      </a>
                    </p>
                  </div>
                ))}
              </section>
            ))}

            {gefilterd.length === 0 && filterActief && (
              <div className="py-20">
                <p className="font-display text-2xl text-foreground/80 mb-2">Niets gevonden</p>
                <p className="text-sm text-foreground/60">Probeer een ander zoekwoord of haal een filter weg.</p>
              </div>
            )}

            {/* Feedback: direct doorgeven, zonder te hoeven mailen */}
            <div className="mt-10">
              <p className="text-sm text-foreground/60 leading-[1.85]">
                Deze kaart wordt met zorg bijgehouden, maar aanbod verandert.{" "}
                <button
                  onClick={() => setFeedbackOpen((v) => !v)}
                  className="text-primary font-semibold hover:text-primary/75"
                >
                  Klopt er iets niet of mis je iemand? Geef het hier door
                </button>
                .
              </p>

              {feedbackOpen && (
                fbStatus === "klaar" ? (
                  <p className="text-[15px] text-foreground/80 leading-[1.9] mt-5">
                    Dankjewel voor je bericht. Het wordt meegenomen bij de volgende update van
                    de kaart.
                  </p>
                ) : (
                  <form onSubmit={stuurFeedback} className="mt-5 space-y-3 max-w-xl">
                    <textarea
                      value={fbBericht}
                      onChange={(e) => setFbBericht(e.target.value)}
                      placeholder="Wat klopt er niet, of wie mis je op de kaart?"
                      required
                      rows={3}
                      maxLength={2000}
                      className="w-full px-4 py-3 rounded-2xl border border-border/40 bg-card text-[15px] text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        value={fbEmail}
                        onChange={(e) => setFbEmail(e.target.value)}
                        placeholder="jouw@email.nl"
                        required
                        className="flex-1 px-4 py-3 rounded-2xl border border-border/40 bg-card text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        type="submit"
                        disabled={fbStatus === "bezig"}
                        className="bg-primary text-primary-foreground px-7 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/88 disabled:opacity-60 shrink-0"
                      >
                        {fbStatus === "bezig" ? "Versturen…" : "Verstuur"}
                      </button>
                    </div>
                    {fbStatus === "fout" && <p className="text-xs text-red-600">{fbFout}</p>}
                  </form>
                )
              )}
            </div>
          </div>
        </div>

        {/* ── WAT DE KENMERKEN BETEKENEN ── */}
        {TOON_KENMERKEN && (
        <section id="kenmerken-uitleg" className="px-7 md:px-14 lg:px-18 py-12 md:py-16 scroll-mt-24">
          <div className="max-w-3xl">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-40px" }} custom={0}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-4 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Goed om te weten
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-6">
                Wat de kenmerken betekenen
              </h2>
              <div className="space-y-2.5">
                {ALLE_TAGS.map((tag) => (
                  <p key={tag} className="text-[15px] leading-[1.9] text-foreground/80">
                    <span className="font-semibold text-foreground/80">{TAG_LABELS[tag].label}:</span>{" "}
                    {TAG_LABELS[tag].uitleg}.
                  </p>
                ))}
              </div>
              <p className="text-sm text-foreground/60 leading-[1.85] mt-8">
                De kenmerken zijn gebaseerd op wat aanbieders zelf op hun website vermelden.
              </p>
            </motion.div>
          </div>
        </section>
        )}

        {/* ── VOOR ZORGVERLENERS ── */}
        <section id="voor-zorgverleners" className="px-7 md:px-14 lg:px-18 py-12 md:py-16 scroll-mt-24">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-40px" }} custom={0}
            className="max-w-3xl"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-4 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary/40" />
              Voor zorgverleners
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-5">
              Sta jij nog niet op deze kaart?
            </h2>
            <p className="text-[15px] text-foreground/80 leading-[1.9] mb-4">
              Ben jij zorgverlener in de regio Zuidplas en wil je op de lijst? Vermelding is
              gratis. Stuur een mail met je naam, website en wat je doet, dan komt je vermelding
              erbij.
            </p>
            <p className="text-[15px] text-foreground/80 leading-[1.9] mb-7">
              Wil je de lezeressen van deze kaart daarnaast iets extra's geven, bijvoorbeeld een
              kortingscode of een gratis kennismaking? Mail dan mee wat de actie inhoudt en hoe
              lang die geldig is, dan komt die als voordeel bij je vermelding te staan.
            </p>
            <a
              href="mailto:zorgverleners@studiolunazuidplas.nl?subject=Vermelding%20op%20de%20zorgkaart%20Zuidplas"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary/88 shadow-soft"
            >
              Mail naar zorgverleners@studiolunazuidplas.nl
            </a>
          </motion.div>
        </section>

        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
