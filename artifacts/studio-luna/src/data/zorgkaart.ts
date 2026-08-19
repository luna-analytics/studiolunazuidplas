/**
 * ZORGKAART GEBOORTEZORG REGIO ZUIDPLAS
 * ─────────────────────────────────────
 * Alle aanbieders rondom zwangerschap, bevalling en jong moederschap in en rond
 * gemeente Zuidplas (Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht, Moerkapelle).
 *
 * Aanbieder toevoegen of aanpassen? Bewerk de lijsten hieronder. Elke aanbieder
 * heeft een of meer tags uit TAG_LABELS; voeg alleen tags toe die de eigen
 * website van de aanbieder bevestigt.
 */

export type ZorgTag =
  | "caseload"
  | "holistisch"
  | "op-locatie"
  | "aan-huis"
  | "online"
  | "avond-weekend"
  | "vergoeding"
  | "1-op-1"
  | "groepslessen"
  | "partner-welkom"
  | "thuisbevalling";

export const TAG_LABELS: Record<ZorgTag, { label: string; uitleg: string }> = {
  caseload: { label: "Caseload", uitleg: "Eén vaste verloskundige begeleidt je het hele traject, van eerste controle tot bevalling" },
  holistisch: { label: "Holistisch", uitleg: "Werkt vanuit een holistische of natuurlijke benadering" },
  "op-locatie": { label: "Op locatie", uitleg: "Je gaat naar een praktijk- of lesruimte" },
  "aan-huis": { label: "Aan huis", uitleg: "Komt bij je thuis" },
  online: { label: "Online", uitleg: "Ook of volledig online beschikbaar" },
  "avond-weekend": { label: "Avond en weekend", uitleg: "Ook buiten kantoortijden terecht" },
  vergoeding: { label: "Vergoeding mogelijk", uitleg: "De website noemt vergoeding vanuit de basis- of aanvullende verzekering; check altijd je eigen polis" },
  "1-op-1": { label: "1 op 1", uitleg: "Individuele begeleiding" },
  groepslessen: { label: "Groepslessen", uitleg: "Lessen of bijeenkomsten in groepsverband" },
  "partner-welkom": { label: "Partner welkom", uitleg: "Je partner kan meedoen of aanwezig zijn" },
  thuisbevalling: { label: "Thuisbevalling", uitleg: "Begeleidt bevallingen thuis" },
};

export type Zorgverlener = {
  naam: string;
  plaats: string;
  website: string;
  beschrijving: string;
  tags: ZorgTag[];
};

export type ZorgCategorie = {
  id: string;
  titel: string;
  intro: string;
  zoektermen: string;
  aanbieders: Zorgverlener[];
};

export const ZORGKAART: ZorgCategorie[] = [];
