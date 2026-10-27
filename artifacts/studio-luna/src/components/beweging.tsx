import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

// Beweging naar het voorbeeld van akoko.nl (haar referentie, 27 oktober):
// foto's die langzaam in elkaar overlopen, een zin die bij het scrollen
// samenkomt en foto's die een klein beetje meebewegen. Alles is gekoppeld aan
// het scrollen of loopt rustig vanzelf; het is dus niet de fade-up die elk
// blok bij binnenkomst kreeg en die in september is weggehaald. Met "minder
// beweging" aan staat alles stil.

/** Brede foto van rand tot rand die rustig wisselt tussen een paar beelden. */
export function WisselFoto({
  fotos,
  alt,
  hoogte,
  positie = "center 40%",
  interval = 6000,
}: {
  fotos: string[];
  alt: string;
  hoogte: string;
  positie?: string;
  interval?: number;
}) {
  const stil = useReducedMotion();
  const [actief, setActief] = useState(0);
  const [geladen, setGeladen] = useState(false);

  // De eerste foto laadt meteen; de rest pas als de pagina staat.
  useEffect(() => {
    const t = setTimeout(() => setGeladen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (stil || !geladen || fotos.length < 2) return;
    const t = setInterval(() => setActief((i) => (i + 1) % fotos.length), interval);
    return () => clearInterval(t);
  }, [stil, geladen, fotos.length, interval]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: hoogte }}>
      {fotos.map((src, i) =>
        i === 0 || geladen ? (
          <img
            key={src}
            src={src}
            alt={i === 0 ? alt : ""}
            aria-hidden={i === 0 ? undefined : true}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1800ms] ease-in-out motion-reduce:transition-none"
            style={{ objectPosition: positie, opacity: i === actief ? 1 : 0 }}
          />
        ) : null,
      )}
    </div>
  );
}

function Woord({
  children,
  voortgang,
  bereik,
  van,
}: {
  children: string;
  voortgang: MotionValue<number>;
  bereik: [number, number];
  van: { x: number; y: number };
}) {
  const opacity = useTransform(voortgang, bereik, [0.06, 1]);
  const x = useTransform(voortgang, bereik, [van.x, 0]);
  const y = useTransform(voortgang, bereik, [van.y, 0]);
  return (
    <motion.span style={{ opacity, x, y, display: "inline-block" }} aria-hidden="true">
      {children}
    </motion.span>
  );
}

// Vaste, wat onregelmatige startplekken, zodat de woorden van verschillende
// kanten komen in plaats van allemaal tegelijk omhoog te schuiven.
const STARTPLEKKEN = [
  { x: -28, y: 22 }, { x: 18, y: -20 }, { x: -10, y: 28 }, { x: 30, y: 8 },
  { x: -22, y: -16 }, { x: 14, y: 24 }, { x: -30, y: -6 }, { x: 22, y: -26 },
];

/** Eén zin die woord voor woord samenkomt terwijl je scrolt. Hooguit één keer
 *  per pagina, en alleen met een zin van haar zelf. */
export function ScrollZin({ tekst, className }: { tekst: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const stil = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.5"] });

  if (stil) return <p ref={ref} className={className}>{tekst}</p>;

  const woorden = tekst.split(" ");
  // Elk woord krijgt een eigen stuk van het scrollen, met overlap, zodat het
  // samenkomen als één beweging voelt.
  const stuk = 1 / (woorden.length + 2);
  return (
    <p ref={ref} className={className} aria-label={tekst}>
      {woorden.map((woord, i) => (
        <span key={i}>
          <Woord
            voortgang={scrollYProgress}
            bereik={[i * stuk, Math.min(1, i * stuk + 3 * stuk)]}
            van={STARTPLEKKEN[i % STARTPLEKKEN.length]}
          >
            {woord}
          </Woord>
          {i < woorden.length - 1 ? " " : null}
        </span>
      ))}
    </p>
  );
}

/** Schuift een element een klein stukje mee terwijl je langs scrolt.
 *  afstand in pixels: positief beweegt omhoog, negatief omlaag. */
export function Meebewegen({
  children,
  afstand = 40,
  className,
}: {
  children: React.ReactNode;
  afstand?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const stil = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [afstand, -afstand]);
  return (
    <motion.div ref={ref} className={className} style={stil ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

/** Brede foto waarin het beeld langzamer beweegt dan de pagina, alsof je
 *  door een raam kijkt. */
export function RaamFoto({
  src,
  alt,
  hoogte,
  positieX = "center",
}: {
  src: string;
  alt: string;
  hoogte: string;
  positieX?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const stil = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ height: hoogte }}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute left-0 w-full object-cover"
        style={{
          top: "-15%",
          height: "130%",
          objectPosition: `${positieX} center`,
          ...(stil ? {} : { y }),
        }}
      />
    </div>
  );
}
