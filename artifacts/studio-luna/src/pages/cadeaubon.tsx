import { useState } from "react";
import { Link } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { usePageMeta } from "@/lib/seo";
import { IMAGES } from "@/lib/images";
import { MASSAGE, MASSAGE_PAKKETTEN, CADEAUBON } from "../../../api-server/src/lib/massage";

// Cadeaubon voor een massage (haar ja van 27 november 2026). Werkwijze: de
// koper vraagt de bon hier aan, Marjolein stuurt een factuur en na betaling de
// bon per mail. Bonnen zijn er voor 1, 3 of 5 massages, altijd tegen de gewone
// prijs (geen introductieprijs), 12 maanden geldig. Alle bedragen komen uit
// massage.ts. De zinnen op deze pagina zijn feitelijk gehouden; een warmere
// inleiding levert zij zelf aan.

const invoer =
  "px-4 py-3 rounded-[6px] border border-border/40 bg-card text-[15px] text-foreground placeholder:text-foreground/55";

const extraBij = (code: string) => MASSAGE_PAKKETTEN.find((p) => p.code === code)?.extra;

export default function Cadeaubon() {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [bon, setBon] = useState("los");
  const [voorWie, setVoorWie] = useState("");
  const [bericht, setBericht] = useState("");
  const [status, setStatus] = useState<"idle" | "bezig" | "klaar" | "fout">("idle");
  const [foutmelding, setFoutmelding] = useState("");

  const vraagAan = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("bezig");
    setFoutmelding("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/cadeaubon-aanvraag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam, email, telefoon, bon, voorWie, bericht }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFoutmelding(data.error ?? "Er ging iets mis, probeer het nog eens");
        setStatus("fout");
      } else {
        setStatus("klaar");
      }
    } catch {
      setFoutmelding("Kan geen verbinding maken, probeer het nog eens");
      setStatus("fout");
    }
  };

  usePageMeta({
    title: "Cadeaubon voor een zwangerschaps- of postpartummassage | Studio Luna",
    description: `Geef een ${MASSAGE.naam}-massage cadeau: een cadeaubon voor ${CADEAUBON.opties.map((o) => `${o.tekst} (€${o.prijs})`).join(", ")}, ${CADEAUBON.geldig} geldig. Bij ${MASSAGE.praktijk.naam} in Nieuwerkerk aan den IJssel.`,
  });

  const hoeHetWerkt =
    "Je vraagt de cadeaubon hieronder aan en krijgt daarna een factuur per mail. Na betaling krijg je de " +
    "cadeaubon per mail, om door te sturen of te printen. " +
    `De bon is ${CADEAUBON.geldig} geldig, en wie hem krijgt maakt zelf een afspraak via de massagepagina.`;

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative overflow-x-hidden">

        {/* ── TITEL, met de foto ernaast ── */}
        <div className="px-7 md:px-14 lg:px-20 xl:px-28 pt-14 md:pt-12 pb-4 md:flex md:items-start md:gap-14">
          <div className="md:flex-1">
            <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
              Cadeaubon
            </h1>
            <p className="text-foreground/60 text-[15px] mt-3">
              Geef een {MASSAGE.naam}-massage cadeau
            </p>
            <p className="text-[15px] text-foreground/80 leading-[1.7] mt-4 max-w-xl">
              Een cadeaubon voor een full body ontspanningsmassage van {MASSAGE.duur}, tijdens de zwangerschap
              of na de bevalling, bij {MASSAGE.praktijk.naam} in Nieuwerkerk aan den IJssel.
            </p>
            <p className="text-sm text-foreground/65 mt-3">
              <Link href="/zwangerschapsmassage" className="text-primary border-b border-primary/30 pb-0.5 hover:border-primary">
                Over de zwangerschapsmassage
              </Link>
              {" · "}
              <Link href="/postpartummassage" className="text-primary border-b border-primary/30 pb-0.5 hover:border-primary">
                Over de postpartummassage
              </Link>
            </p>
            <a
              href="#aanvragen"
              className="inline-flex items-center mt-6 bg-primary text-primary-foreground px-7 py-3.5 rounded-[6px] font-semibold text-sm hover:bg-primary/88"
            >
              Vraag een cadeaubon aan
            </a>
          </div>
          <img
            src={IMAGES.massageLavendel}
            alt="Een takje lavendel tussen de vingers"
            className="block w-full max-w-[320px] aspect-[2/3] object-cover mt-8 md:mt-0 shrink-0"
          />
        </div>

        {/* ── DE BONNEN EN HOE HET WERKT ── */}
        <section className="px-7 md:px-14 lg:px-20 xl:px-28 py-8 md:py-10">
          <div className="md:grid md:grid-cols-[1.2fr_1fr] md:gap-16 md:items-start">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-2">
                De cadeaubonnen
              </h2>
              {CADEAUBON.opties.map((o) => (
                <div key={o.code} className="py-4 border-b border-border/20">
                  <div className="flex items-baseline justify-between gap-6">
                    <h3 className="text-[17px] font-semibold text-foreground/85">{o.naam ? `${o.naam}: ${o.tekst}` : o.tekst}</h3>
                    <p className="text-[17px] font-semibold text-foreground/85 shrink-0">€{o.prijs}</p>
                  </div>
                  {extraBij(o.code) && (
                    <p className="text-[15px] text-foreground/75 leading-[1.7] mt-1">Inclusief {extraBij(o.code)}.</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-10 md:mt-0">
              <h2 className="font-display text-2xl font-medium text-foreground mb-3">Zo werkt het</h2>
              <p className="text-[15px] text-foreground/80 leading-[1.7]">{hoeHetWerkt}</p>
            </div>
          </div>
        </section>

        {/* ── AANVRAGEN ── */}
        <section id="aanvragen" className="px-7 md:px-14 lg:px-20 xl:px-28 py-8 md:py-10 scroll-mt-24">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-[1.15] mb-5">
              Een cadeaubon aanvragen
            </h2>

            {status === "klaar" ? (
              <p className="text-[15px] text-foreground/80 leading-[1.7] rounded-[6px] bg-primary/8 border border-primary/15 px-5 py-4">
                Dankjewel voor je aanvraag! Er staat een bevestiging in je mail. Je krijgt de factuur per mail,
                en na betaling de cadeaubon.
              </p>
            ) : (
              <form onSubmit={vraagAan} className="space-y-6">
                <fieldset>
                  <legend className="text-sm font-semibold text-foreground/80 mb-2">Welke cadeaubon?</legend>
                  <div className="space-y-1.5 text-[15px] text-foreground/80">
                    {CADEAUBON.opties.map((o) => (
                      <label key={o.code} className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio" name="bon" value={o.code}
                          checked={bon === o.code} onChange={() => setBon(o.code)}
                          className="mt-1.5 w-4 h-4 accent-[hsl(var(--primary))]"
                        />
                        <span>
                          {o.naam ? `${o.naam}: ${o.tekst}` : o.tekst} (€{o.prijs})
                          {extraBij(o.code) && (
                            <span className="block text-sm text-foreground/60">inclusief {extraBij(o.code)}</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text" value={naam} onChange={(e) => setNaam(e.target.value)}
                    placeholder="Je naam" aria-label="Je naam" required maxLength={120}
                    className={`flex-1 ${invoer}`}
                  />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="jouw@email.nl" aria-label="Je e-mailadres" required
                    className={`flex-1 ${invoer}`}
                  />
                </div>
                <input
                  type="tel" value={telefoon} onChange={(e) => setTelefoon(e.target.value)}
                  placeholder="Je telefoonnummer (niet verplicht)" aria-label="Je telefoonnummer"
                  maxLength={40}
                  className={`w-full ${invoer}`}
                />
                <input
                  type="text" value={voorWie} onChange={(e) => setVoorWie(e.target.value)}
                  placeholder="Voor wie is de cadeaubon? (niet verplicht)" aria-label="Voor wie is de cadeaubon?"
                  maxLength={120}
                  className={`w-full ${invoer}`}
                />
                <textarea
                  value={bericht} onChange={(e) => setBericht(e.target.value)}
                  placeholder="Een persoonlijke boodschap voor op de bon, of een vraag (niet verplicht)" aria-label="Bericht"
                  maxLength={1000} rows={3}
                  className={`w-full ${invoer}`}
                />

                <button
                  type="submit"
                  disabled={status === "bezig"}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-[6px] font-semibold text-sm hover:bg-primary/88 disabled:opacity-60"
                >
                  {status === "bezig" ? "Versturen…" : "Vraag de cadeaubon aan"}
                </button>
                {status === "fout" && <p className="text-xs text-red-600">{foutmelding}</p>}
              </form>
            )}
          </div>
        </section>

        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
