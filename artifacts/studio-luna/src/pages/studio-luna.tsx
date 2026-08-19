import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { CtaBlock } from "@/components/cta-block";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Mail, Phone, Instagram, Star, Calendar, BookOpen } from "lucide-react";
import { IMAGES } from "@/lib/images";
import { useAuth } from "@/hooks/use-auth";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Review = { id: string; name: string; role: string; text: string; stars: number };
type ReviewsConfig = { visible: boolean; items: Review[] };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const DEFAULT_TEKSTEN = {
  cta_url: "/geboortereeks",
  cta_label: "Bekijk de Geboortereeks",
  home_hero: "It takes a village.\nStudio Luna is jouw mama tribe.",
  home_missie_heading: "Een plek om\nte landen.",
  home_missie_tekst: "Het moederschap hoef je niet alleen te doen. De missie van Studio Luna is het faciliteren van een community voor alle vrouwen in Nieuwerkerk aan den IJssel en omgeving, van zwangerschap tot ver daarna. Een veilige haven om fysiek op te laden, mentaal tot rust te komen en bovenal in verbinding te staan met andere moeders in dezelfde fase.",
  home_missie_bullets: "Een plek om te landen.\nEen plek om fysiek sterk, gezond en in balans te blijven.\nEen plek om vertrouwen te vinden in je veranderende lichaam.\nEen plek om te connecten met andere moeders.\nStudio Luna is jouw mama tribe.",
  home_village_tagline: "Welkom in jouw village.",
  home_aanbod_heading: "Alles wat je nodig hebt\nop weg naar de bevalling.",
  home_aanbod_items: "Kleine groepen, veel aandacht en persoonlijk contact.\nZwangerschapsyoga: bevalling voorbereiden, kracht van de adem en fysieke balans.\nNa afloop altijd tijd voor een kopje thee en verbinding.\nEen vaste groep die samen naar de bevalling toewerkt.\nWhatsApp-community voor vragen en tips tussen lessen door.\nAandacht voor zowel het fysieke als het mentale aspect van moederschap.",
  home_locatie_naam: "Huize Mooisteen",
  home_locatie_adres: "Pr. Beatrixstraat 2\nNieuwerkerk aan den IJssel",
  home_contact_email: "info@studiolunazuidplas.nl",
  home_contact_telefoon: "+31 6 43 73 53 43",
  home_contact_instagram: "@studiolunazuidplas",
  foto_hero: "",
  foto_hero_positie: "center",
  over_mij_foto: "",
};

const FAQ_ITEMS = [
  {
    vraag: "Vanaf hoeveel weken kan ik meedoen?",
    antwoord: "De Geboortereeks past het beste als je bij de start tussen de 22 en 28 weken zwanger bent. De eerstvolgende reeks start op dinsdag 29 september.",
  },
  {
    vraag: "Heb ik yoga-ervaring nodig?",
    antwoord: "Nee, ervaring is niet nodig. De lessen worden rustig opgebouwd en stap voor stap uitgelegd, in een kleine groep met veel persoonlijke aandacht.",
  },
  {
    vraag: "Wat kost het?",
    antwoord: "De Geboortereeks van negen lessen kost €195. De eerste groep, die op 29 september start, betaalt eenmalig de introductieprijs van €175.",
  },
  {
    vraag: "Waar zijn de lessen?",
    antwoord: "Bij Huize Mooisteen, Pr. Beatrixstraat 2 in Nieuwerkerk aan den IJssel.",
  },
  {
    vraag: "Hoe werkt de eerste les?",
    antwoord: "Voor je eerste les vul je een korte intake in, zodat de les goed op jou en je zwangerschap afgestemd kan worden.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1], delay },
  }),
};

