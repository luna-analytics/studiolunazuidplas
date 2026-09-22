import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { CtaBlock } from "@/components/cta-block";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Instagram, Star } from "lucide-react";
import { IMAGES } from "@/lib/images";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/lib/seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Review = { id: string; name: string; role: string; text: string; stars: number };
type ReviewsConfig = { visible: boolean; items: Review[] };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const DEFAULT_TEKSTEN = {
  cta_url: "/geboortereeks",
  cta_label: "Bekijk de Geboortereeks",
  home_hero: "Zwangerschapsyoga en\ngeboortevoorbereiding in Zuidplas.",
  home_missie_heading: "Een plek om\nte landen.",
  home_missie_tekst: "Het moederschap hoef je niet alleen te doen. De missie van Studio Luna is het faciliteren van een community voor alle vrouwen in Nieuwerkerk aan den IJssel en omgeving, van zwangerschap tot ver daarna. Een veilige haven om fysiek op te laden, mentaal tot rust te komen en bovenal in verbinding te staan met andere moeders in dezelfde fase.",
  home_missie_bullets: "Een plek om te landen.\nEen plek om fysiek sterk, gezond en in balans te blijven.\nEen plek om vertrouwen te vinden in je veranderende lichaam.\nEen plek om te connecten met andere moeders.\nStudio Luna is jouw mama tribe.",
  home_village_tagline: "Welkom in jouw village.",
  home_aanbod_heading: "Alles wat je nodig hebt\nop weg naar de bevalling.",
  home_aanbod_items: "Kleine groepen, veel aandacht en persoonlijk contact.\nZwangerschapsyoga: bevalling voorbereiden, kracht van de adem en fysieke balans.\nNa afloop altijd tijd voor een kopje thee en verbinding.\nEen vaste groep die samen naar de bevalling toewerkt.\nWhatsApp-community voor vragen en tips tussen lessen door.\nAandacht voor zowel het fysieke als het mentale aspect van moederschap.",
  home_locatie_naam: "Waldorfhaus de Perenboom",
  home_locatie_adres: "Raadhuisplein 28\n2914 KM Nieuwerkerk aan den IJssel",
  home_contact_email: "info@studiolunazuidplas.nl",
  home_contact_telefoon: "+31 6 43 73 53 43",
  home_contact_instagram: "@studiolunazuidplas",
  foto_hero: "",
  foto_hero_positie: "center",
  foto_circle: "",
  foto_circle_hoogte: "hoog",
  foto_circle_positie: "center",
  over_mij_foto: "",
};

const FAQ_ITEMS = [
  {
    vraag: "Vanaf hoeveel weken kan ik meedoen?",
    antwoord: "Bij de start ben je ongeveer tussen de 20 en 28 weken zwanger. Val je daarbuiten maar wil je toch graag meedoen, stuur me dan even een berichtje. De eerstvolgende reeks start op dinsdag 29 september.",
  },
  {
    vraag: "Heb ik yoga-ervaring nodig?",
    antwoord: "Nee, ervaring is niet nodig. De lessen worden rustig opgebouwd en stap voor stap uitgelegd, in een kleine groep met veel persoonlijke aandacht.",
  },
  {
    vraag: "Wat kost het?",
    antwoord: "De Geboortereeks van acht wekelijkse lessen kost €195; deze eerste groep betaalt eenmalig de introductieprijs van €175. De mama-en-babyles na afloop krijg je cadeau.",
  },
  {
    vraag: "Waar zijn de lessen?",
    antwoord: "In Waldorfhaus de Perenboom aan het Raadhuisplein 28 in Nieuwerkerk aan den IJssel.",
  },
  {
    vraag: "Hoe meld ik me aan?",
    antwoord: "Je meldt je aan met je naam en e-mailadres op de Geboortereeks-pagina. Daarna ontvang je persoonlijk het intakeformulier en de factuur per mail, en is je plekje gereserveerd.",
  },
];

// Geen inloopanimaties meer: de inhoud staat er gewoon.
const fadeUp = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

const RATIO_MAP: Record<string, string> = { smal: "21/9", normaal: "16/9", hoog: "4/3", portret: "3/4" };
const POS_MAP: Record<string, string> = { top: "top", center: "center", bottom: "bottom" };

