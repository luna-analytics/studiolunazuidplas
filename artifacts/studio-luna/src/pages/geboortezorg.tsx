import { useMemo, useState } from "react";
import { Link } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { ZORGKAART, TAG_LABELS, LAATST_BIJGEWERKT, isNieuw, type ZorgTag, type Zorgverlener } from "@/data/zorgkaart";
import { usePageMeta } from "@/lib/seo";
import { IMAGES } from "@/lib/images";

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function matcht(aanbieder: Zorgverlener, categorieTekst: string, zoek: string): boolean {
  const doel = normalize(
    `${aanbieder.naam} ${aanbieder.plaats} ${aanbieder.beschrijving} ${categorieTekst} ${aanbieder.tags.map((t) => TAG_LABELS[t].label).join(" ")}`
  );
  return zoek.split(/\s+/).filter(Boolean).every((term) => doel.includes(term));
}

// De kaart leest als een gids in fasen in plaats van een muur van tegels.
// Categorieën die hier niet genoemd worden schuiven vanzelf in de laatste groep,
// zodat een nieuwe categorie in zorgkaart.ts nooit onzichtbaar blijft.
// Een categorie zonder aanbieders (zoals Matrescentie) blijft bewust zichtbaar
// met een 0 erachter: dat is het signaal dat die zorg nog gezocht wordt.
const FASEN: { titel: string; ids: string[] }[] = [
  {
    titel: "Tijdens je zwangerschap",
    ids: ["verloskundigen", "echos", "bekkenfysiotherapie", "yoga-cursussen", "doulas"],
  },
  {
    titel: "Rond de geboorte",
    ids: ["kraamzorg", "geboortefotografie", "lactatiekundigen"],
  },
  {
    titel: "Na de geboorte",
    ids: ["babymassage-dragen", "matrescentie"],
  },
  {
    // Aanbod dat niet aan één fase hangt maar de hele periode doorloopt.
    titel: "Voor elke fase",
    ids: ["sporten", "zwangerschapsmassage-babyspa", "osteopathie", "zwangerschaps-newborn-gezinsfotografie", "mentale-steun"],
  },
  {
    titel: "Extra ondersteuning",
    ids: ["steun-bij-verlies", "online"],
  },
];

// Snelzoekwoorden onder het zoekveld; klikken vult gewoon het zoekveld,
// zodat zichtbaar blijft waarop gefilterd wordt.
const PLAATS_SNELZOEK = ["Nieuwerkerk", "Zevenhuizen", "Moordrecht", "Moerkapelle", "online"];

const veldKlasse =
  "w-full px-4 py-3 rounded-md border border-border/40 bg-card text-[15px] text-foreground placeholder:text-foreground/50";
const labelKlasse = "block text-sm font-semibold text-foreground/80 mb-1.5";

