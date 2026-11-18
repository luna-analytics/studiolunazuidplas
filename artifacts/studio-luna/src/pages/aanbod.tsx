import { useState } from "react";
import { Link } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { KennismakingModal } from "@/components/kennismaking-modal";
import { usePageMeta } from "@/lib/seo";
import { REEKS, REEKS_START, dagMaand } from "../../../api-server/src/lib/reeks";
import { MASSAGE, AAN_HUIS_TOESLAG } from "../../../api-server/src/lib/massage";

// Alles wat Studio Luna aanbiedt op één pagina, met de prijzen (haar vraag van
// 18 november 2026). Prijzen en data komen uit reeks.ts en massage.ts, zodat
// deze pagina nooit iets anders zegt dan de losse pagina's. De tekst bij de
// privéles is van Marjolein zelf.

const WHATSAPP_URL =
  "https://wa.me/31643735343?text=" + encodeURIComponent("Hoi! Ik heb een vraag over een privéles.");

type Onderdeel = {
  id?: string;
  naam: string;
  prijs: React.ReactNode;
  tekst: string;
  link?: { href: string; tekst: string };
  bericht?: boolean;
};

const massagePrijs = (
  <>
    €{MASSAGE.prijs}
    <span className="block text-[13px] text-foreground/60 font-normal">nu €{MASSAGE.introductieprijs} introductieprijs</span>
  </>
);

const GROEPEN: { titel: string; onderdelen: Onderdeel[] }[] = [
  {
    titel: "Zwanger",
    onderdelen: [
      {
        naam: "De Geboortereeks",
        prijs: <>€195</>,
        tekst: `Acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding in een kleinschalige, vaste groep, met mama-en-babyyoga na afloop. De volgende reeks start ${REEKS.dag} ${dagMaand(REEKS_START)}.`,
        link: { href: "/geboortereeks", tekst: "Alles over de Geboortereeks" },
      },
      {
        id: "priveles",
        naam: "Privéles zwangerschapsyoga en/of geboortevoorbereiding",
        prijs: <>in overleg</>,
        tekst: "In overleg maken we op maat een plan met één of meerdere lessen, met of zonder partner, en ik stel de les samen op jouw wensen.",
        bericht: true,
      },
      {
        naam: "Zwangerschapsmassage",
        prijs: massagePrijs,
        tekst: `${MASSAGE.naam}, een full body ontspanningsmassage van ${MASSAGE.duur}, ${MASSAGE.vanafZwanger}.`,
        link: { href: "/zwangerschapsmassage", tekst: "Over de zwangerschapsmassage" },
      },
    ],
  },
  {
    titel: "Na de bevalling",
    onderdelen: [
      {
        naam: "Postpartummassage",
        prijs: massagePrijs,
        tekst: `Dezelfde ${MASSAGE.naam}-massage van ${MASSAGE.duur}, ${MASSAGE.vanafPostpartum}.`,
        link: { href: "/postpartummassage", tekst: "Over de postpartummassage" },
      },
      {
        naam: "Mama-en-babyyoga",
        prijs: <>inbegrepen</>,
        tekst: "Na de Geboortereeks, zodra alle kindjes geboren zijn, komt de groep nog één keer samen met de baby's erbij.",
        link: { href: "/geboortereeks#mama-en-babyyoga", tekst: "Bij de Geboortereeks" },
      },
    ],
  },
  {
    titel: "Aan huis",
    onderdelen: [
      {
        naam: "Massage of privéles bij jou thuis",
        prijs: <>€{AAN_HUIS_TOESLAG} extra</>,
        tekst: "Liever thuis, bijvoorbeeld in de kraamperiode? Dan kom ik naar je toe.",
      },
    ],
  },
];

export default function Aanbod() {
  const [isBerichtOpen, setIsBerichtOpen] = useState(false);

  usePageMeta({
    title: "Aanbod en tarieven | Studio Luna, Nieuwerkerk aan den IJssel",
    description: `Alles van Studio Luna met de prijzen: de Geboortereeks (€195), privéles zwangerschapsyoga en geboortevoorbereiding, zwangerschapsmassage en postpartummassage (€${MASSAGE.prijs}), ook aan huis in Zuidplas.`,
  });

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative overflow-x-hidden">

        <div className="px-7 md:px-14 lg:px-20 xl:px-28 pt-14 md:pt-12 pb-4 max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
            Aanbod en tarieven
          </h1>
          <p className="text-foreground/60 text-[15px] mt-3">
            Alles van Studio Luna op een rij, met de prijzen.
          </p>
        </div>

        {GROEPEN.map((groep) => (
          <section key={groep.titel} className="px-7 md:px-14 lg:px-20 xl:px-28 py-6 md:py-8">
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-2">
                {groep.titel}
              </h2>
              {groep.onderdelen.map((o) => (
                <div key={o.naam} id={o.id} className="py-5 border-b border-border/20 scroll-mt-28">
                  <div className="flex items-baseline justify-between gap-6">
                    <h3 className="text-[17px] font-semibold text-foreground/85">{o.naam}</h3>
                    <p className="text-[17px] font-semibold text-foreground/85 text-right shrink-0">{o.prijs}</p>
                  </div>
                  <p className="text-[15px] text-foreground/75 leading-[1.7] mt-1.5 max-w-2xl">{o.tekst}</p>
                  {o.link && (
                    <Link
                      href={o.link.href}
                      className="inline-flex items-center mt-3 text-sm font-semibold text-primary border-b border-primary/35 pb-0.5 hover:border-primary"
                    >
                      {o.link.tekst}
                    </Link>
                  )}
                  {o.bericht && (
                    <p className="text-sm text-foreground/65 leading-[1.7] mt-3">
                      <button
                        onClick={() => setIsBerichtOpen(true)}
                        className="font-semibold text-primary border-b border-primary/35 pb-0.5 hover:border-primary"
                      >
                        Stuur een berichtje
                      </button>
                      {" "}of app via{" "}
                      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:text-primary/75">
                        WhatsApp
                      </a>
                      , dan maken we samen een plan.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <KennismakingModal isOpen={isBerichtOpen} onClose={() => setIsBerichtOpen(false)} />
        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
