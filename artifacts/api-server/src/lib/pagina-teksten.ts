import Database from "@replit/database";

const db = new Database();
const KEY = "studio_luna:pagina_teksten";

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
  aanbod_circle_tekst:
    "Bij Studio Luna geloven we in de kracht van de 'village'. Naast de fysieke lessen creëren we een veilige cirkel waarin je ervaringen deelt, vragen stelt en naar elkaar omkijkt. We gebruiken zachte yoga- en ademhalingsoefeningen om samen te vertragen, zodat er ruimte ontstaat om echt te luisteren naar jezelf en elkaar. Echte verbinding met andere zwangeren en mama's in Zuidplas!",
};

export async function readPaginaTeksten(): Promise<PaginaTeksten> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return DEFAULT;
    const data = result?.value ?? result;
    if (!data || typeof data !== "object") return DEFAULT;
    return { ...DEFAULT, ...data } as PaginaTeksten;
  } catch {
    return DEFAULT;
  }
}

export async function savePaginaTeksten(updates: Partial<PaginaTeksten>): Promise<PaginaTeksten> {
  const current = await readPaginaTeksten();
  const updated = { ...current, ...updates };
  await db.set(KEY, updated);
  return updated;
}
