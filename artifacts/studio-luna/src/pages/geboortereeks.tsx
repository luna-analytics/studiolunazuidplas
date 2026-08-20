import { useState } from "react";
import { Link } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { InterestModal } from "@/components/interest-modal";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePageMeta } from "@/lib/seo";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] as [number, number, number, number], delay },
  }),
};

const KALENDER = [
  { les: 1, datum: "di 29 september", thema: "Adem als anker", detail: "Kennismaking en de basis van alle ademtechnieken" },
  { les: 2, datum: "di 6 oktober", thema: "Gronden en kracht", detail: "Kracht opbouwen en oefenen met het opvangen van een wee" },
  { les: 3, datum: "di 13 oktober", thema: "Rust, houding en slaap", detail: "Met een gastblok van een fysiotherapeut" },
  { les: 4, datum: "di 20 oktober", thema: "Mamaspa", detail: "Een avond vol ontspanning, warmte en zelfmassage" },
  { les: 5, datum: "di 27 oktober", thema: "Bekken en bekkenbodem", detail: "Met een gastblok van een bekkenfysiotherapeut" },
  { les: 6, datum: "di 3 november", thema: "De Bevallingsles", detail: "75 minuten pure geboortevoorbereiding" },
  { les: 7, datum: "di 10 november", thema: "Partnerles", detail: "Je geboortepartner leert hoe die je echt kan helpen" },
  { les: 8, datum: "di 17 november", thema: "Vertrouwen en loslaten", detail: "Alles komt samen, met een lange yoga nidra" },
  { les: 9, datum: "voorjaar 2027", thema: "Terugkomles met de baby's", detail: "Zodra alle kindjes geboren zijn, inbegrepen in de prijs" },
];

const PRAKTISCH = [
  { label: "Start", waarde: "dinsdag 29 september, daarna elke week op dinsdag van 19:00 tot 20:15 uur" },
  { label: "Groep", waarde: "maximaal 8 zwangeren, een vaste groep" },
  { label: "Voor wie", waarde: "bij de start ben je tussen de 15 en 28 weken zwanger" },
  { label: "Locatie", waarde: "Huize Mooisteen, Pr. Beatrixstraat 2, Nieuwerkerk aan den IJssel" },
  { label: "Inclusief", waarde: "goodiebag, reader, twee gastexperts en de mama-en-babyles" },
  { label: "Prijs", waarde: "€195; de eerste groep betaalt eenmalig de introductieprijs van €175" },
];

const INBEGREPEN = [
  "Acht wekelijkse lessen van 75 minuten op de dinsdagavond, plus de mama-en-babyles als negende les",
  "Een vaste groep van maximaal acht zwangeren, zodat je elkaar echt leert kennen",
  "Twee gastexperts: een fysiotherapeut over rust, houding en slaap en een bekkenfysiotherapeut over je bekken en bekkenbodem",
  "Een complete bevallingsles en een partnerles waarin je geboortepartner concrete technieken leert",
  "Een mamaspa-avond die helemaal om ontspanning en herstel draait",
  "Een goodiebag met de reader Voor in de kraamtas, en na elke les thee en tijd voor verbinding",
];

const FAQ_ITEMS = [
  {
    vraag: "Voor wie is de Geboortereeks?",
    antwoord: "Je kunt meedoen als je bij de start op 29 september tussen de 15 en 28 weken zwanger bent. Yoga-ervaring is niet nodig, alles wordt rustig opgebouwd en uitgelegd.",
  },
  {
    vraag: "Wat kost de reeks?",
    antwoord: "De Geboortereeks kost €195 voor negen lessen. De eerste groep, die op 29 september start, betaalt eenmalig de introductieprijs van €175.",
  },
  {
    vraag: "Hoe meld ik me aan?",
    antwoord: "Je reserveert je plekje door het intakeformulier in te vullen. Daarna ontvang je persoonlijk bericht met de bevestiging en de factuur.",
  },
  {
    vraag: "Wordt de reeks vergoed door mijn zorgverzekering?",
    antwoord: "Veel zorgverzekeraars vergoeden een zwangerschapscursus geheel of gedeeltelijk vanuit de aanvullende verzekering. Je ontvangt na aanmelding een factuur die je zelf kunt indienen bij je zorgverzekeraar. Of en hoeveel er vergoed wordt verschilt per polis, dus check vooraf je polisvoorwaarden; aan deze informatie kunnen geen rechten worden ontleend.",
  },
  {
    vraag: "Is mijn partner er ook bij?",
    antwoord: "Ja, les 7 op dinsdag 10 november is de partnerles. Je geboortepartner leert daar ademtechnieken, massage en bevalhoudingen waarmee die jou tijdens de bevalling echt kan ondersteunen.",
  },
  {
    vraag: "Waar en hoe laat zijn de lessen?",
    antwoord: "De lessen zijn bij Huize Mooisteen, Pr. Beatrixstraat 2 in Nieuwerkerk aan den IJssel, elke dinsdag van 19:00 tot 20:15 uur.",
  },
  {
    vraag: "Wat als ik een les mis?",
    antwoord: "Kun je een les niet volgen, dan haal je die in bij een volgende reeks, of we kijken samen naar een passende oplossing.",
  },
  {
    vraag: "Wat is de mama-en-babyles?",
    antwoord: "Zodra alle kindjes geboren zijn komt de groep nog één keer samen, met de baby's erbij. Deze terugkomles is de negende les van de reeks en is inbegrepen in de prijs.",
  },
];

