import { useState, useMemo, useEffect } from "react";
import { parseISO, isFuture, isToday, format } from "date-fns";
import { nl } from "date-fns/locale";
import { useClasses } from "@/hooks/use-classes";
import { ReserveerModal } from "@/components/reserveer-modal";
import { BottomNav } from "@/components/bottom-nav";
import { SeoFooter } from "@/components/seo-footer";
import { motion } from "framer-motion";
import { Clock, Users, MapPin, Info } from "lucide-react";
import { useLocation } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type LesType = { id: string; naam: string; kleur: string; beschrijving?: string };

const KLEUR_MAP: Record<string, { bg: string; text: string }> = {
  groen:       { bg: "#8fa89b", text: "#ffffff" },
  terra:       { bg: "#c78d76", text: "#ffffff" },
  roze:        { bg: "#d5b9b2", text: "#5c3a3a" },
  beige:       { bg: "#d9cfc4", text: "#5c4a3a" },
  donkergroen: { bg: "#3a4f41", text: "#ffffff" },
  lila:        { bg: "#9b8ea8", text: "#ffffff" },
  geel:        { bg: "#d4b96a", text: "#5a3c00" },
  blauw:       { bg: "#7a9eb5", text: "#ffffff" },
};

const FALLBACK = { bg: "#8fa89b", text: "#ffffff" };

type ClassInstance = {
  classId: string;
  title: string;
  time: string;
  teacher: string;
  spotsTotal: number;
  spotsAvailable: number;
  description: string;
  type: string;
  date: Date;
  dateStr: string;
  dateLabel: string;
};

export default function Rooster() {
  const [, navigate] = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<ClassInstance | null>(null);
  const { classes, loading: classesLoading, refetch: refetchClasses } = useClasses();
  const [lesTypes, setLesTypes] = useState<LesType[]>([]);

  useEffect(() => {
    fetch(`${BASE}/api/class-types`)
      .then((r) => r.ok ? r.json() : [])
      .then(setLesTypes)
      .catch(() => {});
  }, []);

  const getColors = (typeId: string) => {
    const lesType = lesTypes.find((t) => t.id === typeId);
    return KLEUR_MAP[lesType?.kleur ?? ""] ?? FALLBACK;
  };

  const getLabel = (typeId: string) =>
    lesTypes.find((t) => t.id === typeId)?.naam ?? typeId;

  const hasAanbodLink = (typeId: string) => {
    if (typeId === "yoga" || typeId === "circle") return true;
    return !!(lesTypes.find((t) => t.id === typeId)?.beschrijving?.trim());
  };

  const upcomingInstances = useMemo((): ClassInstance[] => {
    const instances: ClassInstance[] = [];
    for (const cls of classes) {
      for (const dateStr of cls.dates) {
        const date = parseISO(dateStr);
        if (isFuture(date) || isToday(date)) {
          instances.push({
            classId: cls.id,
            title: cls.title,
            time: cls.time,
            teacher: cls.teacher,
            spotsTotal: cls.spotsTotal,
            spotsAvailable: (cls as any).spotsByDate?.[dateStr] ?? cls.spotsTotal,
            description: cls.description,
            type: cls.type,
            date,
            dateStr,
            dateLabel: format(date, "EEEE d MMMM", { locale: nl }),
          });
        }
      }
    }
    return instances.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [classes]);

  const handleReserveer = (instance: ClassInstance) => {
    setSelected(instance);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    refetchClasses();
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        {/* HEADER */}
        <div className="px-6 md:px-12 lg:px-16 pt-14 md:pt-12 pb-12 bg-secondary md:rounded-3xl md:mx-6 md:mt-6 flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">Rooster</h1>
            <p className="text-foreground/60 mt-2 text-sm">Zie ik jou op de mat? Reserveer jouw plekje.</p>
          </motion.div>
          <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-24 w-auto shrink-0" loading="lazy" />
        </div>

        {/* LESSEN */}
        <div className="px-6 md:px-12 lg:px-16 pt-6 mb-6">
          <div className="space-y-4">
            {classesLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : upcomingInstances.length > 0 ? (
              upcomingInstances.map((instance, i) => {
                const colors = getColors(instance.type);
                const isFull = instance.spotsAvailable <= 0;

                return (
                  <motion.div
                    key={`${instance.classId}-${instance.dateStr}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-3xl overflow-hidden shadow-sm border border-border/30"
                    style={{ backgroundColor: colors.bg + "18" }}
                  >
                    {/* Kleurstrook + datum + type */}
                    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest capitalize" style={{ color: colors.bg }}>
                        {instance.dateLabel}
                      </span>
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: colors.bg + "30", color: colors.bg }}
                      >
                        {getLabel(instance.type)}
                      </span>
                    </div>

                    <div className="px-5 pb-5">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{instance.title}</h3>
                      <p className="text-sm text-foreground/60 mb-3 leading-relaxed">{instance.description}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-4">
                        <span className="flex items-center gap-1 text-foreground/60">
                          <Clock className="w-3.5 h-3.5" />
                          {instance.time}
                        </span>
                        <span className={`flex items-center gap-1 font-medium ${
                          isFull ? "text-red-500" : instance.spotsAvailable <= 2 ? "text-orange-500" : "text-foreground/60"
                        }`}>
                          <Users className="w-3.5 h-3.5" />
                          {isFull
                            ? "Vol"
                            : `${instance.spotsAvailable} ${instance.spotsAvailable === 1 ? "plek" : "plekken"} beschikbaar`}
                        </span>
                        <span className="flex items-center gap-1 text-foreground/60">
                          <MapPin className="w-3.5 h-3.5" />
                          Huize Mooisteen
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {isFull ? (
                          <div className="w-full py-2.5 rounded-2xl text-center text-sm font-semibold bg-foreground/10 text-foreground/40">
                            Vol
                          </div>
                        ) : (
                          <button
                            onClick={() => handleReserveer(instance)}
                            className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98]"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            Reserveer jouw plekje
                          </button>
                        )}
                        {hasAanbodLink(instance.type) && (
                          <button
                            onClick={() => navigate(`/aanbod#${instance.type}`)}
                            className="w-full py-2 rounded-2xl text-sm font-medium flex items-center justify-center gap-1.5 text-foreground/50 hover:text-foreground transition-colors"
                          >
                            <Info className="w-3.5 h-3.5" />
                            Meer info over dit aanbod
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-card/50 border border-dashed border-border rounded-3xl p-10 text-center">
                <p className="text-sm text-muted-foreground">Geen aankomende lessen gevonden.</p>
              </div>
            )}
          </div>
        </div>

        <div className="pb-8" />
        <SeoFooter />
        <BottomNav />

        {selected && (
          <ReserveerModal
            isOpen={modalOpen}
            onClose={handleClose}
            classId={selected.classId}
            classTitle={selected.title}
            dateLabel={selected.dateLabel}
            dateStr={selected.dateStr}
            time={selected.time}
            type={selected.type}
          />
        )}
      </div>
    </div>
  );
}
