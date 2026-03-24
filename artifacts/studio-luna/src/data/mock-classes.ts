export type StudioClass = {
  id: string;
  title: string;
  time: string;
  teacher: string;
  spotsTotal: number;
  spotsAvailable: number;
  description: string;
  type: 'yoga' | 'circle';
  dates: string[];
};

export const MOCK_CLASSES: StudioClass[] = [
  {
    id: "c1",
    title: "Restorative Zwangerschapsyoga",
    time: "19:00",
    teacher: "Marjolein",
    spotsTotal: 8,
    spotsAvailable: 8,
    description: "Een zachte start: Vind diepe ontspanning en maak ruimte voor je baby met zachte yoga, kussens en dekens. Even helemaal niets moeten.",
    type: "yoga",
    dates: ["2026-04-28", "2026-05-05", "2026-05-12"],
  },
  {
    id: "c2",
    title: "Zwangerschapsyoga",
    time: "19:00",
    teacher: "Marjolein",
    spotsTotal: 8,
    spotsAvailable: 8,
    description: "Een versterkende en ontspannende yogales die jou ondersteunt in je reis naar de bevalling. Elke les focussen we op een ander thema.",
    type: "yoga",
    dates: ["2026-05-26", "2026-06-02", "2026-06-09"],
  },
];
