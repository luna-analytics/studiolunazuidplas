// Schrijft na de Vite-build per route een eigen index.html met de juiste
// titel, omschrijving, canonical en og-tags, EN met de belangrijkste zichtbare
// inhoud alvast in de pagina. Crawlers zonder JavaScript (de meeste
// AI-zoekmachines) zien zo per pagina echte tekst in plaats van een lege huls;
// zodra React laadt wordt de inhoud gewoon vervangen door de echte pagina.
// Vercel serveert statische bestanden voor de rewrites, dus /geboortereeks
// krijgt vanzelf dist/public/geboortereeks/index.html.
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const hier = dirname(fileURLToPath(import.meta.url));
const root = join(hier, "..", "dist", "public");
const src = join(hier, "..", "src");
const BASIS = "https://www.studiolunazuidplas.nl";

const ontsmet = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const tekstVeilig = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const kort = (s, max = 158) => (s.length <= max ? s : s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…");

// ── Bronnen uitlezen ────────────────────────────────────────────────────────
const zorgkaartBron = readFileSync(join(src, "data", "zorgkaart.ts"), "utf8");
const reeksBron = readFileSync(join(src, "pages", "geboortereeks.tsx"), "utf8");
const homeBron = readFileSync(join(src, "pages", "studio-luna.tsx"), "utf8");

// Categorieën met intro en hun aanbieders
const categorieen = [];
{
  const catRegex = /id: "([a-z0-9-]+)",\s*\n\s*titel: "([^"]+)",\s*\n\s*intro: "([^"]+)"/g;
  const treffers = [...zorgkaartBron.matchAll(catRegex)];
  treffers.forEach((m, i) => {
    const van = m.index;
    const tot = i + 1 < treffers.length ? treffers[i + 1].index : zorgkaartBron.length;
    const blok = zorgkaartBron.slice(van, tot);
    const aanbieders = [...blok.matchAll(/naam: "([^"]+)",\s*\n\s*plaats: "([^"]+)",\s*\n\s*website: "([^"]+)",\s*\n\s*beschrijving: "([^"]+)"/g)]
      .map(([, naam, plaats, website, beschrijving]) => ({ naam, plaats, website, beschrijving }));
    categorieen.push({ id: m[1], titel: m[2], intro: m[3], aanbieders });
  });
}
// Uniek geteld: een aanbieder die in twee categorieën staat (zoals Spirit for
// Two bij sporten én massage) telt maar één keer mee in het totaal.
const totaalAanbieders = new Set(categorieen.flatMap((c) => c.aanbieders.map((a) => a.naam))).size;

const leesFaq = (bron) =>
  [...bron.matchAll(/vraag: "([^"]+)",\s*\n\s*antwoord: "([^"]+)"/g)].map(([, vraag, antwoord]) => ({ vraag, antwoord }));
const reeksFaq = leesFaq(reeksBron);
const homeFaq = leesFaq(homeBron);

const inbegrepen = (() => {
  const m = reeksBron.match(/const INBEGREPEN = \[([\s\S]*?)\];/);
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"/g)].map(([, t]) => t);
})();

const faqJsonLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({
    "@type": "Question",
    name: f.vraag,
    acceptedAnswer: { "@type": "Answer", text: f.antwoord },
  })),
});

const faqHtml = (items) =>
  `<h2>Veelgestelde vragen</h2>` +
  items.map((f) => `<h3>${tekstVeilig(f.vraag)}</h3><p>${tekstVeilig(f.antwoord)}</p>`).join("");

