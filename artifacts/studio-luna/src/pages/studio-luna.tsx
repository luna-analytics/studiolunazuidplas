import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { MapPin, Heart, Sparkles, Users, ArrowRight, Mail, Phone, Instagram } from "lucide-react";

export default function StudioLuna() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-16 md:pt-16 flex justify-center">
      <div className="w-full max-w-5xl bg-background min-h-screen relative">

        {/* HERO */}
        <div className="relative pt-12 md:pt-16 pb-12 px-6 md:px-12 lg:px-16 md:mx-6 md:mt-6 bg-secondary overflow-hidden rounded-b-[2.5rem] md:rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-secondary/90 to-secondary md:bg-none" />
          <div className="relative z-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="lg:max-w-xl">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="overflow-hidden flex justify-center lg:hidden mb-5" style={{ height: '232px' }}>
                  <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-80 w-auto" />
                </div>
                <h1 className="font-display text-4xl lg:text-5xl font-medium text-foreground leading-[1.15] mb-3">
                  It takes a village.<br />Studio Luna is jouw mama tribe.
                </h1>
                <button
                  onClick={() => navigate("/rooster")}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all group"
                >
                  Reserveer jouw plekje
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            </div>
            <div className="hidden lg:flex items-center justify-center shrink-0">
              <div className="overflow-hidden opacity-60" style={{ height: '232px' }}>
                <img src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`} alt="Studio Luna" className="h-80 w-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-6 md:px-12 lg:px-16 pt-6 space-y-4 mb-8">

          {/* De missie */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="bg-card rounded-3xl p-6 border border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-display text-xl font-medium text-foreground">De missie</h2>
            </div>
            <ul className="space-y-1.5 mb-4">
              {[
                "Een plek om te landen.",
                "Een plek om fysiek sterk, gezond en in balans te blijven.",
                "Een plek om vertrouwen te vinden in je veranderende lichaam.",
                "Een plek om te connecten met andere moeders.",
                "Studio Luna is jouw mama tribe.",
              ].map((item, i) => (
                <li key={i} className="text-sm font-medium text-foreground/80 leading-relaxed">{item}</li>
              ))}
            </ul>
            <p className="text-foreground/70 text-sm leading-relaxed mb-3">
              Het moederschap hoef je niet alleen te doen. De missie van Studio Luna is het faciliteren van een community voor alle vrouwen in Nieuwerkerk aan den IJssel en omgeving, van zwangerschap tot ver daarna. Een veilige haven om fysiek op te laden, mentaal tot rust te komen en bovenal in verbinding te staan met andere moeders in dezelfde fase.
            </p>
            <p className="text-sm font-medium text-foreground/80">Welkom in jouw village.</p>
          </motion.div>

          {/* Wat biedt Studio Luna */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-card rounded-3xl p-6 border border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <h2 className="font-display text-xl font-medium text-foreground">Wat biedt Studio Luna</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Kleine groepen, veel aandacht en persoonlijk contact.",
                "Tijdens zwangerschapsyoga bereid je je lichaam voor op de bevalling, leer je de kracht van je adem gebruiken, blijf je fysiek sterk en leer je rust te vinden.",
                "Na afloop altijd tijd voor een kopje thee en verbinding.",
                "Instromen op elk moment mogelijk vanaf 14 weken zwangerschap.",
                "Een WhatsApp-community voor vragen, tips en verbinding tussen de lessen door.",
                "Aandacht voor zowel het fysieke als het mentale aspect van zwangerschap en moederschap.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/70">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary font-bold text-xs">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* De Mama Circle */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card rounded-3xl p-6 border border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-foreground/60" />
              </div>
              <h2 className="font-display text-xl font-medium text-foreground">De Mama Circle</h2>
            </div>
            <p className="text-foreground/70 text-sm leading-relaxed mb-3">
              It takes a village. Verbinden met andere (aanstaande) mama's in een veilige plek om ervaringen te delen, herkenning te vinden en samen op te laden.
            </p>
            <p className="text-foreground/70 text-sm leading-relaxed">Je hoeft het niet alleen te doen.</p>
          </motion.div>

          {/* Locatie */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.12 }}
            className="bg-card rounded-3xl p-6 border border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-foreground/60" />
              </div>
              <h2 className="font-display text-xl font-medium text-foreground">Locatie</h2>
            </div>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Onze lessen vinden plaats bij <span className="font-semibold text-foreground">Huize Mooisteen</span>
            </p>
            <p className="text-foreground/60 text-sm mt-1">Pr. Beatrixstraat 2, Nieuwerkerk aan den IJssel</p>
            <a href="https://maps.google.com/?q=Pr.+Beatrixstraat+2,+Nieuwerkerk+aan+den+IJssel" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <MapPin className="w-4 h-4" />
              Bekijk op kaart
            </a>
          </motion.div>

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-card rounded-3xl p-6 border border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-foreground/60" />
              </div>
              <h2 className="font-display text-xl font-medium text-foreground">Contact</h2>
            </div>
            <div className="space-y-3">
              <a href="mailto:info@studiolunazuidplas.nl"
                className="flex items-center gap-3 text-sm text-foreground/70 hover:text-foreground transition-colors group">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="group-hover:underline">info@studiolunazuidplas.nl</span>
              </a>
              <a href="https://wa.me/31643735343" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-foreground/70 hover:text-foreground transition-colors group">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="group-hover:underline">+31 6 43 73 53 43 (WhatsApp)</span>
              </a>
              <a href="https://www.instagram.com/studiolunazuidplas" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-foreground/70 hover:text-foreground transition-colors group">
                <Instagram className="w-4 h-4 text-primary shrink-0" />
                <span className="group-hover:underline">@studiolunazuidplas</span>
              </a>
            </div>
          </motion.div>

        </div>

        <BottomNav />
      </div>
    </div>
  );
}
