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

// ── Live teksten ophalen ────────────────────────────────────────────────────
// De biografie en de blogartikelen staan in de database. Bij het bouwen halen
// we ze van de live site, zodat ook crawlers zonder JavaScript (de meeste
// AI-zoekmachines) de volledige tekst zien. Lukt dat niet (geen netwerk, site
// plat), dan valt de build terug op korte vaste teksten en meldt dat.
async function haalLive(pad) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(`${BASIS}${pad}`, { signal: ctrl.signal, headers: { accept: "application/json" } });
    if (!r.ok) throw new Error(`status ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn(`Let op: ${pad} niet opgehaald (${e.message}); de schil krijgt de korte vaste tekst.`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
const liveBlog = await haalLive("/api/blog");
const liveTeksten = await haalLive("/api/pagina-teksten");
const schoonHtml = (h) => String(h).replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, "");
const alineas = (t) => String(t).split(/\n\s*\n/).map((a) => a.trim()).filter(Boolean)
  .map((a) => `<p>${tekstVeilig(a).replace(/\n/g, "<br>")}</p>`).join("");
const samenvatting = (html, max = 200) => kort(String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), max);

// De blogartikelen uit de live API; zonder netwerk de vaste lijst zonder tekst.
const BLOGS_VAST = [
  { slug: "in-gesprek-met-tamara-tunderman", titel: "In gesprek met: Tamara Tunderman" },
  { slug: "alles-over-dysforisch-toeschietreflex-d-tsr-je-bent-niet-alleen", titel: "Alles over Dysforisch Toeschietreflex (D-TSR): Je bent niet alleen!" },
  { slug: "adem-als-kompas-deel-1", titel: "Adem als Kompas: De complete gids voor rust, ruimte en verbinding tijdens je zwangerschap DEEL 1" },
  { slug: "gevoel-en-wetenschap-waarom-ik-deze-blog-begin", titel: "Gevoel & Wetenschap: Waarom ik deze blog begin" },
];
const blogs = Array.isArray(liveBlog) && liveBlog.length
  ? liveBlog
      .filter((b) => b.published !== false && b.slug && b.title)
      .sort((a, b) => String(b.publishedAt || b.createdAt || "").localeCompare(String(a.publishedAt || a.createdAt || "")))
      .map((b) => ({ slug: b.slug, titel: b.title, body: b.body || "", categorie: b.category || "", datum: String(b.publishedAt || b.createdAt || "").slice(0, 10) }))
  : BLOGS_VAST.map((b) => ({ ...b, body: "", categorie: "", datum: "" }));

// De massageteksten komen uit dezelfde bron als de pagina zelf.
const massageTeksten = JSON.parse(readFileSync(join(src, "data", "massage-teksten.json"), "utf8"));
const massageBron = readFileSync(join(src, "..", "..", "api-server", "src", "lib", "massage.ts"), "utf8");
const massageVeld = (naam) => (massageBron.match(new RegExp(`${naam}: "([^"]+)"`)) || [])[1] || "";
const massageGetal = (naam) => (massageBron.match(new RegExp(`${naam}: (\\d+)`)) || [])[1] || "";
const MASSAGE = {
  naam: massageVeld("naam"), duur: massageVeld("duur"), prijs: massageGetal("prijs"), intro: massageGetal("introductieprijs"),
  praktijk: (massageBron.match(/praktijk: \{\s*naam: "([^"]+)",\s*adres: "([^"]+)"/) || []).slice(1),
  wanneerZwanger: massageVeld("wanneerZwanger"), wanneerPostpartum: massageVeld("wanneerPostpartum"),
};
// Pakketten en introductieprijs (27 november 2026). De introductieprijs geldt
// voor de eerste massage en komt alleen in de schil zolang hij loopt; na de
// einddatum laat de datumbewaking de build stoppen tot massage.ts is opgeruimd.
MASSAGE.pakketten = [...massageBron.matchAll(/aantal: (\d+), prijs: (\d+), geldig: "([^"]+)", extra: "([^"]+)", naam: "([^"]+)"/g)]
  .map(([, aantal, prijs, geldig, extra, naam]) => ({ aantal, prijs, geldig, extra, naam }));
MASSAGE.introTot = massageVeld("introductieTot");
MASSAGE.introTotTekst = massageVeld("introductieTotTekst");
MASSAGE.mengen = (massageBron.match(/PAKKET_MENGEN = "([^"]+)"/) || [])[1] || "";
// Pakketvoorwaarden (als FAQ) en cadeaubon, ook uit massage.ts (27 november 2026).
MASSAGE.voorwaarden = [...massageBron.matchAll(/vraag: "([^"]+)",\s*antwoord: "([^"]+)"/g)]
  .map(([, vraag, antwoord]) => ({ vraag, antwoord }));
MASSAGE.cadeaubonGeldig = (massageBron.match(/CADEAUBON = \{\s*geldig: "([^"]+)"/) || [])[1] || "";
const cadeaubonOpties = [`1 massage (€${MASSAGE.prijs})`, ...MASSAGE.pakketten.map((p) => `het pakket ${p.naam} met ${p.aantal} massages (€${p.prijs})`)].join(", ");
const massageIntroLoopt = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" }) <= MASSAGE.introTot;
if (MASSAGE.pakketten.length !== 2 || !MASSAGE.introTot || !MASSAGE.mengen || MASSAGE.voorwaarden.length !== 2 || !MASSAGE.cadeaubonGeldig) {
  console.error("De massagepakketten of de introductiedatum zijn niet uit api-server/src/lib/massage.ts te lezen; klopt de opmaak nog?");
  process.exit(1);
}
if (!MASSAGE.naam || !MASSAGE.prijs || !MASSAGE.praktijk.length) {
  console.error("De massagegegevens zijn niet uit api-server/src/lib/massage.ts te lezen; klopt de opmaak nog?");
  process.exit(1);
}

// ── Bronnen uitlezen ────────────────────────────────────────────────────────
const zorgkaartBron = readFileSync(join(src, "data", "zorgkaart.ts"), "utf8");
const reeksBron = readFileSync(join(src, "pages", "geboortereeks.tsx"), "utf8");
const homeBron = readFileSync(join(src, "pages", "studio-luna.tsx"), "utf8");
const zorgkaartPaginaBron = readFileSync(join(src, "pages", "geboortezorg.tsx"), "utf8");

// Categorieën met intro en hun aanbieders
const categorieen = [];
{
  const catRegex = /id: "([a-z0-9-]+)",\s*\n\s*titel: "([^"]+)",\s*\n\s*intro: "([^"]+)"/g;
  const treffers = [...zorgkaartBron.matchAll(catRegex)];
  treffers.forEach((m, i) => {
    const van = m.index;
    const tot = i + 1 < treffers.length ? treffers[i + 1].index : zorgkaartBron.length;
    const blok = zorgkaartBron.slice(van, tot);
    const aanbieders = [...blok.matchAll(/naam: "([^"]+)",\s*\n\s*plaats: "([^"]+)",\s*\n\s*website: "([^"]+)",\s*\n\s*beschrijving: "([^"]+)",(?:\s*\n\s*werkgebied: \[([^\]]*)\],)?/g)]
      .map(([, naam, plaats, website, beschrijving, werkgebied]) => ({
        naam, plaats, website, beschrijving,
        werkgebied: werkgebied ? [...werkgebied.matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [],
      }));
    categorieen.push({ id: m[1], titel: m[2], intro: m[3], aanbieders });
  });
}
// Uniek geteld: een aanbieder die in twee categorieën staat (zoals Spirit for
// Two bij sporten én massage) telt maar één keer mee in het totaal.
const totaalAanbieders = new Set(categorieen.flatMap((c) => c.aanbieders.map((a) => a.naam))).size;

// Goedgekeurde openingszinnen per categorie (src/data/zorgkaart-openingszinnen.ts).
const openingBron = readFileSync(join(src, "data", "zorgkaart-openingszinnen.ts"), "utf8");
const openingszinnen = {};
{
  const lijst = (t) => [...t.matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  for (const m of openingBron.matchAll(/"([a-z0-9-]+)": \{\s*zin: "([^"]+)",\s*(vervangtIntro: true,\s*)?faq: \[([^\]]*)\],\s*gecontroleerdMet: \[([^\]]*)\],/g)) {
    openingszinnen[m[1]] = { zin: m[2], vervangtIntro: Boolean(m[3]), faq: lijst(m[4]), gecontroleerdMet: lijst(m[5]) };
  }
}
const openingVoor = (cat) => openingszinnen[cat.id]?.zin.replace("{aantal}", String(cat.aanbieders.length));

const leesFaq = (bron) =>
  [...bron.matchAll(/vraag: "([^"]+)",\s*\n\s*antwoord: "([^"]+)"/g)].map(([, vraag, antwoord]) => ({ vraag, antwoord }));
const reeksFaq = leesFaq(reeksBron);
const reeksTs = readFileSync(join(src, "..", "..", "api-server", "src", "lib", "reeks.ts"), "utf8");
const gasten = [...reeksTs.matchAll(/gast: \{ naam: "([^"]+)"(?:, rol: "([^"]+)")?/g)]
  .map(([, naam, rol]) => (rol ? `${rol} ${naam}` : naam)).join(" en ") || "gastdocenten";
const homeFaq = leesFaq(homeBron);
const zorgkaartFaq = leesFaq(zorgkaartPaginaBron);

const inbegrepen = (() => {
  const m = reeksBron.match(/const INBEGREPEN = \[([\s\S]*?)\];/);
  if (!m) return [];
  // Een onderdeel is een losse tekst op eigen regel, of een JSX-fragment met
  // de gastdocenten als <Gast naam="..." />; dat fragment wordt platte tekst.
  return [...m[1].matchAll(/^\s{2}(?:"([^"]+)",|<>([\s\S]*?)<\/>,)/gm)].map(([, tekst, jsx]) =>
    tekst ?? jsx.replace(/<Gast naam="([^"]+)" \/>/g, "$1").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim());
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

// De openingszinnen noemen vaste namen en plaatsen. Zijn de aanbieders van een
// categorie veranderd sinds de zin is goedgekeurd, dan stopt de build hier, zodat
// er nooit ongemerkt een verouderde zin of FAQ-antwoord online komt.
{
  const fouten = [];
  const faqVragen = new Set(zorgkaartFaq.map((f) => f.vraag));
  if (Object.keys(openingszinnen).length === 0) {
    fouten.push("Geen openingszinnen gevonden; klopt de opmaak van src/data/zorgkaart-openingszinnen.ts nog?");
  }
  for (const [id, o] of Object.entries(openingszinnen)) {
    const cat = categorieen.find((c) => c.id === id);
    if (!cat) { fouten.push(`Openingszin voor onbekende categorie "${id}".`); continue; }
    const nu = cat.aanbieders.map((a) => a.naam);
    const erbij = nu.filter((n) => !o.gecontroleerdMet.includes(n));
    const eraf = o.gecontroleerdMet.filter((n) => !nu.includes(n));
    if (erbij.length || eraf.length) {
      fouten.push(`${cat.titel}: aanbieders veranderd (erbij: ${erbij.join(", ") || "geen"}; eraf: ${eraf.join(", ") || "geen"}). ` +
        `Werk de openingszin${o.faq.length ? " en de FAQ-antwoorden op " + o.faq.map((v) => `"${v}"`).join(", ") : ""} bij, ` +
        `laat de nieuwe tekst goedkeuren en pas gecontroleerdMet aan in src/data/zorgkaart-openingszinnen.ts.`);
    }
    for (const v of o.faq) {
      if (!faqVragen.has(v)) fouten.push(`${cat.titel}: de FAQ-vraag "${v}" staat niet meer in src/pages/geboortezorg.tsx.`);
    }
  }
  if (fouten.length) {
    console.error("\nDe zorgkaartteksten kloppen niet meer met de aanbieders:\n- " + fouten.join("\n- ") + "\n");
    process.exit(1);
  }
}

// ── Plaatsen ────────────────────────────────────────────────────────────────
// Zelfde regels als zorgkaartVoorPlaats() in src/data/zorgkaart.ts: een
// aanbieder hoort bij een plaats als hij die plaats zelf noemt, en anders in de
// groep "breder werkgebied" als hij een regio of landelijk gebied opgeeft
// zonder een Zuidplas-plaats te noemen.
const PLAATSEN = [
  { slug: "nieuwerkerk-aan-den-ijssel", naam: "Nieuwerkerk aan den IJssel" },
  { slug: "zevenhuizen", naam: "Zevenhuizen" },
  { slug: "moordrecht", naam: "Moordrecht" },
  { slug: "moerkapelle", naam: "Moerkapelle" },
  // Buiten de gemeente, op haar besluit van 18 november 2026; eigen yogazin.
  { slug: "capelle-aan-den-ijssel", naam: "Capelle aan den IJssel", buitenZuidplas: true,
    yogaZin: "De groep is er ook voor zwangeren uit Capelle aan den IJssel en Rotterdam-Nesselande; Nieuwerkerk aan den IJssel ligt er direct naast." },
];
const BREED = /regio|regionale|landelijk|werkgebied/i;
const noemtPlaats = (tekst, naam) => tekst.toLowerCase().includes(naam.toLowerCase());
const noemtZuidplas = (tekst) => PLAATSEN.filter((p) => !p.buitenZuidplas).some((p) => noemtPlaats(tekst, p.naam));
const breedWerkgebied = (tekst) => BREED.test(tekst) && !noemtZuidplas(tekst);

const voorPlaats = (naam) => {
  const buiten = PLAATSEN.find((p) => p.naam === naam)?.buitenZuidplas === true;
  return categorieen
    .map((c) => ({
      titel: c.titel,
      intro: c.intro,
      hier: c.aanbieders.filter((a) => noemtPlaats(a.plaats, naam)),
      breed: c.aanbieders.filter(
        (a) =>
          !noemtPlaats(a.plaats, naam) &&
          ((breedWerkgebied(a.plaats) && !(buiten && /zuidplas/i.test(a.plaats))) || a.werkgebied.some((p) => noemtPlaats(p, naam))),
      ),
    }))
    .filter((r) => r.hier.length + r.breed.length > 0);
};

// ── Gestructureerde gegevens voor de kaart ─────────────────────────────────
// De kaart als verzamelpagina met de aanbieders als lijst, zodat zoekmachines
// en AI-tools zien dat dit één geheel is ("Geboortezorgkaart Zuidplas") en
// welke aanbieders erop staan. Alleen naam en website: geen soort, adres of
// werkgebied, want dat zou meer beweren dan de aanbieder zelf opgeeft.
const bijgewerkt = zorgkaartBron.match(/LAATST_BIJGEWERKT = \{ tekst: "[^"]+", iso: "([^"]+)" \}/)?.[1];
const KAART_URL = `${BASIS}/geboortezorg-zuidplas`;
const kaartJsonLd = ({ naam, url, beschrijving, aanbieders, deelVanKaart }) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: naam,
  url,
  description: beschrijving,
  inLanguage: "nl",
  ...(bijgewerkt ? { dateModified: bijgewerkt } : {}),
  publisher: { "@type": "Organization", name: "Studio Luna", url: `${BASIS}/` },
  ...(deelVanKaart ? { isPartOf: { "@type": "CollectionPage", name: "Geboortezorgkaart Zuidplas", url: KAART_URL } } : {}),
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: aanbieders.length,
    itemListElement: aanbieders.map((a, i) => ({ "@type": "ListItem", position: i + 1, name: a.naam, url: a.website })),
  },
});
const uniekeAanbieders = [...new Map(categorieen.flatMap((c) => c.aanbieders).map((a) => [a.naam, a])).values()];

// Deelafbeeldingen per pagina, gemaakt in de huisstijl met haar eigen foto's.
const OG_AFBEELDING = {
  geboortereeks: "geboortereeks.jpg",
  zwangerschapsmassage: "zwangerschapsmassage.jpg",
  postpartummassage: "postpartummassage.jpg",
  aanbod: "aanbod.jpg",
};

// De persoon achter Studio Luna, met haar volledige naam (haar keuze van 18
// november 2026). Dezelfde feiten als op de pagina Over mij.
const PERSOON = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Marjolein van der Vlegel",
  givenName: "Marjolein",
  jobTitle: "Zwangerschapsyogadocente en masseur",
  description: "Moeder, gepromoveerd onderzoeker en yogadocente. Geeft de Geboortereeks, zwangerschapsyoga en geboortevoorbereiding, en zwangerschaps- en postpartummassage (Lomi Lomi Hapai) in Nieuwerkerk aan den IJssel.",
  url: `${BASIS}/over-mij`,
  worksFor: { "@type": "LocalBusiness", name: "Studio Luna Zuidplas", url: `${BASIS}/` },
  knowsAbout: ["zwangerschapsyoga", "geboortevoorbereiding", "zwangerschapsmassage", "postpartummassage"],
  sameAs: ["https://www.instagram.com/studiolunazuidplas"],
};

// ── Routes ──────────────────────────────────────────────────────────────────
const ROUTES = [
  {
    pad: "",
    title: "Studio Luna | Zwangerschapsyoga in Zuidplas, Nieuwerkerk aan den IJssel",
    beschrijving: "Zwangerschapsyoga, geboortevoorbereiding en massage in Nieuwerkerk aan den IJssel, voor zwangeren uit heel Zuidplas. Met de Geboortezorgkaart Zuidplas.",
    jsonLd: [faqJsonLd(homeFaq)],
    // De herofoto vast laten voorladen zodat hij er staat zodra de app rendert.
    preload: "/images/buiten-hero.webp",
    inhoud:
      `<h1>Zwangerschapsyoga en geboortevoorbereiding in Zuidplas</h1>` +
      `<p>Studio Luna biedt de Geboortereeks, acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding in Nieuwerkerk aan den IJssel, en houdt de Geboortezorgkaart Zuidplas bij met alle geboortezorg in de regio.</p>` +
      `<p><a href="/geboortereeks">De Geboortereeks, start woensdag 13 januari</a> · <a href="/geboortezorg-zuidplas">De Geboortezorgkaart Zuidplas</a></p>` +
      faqHtml(homeFaq),
  },
  {
    pad: "geboortereeks",
    title: "Zwangerschapsyoga in Nieuwerkerk aan den IJssel: de Geboortereeks | Studio Luna",
    beschrijving: "Acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding in Nieuwerkerk aan den IJssel, kleinschalige vaste groep. Start woensdag 13 januari, €195.",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Studio Luna Geboortereeks",
        description: "Acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding plus mama-en-babyyoga na afloop, met twee gastlessen, een partnerles en een mamaspa-avond.",
        provider: { "@type": "LocalBusiness", name: "Studio Luna", url: `${BASIS}/` },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "onsite",
          startDate: "2027-01-13",
          location: { "@type": "Place", name: "Nieuwerkerk aan den IJssel", address: { "@type": "PostalAddress", addressLocality: "Nieuwerkerk aan den IJssel", addressRegion: "Zuidplas", addressCountry: "NL" } },
        },
        offers: [{ "@type": "Offer", name: "Geboortereeks, acht wekelijkse lessen", price: "195.00", priceCurrency: "EUR" }],
      },
      faqJsonLd(reeksFaq),
    ],
    inhoud:
      `<h1>De Geboortereeks</h1>` +
      // De docent staat voor crawlers nergens bij naam; de gastdocenten wel.
      `<p>De lessen worden gegeven door Marjolein: moeder, gepromoveerd onderzoeker en yogadocente, met een opleiding zwangerschapsyoga. Gastlessen van ${gasten}.</p>` +
      `<p>8-weekse zwangerschapsyoga- en geboortevoorbereidingsreeks in Nieuwerkerk aan den IJssel. Start woensdag 13 januari 2027, elke woensdag van 19:00 tot 20:15 uur, in een kleinschalige groep. €195 voor de hele reeks.</p>` +
      `<h2>Wat zit erin</h2><ul>` + inbegrepen.map((t) => `<li>${tekstVeilig(t)}</li>`).join("") + `</ul>` +
      faqHtml(reeksFaq),
  },
  {
    pad: "geboortezorg-zuidplas",
    title: "Geboortezorg in Zuidplas: verloskundigen, kraamzorg en meer | Studio Luna",
    beschrijving: "De Geboortezorgkaart Zuidplas: verloskundigen, kraamzorg, echo's, bekkenfysiotherapie, doula's, lactatiekundigen, cursussen en zwanger sporten in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht en Moerkapelle.",
    inhoud:
      `<h1>Geboortezorg in Zuidplas</h1>` +
      `<p>Zwanger of net bevallen in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht, Moerkapelle of Capelle aan den IJssel? Op deze pagina staat alle zorg en ondersteuning uit de regio op één plek: ${totaalAanbieders} aanbieders in ${categorieen.length} categorieën. Studio Luna houdt deze kaart bij.</p>` +
      `<ul>` + categorieen.map((c) => `<li><a href="/geboortezorg-zuidplas/${c.id}">${tekstVeilig(c.titel)}</a> (${c.aanbieders.length} ${c.aanbieders.length === 1 ? "aanbieder" : "aanbieders"})</li>`).join("") + `</ul>` +
      `<h2>Waar woon je?</h2>` +
      `<ul>` + PLAATSEN.map((p) => `<li><a href="/zwanger-in-${p.slug}">Zwanger in ${tekstVeilig(p.naam)}</a></li>`).join("") + `</ul>` +
      // Alle aanbieders per categorie, met plaats en beschrijving: AI-zoekmachines
      // voeren meestal geen JavaScript uit en zagen hier eerst alleen de aantallen.
      categorieen.map((c) =>
        `<h2>${tekstVeilig(c.titel)} in Zuidplas</h2><p>${tekstVeilig(c.intro)}</p>` +
        c.aanbieders.map((a) => `<h3>${tekstVeilig(a.naam)}</h3><p>${tekstVeilig(a.plaats)}. ${tekstVeilig(a.beschrijving)} <a href="${ontsmet(a.website)}" rel="nofollow">Website</a></p>`).join("") +
        `<p><a href="/geboortezorg-zuidplas/${c.id}">Alle ${tekstVeilig(c.titel.toLowerCase())} in Zuidplas</a></p>`
      ).join("") +
      faqHtml(zorgkaartFaq),
    jsonLd: [
      faqJsonLd(zorgkaartFaq),
      kaartJsonLd({
        naam: "Geboortezorgkaart Zuidplas",
        url: KAART_URL,
        beschrijving: "De Geboortezorgkaart Zuidplas: verloskundigen, kraamzorg, echo's, bekkenfysiotherapie, doula's, lactatiekundigen, cursussen en zwanger sporten in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht en Moerkapelle.",
        aanbieders: uniekeAanbieders,
      }),
    ],
  },
  // De massagepagina's: dezelfde teksten als de pagina zelf (massage-teksten.json
  // en massage.ts), zodat een crawler zonder JavaScript alles leest wat een
  // bezoekster ziet, inclusief de veelgestelde vragen.
  ...[
    { pad: "zwangerschapsmassage", titel: "Zwangerschapsmassage", voor: "zwanger", wanneer: MASSAGE.wanneerZwanger,
      ook: "en ook na de bevalling", ander: { pad: "/postpartummassage", tekst: "Ben je al bevallen? De massage kan ook na de bevalling" },
      title: "Zwangerschapsmassage in Nieuwerkerk aan den IJssel | Studio Luna" },
    { pad: "postpartummassage", titel: "Postpartummassage", voor: "postpartum", wanneer: MASSAGE.wanneerPostpartum,
      ook: "en ook al tijdens je zwangerschap", ander: { pad: "/zwangerschapsmassage", tekst: "Ben je nog zwanger? De massage kan ook tijdens je zwangerschap" },
      title: "Massage na de bevalling in Nieuwerkerk aan den IJssel | Studio Luna" },
  ].map((m) => {
    const beschrijving = `${MASSAGE.naam}, een full body ontspanningsmassage van ${MASSAGE.duur}, ${m.wanneer}. Bij ${MASSAGE.praktijk[0]} in Nieuwerkerk aan den IJssel.`;
    const faq = [
      { vraag: "Wanneer kan ik een massage krijgen?", antwoord: `De massage kan ${MASSAGE.wanneerZwanger}, en na de bevalling ${MASSAGE.wanneerPostpartum}. ${massageTeksten.faqWanneerSlot}` },
      ...massageTeksten.faq.map((f) => ({ vraag: f.vraag, antwoord: f.antwoord ?? f[m.voor] ?? "" })),
      ...MASSAGE.voorwaarden,
    ];
    return {
      pad: m.pad,
      title: m.title,
      beschrijving,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${m.titel}: ${MASSAGE.naam}`,
          description: beschrijving,
          provider: { "@type": "LocalBusiness", name: "Studio Luna Zuidplas", url: `${BASIS}/` },
          areaServed: ["Zuidplas", "Capelle aan den IJssel"],
          offers: [
            ...(massageIntroLoopt
              ? [{ "@type": "Offer", name: `${MASSAGE.naam}, ${MASSAGE.duur}, introductieprijs eerste massage`, price: `${MASSAGE.intro}.00`, priceCurrency: "EUR", priceValidUntil: MASSAGE.introTot }]
              : []),
            { "@type": "Offer", name: `${MASSAGE.naam}, ${MASSAGE.duur}`, price: `${MASSAGE.prijs}.00`, priceCurrency: "EUR" },
            ...MASSAGE.pakketten.map((p) => ({
              "@type": "Offer", name: `${MASSAGE.naam}, pakket ${p.naam}: ${p.aantal} massages, ${p.geldig} geldig, inclusief ${p.extra}`, price: `${p.prijs}.00`, priceCurrency: "EUR",
            })),
          ],
        },
        faqJsonLd(faq),
      ],
      inhoud:
        `<h1>${m.titel}</h1>` +
        `<p>${MASSAGE.naam}, ${MASSAGE.duur}. <a href="${m.ander.pad}">${m.ander.tekst}</a>. <a href="/aanbod">Alle aanbod en tarieven</a>. <a href="/cadeaubon">Geef een massage cadeau</a>.</p>` +
        `<h2>${tekstVeilig(massageTeksten.kop)}</h2>` +
        `<p>${tekstVeilig(massageTeksten.waarom)}</p><p>${tekstVeilig(massageTeksten.watIsHet)}</p><p>${tekstVeilig(massageTeksten.hoeHetGaat)}</p>` +
        `<p>Je kunt de massage krijgen ${tekstVeilig(m.wanneer)}, ${m.ook}.</p>` +
        `<p>${tekstVeilig(massageTeksten.pakket)}</p>` +
        `<h2>Praktisch</h2><ul>` +
        `<li>Massage: ${MASSAGE.naam}, full body, ${MASSAGE.duur}</li>` +
        `<li>Voor wie: ${m.voor === "zwanger" ? "zwangeren" : "moeders"}, ${tekstVeilig(m.wanneer)}</li>` +
        `<li>Waar: bij ${tekstVeilig(MASSAGE.praktijk[0])}, ${tekstVeilig(MASSAGE.praktijk[1])}</li>` +
        `<li>Losse massage: €${MASSAGE.prijs}</li>` +
        (massageIntroLoopt ? `<li>Introductieprijs: €${MASSAGE.intro} voor je eerste massage, tot en met ${MASSAGE.introTotTekst}</li>` : "") +
        MASSAGE.pakketten.map((p) => `<li>Pakket ${p.aantal} massages: ${p.naam}, €${p.prijs}, ${p.geldig} geldig, inclusief ${tekstVeilig(p.extra)}</li>`).join("") +
        `<li>Afspraak: via het formulier op deze pagina</li></ul>` +
        `<h2>Een afspraak aanvragen</h2><p>${tekstVeilig(massageTeksten.afspraakUitleg)}</p>` +
        faqHtml(faq),
    };
  }),
  {
    pad: "aanbod",
    title: "Aanbod en tarieven | Studio Luna, Nieuwerkerk aan den IJssel",
    beschrijving: `Alles van Studio Luna met de prijzen: de Geboortereeks (€195), privéles zwangerschapsyoga en geboortevoorbereiding, zwangerschapsmassage en postpartummassage (€${MASSAGE.prijs}, pakketten vanaf €${MASSAGE.pakketten[0].prijs}) in Nieuwerkerk aan den IJssel.`,
    inhoud:
      `<h1>Aanbod en tarieven</h1>` +
      `<h2>Zwanger</h2><ul>` +
      `<li><a href="/geboortereeks">De Geboortereeks</a>: acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding in een kleinschalige, vaste groep, €195.</li>` +
      `<li>Privéles zwangerschapsyoga en/of geboortevoorbereiding: op maat, één of meerdere lessen, met of zonder partner, prijs in overleg.</li>` +
      `<li><a href="/zwangerschapsmassage">Zwangerschapsmassage</a>: ${MASSAGE.naam}, ${MASSAGE.duur}, €${MASSAGE.prijs}${massageIntroLoopt ? ` (eerste massage €${MASSAGE.intro} tot en met ${MASSAGE.introTotTekst})` : ""}.</li></ul>` +
      `<h2>Voor mama's, postpartum en daarna</h2><ul>` +
      `<li><a href="/postpartummassage">Postpartummassage</a>: ${MASSAGE.naam}, ${MASSAGE.duur}, €${MASSAGE.prijs}${massageIntroLoopt ? ` (eerste massage €${MASSAGE.intro} tot en met ${MASSAGE.introTotTekst})` : ""}.</li>` +
      `<li>Mama-en-babyyoga: inbegrepen bij de Geboortereeks.</li></ul>` +
      `<h2>Massagepakketten</h2><ul>` +
      MASSAGE.pakketten.map((p) => `<li>${p.naam}: ${p.aantal} massages, €${p.prijs}, ${MASSAGE.mengen}, ${p.geldig} geldig. Inclusief ${tekstVeilig(p.extra)}.</li>`).join("") +
      `</ul>` +
      `<h2>Cadeaubon</h2><p><a href="/cadeaubon">Cadeaubon voor een massage</a>: ${cadeaubonOpties}, ${MASSAGE.cadeaubonGeldig} geldig.</p>` +
      `<h2>Aan huis</h2><p>Behandeling aan huis, bijvoorbeeld in de kraamperiode: binnenkort beschikbaar.</p>` +
      `<h2>Pakket op maat</h2><p>Een pakket naar jouw wens, prijs in overleg. ${tekstVeilig(massageTeksten.pakket)}</p>`,
  },
  {
    pad: "cadeaubon",
    title: "Cadeaubon voor een zwangerschaps- of postpartummassage | Studio Luna",
    beschrijving: `Geef een ${MASSAGE.naam}-massage cadeau: een cadeaubon voor ${cadeaubonOpties}, ${MASSAGE.cadeaubonGeldig} geldig. Bij ${MASSAGE.praktijk[0]} in Nieuwerkerk aan den IJssel.`,
    inhoud:
      `<h1>Cadeaubon</h1>` +
      `<p>Geef een ${MASSAGE.naam}-massage cadeau: een full body ontspanningsmassage van ${MASSAGE.duur}, tijdens de zwangerschap of na de bevalling, bij ${tekstVeilig(MASSAGE.praktijk[0])} in Nieuwerkerk aan den IJssel. <a href="/zwangerschapsmassage">Over de zwangerschapsmassage</a>. <a href="/postpartummassage">Over de postpartummassage</a>.</p>` +
      `<h2>De cadeaubonnen</h2><ul>` +
      `<li>1 massage: €${MASSAGE.prijs}</li>` +
      MASSAGE.pakketten.map((p) => `<li>${p.naam}: ${p.aantal} massages, €${p.prijs}, inclusief ${tekstVeilig(p.extra)}</li>`).join("") +
      `</ul>` +
      `<h2>Zo werkt het</h2><p>Je vraagt de cadeaubon aan via het formulier op deze pagina en krijgt daarna een factuur per mail. Na betaling krijg je de cadeaubon per mail, om door te sturen of te printen. De bon is ${MASSAGE.cadeaubonGeldig} geldig, en wie hem krijgt maakt zelf een afspraak via de massagepagina.</p>`,
  },
  {
    pad: "over-mij",
    jsonLd: [PERSOON],
    title: "Over Marjolein, zwangerschapsyoga docente in Nieuwerkerk aan den IJssel",
    beschrijving: "Maak kennis met Marjolein: moeder, gepromoveerd onderzoeker en yogadocente. Zij geeft de Geboortereeks van Studio Luna in Nieuwerkerk aan den IJssel, gemeente Zuidplas.",
    inhoud:
      `<h1>Over Marjolein</h1><p>Zwangerschapsyogadocente en oprichter van Studio Luna in Nieuwerkerk aan den IJssel.</p>` +
      (liveTeksten && liveTeksten.over_mij_tekst
        ? alineas(liveTeksten.over_mij_tekst)
        : `<p>Moeder, gepromoveerd onderzoeker en yogadocente. Zij geeft de Geboortereeks van Studio Luna in Nieuwerkerk aan den IJssel, gemeente Zuidplas.</p>`),
  },
  {
    pad: "events",
    title: "Events voor zwangeren en moeders in Zuidplas | Studio Luna",
    beschrijving: "Workshops en events voor zwangeren en moeders in Nieuwerkerk aan den IJssel en heel Zuidplas. De eerste data volgen; laat je mailadres achter.",
    inhoud: `<h1>Events van Studio Luna</h1><p>Naast de wekelijkse lessen organiseert Studio Luna ook workshops en events, soms vanuit Studio Luna en soms vanuit een samenwerking met andere inspirerende vrouwen. Deze events zijn voor zwangeren, moeders en ondernemende vrouwen die verdieping, inspiratie en verbinding zoeken, in Nieuwerkerk aan den IJssel en heel Zuidplas. De eerste data volgen binnenkort.</p>`,
  },
  {
    pad: "blog",
    title: "Blog over zwangerschap en moederschap in Zuidplas | Studio Luna",
    beschrijving: "Artikelen van Studio Luna over zwangerschap, geboortevoorbereiding en moederschap, voor zwangeren en moeders in Nieuwerkerk aan den IJssel en de rest van Zuidplas.",
    inhoud:
      `<h1>Blog van Studio Luna</h1><p>Artikelen over zwangerschap, geboortevoorbereiding en moederschap in Zuidplas.</p><ul>` +
      blogs.map((b) => `<li><a href="/blog/${b.slug}">${tekstVeilig(b.titel)}</a>${b.datum ? ` (${b.datum})` : ""}${b.body ? `: ${tekstVeilig(samenvatting(b.body, 160))}` : ""}</li>`).join("") +
      `</ul>`,
  },
];

// Categoriepagina's van de zorgkaart: eigen schil met intro en de volledige
// aanbiederslijst als zichtbare tekst.
for (const cat of categorieen) {
  ROUTES.push({
    pad: `geboortezorg-zuidplas/${cat.id}`,
    title: `${cat.titel} in Zuidplas | Geboortezorgkaart Studio Luna`,
    beschrijving: kort(`${cat.intro} Onderdeel van de Geboortezorgkaart Zuidplas van Studio Luna.`),
    jsonLd: [kaartJsonLd({
      naam: `${cat.titel} in Zuidplas`,
      url: `${KAART_URL}/${cat.id}`,
      beschrijving: cat.intro,
      aanbieders: cat.aanbieders,
      deelVanKaart: true,
    })],
    inhoud:
      `<h1>${tekstVeilig(cat.titel)} in de regio Zuidplas</h1>` +
      (openingVoor(cat) ? `<p>${tekstVeilig(openingVoor(cat))}</p>` : "") +
      (openingszinnen[cat.id]?.vervangtIntro ? "" : `<p>${tekstVeilig(cat.intro)}</p>`) +
      cat.aanbieders.map((a) =>
        `<h2>${tekstVeilig(a.naam)}</h2><p>${tekstVeilig(a.plaats)}. ${tekstVeilig(a.beschrijving)} <a href="${ontsmet(a.website)}" rel="nofollow">Website</a></p>`
      ).join("") +
      `<p><a href="/geboortezorg-zuidplas">Bekijk alle geboortezorg in Zuidplas</a></p>` +
      `<p>Deze kaart is een initiatief van <a href="/">Studio Luna</a> in Nieuwerkerk aan den IJssel, waar op 13 januari <a href="/geboortereeks">de Geboortereeks</a> start.</p>`,
  });
}

// De plaatspagina's: per plaats de aanbieders die dat dorp zelf noemen, en
// daaronder wie er vanuit een breder gebied werkt, met het werkgebied erbij.
for (const plaats of PLAATSEN) {
  const rijen = voorPlaats(plaats.naam);
  const aantalHier = new Set(rijen.flatMap((r) => r.hier.map((a) => a.naam))).size;
  const aantalBreed = new Set(rijen.flatMap((r) => r.breed.map((a) => a.naam))).size;
  ROUTES.push({
    pad: `zwanger-in-${plaats.slug}`,
    title: `Zwanger in ${plaats.naam}: geboortezorg in de buurt | Studio Luna`,
    beschrijving: kort(`Verloskundigen, kraamzorg, echo's, zwangerschapsyoga, bekkenfysiotherapie en meer voor wie zwanger is in ${plaats.naam}. Onderdeel van de Geboortezorgkaart Zuidplas van Studio Luna.`),
    inhoud:
      `<h1>Zwanger in ${tekstVeilig(plaats.naam)}</h1>` +
      `<p>Alles rondom je zwangerschap, je bevalling en de eerste tijd daarna in ${tekstVeilig(plaats.naam)}. ${aantalHier} aanbieders geven ${tekstVeilig(plaats.naam)} zelf op als plaats, ${aantalBreed} andere werken vanuit een breder gebied; bij die laatste staat hun eigen werkgebied erbij.</p>` +
      rijen.map((r) =>
        `<h2>${tekstVeilig(r.titel)} in ${tekstVeilig(plaats.naam)}</h2><p>${tekstVeilig(r.intro)}</p>` +
        r.hier.map((a) => `<h3>${tekstVeilig(a.naam)}</h3><p>${tekstVeilig(a.plaats)}. ${tekstVeilig(a.beschrijving)} <a href="${ontsmet(a.website)}" rel="nofollow">Website</a></p>`).join("") +
        (r.breed.length
          ? `<p>Werkt vanuit een breder gebied:</p>` +
            r.breed.map((a) => `<h3>${tekstVeilig(a.naam)}</h3><p>${tekstVeilig(a.plaats)}. ${tekstVeilig(a.beschrijving)} <a href="${ontsmet(a.website)}" rel="nofollow">Website</a></p>`).join("")
          : "")
      ).join("") +
      `<h2>Zwangerschapsyoga in ${tekstVeilig(plaats.naam)}</h2>` +
      `<p>Studio Luna geeft <a href="/geboortereeks">de Geboortereeks</a> in Nieuwerkerk aan den IJssel: acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding in een vaste groep, met daarna mama-en-babyyoga. ${tekstVeilig(plaats.yogaZin ?? `De groep is er voor zwangeren uit de hele gemeente Zuidplas, dus ook als je in ${plaats.naam} woont.`)} Terug naar <a href="/geboortezorg-zuidplas">de hele Geboortezorgkaart Zuidplas</a>.</p>`,
  });
}

// De blogartikelen: eigen schil met de volledige tekst uit de live API, zodat
// elk artikel een eigen titel en canonical heeft en ook zonder JavaScript
// leesbaar is. Een nieuw artikel in /admin komt bij de volgende build vanzelf
// mee, ook in de sitemap.
for (const b of blogs) {
  ROUTES.push({
    pad: `blog/${b.slug}`,
    title: kort(`${b.titel} | Blog Studio Luna`, 65),
    beschrijving: b.body ? samenvatting(b.body, 158) : kort(`${b.titel}. Een artikel uit het blog van Studio Luna over zwangerschap en moederschap in Zuidplas.`),
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Article",
      headline: b.titel,
      ...(b.datum ? { datePublished: b.datum } : {}),
      ...(b.categorie ? { articleSection: b.categorie } : {}),
      author: { "@type": "Person", name: "Marjolein van der Vlegel", url: `${BASIS}/over-mij` },
      publisher: { "@type": "Organization", name: "Studio Luna Zuidplas", url: `${BASIS}/` },
      mainEntityOfPage: `${BASIS}/blog/${b.slug}`,
    }],
    inhoud:
      `<h1>${tekstVeilig(b.titel)}</h1>` +
      (b.body ? schoonHtml(b.body) : `<p>Een artikel uit <a href="/blog">het blog van Studio Luna</a>.</p>`) +
      `<p><a href="/blog">Meer artikelen uit het blog van Studio Luna</a></p>`,
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
  // Eigen deelafbeelding (public/og/) voor de pagina's die er een hebben; de
  // rest houdt de algemene uit index.html. De oude opengraph.jpg was een
  // schermafbeelding van augustus waarop de herofoto nog niet geladen was, en
  // die kwam in WhatsApp als grijs-zwart vlak door (18 november 2026).
  if (OG_AFBEELDING[route.pad]) {
    html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${BASIS}/og/${OG_AFBEELDING[route.pad]}$2`);
  }
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

// ── Sitemap ─────────────────────────────────────────────────────────────────
// Gebouwd uit dezelfde routes als de schillen. De oude handmatige sitemap in
// public/ noemde categorieën die niet meer bestonden en miste nieuwe.
const PRIORITEIT = (pad) =>
  pad === "" || pad === "geboortezorg-zuidplas" ? "1.0"
  : pad === "geboortereeks" ? "0.9"
  : pad === "events" ? "0.8"
  : pad.startsWith("geboortezorg-zuidplas/") || pad.startsWith("zwanger-in-") ? "0.8"
  : "0.6";
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ROUTES.map((r) => `  <url>\n    <loc>${r.pad ? `${BASIS}/${r.pad}` : `${BASIS}/`}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${PRIORITEIT(r.pad)}</priority>\n  </url>`).join("\n") +
  `\n</urlset>\n`;
writeFileSync(join(root, "sitemap.xml"), sitemap);
console.log("geschreven: sitemap.xml met", ROUTES.length, "adressen");

// ── llms.txt ────────────────────────────────────────────────────────────────
// Kort overzicht voor AI-tools volgens de llms.txt-opzet, alleen met teksten
// die al op de site staan.
const llms =
  `# Studio Luna\n\n` +
  `> Studio Luna biedt de Geboortereeks, acht wekelijkse lessen zwangerschapsyoga en geboortevoorbereiding in Nieuwerkerk aan den IJssel, en houdt de Geboortezorgkaart Zuidplas bij met alle geboortezorg in de regio.\n\n` +
  `## Geboortezorgkaart Zuidplas\n\n` +
  `Zwanger of net bevallen in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht, Moerkapelle of Capelle aan den IJssel? Op de kaart staat alle zorg en ondersteuning uit de regio op één plek: ${totaalAanbieders} aanbieders in ${categorieen.length} categorieën.\n\n` +
  `- [Geboortezorg in Zuidplas](${BASIS}/geboortezorg-zuidplas): de hele kaart\n` +
  categorieen.map((c) => `- [${c.titel} in Zuidplas](${BASIS}/geboortezorg-zuidplas/${c.id}): ${c.intro}`).join("\n") +
  `\n\n## Per plaats\n\n` +
  PLAATSEN.map((p) => `- [Zwanger in ${p.naam}](${BASIS}/zwanger-in-${p.slug})`).join("\n") +
  `\n\n## Studio Luna\n\n` +
  `- [De Geboortereeks](${BASIS}/geboortereeks): 8-weekse zwangerschapsyoga- en geboortevoorbereidingsreeks in Nieuwerkerk aan den IJssel\n` +
  `- [Aanbod en tarieven](${BASIS}/aanbod): alles van Studio Luna met de prijzen
` +
  `- [Zwangerschapsmassage](${BASIS}/zwangerschapsmassage): Lomi Lomi Hapai, full body ontspanningsmassage van 75 minuten, tijdens de hele zwangerschap\n` +
  `- [Postpartummassage](${BASIS}/postpartummassage): Lomi Lomi Hapai, full body ontspanningsmassage van 75 minuten, vlak na de bevalling en ook maanden later\n` +
  `- [Over Marjolein](${BASIS}/over-mij): moeder, gepromoveerd onderzoeker en yogadocente\n` +
  `- [Events](${BASIS}/events): workshops en events naast de wekelijkse lessen, voor zwangeren, moeders en ondernemende vrouwen in Zuidplas\n` +
  `- [Blog](${BASIS}/blog): artikelen over zwangerschap, geboortevoorbereiding en moederschap in Zuidplas\n`;
writeFileSync(join(root, "llms.txt"), llms);
console.log("geschreven: llms.txt");
