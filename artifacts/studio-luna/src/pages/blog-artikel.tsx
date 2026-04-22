import { useState, useEffect, useRef } from "react";
import { Link, useRoute } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";

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

export default function BlogArtikel() {
  const [, params] = useRoute("/blog/:id");
  const id = params?.id;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
          <Link href="/blog" className="mt-4 text-sm text-primary font-semibold hover:text-primary/70 transition-colors">← Terug naar Blog</Link>
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
            className="inline-flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Blog
          </Link>
        </div>

        {/* Cover foto */}
        {post.coverImage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mx-6 md:mx-12 rounded-3xl overflow-hidden mb-8"
            style={{ aspectRatio: "16/9" }}
          >
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
          </motion.div>
        )}

        {/* Header: categorie + titel + datum */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
          className="px-6 md:px-12 mb-8"
        >
          <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 ${categoryColor(post.category)}`}>
            {post.category}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground leading-tight mb-3">
            {post.title}
          </h1>
          <p className="text-sm text-foreground/40">{formatDate(post.publishedAt)}</p>
        </motion.div>

        {/* Scheidingslijn */}
        <div className="mx-6 md:mx-12 h-px bg-border/30 mb-8" />

        {/* Artikel tekst */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="px-6 md:px-12 pb-12"
        >
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/70 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Terug naar Blog
            </Link>
          </div>

          {/* ── REACTIES SECTIE ── */}
          <div className="mt-14">
            <h2 className="font-display text-xl font-medium text-foreground mb-6">
              {comments.length > 0 ? `Reacties (${comments.length})` : "Reacties"}
            </h2>

            {/* Bestaande reacties */}
            {comments.length > 0 && (
              <div className="space-y-5 mb-10">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="bg-secondary/60 rounded-2xl px-5 py-4">
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
                      <div className="ml-6 bg-primary/8 border-l-2 border-primary/25 rounded-r-2xl px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Studio Luna</p>
                        <p className="text-sm text-foreground/70 leading-relaxed">{comment.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reactieformulier */}
            <div className="border border-border/25 rounded-3xl p-5 md:p-6">
              <p className="font-display text-base font-medium text-foreground mb-4">Laat een reactie achter</p>
              {formDone ? (
                <div className="bg-primary/8 rounded-2xl px-5 py-4 text-center">
                  <p className="text-sm font-medium text-primary">Bedankt voor je reactie!</p>
                  <p className="text-xs text-foreground/50 mt-1">Je reactie wordt zichtbaar na goedkeuring.</p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={submitComment} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Jouw naam"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full bg-secondary border-0 rounded-xl px-4 py-3 text-sm placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <textarea
                    placeholder="Schrijf je reactie..."
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-secondary border-0 rounded-xl px-4 py-3 text-sm placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed"
                  />
                  {formError && <p className="text-xs text-red-500">{formError}</p>}
                  <button
                    type="submit"
                    disabled={formSending}
                    className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {formSending ? "Versturen..." : "Reactie plaatsen"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>

        <BottomNav />
      </div>
    </div>
  );
}
