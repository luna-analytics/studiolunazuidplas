import { Resend } from "resend";
import { getEmailSettings } from "./email-settings.js";
import { readClassTypes } from "./class-types.js";
import { readTarieven } from "./tarieven.js";
import { logMailFailure } from "./mail-log.js";

// Bewust lui opgebouwd. new Resend(undefined) gooit direct een fout, en op
// moduleniveau zou een ontbrekende sleutel daarmee de complete API neerhalen
// in plaats van alleen de mail.
let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const FROM = "Studio Luna <info@studiolunazuidplas.nl>";
const ADMIN_TO = process.env.ADMIN_EMAIL ?? "info@studiolunazuidplas.nl";
// Meldingen gaan bewust van info@ naar info@. Bij een proef op 10 september
// kwam die route aan en bleven mails met website@ als afzender weg.

// Alle mail loopt via deze functie. Een ontbrekende sleutel gaf eerder geen
// enkel signaal, en Resend gooit bij een geweigerde verzending geen fout maar
// levert { error } terug, waar de oude code niet naar keek.
//
// Aanroepers moeten de verzending afwachten voordat ze antwoorden. Op Vercel
// wordt de functie bevroren zodra het antwoord weg is, en een mail die dan
// nog onderweg is komt nooit aan. Zo zijn in september berichten van de site
// blijven liggen terwijl ze wel in de database stonden.
async function verzend(
  opts: { to: string; subject: string; html: string },
  context: string,
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    await logMailFailure(context, opts.to, "RESEND_API_KEY ontbreekt in de omgeving van de server");
    return false;
  }
  try {
    const { error } = await getResend().emails.send({ from: FROM, ...opts });
    if (error) {
      await logMailFailure(context, opts.to, `${error.name ?? "fout"}: ${error.message ?? JSON.stringify(error)}`);
      return false;
    }
    return true;
  } catch (err: any) {
    await logMailFailure(context, opts.to, err?.message ?? String(err));
    return false;
  }
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function typeLabel(type: string): string {
  if (type === "yoga") return "Yoga les";
  if (type === "circle") return "Mama Circle";
  return type;
}

function paymentNote(isProefles: boolean, isLosseLes: boolean): string {
  if (isProefles)
    return "Proefles (€10) — betaling in de studio (contant of Tikkie)";
  if (isLosseLes)
    return "Losse les (€22,50) — betaling in de studio (contant of Tikkie)";
  return "1 les wordt afgeschreven van jouw rittenkaart";
}

const HEADER = (subtitle: string) => `
  <tr>
    <td style="background-color:#3A4F41; padding:40px 40px 30px; text-align:center;">
      <h1 style="margin:0; font-family:'Playfair Display', Georgia, serif; font-size:30px; color:#F8F7F5; font-weight:normal; letter-spacing:2px; text-transform:uppercase;">Studio Luna</h1>
      <p style="margin:10px 0 0; font-size:12px; color:#E6DDD2; letter-spacing:3px; text-transform:uppercase; font-weight:400;">${subtitle}</p>
    </td>
  </tr>
  <tr><td style="background-color:#E6DDD2; height:4px;"></td></tr>
`;

const FOOTER = `
  <tr>
    <td style="background-color:#3A4F41; padding:35px 40px; text-align:center;">
      <p style="margin:0 0 8px; font-size:13px; color:#E6DDD2;">Vragen? Stuur een berichtje via WhatsApp:</p>
      <p style="margin:0 0 15px; font-size:15px; color:#F8F7F5; font-weight:600; letter-spacing:1px;">+31 6 43735343</p>
      <p style="margin:0; font-size:11px; color:#8FA89B; letter-spacing:1px;">@studiolunazuidplas &nbsp; | &nbsp; info@studiolunazuidplas.nl</p>
    </td>
  </tr>
`;

