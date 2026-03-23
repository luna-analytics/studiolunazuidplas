import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const sections = [
  {
    title: "1. Creditsysteem",
    items: [
      "Studio Luna werkt met een fysiek creditsysteem dat in de studio wordt bijgehouden. Je hebt hiervoor geen app of pasje nodig.",
      "5 credits zijn 2 maanden geldig en 10 credits zijn 4 maanden geldig vanaf de datum van de eerste les.",
      "Studio Luna geeft in geen enkel geval geld terug. Het is niet mogelijk om (een deel van) het aankoopbedrag van je credits terug te krijgen.",
    ],
  },
  {
    title: "2. Coulance bij medische indicatie en bevalling",
    items: [
      "Mocht je voor de 37 weken bevallen, of door een medische indicatie je credits niet kunnen opmaken binnen de geldigheidsduur, dan bevriezen we je overgebleven tegoed.",
      "Je kunt deze overgebleven credits tot 4 maanden na je bevalling opmaken bij de postnatale yogalessen.",
      "Een overgebleven yoga-credit kan ook worden ingezet voor een ticket voor de Mama Circle (hiervoor geldt een bijbetaling van € 4,50).",
    ],
  },
  {
    title: "3. Afmelden voor reguliere yogalessen",
    items: [
      "Ben je verhinderd? Meld je dan tijdig af via de website waar je de les hebt geboekt.",
      "Afmelden kan kosteloos tot uiterlijk 12:00 uur op de dag van de les.",
      "Bij een latere afmelding of no-show wordt de les (1 credit) in rekening gebracht.",
    ],
  },
  {
    title: "4. Afmelden voor specials & workshops",
    items: [
      "Meld je uiterlijk 48 uur van tevoren af via de website voor een special of workshop (Circles, Birth Prep, Mama Spa, Partnerles).",
      "Bij afzeggingen binnen 48 uur voor aanvang wordt het volledige bedrag in rekening gebracht. Je mag in overleg wel altijd zelf een vervanger in jouw plaats laten deelnemen.",
    ],
  },
  {
    title: "5. Wijzigingen vanuit Studio Luna",
    items: [
      "Studio Luna behoudt zich het recht voor om lessen of workshops te annuleren bij overmacht of te weinig aanmeldingen. Je behoudt in dat geval je credit of je betaling.",
      "Studio Luna heeft het recht om indien nodig een docent te wijzigen of vervanging in te zetten.",
    ],
  },
];

export function AlgemeneVoorwaardenModal({ isOpen, onClose }: Props) {
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
                  <h2 className="font-display text-lg font-medium text-foreground">Algemene Voorwaarden</h2>
                  <p className="text-xs text-foreground/45 mt-0.5">Studio Luna</p>
                </div>
                <button onClick={onClose} className="text-foreground/40 hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* CONTENT */}
              <div className="overflow-y-auto px-6 py-5 space-y-6 pb-10">
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
