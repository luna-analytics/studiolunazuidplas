export type StudioClass = {
  id: string;
  title: string;
  time: string;
  teacher: string;
  spotsTotal: number;
  spotsAvailable: number;
  description: string;
  type: 'yoga' | 'circle';
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
};

export const MOCK_CLASSES: StudioClass[] = [
  {
    id: "c1",
    title: "Zwangerschapsyoga",
    time: "09:30 - 10:45",
    teacher: "Marjolein",
    spotsTotal: 12,
    spotsAvailable: 4,
    description: "Een zachte, ontspannende les om de week goed te beginnen. Focus op ademhaling en zachte stretches die veilig zijn tijdens elk trimester.",
    type: "yoga",
    dayOfWeek: 1, // Maandag
  },
  {
    id: "c2",
    title: "Zwangerschapsyoga",
    time: "19:00 - 20:15",
    teacher: "Marjolein",
    spotsTotal: 10,
    spotsAvailable: 8,
    description: "Een zachte yogales speciaal voor zwangere vrouwen. Aandacht voor ademhaling, ontspanning en verbinding met je lichaam en baby.",
    type: "yoga",
    dayOfWeek: 1, // Maandag
  },
  {
    id: "c3",
    title: "Postnatale Yoga",
    time: "10:00 - 11:15",
    teacher: "Sophie",
    spotsTotal: 8,
    spotsAvailable: 2,
    description: "Herstelgerichte yoga voor moeders na de bevalling (vanaf 6 weken). Versterk je core, vind rust en laad je batterijen op.",
    type: "yoga",
    dayOfWeek: 2, // Dinsdag
  },
  {
    id: "c4",
    title: "Mama Circle",
    time: "10:00 - 11:30",
    teacher: "Marjolein",
    spotsTotal: 12,
    spotsAvailable: 12,
    description: "Een warme bijeenkomst voor moeders om te verbinden, ervaringen te delen en kracht te vinden in gemeenschap. Babies zijn zeer welkom!",
    type: "circle",
    dayOfWeek: 3, // Woensdag
  },
  {
    id: "c5",
    title: "Zwangerschapsyoga",
    time: "18:30 - 19:45",
    teacher: "Sophie",
    spotsTotal: 12,
    spotsAvailable: 0, // Vol
    description: "Bereid je fysiek en mentaal voor op de bevalling in deze actievere flow, aangepast aan het zwangere lichaam.",
    type: "yoga",
    dayOfWeek: 4, // Donderdag
  },
  {
    id: "c6",
    title: "Postnatale Yoga",
    time: "20:00 - 21:15",
    teacher: "Marjolein",
    spotsTotal: 8,
    spotsAvailable: 6,
    description: "Herstelgerichte yoga voor moeders na de bevalling. Versterk je lichaam, vind rust en laad je batterijen op. Me-time pur sang.",
    type: "yoga",
    dayOfWeek: 4, // Donderdag
  },
  {
    id: "c7",
    title: "Relax & Restore Yoga",
    time: "16:00 - 17:15",
    teacher: "Sophie",
    spotsTotal: 10,
    spotsAvailable: 3,
    description: "Diepe ontspanning met veel kussens en bolsters. Perfect om het weekend in te luiden. Geschikt voor zwangeren.",
    type: "yoga",
    dayOfWeek: 5, // Vrijdag
  },
  {
    id: "c8",
    title: "Partner Workshop: Bevallen",
    time: "13:00 - 15:30",
    teacher: "Marjolein",
    spotsTotal: 6,
    spotsAvailable: 1,
    description: "Een praktische workshop voor jou en je (beval)partner. Leer massage technieken, bevalhoudingen en hoe je samen dit avontuur aangaat.",
    type: "circle",
    dayOfWeek: 6, // Zaterdag
  },
  {
    id: "c9",
    title: "Sunday Morning Flow",
    time: "10:00 - 11:15",
    teacher: "Sophie",
    spotsTotal: 12,
    spotsAvailable: 5,
    description: "Een zachte, intuïtieve flow om de zondag ontspannen te beginnen. Voor alle (aanstaande) moeders.",
    type: "yoga",
    dayOfWeek: 0, // Zondag
  }
];
