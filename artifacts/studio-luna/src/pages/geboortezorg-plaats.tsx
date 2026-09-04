import { useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import {
  PLAATSEN,
  LAATST_BIJGEWERKT,
  zorgkaartVoorPlaats,
  aantalVoorPlaats,
  isNieuw,
} from "@/data/zorgkaart";
import { usePageMeta } from "@/lib/seo";

export default function GeboortezorgPlaats() {
  const params = useParams<{ plaats: string }>();
  const [, navigate] = useLocation();

  const plaats = PLAATSEN.find((p) => p.slug === params.plaats);

  useEffect(() => {
    if (!plaats) navigate("/geboortezorg-zuidplas", { replace: true });
  }, [plaats, navigate]);

  usePageMeta({
    title: plaats
      ? `Zwanger in ${plaats.naam}: geboortezorg in de buurt | Studio Luna`
      : "Geboortezorg in Zuidplas | Studio Luna",
    description: plaats
      ? `Verloskundigen, kraamzorg, echo's, zwangerschapsyoga, bekkenfysiotherapie en meer voor wie zwanger is in ${plaats.naam}. Onderdeel van de Geboortezorgkaart Zuidplas van Studio Luna.`
      : undefined,
  });

  if (!plaats) return null;

  const rijen = zorgkaartVoorPlaats(plaats.naam);
  const aantal = aantalVoorPlaats(plaats.naam);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative overflow-x-hidden">

        <div className="px-7 md:px-14 lg:px-18 pt-14 md:pt-12 pb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/55 mb-3">
            Geboortezorgkaart Zuidplas
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
            Zwanger in {plaats.naam}
          </h1>
          <p className="text-[15px] text-foreground/75 leading-[1.9] mt-5 max-w-2xl">
            Alles wat je nodig hebt rondom je zwangerschap, je bevalling en de eerste tijd daarna,
            voor zover het in {plaats.naam} zit of hier werkt. {aantal.hier} aanbieders geven
            {" "}{plaats.naam} zelf op als plaats; {aantal.breed} andere werken vanuit een breder
            gebied. Bij die laatste groep staat hun eigen werkgebied erbij, zodat je zelf ziet of
            jouw adres erin past.
          </p>
          <p className="text-xs text-foreground/55 mt-3">Bijgewerkt in {LAATST_BIJGEWERKT.tekst}</p>
          <Link href="/geboortezorg-zuidplas" className="inline-block mt-5 text-sm font-semibold text-primary border-b border-primary/30 pb-0.5">
            De hele Geboortezorgkaart Zuidplas
          </Link>
        </div>

        {rijen.map(({ categorie, hier, breed }) => (
          <section key={categorie.id} className="px-7 md:px-14 lg:px-18 py-8 border-t border-border/15">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.2]">
              {categorie.titel} in {plaats.korteNaam}
            </h2>
            <p className="text-[15px] text-foreground/70 leading-[1.9] mt-3 max-w-2xl">{categorie.intro}</p>

            {hier.length > 0 && (
              <div className="mt-6 max-w-3xl">
                {hier.map((a) => (
                  <div key={a.naam} className="py-4 border-b border-border/15">
                    <p className="font-semibold text-foreground">
                      {a.naam}
                      {isNieuw(a.toegevoegd) && <span className="ml-2 text-[11px] uppercase tracking-widest text-primary/70">nieuw</span>}
                    </p>
                    <p className="text-[14px] text-foreground/60 mt-0.5">{a.plaats}</p>
                    <p className="text-[15px] text-foreground/80 leading-[1.85] mt-1.5">{a.beschrijving}</p>
                    {a.voordeel && <p className="text-[14px] text-primary/80 mt-1.5">{a.voordeel}</p>}
                    <a href={a.website} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm font-semibold text-primary border-b border-primary/30 pb-0.5">
                      Website
                    </a>
                  </div>
                ))}
              </div>
            )}

            {breed.length > 0 && (
              <div className="mt-8 max-w-3xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/55 mb-3">
                  Werkt vanuit een breder gebied
                </p>
                {breed.map((a) => (
                  <div key={a.naam} className="py-4 border-b border-border/15">
                    <p className="font-semibold text-foreground">{a.naam}</p>
                    <p className="text-[14px] text-foreground/60 mt-0.5">{a.plaats}</p>
                    <p className="text-[15px] text-foreground/80 leading-[1.85] mt-1.5">{a.beschrijving}</p>
                    <a href={a.website} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm font-semibold text-primary border-b border-primary/30 pb-0.5">
                      Website
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        <section className="px-7 md:px-14 lg:px-18 py-12 border-t border-border/15">
          <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.2]">
            Ook zwangerschapsyoga in de buurt
          </h2>
          <p className="text-[15px] text-foreground/75 leading-[1.9] mt-4 max-w-2xl">
            Studio Luna geeft de Geboortereeks in Nieuwerkerk aan den IJssel: acht wekelijkse lessen
            zwangerschapsyoga en geboortevoorbereiding in een vaste groep, met daarna
            mama-en-babyyoga. Ook als je in {plaats.naam} woont ben je welkom.
          </p>
          <Link href="/geboortereeks" className="inline-block mt-5 text-sm font-semibold text-primary border-b border-primary/30 pb-0.5">
            Bekijk de Geboortereeks
          </Link>
        </section>

        <section className="px-7 md:px-14 lg:px-18 py-10 border-t border-border/15">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/55 mb-4">
            De andere plaatsen in Zuidplas
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {PLAATSEN.filter((p) => p.slug !== plaats.slug).map((p) => (
              <Link key={p.slug} href={`/zwanger-in-${p.slug}`} className="text-sm font-semibold text-primary border-b border-primary/30 pb-0.5">
                Zwanger in {p.naam}
              </Link>
            ))}
          </div>
        </section>

        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
