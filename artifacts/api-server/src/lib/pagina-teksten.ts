import Database from "@replit/database";
import { FOTO_KEYS, migrateFotosIfNeeded } from "./foto-store";

const db = new Database();
const KEY = "studio_luna:pagina_teksten";

const FOTO_FIELD_SET = new Set<string>(FOTO_KEYS);

export type PaginaTeksten = {
  // Studio Luna pagina
  home_hero: string;
  home_missie_tekst: string;
  home_missie_bullets: string;
  // Aanbod pagina — Yoga
  aanbod_yoga_tekst1: string;
  aanbod_yoga_tekst2: string;
  aanbod_yoga_tijd: string;
  aanbod_yoga_locatie: string;
  aanbod_yoga_extra: string;
  // Aanbod pagina — Circle
  aanbod_circle_titel: string;
  aanbod_circle_tekst: string;
  // Tarieven — aanvraag modal
  tarieven_aanvraag_tekst: string;
  // Over mij pagina
  over_mij_naam: string;
  over_mij_functie: string;
  over_mij_quote: string;
  over_mij_tekst: string;
  over_mij_foto: string; // base64 data URL of externe URL
  // Site-foto's (base64 data URL — leeg = gebruik standaard statische foto)
  foto_hero: string;
  foto_yoga: string;
  foto_circle: string;
  // Foto-weergave-instellingen
  foto_hero_positie: string;   // "top" | "center" | "bottom"
  foto_yoga_hoogte: string;    // "smal" | "normaal" | "hoog" | "portret"
  foto_yoga_positie: string;   // "top" | "center" | "bottom"
  foto_circle_hoogte: string;  // "smal" | "normaal" | "hoog" | "portret"
  foto_circle_positie: string; // "top" | "center" | "bottom"
  // Studio Luna pagina — missie sectie
  home_missie_heading: string;
  home_village_tagline: string;
  // Studio Luna pagina — aanbod sectie
  home_aanbod_heading: string;
  home_aanbod_items: string; // één item per regel
  // Studio Luna pagina — locatie & contact
  home_locatie_naam: string;
  home_locatie_adres: string;
  home_contact_email: string;
  home_contact_telefoon: string;
  home_contact_instagram: string;
  // Aanbod pagina — yoga
  aanbod_yoga_heading: string;
  // Aanbod pagina — bevallings specials
  aanbod_specials_heading: string;
  aanbod_specials_items: string; // formaat: "Titel | Ondertitel | Prijs" per regel
  aanbod_specials_bundel: string; // formaat: "Titel | Ondertitel | Korting | Prijs"
  aanbod_verzekering_tekst: string;
  // CTA-knop instellingen
  cta_url: string;
  cta_label: string;
};

