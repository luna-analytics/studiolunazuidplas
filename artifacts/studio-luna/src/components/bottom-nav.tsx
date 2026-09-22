import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { LogOut, LogIn, X } from "lucide-react";
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

// Aanbod, Rooster, Tarieven en Boekingen staan tijdelijk uit het menu; de
// pagina's bestaan nog en kunnen hier zo weer worden toegevoegd.
// "kort" is het label in de mobiele balk onderin.
const ALL_NAV = [
  { href: "/", label: "Studio Luna", kort: "Studio Luna" },
  { href: "/geboortereeks", label: "Zwangerschapsyoga", kort: "Yoga" },
  { href: "/geboortezorg-zuidplas", label: "Zorgkaart", kort: "Zorgkaart" },
  { href: "/over-mij", label: "Over mij", kort: "Over mij" },
  { href: "/blog", label: "Blog", kort: "Blog" },
];

// Vier tabs die altijd zichtbaar zijn in de balk
const PRIMARY_NAV = ["/", "/geboortereeks", "/geboortezorg-zuidplas", "/blog"];

export function BottomNav() {
  const [location, navigate] = useLocation();
  const [avOpen, setAvOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const firstName = user?.name?.split(" ")[0] ?? "";

  const handleLogout = () => { logout(); setUserMenuOpen(false); };

  const startLongPress = useCallback(() => {
    longPressTimer.current = setTimeout(() => navigate("/admin"), 1500);
  }, [navigate]);
  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const visibleNav = ALL_NAV;
  const primaryItems = visibleNav.filter((n) => PRIMARY_NAV.includes(n.href));
  const isMenuActive = !PRIMARY_NAV.includes(location);

  return (
    <>
      {/* ── DESKTOP TOP NAV ── scrolt mee met de pagina; via een portal in body,
          zodat absolute positionering altijd bovenaan het document uitkomt,
          waar de component ook in de pagina staat. */}
      {createPortal(
      <div className="hidden md:flex absolute top-0 left-0 right-0 z-40 bg-background border-b border-border/30 h-16 items-center px-8">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 select-none"
            onMouseDown={startLongPress} onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress} onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress} onTouchCancel={cancelLongPress}>
            {/* Logo */}
            {/* Kleine webp van 4 KB; het originele logo van een halve megabyte
                werd op elke pagina gedownload, ook op mobiel waar het niet
                eens zichtbaar is. */}
            <img src={`/images/studio-luna-logo-klein.webp`} alt="Studio Luna" className="h-10 w-auto shrink-0" />
            {/* Naam */}
            <span className="font-display text-[19px] font-medium text-foreground leading-none">Studio Luna</span>
          </Link>
          <nav className="flex items-center gap-1">
            {visibleNav.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={cn("px-3 py-2 text-sm font-medium transition-colors underline-offset-[10px] decoration-[1.5px]",
                    isActive ? "text-foreground underline decoration-primary" : "text-foreground/55 hover:text-foreground")}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => setAvOpen(true)} className="text-xs text-foreground/75 hover:text-foreground px-2 py-2 transition-colors">Voorwaarden</button>
            <span className="text-foreground/30 text-xs">·</span>
            <button onClick={() => setPrivacyOpen(true)} className="text-xs text-foreground/75 hover:text-foreground px-2 py-2 transition-colors">Privacy</button>
            {user ? (
              <span className="text-foreground/15 text-[11px]">|</span>
            ) : null}
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/8 hover:bg-primary/15 transition-colors text-sm font-medium text-foreground">
                  <span className="w-2 h-2 rounded-full bg-[#8FA89B] inline-block" />
                  {firstName}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-2 z-50 bg-card border border-border/40 rounded-2xl shadow-lg overflow-hidden min-w-[160px]">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 hover:bg-secondary transition-colors text-sm font-medium text-foreground/60 hover:text-foreground">
                <LogIn className="w-3.5 h-3.5" /> Inloggen
              </button>
            ) : null}
          </div>
        </div>
      </div>,
      document.body
      )}

      {/* ── MOBILE BOTTOM NAV — 4 primaire tabs + hamburger ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border/30 pb-safe">
        <nav className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
          {primaryItems.map((item) => {
            const isActive = location === item.href;
            const isStudioLuna = item.href === "/";
            return (
              <Link key={item.href} href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 tap-highlight-transparent select-none"
                onMouseDown={isStudioLuna ? startLongPress : undefined}
                onMouseUp={isStudioLuna ? cancelLongPress : undefined}
                onMouseLeave={isStudioLuna ? cancelLongPress : undefined}
                onTouchStart={isStudioLuna ? startLongPress : undefined}
                onTouchEnd={isStudioLuna ? cancelLongPress : undefined}
                onTouchCancel={isStudioLuna ? cancelLongPress : undefined}
              >
                <div className="relative z-10 flex flex-col items-center py-3 px-1">
                  <span className={cn("text-[12px] transition-colors duration-300 leading-none whitespace-nowrap",
                    isActive ? "text-foreground font-semibold" : "text-foreground/70")}>
                    {item.kort ?? item.label}
                  </span>
                </div>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[1.5px] bg-primary" />
                )}
              </Link>
            );
          })}

          {/* Hamburger-knop */}
          <button
            onClick={() => setMenuOpen(true)}
            className="relative flex flex-col items-center justify-center flex-1 tap-highlight-transparent select-none"
          >
            <div className="relative z-10 flex flex-col items-center py-3 px-1">
              <span className={cn("text-[12px] transition-colors duration-300 leading-none",
                isMenuActive ? "text-foreground font-semibold" : "text-foreground/70")}>
                Menu
              </span>
            </div>
            {isMenuActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[1.5px] bg-primary" />
            )}
          </button>
        </nav>
      </div>

      {/* ── MOBILE MENU DRAWER ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden fixed inset-0 z-50 bg-foreground/25"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer panel van rechts */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 bg-background shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-12 pb-6 border-b border-border/20">
                <p className="font-display text-xl font-medium text-foreground">Menu</p>
                <button onClick={() => setMenuOpen(false)} aria-label="Menu sluiten"
                  className="w-9 h-9 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav items: een rustige lijst met dunne lijnen */}
              <nav className="flex-1 px-6 py-2">
                {visibleNav.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block py-4 border-b border-border/25 font-display text-lg transition-colors",
                        isActive
                          ? "text-foreground underline decoration-primary decoration-[1.5px] underline-offset-[6px]"
                          : "text-foreground/70 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer: juridische links plus login/logout */}
              <div className="px-4 pb-8 pt-3 border-t border-border/20">
                <div className="flex items-center gap-2 px-2 pb-3">
                  <button onClick={() => { setMenuOpen(false); setAvOpen(true); }}
                    className="text-xs text-foreground/75 hover:text-foreground px-2 py-2.5 transition-colors">Algemene Voorwaarden</button>
                  <span className="text-xs text-foreground/30">·</span>
                  <button onClick={() => { setMenuOpen(false); setPrivacyOpen(true); }}
                    className="text-xs text-foreground/75 hover:text-foreground px-2 py-2.5 transition-colors">Privacyverklaring</button>
                </div>
                {user ? (
                  <div>
                    <p className="text-xs text-foreground/40 px-4 mb-2">Ingelogd als <span className="font-semibold text-foreground/60">{user.name}</span></p>
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-foreground/60 hover:text-foreground hover:bg-secondary transition-colors text-sm">
                      <LogOut className="w-4 h-4 text-foreground/40" />
                      Uitloggen
                    </button>
                  </div>
                ) : TOON_LOGIN ? (
                  <button onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-foreground/60 hover:text-foreground hover:bg-secondary transition-colors text-sm">
                    <LogIn className="w-4 h-4 text-foreground/40" />
                    Inloggen
                  </button>
                ) : null}
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-background/80 backdrop-blur-md border border-border/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA89B] inline-block" />
              <span className="text-xs font-medium text-foreground/80">{firstName}</span>
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 z-50 bg-card border border-border/40 rounded-2xl shadow-lg overflow-hidden min-w-[160px]">
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-background/80 backdrop-blur-md border border-border/30 shadow-sm">
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
