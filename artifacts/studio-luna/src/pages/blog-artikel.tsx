import { useState, useEffect, useRef } from "react";
import { Link, useRoute } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { CtaBlock } from "@/components/cta-block";
import { usePageMeta } from "@/lib/seo";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  body: string;
  publishedAt: string;
  coverImage: string;
};

type BlogComment = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
  reply?: string;
  repliedAt?: string;
};

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogArtikel() {
  const [, params] = useRoute("/blog/:id");
  const id = params?.id;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Zonder eigen titel hield elk artikel de titel en omschrijving van de
  // homepage; daarmee was het voor zoekmachines onvindbaar.
  usePageMeta({
    title: post ? `${post.title} | Blog Studio Luna` : "Blog | Studio Luna",
    description: post ? `${post.title}. Een artikel uit het blog van Studio Luna over zwangerschap en moederschap in Zuidplas.` : undefined,
    jsonLd: post ? [{
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      datePublished: post.publishedAt || undefined,
      author: { "@type": "Person", name: "Marjolein" },
      publisher: { "@type": "Organization", name: "Studio Luna", url: "https://www.studiolunazuidplas.nl/" },
      mainEntityOfPage: `https://www.studiolunazuidplas.nl/blog/${post.slug || post.id}`,
    }] : undefined,
  });

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [formName, setFormName] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formSending, setFormSending] = useState(false);
  const [formDone, setFormDone] = useState(false);
  const [formError, setFormError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${BASE}/api/blog/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setPost(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    fetch(`${BASE}/api/blog/${id}/comments`)
      .then((r) => r.ok ? r.json() : [])
      .then(setComments)
      .catch(() => {});
  }, [id]);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBody.trim()) return;
    setFormSending(true); setFormError("");
    try {
      const res = await fetch(`${BASE}/api/blog/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, body: formBody }),
      });
      if (res.ok) {
        setFormDone(true); setFormName(""); setFormBody("");
      } else {
        const data = await res.json();
        setFormError(data.error ?? "Er ging iets mis.");
      }
    } catch {
      setFormError("Kan geen verbinding maken.");
    }
    setFormSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
        <div className="w-full max-w-2xl px-6 md:px-12 pt-14">
          <div className="h-6 w-24 bg-secondary rounded-xl animate-pulse mb-8" />
          <div className="h-10 w-3/4 bg-secondary rounded-xl animate-pulse mb-4" />
          <div className="h-64 w-full bg-secondary rounded-3xl animate-pulse mb-8" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-4 bg-secondary rounded-lg animate-pulse" style={{ width: `${85 - i * 7}%` }} />)}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background pb-28 flex justify-center">
        <div className="w-full max-w-2xl flex flex-col items-center justify-center px-8 text-center" style={{ minHeight: "70vh" }}>
          <p className="font-display text-3xl font-medium text-foreground mb-3">Artikel niet gevonden</p>
          <Link href="/blog" className="mt-4 text-sm text-primary font-semibold border-b border-primary/35 pb-0.5 hover:border-primary">Terug naar het blog</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const isHtml = (s: string) => /^<[a-z][\s\S]*>/i.test(s.trimStart());
  const paragraphs = post.body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-2xl bg-background min-h-screen">

        {/* Terug-knop */}
        <div className="px-6 md:px-12 pt-12 md:pt-10 pb-6">
          <Link href="/blog"
            className="text-sm text-foreground/60 border-b border-foreground/25 pb-0.5 hover:text-foreground hover:border-foreground transition-colors">
            Alle artikelen
          </Link>
        </div>

        {/* Cover foto */}
        {post.coverImage && (
          <div className="mx-6 md:mx-12 overflow-hidden mb-8" style={{ aspectRatio: "16/9" }}>
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}

        {/* Header: categorie + titel + datum */}
        <div className="px-6 md:px-12 mb-8">
          <p className="text-sm text-primary mb-2">{post.category}</p>
          <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-tight mb-3">
            {post.title}
          </h1>
          <p className="text-sm text-foreground/55">{formatDate(post.publishedAt)}</p>
        </div>

        {/* Scheidingslijn */}
        <div className="mx-6 md:mx-12 h-px bg-border/30 mb-8" />

        {/* Artikel tekst */}
        <div className="px-6 md:px-12 pb-12">
          <div className="blog-content">
            {isHtml(post.body)
              ? <div dangerouslySetInnerHTML={{ __html: post.body }} />
              : paragraphs.map((para, i) => (
                  <p key={i} className="text-[15px] text-foreground/80 leading-[1.85] font-light">
                    {para}
                  </p>
                ))
            }
          </div>

          {/* Terug-knop onderaan */}
          <div className="mt-12 pt-8 border-t border-border/20">
            <Link href="/blog"
              className="text-sm font-semibold text-primary border-b border-primary/35 pb-0.5 hover:border-primary transition-colors">
              Terug naar het blog
            </Link>
          </div>

          {/* Blogs zijn binnenkomers via Google en Instagram; zonder dit blok
              eindigde een artikel als dood spoor zonder weg naar de reeks. */}
          <div className="mt-10">
            <CtaBlock inKolom />
          </div>

          {/* ── REACTIES SECTIE ── */}
          <div className="mt-14">
            <h2 className="font-display text-xl font-medium text-foreground mb-6">
              {comments.length > 0 ? `Reacties (${comments.length})` : "Reacties"}
            </h2>

            {/* Bestaande reacties */}
            {comments.length > 0 && (
              <div className="mb-10 border-t border-border/25">
                {comments.map((comment) => (
                  <div key={comment.id} className="py-5 border-b border-border/25">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-foreground">{comment.name}</span>
                        <span className="text-xs text-foreground/35">·</span>
                        <span className="text-xs text-foreground/35">
                          {new Date(comment.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/75 leading-relaxed">{comment.body}</p>
                    </div>
                    {comment.reply && (
                      <div className="ml-6 mt-3">
                        <p className="text-sm font-semibold text-primary mb-1">Studio Luna</p>
                        <p className="text-sm text-foreground/70 leading-relaxed">{comment.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reactieformulier */}
            <div>
              <p className="font-display text-base font-medium text-foreground mb-4">Laat een reactie achter</p>
              {formDone ? (
                <div>
                  <p className="text-sm font-medium text-primary">Bedankt voor je reactie!</p>
                  <p className="text-sm text-foreground/60 mt-1">Je reactie wordt zichtbaar na goedkeuring.</p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={submitComment} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Jouw naam"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full bg-card border border-border/40 rounded-[6px] px-4 py-3 text-sm placeholder:text-foreground/55"
                  />
                  <textarea
                    placeholder="Schrijf je reactie..."
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-card border border-border/40 rounded-[6px] px-4 py-3 text-sm placeholder:text-foreground/55 resize-none leading-relaxed"
                  />
                  {formError && <p className="text-xs text-red-500">{formError}</p>}
                  <button
                    type="submit"
                    disabled={formSending}
                    className="inline-flex items-center bg-primary text-primary-foreground rounded-[6px] px-6 py-3 text-sm font-semibold hover:bg-primary/88 transition-colors disabled:opacity-60"
                  >
                    {formSending ? "Versturen..." : "Reactie plaatsen"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
