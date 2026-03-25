import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { getEmailSettings } from "./email-settings.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Studio Luna <info@studiolunazuidplas.nl>";

const LOGO_PATH = path.join(
  process.cwd(),
  "artifacts/studio-luna/public/images/studio-luna-logo.png",
);
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
  if (isProefles)
    return "Proefles (€10) — betaling in de studio (contant of Tikkie)";
  if (isLosseLes)
    return "Losse les (€22,50) — betaling in de studio (contant of Tikkie)";
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
    toEmail,
    toName,
    className,
    date,
    time,
    type,
    isProefles,
    isLosseLes,
  } = params;

  const settings = await getEmailSettings();
  const formattedDate = formatDate(date);
  const lesType = typeLabel(type);
  const betaling = paymentNote(isProefles, isLosseLes);

  // Gebruik Playfair Display voor de "Studio Luna" tekst als logo mist
  const logoHtml = logoBuffer
    ? `<img src="cid:studio_luna_logo" alt="Studio Luna" style="height:90px;width:auto;display:block;margin:0 auto;" />`
    : `<h1 style="margin:0;font-family:'Playfair Display', Georgia, serif; font-size:32px; color:#3A4F41; font-weight:normal;">Studio Luna</h1>`;

  const persoonlijkBlok = settings.persoonlijkBericht?.trim()
    ? `<p style="margin:20px 0 0; font-size:15px; line-height:1.7; color:#3A4F41; font-style:italic; border-top: 1px solid #E6DDD2; padding-top: 20px;">${settings.persoonlijkBericht.replace(/\n/g, "<br/>")}</p>`
    : "";

  const html = `
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:550px; background-color:#ffffff; border-radius:2px; overflow:hidden; box-shadow:0 4px 20px rgba(58,79,65,0.05);">

          <tr>
            <td style="padding:45px 40px 35px; text-align:center; border-bottom: 1px solid #F8F7F5;">
              ${logoHtml}
              <div style="margin-top:15px; height:1px; width:40px; background-color:#C78D76; margin-left:auto; margin-right:auto;"></div>
              <p style="margin:15px 0 0; font-size:12px; color:#C78D76; letter-spacing:4px; text-transform:uppercase; font-weight:700;">Bevestiging</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 50px;">
              <h2 style="margin:0 0 20px; font-family:'Playfair Display', serif; font-size:24px; color:#3A4F41; font-weight:normal;">Lieve ${toName},</h2>
              <p style="margin:0 0 30px; font-size:16px; line-height:1.8; color:#3A4F41; font-weight:300;">
                ${settings.welkomstTekst}
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F7F5; border-radius:4px; margin-bottom:30px;">
                <tr>
                  <td style="padding:30px;">
                    <p style="margin:0 0 15px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#8FA89B;">Jouw moment</p>

                    <div style="margin-bottom:12px; font-size:16px;">
                      <span style="color:#C78D76; margin-right:10px;">•</span> <strong>${formattedDate}</strong>
                    </div>
                    <div style="margin-bottom:12px; font-size:16px;">
                      <span style="color:#C78D76; margin-right:10px;">•</span> ${time} uur &mdash; ${className}
                    </div>
                    <div style="margin-bottom:12px; font-size:15px; color:#8FA89B;">
                      <span style="color:#C78D76; margin-right:10px;">•</span> ${lesType}
                    </div>
                  </td>
                </tr>
              </table>

              <div style="background-color:#E6DDD2; padding:20px 25px; border-radius:2px; margin-bottom:30px;">
                 <p style="margin:0; font-size:14px; line-height:1.6; color:#3A4F41;">
                   <strong style="color:#C78D76; text-transform:uppercase; font-size:11px; letter-spacing:1px; display:block; margin-bottom:5px;">Betaling</strong>
                   ${betaling}
                 </p>
              </div>

              <p style="margin:0; font-size:13px; color:#8FA89B; line-height:1.6; font-style: italic;">
                ${settings.annuleringsNote}
              </p>

              ${persoonlijkBlok}
            </td>
          </tr>

          <tr>
            <td style="background-color:#3A4F41; padding:40px; text-align:center;">
              <p style="margin:0 0 10px; font-size:13px; color:#8FA89B;">Heb je een vraag? Ik ben bereikbaar via WhatsApp:</p>
              <p style="margin:0 0 20px; font-size:16px; color:#F8F7F5; font-weight:400; letter-spacing:1px;">+31 6 43735343</p>

              <div style="height:1px; width:100%; background-color:#4A5F51; margin-bottom:20px;"></div>

              <p style="margin:0; font-size:11px; color:#8FA89B; letter-spacing:1px;">
                @studiolunazuidplas &nbsp; | &nbsp; info@studiolunazuidplas.nl
              </p>
            </td>
          </tr>

        </table>

        <p style="margin-top:30px; font-size:11px; color:#8FA89B; text-align:center; text-transform:uppercase; letter-spacing:2px;">
          It takes a village
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const attachments: {
    filename: string;
    content: Buffer;
    content_id: string;
  }[] = [];
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
      subject: `Bevestiging: ${className} op ${formattedDate}`,
      html,
      attachments,
    });
  } catch (err) {
    console.error("[email] Fout bij verzenden bevestigingsmail:", err);
  }
}
