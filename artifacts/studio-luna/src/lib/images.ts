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
  /** Grote achtergrondafbeelding op de Studio Luna-pagina (liggend, min. 1400×900px) */
  hero: img("hero-yoga.png"),

  /** Foto bij de Zwangerschapsyoga sectie op de Aanbod-pagina (portret of liggend) */
  yoga: img("hero-yoga.png"),

  /** Foto bij de Mama Circle sectie (bijv. groepsfoto of sfeerbeeld) */
  circle: img("hero-yoga.png"),

  /** Logo bovenin de Aanbod-header */
  logo: img("studio-luna-logo.png"),
};