const WRAPPER = (inner: string) => `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background-color:#F8F7F5; font-family:'Lato', Helvetica, Arial, sans-serif; color:#3A4F41;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F7F5; padding:40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(58,79,65,0.08);">
          ${inner}
        </table>
        <p style="margin-top:25px; font-size:11px; color:#8FA89B; text-align:center; text-transform:uppercase; letter-spacing:2px;">It takes a village</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── RESERVERING BEVESTIGING (via rooster/aanmelden — niet admin) ─────────────
export async function sendReservationConfirmation(params: {
  toEmail: string;
  toName: string;
  classTitle: string;
  dateStr: string;
  time: string;
  type: string;
}) {
  const { toEmail, toName, classTitle, dateStr, time, type } = params;
  const formattedDate = formatDate(dateStr);
  const settings = await getEmailSettings();
  const allTypes = await readClassTypes();
  const tarieven = await readTarieven();
  const betalingInfo = tarieven.betalingInfo || "Betaling vindt in de studio plaats — contant of via Tikkie.";
  const lesType = allTypes.find((t) => t.id === type);
  const intakeVereist = lesType?.intakeVereist ?? (type !== "circle");
  const isCircle = type === "circle";

  const perType = settings.lesTypeTemplates?.[type];
  const intro = perType?.welkomst || (isCircle ? settings.circleWelkomst : settings.yogaWelkomst);

  const intakeBlok = intakeVereist
    ? `<div style="border-left:3px solid #8FA89B; background-color:#FDFBF9; padding:15px 20px; margin-bottom:25px;">
        <p style="margin:0; font-size:14px; line-height:1.6; color:#3A4F41;">
          <strong style="color:#8FA89B; text-transform:uppercase; font-size:11px; letter-spacing:1px;">Intake</strong><br>
          Heb je de intake nog niet ingevuld? Doe dat dan via <a href="https://tally.so/r/XxED7j" style="color:#3A4F41;">tally.so/r/XxED7j</a> zodat Studio Luna je goed kan begeleiden.
        </p>
      </div>`
    : "";

  const inner = `
    ${HEADER(perType?.ondertitel || settings.emailOndertitel)}
    <tr>
      <td style="padding:40px 45px;">
        <h2 style="margin:0 0 15px; font-family:'Playfair Display', serif; font-size:22px; color:#3A4F41; font-weight:normal;">Lieve ${toName},</h2>
        <p style="margin:0 0 30px; font-size:15px; line-height:1.7; color:#3A4F41; font-weight:300;">${intro.replace(/\n/g, "<br/>")}</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F7F5; border-radius:8px; margin-bottom:25px;">
          <tr><td style="padding:25px;">
            <p style="margin:0 0 12px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#8FA89B;">Jouw moment</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0; font-size:15px; color:#3A4F41;"><strong>${formattedDate}</strong></td></tr>
              <tr><td style="padding:4px 0; font-size:15px; color:#3A4F41;">${time} uur &mdash; ${classTitle}</td></tr>
              <tr><td style="padding:4px 0; font-size:14px; color:#8FA89B;">Huize Mooisteen, Pr. Beatrixstraat 2, Nieuwerkerk a/d IJssel</td></tr>
            </table>
          </td></tr>
        </table>

        ${intakeBlok}

        <p style="margin:0; font-size:13px; color:#8FA89B; line-height:1.6;">${settings.annuleringsNote.replace(/\n/g, "<br/>")}</p>
      </td>
    </tr>
    ${FOOTER}
  `;

  await verzend(
    { to: toEmail, subject: `${classTitle} ${formattedDate} Studio Luna`, html: WRAPPER(inner) },
    "reserveringsbevestiging",
  );
}

// ─── HERINNERING ──────────────────────────────────────────────────────────────
export async function sendReminderEmail(params: {
  toEmail: string;
  toName: string;
  classTitle: string;
  dateStr: string;
  time: string;
  type: string;
}) {
  const { toEmail, toName, classTitle, dateStr, time, type } = params;
  const formattedDate = formatDate(dateStr);
  const isCircle = type === "circle";
  const settings = await getEmailSettings();

  const perType = settings.lesTypeTemplates?.[type];
  const intro = perType?.herinnering || (isCircle ? settings.circleHerinnering : settings.yogaHerinnering);

  const extraBlok = isCircle
    ? ""
    : `<div style="border-left:3px solid #8FA89B; background-color:#FDFBF9; padding:15px 20px; margin-bottom:25px;">
        <p style="margin:0; font-size:14px; line-height:1.6; color:#3A4F41;">
          <strong style="color:#8FA89B; text-transform:uppercase; font-size:11px; letter-spacing:1px;">Vergeet niet</strong><br>
          Neem een yogamat, flesje water en comfortabele kleding mee. Eet twee uur voor de les niet te zwaar.
        </p>
      </div>`;

  const inner = `
    ${HEADER(perType?.ondertitel || settings.emailOndertitel)}
    <tr>
      <td style="padding:40px 45px;">
        <h2 style="margin:0 0 15px; font-family:'Playfair Display', serif; font-size:22px; color:#3A4F41; font-weight:normal;">Lieve ${toName},</h2>
        <p style="margin:0 0 25px; font-size:15px; line-height:1.7; color:#3A4F41; font-weight:300;">${intro.replace(/\n/g, "<br/>")}</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F7F5; border-radius:8px; margin-bottom:25px;">
          <tr><td style="padding:25px;">
            <p style="margin:0 0 12px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#8FA89B;">Jouw moment</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0; font-size:15px; color:#3A4F41;"><strong>${formattedDate}</strong></td></tr>
              <tr><td style="padding:4px 0; font-size:15px; color:#3A4F41;">${time} uur &mdash; ${classTitle}</td></tr>
              <tr><td style="padding:4px 0; font-size:14px; color:#8FA89B;">Huize Mooisteen, Pr. Beatrixstraat 2, Nieuwerkerk a/d IJssel</td></tr>
            </table>
          </td></tr>
        </table>

        ${extraBlok}

        <p style="margin:0; font-size:13px; color:#8FA89B; line-height:1.6;">${settings.annuleringsNote.replace(/\n/g, "<br/>")}</p>
      </td>
    </tr>
    ${FOOTER}
  `;

  await verzend(
    { to: toEmail, subject: `Tot morgen bij Studio Luna! — ${classTitle}`, html: WRAPPER(inner) },
    "herinnering",
  );
}

// ─── BEVESTIGING AANMELDING GEBOORTEREEKS (direct naar de aanmelder) ─────────
// Zonder deze mail hoorde een aanmelder pas iets wanneer Marjolein zelf
// mailde; wie een dag niets hoort gaat twijfelen. De tekst spiegelt de
// succesmelding op de reekspagina en belooft niets nieuws.
export async function sendReeksAanmeldingBevestiging(params: { toEmail: string; toName: string }) {
  const { toEmail, toName } = params;

  const inner = `
    ${HEADER("Aanmelding ontvangen")}
    <tr>
      <td style="padding:40px 45px;">
        <h2 style="margin:0 0 15px; font-family:'Playfair Display', serif; font-size:22px; color:#3A4F41; font-weight:normal;">Lieve ${toName},</h2>
        <p style="margin:0 0 16px; font-size:15px; line-height:1.8; color:#3A4F41; font-weight:300;">
          Je aanmelding voor de Geboortereeks is binnen, dankjewel! De reeks start op
          dinsdag 29 september in Nieuwerkerk aan den IJssel, elke dinsdag van 19:00 tot 20:15 uur.
        </p>
        <p style="margin:0 0 16px; font-size:15px; line-height:1.8; color:#3A4F41; font-weight:300;">
          Marjolein stuurt je persoonlijk het intakeformulier en de factuur per mail;
          daarna is je plek definitief. Je hoeft nu verder niets te doen.
        </p>
      </td>
    </tr>
    ${FOOTER}
  `;

  await verzend(
    { to: toEmail, subject: "Je aanmelding voor de Geboortereeks is binnen", html: WRAPPER(inner) },
    "aanmeldbevestiging Geboortereeks",
  );
}

// ─── ADMIN NOTIFICATIE (bij nieuwe reservering / boeking / aanvraag) ─────────
export async function sendAdminNotification(params: {
  type: "reservering" | "boeking" | "aanvraag" | "zorgkaart";
  name: string;
  email: string;
  details: string;
}): Promise<boolean> {
  const { type, name, email, details } = params;
  const labels = { reservering: "Nieuwe reservering", boeking: "Nieuwe boeking", aanvraag: "Nieuwe aanvraag", zorgkaart: "Zorgkaart" };
  const label = labels[type];
  const kop = type === "zorgkaart" ? "Er is iets binnengekomen voor de zorgkaart" : `Er is een ${type} binnengekomen!`;

  const inner = `
    ${HEADER(label)}
    <tr>
      <td style="padding:40px 45px;">
        <h2 style="margin:0 0 20px; font-family:'Playfair Display', serif; font-size:22px; color:#3A4F41; font-weight:normal;">${kop}</h2>

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F7F5; border-radius:8px; margin-bottom:20px;">
          <tr><td style="padding:22px 25px;">
            <p style="margin:0 0 10px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#8FA89B;">Klant</p>
            <p style="margin:0 0 4px; font-size:16px; color:#3A4F41; font-weight:600;">${name}</p>
            <p style="margin:0; font-size:14px; color:#8FA89B;">${email}</p>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F7F5; border-radius:8px; margin-bottom:25px;">
          <tr><td style="padding:22px 25px;">
            <p style="margin:0 0 10px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#8FA89B;">Details</p>
            <p style="margin:0; font-size:14px; line-height:1.8; color:#3A4F41;">${details.replace(/\n/g, "<br/>")}</p>
          </td></tr>
        </table>

        <div style="border-left:3px solid #3A4F41; background-color:#FDFBF9; padding:15px 20px;">
          <p style="margin:0; font-size:14px; line-height:1.6; color:#3A4F41;">
            <strong style="color:#3A4F41; text-transform:uppercase; font-size:11px; letter-spacing:1px;">Actie vereist</strong><br>
            Log in op je admin-omgeving om de bevestigingsmail zelf samen te stellen en te verzenden.
          </p>
        </div>
      </td>
    </tr>
    ${FOOTER}
  `;

  return verzend(
    { to: ADMIN_TO, subject: `[Studio Luna] ${label}: ${name}`, html: WRAPPER(inner) },
    `adminmelding (${type})`,
  );
}

// ─── AANGEPASTE BEVESTIGINGSMAIL (door admin zelf geschreven) ────────────────
export async function sendCustomEmail(params: {
  toEmail: string;
  toName: string;
  subject: string;
  body: string;
  ondertitel?: string;
}) {
  const { toEmail, toName, subject, body, ondertitel } = params;

  const bodyHtml = body
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 16px; font-size:15px; line-height:1.8; color:#3A4F41; font-weight:300;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const settings = await getEmailSettings();

  const inner = `
    ${HEADER(ondertitel || settings.emailOndertitel)}
    <tr>
      <td style="padding:40px 45px;">
        <h2 style="margin:0 0 24px; font-family:'Playfair Display', serif; font-size:22px; color:#3A4F41; font-weight:normal;">Lieve ${toName},</h2>
        ${bodyHtml}
      </td>
    </tr>
    ${FOOTER}
  `;

  const gelukt = await verzend({ to: toEmail, subject, html: WRAPPER(inner) }, "handmatige mail");
  if (!gelukt) {
    throw new Error("De mail is niet verzonden. Kijk bij Mailstatus in de admin waarom.");
  }
}

// ─── BOOKING BEVESTIGING (via rittenkaart / proefles / losse les flow) ────────
export async function sendBookingConfirmation(params: {
  toEmail: string;
  toName: string;
  className: string;
  date: string;
  time: string;
  type: string;
  isProefles: boolean;
  isLosseLes: boolean;
  creditsLeft: number;
}) {
  const { toEmail, toName, className, date, time, type, isProefles, isLosseLes } = params;
  const isCircle = type === "circle";

  const settings = await getEmailSettings();
  const formattedDate = formatDate(date);
  const lesType = typeLabel(type);
  const betaling = paymentNote(isProefles, isLosseLes);

  const intro = isCircle ? settings.circleWelkomst : settings.yogaWelkomst;

  const persoonlijkBlok = settings.persoonlijkBericht?.trim()
    ? `<p style="margin:20px 0 0; font-size:14px; line-height:1.7; color:#3A4F41; font-style:italic;">${settings.persoonlijkBericht.replace(/\n/g, "<br/>")}</p>`
    : "";

  const inner = `
    <tr>
      <td style="background-color:#3A4F41; padding:40px 40px 30px; text-align:center;">
        <h1 style="margin:0; font-family:'Playfair Display', Georgia, serif; font-size:30px; color:#F8F7F5; font-weight:normal; letter-spacing:2px; text-transform:uppercase;">Studio Luna</h1>
        <p style="margin:10px 0 0; font-size:12px; color:#E6DDD2; letter-spacing:3px; text-transform:uppercase; font-weight:400;">Reservering bevestigd</p>
      </td>
    </tr>
    <tr><td style="background-color:#E6DDD2; height:4px;"></td></tr>
    <tr>
      <td style="padding:40px 45px;">
        <h2 style="margin:0 0 15px; font-family:'Playfair Display', serif; font-size:22px; color:#3A4F41; font-weight:normal;">Lieve ${toName},</h2>
        <p style="margin:0 0 30px; font-size:15px; line-height:1.7; color:#3A4F41; font-weight:300;">${intro.replace(/\n/g, "<br/>")}</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F7F5; border-radius:8px; margin-bottom:25px;">
          <tr><td style="padding:25px;">
            <p style="margin:0 0 12px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#8FA89B;">Jouw moment</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0; font-size:15px; color:#3A4F41;"><strong>${formattedDate}</strong></td></tr>
              <tr><td style="padding:4px 0; font-size:15px; color:#3A4F41;">${time} uur &mdash; ${className}</td></tr>
              <tr><td style="padding:4px 0; font-size:14px; color:#8FA89B;">${lesType}</td></tr>
            </table>
          </td></tr>
        </table>

        <p style="margin:0; font-size:13px; color:#8FA89B; line-height:1.6;">${settings.annuleringsNote.replace(/\n/g, "<br/>")}</p>
        ${persoonlijkBlok}
      </td>
    </tr>
    ${FOOTER}
  `;

  await verzend(
    { to: toEmail, subject: `${className} ${formattedDate} Studio Luna`, html: WRAPPER(inner) },
    "boekingsbevestiging",
  );
}