export default function StudioLuna() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [teksten, setTeksten] = useState(DEFAULT_TEKSTEN);
  const [reviewsConfig, setReviewsConfig] = useState<ReviewsConfig | null>(null);

  usePageMeta({
    title: "Studio Luna | Zwangerschapsyoga in Zuidplas, Nieuwerkerk aan den IJssel",
    description: "Studio Luna geeft de Geboortereeks, zwangerschapsyoga en geboortevoorbereiding in Nieuwerkerk aan den IJssel, voor zwangeren uit heel Zuidplas: Zevenhuizen, Moordrecht en Moerkapelle. Plus de Geboortezorgkaart met alle geboortezorg in de regio.",
  });

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
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16">

      {/* ── HERO — kop op de lichte achtergrond, daaronder de foto van rand tot rand ── */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="px-7 md:px-14 lg:px-18 pt-12 pb-10 md:pt-20 md:pb-14">
          <div className="md:max-w-2xl">
            {/* Kleiner op smalle schermen: "geboortevoorbereiding" is te breed
                voor 390 pixels en viel anders buiten beeld. */}
            <h1
              className="font-display text-[2rem] min-[400px]:text-[2.3rem] sm:text-[2.6rem] md:text-5xl font-medium text-foreground leading-[1.12] mb-7 break-words"
            >
              {teksten.home_hero.split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                onClick={() => navigate(teksten.cta_url)}
                className="inline-flex items-center bg-primary text-primary-foreground px-7 py-3.5 rounded-[6px] font-semibold text-sm hover:bg-primary/88"
              >
                {teksten.cta_label}
              </button>
              <button
                onClick={() => navigate("/geboortezorg-zuidplas")}
                className="inline-flex items-center text-foreground/80 text-sm font-medium border-b border-foreground/35 pb-0.5 hover:text-foreground hover:border-foreground"
              >
                Ontdek de zorgkaart
              </button>
            </div>
            <p className="mt-7 text-[13px] text-foreground/60">
              Nieuwerkerk aan den IJssel, gemeente Zuidplas
            </p>
          </div>
        </div>
      </div>

      <img
        src={teksten.foto_hero || IMAGES.hero}
        alt="Zwangerschapsyoga Studio Luna"
        className="block w-full object-cover rounded-none"
        style={{ height: "clamp(300px, 48vw, 680px)", objectPosition: teksten.foto_hero_positie || "center" }}
      />

      <div className="w-full max-w-7xl mx-auto relative overflow-x-hidden">

        {/* ── GEBOORTEREEKS AANKONDIGING ── */}
        <section className="px-7 md:px-14 lg:px-18 pt-14 md:pt-20">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-40px" }} custom={0}
          >
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15] mb-6">
              De Geboortereeks start <em className="not-italic text-primary">29 september</em>
            </h2>
            <p className="text-[15px] text-foreground/80 leading-[1.95] max-w-2xl mb-8">
              Acht weken zwangerschapsyoga en geboortevoorbereiding in een vaste groep,
              inclusief een partnerles. Een aantal weken na de laatste bevalling is er de
              ruimte om samen te komen voor het uitwisselen van verhalen en mama-en-babyyoga;
              deze postpartumles is inbegrepen in de reeks.
            </p>
            <p className="text-[15px] text-foreground/80 leading-[1.9] mb-8">
              De reeks kost €175 als introductieprijs voor deze eerste groep, daarna €195.
              Veel zorgverzekeraars vergoeden een zwangerschapscursus geheel of gedeeltelijk
              vanuit de aanvullende verzekering.
            </p>
            <button
              onClick={() => navigate("/geboortereeks")}
              className="inline-flex items-center bg-primary text-primary-foreground px-7 py-3.5 rounded-[6px] font-semibold text-sm hover:bg-primary/88"
            >
              Lees alles en meld je aan
            </button>
          </motion.div>
        </section>

        {/* ── MISSIE — editorial: label + grote heading + asymmetrisch ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-24 md:py-32">

          <div className="relative">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} custom={0}
            >
            </motion.div>

            <div className="md:grid md:grid-cols-[1fr_1.2fr] md:gap-20 md:items-start">

              {/* Linker kolom — bullets + quote */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-80px" }} custom={0.1}
              >
                <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1] mb-10">
                  {teksten.home_missie_heading.split("\n").map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))}
                </h2>
                <ul className="space-y-5">
                  {teksten.home_missie_bullets.split("\n").filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-[15px] text-foreground/80 leading-[1.9]">
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
                className="mt-10 md:mt-0 md:pt-20"
              >
                <p className="text-[15px] text-foreground/75 leading-[1.95]">
                  {teksten.home_missie_tekst}
                </p>
                <p className="mt-8 font-display text-xl text-primary">
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
            <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-14 leading-[1.15]">
              {teksten.home_aanbod_heading.split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br className="hidden md:block" />}</span>
              ))}
            </h2>
          </motion.div>

          <div className="max-w-2xl border-t border-border/15">
            {teksten.home_aanbod_items.split("\n").filter(Boolean).map((tekst, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-60px" }} custom={i * 0.07}
                className="py-5 border-b border-border/15"
              >
                <p className="text-[15px] text-foreground/80 leading-[1.9]">{tekst}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── SFEERFOTO — tweede foto, in te stellen via /admin (foto_circle) ── */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show"
          viewport={{ once: true, margin: "-60px" }} custom={0}
          className="px-7 md:px-14 lg:px-18 py-4"
        >
          <img
            src={teksten.foto_circle || IMAGES.circle}
            alt="Zwangerschapsyoga bij Studio Luna"
            className="w-full object-cover"
            style={{
              aspectRatio: RATIO_MAP[teksten.foto_circle_hoogte] ?? "4/3",
              objectPosition: POS_MAP[teksten.foto_circle_positie] ?? "center",
            }}
            loading="lazy"
          />
        </motion.div>

        {/* ── SNELLE LINKS — interne navigatie naar rooster / tarieven / aanbod ── */}
        <section className="px-7 md:px-14 lg:px-18 py-6 md:py-10">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-40px" }} custom={0}
            className="flex flex-wrap gap-3"
          >
            <button
              onClick={() => navigate("/geboortereeks")}
              className="inline-flex items-center gap-2 text-primary/80 hover:text-primary text-sm font-semibold border-b border-primary/30 pb-0.5 transition-colors"
            >
              De Geboortereeks
            </button>
            <button
              onClick={() => navigate("/geboortezorg-zuidplas")}
              className="inline-flex items-center gap-2 text-primary/80 hover:text-primary text-sm font-semibold border-b border-primary/30 pb-0.5 transition-colors"
            >
              De zorgkaart
            </button>
          </motion.div>
        </section>

        {/* ── OVER MIJ — kort blok met gezicht en link naar het volledige verhaal ── */}
        <section className="px-7 md:px-14 lg:px-18 py-16 md:py-24">
          <div className="md:grid md:grid-cols-[20rem_1fr] md:gap-14 md:items-center">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-60px" }} custom={0}
            >
              <img
                src={teksten.over_mij_foto || IMAGES.overMij}
                alt="Marjolein, oprichter van Studio Luna"
                className="w-full max-w-[20rem] aspect-[4/5] object-cover mb-8 md:mb-0"
                loading="lazy"
              />
            </motion.div>
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-60px" }} custom={0.1}
            >
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-5 leading-[1.15]">
                Hoi, ik ben Marjolein.
              </h2>
              <p className="text-[15px] text-foreground/80 leading-[1.9] md:max-w-xl">
                Moeder, gepromoveerd onderzoeker en yogadocente. Bij Studio Luna combineer ik gevoel en wetenschap:
                je bereidt je sterk en met vertrouwen voor op je bevalling, en je leert andere moeders uit Zuidplas kennen.
              </p>
              <button
                onClick={() => navigate("/over-mij")}
                className="inline-flex items-center mt-7 text-sm font-semibold text-primary border-b border-primary/35 pb-0.5 hover:border-primary"
              >
                Lees mijn verhaal
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
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15]">
                Wat vrouwen zeggen
              </h2>
            </motion.div>
            <div className="max-w-2xl border-t border-border/15">
              {reviewsConfig.items.map((review, i) => (
                <motion.div
                  key={review.id}
                  variants={fadeUp} initial="hidden" whileInView="show"
                  viewport={{ once: true, margin: "-40px" }} custom={i * 0.1}
                  className="py-7 border-b border-border/15 flex flex-col gap-3"
                >
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s < review.stars ? "text-primary fill-primary" : "text-foreground/20"}`} />
                    ))}
                  </div>
                  <p className="font-display text-xl text-foreground leading-[1.5]">“{review.text}”</p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.name}</p>
                    {review.role && <p className="text-xs text-foreground/60 mt-0.5">{review.role}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-foreground/65 leading-[1.9] mt-8">
              Zelf een ervaring met Studio Luna?{" "}
              <a
                href="https://maps.google.com/?cid=994021316573595651"
                target="_blank" rel="noopener noreferrer"
                className="text-primary font-semibold hover:text-primary/75"
              >
                Laat een review achter op Google
              </a>
              , daar maak je mij en andere mama's heel blij mee.
            </p>
          </section>
        )}

        {/* ── FAQ — veelgestelde vragen ── */}
        <section className="px-7 md:px-14 lg:px-18 py-16 md:py-24">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: "-60px" }} custom={0}
            className="mb-10"
          >
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
                  <AccordionContent forceMount className="text-[15px] text-foreground/80 leading-[1.85]">
                    {item.antwoord}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <button
              onClick={() => navigate("/geboortereeks")}
              className="inline-flex items-center mt-8 text-sm font-semibold text-primary border-b border-primary/35 pb-0.5 hover:border-primary"
            >
              Bekijk de Geboortereeks
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
              <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15] mb-6">
                Alles over geboortezorg<br className="hidden md:block" /> in de regio Zuidplas
              </h2>
              <p className="text-[15px] text-foreground/80 leading-[1.95]">
                Van verloskundige en kraamzorg tot bekkenfysiotherapie, lactatiekundigen en sporten
                met je baby: op onze zorgkaart vind je alle zorg en ondersteuning uit Nieuwerkerk
                aan den IJssel, Zevenhuizen, Moordrecht, Moerkapelle en omgeving op één plek.
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <button
                onClick={() => navigate("/geboortezorg-zuidplas")}
                className="inline-flex items-center bg-primary text-primary-foreground px-7 py-3.5 rounded-[6px] font-semibold text-sm hover:bg-primary/88"
              >
                Ontdek de zorgkaart
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── LOCATIE & CONTACT — plain tekst, geen kaarten ── */}
        <section className="relative px-7 md:px-14 lg:px-18 py-20 md:py-28 mb-4">

          <div className="relative md:grid md:grid-cols-2 md:gap-24">

            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} custom={0}
            >
              <h2 className="font-display text-2xl font-medium text-foreground mb-5">Locatie</h2>
              <p className="text-[15px] font-semibold text-foreground/85 leading-[1.9] mb-2">{teksten.home_locatie_naam}</p>
              {teksten.home_locatie_adres.split("\n").map((regel, i) => (
                <p key={i} className="text-[15px] text-foreground/75 leading-[1.9] mb-2">{regel}</p>
              ))}
              {/* Alleen tonen zodra er een echt adres met huisnummer staat */}
              {/\d/.test(teksten.home_locatie_adres) && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(teksten.home_locatie_adres.replace("\n", ", "))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center mt-7 text-sm font-semibold text-primary border-b border-primary/35 pb-0.5 hover:border-primary"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Bekijk op kaart
                </a>
              )}
            </motion.div>

            <motion.div
              variants={fadeUp} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} custom={0.15}
              className="mt-14 md:mt-0"
            >
              <h2 className="font-display text-2xl font-medium text-foreground mb-5">Contact</h2>
              <div className="space-y-5">
                <a href={`mailto:${teksten.home_contact_email}`}
                  className="flex items-center gap-4 text-[15px] text-foreground/75 hover:text-foreground group">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  {teksten.home_contact_email}
                </a>
                <a href={`https://wa.me/${teksten.home_contact_telefoon.replace(/\D/g, "").replace(/^0/, "31")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 text-[15px] text-foreground/75 hover:text-foreground group">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  {teksten.home_contact_telefoon}
                </a>
                <a href={`https://www.instagram.com/${teksten.home_contact_instagram.replace("@", "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 text-[15px] text-foreground/75 hover:text-foreground group">
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
