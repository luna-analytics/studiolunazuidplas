import Database from "@replit/database";

const db = new Database();
const KEY = "studio_luna:email_settings";

export type EmailSettings = {
  welkomstTekst: string;
  persoonlijkBericht: string;
  annuleringsNote: string;
};

export const EMAIL_DEFAULTS: EmailSettings = {
  welkomstTekst: "Je reservering is bevestigd. We kijken ernaar uit je te zien op de mat!",
  persoonlijkBericht: "",
  annuleringsNote: "Kun je toch niet komen? Annuleer dan minimaal 7 uur voor de les via de app, zodat anderen jouw plek kunnen innemen.",
};

export async function getEmailSettings(): Promise<EmailSettings> {
  try {
    const result = (await db.get(KEY)) as any;
    if (result?.ok === false) return { ...EMAIL_DEFAULTS };
    const data = result?.value ?? result;
    if (!data || typeof data !== "object") return { ...EMAIL_DEFAULTS };
    return {
      welkomstTekst: typeof data.welkomstTekst === "string" ? data.welkomstTekst : EMAIL_DEFAULTS.welkomstTekst,
      persoonlijkBericht: typeof data.persoonlijkBericht === "string" ? data.persoonlijkBericht : EMAIL_DEFAULTS.persoonlijkBericht,
      annuleringsNote: typeof data.annuleringsNote === "string" ? data.annuleringsNote : EMAIL_DEFAULTS.annuleringsNote,
    };
  } catch {
    return { ...EMAIL_DEFAULTS };
  }
}

export async function saveEmailSettings(settings: Partial<EmailSettings>): Promise<EmailSettings> {
  const current = await getEmailSettings();
  const updated = { ...current, ...settings };
  await db.set(KEY, updated);
  return updated;
}
