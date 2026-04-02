const BASE_IMG = import.meta.env.BASE_URL.replace(/\/$/, "");

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt: string;
  category: string;
  mainImage?: { url: string; alt: string };
};

// ── Sanity verbinding ───────────────────────────────────────────────────────
// Vul in zodra je Sanity project klaar is:
const SANITY_PROJECT_ID = "";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2024-01-01";

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  if (!SANITY_PROJECT_ID) return [];

  const query = encodeURIComponent(
    `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      "excerpt": array::join(string::split(pt::text(body), "")[0..200], ""),
      "category": coalesce(categories[0]->title, "Inspiratie"),
      "mainImage": mainImage { "url": asset->url, alt }
    }`
  );

  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.result ?? [];
  } catch {
    return [];
  }
}

// ── Mock posts (zichtbaar totdat Sanity gekoppeld is) ──────────────────────
export const MOCK_POSTS: BlogPost[] = [
  {
    _id: "1",
    title: "Ademen tijdens de bevalling: zo gebruik je je adem als anker",
    slug: "ademen-bevalling",
    publishedAt: "2025-10-12",
    excerpt: "Je adem is het krachtigste gereedschap dat je hebt tijdens de bevalling. In elke les van zwangerschapsyoga oefenen we bewust met ademhaling — maar waarom is dat eigenlijk zo belangrijk?",
    category: "Geboortevoorbereiding",
    mainImage: { url: `${BASE_IMG}/images/hero-yoga.png`, alt: "Zwangerschapsyoga ademhaling" },
  },
  {
    _id: "2",
    title: "Waarom een mama circle zo helend is (ook als je denkt het niet nodig te hebben)",
    slug: "mama-circle-helend",
    publishedAt: "2025-10-05",
    excerpt: "Het moederschap kan ontzettend eenzaam aanvoelen, ook als je omringd bent door mensen. Herken je dat? In onze circle hoef je niets te presteren.",
    category: "Community",
    mainImage: { url: `${BASE_IMG}/images/hero-yoga.png`, alt: "Mama circle verbinding" },
  },
  {
    _id: "3",
    title: "5 zachte yogahoudingen voor het derde trimester",
    slug: "yoga-derde-trimester",
    publishedAt: "2025-09-28",
    excerpt: "In het derde trimester verandert je lichaam razendsnel. Je buik groeit, slapen wordt lastiger en je rugpijn neemt toe. Deze vijf houdingen geven je instant verlichting.",
    category: "Zwangerschapsyoga",
    mainImage: { url: `${BASE_IMG}/images/hero-yoga.png`, alt: "Yoga derde trimester" },
  },
  {
    _id: "4",
    title: "Het vierde trimester: wat niemand je vertelt over de periode ná de bevalling",
    slug: "vierde-trimester",
    publishedAt: "2025-09-15",
    excerpt: "Je hebt negen maanden gewacht op je baby, maar daarna begint er iets nieuws — een periode die net zo veel aandacht verdient als de zwangerschap zelf.",
    category: "Mama",
    mainImage: { url: `${BASE_IMG}/images/hero-yoga.png`, alt: "Vierde trimester" },
  },
  {
    _id: "5",
    title: "Bekenoefeningen: meer dan alleen Kegels",
    slug: "bekenoefeningen",
    publishedAt: "2025-09-03",
    excerpt: "Iedereen kent de Kegel-oefening. Maar een sterk en gezond bekken vraagt om meer dan aanspannen alleen. In zwangerschapsyoga werken we aan het volledige spectrum.",
    category: "Zwangerschapsyoga",
    mainImage: { url: `${BASE_IMG}/images/hero-yoga.png`, alt: "Bekenoefeningen yoga" },
  },
  {
    _id: "6",
    title: "Village bouwen: hoe Studio Luna een thuis wil zijn voor mama's in Zuidplas",
    slug: "village-studio-luna",
    publishedAt: "2025-08-20",
    excerpt: "Studio Luna begon met één idee: mama's zouden niet alleen moeten hoeven zijn. Lees het verhaal achter de studio en waarom community centraal staat in alles wat we doen.",
    category: "Over Studio Luna",
    mainImage: { url: `${BASE_IMG}/images/hero-yoga.png`, alt: "Studio Luna community" },
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Geboortevoorbereiding": "bg-accent/80 text-foreground",
  "Community": "bg-primary/20 text-primary",
  "Zwangerschapsyoga": "bg-primary/15 text-primary",
  "Mama": "bg-accent/60 text-foreground/80",
  "Over Studio Luna": "bg-secondary text-foreground/70",
};

export function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-secondary text-foreground/60";
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}
