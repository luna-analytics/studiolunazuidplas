import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CalendarDays, Bookmark, Tag, Home, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlgemeneVoorwaardenModal } from "./algemene-voorwaarden-modal";
import { PrivacyverklaringModal } from "./privacyverklaring-modal";

export function BottomNav() {
  const [location] = useLocation();
  const [avOpen, setAvOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const navItems = [
    { href: "/studio", label: "Studio Luna", icon: Sparkles },
    { href: "/", label: "Aanbod", icon: Home },
    { href: "/rooster", label: "Rooster", icon: CalendarDays },
    { href: "/tarieven", label: "Tarieven", icon: Tag },
    { href: "/bookings", label: "Boekingen", icon: Bookmark },
  ];

  return (
    <>
      {/* DESKTOP TOP NAV */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/30 h-16 items-center px-8">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="overflow-hidden" style={{ height: '36px' }}>
              <img
                src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`}
                alt="Studio Luna"
                className="h-12 w-auto"
              />
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
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "text-foreground/55 hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => setAvOpen(true)} className="text-xs text-foreground/35 hover:text-foreground/60 transition-colors">Algemene Voorwaarden</button>
            <span className="text-foreground/20 text-xs">·</span>
            <button onClick={() => setPrivacyOpen(true)} className="text-xs text-foreground/35 hover:text-foreground/60 transition-colors">Privacy</button>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/30 pb-safe">
        <nav className="max-w-md mx-auto flex items-center justify-around px-6 py-3">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center w-16 tap-highlight-transparent">
                <div className="relative z-10 flex flex-col items-center gap-1.5 p-2">
                  <Icon
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn(
                      "w-6 h-6 transition-colors duration-300",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  />
                  <span className={cn(
                    "text-[10px] font-medium transition-colors duration-300",
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
        <div className="pb-2 flex items-center justify-center gap-3">
          <button onClick={() => setAvOpen(true)} className="text-[10px] text-foreground/35 hover:text-foreground/60 transition-colors">Algemene Voorwaarden</button>
          <span className="text-[10px] text-foreground/20">·</span>
          <button onClick={() => setPrivacyOpen(true)} className="text-[10px] text-foreground/35 hover:text-foreground/60 transition-colors">Privacyverklaring</button>
        </div>
      </div>

      <AlgemeneVoorwaardenModal isOpen={avOpen} onClose={() => setAvOpen(false)} />
      <PrivacyverklaringModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
}
