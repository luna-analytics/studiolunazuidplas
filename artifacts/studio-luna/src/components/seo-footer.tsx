import { useState } from "react";
import { Link } from "wouter";
import { AlgemeneVoorwaardenModal } from "./algemene-voorwaarden-modal";
import { PrivacyverklaringModal } from "./privacyverklaring-modal";

export function SeoFooter() {
  // Voorwaarden en Privacy stonden tot 26 oktober rechtsboven in de menubalk;
  // die plek is nu voor Blog en Over mij.
  const [avOpen, setAvOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <footer className="border-t border-border/20 mt-8 px-6 md:px-12 lg:px-16 py-8 pb-32 md:pb-20 text-center">
      <p className="text-xs text-foreground/75 leading-relaxed max-w-lg mx-auto">
        Studio Luna · Zwangerschap, geboorte en moederschap in Zuidplas. Zwangerschapsyoga,
        de Geboortereeks, workshops en wandelingen, en de zorgkaart voor de regio, vanuit
        Nieuwerkerk aan den IJssel. Ook goed bereikbaar vanuit Zevenhuizen, Moordrecht,
        Moerkapelle, Gouda en Capelle aan den IJssel.
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
      <p className="text-xs mt-1 text-foreground/70">
        Studio Luna Zuidplas · KvK 99747529
      </p>
      <p className="text-xs mt-1 text-foreground/70">
        <button type="button" onClick={() => setAvOpen(true)} className="py-1.5 px-1 hover:text-foreground transition-colors underline underline-offset-2">
          Algemene voorwaarden
        </button>
        <span className="mx-1 text-foreground/40">·</span>
        <button type="button" onClick={() => setPrivacyOpen(true)} className="py-1.5 px-1 hover:text-foreground transition-colors underline underline-offset-2">
          Privacyverklaring
        </button>
      </p>
      <AlgemeneVoorwaardenModal isOpen={avOpen} onClose={() => setAvOpen(false)} />
      <PrivacyverklaringModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </footer>
  );
}
