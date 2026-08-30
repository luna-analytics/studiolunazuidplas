import { Link } from "wouter";

export function SeoFooter() {
  return (
    <footer className="border-t border-border/20 mt-8 px-6 md:px-12 lg:px-16 py-8 pb-32 md:pb-20 text-center">
      <p className="text-xs text-foreground/75 leading-relaxed max-w-lg mx-auto">
        Studio Luna · Zwangerschap en geboorte in Zuidplas. Zwangerschapsyoga, de Geboortereeks
        en de zorgkaart voor de regio, vanuit Nieuwerkerk aan den IJssel. Ook goed bereikbaar
        vanuit Zevenhuizen, Moordrecht, Moerkapelle, Gouda en Capelle aan den IJssel.
      </p>
      <p className="text-xs mt-2 max-w-lg mx-auto">
        <Link href="/geboortezorg-zuidplas" className="inline-block py-1.5 text-primary hover:text-foreground transition-colors underline underline-offset-2">
          Alles over geboortezorg in de regio Zuidplas
        </Link>
      </p>
      <p className="text-xs mt-1">
        <a href="mailto:info@studiolunazuidplas.nl" className="inline-block py-1.5 text-primary hover:text-foreground transition-colors">
          info@studiolunazuidplas.nl
        </a>
      </p>
    </footer>
  );
}
