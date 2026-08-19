import { Link } from "wouter";

export function SeoFooter() {
  return (
    <footer className="border-t border-border/20 mt-8 px-6 md:px-12 lg:px-16 py-8 pb-32 md:pb-20 text-center">
      <p className="text-xs text-foreground/35 leading-relaxed max-w-lg mx-auto">
        Studio Luna · Zwangerschap en geboorte in Zuidplas. Zwangerschapsyoga, de Geboortereeks
        en de zorgkaart voor de regio, vanuit Nieuwerkerk aan den IJssel.
      </p>
      <p className="text-xs text-foreground/30 mt-2 max-w-lg mx-auto">
        <Link href="/geboortezorg-zuidplas" className="hover:text-foreground/55 transition-colors underline underline-offset-2">
          Alles over geboortezorg in de regio Zuidplas
        </Link>
      </p>
      <p className="text-xs text-foreground/25 mt-1.5">
        <a href="mailto:info@studiolunazuidplas.nl" className="hover:text-foreground/50 transition-colors">
          info@studiolunazuidplas.nl
        </a>
      </p>

      {/* Lokale SEO-tekst — zichtbaar voor zoekmachines */}
      <div className="sr-only">
        <h2>Zwangerschapsyoga Nieuwerkerk aan den IJssel</h2>
        <p>Studio Luna biedt zwangerschapsyoga in Nieuwerkerk aan den IJssel, gemeente Zuidplas. Kleine groepen, persoonlijke aandacht en na elke les tijd voor thee en verbinding.</p>

        <h2>Zwangerschapscursus Zuidplas: de Geboortereeks</h2>
        <p>De Geboortereeks van Studio Luna is een complete zwangerschapscursus in Nieuwerkerk aan den IJssel: negen lessen zwangerschapsyoga en geboortevoorbereiding met een bekkenfysiotherapeut, een partnerles, een mamaspa-avond en een mama-en-babyles. De eerste groep start dinsdag 29 september.</p>

        <h2>Zwangerschapsyoga Gouda</h2>
        <p>Op zoek naar zwangerschapsyoga vanuit Gouda? Studio Luna in Nieuwerkerk aan den IJssel is gemakkelijk bereikbaar vanuit Gouda via de A20.</p>

        <h2>Prenatale yoga Zuidplas</h2>
        <p>Prenatale yoga in de gemeente Zuidplas. Studio Luna biedt lessen zwangerschapsyoga en geboortevoorbereiding voor vrouwen in Nieuwerkerk aan den IJssel, Moordrecht, Zevenhuizen en Moerkapelle.</p>

        <h2>Zwangerschapsyoga Capelle aan den IJssel</h2>
        <p>Zwanger en woonachtig in Capelle aan den IJssel? Studio Luna in Nieuwerkerk aan den IJssel is op korte afstand en biedt zwangerschapsyoga en een complete geboortevoorbereiding.</p>

        <h2>Geboortezorg regio Zuidplas</h2>
        <p>Op de zorgkaart van Studio Luna vind je alle geboortezorg in de regio Zuidplas: verloskundigen, kraamzorg, echocentra, bekkenfysiotherapie, doula's, lactatiekundigen, zwangerschapscursussen en beweegaanbod voor zwangeren en moeders.</p>

        <h2>Zwangerschapsyoga verzekering vergoeding</h2>
        <p>Veel zorgverzekeraars vergoeden een zwangerschapscursus geheel of gedeeltelijk vanuit de aanvullende verzekering. Check je polis of vraag het na bij je verzekeraar.</p>
      </div>
    </footer>
  );
}
