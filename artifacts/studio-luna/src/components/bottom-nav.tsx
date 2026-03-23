import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CalendarDays, Bookmark, Tag, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlgemeneVoorwaardenModal } from "./algemene-voorwaarden-modal";
import { PrivacyverklaringModal } from "./privacyverklaring-modal";

export function BottomNav() {
  const [location] = useLocation();
  const [avOpen, setAvOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Aanbod", icon: Home },
    { href: "/rooster", label: "Rooster", icon: CalendarDays },
    { href: "/tarieven", label: "Tarieven", icon: Tag },
    { href: "/bookings", label: "Boekingen", icon: Bookmark },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/30 pb-safe">
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
          <button
            onClick={() => setAvOpen(true)}
            className="text-[10px] text-foreground/35 hover:text-foreground/60 transition-colors"
          >
            Algemene Voorwaarden
          </button>
          <span className="text-[10px] text-foreground/20">·</span>
          <button
            onClick={() => setPrivacyOpen(true)}
            className="text-[10px] text-foreground/35 hover:text-foreground/60 transition-colors"
          >
            Privacyverklaring
          </button>
        </div>
      </div>

      <AlgemeneVoorwaardenModal isOpen={avOpen} onClose={() => setAvOpen(false)} />
      <PrivacyverklaringModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
}
