import { BottomNav } from "@/components/bottom-nav";
import { User, Settings, Heart, MessageCircleQuestion } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background pb-28 md:pb-8 flex justify-center">
      <div className="w-full max-w-md bg-background min-h-screen relative shadow-2xl shadow-black/5 md:border-x border-border/30">
        
        <div className="p-6 pt-12 pb-8 bg-card rounded-b-[3rem] shadow-soft">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-28 h-28 mb-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-full opacity-20 blur-xl animate-pulse" />
              <img 
                src={`${import.meta.env.BASE_URL}images/profile-avatar.png`} 
                alt="Profile Avatar" 
                className="w-full h-full rounded-full object-cover border-4 border-background shadow-lg relative z-10"
              />
            </div>
            
            <h1 className="font-display text-3xl font-medium text-foreground mb-1">Mama</h1>
            <p className="text-muted-foreground font-medium mb-6">Welkom in jouw village</p>
            
            <div className="w-full bg-background rounded-2xl p-5 shadow-inner-soft italic text-foreground/80 font-display">
              "Er is geen perfecte manier om een goede moeder te zijn, maar er zijn een miljoen manieren om een goede moeder te zijn."
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3 mt-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">Instellingen</h3>
          
          <button className="w-full bg-background border border-border/40 hover:bg-card hover:border-border/60 p-4 rounded-2xl flex items-center justify-between transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="font-medium">Persoonlijke gegevens</span>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground group-hover:rotate-90 transition-transform" />
          </button>

          <button className="w-full bg-background border border-border/40 hover:bg-card hover:border-border/60 p-4 rounded-2xl flex items-center justify-between transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-medium">Mijn favoriete lessen</span>
            </div>
          </button>

          <button className="w-full bg-background border border-border/40 hover:bg-card hover:border-border/60 p-4 rounded-2xl flex items-center justify-between transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-foreground/5 text-foreground/70 flex items-center justify-center">
                <MessageCircleQuestion className="w-5 h-5" />
              </div>
              <span className="font-medium">Hulp & Contact</span>
            </div>
          </button>
        </div>
        
        <div className="px-6 mt-8 mb-4 text-center">
          <p className="text-xs text-muted-foreground">Studio Luna App v1.0.0</p>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
