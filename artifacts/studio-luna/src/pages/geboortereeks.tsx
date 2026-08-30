import { useState, useEffect } from "react";
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
  { datum: "dinsdag 29 september" },
  { datum: "dinsdag 6 oktober" },
  { datum: "dinsdag 13 oktober" },
  { datum: "dinsdag 20 oktober" },
  { datum: "dinsdag 27 oktober" },
  { datum: "dinsdag 3 november" },
  { datum: "dinsdag 10 november", noot: "partnerles" },
  { datum: "dinsdag 17 november" },
  { datum: "voorjaar 2027", noot: "mama-en-babyyoga cadeau, datum volgt" },
];

const PRAKTISCH = [
  { label: "Start", waarde: "dinsdag 29 september, daarna elke week op dinsdag van 19:00 tot 20:15 uur" },
  { label: "Groep", waarde: "maximaal 8 zwangeren, een vaste groep" },
  { label: "Voor wie", waarde: "bij de start ben je tussen de 15 en 28 weken zwanger" },
  { label: "Locatie", waarde: "in Nieuwerkerk aan den IJssel, de leslocatie volgt binnenkort" },
  { label: "Inclusief", waarde: "goodiebag, reader en mama-en-babyyoga na afloop" },
  {
    label: "Prijs",
    waarde: (
      <>
        <span className="font-semibold text-foreground">€175</span> introductieprijs voor deze
        eerste groep, daarna €195
      </>
    ),
  },
  { label: "Aanmelden", waarde: "de groep wordt half september definitief, meld je voor die tijd aan" },
];

const INBEGREPEN = [
  "Acht wekelijkse lessen van 75 minuten op de dinsdagavond, plus mama-en-babyyoga cadeau zodra alle kindjes geboren zijn",
  "Een vaste groep van maximaal acht zwangeren, zodat je elkaar echt leert kennen",
  "Kennis van een fysiotherapeut over rust, houding en slaap en van een bekkenfysiotherapeut over je bekken en bekkenbodem",
  "Een complete bevallingsles en een partnerles waarin je geboortepartner tools krijgt om jou te ondersteunen",
  "Een mamaspa-avond met zelfmassage en restorative yoga die helemaal om ontspanning en herstel draait",
  "Elke week een oefening in de WhatsApp-groep, een goodiebag en tijd voor verbinding met andere mama's",
];

const FAQ_ITEMS = [
  {
    vraag: "Voor wie is de Geboortereeks?",
    antwoord: "Je kunt meedoen als je bij de start op 29 september tussen de 15 en 28 weken zwanger bent. Yoga-ervaring is niet nodig, alles wordt rustig opgebouwd en uitgelegd.",
  },
  {
    vraag: "Wat kost de reeks?",
    antwoord: "De Geboortereeks van acht wekelijkse lessen kost €195; deze eerste groep betaalt eenmalig de introductieprijs van €175. De mama-en-babyles na afloop krijg je cadeau.",
  },
  {
    vraag: "Hoe meld ik me aan?",
    antwoord: "Je meldt je aan met je naam en e-mailadres via de aanmeldknop op deze pagina. Daarna ontvang je persoonlijk het intakeformulier en de factuur per mail, en is je plekje gereserveerd.",
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
    antwoord: "De lessen zijn in Nieuwerkerk aan den IJssel, elke dinsdag van 19:00 tot 20:15 uur. De leslocatie volgt binnenkort.",
  },
  {
    vraag: "Wat is de mama-en-babyles?",
    antwoord: "Zodra alle kindjes geboren zijn komt de groep nog één keer samen voor mama-en-babyyoga, met de baby's erbij. Deze postpartumles is mijn cadeautje aan jullie.",
  },
];

// Aanmelden = naam en e-mailadres achterlaten; daarna stuurt Marjolein zelf het
// intakeformulier (Tally) en de factuur per mail. Geen online betaling.
const WHATSAPP_URL = "https://wa.me/31643735343?text=" + encodeURIComponent("Hoi! Ik heb een vraag over de Geboortereeks die op 29 september start.");