// ── Routes ──────────────────────────────────────────────────────────────────
const ROUTES = [
  {
    pad: "",
    title: "Studio Luna | Zwangerschapsyoga Nieuwerkerk aan den IJssel",
    beschrijving: "Studio Luna biedt de Geboortereeks, acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding in Nieuwerkerk aan den IJssel (Zuidplas), en de zorgkaart met alle geboortezorg in de regio.",
    jsonLd: [faqJsonLd(homeFaq)],
    // De herofoto vast laten voorladen zodat hij er staat zodra de app rendert.
    preload: "/images/foto-hero.webp",
    inhoud:
      `<h1>Zwangerschapsyoga en geboortevoorbereiding in Zuidplas</h1>` +
      `<p>Studio Luna biedt de Geboortereeks, acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding in Nieuwerkerk aan den IJssel, en houdt de Geboortezorgkaart Zuidplas bij met alle geboortezorg in de regio.</p>` +
      `<p><a href="/geboortereeks">De Geboortereeks, start dinsdag 29 september</a> · <a href="/geboortezorg-zuidplas">De Geboortezorgkaart Zuidplas</a></p>` +
      faqHtml(homeFaq),
  },
  {
    pad: "geboortereeks",
    title: "De Geboortereeks: zwangerschapscursus Nieuwerkerk aan den IJssel",
    beschrijving: "Acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding in Nieuwerkerk aan den IJssel (Zuidplas), plus mama-en-babyyoga na afloop. Start dinsdag 29 september, maximaal 8 zwangeren, introductieprijs €175.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Studio Luna Geboortereeks",
        description: "Acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding plus mama-en-babyyoga na afloop, met een les samen met een bekkenfysiotherapeut, een partnerles en een mamaspa-avond.",
        provider: { "@type": "LocalBusiness", name: "Studio Luna", url: `${BASIS}/` },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "onsite",
          startDate: "2026-09-29",
          location: { "@type": "Place", name: "Nieuwerkerk aan den IJssel", address: { "@type": "PostalAddress", addressLocality: "Nieuwerkerk aan den IJssel", addressRegion: "Zuidplas", addressCountry: "NL" } },
        },
        offers: [{ "@type": "Offer", name: "Geboortereeks, introductieprijs eerste groep", price: "175.00", priceCurrency: "EUR" }],
      },
      faqJsonLd(reeksFaq),
    ],
    inhoud:
      `<h1>De Geboortereeks</h1>` +
      `<p>8-weekse zwangerschapsyoga- en geboortevoorbereidingsreeks in Nieuwerkerk aan den IJssel. Start dinsdag 29 september, elke dinsdag van 19:00 tot 20:15 uur, maximaal acht zwangeren. €175 introductieprijs voor deze eerste groep, daarna €195.</p>` +
      `<h2>Wat zit erin</h2><ul>` + inbegrepen.map((t) => `<li>${tekstVeilig(t)}</li>`).join("") + `</ul>` +
      faqHtml(reeksFaq),
  },
  {
    pad: "geboortezorg-zuidplas",
    title: "Geboortezorg in Zuidplas: verloskundigen, kraamzorg en meer | Studio Luna",
    beschrijving: "De Geboortezorgkaart Zuidplas: verloskundigen, kraamzorg, echo's, bekkenfysiotherapie, doula's, lactatiekundigen, cursussen en zwanger sporten in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht en Moerkapelle.",
    inhoud:
      `<h1>Geboortezorg in Zuidplas</h1>` +
      `<p>Zwanger of net bevallen in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht of Moerkapelle? Op deze pagina staat alle zorg en ondersteuning uit de regio op één plek: ${totaalAanbieders} aanbieders in ${categorieen.length} categorieën. Studio Luna houdt deze kaart bij.</p>` +
      `<ul>` + categorieen.map((c) => `<li><a href="/geboortezorg-zuidplas/${c.id}">${tekstVeilig(c.titel)}</a> (${c.aanbieders.length} ${c.aanbieders.length === 1 ? "aanbieder" : "aanbieders"})</li>`).join("") + `</ul>`,
  },
  {
    pad: "over-mij",
    title: "Over Marjolein, zwangerschapsyoga docente in Nieuwerkerk aan den IJssel",
    beschrijving: "Maak kennis met Marjolein: moeder, gepromoveerd onderzoeker en yogadocente. Zij geeft de Geboortereeks van Studio Luna in Nieuwerkerk aan den IJssel, gemeente Zuidplas.",
    inhoud: `<h1>Over Marjolein</h1><p>Moeder, gepromoveerd onderzoeker en yogadocente. Zij geeft de Geboortereeks van Studio Luna in Nieuwerkerk aan den IJssel, gemeente Zuidplas.</p>`,
  },
  {
    pad: "blog",
    title: "Blog over zwangerschap en moederschap in Zuidplas | Studio Luna",
    beschrijving: "Artikelen van Studio Luna over zwangerschap, geboortevoorbereiding en moederschap, voor zwangeren en moeders in Nieuwerkerk aan den IJssel en de rest van Zuidplas.",
    inhoud: `<h1>Blog van Studio Luna</h1><p>Artikelen over zwangerschap, geboortevoorbereiding en moederschap in Zuidplas.</p>`,
  },
];

