import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudioClass } from "@/data/mock-classes";
import { useBookings } from "@/hooks/use-bookings";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studioClass: StudioClass | null;
  selectedDate: Date;
}

export function BookingModal({ isOpen, onClose, studioClass, selectedDate }: BookingModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { addBooking } = useBookings();

  if (!studioClass) return null;

  const isYoga = studioClass.type === 'yoga';
  const themeColorClass = isYoga ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground";
  const themeRingClass = isYoga ? "focus:ring-primary/20" : "focus:ring-accent/20";
  const themeBorderClass = isYoga ? "focus:border-primary" : "focus:border-accent";

  const formattedDate = selectedDate.toLocaleDateString('nl-NL', {
    weekday: 'long', 
    day: 'numeric', 
    month: 'long'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    
    setIsSubmitting(true);
    
    // Simulate network request
    setTimeout(() => {
      addBooking({
        classId: studioClass.id,
        className: studioClass.title,
        date: selectedDate.toISOString(),
        time: studioClass.time,
        type: studioClass.type
      });
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset after success
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setIsSuccess(false);
          setName("");
          setEmail("");
          setIsFirstTime(false);
        }, 300);
      }, 2500);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-background rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <button 
                onClick={onClose}
                className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 pt-10">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
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
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Bevestig je reservering
                    </p>
                    <h2 className="text-2xl font-display font-semibold mb-2">{studioClass.title}</h2>
                    <p className="text-foreground/80 font-medium">
                      {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)} • {studioClass.time}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-sm font-medium text-foreground ml-1">Jouw naam</label>
                      <input 
                        id="name"
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Hoe mogen we je noemen?"
                        className={cn(
                          "w-full px-4 py-3.5 bg-background border-2 border-border/60 rounded-2xl text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 shadow-sm",
                          themeBorderClass, themeRingClass, "focus:ring-4"
                        )}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-sm font-medium text-foreground ml-1">E-mailadres</label>
                      <input 
                        id="email"
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Voor je bevestiging"
                        className={cn(
                          "w-full px-4 py-3.5 bg-background border-2 border-border/60 rounded-2xl text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 shadow-sm",
                          themeBorderClass, themeRingClass, "focus:ring-4"
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsFirstTime(!isFirstTime)}
                        className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors",
                          isFirstTime 
                            ? (isYoga ? "bg-primary border-primary" : "bg-accent border-accent") 
                            : "border-border bg-background"
                        )}
                      >
                        {isFirstTime && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <label 
                        onClick={() => setIsFirstTime(!isFirstTime)}
                        className="text-sm text-foreground/80 cursor-pointer select-none"
                      >
                        Dit is mijn eerste keer bij Studio Luna
                      </label>
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit"
                        disabled={isSubmitting || !name || !email}
                        className={cn(
                          "w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                          themeColorClass,
                          isYoga ? "hover:shadow-primary/30" : "hover:shadow-accent/30",
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
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
