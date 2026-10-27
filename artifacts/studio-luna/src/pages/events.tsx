import { useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { CtaBlock } from "@/components/cta-block";
import { IMAGES } from "@/lib/images";

// De inleiding is haar eigen tekst (14 oktober); niet herschrijven. De pagina
// legt met opzet niet vast wat voor events er komen: dat kan van alles zijn,
// van een samenwerking tot iets van Studio Luna zelf. Zodra er een datum staat,
// komt die hier boven de tekst dat de eerste data nog volgen.
export default function Events() {
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "Events voor zwangeren en moeders in Zuidplas | Studio Luna";
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative">

        {/* KOP */}
        <div className="px-7 md:px-14 lg:px-20 xl:px-28 pt-14 md:pt-12 pb-10 md:flex md:items-start md:justify-between md:gap-12">
          <div>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
            Events
          </h1>
          <p className="text-[15px] text-foreground/75 leading-[1.9] mt-4 max-w-xl">
            Naast de wekelijkse lessen organiseert Studio Luna ook workshops en events. Soms
            vanuit Studio Luna, en soms vanuit een samenwerking met andere inspirerende vrouwen.
            Deze events zijn voor zwangeren, moeders en ondernemende vrouwen die verdieping,
            inspiratie en verbinding zoeken.
          </p>
          </div>
          <img
            src={IMAGES.events}
            alt="Twee handen die elkaar vasthouden tegen de lucht"
            className="block w-full max-w-[280px] aspect-[4/5] object-cover mt-8 md:mt-0 shrink-0"
          />
        </div>

        {/* WAT ER STAAT GEPLAND */}
        <section className="px-7 md:px-14 lg:px-20 xl:px-28 pb-6">
          <div className="max-w-3xl border-t border-border/25 pt-8">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-4">
              De eerste data volgen binnenkort
            </h2>
            <p className="text-[15px] text-foreground/75 leading-[1.95] mb-6">
              Ik ben de eerste events aan het plannen. Zodra er een datum vaststaat, komt die hier
              te staan met de plek, de prijs en voor wie het is, en kun je je aanmelden. Wil je het
              horen op het moment dat dat gebeurt, stuur me dan een berichtje, dan zet ik je op de
              lijst.
            </p>
            <a
              href="mailto:info@studiolunazuidplas.nl?subject=Houd%20me%20op%20de%20hoogte%20van%20de%20events"
              className="inline-flex items-center bg-primary text-primary-foreground px-7 py-3.5 rounded-[6px] font-semibold text-sm hover:bg-primary/88"
            >
              Houd me op de hoogte
            </a>
          </div>
        </section>

        {/* SAMENWERKEN */}
        <section className="px-7 md:px-14 lg:px-20 xl:px-28 py-12 md:py-16">
          <div className="max-w-3xl border-t border-border/25 pt-8">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-4">
              Wil je iets samen doen?
            </h2>
            <p className="text-[15px] text-foreground/75 leading-[1.95] mb-6">
              Ben je zorgverlener of ondernemer in Zuidplas en past jouw werk bij zwangeren en
              moeders, dan kom ik graag met je in contact.
            </p>
            <button
              onClick={() => navigate("/over-mij")}
              className="inline-flex items-center text-foreground/80 text-sm font-medium border-b border-foreground/35 pb-0.5 hover:text-foreground hover:border-foreground"
            >
              Lees wie ik ben
            </button>
          </div>
        </section>

        <CtaBlock />
        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