export default function StudioLuna() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [teksten, setTeksten] = useState(DEFAULT_TEKSTEN);
  const [reviewsConfig, setReviewsConfig] = useState<ReviewsConfig | null>(null);

  useEffect(() => {
    document.title = "Studio Luna – Zwangerschapsyoga Nieuwerkerk aan den IJssel | Mama Community Zuidplas";
  }, []);

  useEffect(() => {
    fetch(`${BASE}/api/pagina-teksten`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        // Lege velden overschrijven de standaardtekst niet
        const gevuld = Object.fromEntries(Object.entries(d).filter(([, v]) => v !== ""));
        setTeksten((prev) => ({ ...prev, ...gevuld }));
      })
      .catch(() => {});

    const token = localStorage.getItem("sl_token");
    const reviewsUrl = token ? `${BASE}/api/admin/reviews` : `${BASE}/api/reviews`;
    const reviewsHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(reviewsUrl, { headers: reviewsHeaders })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setReviewsConfig(d); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative overflow-x-hidden">

        {/* ── HERO — full-bleed, tekst zweeft over foto ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          className="relative overflow-hidden md:mx-6 md:mt-6 md:rounded-3xl"
          style={{ minHeight: "clamp(420px, 65vw, 720px)" }}
        >
          <img
            src={teksten.foto_hero || IMAGES.hero}
            alt="Zwangerschapsyoga Studio Luna"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: teksten.foto_hero_positie || "center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75 md:bg-gradient-to-r md:from-black/65 md:via-black/35 md:to-transparent" />

          <div className="relative z-10 flex flex-col justify-end md:justify-center px-7 md:px-14 lg:px-18 pt-24 pb-12 md:py-20" style={{ minHeight: "clamp(420px, 65vw, 720px)" }}>
            <div className="md:max-w-lg">
              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/55 mb-4"
              >
                Nieuwerkerk aan den IJssel · Zuidplas
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="font-display text-[2.6rem] md:text-5xl font-medium text-white leading-[1.1] mb-7"
              >
                {teksten.home_hero.split("\n").map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="flex flex-wrap gap-3"
              >
                <button
                  onClick={() => navigate(teksten.cta_url)}
                  className="inline-flex items-center gap-2 bg-white text-foreground px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-white/92 shadow-md group"
                >
                  {teksten.cta_label}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate("/geboortezorg-zuidplas")}
                  className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-sm border border-white/25 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-white/22"
                >
                  Ontdek de zorgkaart
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── GEBOORTEREEKS AANKONDIGING ── */}
        <section className="px-7 md:px-14 lg:px-18 pt-14 md:pt-20">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-40px" }} custom={0}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary/40" />
              Nieuw
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15] mb-6">
              De Geboortereeks start <em className="not-italic text-primary">29 september</em>
            </h2>
            <p className="text-[15px] text-foreground/60 leading-[1.95] max-w-2xl mb-8">
              Negen lessen zwangerschapsyoga en geboortevoorbereiding in een vaste groep van
              maximaal acht zwangeren, met onder meer een bekkenfysiotherapeut, een partnerles
              en een mama-en-babyles.
            </p>
            <button
              onClick={() => navigate("/geboortereeks")}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary/88 shadow-soft group"
            >
              Lees alles en meld je aan
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </motion.div>
        </section>

        {/* ── MISSIE — editorial: label + grote heading + asymmetrisch ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-24 md:py-32">
          {/* Subtiele achtergrond-overgang */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background pointer-events-none" />

          <div className="relative">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} custom={0}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                De missie
              </p>
            </motion.div>

            <div className="md:grid md:grid-cols-[1fr_1.2fr] md:gap-20 md:items-start">

              {/* Linker kolom — bullets + quote */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-80px" }} custom={0.1}
              >
                <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1] mb-10">
                  {teksten.home_missie_heading.split("\n").map((line, i, arr) => (
                    <span key={i}>{i === arr.length - 1
                      ? <em className="not-italic text-primary">{line}</em>
                      : <>{line}<br /></>}
                    </span>
                  ))}
                </h2>
                <ul className="space-y-5">
                  {teksten.home_missie_bullets.split("\n").filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-[15px] text-foreground/65 leading-[1.9]">
                      <span className="mt-[11px] w-1 h-1 rounded-full bg-primary/70 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Rechter kolom — tekst, iets verlaagd voor dynamiek */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-80px" }} custom={0.2}
                className="md:pt-20"
              >
                <p className="text-[15px] text-foreground/55 leading-[1.95]">
                  {teksten.home_missie_tekst}
                </p>
                <p className="mt-8 text-sm font-semibold text-foreground/60 tracking-widest uppercase">
                  {teksten.home_village_tagline}
                </p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── WAT BIEDT STUDIO LUNA — geen kaart, vrij zwevend ── */}
        <section className="px-7 md:px-14 lg:px-18 py-16 md:py-24">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-80px" }} custom={0}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary/40" />
              Wat we bieden
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-14 leading-[1.15]">
              {teksten.home_aanbod_heading.split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br className="hidden md:block" />}</span>
              ))}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            {teksten.home_aanbod_items.split("\n").filter(Boolean).map((tekst, i) => ({
              n: String(i + 1).padStart(2, "0"), tekst,
            })).map((item, i) => (
              <motion.div
                key={item.n}
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-60px" }} custom={i * 0.07}
                className="flex items-start gap-5 pb-8 border-b border-border/15 last:border-0"
              >
                <span className="font-display text-2xl text-primary/25 font-medium leading-none mt-0.5 shrink-0">{item.n}</span>
                <p className="text-[15px] text-foreground/60 leading-[1.9]">{item.tekst}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── SNELLE LINKS — interne navigatie naar rooster / tarieven / aanbod ── */}
        <section className="px-7 md:px-14 lg:px-18 py-6 md:py-10">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-40px" }} custom={0}
            className="flex flex-wrap gap-3"
          >
            <button
              onClick={() => navigate("/geboortereeks")}
              className="inline-flex items-center gap-2 border border-primary/25 text-primary/80 hover:bg-primary/5 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              De Geboortereeks
            </button>
            <button
              onClick={() => navigate("/geboortezorg-zuidplas")}
              className="inline-flex items-center gap-2 border border-primary/25 text-primary/80 hover:bg-primary/5 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              De zorgkaart
            </button>
          </motion.div>
        </section>

        {/* ── OVER MIJ — kort blok met gezicht en link naar het volledige verhaal ── */}
        <section className="px-7 md:px-14 lg:px-18 py-16 md:py-24">
          <div className="md:grid md:grid-cols-[auto_1fr] md:gap-14 md:items-center">
            {teksten.over_mij_foto && (
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-60px" }} custom={0}
              >
                <img
                  src={teksten.over_mij_foto}
                  alt="Maddie, oprichter van Studio Luna"
                  className="w-40 h-40 md:w-52 md:h-52 rounded-3xl object-cover shadow-md mb-8 md:mb-0"
                  loading="lazy"
                />
              </motion.div>
            )}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-60px" }} custom={0.1}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Over mij
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-5 leading-[1.15]">
                Hoi, ik ben Maddie.
              </h2>
              <p className="text-[15px] text-foreground/60 leading-[1.9] md:max-w-xl">
                Moeder, gepromoveerd onderzoeker en yogadocente. Bij Studio Luna combineer ik gevoel en wetenschap:
                je bereidt je sterk en met vertrouwen voor op je bevalling, en je leert andere moeders uit Zuidplas kennen.
              </p>
              <button
                onClick={() => navigate("/over-mij")}
                className="inline-flex items-center gap-2 mt-7 text-sm font-semibold text-primary group"
              >
                Lees mijn verhaal
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* ── REVIEWS — zichtbaar als admin ze heeft aangezet (of admin bekijkt pagina) ── */}
        {reviewsConfig && (reviewsConfig.visible || user?.isAdmin) && reviewsConfig.items.length > 0 && (
          <section className="px-7 md:px-14 lg:px-18 py-16 md:py-24">
            {!reviewsConfig.visible && user?.isAdmin && (
              <p className="text-xs text-center text-amber-700/80 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 mb-8">
                Reviews staan uit — alleen zichtbaar voor jou als admin
              </p>
            )}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-60px" }} custom={0}
              className="mb-12"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Ervaringen
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15]">
                Wat vrouwen zeggen
              </h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviewsConfig.items.map((review, i) => (
                <motion.div
                  key={review.id}
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, margin: "-40px" }} custom={i * 0.1}
                  className="bg-secondary/30 rounded-2xl p-7 flex flex-col gap-4"
                >
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s < review.stars ? "text-primary fill-primary" : "text-foreground/20"}`} />
                    ))}
                  </div>
                  <p className="text-[15px] text-foreground/70 leading-[1.85] flex-1">"{review.text}"</p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.name}</p>
                    {review.role && <p className="text-xs text-foreground/45 mt-0.5">{review.role}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── FAQ — veelgestelde vragen ── */}
        <section className="px-7 md:px-14 lg:px-18 py-16 md:py-24">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-60px" }} custom={0}
            className="mb-10"
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
                  <AccordionContent className="text-[15px] text-foreground/60 leading-[1.85]">
                    {item.antwoord}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <button
              onClick={() => navigate("/geboortereeks")}
              className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-primary group"
            >
              Bekijk de Geboortereeks
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </motion.div>
        </section>

        {/* ── ZORGKAART TEASER ── */}
        <section className="px-7 md:px-14 lg:px-18 py-12 md:py-16">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-60px" }} custom={0}
            className="md:grid md:grid-cols-[1.2fr_1fr] md:gap-20 md:items-center"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-5 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Voor de hele regio
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15] mb-6">
                Alles over geboortezorg<br className="hidden md:block" /> in de regio Zuidplas
              </h2>
              <p className="text-[15px] text-foreground/60 leading-[1.95]">
                Van verloskundige en kraamzorg tot bekkenfysiotherapie, lactatiekundigen en sporten
                met je baby: op onze zorgkaart vind je alle zorg en ondersteuning uit Nieuwerkerk
                aan den IJssel, Zevenhuizen, Moordrecht, Moerkapelle en omgeving op één plek.
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <button
                onClick={() => navigate("/geboortezorg-zuidplas")}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary/88 shadow-soft group"
              >
                Ontdek de zorgkaart
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── LOCATIE & CONTACT — plain tekst, geen kaarten ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-20 md:py-28 mb-4">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/25 to-background pointer-events-none" />

          <div className="relative md:grid md:grid-cols-2 md:gap-24">

            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} custom={0}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-6 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Locatie
              </p>
              <h2 className="font-display text-2xl font-medium text-foreground mb-5">{teksten.home_locatie_naam}</h2>
              {teksten.home_locatie_adres.split("\n").map((regel, i) => (
                <p key={i} className="text-[15px] text-foreground/55 leading-[1.9] mb-2">{regel}</p>
              ))}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(teksten.home_locatie_adres.replace("\n", ", "))}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-7 text-sm font-semibold text-primary group"
              >
                <MapPin className="w-3.5 h-3.5" />
                Bekijk op kaart
                <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} custom={0.15}
              className="mt-14 md:mt-0"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-6 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-primary/40" />
                Contact
              </p>
              <div className="space-y-5">
                <a href={`mailto:${teksten.home_contact_email}`}
                  className="flex items-center gap-4 text-[15px] text-foreground/55 hover:text-foreground group">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  {teksten.home_contact_email}
                </a>
                <a href={`https://wa.me/${teksten.home_contact_telefoon.replace(/\D/g, "").replace(/^0/, "31")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 text-[15px] text-foreground/55 hover:text-foreground group">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  {teksten.home_contact_telefoon}
                </a>
                <a href={`https://www.instagram.com/${teksten.home_contact_instagram.replace("@", "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 text-[15px] text-foreground/55 hover:text-foreground group">
                  <Instagram className="w-4 h-4 text-primary shrink-0" />
                  {teksten.home_contact_instagram}
                </a>
              </div>
            </motion.div>

          </div>
        </section>

        <CtaBlock ctaUrl={teksten.cta_url} ctaLabel={teksten.cta_label} />
        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
