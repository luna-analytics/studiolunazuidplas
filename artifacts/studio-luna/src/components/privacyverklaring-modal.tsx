import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const sections = [
  {
    title: "1. Welke gegevens verzamelen we?",
    items: [
      "Je naam, e-mailadres en telefoonnummer (voor boekingen en contact via WhatsApp).",
      "Indien relevant: informatie over je zwangerschap of herstel (zodat we de lessen veilig kunnen aanpassen aan jouw lichaam).",
    ],
  },
  {
    title: "2. Waarom hebben we deze gegevens nodig?",
    items: [
      "Om je plekje in de les te reserveren.",
      "Om je een herinnering of update te sturen als een les wijzigt.",
      "Voor onze eigen administratie en facturatie.",
    ],
  },
  {
    title: "3. Delen met anderen",
    items: [
      "Studio Luna verkoopt je gegevens nooit aan derden. We delen je gegevens alleen met externe systemen die nodig zijn voor de bedrijfsvoering (zoals het boekingssysteem op de website of voor de facturatie).",
    ],
  },
  {
    title: "4. Jouw rechten",
    items: [
      "Je hebt altijd het recht om je gegevens in te zien, te laten aanpassen of te laten verwijderen. Wil je niet langer nieuws ontvangen of uit ons systeem gehaald worden? Stuur dan een berichtje via de website of WhatsApp.",
    ],
  },
];

export function PrivacyverklaringModal({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center"
          >
            <div className="w-full max-w-md bg-background rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: '88vh' }}>
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/30 shrink-0">
                <div>
                  <h2 className="font-display text-lg font-medium text-foreground">Privacyverklaring</h2>
                  <p className="text-xs text-foreground/45 mt-0.5">Studio Luna · Laatste aanpassing: maart 2026</p>
                </div>
                <button onClick={onClose} aria-label="Sluiten" className="w-11 h-11 -mr-2 flex items-center justify-center rounded-2xl text-foreground/60 hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* CONTENT */}
              <div className="overflow-y-auto px-6 py-5 space-y-6 pb-10">
                <p className="text-sm text-foreground/65 leading-relaxed">
                  Bij Studio Luna gaan we zorgvuldig om met je persoonlijke gegevens. Je deelt deze met ons zodat we je lessen kunnen inplannen en je op de hoogte kunnen houden.
                </p>
                {sections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-sm font-semibold text-foreground mb-2">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground/65 leading-relaxed">
                          <span className="text-primary shrink-0 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
