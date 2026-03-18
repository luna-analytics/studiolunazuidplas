import { Users, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudioClass } from "@/data/mock-classes";

interface ClassCardProps {
  studioClass: StudioClass;
  isBooked: boolean;
  onBook: (studioClass: StudioClass) => void;
}

export function ClassCard({ studioClass, isBooked, onBook }: ClassCardProps) {
  const isYoga = studioClass.type === 'yoga';
  const isFull = studioClass.spotsAvailable === 0;
  
  return (
    <div className="bg-card rounded-3xl p-5 shadow-soft border border-white/40 flex flex-col transition-all duration-300 hover:shadow-[0_12px_40px_rgba(58,79,65,0.08)] relative overflow-hidden group">
      {/* Decorative background element */}
      <div className={cn(
        "absolute -right-16 -top-16 w-32 h-32 rounded-full opacity-10 blur-2xl transition-transform duration-700 group-hover:scale-150",
        isYoga ? "bg-primary" : "bg-accent"
      )} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <span className={cn(
            "text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full",
            isYoga 
              ? "bg-primary/10 text-primary" 
              : "bg-accent/10 text-accent"
          )}>
            {isYoga ? "Yoga" : "Circle"}
          </span>
          <h3 className="text-xl font-display font-semibold mt-3 leading-tight">{studioClass.title}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed relative z-10">
        {studioClass.description}
      </p>

      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-foreground/80 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Clock className={cn("w-4 h-4", isYoga ? "text-primary" : "text-accent")} />
          <span className="font-medium">{studioClass.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className={cn("w-4 h-4", isYoga ? "text-primary" : "text-accent")} />
          <span className="font-medium">{studioClass.teacher}</span>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <Users className={cn("w-4 h-4", isYoga ? "text-primary" : "text-accent")} />
          <span>
            {isFull 
              ? <span className="text-destructive font-medium">Volgeboekt</span> 
              : <span><span className="font-medium">{studioClass.spotsAvailable}</span> van de {studioClass.spotsTotal} plekken vrij</span>
            }
          </span>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        {isBooked ? (
          <div className="w-full py-3.5 rounded-2xl bg-foreground/5 text-foreground font-semibold text-center flex items-center justify-center gap-2 border border-foreground/10">
            Je bent ingeschreven
          </div>
        ) : (
          <button
            onClick={() => onBook(studioClass)}
            disabled={isFull}
            className={cn(
              "w-full py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-sm",
              isFull 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : isYoga
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/20 active:scale-[0.98]"
                  : "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-accent/20 active:scale-[0.98]"
            )}
          >
            {isFull ? "Wachtlijst (Binnenkort)" : "Boeken"}
          </button>
        )}
      </div>
    </div>
  );
}
