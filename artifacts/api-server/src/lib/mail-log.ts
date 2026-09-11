import { db, studioSettings } from "@workspace/db";
import { eq } from "drizzle-orm";

// Mislukte mail was tot nu toe onzichtbaar. Elke verzending zat in een
// try/catch die de fout wegslikte, en de Resend-client gooit bij een
// geweigerde verzending helemaal geen fout maar geeft die terug in het
// antwoord. Daardoor konden berichten van de site blijven liggen zonder dat
// iemand het merkte. Vandaar dit logboek: elke mislukking komt in de
// database en is zichtbaar in de admin onder Mailstatus.

const KEY = "mail_failures";
const MAX = 50;

export type MailFailure = {
  context: string;
  to: string;
  error: string;
  timestamp: string;
};

export async function logMailFailure(context: string, to: string, error: string) {
  console.error(`[email] MISLUKT (${context} naar ${to}): ${error}`);
  try {
    const rows = await db.select().from(studioSettings).where(eq(studioSettings.key, KEY)).limit(1);
    const bestaand = rows.length > 0 && Array.isArray(rows[0].value) ? (rows[0].value as MailFailure[]) : [];
    const nieuw = [...bestaand, { context, to, error, timestamp: new Date().toISOString() }].slice(-MAX);
    await db.insert(studioSettings).values({ key: KEY, value: nieuw }).onConflictDoUpdate({
      target: studioSettings.key,
      set: { value: nieuw },
    });
  } catch (err) {
    // Als zelfs het vastleggen niet lukt blijft de console-regel hierboven over
    console.error("[email] Kon de mislukking niet vastleggen:", err);
  }
}

export async function readMailFailures(): Promise<MailFailure[]> {
  const rows = await db.select().from(studioSettings).where(eq(studioSettings.key, KEY)).limit(1);
  if (rows.length === 0 || !Array.isArray(rows[0].value)) return [];
  return rows[0].value as MailFailure[];
}

export async function clearMailFailures() {
  await db.insert(studioSettings).values({ key: KEY, value: [] }).onConflictDoUpdate({
    target: studioSettings.key,
    set: { value: [] },
  });
}
