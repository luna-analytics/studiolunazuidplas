import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { LogOut, LogIn, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlgemeneVoorwaardenModal } from "./algemene-voorwaarden-modal";
import { PrivacyverklaringModal } from "./privacyverklaring-modal";
import { LoginModal } from "./login-modal";
import { useAuth } from "@/hooks/use-auth";

// Zolang het boekingssysteem uit staat, tonen we bezoekers geen Inloggen-knop;
// wie al ingelogd is (de beheerder) ziet de eigen naam en kan uitloggen.
// Admin blijft bereikbaar via lang indrukken van het logo of /admin.
const TOON_LOGIN = false;

// Het menu in groepen (haar besluit van 26 oktober): Zwanger, Postpartum en
// Events klappen uit, Zorgkaart is een los item, Blog en Over mij staan rechts.
// Het menu-item voor /geboortereeks heet nog steeds Zwangerschapsyoga (haar
// vaste keuze van 30 augustus en 14 oktober), nu binnen de groep Zwanger.
// Een onderdeel zonder href is "in opbouw": er is nog geen pagina of datum.
type Onderdeel = { label: string; noot?: string; href?: string };
type Groep = { id: string; label: string; onderdelen: Onderdeel[] };

const GROEPEN: Groep[] = [
  {
    id: "zwanger",
    label: "Zwanger",
    onderdelen: [
      { label: "Zwangerschapsyoga", noot: "De Geboortereeks van acht weken", href: "/geboortereeks" },
      { label: "Zwangerschapsmassage" },
    ],
  },
  {
    id: "postpartum",
    label: "Postpartum",
    onderdelen: [
      { label: "Mama-en-babyyoga", noot: "Na de Geboortereeks, als alle kindjes geboren zijn", href: "/geboortereeks#mama-en-babyyoga" },
      { label: "Postpartummassage" },
    ],
  },
  {
    id: "events",
    label: "Events",
    onderdelen: [
      { label: "Alle events", href: "/events" },
      { label: "Bijeenkomsten voor zwangeren en moeders" },
      { label: "Workshops van experts" },
    ],
  },
];

// Haar eigen woorden (26 oktober), onder elke groep met iets in opbouw.
const IN_OPBOUW_TEKST = "Studio Luna is het aanbod aan het uitbouwen, en langzaamaan komen er steeds meer activiteiten.";
const OP_DE_HOOGTE_MAIL = "mailto:info@studiolunazuidplas.nl?subject=Houd%20me%20op%20de%20hoogte%20van%20het%20nieuwe%20aanbod";

// Losse items: Zorgkaart staat in het midden, Blog en Over mij rechts.
const ZORGKAART = { href: "/geboortezorg-zuidplas", label: "Zorgkaart" };
const RECHTS = [
  { href: "/blog", label: "Blog" },
  { href: "/over-mij", label: "Over mij" },
];

// De balk onderin op mobiel blijft zoals hij was; Blog en Over mij en de
// groepen staan in het menu achter de knop Menu.
const BALK = [
  { href: "/", kort: "Studio Luna" },
  { href: "/geboortereeks", kort: "Yoga" },
  { href: "/events", kort: "Events" },
  { href: "/geboortezorg-zuidplas", kort: "Zorgkaart" },
];

// Hoort deze pagina bij dit menu-item? Op het begin van het pad, zodat een
// zorgkaartcategorie bij Zorgkaart hoort en een blogartikel bij Blog.
function hoortBij(location: string, href: string) {
  if (href === "/") return location === "/";
  if (href === "/geboortezorg-zuidplas") {
    return location.startsWith("/geboortezorg-zuidplas") || location.startsWith("/zwanger-in-");
  }
  return location === href || location.startsWith(href + "/");
}

function groepIsActief(location: string, groep: Groep) {
  return groep.onderdelen.some((o) => o.href && !o.href.includes("#") && hoortBij(location, o.href));
}

