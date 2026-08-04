/**
 * Studio Luna — Data Import Script
 * Importeert geëxporteerde JSON-bestanden in een Neon PostgreSQL-database.
 * Vereiste: DATABASE_URL moet ingesteld zijn.
 *
 * Uitvoeren: pnpm --filter @workspace/scripts run import-data
 */

import { db } from "@workspace/db";
import {
  members, bookings, reserveringen, blogPosts, blogComments,
  journalEntries, events, tips, announcements, requests,
  classTypes, classes, studioSettings, assets,
} from "@workspace/db";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Vast pad relatief aan dit scriptbestand, zodat het werkt ongeacht de werkmap
const EXPORT_DIR = path.join(import.meta.dirname, "..", "data-export");

function readJson<T>(filename: string): T | null {
  const filepath = path.join(EXPORT_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(filepath, "utf-8"));
    // Replit DB-exports zijn verpakt als {ok, value} — uitpakken
    if (parsed && typeof parsed === "object" && "ok" in parsed) {
      if (parsed.ok !== true) return null;
      return (parsed.value ?? null) as T | null;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

async function importTable<T extends Record<string, unknown>>(
  label: string,
  filename: string,
  table: any,
  transform?: (row: T) => T
) {
  const data = readJson<T[]>(filename);
  if (!data || data.length === 0) {
    console.log(`  ⚪ ${label} — geen data`);
    return;
  }
  const rows = data.map((row) => {
    const r = (transform ? transform(row) : row) as Record<string, unknown>;
    // Ensure every row has an id
    if (!r.id) r.id = crypto.randomUUID();
    return r;
  });
  await db.insert(table).values(rows).onConflictDoNothing();
  console.log(`  ✅ ${label} — ${rows.length} rijen geïmporteerd`);
}

async function importSetting(key: string, filename: string, dbKey?: string) {
  const value = readJson<Record<string, unknown>>(filename);
  if (!value) {
    console.log(`  ⚪ ${key} — geen data`);
    return;
  }
  await db.insert(studioSettings)
    .values({ key: dbKey ?? key, value })
    .onConflictDoNothing();
  console.log(`  ✅ ${key} — instelling geïmporteerd`);
}

async function importAsset(key: string, filename: string) {
  const data = readJson<string>(filename);
  if (!data || typeof data !== "string" || data.length < 10) {
    console.log(`  ⚪ ${key} — geen data`);
    return;
  }
  await db.insert(assets).values({ key, data }).onConflictDoNothing();
  console.log(`  ✅ ${key} — afbeelding geïmporteerd (${Math.round(data.length / 1024)} KB)`);
}

async function main() {
  console.log("\n📥 Studio Luna — Data Import naar PostgreSQL");
  console.log(`📁 Bronmap: ${EXPORT_DIR}\n`);

  // ── Array tabellen ──────────────────────────────────────────────────────────
  await importTable("Leden",            "studio_luna_members.json",       members);
  await importTable("Boekingen",        "studio_luna_bookings.json",      bookings);
  await importTable("Reserveringen",    "studio_luna_reserveringen.json", reserveringen);
  await importTable("Blogartikelen",    "studio_luna_blog.json",          blogPosts);
  await importTable("Blog reacties",    "studio_luna_blog_comments.json", blogComments);
  await importTable("Journal",          "studio_luna_journal.json",       journalEntries);
  await importTable("Evenementen",      "studio_luna_events.json",        events);
  await importTable("Tips",             "studio_luna_tips.json",          tips);
  await importTable("Aankondigingen",   "studio_luna_announcements.json", announcements);
  await importTable("Aanvragen",        "studio_luna_requests.json",      requests);
  await importTable("Lestypes",         "studio_luna_class_types.json",   classTypes);
  await importTable("Lessen/reeksen",   "studio_luna_classes.json",       classes);

  // ── Instellingen (JSONB) ────────────────────────────────────────────────────
  await importSetting("Tarieven",        "studio_luna_tarieven.json",       "tarieven");
  await importSetting("E-mailinstellingen", "studio_luna_email_settings.json", "email_settings");
  await importSetting("Paginateksten",   "studio_luna_pagina_teksten.json", "pagina_teksten");
  await importSetting("Reviews",         "studio_luna_reviews.json",        "reviews");

  // ── Foto's & afbeeldingen ───────────────────────────────────────────────────
  await importAsset("foto_foto_hero",      "studio_luna_foto_foto_hero.json");
  await importAsset("foto_foto_yoga",      "studio_luna_foto_foto_yoga.json");
  await importAsset("foto_foto_circle",    "studio_luna_foto_foto_circle.json");
  await importAsset("foto_over_mij_foto",  "studio_luna_foto_over_mij_foto.json");

  // Blog-omslagfoto's en overige losse afbeeldingen (studio_luna_image_*.json)
  // image-store gebruikt sleutels met img_-prefix (bijv. img_blog_cover_<id>)
  for (const f of fs.readdirSync(EXPORT_DIR)) {
    const m = f.match(/^studio_luna_image_(.+)\.json$/);
    if (m) await importAsset(`img_${m[1]}`, f);
  }

  console.log("\n✅ Import klaar! Controleer de data in je Neon dashboard.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Import mislukt:", err);
  process.exit(1);
});
