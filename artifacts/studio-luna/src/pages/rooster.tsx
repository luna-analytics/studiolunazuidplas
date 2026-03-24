import { useState, useMemo } from "react";
import { parseISO, isFuture, isToday, format } from "date-fns";
import { nl } from "date-fns/locale";
import { MOCK_CLASSES, StudioClass } from "@/data/mock-classes";
import { BookingModal } from "@/components/booking-modal";
import { useBookings } from "@/hooks/use-bookings";
import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { Clock, Users, MapPin } from "lucide-react";

type ClassInstance = {
  classData: StudioClass;
  date: Date;
  dateStr: string;
};

export default function Rooster() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<ClassInstance | null>(null);
  const { isBooked } = useBookings();

  const upcomingInstances = useMemo((): ClassInstance[] => {
    const instances: ClassInstance[] = [];
    for (const cls of MOCK_CLASSES) {
      for (const dateStr of cls.dates) {
        const date = parseISO(dateStr);
        if (isFuture(date) || isToday(date)) {
          instances.push({ classData: cls, date, dateStr });
        }
      }
    }
    return instances.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);

  const handleBook = (instance: ClassInstance) => {
    setSelectedInstance(instance);
    setIsModalOpen(true);
  };

  const colorMap = {
    yoga: { bg: "#8fa89b", light: "rgba(143,168,155,0.12)", text: "#3a4f41", label: "Yoga" },
    circle: { bg: "#c78d76", light: "rgba(199,141,118,0.12)", text: "#7a4a35", label: "Circle" },
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 ">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        {/* HEADER */}
        <div className="px-6 md:px-12 lg:px-16 pt-14 md:pt-12 pb-12 bg-secondary md:rounded-3xl md:mx-6 md:mt-6 flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">Rooster</h1>
            <p className="text-foreground/60 mt-2 text-sm">Zie ik jou op de mat? Klik om te reserveren.</p>
          </motion.div>
          <div className="overflow-hidden shrink-0" style={{ height: '82px' }}>
            <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-28 w-auto" />
          </div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-6 mb-6">
          <div className="space-y-4">
            {upcomingInstances.length > 0 ? (
              upcomingInstances.map((instance, i) => {
                const { classData, date, dateStr } = instance;
                const colors = colorMap[classData.type];
                const booked = isBooked(classData.id, dateStr);

                return (
                  <motion.div
                    key={`${classData.id}-${dateStr}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-3xl overflow-hidden shadow-sm border border-border/30"
                    style={{ backgroundColor: colors.light }}
                  >
                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.bg }}>
                        {format(date, 'EEEE d MMMM', { locale: nl })}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: colors.bg + '22', color: colors.text }}>
                        {colors.label}
                      </span>
                    </div>

                    <div className="px-5 pb-5">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{classData.title}</h3>
                      <p className="text-sm text-foreground/60 mb-3 leading-relaxed">{classData.description}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/60 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {classData.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {classData.spotsAvailable} plekken
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          Huize Mooisteen
                        </span>
                      </div>

                      {booked ? (
                        <div className="w-full py-2.5 rounded-2xl text-center text-sm font-semibold"
                          style={{ backgroundColor: colors.bg + '33', color: colors.text }}>
                          ✓ Geboekt
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBook(instance)}
                          className="w-full py-2.5 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: colors.bg }}
                        >
                          Reserveer jouw plekje
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-card/50 border border-dashed border-border rounded-3xl p-8 text-center">
                <p className="text-sm text-muted-foreground">Binnenkort nieuwe lessen beschikbaar.</p>
              </div>
            )}
          </div>
        </div>

        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          studioClass={selectedInstance?.classData ?? null}
          selectedDate={selectedInstance?.date ?? new Date()}
        />

        <BottomNav />
      </div>
    </div>
  );
}
