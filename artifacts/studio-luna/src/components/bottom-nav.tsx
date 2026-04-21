import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { CalendarDays, Bookmark, Tag, Home, Sparkles, Heart, LogOut, LogIn, Feather, User, Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlgemeneVoorwaardenModal } from "./algemene-voorwaarden-modal";
import { PrivacyverklaringModal } from "./privacyverklaring-modal";
import { LoginModal } from "./login-modal";
import { useAuth } from "@/hooks/use-auth";

const ALL_NAV = [
  { href: "/", label: "Studio Luna", icon: Sparkles },
  { href: "/aanbod", label: "Aanbod", icon: Home },
  { href: "/rooster", label: "Rooster", icon: CalendarDays },
  { href: "/tarieven", label: "Tarieven", icon: Tag },
  { href: "/over-mij", label: "Over mij", icon: User },
  { href: "/blog", label: "Blog", icon: Feather },
  { href: "/bookings", label: "Boekingen", icon: Bookmark },
  { href: "/village", label: "Village", icon: Heart },
];

// Vier tabs die altijd zichtbaar zijn in de balk
const PRIMARY_NAV = ["/", "/aanbod", "/rooster", "/blog"];

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

  const visibleNav = ALL_NAV.filter((n) => {
    if (n.href === "/village") return user?.isAdmin;
    return true;
  });
  const primaryItems = visibleNav.filter((n) => PRIMARY_NAV.includes(n.href));
  const isMenuActive = !PRIMARY_NAV.includes(location);

  return (
    <>
      {/* ── DESKTOP TOP NAV ── */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/30 h-16 items-center px-8">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 select-none"
            onMouseDown={startLongPress} onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress} onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress} onTouchCancel={cancelLongPress}>
            {/* Logo */}
            <img src={`/images/studio-luna-logo.png?v=5`} alt="Studio Luna" className="h-10 w-auto shrink-0" />
            {/* Naam */}
            <div className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-medium text-foreground tracking-wide">Studio Luna</span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-foreground/40 font-sans mt-0.5">Zwangerschapsyoga</span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {visibleNav.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={cn("px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-foreground" : "text-foreground/55 hover:text-foreground hover:bg-secondary")}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => setAvOpen(true)} className="text-[11px] text-foreground/30 hover:text-foreground/55 transition-colors">AV</button>
            <span className="text-foreground/20 text-[11px]">·</span>
            <button onClick={() => setPrivacyOpen(true)} className="text-[11px] text-foreground/30 hover:text-foreground/55 transition-colors">Privacy</button>
            <span className="text-foreground/15 text-[11px]">|</span>
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
            ) : (
              <button onClick={() => setLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 hover:bg-secondary transition-colors text-sm font-medium text-foreground/60 hover:text-foreground">
                <LogIn className="w-3.5 h-3.5" /> Inloggen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV — 4 primaire tabs + hamburger ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-xl border-t border-border/30 pb-safe">
        <nav className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
          {primaryItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
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
                <div className="relative z-10 flex flex-col items-center gap-1 py-1.5 px-1">
                  <Icon strokeWidth={isActive ? 2.5 : 2}
                    className={cn("w-5 h-5 transition-colors duration-300",
                      isActive ? "text-foreground" : "text-muted-foreground")} />
                  <span className={cn("text-[9px] font-medium transition-colors duration-300 leading-none",
                    isActive ? "text-foreground" : "text-muted-foreground")}>
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <motion.div layoutId="bottom-nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-0"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
              </Link>
            );
          })}

          {/* Hamburger-knop */}
          <button
            onClick={() => setMenuOpen(true)}
            className="relative flex flex-col items-center justify-center flex-1 tap-highlight-transparent select-none"
          >
            <div className="relative z-10 flex flex-col items-center gap-1 py-1.5 px-1">
              <Menu strokeWidth={isMenuActive ? 2.5 : 2}
                className={cn("w-5 h-5 transition-colors duration-300",
                  isMenuActive ? "text-foreground" : "text-muted-foreground")} />
              <span className={cn("text-[9px] font-medium transition-colors duration-300 leading-none",
                isMenuActive ? "text-foreground" : "text-muted-foreground")}>
                Menu
              </span>
            </div>
            {isMenuActive && (
              <motion.div layoutId="bottom-nav-indicator"
                className="absolute inset-0 bg-primary/10 rounded-2xl -z-0"
                transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
          </button>
        </nav>
        <div className="pb-1.5 flex items-center justify-center gap-3">
          <button onClick={() => setAvOpen(true)} className="text-[10px] text-foreground/35 hover:text-foreground/60 transition-colors">Algemene Voorwaarden</button>
          <span className="text-[10px] text-foreground/20">·</span>
          <button onClick={() => setPrivacyOpen(true)} className="text-[10px] text-foreground/35 hover:text-foreground/60 transition-colors">Privacyverklaring</button>
        </div>
      </div>

      {/* ── MOBILE MENU DRAWER ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
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
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Studio Luna</p>
                  <p className="font-display text-xl font-medium text-foreground mt-0.5">Menu</p>
                </div>
                <button onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav items — 2-koloms grid, alles zichtbaar zonder scrollen */}
              <nav className="flex-1 px-4 py-5">
                <div className="grid grid-cols-2 gap-2.5">
                  {visibleNav.map((item, i) => {
                    const isActive = location === item.href;
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 + i * 0.035, duration: 0.28 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "flex flex-col items-start gap-2.5 px-4 py-4 rounded-2xl transition-colors group w-full",
                            isActive
                              ? "bg-primary/12 text-foreground"
                              : "bg-secondary/60 text-foreground/60 hover:bg-secondary hover:text-foreground"
                          )}
                        >
                          <Icon
                            className={cn("w-5 h-5 shrink-0 transition-colors",
                              isActive ? "text-primary" : "text-foreground/35 group-hover:text-primary/60")}
                            strokeWidth={isActive ? 2.5 : 2}
                          />
                          <span className="text-[13px] font-semibold leading-none">{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Footer: login/logout */}
              <div className="px-4 pb-8 pt-3 border-t border-border/20">
                {user ? (
                  <div>
                    <p className="text-xs text-foreground/40 px-4 mb-2">Ingelogd als <span className="font-semibold text-foreground/60">{user.name}</span></p>
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-foreground/60 hover:text-foreground hover:bg-secondary transition-colors text-sm">
                      <LogOut className="w-4 h-4 text-foreground/40" />
                      Uitloggen
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-foreground/60 hover:text-foreground hover:bg-secondary transition-colors text-sm">
                    <LogIn className="w-4 h-4 text-foreground/40" />
                    Inloggen
                  </button>
                )}
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
        ) : (
          <button onClick={() => setLoginOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-background/80 backdrop-blur-md border border-border/30 shadow-sm">
            <LogIn className="w-3 h-3 text-foreground/50" />
            <span className="text-xs font-medium text-foreground/60">Inloggen</span>
          </button>
        )}
      </div>

      <AlgemeneVoorwaardenModal isOpen={avOpen} onClose={() => setAvOpen(false)} />
      <PrivacyverklaringModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
