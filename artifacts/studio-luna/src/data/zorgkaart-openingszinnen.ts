// Openingszinnen per categorie van de zorgkaart, goedgekeurd door Marjolein op
// 17 september 2026 (zie TEKSTVOORSTELLEN-ZORGKAART.md in c:/dev/studio-luna).
//
// {aantal} wordt op de site het echte aantal aanbieders in die categorie. De
// rest van de zin is vaste tekst met namen en plaatsen. Daarom staat bij elke
// zin de lijst aanbieders waarop hij is gecontroleerd, plus de FAQ-vragen op de
// zorgkaart die dezelfde namen noemen. Verandert de lijst aanbieders van een
// categorie in src/data/zorgkaart.ts, dan stopt de build
// (scripts/prerender-shells.mjs) tot de zin, die FAQ-antwoorden en
// gecontroleerdMet zijn bijgewerkt. Nieuwe of andere tekst altijd eerst langs
// Marjolein; houd de opmaak hieronder precies zo, het buildscript leest hem uit.
export type Openingszin = {
  zin: string;
  // Toon deze zin in plaats van de intro, als ze hetzelfde zouden zeggen.
  vervangtIntro?: boolean;
  faq: string[];
  gecontroleerdMet: string[];
};

export const OPENINGSZINNEN: Record<string, Openingszin> = {
  "verloskundigen": {
    zin: "Op de Geboortezorgkaart Zuidplas staan {aantal} verloskundigenpraktijken, waarvan vier spreekuur houden in de gemeente zelf: in Nieuwerkerk aan den IJssel, Zevenhuizen, Moerkapelle en Moordrecht. De andere zes zitten in Capelle aan den IJssel en Rotterdam.",
    faq: ["Welke verloskundigen zijn er in Zuidplas?", "Welke verloskundige houdt spreekuur in Zevenhuizen of Moordrecht?"],
    gecontroleerdMet: [
      "Verloskundige Praktijk Een Goed Begin",
      "Verloskundigenpraktijk Zuidplas",
      "Ive Verloskundigen",
      "Verloskundigenpraktijk Gouda (Team Antje)",
      "Prinscapelle Verloskundigen",
      "Verloskundige Praktijk Tolmiea",
      "Verloskundige Praktijk Amarant",
      "Strea Nova Verloskundigen",
      "Jouw Vroedvrouw",
      "Frieda Vroedvrouwen",
    ],
  },
  "echos": {
    zin: "Voor een echo noemt de Geboortezorgkaart Zuidplas {aantal} echocentra: Baby Glow in Zevenhuizen en EchoKeten in Nieuwerkerk aan den IJssel, en vlakbij In Zwang Echografie in Gouda en BovenMaas Prenataal in Capelle aan den IJssel.",
    faq: ["Waar vind ik een echocentrum in Zuidplas?"],
    gecontroleerdMet: [
      "Baby Glow",
      "In Zwang Echografie",
      "EchoKeten",
      "BovenMaas Prenataal",
    ],
  },
  "kraamzorg": {
    zin: "Op de Geboortezorgkaart Zuidplas staan {aantal} kraamzorgaanbieders die in de regio werken, van regionale en landelijke organisaties tot zelfstandige kraamverzorgenden. Regel je kraamzorg het liefst in de eerste helft van je zwangerschap.",
    vervangtIntro: true,
    faq: ["Welke kraamzorgorganisaties werken in Zuidplas?"],
    gecontroleerdMet: [
      "Kraamzorg de Waarden",
      "Naviva Kraamzorg",
      "Ria's Kraamburo",
      "Kraamzorg de IJssel",
      "Marley's Kraamzorg",
      "De Kraamwolk",
      "Kraamzorg De Babynurse",
      "Kraamzorg Another Miracle",
      "Kraamzorg Sylvia",
    ],
  },
  "yoga-cursussen": {
    zin: "In Nieuwerkerk aan den IJssel noemt de Geboortezorgkaart Zuidplas drie cursussen om je op de bevalling voor te bereiden: de Geboortereeks van Studio Luna, HypnoBirthing van Mucha Mama en Vol Vertrouwen Bevallen. Samen Bevallen Gouda geeft cursussen in Gouda.",
    faq: [],
    gecontroleerdMet: [
      "Studio Luna Zuidplas",
      "Mucha Mama HypnoBirthing",
      "Vol Vertrouwen Bevallen",
      "Samen Bevallen Gouda",
    ],
  },
  "bekkenfysiotherapie": {
    zin: "Een bekkenfysiotherapeut vind je in Zuidplas in Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht en Moerkapelle. De Geboortezorgkaart Zuidplas noemt er {aantal}, samen met praktijken in Capelle aan den IJssel en Waddinxveen.",
    faq: [],
    gecontroleerdMet: [
      "YILA Bekkenfysiotherapie en Manuele Therapie",
      "Syntara Bekkenfysiotherapie",
      "Fysiotherapiepraktijk Joosten (PACA)",
      "Fysio4You",
      "Dynamis Schollevaar Fysiotherapie",
      "FS Fysio",
      "De Postpartum Fysio",
      "Fysiotherapie De Rozenburcht",
    ],
  },
  "doulas": {
    zin: "Op de Geboortezorgkaart Zuidplas staan {aantal} doula's: Doula Karin in Nieuwerkerk aan den IJssel, en daarnaast doula's uit Capelle aan den IJssel, Rotterdam en Leidschendam en een doula die in midden- en zuid-Nederland werkt.",
    faq: ["Welke doula's zijn er in en rond Zuidplas?"],
    gecontroleerdMet: [
      "Doula Karin",
      "Doula Sophie",
      "About You Holistic Doula",
      "Doula Marlies",
      "Doula Bianca",
      "Alies Verstegen",
      "Bella Mama",
    ],
  },
  "lactatiekundigen": {
    zin: "Voor hulp bij borstvoeding noemt de Geboortezorgkaart Zuidplas {aantal} lactatiekundigen. In Nieuwerkerk aan den IJssel zit Lactatiekundige Praktijk Liefde en Vertrouwen, en Nultien Borstvoeding komt onder meer in Nieuwerkerk bij je thuis.",
    faq: ["Waar vind ik hulp bij borstvoeding in Nieuwerkerk aan den IJssel?"],
    gecontroleerdMet: [
      "Lactatiekundige Praktijk Liefde en Vertrouwen",
      "Nultien Borstvoeding",
      "Nathalie Lactatiekundige Begeleiding",
      "Borstvoeding Gouda",
      "Lactatiekundigen Kraamzorg de Waarden",
      "Samen Sterk Lactatie en Coaching",
    ],
  },
  "sporten": {
    zin: "Zwanger of na je bevalling sporten kan in Zuidplas bij Spirit for Two in Nieuwerkerk aan den IJssel en bij PowerMama Zuidplas in Zevenhuizen. De Geboortezorgkaart Zuidplas noemt {aantal} plekken, ook in Capelle aan den IJssel, Rotterdam, Gouda en Waddinxveen.",
    faq: ["Waar kan ik zwanger sporten in Zuidplas?"],
    gecontroleerdMet: [
      "Spirit for Two",
      "PowerMama Zuidplas",
      "Mom in Balance Rotterdam",
      "SPORT•GOUDA, Zwanger & Fit",
      "Gezond Gouds, Zwanger en Mama Bootcamp",
      "Fysiotherapie Gezondheidscentrum Ommoord (Zovida)",
      "Zwembad Zevenkampse Ring (Sportfondsen)",
      "Gouwebad De Sniep",
    ],
  },
  "babymassage-babyspa": {
    zin: "Voor babymassage of een babyspa noemt de Geboortezorgkaart Zuidplas {aantal} aanbieders: Spirit for Two in Nieuwerkerk aan den IJssel, Bureau Babyzorg, dat onder meer in Zevenhuizen en Moerkapelle werkt, en Baby Spa Gouda.",
    faq: [],
    gecontroleerdMet: [
      "Baby Spa Gouda",
      "Spirit for Two",
      "Bureau Babyzorg",
    ],
  },
  "baby-dragen": {
    zin: "Voor hulp bij het dragen van je baby noemt de Geboortezorgkaart Zuidplas {aantal} aanbieders: Bureau Babyzorg, dat onder meer in Zevenhuizen en Moerkapelle werkt, en Draag me mee in Capelle aan den IJssel.",
    faq: [],
    gecontroleerdMet: [
      "Draag me mee",
      "Bureau Babyzorg",
    ],
  },
  "geboortefotografie": {
    zin: "Voor geboortefotografie noemt de Geboortezorgkaart Zuidplas {aantal} fotografen: Lotte Aerssens Fotografie in Gouda, Touched Photography, dat onder meer in Gouda en Rotterdam werkt, en Noa Fotografie, dat in heel Zuid-Holland werkt.",
    faq: [],
    gecontroleerdMet: [
      "Lotte Aerssens Fotografie",
      "Touched Photography",
      "Noa Fotografie",
    ],
  },
  "zwangerschaps-newborn-gezinsfotografie": {
    zin: "Voor een zwangerschapsshoot, newbornshoot of gezinsshoot noemt de Geboortezorgkaart Zuidplas {aantal} fotografen, onder wie I-AM Fotografie & Design in Nieuwerkerk aan den IJssel en Memorii Photography in Zevenhuizen. De andere drie zitten in Capelle aan den IJssel, Haastrecht en Gouda.",
    faq: [],
    gecontroleerdMet: [
      "I-AM Fotografie & Design",
      "Memorii Photography",
      "Pure Newborn Fotografie",
      "Foto Renée",
      "Lotte Aerssens Fotografie",
    ],
  },
  "steun-bij-verlies": {
    zin: "Voor steun bij het verlies van een kindje noemt de Geboortezorgkaart Zuidplas {aantal} plekken: een praktijk in Capelle aan den IJssel, begeleiding vanuit Delft die ook online kan, Stichting Make a Memory, die landelijk werkt, en begeleiding op een plek naar keuze in de regio.",
    faq: ["Waar vind ik steun bij het verlies van een kindje?"],
    gecontroleerdMet: [
      "Praktijk Rode Roos",
      "EC Coaching (Esther Cozijnsen)",
      "Stichting Make a Memory",
      "Groei naar de Toekomst (Marloes Lagendijk)",
    ],
  },
  "mentale-steun": {
    zin: "Voor mentale steun rond je zwangerschap of bevalling noemt de Geboortezorgkaart Zuidplas {aantal} hulpverleners, in Gouda, in Rotterdam vlak bij Capelle aan den IJssel, en een die afspreekt op een plek naar keuze in de regio.",
    faq: [],
    gecontroleerdMet: [
      "Bureau Visser (Jantine Visser)",
      "Praktijk voor Zwangerschap en Psychiatrie",
      "Groei naar de Toekomst (Marloes Lagendijk)",
    ],
  },
  "zwangerschapsmassage": {
    zin: "Een zwangerschapsmassage in Zuidplas kan bij Wellnessmassage Nieuwerkerk en bij Spirit for Two, allebei in Nieuwerkerk aan den IJssel. De Geboortezorgkaart Zuidplas noemt daarnaast QoQo Massage in Capelle aan den IJssel en Praktijk Proximaal in Gouda.",
    faq: [],
    gecontroleerdMet: [
      "Wellnessmassage Nieuwerkerk",
      "Spirit for Two",
      "QoQo Massage Capelle",
      "Praktijk Proximaal",
    ],
  },
  "osteopathie": {
    zin: "Onder osteopathie noemt de Geboortezorgkaart Zuidplas {aantal} praktijken, waarvan twee in Nieuwerkerk aan den IJssel: Gavin Maduro Osteopathie en Osteonieuwerkerk. De andere twee zitten in Capelle aan den IJssel en Gouda.",
    faq: [],
    gecontroleerdMet: [
      "Gavin Maduro Osteopathie",
      "Osteonieuwerkerk (Ronald Terlouw)",
      "Osteovisie",
      "Osteopathie Gouda (Jan Boom)",
    ],
  },
  "online": {
    zin: "Online hulp die je vanuit Zuidplas kunt volgen: de Geboortezorgkaart noemt {aantal} aanbieders, Postpartum Centrum Nederland, This is the Village en The Motherfood.",
    faq: [],
    gecontroleerdMet: [
      "Postpartum Centrum Nederland",
      "This is the Village",
      "The Motherfood",
    ],
  },
};