// Categoriepagina's van de zorgkaart: eigen schil met intro en de volledige
// aanbiederslijst als zichtbare tekst.
for (const cat of categorieen) {
  ROUTES.push({
    pad: `geboortezorg-zuidplas/${cat.id}`,
    title: `${cat.titel} in Zuidplas | Geboortezorgkaart Studio Luna`,
    beschrijving: kort(`${cat.intro} Onderdeel van de Geboortezorgkaart Zuidplas van Studio Luna.`),
    inhoud:
      `<h1>${tekstVeilig(cat.titel)} in de regio Zuidplas</h1>` +
      `<p>${tekstVeilig(cat.intro)}</p>` +
      cat.aanbieders.map((a) =>
        `<h2>${tekstVeilig(a.naam)}</h2><p>${tekstVeilig(a.plaats)}. ${tekstVeilig(a.beschrijving)} <a href="${ontsmet(a.website)}" rel="nofollow">Website</a></p>`
      ).join("") +
      `<p>Deze kaart is een initiatief van <a href="/">Studio Luna</a> in Nieuwerkerk aan den IJssel, waar op 29 september <a href="/geboortereeks">de Geboortereeks</a> start.</p>`,
  });
}

// De vier blogartikelen: eigen schil zodat elk artikel een eigen titel en
// canonical heeft in plaats van die van de homepage. De lijst is klein en
// verandert zelden; nieuw artikel erbij betekent hier een regel toevoegen.
const BLOGS = [
  { slug: "in-gesprek-met-tamara-tunderman", titel: "In gesprek met: Tamara Tunderman" },
  { slug: "alles-over-dysforisch-toeschietreflex-d-tsr-je-bent-niet-alleen", titel: "Alles over Dysforisch Toeschietreflex (D-TSR): Je bent niet alleen!" },
  { slug: "adem-als-kompas-deel-1", titel: "Adem als Kompas: De complete gids voor rust, ruimte en verbinding tijdens je zwangerschap DEEL 1" },
  { slug: "gevoel-en-wetenschap-waarom-ik-deze-blog-begin", titel: "Gevoel & Wetenschap: Waarom ik deze blog begin" },
];
for (const b of BLOGS) {
  ROUTES.push({
    pad: `blog/${b.slug}`,
    title: kort(`${b.titel} | Blog Studio Luna`, 65),
    beschrijving: kort(`${b.titel}. Een artikel uit het blog van Studio Luna over zwangerschap en moederschap in Zuidplas.`),
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Article",
      headline: b.titel,
      author: { "@type": "Person", name: "Marjolein" },
      publisher: { "@type": "Organization", name: "Studio Luna", url: `${BASIS}/` },
      mainEntityOfPage: `${BASIS}/blog/${b.slug}`,
    }],
    inhoud: `<h1>${tekstVeilig(b.titel)}</h1><p>Een artikel uit <a href="/blog">het blog van Studio Luna</a>.</p>`,
  });
}

// ── Schillen schrijven ──────────────────────────────────────────────────────
let basisHtml = readFileSync(join(root, "index.html"), "utf8");

// De site-brede FAQ hoort niet op elke route; hij wordt hierboven per route
// opnieuw opgebouwd uit de zichtbare vragen van die pagina.
basisHtml = basisHtml.replace(/\s*<!-- JSON-LD FAQPage -->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, "");

for (const route of ROUTES) {
  const url = route.pad ? `${BASIS}/${route.pad}` : `${BASIS}/`;
  let html = basisHtml;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${ontsmet(route.title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${ontsmet(route.beschrijving)}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${ontsmet(route.title)}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${ontsmet(route.beschrijving)}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  const extraJsonLd = (route.jsonLd ?? [])
    .map((data) => `  <script type="application/ld+json" data-shell-jsonld>${JSON.stringify(data)}</script>\n`)
    .join("");
  const preload = route.preload
    ? `  <link rel="preload" as="image" href="${route.preload}" fetchpriority="high" />\n`
    : "";
  html = html.replace("</head>", `  <link rel="canonical" href="${url}" />\n${preload}${extraJsonLd}  </head>`);
  if (route.inhoud) {
    // display:none zodat bezoekers bij het laden geen flits van kale tekst
    // zien; crawlers lezen de HTML-bron en zien de inhoud gewoon. Zodra React
    // start vervangt die de hele inhoud van #root door de echte pagina.
    html = html.replace('<div id="root"></div>', `<div id="root"><div style="display:none">${route.inhoud}</div></div>`);
  }

  const doel = route.pad ? join(root, route.pad, "index.html") : join(root, "index.html");
  mkdirSync(dirname(doel), { recursive: true });
  writeFileSync(doel, html);
  console.log("geschreven:", route.pad || "(home)");
}
