import { useState } from "react";
import { Link } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePageMeta } from "@/lib/seo";
import { IMAGES } from "@/lib/images";
import {
  MASSAGE, MASSAGE_DAGEN, MASSAGE_DAGDELEN, type MassageVoor,
} from "../../../api-server/src/lib/massage";

// Twee pagina's, één massage (haar keuze 18 november 2026): Lomi Lomi Hapai
// voor zwangeren op /zwangerschapsmassage en na de bevalling op
// /postpartummassage. Naam, prijzen en plekken komen uit massage.ts, zodat
// pagina's en bevestigingsmail altijd hetzelfde zeggen.
//
// De openingszin over Lomi Lomi Hapai is van Marjolein zelf (18 november).

// Haar tekst over waarom ze masseert (18 november 2026), uit een concept dat
// ze aanpaste: de alinea over haar eigen zwangerschap ging eruit, want de
// aandacht hoort niet op haar te liggen. Hoe ze ligt staat al bij "Hoe de
// massage gaat", dus dat staat hier niet nog een keer.
const WAAROM = [
  "Met Studio Luna wil ik een community creëren waarin we als vrouwen voor elkaar zorgen. It takes a village, en daar hoort voor mij ook bij dat er af en toe voor jóu gezorgd wordt. Met deze ontspanningsmassage geef ik je een moment van rust. Niet voor niets betekent Hāpai in het Hawaïaans zwanger, maar ook dragen en ondersteunen: jij draagt de hele dag, en nu word je even gedragen. Deze 75 minuten zijn helemaal voor jou.",
];

const HAAR_ZIN =
  "Lomi Lomi Hapai is een full body ontspanningsmassage. Lomi lomi is een eeuwenoude massagevorm uit Hawaï, met wortels in de Polynesische massagetradities.";

// Alleen deze twee regels, haar keuze van 18 november: bijpraten vooraf en
// het glas water na afloop vond ze overbodig.
const VERLOOP = [
  "Je ligt op je zij, met kussens onder je hoofd en tussen je knieën en armen, onder een grote doek",
  "Een massage met warme olie over je hele lichaam, eerst op de ene zij en daarna op de andere",
];

const FAQ = (voor: MassageVoor) => [
  {
    vraag: "Wanneer kan ik een massage krijgen?",
    antwoord: `De massage kan ${MASSAGE.wanneerZwanger}, en na de bevalling ${MASSAGE.wanneerPostpartum}. Ben je bevallen met een keizersnede, stuur me dan even een berichtje, dan kijken we samen wat prettig is.`,
  },
  {
    vraag: "Waarom op mijn zij?",
    antwoord: voor === "zwanger"
      ? "Met een groeiende buik is lang op je rug liggen niet prettig, en op je buik kan niet. Op je zij, goed ondersteund door kussens, lig je comfortabel en kan ik overal bij."
      : "Na de bevalling zijn je buik en borsten vaak nog gevoelig. Op je zij, goed ondersteund door kussens, lig je comfortabel en kan ik overal bij.",
  },
  {
    vraag: "Wat moet ik meenemen?",
    antwoord: "Niets. Kussens, doeken en olie zijn er. Doe makkelijke kleding aan; tijdens de massage houd je je onderbroek aan en lig je onder een doek.",
  },
  {
    vraag: "Wanneer liever niet?",
    antwoord: "Heb je bloedverlies, koorts of buikpijn, of heeft je verloskundige je gevraagd het rustig aan te doen, overleg dan eerst met je verloskundige of een massage nu verstandig is.",
  },
  {
    vraag: "Vergoedt mijn zorgverzekeraar de massage?",
    antwoord: "Een ontspanningsmassage wordt meestal niet vergoed door de zorgverzekeraar.",
  },
  {
    vraag: "Hoe maak ik een afspraak?",
    antwoord: "Vul het formulier op deze pagina in en kruis de dagdelen aan die je goed uitkomen. Ik neem dan contact met je op met een paar momenten waarop het kan, en dan staat je afspraak vast.",
  },
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
  const [status, setStatus] = useState<"idle" | "bezig" | "klaar" | "fout">("idle");
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
        body: JSON.stringify({ naam, email, telefoon, voor, plek: "praktijk", dagdelen, bericht }),
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
          { "@type": "Offer", name: `${MASSAGE.naam}, ${MASSAGE.duur}, introductieprijs`, price: `${MASSAGE.introductieprijs}.00`, priceCurrency: "EUR" },
          { "@type": "Offer", name: `${MASSAGE.naam}, ${MASSAGE.duur}`, price: `${MASSAGE.prijs}.00`, priceCurrency: "EUR" },
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
      waarde: (
        <>
          <span className="font-semibold text-foreground">€{MASSAGE.introductieprijs}</span> introductieprijs,
          daarna €{MASSAGE.prijs}
        </>
      ),
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
            <p className="text-[15px] text-foreground/80 mt-4">
              €{MASSAGE.introductieprijs} introductieprijs, daarna €{MASSAGE.prijs}
            </p>
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
                Even voor jou gezorgd
              </h2>
              {WAAROM.map((alinea) => (
                <p key={alinea.slice(0, 20)} className="text-[15px] text-foreground/80 leading-[1.7] mb-4">{alinea}</p>
              ))}
              <p className="text-[15px] text-foreground/80 leading-[1.7] mb-4">{HAAR_ZIN}</p>
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

        {/* ── HOE HET GAAT ── */}
        <section className="px-7 md:px-14 lg:px-20 xl:px-28 py-8 md:py-10">
          <div className="md:grid md:grid-cols-[1.4fr_1fr] md:gap-14 md:items-start">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-5">
                Hoe de massage gaat
              </h2>
              <div className="max-w-2xl">
                {VERLOOP.map((stap) => (
                  <p key={stap} className="py-2 border-b border-border/15 text-[15px] text-foreground/80">
                    {stap}
                  </p>
                ))}
              </div>
            </div>
            <img
              src={t.foto2}
              alt={t.foto2Alt}
              className="w-full max-w-[300px] object-cover mt-8 md:mt-0"
              style={{ aspectRatio: "2/3" }}
              loading="lazy"
            />
          </div>
        </section>

        {/* ── AFSPRAAK AANVRAGEN ── */}
        <section id="afspraak" className="px-7 md:px-14 lg:px-20 xl:px-28 py-8 md:py-10 scroll-mt-24">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-5">
              Een afspraak aanvragen
            </h2>
            <p className="text-[15px] text-foreground/80 leading-[1.7] mb-7">
              Kruis de dagdelen aan die je goed uitkomen. Ik neem daarna contact met je op met een
              paar momenten waarop het kan, en dan staat je afspraak vast.
            </p>

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
