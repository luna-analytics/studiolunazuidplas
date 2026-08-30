import { useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ZORGKAART, LAATST_BIJGEWERKT, isNieuw } from "@/data/zorgkaart";
import { usePageMeta } from "@/lib/seo";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] as [number, number, number, number], delay },
  }),
};

export default function GeboortezorgCategorie() {
  const params = useParams<{ categorie: string }>();
  const [, navigate] = useLocation();

  const cat = ZORGKAART.find((c) => c.id === params.categorie);

  useEffect(() => {
    if (!cat) navigate("/geboortezorg-zuidplas", { replace: true });
  }, [cat, navigate]);

  usePageMeta({
    title: cat
      ? `${cat.titel} in Zuidplas | Geboortezorgkaart Studio Luna`
      : "Geboortezorg in Zuidplas | Studio Luna",
    description: cat
      ? `${cat.titel} in de regio Zuidplas: ${cat.intro} Onderdeel van de Geboortezorgkaart Zuidplas van Studio Luna.`
      : undefined,
    jsonLd: cat
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${cat.titel} in regio Zuidplas`,
            numberOfItems: cat.aanbieders.length,
            itemListElement: cat.aanbieders.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: { "@type": "LocalBusiness", name: a.naam, url: a.website, address: { "@type": "PostalAddress", addressLocality: a.plaats, addressCountry: "NL" } },
            })),
          },
        ]
      : undefined,
  });

  if (!cat) return null;

  const aanbieders = cat.aanbieders;

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative overflow-x-hidden">

        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="px-7 md:px-14 lg:px-18 pt-14 md:pt-12 pb-6"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-primary/40" />
            Geboortezorgkaart Zuidplas
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
            {cat.titel} <em className="not-italic text-primary">in Zuidplas</em>
          </h1>
          <p className="text-[15px] text-foreground/75 leading-[1.9] mt-5 max-w-2xl">{cat.intro}</p>
          <p className="text-xs text-foreground/55 mt-3">Bijgewerkt in {LAATST_BIJGEWERKT.tekst}</p>
          <Link
            href="/geboortezorg-zuidplas"
            className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-primary group"
          >
            Bekijk alle geboortezorg in Zuidplas
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* De lijst */}
        <div className="px-7 md:px-14 lg:px-18 pb-10">
          <div className="max-w-3xl">
            {aanbieders.map((a, i) => (
              <div key={a.naam} className={`py-6 ${i < aanbieders.length - 1 ? "border-b border-border/15" : ""}`}>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h2 className="text-[16px] font-semibold leading-snug m-0" style={{ fontFamily: "inherit" }}>
                    <a
                      href={a.website} target="_blank" rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {a.naam}
                    </a>
                  </h2>
                  <span className="text-sm text-foreground/70">{a.plaats}</span>
                  {isNieuw(a.toegevoegd) && (
                    <span className="text-[11px] uppercase tracking-[0.18em] text-primary/70">
                      nieuw
                    </span>
                  )}
                </div>
                <p className="text-[15px] text-foreground/80 leading-[1.9] mt-1.5">{a.beschrijving}</p>
                {a.voordeel && (
                  <p className="text-sm text-primary/90 leading-[1.85] mt-2">Voordeel: {a.voordeel}</p>
                )}
                <p className="mt-1">
                  <a
                    href={a.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex py-2 text-sm text-primary hover:text-foreground font-medium transition-colors"
                  >
                    bekijk de website
                  </a>
                </p>
              </div>
            ))}

            <p className="text-sm text-foreground/60 leading-[1.85] mt-8">
              Klopt er iets niet of mis je iemand? Geef het door via{" "}
              <Link href="/geboortezorg-zuidplas" className="text-primary font-semibold hover:text-primary/75">
                de zorgkaart
              </Link>
              . Ben je zelf zorgverlener in de regio? Vermelding is gratis;{" "}
              <Link href="/geboortezorg-zuidplas#voor-zorgverleners" className="text-primary font-semibold hover:text-primary/75">
                meld je aan via het formulier op de zorgkaart
              </Link>
              .
            </p>
          </div>
        </div>

        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
