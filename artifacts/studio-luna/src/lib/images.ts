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
  /*  Sinds 27 oktober de buitenfoto's uit haar shoot (map kleur, nummers 48,
   *  49, 50, 53, 57, 58, 59 en 62). De oude binnenfoto's staan nog in
   *  public/images voor als ze terug moeten. */
  hero: img("buiten-hero.webp"), // 58, gestrekte driehoek in het gras

  /** De twee foto's waar de herofoto langzaam naar overloopt: armen om
   *  zichzelf in het avondlicht (53) en handen naar de lucht (59). */
  hero2: img("buiten-hero-2.webp"),
  hero3: img("buiten-hero-3.webp"),

  /** Tweede brede band op de homepage: liggend in het gras (62). */
  gras: img("buiten-gras.webp"),

  /** Foto bovenaan de reekspagina: godinnenhouding op het vlonderpad (49). */
  yoga: img("reeks-buiten.webp"),

  /** Foto bij "Wanneer begin je?" op de reekspagina: arm naar de hemel (57). */
  staand: img("reeks-buiten-hemel.webp"),

  /** Foto naast de kop van de Zorgkaart, in de organische uitsnede: handen
   *  op de buik (50). */
  zorgkaart: img("zorgkaart-buiten.webp"),

  /** Foto naast de kop van de eventspagina: handen naar de lucht (59). */
  events: img("events-buiten.webp"),

  /** Portret bij "Hoi, ik ben Marjolein" op de homepage: zittend op het
   *  vlonderpad met de ogen dicht (48). */
  overMij: img("marjolein-buiten.webp"),

  /** Portret op de pagina Over mij: armen om zichzelf in het avondlicht (53). */
  overMijPagina: img("marjolein-over-mij-buiten.webp"),

  /** Foto bij de partnerles op de reekspagina: een zwangere en haar
   *  geboortepartner rug aan rug op de grond. */
  partnerles: img("partnerles.webp"),

  /** Logo bovenin de Aanbod-header */
  logo: img("studio-luna-logo.png"),
};
