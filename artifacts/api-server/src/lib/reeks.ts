// De Geboortereeks waarvoor je je nu op de site aanmeldt. Dit is de enige plek
// waar de lesdata staan: de bevestigingsmail, de melding aan Marjolein en de
// kalender op de reekspagina lezen allemaal hieruit.
//
// Waarom: op 14 oktober 2026 ging de site over op de januarireeks, maar de
// bevestigingsmail had een eigen vaste tekst en bleef "dinsdag 29 september"
// noemen. De build controleert nu ook alle teksten op de site en in de mails
// op datums die niet in deze lijst staan (scripts/controleer-datums.mjs).
//
// Nieuwe reeks? Pas alleen deze lijst aan, en daarna wat de build meldt.

export type Les = {
  iso: string;
  noot?: string;
  /** Een gastles: naam met link naar de eigen website, eventueel met vak. */
  gast?: { naam: string; href: string; rol?: string };
};

export const REEKS = {
  dag: "woensdag",
  tijd: "19:00 tot 20:15 uur",
  plaats: "Waldorfhaus de Perenboom, Raadhuisplein 28 in Nieuwerkerk aan den IJssel",
  lessen: [
    { iso: "2027-01-13" },
    { iso: "2027-01-20" },
    { iso: "2027-01-27", gast: { naam: "Tamar Riani", href: "https://www.tamarriani.nl" } },
    { iso: "2027-02-03" },
    { iso: "2027-02-10", gast: { naam: "Mélanie de Groot", rol: "bekkenfysiotherapeut", href: "https://yilafysio.nl/" } },
    { iso: "2027-02-17" },
    { iso: "2027-02-24", noot: "Partnerles" },
    { iso: "2027-03-03" },
  ] as Les[],
};

const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli",
  "augustus", "september", "oktober", "november", "december"];

/** "2027-01-13" wordt "13 januari". */
export function dagMaand(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MAANDEN[m - 1]}`;
}

export const REEKS_START = REEKS.lessen[0].iso;

/** Is de reeks al begonnen? Dan hoort er een nieuwe reeks in deze lijst. */
export function reeksBegonnen(vandaag = new Date()): boolean {
  const nu = vandaag.toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" });
  return nu >= REEKS_START;
}
