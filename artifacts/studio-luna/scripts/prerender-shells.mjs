// Schrijft na de Vite-build per route een eigen index.html met de juiste
// titel, omschrijving, canonical en og-tags. Zo ziet elke crawler en elke
// deelvoorvertoning direct de goede metadata, ook zonder JavaScript.
// Vercel serveert statische bestanden voor de rewrites, dus /geboortereeks
// krijgt vanzelf dist/public/geboortereeks/index.html.
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "public");
const BASIS = "https://www.studiolunazuidplas.nl";

const ROUTES = [
  {
    pad: "",
    title: "Studio Luna | Zwangerschapsyoga Nieuwerkerk aan den IJssel | Mama Community Zuidplas",
    beschrijving: "Studio Luna biedt de Geboortereeks, negen lessen zwangerschapsyoga en geboortevoorbereiding in Nieuwerkerk aan den IJssel (Zuidplas), en de zorgkaart met alle geboortezorg in de regio.",
  },
  {
    pad: "geboortereeks",
    title: "De Geboortereeks: zwangerschapscursus in Nieuwerkerk aan den IJssel, start 29 september | Studio Luna",
    beschrijving: "Negen lessen zwangerschapsyoga en geboortevoorbereiding in Nieuwerkerk aan den IJssel (Zuidplas). Start dinsdag 29 september, maximaal 8 zwangeren, met bekkenfysiotherapeut, partnerles en postpartumles. Introductieprijs €175.",
  },
  {
    pad: "geboortezorg-zuidplas",
    title: "Geboortezorg in Zuidplas: verloskundigen, kraamzorg en meer | Studio Luna",
    beschrijving: "De Geboortezorgkaart Zuidplas: verloskundigen, kraamzorg, echo's, bekkenfysiotherapie, doula's, lactatiekundigen, cursussen en zwanger sporten in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht en Moerkapelle.",
  },
  {
    pad: "over-mij",
    title: "Over Marjolein, zwangerschapsyoga docente in Nieuwerkerk aan den IJssel | Studio Luna",
    beschrijving: "Maak kennis met Marjolein: moeder, gepromoveerd onderzoeker en yogadocente. Zij geeft de Geboortereeks van Studio Luna in Nieuwerkerk aan den IJssel, gemeente Zuidplas.",
  },
  {
    pad: "blog",
    title: "Blog over zwangerschap en moederschap in Zuidplas | Studio Luna",
    beschrijving: "Artikelen van Studio Luna over zwangerschap, geboortevoorbereiding en moederschap, voor zwangeren en moeders in Nieuwerkerk aan den IJssel en de rest van Zuidplas.",
  },
];

const ontsmet = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

const basisHtml = readFileSync(join(root, "index.html"), "utf8");

for (const route of ROUTES) {
  const url = route.pad ? `${BASIS}/${route.pad}` : `${BASIS}/`;
  let html = basisHtml;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${ontsmet(route.title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${ontsmet(route.beschrijving)}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${ontsmet(route.title)}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${ontsmet(route.beschrijving)}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  html = html.replace("</head>", `  <link rel="canonical" href="${url}" />\n  </head>`);

  const doel = route.pad ? join(root, route.pad, "index.html") : join(root, "index.html");
  mkdirSync(dirname(doel), { recursive: true });
  writeFileSync(doel, html);
  console.log("geschreven:", route.pad || "(home)");
}
