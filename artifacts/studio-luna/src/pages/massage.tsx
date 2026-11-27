import { useState } from "react";
import { Link } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { KennismakingModal } from "@/components/kennismaking-modal";
import { SeoFooter } from "@/components/seo-footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePageMeta } from "@/lib/seo";
import { IMAGES } from "@/lib/images";
import {
  MASSAGE, MASSAGE_DAGEN, MASSAGE_DAGDELEN, MASSAGE_PAKKETTEN, PAKKET_MENGEN, INTRODUCTIE_TEKST,
  introductieLoopt, keuzeTekst, type MassageVoor,
} from "../../../api-server/src/lib/massage";
import teksten from "@/data/massage-teksten.json";

// Twee pagina's, één massage (haar keuze 18 november 2026): Lomi Lomi Hapai
// voor zwangeren op /zwangerschapsmassage en na de bevalling op
// /postpartummassage. Naam, prijzen en plekken komen uit massage.ts, zodat
// pagina's en bevestigingsmail altijd hetzelfde zeggen.
//
// De openingszin over Lomi Lomi Hapai is van Marjolein zelf (18 november).

// Alle teksten van deze pagina staan in src/data/massage-teksten.json, zodat
// de kale versie voor crawlers (scripts/prerender-shells.mjs) dezelfde bron
// leest. Alleen de vraag "wanneer" wordt hier samengesteld uit massage.ts.
type FaqBron = { vraag: string; antwoord?: string; zwanger?: string; postpartum?: string };
const FAQ = (voor: MassageVoor) => [
  {
    vraag: "Wanneer kan ik een massage krijgen?",
    antwoord: `De massage kan ${MASSAGE.wanneerZwanger}, en na de bevalling ${MASSAGE.wanneerPostpartum}. ${teksten.faqWanneerSlot}`,
  },
  ...(teksten.faq as FaqBron[]).map((f) => ({
    vraag: f.vraag,
    antwoord: f.antwoord ?? (voor === "zwanger" ? f.zwanger : f.postpartum) ?? "",
  })),
];

const TEKST = {
  zwanger: {
    pad: "/zwangerschapsmassage",
    titel: "Zwangerschapsmassage",
    meta: "Zwangerschapsmassage in Nieuwerkerk aan den IJssel | Studio Luna",
    beschrijving: `Lomi Lomi Hapai, een full body ontspanningsmassage van 75 minuten voor zwangeren, ${MASSAGE.wanneerZwanger}. Bij ${MASSAGE.praktijk.naam} in Nieuwerkerk aan den IJssel.`,
    voorWie: `zwangeren, ${MASSAGE.wanneerZwanger}`,
    foto: IMAGES.massageZwanger,
    fotoAlt: "Marjolein met haar armen om zichzelf en haar ogen dicht",
    foto2: IMAGES.massageLavendel,
    foto2Alt: "Een takje lavendel tussen de vingers",
    ander: { pad: "/postpartummassage", kort: "Na de bevalling: postpartummassage", tekst: "Ben je al bevallen? De massage kan ook na de bevalling" },
  },
  postpartum: {
    pad: "/postpartummassage",
    titel: "Postpartummassage",
    meta: "Massage na de bevalling in Nieuwerkerk aan den IJssel | Studio Luna",
    beschrijving: `Lomi Lomi Hapai, een full body ontspanningsmassage van 75 minuten na de bevalling, ${MASSAGE.wanneerPostpartum}. Bij ${MASSAGE.praktijk.naam} in Nieuwerkerk aan den IJssel.`,
    voorWie: `moeders, ${MASSAGE.wanneerPostpartum}`,
    foto: IMAGES.massagePostpartum,
    fotoAlt: "Marjolein legt een hand op haar schouder",
    foto2: IMAGES.massageLiggend,
    foto2Alt: "Marjolein ligt ontspannen in het hoge gras",
    ander: { pad: "/zwangerschapsmassage", kort: "Nog zwanger: zwangerschapsmassage", tekst: "Ben je nog zwanger? De massage kan ook tijdens je zwangerschap" },
  },
} as const;

const PAKKETTEN_KORT = MASSAGE_PAKKETTEN.map((p) => `${p.aantal} massages €${p.prijs}`).join(", ");

/** De prijsregel bovenaan en in Praktisch; de introductieprijs valt na de einddatum vanzelf weg. */
function prijsRegel(intro: boolean) {
  return intro
    ? `${INTRODUCTIE_TEKST}. Daarna €${MASSAGE.prijs} per massage, of een pakket: ${PAKKETTEN_KORT}.`
    : `€${MASSAGE.prijs} per massage, of een pakket: ${PAKKETTEN_KORT}.`;
}

