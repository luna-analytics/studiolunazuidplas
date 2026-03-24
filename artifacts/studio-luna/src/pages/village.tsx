import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { LoginModal } from "@/components/login-modal";
import { motion } from "framer-motion";
import { useState } from "react";
import { FileText, Video, BookOpen, LogIn, Lock, Headphones } from "lucide-react";

export default function Village() {
  const { user, loading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const isVillager = user && !user.isAdmin;

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        {/* HEADER */}
        <div className="px-6 md:px-12 lg:px-16 pt-14 md:pt-12 pb-12 bg-secondary md:rounded-3xl md:mx-6 md:mt-6 flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground">De Village</h1>
            <p className="text-foreground/55 text-sm mt-1">Exclusief voor Studio Luna leden</p>
          </motion.div>
          <div className="overflow-hidden shrink-0" style={{ height: '95px' }}>
            <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-32 w-auto" />
          </div>
        </div>

        <div className="px-6 md:px-12 lg:px-16 pt-6 mb-8 space-y-4">

          {loading ? null : !isVillager ? (
            /* NOT LOGGED IN */
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/30 rounded-3xl p-8 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-foreground/50" />
              </div>
              <h2 className="font-display text-xl font-medium mb-2">Alleen voor leden</h2>
              <p className="text-sm text-foreground/60 mb-6 leading-relaxed max-w-xs">
                De Village is een besloten plek voor Studio Luna leden. Log in om toegang te krijgen tot downloads, video's en aanbevelingen.
              </p>
              <button
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Inloggen
              </button>
            </motion.div>
          ) : (
            /* LOGGED IN MEMBER */
            <>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-foreground/60 leading-relaxed"
              >
                Welkom in jouw eigen village, {user.name.split(" ")[0]} 🌿 Hier vind je alles wat je extra ondersteunt op jouw reis.
              </motion.p>

              {/* PDF DOWNLOADS */}
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="rounded-3xl bg-secondary border border-border/30 p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display text-lg font-medium text-foreground">Downloads</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Geboorte-affirmaties van Studio Luna", sub: "PDF · binnenkort beschikbaar" },
                    { title: "Ademhalingsoefeningen voor thuis", sub: "PDF · binnenkort beschikbaar" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3 flex items-center justify-between gap-3 opacity-50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-foreground/50 mt-0.5">{item.sub}</p>
                      </div>
                      <FileText className="w-4 h-4 text-foreground/30 shrink-0" />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* VIDEO'S */}
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-3xl bg-secondary border border-border/30 p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display text-lg font-medium text-foreground">Video's</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "3 minuten ademhaling voor rust", sub: "Video · binnenkort beschikbaar" },
                    { title: "Zachte bekkenovefeningen", sub: "Video · binnenkort beschikbaar" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3 flex items-center justify-between gap-3 opacity-50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-foreground/50 mt-0.5">{item.sub}</p>
                      </div>
                      <Video className="w-4 h-4 text-foreground/30 shrink-0" />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* BOEKEN & PODCASTS */}
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-3xl bg-secondary border border-border/30 p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display text-lg font-medium text-foreground">Boeken & Podcasts</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Aanbevolen boeken", sub: "Lijst · binnenkort beschikbaar", icon: BookOpen },
                    { title: "Favoriete podcasts", sub: "Lijst · binnenkort beschikbaar", icon: Headphones },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl bg-background/60 border border-border/20 px-4 py-3 flex items-center justify-between gap-3 opacity-50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-foreground/50 mt-0.5">{item.sub}</p>
                      </div>
                      <item.icon className="w-4 h-4 text-foreground/30 shrink-0" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>

        <BottomNav />
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    </div>
  );
}
