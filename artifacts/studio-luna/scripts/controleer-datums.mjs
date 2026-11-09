// Datumbewaking, draait als laatste stap van de build.
//
// Op 14 oktober 2026 ging de site over op de januarireeks, maar de
// bevestigingsmail bleef "dinsdag 29 september" noemen, en dat merkte niemand
// tot een aanmelder het zelf zei. Deze controle leest alle tekst die echt bij
// bezoekers en aanmelders aankomt (de gebouwde site en de gebouwde server met
// de mails) en stopt de build als daar een datum in staat die niet in de
// lesdata van reeks.ts staat en ook niet hieronder bewust is toegestaan.
//
// Een melding van deze controle? Pas de tekst aan, of zet de datum in
// TOEGESTAAN met een reden en een einddatum.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HIER = fileURLToPath(new URL("..", import.meta.url));
const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli",
  "augustus", "september", "oktober", "november", "december"];

// Datums die niet over de reeks gaan of bewust blijven staan. "tot" is de
// laatste dag waarop de datum nog mag; daarna stopt de build weer, zodat een
// verouderde zin niet ongemerkt blijft staan.
const TOEGESTAAN = [
  { datum: "29 september", tot: "2026-11-17", reden: "de lopende reeks die op 29 september begon, tot de laatste les" },
];

const reeksBron = readFileSync(join(HIER, "../api-server/src/lib/reeks.ts"), "utf8");
const lesdata = [...reeksBron.matchAll(/iso: "(\d{4})-(\d{2})-(\d{2})"/g)]
  .map(([, , m, d]) => `${Number(d)} ${MAANDEN[Number(m) - 1]}`);
if (lesdata.length === 0) {
  console.error("Datumbewaking: geen lesdata gevonden in api-server/src/lib/reeks.ts.");
  process.exit(1);
}
const vandaag = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" });
const eersteLes = [...reeksBron.matchAll(/iso: "(\d{4}-\d{2}-\d{2})"/g)][0][1];
if (vandaag >= eersteLes) {
  console.warn(`Datumbewaking: de reeks in reeks.ts is op ${eersteLes} begonnen. Zet de volgende reeks erin; ` +
    "tot die tijd noemt de bevestigingsmail geen startdatum.");
}
const toegestaan = new Set([
  ...lesdata,
  ...TOEGESTAAN.filter((t) => vandaag <= t.tot).map((t) => t.datum),
]);

function bestanden(map, ext) {
  if (!existsSync(map)) return [];
  return readdirSync(map).flatMap((naam) => {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) return bestanden(pad, ext);
    return ext.some((e) => naam.endsWith(e)) ? [pad] : [];
  });
}

// De admin-bundel slaan we over: die tekst ziet alleen Marjolein zelf.
const teLezen = [
  ...bestanden(join(HIER, "dist/public"), [".html", ".js", ".txt", ".xml"]).filter((p) => !/[\\/]admin-[^\\/]*\.js$/.test(p)),
  ...bestanden(join(HIER, "../api-server/dist"), [".cjs", ".js", ".mjs"]),
];
if (!teLezen.some((p) => p.includes("api-server"))) {
  console.warn("Datumbewaking: de server is nog niet gebouwd, alleen de site is gecontroleerd.");
}

const patroon = new RegExp(`\\b(\\d{1,2}) (${MAANDEN.join("|")})\\b`, "g");
const fouten = [];
for (const pad of teLezen) {
  const tekst = readFileSync(pad, "utf8");
  for (const m of tekst.matchAll(patroon)) {
    const datum = `${Number(m[1])} ${m[2]}`;
    if (toegestaan.has(datum)) continue;
    const rond = tekst.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, " ");
    fouten.push(`  ${relative(HIER, pad)}: "${datum}" in ...${rond}...`);
  }
}

if (fouten.length) {
  console.error(
    "\nDatumbewaking: er staat een datum in de site of in een mail die niet in de lesdata van " +
      "api-server/src/lib/reeks.ts staat.\nPas de tekst aan, of zet de datum met reden en einddatum in " +
      "TOEGESTAAN in scripts/controleer-datums.mjs.\n\n" +
      [...new Set(fouten)].slice(0, 30).join("\n") + "\n",
  );
  process.exit(1);
}
console.log(`Datumbewaking: ${teLezen.length} bestanden gecontroleerd, alle datums kloppen met reeks.ts.`);
