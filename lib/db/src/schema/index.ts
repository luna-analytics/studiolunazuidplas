import { pgTable, text, integer, boolean, jsonb } from "drizzle-orm/pg-core";

// ─── Members (leden) ─────────────────────────────────────────────────────────
export const members = pgTable("members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  credits: integer("credits").default(0).notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});
export type Member = typeof members.$inferSelect;

// ─── Bookings (rittenkaart / proefles / losse les) ────────────────────────────
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  memberId: text("member_id"),
  classId: text("class_id"),
  className: text("class_name"),
  date: text("date"),
  time: text("time"),
  type: text("type"),
  isProefles: boolean("is_proefles").default(false),
  isLosseLes: boolean("is_losse_les").default(false),
  bookedAt: text("booked_at"),
});
export type Booking = typeof bookings.$inferSelect;

// ─── Reserveringen (via rooster) ──────────────────────────────────────────────
export const reserveringen = pgTable("reserveringen", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  classId: text("class_id"),
  classTitle: text("class_title"),
  dateStr: text("date_str"),
  time: text("time"),
  type: text("type"),
  aanwezig: boolean("aanwezig").default(false),
  notitie: text("notitie"),
  mailVerstuurd: boolean("mail_verstuurd").default(false),
  betaaldContant: boolean("betaald_contant").default(false),
  betaaldStripe: boolean("betaald_stripe").default(false),
  createdAt: text("created_at"),
});
export type Reservering = typeof reserveringen.$inferSelect;

// ─── Blog posts ───────────────────────────────────────────────────────────────
export const blogPosts = pgTable("blog_posts", {
  id: text("id").primaryKey(),
  slug: text("slug"),
  title: text("title"),
  category: text("category"),
  body: text("body"),
  publishedAt: text("published_at"),
  published: boolean("published").default(false),
  createdAt: text("created_at"),
});
export type BlogPost = typeof blogPosts.$inferSelect;

// ─── Blog comments ────────────────────────────────────────────────────────────
export const blogComments = pgTable("blog_comments", {
  id: text("id").primaryKey(),
  postId: text("post_id"),
  name: text("name"),
  email: text("email"),
  body: text("body"),
  createdAt: text("created_at"),
  approved: boolean("approved").default(false),
  reply: text("reply"),
  repliedAt: text("replied_at"),
});
export type BlogComment = typeof blogComments.$inferSelect;

// ─── Journal entries ─────────────────────────────────────────────────────────
export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey(),
  memberId: text("member_id"),
  memberName: text("member_name"),
  anonymous: boolean("anonymous").default(false),
  text: text("text"),
  createdAt: text("created_at"),
});
export type JournalEntry = typeof journalEntries.$inferSelect;

// ─── Events ───────────────────────────────────────────────────────────────────
export const events = pgTable("events", {
  id: text("id").primaryKey(),
  title: text("title"),
  date: text("date"),
  time: text("time"),
  description: text("description"),
  location: text("location"),
  createdAt: text("created_at"),
});
export type VillageEvent = typeof events.$inferSelect;

// ─── Tips ─────────────────────────────────────────────────────────────────────
export const tips = pgTable("tips", {
  id: text("id").primaryKey(),
  text: text("text"),
  emoji: text("emoji"),
  active: boolean("active").default(true),
  createdAt: text("created_at"),
});
export type Tip = typeof tips.$inferSelect;

// ─── Announcements (bevalberichten) ──────────────────────────────────────────
export const announcements = pgTable("announcements", {
  id: text("id").primaryKey(),
  type: text("type"),
  memberId: text("member_id"),
  memberName: text("member_name"),
  shareConsent: boolean("share_consent"),
  note: text("note"),
  createdAt: text("created_at"),
  seenByAdmin: boolean("seen_by_admin").default(false),
});
export type Announcement = typeof announcements.$inferSelect;

// ─── Requests (rittenkaart aanvragen) ────────────────────────────────────────
export const requests = pgTable("requests", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  package: text("package"),
  userId: text("user_id"),
  createdAt: text("created_at"),
  done: boolean("done").default(false),
});
export type RittenkaartRequest = typeof requests.$inferSelect;

// ─── Class types (lestypes) ───────────────────────────────────────────────────
export const classTypes = pgTable("class_types", {
  id: text("id").primaryKey(),
  naam: text("naam"),
  kleur: text("kleur"),
  proeflesGeldig: boolean("proefles_geldig"),
  actief: boolean("actief").default(true),
  intakeVereist: boolean("intake_vereist"),
  beschrijving: text("beschrijving"),
  locatie: text("locatie"),
  tijd: text("tijd"),
  boekingType: text("boeking_type"),
});
export type LesType = typeof classTypes.$inferSelect;

// ─── Classes (reeksen) ────────────────────────────────────────────────────────
export const classes = pgTable("classes", {
  id: text("id").primaryKey(),
  title: text("title"),
  time: text("time"),
  teacher: text("teacher"),
  spotsTotal: integer("spots_total"),
  description: text("description"),
  type: text("type"),
  dates: jsonb("dates").$type<string[]>(),
  stripeBetaling: boolean("stripe_betaling"),
  stripeBedrag: integer("stripe_bedrag"),
});
export type StudioClass = typeof classes.$inferSelect;

// ─── Settings (complex objects: tarieven, email_settings, pagina_teksten, reviews)
// Sla op als JSON blob — één rij per sleutel.
export const studioSettings = pgTable("studio_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

// ─── Assets (foto's en afbeeldingen — base64 of URL) ─────────────────────────
export const assets = pgTable("assets", {
  key: text("key").primaryKey(),
  data: text("data").notNull(),
});

// ─── Password reset tokens ────────────────────────────────────────────────────
export const passwordResetTokens = pgTable("password_reset_tokens", {
  token: text("token").primaryKey(),
  email: text("email").notNull(),
  expiresAt: text("expires_at").notNull(),
});
