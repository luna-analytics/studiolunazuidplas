// De massage van Studio Luna. Eén plek voor naam, duur, prijzen en plekken:
// de twee massagepagina's (zwanger en postpartum) en de bevestigingsmail lezen
// allemaal hieruit, net zoals de reeks uit reeks.ts komt.
//
// Haar keuzes van 18 november 2026: alleen Lomi Lomi Hapai, 75 minuten, €85
// met €75 als introductieprijs; dezelfde massage op twee pagina's. Aan huis is er voorlopig
// niet bij (haar keuze, na eerst €95 en €100): dat komt later als aparte
// behandeling aan huis, op de aanbodpagina als "binnenkort beschikbaar".
//
// Haar keuzes van 27 november 2026: los €90 (was €85). De introductieprijs van
// €75 geldt voor je eerste massage en loopt tot en met 31 december 2026;
// daarna €90 los of een pakket. Pakketten: 3 massages €240 (6 maanden geldig)
// en 5 massages €380 (12 maanden geldig), zwangerschaps- en postpartummassages
// door elkaar, zonder introductieprijs. Na de einddatum verdwijnt de
// introductieprijs vanzelf van de pagina's (introductieLoopt), en stopt de
// datumbewaking de build tot de datum hieronder is opgeruimd.

export const MASSAGE = {
  naam: "Lomi Lomi Hapai",
  duur: "75 minuten",
  prijs: 90,
  introductieprijs: 75,
  introductieTot: "2026-12-31",
  introductieTotTekst: "31 december 2026",
  praktijk: {
    naam: "Remindyourlife",
    adres: "'s-Gravenweg 266 in Nieuwerkerk aan den IJssel",
  },
  // Eerst vanaf 12 weken zwanger en ongeveer twee weken na de bevalling; later
  // op 18 november haar keuze: de hele zwangerschap en de hele tijd erna.
  wanneerZwanger: "tijdens de hele zwangerschap",
  wanneerPostpartum: "vlak na de bevalling en ook maanden later",
};

export const MASSAGE_PAKKETTEN = [
  { code: "3", aantal: 3, prijs: 240, geldig: "6 maanden" },
  { code: "5", aantal: 5, prijs: 380, geldig: "12 maanden" },
] as const;
export const PAKKET_MENGEN = "zwangerschaps- en postpartummassages door elkaar";

/** Loopt de introductieprijs vandaag (Nederlandse tijd) nog? */
export function introductieLoopt(nu: Date = new Date()): boolean {
  return nu.toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" }) <= MASSAGE.introductieTot;
}

export const INTRODUCTIE_TEKST =
  `€${MASSAGE.introductieprijs} introductieprijs voor je eerste massage, tot en met ${MASSAGE.introductieTotTekst}`;

/** Wat iemand in het formulier kiest: een losse massage of een pakket. */
export type MassageKeuze = "los" | (typeof MASSAGE_PAKKETTEN)[number]["code"];

/** "los" wordt "een losse massage", "3" wordt "een pakket van 3 massages (€240, 6 maanden geldig)". */
export function keuzeTekst(code: string): string | null {
  if (code === "los") return "een losse massage";
  const p = MASSAGE_PAKKETTEN.find((x) => x.code === code);
  return p ? `een pakket van ${p.aantal} massages (€${p.prijs}, ${p.geldig} geldig)` : null;
}

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
