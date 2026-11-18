// De massage van Studio Luna. Eén plek voor naam, duur, prijzen en plekken:
// de twee massagepagina's (zwanger en postpartum) en de bevestigingsmail lezen
// allemaal hieruit, net zoals de reeks uit reeks.ts komt.
//
// Haar keuzes van 18 november 2026: alleen Lomi Lomi Hapai, 75 minuten, €85
// met €75 als introductieprijs; dezelfde massage op twee pagina's. Aan huis is er voorlopig
// niet bij (haar keuze, na eerst €95 en €100): dat komt later als aparte
// behandeling aan huis, op de aanbodpagina als "binnenkort beschikbaar".

export const MASSAGE = {
  naam: "Lomi Lomi Hapai",
  duur: "75 minuten",
  prijs: 85,
  introductieprijs: 75,
  praktijk: {
    naam: "Remindyourlife",
    adres: "'s-Gravenweg 266 in Nieuwerkerk aan den IJssel",
  },
  // Eerst vanaf 12 weken zwanger en ongeveer twee weken na de bevalling; later
  // op 18 november haar keuze: de hele zwangerschap en de hele tijd erna.
  wanneerZwanger: "tijdens de hele zwangerschap",
  wanneerPostpartum: "vlak na de bevalling en ook maanden later",
};

export type MassageVoor = "zwanger" | "postpartum";
export type MassagePlek = "praktijk" | "thuis";

// Het raster in het aanvraagformulier: per dag drie dagdelen.
export const MASSAGE_DAGEN = [
  { code: "ma", naam: "maandag" },
  { code: "di", naam: "dinsdag" },
  { code: "wo", naam: "woensdag" },
  { code: "do", naam: "donderdag" },
  { code: "vr", naam: "vrijdag" },
  { code: "za", naam: "zaterdag" },
] as const;
export const MASSAGE_DAGDELEN = ["ochtend", "middag", "avond"] as const;

/** "wo-avond" wordt "woensdagavond"; een onbekende code geeft null. */
export function dagdeelNaam(code: string): string | null {
  const [dag, deel] = code.split("-");
  const d = MASSAGE_DAGEN.find((x) => x.code === dag);
  if (!d || !(MASSAGE_DAGDELEN as readonly string[]).includes(deel)) return null;
  return `${d.naam}${deel}`;
}

/** Zet een lijst dagdelen in de volgorde van het raster, als leesbare tekst. */
export function dagdelenTekst(codes: string[]): string {
  const volgorde = MASSAGE_DAGEN.flatMap((d) => MASSAGE_DAGDELEN.map((deel) => `${d.code}-${deel}`));
  return volgorde
    .filter((c) => codes.includes(c))
    .map((c) => dagdeelNaam(c))
    .join(", ");
}
