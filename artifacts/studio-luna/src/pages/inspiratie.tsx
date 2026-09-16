import { useState, useEffect } from "react";
import { Link } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { CtaBlock } from "@/components/cta-block";
import { useAuth } from "@/hooks/use-auth";
import { usePageMeta } from "@/lib/seo";

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

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

function excerpt(body: string, max = 200) {
  const stripped = body?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ?? "";
  return stripped.length > max ? stripped.slice(0, max) + "…" : stripped;
}

export default function Inspiratie() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);

  usePageMeta({
    title: "Blog over zwangerschap en moederschap in Zuidplas | Studio Luna",
    description: "Artikelen van Studio Luna over zwangerschap, geboortevoorbereiding en moederschap, voor zwangeren en moeders in Nieuwerkerk aan den IJssel en de rest van Zuidplas.",
  });

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
        <div className="w-full max-w-7xl flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "70vh" }}>
          <h1 className="font-display text-3xl font-medium text-foreground mb-3">Binnenkort</h1>
          <p className="text-foreground/75 text-sm leading-relaxed max-w-xs">
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
      <div className="w-full max-w-7xl bg-background min-h-screen relative">

        {/* KOP: gewoon op de achtergrond, zonder gekleurd vlak */}
        <div className="px-7 md:px-14 lg:px-18 pt-14 md:pt-12 pb-10">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">Blog</h1>
          <p className="text-[15px] text-foreground/75 leading-[1.9] mt-4 max-w-xl">
            Ik neem je mee in mijn zoektocht over alles rondom zwangerschap, postpartum en het moederschap, waar ik gevoel en wetenschap allebei een plek geef.
          </p>
        </div>

        <div className="px-7 md:px-14 lg:px-18 pb-8">

          {/* Laden */}
          {!postsLoaded && (
            <div className="max-w-3xl space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-secondary/50 animate-pulse h-40" />
              ))}
            </div>
          )}

          {/* UITGELICHT: het nieuwste artikel groot, foto zonder donkere laag erover */}
          {postsLoaded && featured && (
            <article className="max-w-3xl pb-10 border-b border-border/25">
              <Link href={`/blog/${featured.slug || featured.id}`} className="group block">
                {featured.coverImage && (
                  <div className="w-full overflow-hidden mb-6" style={{ aspectRatio: "16/9" }}>
                    <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <p className="text-sm text-foreground/60">
                  <span className="text-primary">{featured.category}</span> · {formatDate(featured.publishedAt)}
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-[1.15] mt-2 group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="text-[15px] text-foreground/80 leading-[1.9] mt-3">{excerpt(featured.body)}</p>
              </Link>
            </article>
          )}

          {/* DE REST: een lijst in één kolom met dunne lijnen */}
          {postsLoaded && rest.length > 0 && (
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl font-medium text-foreground mt-12 mb-2">Meer lezen</h2>
              {rest.map((post) => (
                <article key={post.id} className="py-6 border-b border-border/25">
                  <Link href={`/blog/${post.slug || post.id}`} className="group grid grid-cols-[6.5rem_1fr] md:grid-cols-[10rem_1fr] gap-5 md:gap-7 items-start">
                    <div className="w-full overflow-hidden bg-secondary/50" style={{ aspectRatio: "4/5" }}>
                      {post.coverImage && (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">
                        <span className="text-primary">{post.category}</span> · {formatDate(post.publishedAt)}
                      </p>
                      <h3 className="font-display text-xl md:text-2xl font-medium text-foreground leading-snug mt-1.5 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-[15px] text-foreground/75 leading-[1.8] mt-2 hidden md:block">
                        {excerpt(post.body, 160)}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

        </div>

        <CtaBlock />
        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
