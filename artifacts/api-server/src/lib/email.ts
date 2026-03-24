import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { getEmailSettings } from "./email-settings.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Studio Luna <info@studiolunazuidplas.nl>";

const LOGO_PATH = path.join(process.cwd(), "artifacts/studio-luna/public/images/studio-luna-logo.png");
let logoBuffer: Buffer | null = null;
try {
  logoBuffer = fs.readFileSync(LOGO_PATH);
} catch {
  logoBuffer = null;
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
  if (isProefles) return "Proefles (€10) — betaling in de studio (contant of Tikkie)";
  if (isLosseLes) return "Losse les (€22,50) — betaling in de studio (contant of Tikkie)";
  return "1 les wordt afgeschreven van jouw rittenkaart";
}

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
  const {
    toEmail, toName, className, date, time, type, isProefles, isLosseLes,
  } = params;

  const settings = await getEmailSettings();
  const formattedDate = formatDate(date);
  const lesType = typeLabel(type);
  const betaling = paymentNote(isProefles, isLosseLes);

  const logoHtml = logoBuffer
    ? `<img src="cid:studio_luna_logo" alt="Studio Luna" style="height:80px;width:auto;display:block;margin:0 auto;" />`
    : `<p style="margin:0;font-size:26px;font-weight:700;color:#E6DDD2;font-family:'Georgia',serif;letter-spacing:2px;">Studio Luna</p>`;

  const persoonlijkBlok = settings.persoonlijkBericht?.trim()
    ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#3A4F41;font-style:italic;">${settings.persoonlijkBericht.replace(/\n/g, "<br/>")}</p>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F7F5;font-family:Arial,sans-serif;color:#3A4F41;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(58,79,65,0.10);">

        <!-- Header met logo -->
        <tr><td style="background:#3A4F41;padding:32px 40px 28px;text-align:center;">
          ${logoHtml}
          <p style="margin:12px 0 0;font-size:12px;color:#8FA89B;letter-spacing:3px;text-transform:uppercase;">Reservering bevestigd</p>
        </td></tr>

        <!-- Beige balk als accent -->
        <tr><td style="background:#E6DDD2;height:4px;"></td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#3A4F41;">Hoi ${toName},</p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#3A4F41;">
            ${settings.welkomstTekst}
          </p>

          <!-- Les details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F5;border-radius:12px;margin-bottom:20px;">
            <tr><td style="padding:22px 24px;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#8FA89B;">Jouw reservering</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:5px 0;font-size:14px;color:#8FA89B;width:24px;">&#128198;</td>
                  <td style="padding:5px 0;font-size:14px;color:#3A4F41;font-weight:600;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:14px;color:#8FA89B;width:24px;">&#128336;</td>
                  <td style="padding:5px 0;font-size:14px;color:#3A4F41;">${time} uur &mdash; ${className}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:14px;color:#8FA89B;width:24px;">&#127757;</td>
                  <td style="padding:5px 0;font-size:14px;color:#3A4F41;">${lesType}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:14px;color:#8FA89B;width:24px;">&#128205;</td>
                  <td style="padding:5px 0;font-size:14px;color:#3A4F41;">Nieuwerkerk aan den IJssel (regio Zuidplas)</td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Betaling -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#E6DDD2;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#C78D76;">Betaling</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#3A4F41;">${betaling}</p>
            </td></tr>
          </table>

          <!-- Annuleringsinfo -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #8FA89B;margin-bottom:8px;">
            <tr><td style="padding:4px 16px;">
              <p style="margin:0;font-size:13px;color:#666;line-height:1.7;">${settings.annuleringsNote}</p>
            </td></tr>
          </table>
          ${persoonlijkBlok}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#3A4F41;padding:24px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;color:#8FA89B;">Vragen? Stuur een berichtje via WhatsApp:</p>
          <p style="margin:0 0 10px;font-size:14px;color:#E6DDD2;font-weight:600;">+31 6 43735343</p>
          <p style="margin:0;font-size:12px;color:#8FA89B;">info@studiolunazuidplas.nl &nbsp;&middot;&nbsp; @studiolunazuidplas</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const attachments: { filename: string; content: Buffer; content_id: string }[] = [];
  if (logoBuffer) {
    attachments.push({
      filename: "studio-luna-logo.png",
      content: logoBuffer,
      content_id: "studio_luna_logo",
    });
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject: `Reservering bevestigd — ${className} op ${formattedDate}`,
      html,
      attachments,
    });
  } catch (err) {
    console.error("[email] Fout bij verzenden bevestigingsmail:", err);
  }
}
