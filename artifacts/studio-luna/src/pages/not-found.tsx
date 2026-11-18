import { Link } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { usePageMeta } from "@/lib/seo";

// Tot 18 november 2026 stond hier de Engelse sjabloonpagina ("404 Page Not
// Found, did you forget to add the page to the router?"). Nu een gewone pagina
// in de huisstijl, met noindex zodat Google een verkeerd adres niet opneemt.
export default function NotFound() {
  usePageMeta({ title: "Pagina niet gevonden | Studio Luna", robots: "noindex, nofollow" });

  const routes = [
    { href: "/", tekst: "De homepage" },
    { href: "/geboortereeks", tekst: "De Geboortereeks, zwangerschapsyoga en geboortevoorbereiding" },
    { href: "/zwangerschapsmassage", tekst: "Zwangerschapsmassage en postpartummassage" },
    { href: "/geboortezorg-zuidplas", tekst: "De Geboortezorgkaart Zuidplas" },
    { href: "/aanbod", tekst: "Aanbod en tarieven" },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-7xl bg-background min-h-screen relative overflow-x-hidden">
        <div className="px-7 md:px-14 lg:px-20 xl:px-28 pt-14 md:pt-12 pb-10 max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1]">
            Deze pagina bestaat niet
          </h1>
          <p className="text-[15px] text-foreground/80 leading-[1.7] mt-4">
            Het adres klopt niet meer of is verkeerd getypt. Dit zijn de pagina's die er wel zijn:
          </p>
          <div className="mt-6">
            {routes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="block py-2.5 border-b border-border/15 text-[15px] text-primary font-semibold hover:text-primary/75"
              >
                {r.tekst}
              </Link>
            ))}
          </div>
        </div>
        <SeoFooter />
        <BottomNav />
      </div>
    </div>
  );
}
