/**
 * Studio Luna — Data Export Script
 * Exporteert alle data uit de Replit database naar JSON-bestanden.
 * Uitvoeren: pnpm --filter @workspace/scripts run export-data
 */

import Database from "@replit/database";
import fs from "node:fs";
import path from "node:path";

const db = new Database();

const EXPORT_DIR = path.join(process.cwd(), "data-export");

const KEYS = [
  "studio_luna:members",
  "studio_luna:bookings",
  "studio_luna:reserveringen",
  "studio_luna:blog",
  "studio_luna:blog_comments",
  "studio_luna:journal",
  "studio_luna:events",
  "studio_luna:tips",
  "studio_luna:tarieven",
  "studio_luna:class_types",
  "studio_luna:classes",
  "studio_luna:announcements",
  "studio_luna:requests",
  "studio_luna:reviews",
  "studio_luna:email_settings",
  "studio_luna:pagina_teksten",
  // foto's
  "studio_luna:foto:foto_hero",
  "studio_luna:foto:foto_yoga",
  "studio_luna:foto:foto_circle",
  "studio_luna:foto:over_mij_foto",
] as const;

function keyToFilename(key: string): string {
  return key.replace(/:/g, "_") + ".json";
}

async function main() {
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }

  console.log(`\n📦 Studio Luna — Data Export`);
  console.log(`📁 Exportmap: ${EXPORT_DIR}\n`);

  let success = 0;
  let empty = 0;
  let errors = 0;

  // Dynamische afbeeldingssleutels ophalen
  const allKeys = await db.list("studio_luna:image:");
  const imageKeys = Object.keys(allKeys ?? {});
  const allExportKeys = [...KEYS, ...imageKeys];

  for (const key of allExportKeys) {
    try {
      const value = await db.get(key);
      const filename = keyToFilename(key);
      const filepath = path.join(EXPORT_DIR, filename);

      if (value === null || value === undefined) {
        console.log(`  ⚪ ${key} — leeg, overgeslagen`);
        empty++;
        continue;
      }

      fs.writeFileSync(filepath, JSON.stringify(value, null, 2), "utf-8");

      // Toon samenvatting
      if (Array.isArray(value)) {
        console.log(`  ✅ ${key} — ${value.length} records → ${filename}`);
      } else if (typeof value === "string" && value.length > 200) {
        console.log(`  ✅ ${key} — afbeelding (${Math.round(value.length / 1024)} KB) → ${filename}`);
      } else {
        console.log(`  ✅ ${key} → ${filename}`);
      }
      success++;
    } catch (err) {
      console.error(`  ❌ ${key} — fout: ${err}`);
      errors++;
    }
  }

  // Schrijf ook een samengevoegd export-bestand
  const combined: Record<string, unknown> = {};
  for (const file of fs.readdirSync(EXPORT_DIR)) {
    if (!file.endsWith(".json") || file === "alle-data.json") continue;
    const key = file.replace(".json", "").replace(/_/g, ":");
    try {
      combined[key] = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, file), "utf-8"));
    } catch {}
  }
  fs.writeFileSync(path.join(EXPORT_DIR, "alle-data.json"), JSON.stringify(combined, null, 2), "utf-8");

  console.log(`\n📊 Resultaat: ${success} geëxporteerd, ${empty} leeg, ${errors} fouten`);
  console.log(`📄 Alles samengevoegd in: data-export/alle-data.json`);
  console.log(`\n✅ Klaar! Download de map 'data-export' via Replit's bestandsbeheer.\n`);
}

main().catch((err) => {
  console.error("Export mislukt:", err);
  process.exit(1);
});