/** Een link als /zwangerschapsmassage?pakket=3#afspraak kiest het pakket alvast. */
function beginKeuze(): string {
  const gevraagd = new URLSearchParams(window.location.search).get("pakket") ?? "";
  return keuzeTekst(gevraagd) && gevraagd !== "los" ? gevraagd : "los";
}

const invoer =
  "px-4 py-3 rounded-[6px] border border-border/40 bg-card text-[15px] text-foreground placeholder:text-foreground/55";

function MassagePagina({ voor }: { voor: MassageVoor }) {
  const t = TEKST[voor];
  const faq = FAQ(voor);
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [dagdelen, setDagdelen] = useState<string[]>([]);
  const [bericht, setBericht] = useState("");
  const [gevonden, setGevonden] = useState("");
  const [keuze, setKeuze] = useState(beginKeuze);
  const intro = introductieLoopt();
  const [status, setStatus] = useState<"idle" | "bezig" | "klaar" | "fout">("idle");
  const [isBerichtOpen, setIsBerichtOpen] = useState(false);
  const [foutmelding, setFoutmelding] = useState("");

  const wissel = (code: string) =>
    setDagdelen((nu) => (nu.includes(code) ? nu.filter((c) => c !== code) : [...nu, code]));

  const vraagAan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dagdelen.length === 0) {
      setFoutmelding("Kies minstens één dagdeel dat je uitkomt");
      setStatus("fout");
      return;
    }
    setStatus("bezig");
    setFoutmelding("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/massage-aanvraag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Aan huis is er (nog) niet: de massage is altijd in de praktijk.
        body: JSON.stringify({ naam, email, telefoon, voor, plek: "praktijk", dagdelen, bericht, gevonden, keuze }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFoutmelding(data.error ?? "Er ging iets mis, probeer het nog eens");
        setStatus("fout");
      } else {
        setStatus("klaar");
      }
    } catch {
      setFoutmelding("Kan geen verbinding maken, probeer het nog eens");
      setStatus("fout");
    }
  };

  usePageMeta({
    title: t.meta,
    description: t.beschrijving,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: `${t.titel}: ${MASSAGE.naam}`,
        description: t.beschrijving,
        provider: { "@type": "LocalBusiness", name: "Studio Luna", url: "https://www.studiolunazuidplas.nl/" },
        areaServed: "Zuidplas",
        offers: [
          ...(intro
            ? [{ "@type": "Offer", name: `${MASSAGE.naam}, ${MASSAGE.duur}, introductieprijs eerste massage`, price: `${MASSAGE.introductieprijs}.00`, priceCurrency: "EUR", priceValidUntil: MASSAGE.introductieTot }]
            : []),
          { "@type": "Offer", name: `${MASSAGE.naam}, ${MASSAGE.duur}`, price: `${MASSAGE.prijs}.00`, priceCurrency: "EUR" },
          ...MASSAGE_PAKKETTEN.map((p) => ({
            "@type": "Offer", name: `${MASSAGE.naam}, pakket van ${p.aantal} massages, ${p.geldig} geldig`, price: `${p.prijs}.00`, priceCurrency: "EUR",
          })),
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.vraag,
          acceptedAnswer: { "@type": "Answer", text: f.antwoord },
        })),
      },
    ],
  });

  const praktisch = [
    { label: "Massage", waarde: `${MASSAGE.naam}, full body, ${MASSAGE.duur}` },
    { label: "Voor wie", waarde: t.voorWie },
    { label: "Waar", waarde: `bij ${MASSAGE.praktijk.naam}, ${MASSAGE.praktijk.adres}` },
    {
      label: "Prijs",
      waarde: prijsRegel(intro),
    },
    {
      label: "Pakketten",
      waarde: `${MASSAGE_PAKKETTEN.map((p) => `${p.aantal} massages €${p.prijs} (${p.geldig} geldig)`).join(", ")}, ${PAKKET_MENGEN}`,
    },
    {
      label: "Afspraak",
      waarde: (
        <a href="#afspraak" className="text-primary border-b border-primary/30 pb-0.5">
          via het formulier op deze pagina
        </a>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative overflow-x-hidden">

        {/* ── TITEL, met de foto ernaast ── */}
        <div className="px-7 md:px-14 lg:px-20 xl:px-28 pt-14 md:pt-12 pb-4 md:flex md:items-start md:gap-14">
          <div className="md:flex-1">
            <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
              {t.titel}
            </h1>
            <p className="text-foreground/60 text-[15px] mt-3">
              {MASSAGE.naam} · {MASSAGE.duur}
            </p>
            <p className="text-[15px] text-foreground/80 mt-4 max-w-xl">{prijsRegel(intro)}</p>
            <p className="text-sm text-foreground/65 mt-2">
              <Link href={t.ander.pad} className="text-primary border-b border-primary/30 pb-0.5 hover:border-primary">
                {t.ander.kort}
              </Link>
              {" · "}
              <Link href="/aanbod" className="text-primary border-b border-primary/30 pb-0.5 hover:border-primary">
                Alle aanbod en tarieven
              </Link>
            </p>
            <a
              href="#afspraak"
              className="inline-flex items-center mt-6 bg-primary text-primary-foreground px-7 py-3.5 rounded-[6px] font-semibold text-sm hover:bg-primary/88"
            >
              Vraag een afspraak aan
            </a>
          </div>

          <img
            src={t.foto}
            alt={t.fotoAlt}
            className="block w-full max-w-[320px] aspect-[2/3] object-cover mt-8 md:mt-0 shrink-0"
          />
        </div>

        {/* ── INTRO EN PRAKTISCH ── */}
        <section className="px-7 md:px-14 lg:px-20 xl:px-28 py-8 md:py-10">
          <div className="md:grid md:grid-cols-[1.2fr_1fr] md:gap-16 md:items-start">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-4">
                {teksten.kop}
              </h2>
              <p className="text-[15px] text-foreground/80 leading-[1.7] mb-4">{teksten.waarom}</p>
              <p className="text-[15px] text-foreground/80 leading-[1.7] mb-4">{teksten.watIsHet}</p>
              <p className="text-[15px] text-foreground/80 leading-[1.7] mb-4">{teksten.hoeHetGaat}</p>
              <p className="text-[15px] text-foreground/80 leading-[1.7] mb-4">
                {voor === "zwanger"
                  ? `Je kunt de massage krijgen ${MASSAGE.wanneerZwanger}, en ook na de bevalling.`
                  : `Je kunt de massage krijgen ${MASSAGE.wanneerPostpartum}, en ook al tijdens je zwangerschap.`}
              </p>
              <Link
                href={t.ander.pad}
                className="inline-flex items-center text-sm font-semibold text-primary border-b border-primary/35 pb-0.5 hover:border-primary"
              >
                {t.ander.tekst}
              </Link>
              {/* Pakketten stelt ze per persoon samen (haar idee, 18 november). */}
              <p className="text-[15px] text-foreground/80 leading-[1.7] mt-6">{teksten.pakket}</p>
              <p className="text-sm text-foreground/65 leading-[1.7] mt-3">
                <button
                  onClick={() => setIsBerichtOpen(true)}
                  className="font-semibold text-primary border-b border-primary/35 pb-0.5 hover:border-primary"
                >
                  Stuur een berichtje
                </button>
                {" "}over een pakket, of bekijk{" "}
                <Link href="/aanbod" className="font-semibold text-primary hover:text-primary/75">al het aanbod</Link>.
              </p>
            </div>

            <div className="mt-10 md:mt-0">
              <h2 className="font-display text-2xl font-medium text-foreground mb-3">Praktisch</h2>
              <div>
                {praktisch.map((r) => (
                  <div key={r.label} className="py-2 border-b border-border/15 text-sm leading-[1.65]">
                    <span className="font-semibold text-foreground/75">{r.label}</span>
                    <span className="text-foreground/75"> · {r.waarde}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── AFSPRAAK AANVRAGEN ── */}
        <section id="afspraak" className="px-7 md:px-14 lg:px-20 xl:px-28 py-8 md:py-10 scroll-mt-24">
          <div className="md:grid md:grid-cols-[1.4fr_1fr] md:gap-14 md:items-start">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-5">
              Een afspraak aanvragen
            </h2>
            <p className="text-[15px] text-foreground/80 leading-[1.7] mb-7">{teksten.afspraakUitleg}</p>

            {status === "klaar" ? (
              <p className="text-[15px] text-foreground/80 leading-[1.7] rounded-[6px] bg-primary/8 border border-primary/15 px-5 py-4">
                Dankjewel voor je aanvraag! Er staat een bevestiging in je mail, en ik neem
                contact met je op met een paar momenten waarop het kan.
              </p>
            ) : (
              <form onSubmit={vraagAan} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text" value={naam} onChange={(e) => setNaam(e.target.value)}
                    placeholder="Je naam" aria-label="Je naam" required maxLength={120}
                    className={`flex-1 ${invoer}`}
                  />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="jouw@email.nl" aria-label="Je e-mailadres" required
                    className={`flex-1 ${invoer}`}
                  />
                </div>
                <input
                  type="tel" value={telefoon} onChange={(e) => setTelefoon(e.target.value)}
                  placeholder="Je telefoonnummer" aria-label="Je telefoonnummer"
                  maxLength={40}
                  className={`w-full ${invoer}`}
                />

                <fieldset>
                  <legend className="text-sm font-semibold text-foreground/80 mb-2">Wat wil je aanvragen?</legend>
                  <div className="space-y-1.5 text-[15px] text-foreground/80">
                    {[
                      {
                        code: "los",
                        tekst: intro
                          ? `Een losse massage (€${MASSAGE.prijs}, je eerste massage €${MASSAGE.introductieprijs} tot en met ${MASSAGE.introductieTotTekst})`
                          : `Een losse massage (€${MASSAGE.prijs})`,
                      },
                      ...MASSAGE_PAKKETTEN.map((p) => ({
                        code: p.code as string,
                        tekst: `${p.aantal} massages (€${p.prijs}, ${p.geldig} geldig)`,
                      })),
                    ].map((o) => (
                      <label key={o.code} className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio" name="keuze" value={o.code}
                          checked={keuze === o.code} onChange={() => setKeuze(o.code)}
                          className="mt-1.5 w-4 h-4 accent-[hsl(var(--primary))]"
                        />
                        <span>{o.tekst}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-foreground/60 mt-2">Een pakket mag je vullen met {PAKKET_MENGEN}.</p>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold text-foreground/80 mb-2">Wanneer komt het je uit?</legend>
                  <table className="text-[14px] text-foreground/80 border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left font-normal pr-4 pb-1" />
                        {MASSAGE_DAGDELEN.map((deel) => (
                          <th key={deel} className="font-normal text-foreground/60 px-2 sm:px-4 pb-1">{deel}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MASSAGE_DAGEN.map((dag) => (
                        <tr key={dag.code} className="border-t border-border/15">
                          <td className="pr-4 py-1.5">{dag.naam}</td>
                          {MASSAGE_DAGDELEN.map((deel) => {
                            const code = `${dag.code}-${deel}`;
                            return (
                              <td key={code} className="text-center px-2 sm:px-4 py-1.5">
                                <input
                                  type="checkbox"
                                  checked={dagdelen.includes(code)}
                                  onChange={() => wissel(code)}
                                  aria-label={`${dag.naam}${deel}`}
                                  className="w-4 h-4 accent-[hsl(var(--primary))]"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </fieldset>

                {/* Zo ziet ze wie via Een Goed Begin komt (de korting van 18 november)
                    en welk kanaal werkt; niet verplicht. */}
                <label className="block">
                  <span className="text-sm font-semibold text-foreground/80">Hoe heb je me gevonden? (niet verplicht)</span>
                  <select
                    value={gevonden} onChange={(e) => setGevonden(e.target.value)}
                    className={`mt-2 block w-full sm:w-96 ${invoer}`}
                  >
                    <option value="">Kies een optie</option>
                    {teksten.gevondenOpties.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>

                <textarea
                  value={bericht} onChange={(e) => setBericht(e.target.value)}
                  placeholder="Nog iets dat je kwijt wilt? (niet verplicht)" aria-label="Bericht"
                  maxLength={1000} rows={3}
                  className={`w-full ${invoer}`}
                />

                <button
                  type="submit"
                  disabled={status === "bezig"}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-[6px] font-semibold text-sm hover:bg-primary/88 disabled:opacity-60"
                >
                  {status === "bezig" ? "Versturen…" : "Vraag een afspraak aan"}
                </button>
                {status === "fout" && <p className="text-xs text-red-600">{foutmelding}</p>}
              </form>
            )}
          </div>
            <img
              src={t.foto2}
              alt={t.foto2Alt}
              className="w-full max-w-[300px] object-cover mt-10 md:mt-16"
              style={{ aspectRatio: "2/3" }}
              loading="lazy"
            />
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-7 md:px-14 lg:px-20 xl:px-28 py-8 md:py-10">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15] mb-5">
            Goed om te weten
          </h2>
          <div className="md:max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              {faq.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border/20">
                  <AccordionTrigger className="text-left text-[15px] font-semibold text-foreground/80 hover:no-underline">
                    {item.vraag}
                  </AccordionTrigger>
                  <AccordionContent forceMount className="text-[15px] text-foreground/80 leading-[1.7]">
                    {item.antwoord}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <KennismakingModal isOpen={isBerichtOpen} onClose={() => setIsBerichtOpen(false)} />
        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}

export function Zwangerschapsmassage() {
  return <MassagePagina voor="zwanger" />;
}

export function Postpartummassage() {
  return <MassagePagina voor="postpartum" />;
}