export default function Geboortereeks() {
  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "bezig" | "klaar" | "fout">("idle");
  const [foutmelding, setFoutmelding] = useState("");
  // Eerlijke plekkenteller: het aantal aanmeldingen komt van de server,
  // zodat er nooit een verzonnen schaarste op de pagina staat.
  const [aanmeldingen, setAanmeldingen] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/geboortereeks-plekken`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.aanmeldingen === "number") setAanmeldingen(d.aanmeldingen); })
      .catch(() => {});
  }, []);

  const meldAan = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("bezig");
    setFoutmelding("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/geboortereeks-aanmelding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam, email }),
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
    title: "De Geboortereeks: zwangerschapscursus Nieuwerkerk aan den IJssel",
    description: "Acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding in Nieuwerkerk aan den IJssel (Zuidplas), plus mama-en-babyyoga na afloop. Start dinsdag 29 september, maximaal 8 zwangeren, introductieprijs €175.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Studio Luna Geboortereeks",
        description: "Acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding plus mama-en-babyyoga na afloop, gevuld met kennis van een fysiotherapeut en een bekkenfysiotherapeut, met een partnerles en een mamaspa-avond.",
        provider: { "@type": "LocalBusiness", name: "Studio Luna", url: "https://www.studiolunazuidplas.nl/" },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "onsite",
          startDate: "2026-09-29",
          location: { "@type": "Place", name: "Nieuwerkerk aan den IJssel", address: { "@type": "PostalAddress", addressLocality: "Nieuwerkerk aan den IJssel", addressRegion: "Zuidplas", addressCountry: "NL" } },
        },
        offers: [
          { "@type": "Offer", name: "Geboortereeks, introductieprijs eerste groep", price: "175.00", priceCurrency: "EUR" },
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
            8-weekse zwangerschapsyoga- en geboortevoorbereidingsreeks
          </p>
          <p className="text-[15px] text-foreground/80 mt-4">
            Start dinsdag 29 september · €175 introductieprijs voor deze eerste groep, daarna €195
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
                Wat deze reeks bijzonder maakt: de lessen worden ook gevuld met kennis van een
                bekkenfysiotherapeut over je bekken en bekkenbodem en van een fysiotherapeut
                over rust en houding.
              </p>
              <p className="text-[15px] text-foreground/80 leading-[1.95]">
                En als alle kindjes geboren zijn, komt de groep nog één keer samen voor
                mama-en-babyyoga; deze postpartumles is mijn cadeautje aan jullie. Zo begint je
                moederschap met een groep vrouwen die je echt hebt leren kennen.
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
        <section id="aanmelden" className="px-7 md:px-14 lg:px-18 py-10 md:py-14 scroll-mt-24">
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
            {aanmeldingen !== null && aanmeldingen > 0 && (
              <p className="text-sm font-semibold text-primary mb-3">
                {aanmeldingen >= 8
                  ? "Alle acht plekken hebben een aanmelding."
                  : `Nog ${8 - aanmeldingen} van de acht plekken vrij.`}
              </p>
            )}
            <p className="text-[15px] text-foreground/80 leading-[1.9] mb-7">
              Er is plek voor acht zwangeren en de groep wordt half september definitief. Je
              kunt meedoen als je bij de start tussen de 15 en 28 weken zwanger bent. Meld je
              aan met je naam en e-mailadres; daarna stuur ik je persoonlijk het
              intakeformulier en de factuur per mail, en is je plekje gereserveerd.
            </p>

            {status === "klaar" ? (
              <p className="text-[15px] text-foreground/80 leading-[1.9] rounded-2xl bg-primary/8 border border-primary/15 px-5 py-4">
                Dankjewel voor je aanmelding! Er staat een bevestiging in je mail, en daarna
                ontvang je van mij persoonlijk het intakeformulier en de factuur; dan is je
                plek definitief.
              </p>
            ) : (
              <form onSubmit={meldAan} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={naam}
                    onChange={(e) => setNaam(e.target.value)}
                    placeholder="Je naam"
                    aria-label="Je naam"
                    required
                    maxLength={120}
                    className="flex-1 px-4 py-3 rounded-2xl border border-border/40 bg-card text-[15px] text-foreground placeholder:text-foreground/55"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jouw@email.nl"
                    aria-label="Je e-mailadres"
                    required
                    className="flex-1 px-4 py-3 rounded-2xl border border-border/40 bg-card text-[15px] text-foreground placeholder:text-foreground/55"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "bezig"}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary/88 disabled:opacity-60 shadow-soft group"
                >
                  {status === "bezig" ? "Versturen…" : "Meld je aan"}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                {status === "fout" && <p className="text-xs text-red-600">{foutmelding}</p>}
              </form>
            )}

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
                Een complete geboortevoorbereiding
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
                Acht lessen, één reis
              </h2>
            </motion.div>

            <div className="max-w-md">
              {KALENDER.map((les, i) => (
                <motion.p
                  key={les.datum}
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, margin: "-40px" }} custom={Math.min(i * 0.03, 0.15)}
                  className="text-[15px] text-foreground/80 leading-[1.9] py-3 border-b border-border/15"
                >
                  {les.datum}
                  {les.noot && <span className="text-foreground/55"> ({les.noot})</span>}
                </motion.p>
              ))}
            </div>
            <p className="text-sm text-foreground/65 leading-[1.85] mt-5">
              Kun je een keer een les niet? Dan haal je de les in bij een volgend blok, of we
              kijken samen naar een passende oplossing.
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
              Geboortereeks zelf en vul ze aan met kennis van een fysiotherapeut en een
              bekkenfysiotherapeut. Bij Studio Luna combineer ik gevoel en wetenschap: je
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
              href="#aanmelden"
              className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-primary group"
            >
              Meld je aan voor 29 september
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </motion.div>
        </section>

        <InterestModal
          isOpen={isInterestOpen}
          onClose={() => setIsInterestOpen(false)}
          title="Interesselijst Geboortereeks"
          description="Laat je e-mailadres achter en ik houd je op de hoogte van de Geboortereeks en volgende startdata. Vrijblijvend, je zit nergens aan vast."
          successDescription="Ik houd je op de hoogte van de Geboortereeks en de volgende startdata."
        />
        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
