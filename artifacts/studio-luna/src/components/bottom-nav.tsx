import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { CalendarDays, Bookmark, Tag, Home, Sparkles, Heart, LogOut, LogIn, Feather } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlgemeneVoorwaardenModal } from "./algemene-voorwaarden-modal";
import { PrivacyverklaringModal } from "./privacyverklaring-modal";
import { LoginModal } from "./login-modal";
import { useAuth } from "@/hooks/use-auth";

export function BottomNav() {
  const [location, navigate] = useLocation();
  const [avOpen, setAvOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const firstName = user?.name?.split(" ")[0] ?? "";

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const startLongPress = useCallback(() => {
    longPressTimer.current = setTimeout(() => navigate("/admin"), 1500);
  }, [navigate]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const navItems = [
    { href: "/", label: "Studio Luna", icon: Sparkles },
    { href: "/aanbod", label: "Aanbod", icon: Home },
    { href: "/rooster", label: "Rooster", icon: CalendarDays },
    { href: "/tarieven", label: "Tarieven", icon: Tag },
    { href: "/bookings", label: "Boekingen", icon: Bookmark },
    { href: "/village", label: "Village", icon: Heart },
    { href: "/inspiratie", label: "Inspiratie", icon: Feather },
  ];

  return (
    <>
      {/* DESKTOP TOP NAV */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/30 h-16 items-center px-8">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 select-none"
            onMouseDown={startLongPress} onMouseUp={cancelLongPress} onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress} onTouchEnd={cancelLongPress} onTouchCancel={cancelLongPress}>
            <div className="overflow-hidden" style={{ height: '36px' }}>
              <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-12 w-auto" />
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-foreground" : "text-foreground/55 hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            {/* AV / Privacy tiny links */}
            <button onClick={() => setAvOpen(true)} className="text-[11px] text-foreground/30 hover:text-foreground/55 transition-colors">AV</button>
            <span className="text-foreground/20 text-[11px]">·</span>
            <button onClick={() => setPrivacyOpen(true)} className="text-[11px] text-foreground/30 hover:text-foreground/55 transition-colors">Privacy</button>
            <span className="text-foreground/15 text-[11px]">|</span>

            {/* User status chip */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/8 hover:bg-primary/15 transition-colors text-sm font-medium text-foreground"
                >
                  <span className="w-2 h-2 rounded-full bg-[#8FA89B] inline-block" />
                  {firstName}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-2 z-50 bg-card border border-border/40 rounded-2xl shadow-lg overflow-hidden min-w-[160px]"
                      >
                        <div className="px-4 py-3 border-b border-border/30">
                          <p className="text-xs text-muted-foreground">Ingelogd als</p>
                          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Uitloggen
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 hover:bg-secondary transition-colors text-sm font-medium text-foreground/60 hover:text-foreground"
              >
                <LogIn className="w-3.5 h-3.5" />
                Inloggen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/30 pb-safe">
        <nav className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            const isVillage = item.href === "/village";
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
                  <Icon
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn(
                      "w-5 h-5 transition-colors duration-300",
                      isActive ? "text-foreground" : isVillage && !user ? "text-muted-foreground/60" : "text-muted-foreground"
                    )}
                  />
                  <span className={cn(
                    "text-[9px] font-medium transition-colors duration-300 leading-none",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-0"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="pb-1.5 flex items-center justify-center gap-3">
          <button onClick={() => setAvOpen(true)} className="text-[10px] text-foreground/35 hover:text-foreground/60 transition-colors">Algemene Voorwaarden</button>
          <span className="text-[10px] text-foreground/20">·</span>
          <button onClick={() => setPrivacyOpen(true)} className="text-[10px] text-foreground/35 hover:text-foreground/60 transition-colors">Privacyverklaring</button>
        </div>
      </div>

      {/* MOBILE: top-right login indicator */}
      <div className="md:hidden fixed top-3 right-3 z-50">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-background/80 backdrop-blur-md border border-border/30 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA89B] inline-block" />
              <span className="text-xs font-medium text-foreground/80">{firstName}</span>
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 z-50 bg-card border border-border/40 rounded-2xl shadow-lg overflow-hidden min-w-[160px]"
                  >
                    <div className="px-4 py-3 border-b border-border/30">
                      <p className="text-xs text-muted-foreground">Ingelogd als</p>
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Uitloggen
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={() => setLoginOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-background/80 backdrop-blur-md border border-border/30 shadow-sm"
          >
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
