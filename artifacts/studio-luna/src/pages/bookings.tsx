import { useBookings } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { LoginModal } from "@/components/login-modal";
import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { Bookmark, CalendarX2, ArrowRight, LogIn, CreditCard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Bookings() {
  const { user, logout, loading, refreshUser } = useAuth();
  const { bookings, cancelBooking, isLoaded } = useBookings(user?.id);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<"login" | "register">("login");

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        <div className="px-6 md:px-12 lg:px-16 pt-14 md:pt-12 pb-12 bg-secondary md:rounded-3xl md:mx-6 md:mt-6 flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">Boekingen</h1>
            <p className="text-foreground/60 mt-2 text-sm">Jouw geplande lessen en tegoed.</p>
          </motion.div>
          <div className="overflow-hidden shrink-0" style={{ height: '95px' }}>
            <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-32 w-auto" />
          </div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-6 mb-8 space-y-4">

          {/* MEMBER CARD */}
          {!loading && (
            user ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/30 rounded-3xl p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-1">Welkom terug</p>
                    <p className="font-display text-xl font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-foreground/50 mt-0.5">{user.email}</p>
                  </div>
                  <button onClick={logout} className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/70 transition-colors p-2 rounded-xl hover:bg-secondary">
                    <LogOut className="w-4 h-4" />
                    Uitloggen
                  </button>
                </div>
                {!user.isAdmin && (
                  <div className="mt-4 pt-4 border-t border-border/20 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/50 mb-0.5">Resterend tegoed</p>
                        <p className="font-bold text-2xl text-foreground leading-none">
                          {user.credits} <span className="text-sm font-normal text-foreground/50">{user.credits === 1 ? "credit" : "credits"}</span>
                        </p>
                      </div>
                    </div>
                    <Link href="/village" className="inline-flex items-center gap-2 bg-secondary border border-border/30 text-foreground px-4 py-2.5 rounded-2xl font-semibold text-sm hover:bg-secondary/80 transition-colors">
                      🌿 De Village
                    </Link>
                  </div>
                )}
                {user.isAdmin && (
                  <div className="mt-4 pt-4 border-t border-border/20">
                    <Link href="/admin" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                      Naar ledenbeheer
                    </Link>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/30 rounded-3xl p-5"
              >
                <div className="mb-4">
                  <p className="font-display text-xl font-medium text-foreground mb-1">Welkom bij Studio Luna</p>
                  <p className="text-sm text-foreground/55 leading-relaxed">Maak een gratis account aan om een proefles te boeken, of log in als je al lid bent.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setLoginMode("login"); setLoginOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Inloggen
                  </button>
                  <button
                    onClick={() => { setLoginMode("register"); setLoginOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-secondary border border-border/30 text-foreground px-4 py-2.5 rounded-2xl font-semibold text-sm hover:bg-secondary/80 transition-colors"
                  >
                    Registreren
                  </button>
                </div>
              </motion.div>
            )
          )}

          {/* BOOKINGS LIST — alleen voor ingelogde leden */}
          {user && !user.isAdmin && <div>
            <h2 className="font-display text-xl font-medium text-foreground mb-3">Geplande lessen</h2>
            {!isLoaded ? (
              <div className=" p-10">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sortedBookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-3xl p-8 text-center"
              >
                <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <CalendarX2 className="w-7 h-7" />
                </div>
                <h3 className="font-display text-lg font-medium mb-2">Nog geen boekingen</h3>
                <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
                  Je hebt nog geen lessen gepland. Tijd voor wat me-time?
                </p>
                <Link href="/rooster" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Bekijk het rooster
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {sortedBookings.map((booking, index) => {
                  const dateObj = parseISO(booking.date);
                  const isYoga = booking.type === 'yoga';
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card border border-border/30 rounded-3xl p-5 relative overflow-hidden flex flex-col"
                    >
                      <div className={cn("absolute left-0 top-0 bottom-0 w-2", isYoga ? "bg-primary" : "bg-accent")} />
                      <div className="pl-3 flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            {format(dateObj, 'EEEE d MMMM', { locale: nl })}
                          </p>
                          <h3 className="font-display text-lg font-medium mb-0.5">{booking.className}</h3>
                          <p className="text-foreground/70 text-sm">{booking.time}</p>
                        </div>
                      </div>
                      <div className="mt-4 pl-3 flex justify-between items-center">
                        {booking.isProefles && (
                          <span className="text-xs font-semibold bg-accent/30 text-foreground/60 px-3 py-1 rounded-xl">Proefles</span>
                        )}
                        {booking.isLosseLes && (
                          <span className="text-xs font-semibold bg-secondary text-foreground/60 px-3 py-1 rounded-xl">Losse les</span>
                        )}
                        <div className="ml-auto">
                          <button
                            onClick={async () => {
                              const msg = booking.isProefles
                                ? "Weet je zeker dat je je proefles wilt annuleren?"
                                : booking.isLosseLes
                                ? "Weet je zeker dat je deze losse les wilt annuleren?"
                                : "Weet je zeker dat je deze les wilt annuleren? Let op: binnen 7 uur voor de les ontvang je geen credit terug.";
                              if (window.confirm(msg)) {
                                await cancelBooking(booking.id);
                                await refreshUser();
                              }
                            }}
                            className="text-sm font-medium text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl transition-colors"
                          >
                            Annuleren
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>}
        </div>

        <BottomNav />
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} defaultMode={loginMode} />
      </div>
    </div>
  );
}