export default function Geboortezorg() {
  const [zoek, setZoek] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [fbBericht, setFbBericht] = useState("");
  const [fbEmail, setFbEmail] = useState("");
  const [fbStatus, setFbStatus] = useState<"idle" | "bezig" | "klaar" | "fout">("idle");
  const [fbFout, setFbFout] = useState("");
  const [zvOpen, setZvOpen] = useState(false);
  const [zvPraktijk, setZvPraktijk] = useState("");
  const [zvWebsite, setZvWebsite] = useState("");
  const [zvBericht, setZvBericht] = useState("");
  const [zvEmail, setZvEmail] = useState("");
  const [zvStatus, setZvStatus] = useState<"idle" | "bezig" | "klaar" | "fout">("idle");
  const [zvFout, setZvFout] = useState("");

  const meldZorgverlenerAan = async (e: React.FormEvent) => {
    e.preventDefault();
    setZvStatus("bezig");
    setZvFout("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/zorgverlener-aanmelding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ praktijk: zvPraktijk, website: zvWebsite, bericht: zvBericht, email: zvEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setZvFout(data.error ?? "Er ging iets mis, probeer het nog eens");
        setZvStatus("fout");
      } else {
        setZvStatus("klaar");
      }
    } catch {
      setZvFout("Kan geen verbinding maken, probeer het nog eens");
      setZvStatus("fout");
    }
  };

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

  // Categorieën gegroepeerd per fase; wat nergens is ingedeeld komt achteraan.
  const fasen = useMemo(() => {
    const ingedeeld = new Set(FASEN.flatMap((f) => f.ids));
    const rest = ZORGKAART.filter((c) => !ingedeeld.has(c.id));
    return FASEN.map((fase, i) => ({
      titel: fase.titel,
      categorieen: [
        ...fase.ids
          .map((id) => ZORGKAART.find((c) => c.id === id))
          .filter((c): c is (typeof ZORGKAART)[number] => Boolean(c)),
        ...(i === FASEN.length - 1 ? rest : []),
      ],
    })).filter((fase) => fase.categorieen.length > 0);
  }, []);

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

  const zoekNorm = normalize(zoek.trim());
  const filterActief = zoekNorm.length > 0;

  const gefilterd = ZORGKAART
    .map((cat) => ({
      ...cat,
      aanbieders: cat.aanbieders.filter(
        (a) => zoekNorm.length === 0 || matcht(a, `${cat.titel} ${cat.zoektermen}`, zoekNorm)
      ),
    }))
    .filter((cat) => cat.aanbieders.length > 0);

  const aantalGevonden = gefilterd.reduce((n, c) => n + c.aanbieders.length, 0);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative overflow-x-hidden">

        {/* ── TITEL EN INTRO — typografisch, met de herofoto in een zachte
               organische uitsnede ernaast in plaats van een gekleurd vlak.
               Andere foto? Vervang public/images/foto-hero.webp of pas het
               pad aan in lib/images.ts. ── */}
        <div className="px-7 md:px-14 lg:px-18 pt-14 md:pt-12 pb-6">
          <div className="max-w-4xl md:grid md:grid-cols-[1fr_auto] md:gap-14 md:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Regio Zuidplas
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
                Geboortezorg in Zuidplas
              </h1>
              <p className="text-[15px] text-foreground/75 leading-[1.9] mt-4 max-w-xl">
                Vind zorg en ondersteuning tijdens je zwangerschap, bevalling en kraamtijd,
                van verloskundige en kraamzorg tot bekkenfysiotherapie en sporten met je baby.
              </p>
              <p className="text-sm text-foreground/60 mt-3">
                Nieuwerkerk aan den IJssel · Zevenhuizen · Moordrecht · Moerkapelle
              </p>
              <p className="text-xs text-foreground/60 mt-2">
                Met zorg bijgehouden door Studio Luna · bijgewerkt in {LAATST_BIJGEWERKT.tekst}
              </p>
            </div>
            <img
              src={IMAGES.hero}
              alt=""
              className="hidden md:block w-56 lg:w-64 aspect-[4/5] object-cover"
              style={{ borderRadius: "56% 44% 50% 50% / 46% 54% 46% 54%" }}
            />
          </div>
        </div>

        {/* ── ZOEKEN ── */}
        <div className="px-7 md:px-14 lg:px-18 pb-2">
          <div className="max-w-xl">
            <label htmlFor="zorg-zoek" className={labelKlasse}>Zoek op zorg, naam of plaats</label>
            <input
              id="zorg-zoek"
              type="search"
              value={zoek}
              onChange={(e) => setZoek(e.target.value)}
              placeholder="bijv. bekkenfysiotherapie, kraamzorg of Nieuwerkerk"
              className={veldKlasse}
            />
            <p className="text-sm text-foreground/60 mt-2.5">
              Of kies een plaats:{" "}
              {PLAATS_SNELZOEK.map((p, i) => (
                <span key={p}>
                  {i > 0 && " · "}
                  <button
                    onClick={() => setZoek(zoek.trim() === p ? "" : p)}
                    className={zoek.trim() === p
                      ? "text-primary font-semibold underline underline-offset-4 decoration-primary/40"
                      : "text-foreground/70 hover:text-primary"}
                  >
                    {p}
                  </button>
                </span>
              ))}
            </p>

            {filterActief && (
              <p className="text-sm text-foreground/60 mt-3">
                {aantalGevonden === 0
                  ? "Niets gevonden. Probeer een ander woord."
                  : `${aantalGevonden} van ${aantalAanbieders} aanbieders`}
                <button
                  onClick={() => setZoek("")}
                  className="ml-3 text-primary font-semibold hover:text-primary/75"
                >
                  Wis zoekopdracht
                </button>
              </p>
            )}
          </div>
        </div>

        {/* ── DE GIDS: categorieën per fase, als lijst met haarlijnen.
               Bij zoeken verschijnen de aanbieders direct als lijst. ── */}
        <div className="px-7 md:px-14 lg:px-18 pt-6 pb-8">
          {!filterActief && (
            /* Op brede schermen vullen de fasegroepen twee kolommen, zodat de
               gids de pagina vult in plaats van in één smalle strook te hangen. */
            <div className="max-w-4xl md:columns-2 md:gap-x-16">
              {fasen.map((fase) => (
                <section key={fase.titel} className="break-inside-avoid mb-10">
                  <h2 className="font-display text-xl md:text-2xl font-medium text-foreground leading-[1.2] pb-3 border-b border-border/25">
                    {fase.titel}
                  </h2>
                  <ul className="m-0 p-0 list-none">
                    {fase.categorieen.map((cat) => (
                      <li key={cat.id} className="border-b border-border/10">
                        <Link
                          href={`/geboortezorg-zuidplas/${cat.id}`}
                          className="group flex items-baseline justify-between gap-4 py-3.5"
                        >
                          <span className="text-[15px] font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                            {cat.titel}
                          </span>
                          <span className="text-sm text-foreground/55 tabular-nums shrink-0">
                            {cat.aanbieders.length}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
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
                  <div key={a.naam} className={`py-5 ${i < cat.aanbieders.length - 1 ? "border-b border-border/10" : ""}`}>
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <a
                        href={a.website} target="_blank" rel="noopener noreferrer"
                        className="text-[16px] font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {a.naam}
                      </a>
                      <span className="text-sm text-foreground/70">{a.plaats}</span>
                      {isNieuw(a.toegevoegd) && (
                        <span className="text-[11px] uppercase tracking-[0.18em] text-primary/70">
                          nieuw
                        </span>
                      )}
                    </div>
                    <p className="text-[15px] text-foreground/80 leading-[1.9] mt-1.5">{a.beschrijving}</p>
                    {a.voordeel && (
                      <p className="text-sm text-primary/90 leading-[1.85] mt-2">
                        Voordeel: {a.voordeel}
                      </p>
                    )}
                    <p className="text-xs text-foreground/60 mt-2">
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
              <div className="py-16">
                <p className="font-display text-2xl text-foreground/80 mb-2">Niets gevonden</p>
                <p className="text-sm text-foreground/60">Probeer een ander zoekwoord.</p>
              </div>
            )}

            {/* Feedback: direct doorgeven, zonder te hoeven mailen */}
            <div className="mt-10 max-w-xl">
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
                  <form onSubmit={stuurFeedback} className="mt-5 space-y-4">
                    <div>
                      <label htmlFor="fb-bericht" className={labelKlasse}>Wat klopt er niet, of wie mis je op de kaart?</label>
                      <textarea
                        id="fb-bericht"
                        value={fbBericht}
                        onChange={(e) => setFbBericht(e.target.value)}
                        required
                        rows={3}
                        maxLength={2000}
                        className={`${veldKlasse} resize-none leading-relaxed`}
                      />
                    </div>
                    <div>
                      <label htmlFor="fb-email" className={labelKlasse}>Je e-mailadres</label>
                      <input
                        id="fb-email"
                        type="email"
                        value={fbEmail}
                        onChange={(e) => setFbEmail(e.target.value)}
                        required
                        className={veldKlasse}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={fbStatus === "bezig"}
                      className="bg-primary text-primary-foreground px-7 py-3 rounded-md font-semibold text-sm hover:bg-primary/88 disabled:opacity-60"
                    >
                      {fbStatus === "bezig" ? "Versturen…" : "Verstuur"}
                    </button>
                    {fbStatus === "fout" && <p className="text-xs text-red-600">{fbFout}</p>}
                  </form>
                )
              )}
            </div>
          </div>
        </div>

        {/* ── VOOR ZORGVERLENERS — bewust klein, de kaart is er voor zwangeren ── */}
        <section id="voor-zorgverleners" className="px-7 md:px-14 lg:px-18 py-10 md:py-12 scroll-mt-24">
          <div className="max-w-xl border-t border-border/25 pt-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3">
              Voor zorgverleners
            </p>
            <p className="text-[15px] text-foreground/80 leading-[1.9]">
              Ben je zorgverlener in de regio Zuidplas en sta je er nog niet bij? Vermelding
              is gratis.{" "}
              <button
                onClick={() => setZvOpen((v) => !v)}
                className="text-primary font-semibold hover:text-primary/75"
              >
                Voeg je praktijk toe
              </button>
              .
            </p>

            {zvOpen && (
              zvStatus === "klaar" ? (
                <p className="text-[15px] text-foreground/80 leading-[1.9] mt-5">
                  Dankjewel voor je aanmelding! Ik bekijk je gegevens en je hoort van mij zodra
                  je vermelding op de kaart staat.
                </p>
              ) : (
                <form onSubmit={meldZorgverlenerAan} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="zv-praktijk" className={labelKlasse}>Naam van je praktijk</label>
                    <input
                      id="zv-praktijk"
                      type="text"
                      value={zvPraktijk}
                      onChange={(e) => setZvPraktijk(e.target.value)}
                      required
                      maxLength={160}
                      className={veldKlasse}
                    />
                  </div>
                  <div>
                    <label htmlFor="zv-website" className={labelKlasse}>Je website (mag leeg)</label>
                    <input
                      id="zv-website"
                      type="text"
                      value={zvWebsite}
                      onChange={(e) => setZvWebsite(e.target.value)}
                      maxLength={300}
                      className={veldKlasse}
                    />
                  </div>
                  <div>
                    <label htmlFor="zv-bericht" className={labelKlasse}>Wat doe je, en in welke plaatsen werk je?</label>
                    <textarea
                      id="zv-bericht"
                      value={zvBericht}
                      onChange={(e) => setZvBericht(e.target.value)}
                      required
                      rows={3}
                      maxLength={2000}
                      className={`${veldKlasse} resize-none leading-relaxed`}
                    />
                    <p className="text-xs text-foreground/60 mt-1.5 leading-relaxed">
                      Wil je de lezeressen van deze kaart iets extra's geven, bijvoorbeeld een
                      kortingscode of gratis kennismaking? Schrijf in je bericht wat de actie
                      inhoudt en hoe lang die geldig is, dan komt die als voordeel bij je
                      vermelding te staan.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="zv-email" className={labelKlasse}>Je e-mailadres</label>
                    <input
                      id="zv-email"
                      type="email"
                      value={zvEmail}
                      onChange={(e) => setZvEmail(e.target.value)}
                      required
                      className={veldKlasse}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={zvStatus === "bezig"}
                    className="bg-primary text-primary-foreground px-7 py-3 rounded-md font-semibold text-sm hover:bg-primary/88 disabled:opacity-60"
                  >
                    {zvStatus === "bezig" ? "Versturen…" : "Praktijk aanmelden"}
                  </button>
                  {zvStatus === "fout" && <p className="text-xs text-red-600">{zvFout}</p>}
                </form>
              )
            )}
          </div>
        </section>

        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
