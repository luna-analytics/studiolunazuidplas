import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Props = {
  ctaUrl?: string;
  ctaLabel?: string;
  // In een artikel staat het blok al binnen de tekstkolom en krijgt het geen eigen zijmarge.
  inKolom?: boolean;
  // Op een gekleurde baan: de scheidingslijn vervalt, want de kleur doet dat werk al,
  // en de kop mag groter omdat het blok dan de afsluiting van de pagina is.
  opBand?: boolean;
};

export function CtaBlock({ ctaUrl: propUrl, ctaLabel: propLabel, inKolom = false, opBand = false }: Props = {}) {
  const [, navigate] = useLocation();
  const [ctaUrl, setCtaUrl] = useState(propUrl ?? "/geboortereeks");
  const [ctaLabel, setCtaLabel] = useState(propLabel ?? "Bekijk de Geboortereeks");

  useEffect(() => {
    if (propUrl && propLabel) return; // already provided by parent
    fetch(`${BASE}/api/pagina-teksten`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!propUrl && d?.cta_url) setCtaUrl(d.cta_url);
        if (!propLabel && d?.cta_label) setCtaLabel(d.cta_label);
      })
      .catch(() => {});
  }, [propUrl, propLabel]);

  // Geen gekleurd afgerond vlak meer: een gewone afsluiting met een dunne lijn erboven.
  // Staat het blok op een gekleurde baan, dan vervalt die lijn en draagt de kleur de afsluiting.
  return (
    <section
      className={
        opBand
          ? "px-7 md:px-14 lg:px-18 py-14 md:py-20"
          : inKolom
            ? "mb-10"
            : "px-7 md:px-14 lg:px-18 mb-10 md:mb-14"
      }
    >
      <div className={`${opBand ? "" : "border-t border-border/30 pt-10 md:pt-12"} flex flex-col md:flex-row md:items-center md:justify-between gap-6`}>
        <p className={`font-display font-medium text-foreground leading-snug ${opBand ? "text-3xl md:text-[2.75rem]" : "text-2xl md:text-3xl"}`}>
          Klaar om te beginnen?
        </p>
        <button
          onClick={() => navigate(ctaUrl)}
          className="inline-flex items-center self-start md:self-auto bg-primary text-primary-foreground px-7 py-3.5 rounded-[6px] font-semibold text-sm hover:bg-primary/88 transition-colors shrink-0"
        >
          {ctaLabel}
        </button>
      </div>
    </section>
  );
}
