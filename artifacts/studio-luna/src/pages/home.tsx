import { useState, useMemo } from "react";
import { parseISO, isFuture, isToday, format } from "date-fns";
import { nl } from "date-fns/locale";
import { MOCK_CLASSES, StudioClass } from "@/data/mock-classes";
import { BookingModal } from "@/components/booking-modal";
import { useBookings } from "@/hooks/use-bookings";
import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Users, MapPin, Calendar, Coffee, Sparkles } from "lucide-react";

type ClassInstance = {
  classData: StudioClass;
  date: Date;
  dateStr: string;
};

export default function Home() {
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
    <div className="min-h-screen bg-background pb-28 md:pb-8 flex justify-center">
      <div className="w-full max-w-md bg-background min-h-screen relative shadow-2xl shadow-black/5 md:border-x border-border/30">

        {/* HERO */}
        <div className="relative pt-12 pb-10 px-6 rounded-b-[2.5rem] bg-secondary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-secondary/90 to-secondary" />
          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <img
                src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`}
                alt="Studio Luna"
                className="h-40 w-auto mb-5 object-contain mx-auto block"
              />
              <h1 className="font-display text-4xl font-medium text-foreground leading-[1.15] mb-3">
                It takes a village.<br />Studio Luna is jouw mama tribe.
              </h1>
              <p className="text-foreground/65 leading-relaxed mb-6">
                Een plek om te ontspannen, te bewegen en te connecten — met jezelf, je baby én andere vrouwen.
              </p>
              <button
                onClick={() => document.getElementById('rooster')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all group"
              >
                Reserveer jouw plekje
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* QUICK INFO STRIP */}
        <div className="mx-6 mt-6 rounded-2xl border border-border/40 bg-card/60 px-4 py-3 grid grid-cols-2 gap-x-3 gap-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Calendar className="w-4 h-4 shrink-0 text-primary" />
            <span>Elke dinsdag 19:00</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <MapPin className="w-4 h-4 shrink-0 text-primary" />
            <span>Huize Mooisteen</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Sparkles className="w-4 h-4 shrink-0 text-primary" />
            <span>Proefles € 10,-</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Coffee className="w-4 h-4 shrink-0 text-primary" />
            <span>Inclusief thee</span>
          </div>
        </div>

        {/* OVER DE LES */}
        <div className="px-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-2xl font-medium mb-3">Sterk, ontspannen en vol vertrouwen</h2>
            <p className="text-foreground/65 leading-relaxed mb-3">
              Een moment van rust in een mooie maar ook intense periode. Met zachte houdingen houden we je veranderende lichaam sterk en flexibel.
            </p>
            <p className="text-foreground/65 leading-relaxed mb-3">
              Je leert luisteren naar de signalen van je lijf, we oefenen met de ademhaling en maken contact met je baby. Zodat jij vol vertrouwen richting de bevalling gaat.
            </p>
          </motion.div>
        </div>

        {/* DE LOCATIE */}
        <div className="mx-6 mt-6 rounded-3xl bg-secondary/80 border border-border/30 p-5">
          <h3 className="font-semibold text-foreground mb-2">📍 Huize Mooisteen</h3>
          <p className="text-sm text-foreground/65 leading-relaxed">
            Met vloerverwarming, zacht dimbaar licht en alle yoga props (kussens, blokken en dekens) die al voor je klaarliggen. Je hoeft alleen jezelf mee te brengen. 🤍
          </p>
        </div>

        {/* VERBINDEN */}
        <div className="mx-6 mt-4 rounded-3xl border border-dashed border-accent/60 bg-accent/10 p-5">
          <h3 className="font-semibold text-foreground mb-2">☕️ Na de les</h3>
          <p className="text-sm text-foreground/65 leading-relaxed">
            Je hoeft na de les niet meteen naar huis. Er is tijd voor verse thee en verbinden met andere (aanstaande) mama's. Een veilige plek om ervaringen te delen, herkenning te vinden en samen op te laden. Je hoeft het niet alleen te doen.
          </p>
        </div>

        {/* ROOSTER */}
        <div id="rooster" className="pt-8 px-6">
          <h2 className="font-display text-2xl font-medium mb-1">Aankomende lessen</h2>
          <p className="text-sm text-foreground/50 mb-6">Zie ik jou op de mat? Klik om te reserveren.</p>

          <div className="space-y-4 mb-8">
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
