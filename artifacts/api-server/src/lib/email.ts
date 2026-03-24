import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Studio Luna <onboarding@resend.dev>";

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
    toEmail, toName, className, date, time, type, isProefles, isLosseLes, creditsLeft,
  } = params;

  const formattedDate = formatDate(date);
  const lesType = typeLabel(type);
  const betaling = paymentNote(isProefles, isLosseLes);
  const creditInfo = !isProefles && !isLosseLes
    ? `<p style="margin:0 0 8px;">Resterend tegoed: <strong>${creditsLeft} ${creditsLeft === 1 ? "les" : "lessen"}</strong></p>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F7F5;font-family:'DM Sans',Arial,sans-serif;color:#3A4F41;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(58,79,65,0.08);">
        
        <!-- Header -->
        <tr><td style="background:#3A4F41;padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#E6DDD2;letter-spacing:1px;">Studio Luna</p>
          <p style="margin:6px 0 0;font-size:13px;color:#8FA89B;letter-spacing:2px;text-transform:uppercase;">Bevestiging</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:16px;">Hoi <strong>${toName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
            Je reservering is bevestigd! We kijken ernaar uit je te zien op de mat. 🌙
          </p>

          <!-- Booking details card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F5;border-radius:12px;padding:24px;margin-bottom:24px;">
            <tr><td>
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#8FA89B;">Jouw reservering</p>
              <p style="margin:0 0 8px;font-size:15px;"><strong>${className}</strong> — ${lesType}</p>
              <p style="margin:0 0 8px;font-size:15px;">📅 ${formattedDate}</p>
              <p style="margin:0 0 8px;font-size:15px;">🕐 ${time} uur</p>
              <p style="margin:0 0 8px;font-size:15px;">📍 Nieuwerkerk aan den IJssel (regio Zuidplas)</p>
            </td></tr>
          </table>

          <!-- Payment info -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#E6DDD2;border-radius:12px;padding:20px;margin-bottom:24px;">
            <tr><td>
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#C78D76;">Betaling</p>
              <p style="margin:0;font-size:14px;line-height:1.6;">${betaling}</p>
              ${creditInfo}
            </td></tr>
          </table>

          <p style="margin:0 0 8px;font-size:14px;color:#666;line-height:1.6;">
            Kun je toch niet komen? Annuleer dan <strong>minimaal 7 uur</strong> voor de les via de app zodat anderen je plek kunnen innemen.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F8F7F5;padding:24px 40px;text-align:center;border-top:1px solid #E6DDD2;">
          <p style="margin:0 0 6px;font-size:13px;color:#8FA89B;">Vragen? Stuur een berichtje via WhatsApp:</p>
          <p style="margin:0 0 6px;font-size:13px;color:#3A4F41;font-weight:600;">+31 6 43735343</p>
          <p style="margin:0;font-size:12px;color:#aaa;">info@studiolunazuidplas.nl · @studiolunazuidplas</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject: `Reservering bevestigd — ${className} op ${formattedDate}`,
      html,
    });
  } catch (err) {
    console.error("[email] Fout bij verzenden bevestigingsmail:", err);
  }
}
