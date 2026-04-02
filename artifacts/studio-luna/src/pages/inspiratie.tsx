import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { motion } from "framer-motion";
import { fetchBlogPosts, MOCK_POSTS, categoryColor, formatDate, type BlogPost } from "@/lib/sanity";
import { useAuth } from "@/hooks/use-auth";

export default function Inspiratie() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>(MOCK_POSTS);

  useEffect(() => {
    if (!user?.isAdmin) return;
    fetchBlogPosts()
      .then((data) => { if (data.length > 0) setPosts(data); })
      .catch(() => {});
  }, [user]);

  if (loading) return null;

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background pb-28 flex justify-center">
        <div className="w-full max-w-5xl flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "70vh" }}>
          <span className="text-5xl mb-6">🌙</span>
          <h1 className="font-display text-3xl font-medium text-foreground mb-3">Binnenkort</h1>
          <p className="text-foreground/55 text-sm leading-relaxed max-w-xs">
            Hier vind je straks verhalen, tips en inzichten over zwangerschap, yoga en het leven als mama.
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
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-tight">Inspiratie</h1>
            <p className="text-foreground/55 mt-2 text-sm leading-relaxed max-w-md">
              Verhalen, inzichten en tips over zwangerschap, yoga en het leven als mama.
            </p>
          </motion.div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-8 pb-8">

          {/* UITGELICHT — eerste artikel groot */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="group mb-8 cursor-pointer"
            >
              <div className="relative w-full overflow-hidden rounded-3xl bg-secondary shadow-sm">
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <img
                    src={featured.mainImage?.url ?? ""}
                    alt={featured.mainImage?.alt ?? featured.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 ${categoryColor(featured.category)}`}>
                      {featured.category}
                    </span>
                    <h2 className="font-display text-xl md:text-2xl font-medium text-white leading-snug">
                      {featured.title}
                    </h2>
                    <p className="text-white/70 text-xs mt-1">{formatDate(featured.publishedAt)}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground/65 leading-relaxed mt-4 px-1">
                {featured.excerpt}
              </p>
            </motion.div>
          )}

          {/* DIVIDER */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border/30" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Meer lezen</span>
            <div className="flex-1 h-px bg-border/30" />
          </div>

          {/* CARD GRID — 2 kolommen mobiel, 3 desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {rest.map((post, i) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative w-full overflow-hidden rounded-2xl bg-secondary shadow-sm mb-3" style={{ paddingTop: "125%" }}>
                  <img
                    src={post.mainImage?.url ?? ""}
                    alt={post.mainImage?.alt ?? post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${categoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <p className="text-[10px] text-foreground/40 mb-1">{formatDate(post.publishedAt)}</p>
                  <h3 className="font-display text-sm md:text-base font-medium text-foreground leading-snug line-clamp-3 group-hover:text-primary transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-xs text-foreground/55 leading-relaxed mt-1.5 line-clamp-2 hidden md:block">
                    {post.excerpt}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>

          {/* SANITY KOPPELING BANNER */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mt-10 rounded-3xl border border-dashed border-border/50 bg-secondary/50 px-6 py-5 text-center"
          >
            <p className="text-xs font-semibold text-foreground/40 uppercase tracking-widest mb-1">CMS Klaar</p>
            <p className="text-sm text-foreground/55">
              Deze pagina is voorbereid voor koppeling met Sanity.io. Zodra je projectcode invult in{" "}
              <code className="text-xs bg-background px-1.5 py-0.5 rounded text-foreground/60">src/lib/sanity.ts</code>,
              worden bovenstaande artikelen automatisch vervangen door jouw echte content.
            </p>
          </motion.div>

        </div>

        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
