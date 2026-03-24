import { useLocation } from "wouter";
import { BottomNav } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { MapPin, Heart, Sparkles, Users, ArrowRight } from "lucide-react";

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
                  <img
                    src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`}
                    alt="Studio Luna"
                    className="h-80 w-auto"
                  />
                </div>
                <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl font-medium text-foreground leading-[1.15] mb-3">
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
                <img
                  src={`${import.meta.env.BASE_URL}images/studio-luna-logo.png`}
                  alt="Studio Luna"
                  className="h-80 w-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-6 md:px-12 lg:px-16 pt-6 space-y-4 mb-8">

          {/* Ons verhaal */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="bg-card rounded-3xl p-6 border border-border/30"
          >
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

          {/* Wat maakt ons bijzonder */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-card rounded-3xl p-6 border border-border/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <h2 className="font-display text-xl font-medium text-foreground">Wat maakt ons bijzonder</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Kleine groepen, veel aandacht en persoonlijk contact",
                "Lessen gegeven door een gecertificeerde zwangerschapsyogadocent",
                "Na afloop altijd tijd voor een kopje thee en verbinding",
                "Instromen op elk moment mogelijk vanaf 14 weken zwangerschap",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/70">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary font-bold text-xs">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Community */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card rounded-3xl p-6 border border-border/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-foreground/60" />
              </div>
              <h2 className="font-display text-xl font-medium text-foreground">De mama tribe</h2>
            </div>
            <p className="text-foreground/70 text-sm leading-relaxed mb-4">
              Naast de lessen hebben we een actieve WhatsApp-community waar zwangere vrouwen en mama's uit de regio Zuidplas elkaar vinden, vragen stellen en ervaringen delen.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#25D366]/10 text-[#128C7E] text-xs font-semibold px-3 py-2 rounded-2xl">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Community · Regio Zuidplas
            </div>
          </motion.div>

          {/* Locatie */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-card rounded-3xl p-6 border border-border/30"
          >
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
            <a
              href="https://maps.google.com/?q=Pr.+Beatrixstraat+2,+Nieuwerkerk+aan+den+IJssel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Bekijk op kaart
            </a>
          </motion.div>

        </div>

        <BottomNav />
      </div>
    </div>
  );
}