// wouter scrolt niet naar een anker; staat je al op die pagina, dan doen we
// het hier. Bij een andere pagina regelt ScrollToTop in App.tsx het.
function naarAnker(href: string) {
  const [pad, anker] = href.split("#");
  if (!anker || window.location.pathname !== pad) return;
  setTimeout(() => document.getElementById(anker)?.scrollIntoView({ block: "start" }), 0);
}

function InOpbouw({ klein }: { klein?: boolean }) {
  return (
    <span className={cn("text-primary/80 whitespace-nowrap", klein ? "text-[12px]" : "text-[12px] ml-2")}>
      in opbouw
    </span>
  );
}

function GroepPaneel({ groep, open, onKies }: { groep: Groep; open: boolean; onKies: () => void }) {
  const heeftOpbouw = groep.onderdelen.some((o) => !o.href);
  return (
    <div
      id={`menu-${groep.id}`}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[19rem] transition-[opacity,visibility] duration-200 motion-reduce:transition-none",
        open ? "opacity-100 visible" : "opacity-0 invisible",
      )}
    >
      <div className="bg-background border border-border/60 rounded-[6px] px-5 py-3">
        <ul>
          {groep.onderdelen.map((o) => (
            <li key={o.label} className="py-2.5 border-b border-border/30 last:border-b-0">
              {o.href ? (
                <Link
                  href={o.href}
                  onClick={() => { onKies(); naarAnker(o.href!); }}
                  className="block group"
                >
                  <span className="font-display text-[17px] text-foreground underline-offset-4 decoration-[1px] group-hover:underline">
                    {o.label}
                  </span>
                  {o.noot && <span className="block text-[13px] text-foreground/75 mt-0.5 leading-snug">{o.noot}</span>}
                </Link>
              ) : (
                <p className="font-display text-[17px] text-foreground/80 leading-snug">
                  {o.label}
                  <InOpbouw />
                </p>
              )}
            </li>
          ))}
        </ul>
        {heeftOpbouw && (
          <div className="pt-3 mt-1 border-t border-border/30">
            <p className="text-[13px] text-foreground/75 leading-relaxed">{IN_OPBOUW_TEKST}</p>
            <a
              href={OP_DE_HOOGTE_MAIL}
              className="inline-block mt-2 py-1 text-[13px] text-foreground border-b border-foreground/35 hover:border-foreground"
            >
              Houd me op de hoogte
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function BottomNav() {
  const [location, navigate] = useLocation();
  const [avOpen, setAvOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroep, setOpenGroep] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sluitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const laatsteAanwijzer = useRef<string>("");
  const navRef = useRef<HTMLElement | null>(null);
  const menuKnopRef = useRef<HTMLButtonElement | null>(null);
  const sluitKnopRef = useRef<HTMLButtonElement | null>(null);

  const firstName = user?.name?.split(" ")[0] ?? "";

  const handleLogout = () => { logout(); setUserMenuOpen(false); };

  const startLongPress = useCallback(() => {
    longPressTimer.current = setTimeout(() => navigate("/admin"), 1500);
  }, [navigate]);
  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  // Uitklappen: met de muis bij hover (met een korte vertraging bij het
  // weggaan, zodat je het paneel kunt bereiken), met klik, tik of toets altijd.
  const openMet = (id: string) => {
    if (sluitTimer.current) clearTimeout(sluitTimer.current);
    setOpenGroep(id);
  };
  // Sluit alleen deze groep; is er intussen een andere open, dan blijft die.
  const sluitStraks = (id: string) => {
    if (sluitTimer.current) clearTimeout(sluitTimer.current);
    sluitTimer.current = setTimeout(() => setOpenGroep((g) => (g === id ? null : g)), 180);
  };

  // Bij een andere pagina gaat alles dicht.
  useEffect(() => { setOpenGroep(null); setMenuOpen(false); }, [location]);

  // Escape en klikken buiten het menu sluiten het uitklapblok.
  useEffect(() => {
    if (!openGroep) return;
    const opToets = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const knop = document.getElementById(`knop-${openGroep}`);
      setOpenGroep(null);
      knop?.focus();
    };
    const opKlik = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroep(null);
    };
    document.addEventListener("keydown", opToets);
    document.addEventListener("pointerdown", opKlik);
    return () => {
      document.removeEventListener("keydown", opToets);
      document.removeEventListener("pointerdown", opKlik);
    };
  }, [openGroep]);

  // Mobiel menu: Escape sluit, de focus gaat naar de sluitknop en daarna
  // terug naar de knop Menu.
  useEffect(() => {
    if (!menuOpen) return;
    const opToets = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", opToets);
    const t = setTimeout(() => sluitKnopRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", opToets);
      clearTimeout(t);
      menuKnopRef.current?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  const isMenuActive = !BALK.some((b) => hoortBij(location, b.href));

  const linkKlasse = (actief: boolean) =>
    cn("px-2.5 lg:px-3 py-2 text-sm font-medium transition-colors underline-offset-[10px] decoration-[1.5px] whitespace-nowrap",
      actief ? "text-foreground underline decoration-primary" : "text-foreground/75 hover:text-foreground");

  return (
    <>
      {/* ── DESKTOP TOP NAV ── scrolt mee met de pagina; via een portal in body,
          zodat absolute positionering altijd bovenaan het document uitkomt,
          waar de component ook in de pagina staat. */}
      {createPortal(
      <div className="hidden md:flex absolute top-0 left-0 right-0 z-40 bg-background border-b border-border/30 h-16 items-center px-5 lg:px-8">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 select-none shrink-0"
            onMouseDown={startLongPress} onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress} onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress} onTouchCancel={cancelLongPress}>
            {/* Kleine webp van 4 KB; het originele logo van een halve megabyte
                werd op elke pagina gedownload, ook op mobiel waar het niet
                eens zichtbaar is. */}
            <img src={`/images/studio-luna-logo-klein.webp`} alt="Studio Luna" className="h-10 w-auto shrink-0" />
            {/* De naam pas vanaf 1024 px; op een iPad rechtop past hij niet
                naast het menu. */}
            <span className="hidden lg:inline font-display text-[19px] font-medium text-foreground leading-none">Studio Luna</span>
          </Link>
          <nav ref={navRef} aria-label="Hoofdmenu" className="flex items-center">
            <ul className="flex items-center gap-0.5 lg:gap-1">
              {GROEPEN.map((groep) => {
                const open = openGroep === groep.id;
                const actief = groepIsActief(location, groep);
                return (
                  <li key={groep.id} className="relative"
                    onPointerEnter={(e) => { if (e.pointerType === "mouse") openMet(groep.id); }}
                    onPointerLeave={(e) => { if (e.pointerType === "mouse") sluitStraks(groep.id); }}
                    onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) sluitStraks(groep.id); }}
                  >
                    <button
                      id={`knop-${groep.id}`}
                      type="button"
                      aria-expanded={open}
                      aria-controls={`menu-${groep.id}`}
                      onPointerDown={(e) => { laatsteAanwijzer.current = e.pointerType; }}
                      onClick={() => {
                        // Met de muis staat het paneel al open door de hover;
                        // een klik moet het dan niet weer dichtdoen.
                        if (laatsteAanwijzer.current === "mouse") openMet(groep.id);
                        else if (open) setOpenGroep(null);
                        else openMet(groep.id);
                        laatsteAanwijzer.current = "";
                      }}
                      className={cn(linkKlasse(actief), "inline-flex items-center gap-1")}
                    >
                      {groep.label}
                      <ChevronDown aria-hidden className="w-3.5 h-3.5 opacity-60" />
                    </button>
                    <GroepPaneel groep={groep} open={open} onKies={() => setOpenGroep(null)} />
                  </li>
                );
              })}
              <li>
                <Link href={ZORGKAART.href} className={linkKlasse(hoortBij(location, ZORGKAART.href))}
                  aria-current={hoortBij(location, ZORGKAART.href) ? "page" : undefined}>
                  {ZORGKAART.label}
                </Link>
              </li>
            </ul>
          </nav>
          <div className="flex items-center gap-1 shrink-0">
            {RECHTS.map((item) => (
              <Link key={item.href} href={item.href} className={linkKlasse(hoortBij(location, item.href))}
                aria-current={hoortBij(location, item.href) ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
            {user ? (
              <span className="text-foreground/15 text-[11px] ml-2">|</span>
            ) : null}
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] hover:bg-primary/10 transition-colors text-sm font-medium text-foreground">
                  <span className="w-2 h-2 rounded-full bg-[#8FA89B] inline-block" />
                  {firstName}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-2 z-50 bg-background border border-border/60 rounded-[6px] overflow-hidden min-w-[160px]">
                        <div className="px-4 py-3 border-b border-border/30">
                          <p className="text-xs text-foreground/70">Ingelogd als</p>
                          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                        </div>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground/75 hover:text-foreground transition-colors">
                          <LogOut className="w-4 h-4" /> Uitloggen
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : TOON_LOGIN ? (
              <button onClick={() => setLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-border/50 transition-colors text-sm font-medium text-foreground/70 hover:text-foreground">
                <LogIn className="w-3.5 h-3.5" /> Inloggen
              </button>
            ) : null}
          </div>
        </div>
      </div>,
      document.body
      )}

      {/* ── MOBILE BOTTOM NAV — 4 vaste tabs + Menu ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border/30 pb-safe">
        <nav aria-label="Snelmenu" className="max-w-md mx-auto flex items-center justify-around px-2 py-1">
          {BALK.map((item) => {
            const isActive = hoortBij(location, item.href);
            const isStudioLuna = item.href === "/";
            return (
              <Link key={item.href} href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="relative flex flex-col items-center justify-center flex-1 min-h-[48px] tap-highlight-transparent select-none"
                onMouseDown={isStudioLuna ? startLongPress : undefined}
                onMouseUp={isStudioLuna ? cancelLongPress : undefined}
                onMouseLeave={isStudioLuna ? cancelLongPress : undefined}
                onTouchStart={isStudioLuna ? startLongPress : undefined}
                onTouchEnd={isStudioLuna ? cancelLongPress : undefined}
                onTouchCancel={isStudioLuna ? cancelLongPress : undefined}
              >
                <span className={cn("text-[13px] transition-colors duration-300 leading-none whitespace-nowrap",
                  isActive ? "text-foreground font-semibold" : "text-foreground/80")}>
                  {item.kort}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-[1.5px] bg-primary" />
                )}
              </Link>
            );
          })}

          <button
            ref={menuKnopRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="mobiel-menu"
            className="relative flex flex-col items-center justify-center flex-1 min-h-[48px] tap-highlight-transparent select-none"
          >
            <span className={cn("text-[13px] transition-colors duration-300 leading-none",
              isMenuActive ? "text-foreground font-semibold" : "text-foreground/80")}>
              Menu
            </span>
            {isMenuActive && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-[1.5px] bg-primary" />
            )}
          </button>
        </nav>
      </div>

      {/* ── MOBIEL MENU ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-50 bg-foreground/25"
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              id="mobiel-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[88vw] bg-background border-l border-border/40 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 pt-10 pb-5 border-b border-border/30">
                <p className="font-display text-xl font-medium text-foreground">Menu</p>
                <button ref={sluitKnopRef} onClick={() => setMenuOpen(false)} aria-label="Menu sluiten"
                  className="w-11 h-11 -mr-2 flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Een rustige lijst in groepen, met dunne lijnen */}
              <div className="flex-1 overflow-y-auto">
              <nav aria-label="Hoofdmenu" className="px-6 py-2">
                <MobielLink href="/" label="Studio Luna" actief={hoortBij(location, "/")} />
                {GROEPEN.map((groep) => (
                  <div key={groep.id} className="py-3 border-b border-border/30">
                    <p className="font-display text-lg text-foreground">{groep.label}</p>
                    <ul className="mt-1 pl-4">
                      {groep.onderdelen.map((o) => {
                        const actief = !!o.href && !o.href.includes("#") && hoortBij(location, o.href);
                        return (
                          <li key={o.label}>
                            {o.href ? (
                              <Link href={o.href}
                                onClick={() => { setMenuOpen(false); naarAnker(o.href!); }}
                                aria-current={actief ? "page" : undefined}
                                className={cn("block py-2 text-[15px]",
                                  actief
                                    ? "text-foreground underline decoration-primary decoration-[1.5px] underline-offset-[6px]"
                                    : "text-foreground/80 hover:text-foreground")}>
                                {o.label}
                              </Link>
                            ) : (
                              <p className="py-2 text-[15px] text-foreground/70">
                                {o.label} <InOpbouw klein />
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                <MobielLink href={ZORGKAART.href} label={ZORGKAART.label} actief={hoortBij(location, ZORGKAART.href)} />
                {RECHTS.map((item) => (
                  <MobielLink key={item.href} href={item.href} label={item.label} actief={hoortBij(location, item.href)} />
                ))}
                <div className="py-4">
                  <p className="text-[13px] text-foreground/75 leading-relaxed">{IN_OPBOUW_TEKST}</p>
                  <a href={OP_DE_HOOGTE_MAIL}
                    className="inline-block mt-2 py-1 text-[13px] text-foreground border-b border-foreground/35">
                    Houd me op de hoogte
                  </a>
                </div>
              </nav>

              <div className="px-4 pb-8 pt-2">
                <div className="flex flex-wrap items-center gap-x-2 px-2 pb-3">
                  <button onClick={() => { setMenuOpen(false); setAvOpen(true); }}
                    className="text-xs text-foreground/75 hover:text-foreground px-2 py-2.5 transition-colors">Algemene Voorwaarden</button>
                  <span className="text-xs text-foreground/30">·</span>
                  <button onClick={() => { setMenuOpen(false); setPrivacyOpen(true); }}
                    className="text-xs text-foreground/75 hover:text-foreground px-2 py-2.5 transition-colors">Privacyverklaring</button>
                </div>
                {user ? (
                  <div>
                    <p className="text-xs text-foreground/60 px-4 mb-2">Ingelogd als <span className="font-semibold text-foreground/75">{user.name}</span></p>
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 w-full text-foreground/70 hover:text-foreground transition-colors text-sm">
                      <LogOut className="w-4 h-4 text-foreground/50" />
                      Uitloggen
                    </button>
                  </div>
                ) : TOON_LOGIN ? (
                  <button onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
                    className="flex items-center gap-3 px-4 py-3 w-full text-foreground/70 hover:text-foreground transition-colors text-sm">
                    <LogIn className="w-4 h-4 text-foreground/50" />
                    Inloggen
                  </button>
                ) : null}
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE: top-right login indicator ── */}
      <div className="md:hidden fixed top-3 right-3 z-[45]">
        {user ? (
          <div className="relative">
            <button onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-background border border-border/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA89B] inline-block" />
              <span className="text-xs font-medium text-foreground/80">{firstName}</span>
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 z-50 bg-background border border-border/60 rounded-[6px] overflow-hidden min-w-[160px]">
                    <div className="px-4 py-3 border-b border-border/30">
                      <p className="text-xs text-muted-foreground">Ingelogd als</p>
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    </div>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors">
                      <LogOut className="w-4 h-4" /> Uitloggen
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : TOON_LOGIN ? (
          <button onClick={() => setLoginOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-background border border-border/40">
            <LogIn className="w-3 h-3 text-foreground/50" />
            <span className="text-xs font-medium text-foreground/60">Inloggen</span>
          </button>
        ) : null}
      </div>

      <AlgemeneVoorwaardenModal isOpen={avOpen} onClose={() => setAvOpen(false)} />
      <PrivacyverklaringModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

function MobielLink({ href, label, actief }: { href: string; label: string; actief: boolean }) {
  return (
    <Link href={href} aria-current={actief ? "page" : undefined}
      className={cn("block py-3.5 border-b border-border/30 font-display text-lg transition-colors",
        actief
          ? "text-foreground underline decoration-primary decoration-[1.5px] underline-offset-[6px]"
          : "text-foreground/80 hover:text-foreground")}>
      {label}
    </Link>
  );
}
