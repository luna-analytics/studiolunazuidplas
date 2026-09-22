/**
 * STUDIO LUNA — Afbeeldingen configuratie
 * ─────────────────────────────────────────
 * Hier staan ALLE afbeeldingen van de website op één plek.
 * Wil je een foto aanpassen?
 *   1. Upload je nieuwe foto via het bestandspaneel naar:
 *      artifacts/studio-luna/public/images/
 *   2. Pas hieronder het pad aan (alleen de bestandsnaam)
 *   3. De website past zich automatisch aan
 *
 * Tip: gebruik .jpg, .png of .webp — webp is het snelst.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const img = (path: string) => `${BASE}/images/${path}`;

export const IMAGES = {
  /** Grote achtergrondafbeelding op de Studio Luna-pagina. Dit is een lokale
   *  kopie van de via /admin geüploade herofoto, zodat bezoekers meteen de
   *  echte foto zien in plaats van eerst de stockfoto. Na het uploaden van een
   *  nieuwe herofoto in /admin moet deze kopie ook ververst worden
   *  (public/images/foto-hero.webp), anders flitst kort de oude foto. */
  hero: img("foto-hero.webp"),

  /** Foto bovenaan de reekspagina. Via /admin in te stellen (foto_yoga);
   *  zonder die instelling wordt deze getoond. */
  yoga: img("reeks-yoga.webp"),

  /** Tweede foto op de homepage, onder het aanbod. Via /admin in te stellen
   *  (foto_circle); zonder die instelling wordt deze getoond. */
  circle: img("homepage-yoga.webp"),

  /** Foto naast de kop van de Zorgkaart (staande uitsnede): de handen van een
   *  zwangere en haar partner samen op de buik, uit de shoot van 4 september. */
  zorgkaart: img("zorgkaart-hero.webp"),

  /** Portret van Marjolein bij het blok "Hoi, ik ben Marjolein" op de
   *  landingspagina. Via /admin is een andere foto in te stellen
   *  (over_mij_foto); zonder die instelling wordt deze getoond. */
  overMij: img("marjolein-over-mij.webp"),

  /** Foto bij de partnerles op de reekspagina: een zwangere en haar
   *  geboortepartner rug aan rug op de grond. */
  partnerles: img("partnerles.webp"),

  /** Logo bovenin de Aanbod-header */
  logo: img("studio-luna-logo.png"),
};