// Reserveren loopt via het intakeformulier: invullen, en je ontvangt daarna
// persoonlijk bericht met de bevestiging en de factuur. Geen online betaling.
const INTAKE_URL = "https://tally.so/r/XxED7j";
const WHATSAPP_URL = "https://wa.me/31643735343?text=" + encodeURIComponent("Hoi! Ik heb een vraag over de Geboortereeks die op 29 september start.");

export default function Geboortereeks() {
  const [isInterestOpen, setIsInterestOpen] = useState(false);

  usePageMeta({
    title: "De Geboortereeks: zwangerschapscursus in Nieuwerkerk aan den IJssel, start 29 september | Studio Luna",
    description: "Negen lessen zwangerschapsyoga en geboortevoorbereiding in Nieuwerkerk aan den IJssel (Zuidplas). Start dinsdag 29 september, maximaal 8 zwangeren, met bekkenfysiotherapeut, partnerles en mama-en-babyles. Introductieprijs €175.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Studio Luna Geboortereeks",
        description: "Negen lessen zwangerschapsyoga en geboortevoorbereiding: acht wekelijkse lessen plus een mama-en-babyles, met gastblokken van een fysiotherapeut en een bekkenfysiotherapeut, een partnerles en een mamaspa-avond.",
        provider: { "@type": "LocalBusiness", name: "Studio Luna", url: "https://www.studiolunazuidplas.nl/" },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "onsite",
          startDate: "2026-09-29",
          location: { "@type": "Place", name: "Nieuwerkerk aan den IJssel", address: { "@type": "PostalAddress", addressLocality: "Nieuwerkerk aan den IJssel", addressRegion: "Zuidplas", addressCountry: "NL" } },
        },
        offers: [
          { "@type": "Offer", name: "Introductieprijs eerste groep", price: "175.00", priceCurrency: "EUR" },
          { "@type": "Offer", name: "Geboortereeks", price: "195.00", priceCurrency: "EUR" },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((f) => ({
          "@type": "Question",
          name: f.vraag,
          acceptedAnswer: { "@type": "Answer", text: f.antwoord },
        })),
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative overflow-x-hidden">

        {/* ── TITEL ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="px-7 md:px-14 lg:px-18 pt-14 md:pt-12 pb-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-primary/40" />
            Start dinsdag 29 september
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
            De <em className="not-italic text-primary">Geboortereeks</em>
          </h1>
          <p className="text-foreground/60 text-sm mt-3 tracking-wide">
            Negen lessen zwangerschapsyoga en geboortevoorbereiding
          </p>
        </motion.div>

        {/* ── INTRO ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />
          <div className="relative md:grid md:grid-cols-[1.2fr_1fr] md:gap-16 md:items-start">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-60px" }} custom={0}
            >
              <p className="text-[15px] text-foreground/80 leading-[1.95] mb-4">
                In de Geboortereeks bereid je je in een kleine vaste groep voor op je bevalling.
                Elke week combineren we yoga en ademwerk met één concreet onderdeel van de
                bevalling, van het opvangen van weeën tot bevalhoudingen en het gebruik van
                klank. Er zit een volledige bevallingsles in, een partnerles en een mamaspa-avond
                die helemaal om ontspanning draait.
              </p>
              <p className="text-[15px] text-foreground/80 leading-[1.95] mb-4">
                Wat deze reeks bijzonder maakt: een bekkenfysiotherapeut vult een les mee in over
                je bekken en bekkenbodem, en een fysiotherapeut verzorgt een blok over houding,
                slaap en ontspanning. Dat vind je bij vrijwel geen enkele andere cursus in de
                regio.
              </p>
              <p className="text-[15px] text-foreground/80 leading-[1.95]">
                En als alle kindjes geboren zijn, komt de groep nog één keer samen voor de
                mama-en-babyles. Zo begint je moederschap met een groep vrouwen die je echt hebt
                leren kennen.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-60px" }} custom={0.15}
              className="mt-10 md:mt-0"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-4">Praktisch</p>
              <div>
                {PRAKTISCH.map((r) => (
                  <div key={r.label} className="py-3 border-b border-border/15 text-sm leading-[1.8]">
                    <span className="font-semibold text-foreground/75">{r.label}</span>
                    <span className="text-foreground/75"> · {r.waarde}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-foreground/60 leading-[1.8] mt-4">
                Veel aanvullende verzekeringen vergoeden een zwangerschapscursus geheel of
                gedeeltelijk; hoe dat werkt lees je bij de veelgestelde vragen onderaan.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── AANMELDEN ── */}
        <section className="px-7 md:px-14 lg:px-18 py-10 md:py-14">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-40px" }} custom={0}
            className="max-w-2xl"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-4 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary/40" />
              Aanmelden
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-5">
              Wil je erbij zijn op 29 september?
            </h2>
            <p className="text-[15px] text-foreground/80 leading-[1.9] mb-7">
              Er is plek voor acht zwangeren. Je reserveert je plekje door het intakeformulier
              in te vullen; daarna krijg je persoonlijk bericht met de bevestiging en de factuur.
            </p>
            <a
              href={INTAKE_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary/88 shadow-soft group"
            >
              Reserveer je plekje
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <p className="text-sm text-foreground/65 leading-[1.9] mt-5">
              Eerst iets vragen? Stuur gerust een{" "}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:text-primary/75">
                appje
              </a>
              . Nog niet zeker? Zet je{" "}
              <button onClick={() => setIsInterestOpen(true)} className="text-primary font-semibold hover:text-primary/75">
                vrijblijvend op de interesselijst
              </button>
              .
            </p>
          </motion.div>
        </section>

        {/* ── WAT ZIT ERIN ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/25 to-background pointer-events-none" />
          <div className="relative max-w-3xl">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-60px" }} custom={0}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Wat zit erin
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-8 leading-[1.15]">
                De meest complete geboortevoorbereiding in Zuidplas
              </h2>
            </motion.div>

            <div>
              {INBEGREPEN.map((tekst, i) => (
                <motion.p
                  key={i}
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, margin: "-40px" }} custom={Math.min(i * 0.05, 0.2)}
                  className="text-[15px] text-foreground/80 leading-[1.9] py-4 border-b border-border/15"
                >
                  {tekst}
                </motion.p>
              ))}
            </div>
          </div>
        </section>

        {/* ── WEEKOVERZICHT ── */}
        <section className="px-7 md:px-14 lg:px-18 py-12 md:py-16">
          <div className="max-w-3xl">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-60px" }} custom={0}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Week voor week
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-8 leading-[1.15]">
                Negen lessen, één reis
              </h2>
            </motion.div>

            <div>
              {KALENDER.map((les, i) => (
                <motion.div
                  key={les.les}
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, margin: "-40px" }} custom={Math.min(i * 0.04, 0.2)}
                  className="md:grid md:grid-cols-[150px_1fr] flex flex-col gap-0.5 md:gap-6 py-4 border-b border-border/15 md:items-baseline"
                >
                  <p className="text-sm font-semibold text-foreground/65">{les.datum}</p>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">{les.thema}</p>
                    <p className="text-sm text-foreground/60 mt-0.5">{les.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-foreground/55 leading-[1.8] mt-5">
              Les 4 valt in de herfstvakantie. In overleg met de groep kan die week worden
              overgeslagen, de reeks eindigt dan een week later.
            </p>
          </div>
        </section>

        {/* ── WIE GEEFT DE LESSEN ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-60px" }} custom={0}
            className="relative max-w-2xl"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary/40" />
              Wie je lesgeeft
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15] mb-6">
              Hoi, ik ben Marjolein
            </h2>
            <p className="text-[15px] text-foreground/80 leading-[1.95]">
              Moeder, gepromoveerd onderzoeker en yogadocente. Ik geef alle lessen van de
              Geboortereeks zelf en haal er voor twee lessen een fysiotherapeut en een
              bekkenfysiotherapeut bij. Bij Studio Luna combineer ik gevoel en wetenschap: je
              bereidt je sterk en met vertrouwen voor op je bevalling, en je leert andere
              moeders uit Zuidplas kennen.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6">
              <Link
                href="/over-mij"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary group"
              >
                Lees mijn verhaal
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="https://maps.google.com/?cid=994021316573595651"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary group"
              >
                Lees de ervaringen op Google
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-7 md:px-14 lg:px-18 py-12 md:py-16">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-60px" }} custom={0}
            className="mb-8"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary/40" />
              Veelgestelde vragen
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15]">
              Goed om te weten
            </h2>
          </motion.div>
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-60px" }} custom={0.1}
            className="md:max-w-2xl"
          >
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border/20">
                  <AccordionTrigger className="text-left text-[15px] font-semibold text-foreground/80 hover:no-underline">
                    {item.vraag}
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] text-foreground/80 leading-[1.85]">
                    {item.antwoord}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <a
              href={INTAKE_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-primary group"
            >
              Reserveer je plekje
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </motion.div>
        </section>

        <InterestModal
          isOpen={isInterestOpen}
          onClose={() => setIsInterestOpen(false)}
          title="Interesselijst Geboortereeks"
          description="Laat je e-mailadres achter en we houden je op de hoogte van de Geboortereeks en volgende startdata. Vrijblijvend, je zit nergens aan vast."
          successDescription="We houden je op de hoogte van de Geboortereeks en de volgende startdata."
        />
        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
