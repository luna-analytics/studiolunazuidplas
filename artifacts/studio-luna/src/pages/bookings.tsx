import { useBookings } from "@/hooks/use-bookings";
import { BottomNav } from "@/components/bottom-nav";
import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { Bookmark, CalendarX2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Bookings() {
  const { bookings, cancelBooking, isLoaded } = useBookings();

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        <div className="pt-12 md:pt-10 px-6 md:px-12 lg:px-16 pb-6 bg-secondary/30 md:bg-transparent border-b border-border/30 md:border-none">
          <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-primary" />
            Mijn Boekingen
          </h1>
        </div>

        <div className="p-6 md:px-12 lg:px-16">
          {!isLoaded ? (
            <div className="flex justify-center p-10">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : sortedBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-8 text-center mt-10 shadow-inner-soft md:max-w-sm mx-auto"
            >
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground shadow-sm">
                <CalendarX2 className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-medium mb-2">Nog geen boekingen</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Je hebt nog geen lessen of circles gepland staan. Tijd voor wat me-time?
              </p>
              <Link href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold shadow-soft hover:bg-primary/90 transition-colors">
                Bekijk het rooster
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
              {sortedBookings.map((booking, index) => {
                const dateObj = parseISO(booking.date);
                const isYoga = booking.type === 'yoga';

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={booking.id}
                    className="bg-background border-2 border-card rounded-3xl p-5 relative overflow-hidden flex flex-col group hover:border-border/50 transition-colors"
                  >
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-2",
                      isYoga ? "bg-primary" : "bg-accent"
                    )} />

                    <div className="pl-3 flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          {format(dateObj, 'EEEE d MMMM', { locale: nl })}
                        </p>
                        <h3 className="font-display text-lg font-medium mb-1">{booking.className}</h3>
                        <p className="text-foreground/80 font-medium text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-border" />
                          {booking.time}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pl-3 flex justify-end">
                      <button
                        onClick={() => {
                          if (window.confirm("Weet je zeker dat je deze les wilt annuleren?")) {
                            cancelBooking(booking.id);
                          }
                        }}
                        className="text-sm font-medium text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl transition-colors"
                      >
                        Annuleren
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
