import { useState, useMemo, useEffect } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";
import { MOCK_CLASSES, StudioClass } from "@/data/mock-classes";
import { ClassCard } from "@/components/class-card";
import { BookingModal } from "@/components/booking-modal";
import { useBookings } from "@/hooks/use-bookings";
import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const today = startOfToday();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<StudioClass | null>(null);
  
  const { isBooked } = useBookings();

  // Generate next 14 days
  const upcomingDays = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(today, i));
  }, [today]);

  const handleBook = (studioClass: StudioClass) => {
    setSelectedClass(studioClass);
    setIsModalOpen(true);
  };

  // Filter classes for selected day
  const dayClasses = useMemo(() => {
    const dayOfWeek = selectedDate.getDay();
    // In JS, 0 is Sunday, 1 is Monday. Our mock data matches this.
    return MOCK_CLASSES.filter(c => c.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-8 flex justify-center">
      <div className="w-full max-w-md bg-background min-h-screen relative shadow-2xl shadow-black/5 md:border-x border-border/30">
        
        {/* HERO SECTION */}
        <div className="relative pt-12 pb-10 px-6 rounded-b-[2.5rem] bg-secondary overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-secondary/90 to-secondary" />
          </div>

          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`}
                alt="Studio Luna"
                className="h-40 w-auto mb-4 object-contain mx-auto block"
              />
              <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground leading-[1.1] mb-3">
                It takes a village. Studio Luna is jouw mama tribe.
              </h1>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Zwangerschapsyoga in Nieuwerkerk aan den IJssel
              </p>
              
              <button 
                onClick={() => document.getElementById('rooster')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold shadow-soft hover:shadow-primary/20 hover:bg-primary/90 transition-all group"
              >
                Bekijk het rooster
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* SCHEDULE SECTION */}
        <div id="rooster" className="pt-8 px-6">
          <h2 className="font-display text-2xl font-medium mb-6">Het Rooster</h2>
          
          {/* Day Selector (Horizontal Scroll) */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 snap-x">
            {upcomingDays.map((date, idx) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[4.5rem] h-[5.5rem] rounded-2xl transition-all duration-300 snap-center shrink-0",
                    isSelected 
                      ? "bg-foreground text-background shadow-lg scale-105" 
                      : "bg-card text-foreground/70 hover:bg-muted"
                  )}
                >
                  <span className={cn(
                    "text-xs font-bold uppercase mb-1",
                    isSelected ? "text-background/80" : "text-primary"
                  )}>
                    {isToday ? "Vndg" : format(date, 'EE', { locale: nl }).substring(0, 2)}
                  </span>
                  <span className="text-xl font-display font-semibold">
                    {format(date, 'd')}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 mb-8">
            <h3 className="text-lg font-medium mb-4 text-foreground/90 capitalize flex items-center gap-2">
              {format(selectedDate, 'EEEE d MMMM', { locale: nl })}
              {isSameDay(selectedDate, today) && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full lowercase font-bold tracking-wider">vandaag</span>}
            </h3>
            
            <div className="space-y-4">
              {dayClasses.length > 0 ? (
                dayClasses.map((c) => (
                  <ClassCard 
                    key={c.id} 
                    studioClass={c} 
                    isBooked={isBooked(c.id, selectedDate.toISOString())}
                    onBook={handleBook}
                  />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-card/50 border border-dashed border-border rounded-3xl p-8 text-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <h4 className="font-display text-lg font-medium mb-1">Geen lessen vandaag</h4>
                  <p className="text-sm text-muted-foreground">Geniet van je rust of bekijk een andere dag in het rooster.</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <BookingModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          studioClass={selectedClass}
          selectedDate={selectedDate}
        />
        
        <BottomNav />
      </div>
    </div>
  );
}

// Need to import CalendarDays here since I used it in empty state
import { CalendarDays } from "lucide-react";
