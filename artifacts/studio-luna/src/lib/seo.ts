import { useEffect } from "react";

/**
 * Zet per pagina de titel, meta description en (optioneel) JSON-LD structured data.
 * De JSON-LD wordt bij het verlaten van de pagina weer opgeruimd.
 */
export function usePageMeta(opts: { title: string; description?: string; jsonLd?: object[] }) {
  const { title, description, jsonLd } = opts;

  useEffect(() => {
    document.title = title;

    if (description) {
      let tag = document.querySelector<HTMLMetaElement>("meta[name='description']");
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
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
    // De structured data verandert alleen bij paginawissel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