const DEFAULT: PaginaTeksten = {
  home_hero: "It takes a village.\nStudio Luna is jouw mama tribe.",
  home_missie_tekst:
    "Het moederschap hoef je niet alleen te doen. De missie van Studio Luna is het faciliteren van een community voor alle vrouwen in Nieuwerkerk aan den IJssel en omgeving, van zwangerschap tot ver daarna. Een veilige haven om fysiek op te laden, mentaal tot rust te komen en bovenal in verbinding te staan met andere moeders in dezelfde fase.",
  home_missie_bullets:
    "Een plek om te landen.\nEen plek om fysiek sterk, gezond en in balans te blijven.\nEen plek om vertrouwen te vinden in je veranderende lichaam.\nEen plek om te connecten met andere moeders.\nStudio Luna is jouw mama tribe.",
  aanbod_yoga_tekst1:
    "Sterk, ontspannen en vol vertrouwen richting je bevalling. Met zachte houdingen houden we je veranderende lichaam in balans. We oefenen met ademhaling en maken contact met je baby.",
  aanbod_yoga_tekst2:
    "Elke les heeft een net andere focus, zoals het bekken, de kracht van je adem of ruimte in je rug. Instromen is op elk moment mogelijk vanaf 14 weken zwangerschap.",
  aanbod_yoga_tijd: "Elke dinsdag 19:00",
  aanbod_yoga_locatie: "Huize Mooisteen, Pr. Beatrixstraat 2, Nieuwerkerk a/d IJssel",
  aanbod_yoga_extra: "Na afloop: verse thee en tijd voor verbinding",
  aanbod_circle_titel: "Zwanger & Mama Circle",
  tarieven_aanvraag_tekst:
    "Studio Luna voegt zo snel mogelijk je credits toe aan je account. De betaling vindt in de studio plaats bij je eerstvolgende les.",
  over_mij_naam: "Jouw naam",
  over_mij_functie: "Zwangerschapsyoga docente & oprichter Studio Luna",
  over_mij_quote: "Ik geloof dat elke vrouw kracht in zich draagt — soms moet je die alleen even leren voelen.",
  over_mij_tekst: "Vertel hier jouw verhaal. Waarom ben je begonnen met Studio Luna? Wat drijft je? Hoe ben je bij zwangerschapsyoga terechtgekomen?\n\nJe kunt hier meerdere alinea's schrijven. Elke lege regel wordt een nieuwe alinea op de pagina.",
  over_mij_foto: "",
  foto_hero: "",
  foto_yoga: "",
  foto_circle: "",
  foto_hero_positie: "center",
  foto_yoga_hoogte: "normaal",
  foto_yoga_positie: "center",
  foto_circle_hoogte: "hoog",
  foto_circle_positie: "center",
  home_missie_heading: "Een plek om\nte landen.",
  home_village_tagline: "Welkom in jouw village.",
  home_aanbod_heading: "Alles wat je nodig hebt\nop weg naar de bevalling.",
  home_aanbod_items: "Kleine groepen, veel aandacht en persoonlijk contact.\nZwangerschapsyoga: bevalling voorbereiden, kracht van de adem en fysieke balans.\nNa afloop altijd tijd voor een kopje thee en verbinding.\nInstromen mogelijk vanaf 14 weken zwangerschap.\nWhatsApp-community voor vragen en tips tussen lessen door.\nAandacht voor zowel het fysieke als het mentale aspect van moederschap.",
  home_locatie_naam: "Huize Mooisteen",
  home_locatie_adres: "Pr. Beatrixstraat 2\nNieuwerkerk aan den IJssel",
  home_contact_email: "info@studiolunazuidplas.nl",
  home_contact_telefoon: "+31 6 43 73 53 43",
  home_contact_instagram: "@studiolunazuidplas",
  aanbod_yoga_heading: "Sterk en vol\nvertrouwen richting\nje bevalling.",
  aanbod_specials_heading: "Bevallings Specials",
  aanbod_specials_items: "Bevallings Yoga Workshop | Focus & Vertrouwen · 120 min | € 49,-\nPartner Workshop | Verbinding & Support · 120 min | € 79,-\nMama Spa | Ultiem ontspannen · 120 min | € 49,-",
  aanbod_specials_bundel: "De Geboorte-Bundel | Alle drie workshops · meest complete voorbereiding | bespaar € 22,- | € 155,-",
  aanbod_verzekering_tekst: "Veel verzekeraars vergoeden (een deel van) geboortevoorbereiding vanuit de aanvullende verzekering.",
  cta_url: "/rooster",
  cta_label: "Reserveer jouw plekje",
  aanbod_circle_tekst:
    "Bij Studio Luna geloven we in de kracht van de 'village'. Naast de fysieke lessen creëren we een veilige cirkel waarin je ervaringen deelt, vragen stelt en naar elkaar omkijkt. We gebruiken zachte yoga- en ademhalingsoefeningen om samen te vertragen, zodat er ruimte ontstaat om echt te luisteren naar jezelf en elkaar. Echte verbinding met andere zwangeren en mama's in Zuidplas!",
};

/** Strip base64 foto-velden — die worden in aparte DB-sleutels opgeslagen */
function stripFotoFields(data: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(data).filter(([k]) => !FOTO_FIELD_SET.has(k)));
}

export async function readPaginaTeksten(): Promise<PaginaTeksten> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return DEFAULT;
    const data = result?.value ?? result;
    if (!data || typeof data !== "object") return DEFAULT;
    // Eénmalige migratie: als er foto-data in het oude object zit, verplaats naar eigen sleutels
    await migrateFotosIfNeeded(data as Record<string, any>);
    // Strip foto-velden zodat het teksten-object licht blijft
    const stripped = stripFotoFields(data as Record<string, any>);
    return { ...DEFAULT, ...stripped } as PaginaTeksten;
  } catch {
    return DEFAULT;
  }
}

export async function savePaginaTeksten(
  updates: Partial<PaginaTeksten>
): Promise<PaginaTeksten> {
  const current = await readPaginaTeksten();
  // Sla nooit base64 foto-data op in het teksten-object
  const safeUpdates = stripFotoFields(updates as Record<string, any>);
  const updated = { ...current, ...safeUpdates };
  await db.set(KEY, updated);
  return updated as PaginaTeksten;
}
