import { db, studioSettings } from "@workspace/db";
import { eq } from "drizzle-orm";

const KEY = "email_settings";

export type LesTypeTemplate = {
  welkomst: string;
  herinnering: string;
  ondertitel?: string;
  emailSubject?: string;
  emailBody?: string;
};

export type EmailSettings = {
  yogaWelkomst: string;
  circleWelkomst: string;
  yogaHerinnering: string;
  circleHerinnering: string;
  persoonlijkBericht: string;
  annuleringsNote: string;
  welkomstTekst: string;
  emailOndertitel: string;
  lesTypeTemplates: Record<string, LesTypeTemplate>;
};

export const EMAIL_DEFAULTS: EmailSettings = {
  emailOndertitel: "Zwangerschapsyoga · Nieuwerkerk a/d IJssel",
  yogaWelkomst:
    "Je plekje is gereserveerd! We kijken er naar uit je te zien op de mat. 🌙",
  circleWelkomst:
    "Je plekje in de Circle is gereserveerd! We kijken ernaar uit je te verwelkomen in de kring. 🌙",
  yogaHerinnering:
    "Dit is een vriendelijke herinnering dat je morgen bij ons verwacht wordt op de mat! We kijken er naar uit. 🌙",
  circleHerinnering:
    "Dit is een vriendelijke herinnering dat je morgen bij ons in de Circle verwacht wordt! We kijken er naar uit. 🌙",
  persoonlijkBericht: "",
  annuleringsNote:
    "Kun je toch niet komen? Annuleer dan minimaal 7 uur voor de les via de website of via WhatsApp, zodat anderen jouw plek kunnen overnemen.",
  welkomstTekst:
    "Je reservering is bevestigd. We kijken ernaar uit je te zien!",
  lesTypeTemplates: {},
};

export async function getEmailSettings(): Promise<EmailSettings> {
  const result = await db.select().from(studioSettings).where(eq(studioSettings.key, KEY)).limit(1);
  if (result.length === 0) return { ...EMAIL_DEFAULTS };
  const data = result[0].value as any;
  if (!data || typeof data !== "object") return { ...EMAIL_DEFAULTS };
  
  return {
    yogaWelkomst: typeof data.yogaWelkomst === "string" ? data.yogaWelkomst : EMAIL_DEFAULTS.yogaWelkomst,
    circleWelkomst: typeof data.circleWelkomst === "string" ? data.circleWelkomst : EMAIL_DEFAULTS.circleWelkomst,
    yogaHerinnering: typeof data.yogaHerinnering === "string" ? data.yogaHerinnering : EMAIL_DEFAULTS.yogaHerinnering,
    circleHerinnering: typeof data.circleHerinnering === "string" ? data.circleHerinnering : EMAIL_DEFAULTS.circleHerinnering,
    persoonlijkBericht: typeof data.persoonlijkBericht === "string" ? data.persoonlijkBericht : EMAIL_DEFAULTS.persoonlijkBericht,
    annuleringsNote: typeof data.annuleringsNote === "string" ? data.annuleringsNote : EMAIL_DEFAULTS.annuleringsNote,
    welkomstTekst: typeof data.welkomstTekst === "string" ? data.welkomstTekst : EMAIL_DEFAULTS.welkomstTekst,
    emailOndertitel: typeof data.emailOndertitel === "string" ? data.emailOndertitel : EMAIL_DEFAULTS.emailOndertitel,
    lesTypeTemplates: data.lesTypeTemplates && typeof data.lesTypeTemplates === "object" ? data.lesTypeTemplates : {},
  };
}

export async function saveEmailSettings(settings: Partial<EmailSettings>): Promise<EmailSettings> {
  const current = await getEmailSettings();
  const updated = { ...current, ...settings };
  await db.insert(studioSettings).values({ key: KEY, value: updated }).onConflictDoUpdate({
    target: studioSettings.key,
    set: { value: updated },
  });
  return updated;
}
