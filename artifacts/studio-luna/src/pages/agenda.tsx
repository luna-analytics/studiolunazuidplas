import { useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { CtaBlock } from "@/components/cta-block";

// De agenda is alles wat eenmalig is: workshops van experts, wandelingen en
// avonden over het moederschap. Zodra er data zijn, komen ze boven de soorten
// te staan in plaats van de regel dat ze nog volgen.
const SOORTEN = [
  {
    wat: "Workshops met een expert",
    tekst:
      "Een avond of ochtend met iemand die ergens meer van weet dan ik, bijvoorbeeld een " +
      "bekkenfysiotherapeut over je bekken en je bekkenbodem. Je meldt je per workshop aan en " +
      "betaalt per keer, zodat je kunt komen zonder dat je aan een hele reeks vastzit.",
  },
  {
    wat: "Wandelingen met andere moeders",
    tekst:
      "Gewoon lopen en praten, met of zonder kinderwagen, in en rond Nieuwerkerk aan den IJssel. " +
      "Hier zit geen prijs aan. Je komt er andere moeders uit Zuidplas tegen en je hoeft je " +
      "nergens op voor te bereiden.",
  },
  {
    wat: "Avonden over het moederschap",
    tekst:
      "Over wie je wilt zijn als moeder en over hoe je dat volhoudt. Deze avonden doe ik samen " +
      "met anderen, en ze zijn er voor iedereen die moeder is, of je nu je eerste kind verwacht " +
      "of je kinderen al naar school gaan.",
  },
];

export default function Agenda() {
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "Agenda: workshops, wandelingen en events | Studio Luna Zuidplas";
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative">

        {/* KOP */}
        <div className="px-7 md:px-14 lg:px-20 xl:px-28 pt-14 md:pt-12 pb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-3 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-primary/40" />
            Studio Luna
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
            Agenda
          </h1>
          <p className="text-[15px] text-foreground/75 leading-[1.9] mt-4 max-w-xl">
            Naast de wekelijkse lessen organiseer ik workshops met experts, wandelingen en avonden
            over het moederschap. Je hoeft daarvoor geen reeks te volgen en je hoeft ook niet
            zwanger te zijn.
          </p>
        </div>

        {/* WAT ER STAAT GEPLAND */}
        <section className="px-7 md:px-14 lg:px-20 xl:px-28 pb-6">
          <div className="max-w-3xl border-t border-border/25 pt-8">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-4">
              De eerste data volgen binnenkort
            </h2>
            <p className="text-[15px] text-foreground/75 leading-[1.95] mb-6">
              Ik ben de eerste workshops en wandelingen aan het plannen. Zodra een datum vaststaat,
              komt hij hier te staan en kun je je aanmelden. Wil je het horen op het moment dat dat
              gebeurt, stuur me dan een berichtje, dan zet ik je op de lijst.
            </p>
            <a
              href="mailto:info@studiolunazuidplas.nl?subject=Houd%20me%20op%20de%20hoogte%20van%20de%20agenda"
              className="inline-flex items-center bg-primary text-primary-foreground px-7 py-3.5 rounded-[6px] font-semibold text-sm hover:bg-primary/88"
            >
              Houd me op de hoogte
            </a>
          </div>
        </section>

        {/* DE SOORTEN, ALS RIJEN MET HAARLIJNEN */}
        <section className="px-7 md:px-14 lg:px-20 xl:px-28 py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/60 mb-6 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary/40" />
              Wat je kunt verwachten
            </p>
            {SOORTEN.map((s) => (
              <div key={s.wat} className="border-t border-border/25 py-6 md:grid md:grid-cols-[1fr_1.6fr] md:gap-12">
                <h3 className="font-display text-xl md:text-2xl font-medium text-foreground leading-[1.2] mb-3 md:mb-0">
                  {s.wat}
                </h3>
                <p className="text-[15px] text-foreground/75 leading-[1.95]">{s.tekst}</p>
              </div>
            ))}
            <div className="border-t border-border/25" />
          </div>
        </section>

        {/* SAMENWERKEN */}
        <section className="px-7 md:px-14 lg:px-20 xl:px-28 pb-12">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-4">
              Wil je iets samen doen?
            </h2>
            <p className="text-[15px] text-foreground/75 leading-[1.95] mb-6">
              Ben je zorgverlener of ondernemer in Zuidplas en past jouw werk bij zwangeren en
              moeders, dan kom ik graag met je in contact. Ik heb de ruimte, de groep en de
              zorgkaart van de regio, en ik zoek mensen die iets weten wat ik niet weet.
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
