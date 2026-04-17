import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Props = {
  ctaUrl?: string;
  ctaLabel?: string;
};

export function CtaBlock({ ctaUrl: propUrl, ctaLabel: propLabel }: Props = {}) {
  const [, navigate] = useLocation();
  const [ctaUrl, setCtaUrl] = useState(propUrl ?? "/rooster");
  const [ctaLabel, setCtaLabel] = useState(propLabel ?? "Reserveer jouw plekje");

  useEffect(() => {
    if (propUrl && propLabel) return; // already provided by parent
    fetch(`${BASE}/api/pagina-teksten`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!propUrl && d?.cta_url) setCtaUrl(d.cta_url);
        if (!propLabel && d?.cta_label) setCtaLabel(d.cta_label);
      })
      .catch(() => {});
  }, [propUrl, propLabel]);

  return (
    <section className="mx-5 md:mx-8 lg:mx-12 mb-10 md:mb-14">
      <motion.div
        initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="rounded-3xl bg-primary px-8 md:px-14 py-11 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55 mb-2">Studio Luna</p>
          <p className="font-display text-2xl md:text-3xl font-medium text-white leading-snug">
            Klaar om te beginnen?
          </p>
        </div>
        <button
          onClick={() => navigate(ctaUrl)}
          className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-2xl font-semibold text-sm hover:bg-white/92 shadow-md group transition-colors shrink-0"
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </motion.div>
    </section>
  );
}
