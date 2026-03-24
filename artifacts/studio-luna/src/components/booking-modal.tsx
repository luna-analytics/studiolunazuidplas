import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, CreditCard, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudioClass } from "@/data/mock-classes";
import { useBookings } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { useLocation } from "wouter";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studioClass: StudioClass | null;
  selectedDate: Date;
  dateStr: string;
}

export function BookingModal({ isOpen, onClose, studioClass, selectedDate, dateStr }: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const { user, refreshUser } = useAuth();
  const { addBooking } = useBookings(user?.id);
  const [, navigate] = useLocation();

  if (!studioClass) return null;

  const isYoga = studioClass.type === "yoga";
  const themeColorClass = isYoga ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground";
  const formattedDate = format(selectedDate, "EEEE d MMMM", { locale: nl });

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSuccess(false);
      setError("");
    }, 300);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await addBooking({
        classId: studioClass.id,
        className: studioClass.title,
        date: dateStr,
        time: studioClass.time,
        type: studioClass.type,
      });
      await refreshUser();
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message ?? "Er ging iets mis");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-background rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <button onClick={handleClose} className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 pt-10">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-10 space-y-4"
                >
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-2", themeColorClass)}>
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold">Geboekt!</h3>
                  <p className="text-muted-foreground">
                    Je plek voor <span className="font-medium text-foreground">{studioClass.title}</span> is gereserveerd. Tot snel bij Studio Luna 🌿
                  </p>
                </motion.div>
              ) : !user ? (
                <div className="flex flex-col items-center text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                    <LogIn className="w-6 h-6 text-foreground/60" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-medium mb-1">Log eerst in</h3>
                    <p className="text-sm text-foreground/60">Alleen leden kunnen reserveren. Log in via het tabblad Boekingen.</p>
                  </div>
                  <button
                    onClick={() => { handleClose(); navigate("/bookings"); }}
                    className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Naar inloggen
                  </button>
                </div>
              ) : user.credits <= 0 ? (
                <div className="flex flex-col items-center text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-foreground/60" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-medium mb-1">Geen credits meer</h3>
                    <p className="text-sm text-foreground/60">Je hebt geen credits meer. Neem contact op met Studio Luna om een pakket te kopen.</p>
                  </div>
                  <button onClick={handleClose} className="w-full py-3 rounded-2xl bg-secondary text-foreground font-semibold text-sm transition-colors">
                    Sluiten
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Bevestig je reservering</p>
                    <h2 className="text-2xl font-display font-semibold mb-1">{studioClass.title}</h2>
                    <p className="text-foreground/70 font-medium">
                      {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)} · {studioClass.time}
                    </p>
                  </div>

                  <div className="bg-secondary rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm text-foreground/70">
                      Er wordt <span className="font-semibold text-foreground">1 credit</span> afgeschreven. Je hebt er nog <span className="font-semibold text-foreground">{user.credits}</span>.
                    </p>
                  </div>

                  {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className={cn(
                      "w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg flex items-center justify-center disabled:opacity-50",
                      themeColorClass,
                      "active:scale-[0.98]"
                    )}
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      "Bevestig boeking"
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
