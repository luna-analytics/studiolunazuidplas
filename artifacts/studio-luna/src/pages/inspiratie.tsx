import { useState, useEffect } from "react";
import { Link } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  body: string;
  publishedAt: string;
  published: boolean;
  coverImage: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  "Geboortevoorbereiding": "bg-accent/80 text-foreground",
  "Community": "bg-primary/20 text-primary",
  "Zwangerschapsyoga": "bg-primary/15 text-primary",
  "Mama": "bg-accent/60 text-foreground/80",
  "Over Studio Luna": "bg-secondary text-foreground/70",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-secondary text-foreground/60";
}

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

function excerpt(body: string, max = 200) {
  const clean = body?.replace(/\n+/g, " ").trim() ?? "";
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

export default function Inspiratie() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);

  useEffect(() => {
    const endpoint = user?.isAdmin
      ? `${BASE}/api/admin/blog`
      : `${BASE}/api/blog`;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (user?.isAdmin) {
      const token = localStorage.getItem("studio_luna_token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(endpoint, { headers })
      .then((r) => r.ok ? r.json() : [])
      .then((data: BlogPost[]) => {
        if (user?.isAdmin) {
          setPosts(data.filter((p) => p.published));
        } else {
          setPosts(data);
        }
      })
      .catch(() => {})
      .finally(() => setPostsLoaded(true));
  }, [user]);

  if (loading) return null;

  // Niet ingelogd + geen gepubliceerde posts → Binnenkort scherm
  if (!loading && postsLoaded && posts.length === 0 && !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background pb-28 flex justify-center">
        <div className="w-full max-w-5xl flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "70vh" }}>
          <span className="text-5xl mb-6">🌙</span>
          <h1 className="font-display text-3xl font-medium text-foreground mb-3">Binnenkort</h1>
          <p className="text-foreground/55 text-sm leading-relaxed max-w-xs">
            Ik neem je mee in mijn zoektocht over alles rondom zwangerschap, postpartum en het moederschap, waar ik gevoel en wetenschap allebei een plek geef.
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        {/* HEADER */}
        <div className="px-6 md:px-12 lg:px-16 pt-14 md:pt-12 pb-10 bg-secondary md:rounded-3xl md:mx-6 md:mt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Studio Luna</p>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-tight">Blog</h1>
            <p className="text-foreground/55 mt-2 text-sm leading-relaxed max-w-md">
              Ik neem je mee in mijn zoektocht over alles rondom zwangerschap, postpartum en het moederschap, waar ik gevoel en wetenschap allebei een plek geef.
            </p>
          </motion.div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-8 pb-8">

          {/* Laden staat */}
          {!postsLoaded && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl bg-secondary animate-pulse h-48" />
              ))}
            </div>
          )}

          {/* UITGELICHT — eerste artikel groot */}
          {postsLoaded && featured && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="group mb-8"
            >
              <Link href={`/blog/${featured.slug || featured.id}`} className="block cursor-pointer">
              <div className="relative w-full overflow-hidden rounded-3xl bg-secondary shadow-sm">
                {featured.coverImage ? (
                  <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 ${categoryColor(featured.category)}`}>
                        {featured.category}
                      </span>
                      <h2 className="font-display text-xl md:text-2xl font-medium text-white leading-snug">{featured.title}</h2>
                      <p className="text-white/70 text-xs mt-1">{formatDate(featured.publishedAt)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-7 md:p-10">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 ${categoryColor(featured.category)}`}>
                      {featured.category}
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground leading-snug mb-1">{featured.title}</h2>
                    <p className="text-foreground/40 text-xs mb-3">{formatDate(featured.publishedAt)}</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-foreground/65 leading-relaxed mt-4 px-1">{excerpt(featured.body)}</p>
              </Link>
            </motion.div>
          )}

          {/* DIVIDER */}
          {postsLoaded && rest.length > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Meer lezen</span>
              <div className="flex-1 h-px bg-border/30" />
            </div>
          )}

          {/* CARD GRID */}
          {postsLoaded && rest.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {rest.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="group flex flex-col"
                >
                  <Link href={`/blog/${post.slug || post.id}`} className="flex flex-col flex-1 cursor-pointer">
                  <div className="relative w-full overflow-hidden rounded-2xl bg-secondary shadow-sm mb-3" style={{ paddingTop: "125%" }}>
                    {post.coverImage
                      ? <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      : <div className="absolute inset-0 flex items-end p-3">
                          <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${categoryColor(post.category)}`}>{post.category}</span>
                        </div>
                    }
                    {post.coverImage && (
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${categoryColor(post.category)}`}>{post.category}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-[10px] text-foreground/40 mb-1">{formatDate(post.publishedAt)}</p>
                    <h3 className="font-display text-sm md:text-base font-medium text-foreground leading-snug line-clamp-3 group-hover:text-primary transition-colors duration-200">
                      {post.title}
                    </h3>
                    <p className="text-xs text-foreground/55 leading-relaxed mt-1.5 line-clamp-2 hidden md:block">
                      {excerpt(post.body, 120)}
                    </p>
                  </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}

        </div>

        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
