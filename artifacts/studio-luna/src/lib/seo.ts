import { useEffect } from "react";

const CANONICAL_BASE = "https://www.studiolunazuidplas.nl";

function zetMeta(selector: string, maak: () => HTMLMetaElement, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = maak();
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function zetNamedMeta(name: string, content: string) {
  zetMeta(`meta[name='${name}']`, () => {
    const t = document.createElement("meta");
    t.setAttribute("name", name);
    return t;
  }, content);
}

function zetOgMeta(property: string, content: string) {
  zetMeta(`meta[property='${property}']`, () => {
    const t = document.createElement("meta");
    t.setAttribute("property", property);
    return t;
  }, content);
}

/**
 * Zet per pagina de titel, meta description, de og-tags voor deelvoorvertoningen
 * en (optioneel) JSON-LD structured data. De JSON-LD wordt bij het verlaten van
 * de pagina weer opgeruimd; de canonical wordt al per route gezet in App.tsx.
 */
export function usePageMeta(opts: { title: string; description?: string; jsonLd?: object[] }) {
  const { title, description, jsonLd } = opts;

  useEffect(() => {
    document.title = title;
    zetOgMeta("og:title", title);
    const pad = window.location.pathname.replace(/\/$/, "");
    zetOgMeta("og:url", `${CANONICAL_BASE}${pad || "/"}`);
    if (description) {
      zetNamedMeta("description", description);
      zetOgMeta("og:description", description);
    }
    // De voorgerenderde schil draagt eigen structured data voor crawlers
    // zonder JavaScript; zodra de pagina echt draait neemt deze hook het
    // over, dus de schil-versie moet weg om dubbele blokken te voorkomen.
    document.querySelectorAll("script[data-shell-jsonld]").forEach((s) => s.remove());
  }, [title, description]);

  useEffect(() => {
    if (!jsonLd || jsonLd.length === 0) return;
    const scripts = jsonLd.map((data) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-page-jsonld", "true");
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
      return script;
    });
    return () => {
      scripts.forEach((s) => s.remove());
    };
    // Ook bijwerken wanneer de data pas na het laden binnenkomt,
    // zoals bij een blogartikel dat eerst opgehaald moet worden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(jsonLd ?? null)]);
}
