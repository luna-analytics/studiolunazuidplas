/**
 * ZORGKAART GEBOORTEZORG REGIO ZUIDPLAS
 * ─────────────────────────────────────
 * Alle aanbieders rondom zwangerschap, bevalling en jong moederschap in en rond
 * gemeente Zuidplas (Nieuwerkerk aan den IJssel, Zevenhuizen, Moordrecht, Moerkapelle).
 *
 * Aanbieder toevoegen of aanpassen? Bewerk de lijsten hieronder. Elke aanbieder
 * heeft een of meer tags uit TAG_LABELS; voeg alleen tags toe die de eigen
 * website van de aanbieder bevestigt.
 */

export type ZorgTag =
  | "caseload"
  | "holistisch"
  | "op-locatie"
  | "aan-huis"
  | "online"
  | "avond-weekend"
  | "vergoeding"
  | "1-op-1"
  | "groepslessen"
  | "partner-welkom"
  | "thuisbevalling";

export const TAG_LABELS: Record<ZorgTag, { label: string; uitleg: string }> = {
  caseload: { label: "Caseload", uitleg: "Eén vaste verloskundige begeleidt je het hele traject, van eerste controle tot bevalling" },
  holistisch: { label: "Holistisch", uitleg: "Werkt vanuit een holistische of natuurlijke benadering" },
  "op-locatie": { label: "Op locatie", uitleg: "Je gaat naar een praktijk- of lesruimte" },
  "aan-huis": { label: "Aan huis", uitleg: "Komt bij je thuis" },
  online: { label: "Online", uitleg: "Ook of volledig online beschikbaar" },
  "avond-weekend": { label: "Avond en weekend", uitleg: "Ook buiten kantoortijden terecht" },
  vergoeding: { label: "Vergoeding mogelijk", uitleg: "De website noemt vergoeding vanuit de basis- of aanvullende verzekering; check altijd je eigen polis" },
  "1-op-1": { label: "1 op 1", uitleg: "Individuele begeleiding" },
  groepslessen: { label: "Groepslessen", uitleg: "Lessen of bijeenkomsten in groepsverband" },
  "partner-welkom": { label: "Partner welkom", uitleg: "Je partner kan meedoen of aanwezig zijn" },
  thuisbevalling: { label: "Thuisbevalling", uitleg: "Begeleidt bevallingen thuis" },
};

export type Zorgverlener = {
  naam: string;
  plaats: string;
  website: string;
  beschrijving: string;
  tags: ZorgTag[];
  /** Optioneel voordeel dat deze zorgverlener via Studio Luna aanbiedt,
   *  bijvoorbeeld een kortingscode of gratis kennismaking. Eén lopende zin. */
  voordeel?: string;
  /** Datum waarop deze vermelding op de kaart kwam, als 2026-08-30. Zolang die
   *  minder dan een week geleden is toont de kaart het woord nieuw naast de
   *  naam. Dat verdwijnt vanzelf, zonder dat de site opnieuw uitgerold hoeft
   *  te worden, want de vergelijking gebeurt in de browser van de bezoeker. */
  toegevoegd?: string;
};

const NIEUW_DAGEN = 7;

/** Staat deze vermelding er korter dan een week op? */
export function isNieuw(toegevoegd?: string): boolean {
  if (!toegevoegd) return false;
  const opgevoerd = new Date(`${toegevoegd}T00:00:00`).getTime();
  if (Number.isNaN(opgevoerd)) return false;
  const dagenGeleden = (Date.now() - opgevoerd) / 86_400_000;
  return dagenGeleden >= 0 && dagenGeleden < NIEUW_DAGEN;
}

export type ZorgCategorie = {
  id: string;
  titel: string;
  intro: string;
  zoektermen: string;
  aanbieders: Zorgverlener[];
};

/** Werk deze bij wanneer de kaart inhoudelijk verandert; hij staat zichtbaar
 *  op de pagina en in de structured data. */
export const LAATST_BIJGEWERKT = { tekst: "september 2026", iso: "2026-09-04" };

export const ZORGKAART: ZorgCategorie[] = [
  {
    id: "verloskundigen",
    titel: "Verloskundigen",
    intro: "Je verloskundige begeleidt je zwangerschap, je bevalling en de eerste dagen daarna. Neem al vroeg in je zwangerschap contact op.",
    zoektermen: "verloskundige vroedvrouw zwangerschapscontrole bevalling thuisbevalling caseload",
    aanbieders: [
      {
        naam: "Verloskundige Praktijk Een Goed Begin",
        plaats: "Nieuwerkerk aan den IJssel",
        website: "https://www.eengoedbegin.nl/",
        beschrijving: "Verloskundigenpraktijk met locaties in Nieuwerkerk aan den IJssel en Rotterdam die de gemeente Zuidplas bedient en thuisbevallingen, echo's en groepscursussen aanbiedt.",
        tags: ["op-locatie", "thuisbevalling", "partner-welkom", "groepslessen", "avond-weekend"],
      },
      {
        naam: "Verloskundigenpraktijk Zuidplas",
        plaats: "Zevenhuizen / Moerkapelle",
        website: "https://verloskundigenpraktijkzuidplas.nl/",
        beschrijving: "Verloskundigenpraktijk met spreekuurlocaties in Zevenhuizen en Moerkapelle, met een eigen echoapparaat op de praktijk en regelmatige begeleiding van thuisbevallingen.",
        tags: ["op-locatie", "thuisbevalling", "partner-welkom"],
      },
      {
        naam: "Ive Verloskundigen",
        plaats: "Waddinxveen (avondspreekuur in Zevenhuizen)",
        website: "https://www.ive-verloskundigen.nl/",
        beschrijving: "Kleinschalige verloskundigenpraktijk met drie verloskundigen in Waddinxveen en een avondlocatie in Zevenhuizen, met een werkgebied dat onder meer Zevenhuizen, Moordrecht en Gouda Westergouwe omvat.",
        tags: ["op-locatie", "thuisbevalling", "avond-weekend", "vergoeding"],
      },
      {
        naam: "Verloskundigenpraktijk Gouda (Team Antje)",
        plaats: "Gouda (wekelijks spreekuur in Moordrecht)",
        website: "https://www.verloskundigenpraktijkgouda.nl/",
        beschrijving: "Verloskundigenpraktijk in Gouda waarvan Team Antje verloskundige zorg biedt in Gouda, Gouderak en Moordrecht, met een wekelijks spreekuur in gezondheidscentrum de Hoeksteen in Moordrecht en een avondspreekuur in Gouda.",
        tags: ["op-locatie", "avond-weekend"],
      },
      {
        naam: "Prinscapelle Verloskundigen",
        plaats: "Capelle aan den IJssel",
        website: "https://prinscapelle.nl/",
        beschrijving: "Verloskundigenpraktijk in Capelle aan den IJssel die volgens de eigen site ook zwangeren uit Nieuwerkerk aan den IJssel en de Rotterdamse wijken Ommoord, Zevenkamp en Alexanderpolder verwelkomt, met verloskundige zorg, echo's en pretecho's.",
        tags: ["op-locatie"],
      },
      {
        naam: "Verloskundige Praktijk Tolmiea",
        plaats: "Rotterdam (Prins Alexander)",
        website: "https://verloskundigepraktijktolmiea.nl/",
        beschrijving: "Verloskundigenpraktijk aan het Jacob van Campenplein in Rotterdam die volgens de eigen site ook zwangeren uit Capelle aan den IJssel, Nieuwerkerk aan den IJssel en Zevenhuizen begeleidt bij controles, echo's en de bevalling.",
        tags: ["op-locatie"],
      },
      {
        naam: "Verloskundige Praktijk Amarant",
        plaats: "Capelle aan den IJssel / Rotterdam-Nesselande",
        website: "https://www.verloskundigepraktijkamarant.nl/",
        beschrijving: "Verloskundigenpraktijk met twee vaste verloskundigen en spreekuurlocaties in Capelle aan den IJssel en Rotterdam Nesselande, waarbij dezelfde verloskundigen de controles, de bevalling en de kraamtijd doen.",
        tags: ["op-locatie"],
      },
      {
        naam: "Strea Nova Verloskundigen",
        plaats: "Capelle aan den IJssel / Rotterdam-Nesselande",
        website: "https://www.streanova.nl/",
        beschrijving: "Verloskundigenpraktijk met spreekuurlocaties in Capelle aan den IJssel en gezondheidscentrum Zonboog in Rotterdam Nesselande.",
        tags: ["op-locatie"],
      },
      {
        naam: "Jouw Vroedvrouw",
        plaats: "Rotterdam-Noord",
        website: "https://www.jouwvroedvrouw.nl/",
        beschrijving: "Caseload-verloskundigenpraktijk aan de Bergselaan in Rotterdam-Noord met drie verloskundigen die elk hun eigen cliënten het hele traject begeleiden vanuit een holistische visie, met vier tot vijf zwangeren per maand per verloskundige en baden voor een watergeboorte.",
        tags: ["caseload", "holistisch", "op-locatie"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "Frieda Vroedvrouwen",
        plaats: "Rotterdam (Oostzeedijk)",
        website: "https://www.friedavroedvrouwen.nl/",
        beschrijving: "Kleinschalige praktijk voor semi-caseloadverloskunde aan de Oostzeedijk in Rotterdam, waar de vroedvrouwen samen zes tot acht vrouwen per maand begeleiden en een eigen echoscopiste met echoapparaat hebben.",
        tags: ["op-locatie"],
        toegevoegd: "2026-08-30",
      },
    ],
  },
  {
    id: "echos",
    titel: "Echo's en prenatale screening",
    intro: "Voor medische echo's zoals de 13 en 20 wekenecho verwijst je verloskundige je door; voor een pretecho kun je zelf terecht.",
    zoektermen: "echo pretecho 13 wekenecho 20 wekenecho geslachtsbepaling 3d 4d screening echocentrum",
    aanbieders: [
      {
        naam: "Baby Glow",
        plaats: "Zevenhuizen",
        website: "https://baby-glow.nl/",
        beschrijving: "Pretechobureau in Zevenhuizen voor geslachtsbepaling en 2D, 3D en 4D echo's, doordeweeks geopend tot 21:00 uur en op zaterdag tot 16:00 uur.",
        tags: ["op-locatie", "avond-weekend"],
      },
      {
        naam: "In Zwang Echografie",
        plaats: "Gouda",
        website: "https://www.inzwang.nl/echopraktijk/",
        beschrijving: "Echopraktijk in Gouda voor medische echo's zoals de 13 wekenecho, 20 wekenecho en termijnecho en daarnaast pretecho's, in samenwerking met verloskundigenpraktijken uit de regio Gouda en het Groene Hart Ziekenhuis.",
        tags: ["op-locatie", "partner-welkom"],
      },
      {
        naam: "EchoKeten",
        plaats: "Nieuwerkerk aan den IJssel (ook Capelle, Krimpen en Rotterdam)",
        website: "https://echoketen.nl/",
        beschrijving: "Echobureau voor screeningsecho's (13 en 20 wekenecho), opgericht door samenwerkende verloskundigenpraktijken, met het hoofdadres aan het Raadhuisplein in Nieuwerkerk aan den IJssel en locaties in Capelle aan den IJssel, Krimpen aan den IJssel en Rotterdam.",
        tags: ["op-locatie"],
      },
      {
        naam: "BovenMaas Prenataal",
        plaats: "Capelle aan den IJssel",
        website: "https://bovenmaasprenataal.nl/",
        beschrijving: "Echocentrum met hoofdlocatie aan de Floris Burgwal in Capelle aan den IJssel voor medische zwangerschapsecho's zoals de vitaliteitsecho, termijnecho, 13 wekenecho, 20 wekenecho en groeiecho, met spreekuurlocaties in Rotterdam en Den Haag.",
        tags: ["op-locatie"],
      },
    ],
  },
  {
    id: "kraamzorg",
    titel: "Kraamzorg",
    intro: "Kraamzorg regel je het liefst in de eerste helft van je zwangerschap. Deze organisaties en zelfstandige kraamverzorgenden werken in de regio.",
    zoektermen: "kraamverzorgende kraamweek kraamzorg kraambed",
    aanbieders: [
      {
        naam: "Kraamzorg de Waarden",
        plaats: "regionale organisatie (werkgebied dekt heel gemeente Zuidplas)",
        website: "https://www.kraamzorgdewaarden.nl/",
        beschrijving: "Kraamzorgorganisatie waarvan de eigen plaatsenlijst onder meer Nieuwerkerk aan den IJssel, Moordrecht, Zevenhuizen en Moerkapelle als werkgebied noemt.",
        tags: ["aan-huis"],
      },
      {
        naam: "Naviva Kraamzorg",
        plaats: "landelijke organisatie (eigen pagina voor Nieuwerkerk aan den IJssel e.o.)",
        website: "https://www.naviva.nl/kraamzorg-nieuwerkerk-aan-den-ijssel",
        beschrijving: "Landelijke kraamzorgorganisatie met een eigen werkgebiedpagina voor Nieuwerkerk aan den IJssel en omliggende kernen zoals Moordrecht, Zevenhuizen en Moerkapelle.",
        tags: ["aan-huis"],
      },
      {
        naam: "Ria's Kraamburo",
        plaats: "landelijk bureau (werkgebiedpagina's voor Nieuwerkerk aan den IJssel, Zevenhuizen en Moerkapelle)",
        website: "https://riaskraamburo.nl/kraamzorg-nieuwerkerk-aan-den-ijssel.php",
        beschrijving: "Kleinschalig kraamzorgbureau dat volgens de eigen site in Nieuwerkerk aan den IJssel, Zevenhuizen en Moerkapelle werkt en waarbij dezelfde kraamverzorgende het hele traject blijft.",
        tags: ["aan-huis", "1-op-1"],
      },
      {
        naam: "Kraamzorg de IJssel",
        plaats: "Capelle aan den IJssel",
        website: "https://kraamzorgdeijssel.nl/",
        beschrijving: "Kleinschalige kraamzorgpraktijk van een ervaren kraamverzorgende die volgens de eigen site werkt in Capelle aan den IJssel, Krimpen aan den IJssel, Nieuwerkerk aan den IJssel en Rotterdam.",
        tags: ["aan-huis", "1-op-1"],
      },
      {
        naam: "Marley's Kraamzorg",
        plaats: "Rotterdam (werkt in Nieuwerkerk aan den IJssel)",
        website: "https://www.marleyskraamzorg.nl/kraamzorg-nieuwerkerk",
        beschrijving: "Zelfstandige, KCKZ-erkende kraamverzorgende die volgens de eigen site kraamzorg aan huis geeft in Nieuwerkerk aan den IJssel en Rotterdam, met een vaste kraamverzorgende als aanspreekpunt.",
        tags: ["aan-huis", "1-op-1"],
      },
      {
        naam: "De Kraamwolk",
        plaats: "regio Zuid-Holland (werkgebied o.a. Moerkapelle, Moordrecht en Zevenhuizen)",
        website: "https://www.dekraamwolk.nl/kraamzorg-zuid-holland/",
        beschrijving: "Kraamzorgorganisatie in Zuid-Holland die volgens de eigen postcodelijst onder meer Moerkapelle, Moordrecht en Zevenhuizen bedient en op de site vermeldt dat kraamzorg thuis onder het basispakket valt.",
        tags: ["aan-huis", "vergoeding"],
      },
      {
        naam: "Kraamzorg De Babynurse",
        plaats: "Berkel en Rodenrijs (werkgebied o.a. Zevenhuizen)",
        website: "https://www.debabynurse.nl/",
        beschrijving: "Zelfstandig kraamverzorgende uit Berkel en Rodenrijs van wie het werkgebied volgens de eigen site onder meer Zevenhuizen omvat.",
        tags: ["aan-huis", "1-op-1"],
      },
      {
        naam: "Kraamzorg Another Miracle",
        plaats: "regio Rotterdam-Rijnmond (werkgebied o.a. Nieuwerkerk aan den IJssel en Zevenhuizen)",
        website: "https://www.kraamzorganothermiracle.com/",
        beschrijving: "Zelfstandige kraamzorgpraktijk in de regio Rijnmond waarvan de werkgebiedlijst op de eigen site onder meer Nieuwerkerk aan den IJssel, Zevenhuizen en Capelle aan den IJssel noemt.",
        tags: ["aan-huis", "1-op-1"],
      },
      {
        naam: "Kraamzorg Sylvia",
        plaats: "Zoetermeer (werkgebied o.a. Zevenhuizen en Moerkapelle)",
        website: "https://www.kraamzorgsylvia.nl/",
        beschrijving: "Kraamverzorgende uit Zoetermeer van wie het werkgebied volgens de eigen site Zevenhuizen en Moerkapelle omvat.",
        tags: ["aan-huis"],
      },
    ],
  },
  {
    id: "yoga-cursussen",
    titel: "Zwangerschapsyoga en geboortevoorbereiding",
    intro: "Cursussen en lessen die je voorbereiden op de bevalling en de eerste tijd met je baby.",
    zoektermen: "zwangerschapsyoga yoga geboortevoorbereiding zwangerschapscursus hypnobirthing samen bevallen cursus ademhaling",
    aanbieders: [
      {
        naam: "Studio Luna Zuidplas",
        plaats: "Nieuwerkerk aan den IJssel",
        website: "https://www.studiolunazuidplas.nl/geboortereeks",
        beschrijving: "Zwangerschapsyoga en geboortevoorbereiding in een vaste kleine groep; de Geboortereeks van acht wekelijkse lessen, met mama-en-babyyoga na afloop, start op dinsdag 29 september.",
        tags: ["op-locatie", "groepslessen", "partner-welkom"],
      },
      {
        naam: "Mucha Mama HypnoBirthing",
        plaats: "landelijk, met cursuslocatie bij Een Goed Begin in Nieuwerkerk aan den IJssel",
        website: "https://www.muchamama.nl/",
        beschrijving: "HypnoBirthing cursussen die onder meer worden gegeven op de cursuslocatie van verloskundigenpraktijk Een Goed Begin in Nieuwerkerk aan den IJssel en in het IJsselland Ziekenhuis in Capelle aan den IJssel, in groepsvorm of privé aan huis.",
        tags: ["op-locatie", "aan-huis", "online", "groepslessen", "1-op-1", "partner-welkom", "avond-weekend", "vergoeding"],
      },
      {
        naam: "Vol Vertrouwen Bevallen",
        plaats: "Nieuwerkerk aan den IJssel",
        website: "https://volvertrouwenbevallen.nl/",
        beschrijving: "Compacte zwangerschapscursus in een dagdeel met een cursuslocatie in Nieuwerkerk aan den IJssel, daarnaast individuele begeleiding en een online zwangerschapscursus.",
        tags: ["op-locatie", "online", "groepslessen", "1-op-1", "partner-welkom"],
      },
      {
        naam: "Samen Bevallen Gouda",
        plaats: "Gouda",
        website: "https://www.samenbevallen.nl/locaties/samen-bevallen-gouda",
        beschrijving: "Zwangerschapscursus Samen Bevallen in Gouda voor aanstaande ouders, met een complete cursus, een minicursus, privélessen en een herhaalcursus.",
        tags: ["op-locatie", "groepslessen", "1-op-1", "partner-welkom"],
      },
    ],
  },
  {
    id: "bekkenfysiotherapie",
    titel: "Bekkenfysiotherapie",
    intro: "Een geregistreerd bekkenfysiotherapeut helpt bij bekkenpijn en bekkenbodemklachten tijdens de zwangerschap en bij het herstel daarna.",
    zoektermen: "bekkenfysio bekkenbodem bekkenpijn bekkeninstabiliteit fysiotherapie herstel zwangerfit",
    aanbieders: [
      {
        naam: "YILA Bekkenfysiotherapie en Manuele Therapie",
        plaats: "Zevenhuizen",
        website: "https://yilafysio.nl/",
        beschrijving: "Praktijk voor bekkenfysiotherapie en manuele therapie in Zevenhuizen, van een MSc bekkenfysiotherapeut, gericht op onder meer bekkenpijn tijdens en na de zwangerschap.",
        tags: ["op-locatie", "1-op-1"],
      },
      {
        naam: "Syntara Bekkenfysiotherapie",
        plaats: "Moordrecht",
        website: "https://www.syntarabekkenfysiotherapie.nl/",
        beschrijving: "Gespecialiseerde bekkenfysiotherapiepraktijk (voorheen Bekkenfysio Miranda) in het pand van ZIN Fysiotherapie in Moordrecht, gericht op bekken- en bekkenbodemklachten tijdens en na de zwangerschap, met huisbezoek binnen gemeente Zuidplas.",
        tags: ["op-locatie", "aan-huis", "online", "1-op-1", "vergoeding"],
      },
      {
        naam: "Fysiotherapiepraktijk Joosten (PACA)",
        plaats: "Moerkapelle",
        website: "https://paca.nl/moerkapelle",
        beschrijving: "Fysiotherapiepraktijk aan de Dorpsstraat in Moerkapelle met een bekkenfysiotherapeut die onder meer bekkenpijn tijdens en na de zwangerschap behandelt.",
        tags: ["op-locatie", "groepslessen", "partner-welkom", "avond-weekend"],
      },
      {
        naam: "Fysio4You",
        plaats: "Nieuwerkerk aan den IJssel (spreekuur bij Een Goed Begin); hoofdlocatie Rotterdam-Ommoord",
        website: "https://fysio4you.com/",
        beschrijving: "Fysiotherapiepraktijk met een geregistreerd bekkenfysiotherapeut die zwangere en pas bevallen vrouwen behandelt, met een dagdeel bij geboortecentrum Een Goed Begin in Nieuwerkerk aan den IJssel.",
        tags: ["op-locatie", "vergoeding"],
      },
      {
        naam: "Dynamis Schollevaar Fysiotherapie",
        plaats: "Capelle aan den IJssel (op woensdag ook in Nieuwerkerk aan den IJssel)",
        website: "https://www.dynamisschollevaar.nl/",
        beschrijving: "Fysiotherapiepraktijk in Capelle aan den IJssel met een geregistreerd bekkenfysiotherapeut (master bekkenfysiotherapie) die zwangeren preventief en bij klachten begeleidt en op woensdag in Nieuwerkerk aan den IJssel werkt.",
        tags: ["op-locatie", "vergoeding"],
      },
      {
        naam: "FS Fysio",
        plaats: "Capelle aan den IJssel",
        website: "https://www.fsfysio.nl/",
        beschrijving: "Fysiotherapiepraktijk met meerdere locaties in Capelle aan den IJssel waar geregistreerde bekkenfysiotherapie wordt gegeven bij zwangerschapsgerelateerde bekken- en bekkenbodemklachten.",
        tags: ["op-locatie"],
      },
      {
        naam: "De Postpartum Fysio",
        plaats: "Waddinxveen (ook Reeuwijk en aan huis in de regio)",
        website: "https://www.depostpartumfysio.nl/",
        beschrijving: "Praktijk van een bekken- en manueel fysiotherapeut die vrouwen begeleidt bij klachten tijdens de zwangerschap en bij het herstel na de bevalling, op locatie in Waddinxveen en Reeuwijk en bij cliënten thuis.",
        tags: ["op-locatie", "aan-huis", "1-op-1"],
      },
      {
        naam: "Fysiotherapie De Rozenburcht",
        plaats: "Capelle aan den IJssel",
        website: "https://www.fysiotherapiederozenburcht.nl/",
        beschrijving: "Fysiotherapiepraktijk in Capelle aan den IJssel met een gespecialiseerde bekkenfysiotherapeut die onder meer bekkeninstabiliteit tijdens de zwangerschap behandelt.",
        tags: ["op-locatie"],
      },
    ],
  },
  {
    id: "doulas",
    titel: "Doula's",
    intro: "Een doula geeft persoonlijke, niet-medische begeleiding voor, tijdens en na de bevalling, naast de zorg van je verloskundige.",
    zoektermen: "doula bevallingscoach geboortecoach postpartum begeleiding",
    aanbieders: [
      {
        naam: "Doula Karin",
        plaats: "Nieuwerkerk aan den IJssel",
        website: "https://www.doula-karin.nl",
        beschrijving: "Doula en postpartum doula in Nieuwerkerk aan den IJssel met als werkgebied Zuidplas, Capelle aan den IJssel, Rotterdam, Gouda, Moerkapelle, Zevenhuizen en Moordrecht.",
        tags: ["1-op-1", "aan-huis", "partner-welkom", "vergoeding"],
      },
      {
        naam: "Doula Sophie",
        plaats: "Capelle aan den IJssel",
        website: "https://www.doulasophie.nl",
        beschrijving: "Doula en geboortefotograaf, gevestigd in Capelle aan den IJssel en werkzaam voor gezinnen in Rotterdam, Delft, Den Haag, Gouda en omgeving.",
        tags: ["1-op-1", "partner-welkom"],
      },
      {
        naam: "About You Holistic Doula",
        plaats: "Capelle aan den IJssel",
        website: "https://www.aboutyouholisticdoula.nl",
        beschrijving: "Doula in Capelle aan den IJssel die holistische begeleiding biedt tijdens zwangerschap, bevalling en de kraamtijd, met een doula-pakket waarin de partner een eigen sessie krijgt.",
        tags: ["holistisch", "1-op-1", "partner-welkom", "aan-huis"],
      },
      {
        naam: "Doula Marlies",
        plaats: "Werkgebied midden- en zuid-Nederland, o.a. Gouda en Rotterdam (vestigingsplaats niet op de site vermeld)",
        website: "https://doulamarlies.nl",
        beschrijving: "Doula sinds 2011 met een werkgebied dat onder meer Gouda en Rotterdam omvat, met aanvullende diensten zoals zwangerschapsmassage en Spinning Babies-lessen.",
        tags: ["1-op-1", "partner-welkom", "thuisbevalling"],
      },
      {
        naam: "Doula Bianca",
        plaats: "Rotterdam",
        website: "https://www.doulabianca.nl",
        beschrijving: "Doula in Rotterdam (Bianca den Breejen) die begeleiding biedt in de regio Rotterdam, regio Den Haag en de Hoeksche Waard, thuis en in het ziekenhuis.",
        tags: ["1-op-1", "partner-welkom", "thuisbevalling", "aan-huis"],
      },
      {
        naam: "Alies Verstegen",
        plaats: "Rotterdam",
        website: "https://www.aliesverstegen.nl/doula",
        beschrijving: "Doula in Rotterdam die persoonlijke en holistische begeleiding biedt bij zwangerschap, bevalling en postpartum, met daarnaast online afspraken en losse consulten.",
        tags: ["holistisch", "1-op-1", "online"],
      },
      {
        naam: "Bella Mama",
        plaats: "Leidschendam",
        website: "https://bellamama.nl",
        beschrijving: "Postpartum doula en geboortedoula vanuit Leidschendam die aan huis werkt in de regio's Den Haag en Rotterdam (tot circa 45 km), met kraamondersteuning geïnspireerd op Turkse tradities.",
        tags: ["aan-huis", "1-op-1"],
      },
    ],
  },
  {
    id: "lactatiekundigen",
    titel: "Lactatiekundigen",
    intro: "Een lactatiekundige helpt bij het opstarten van borstvoeding en bij vragen of problemen, vaak gewoon bij je thuis.",
    zoektermen: "lactatiekundige borstvoeding kolven ibclc voeding baby",
    aanbieders: [
      {
        naam: "Lactatiekundige Praktijk Liefde en Vertrouwen",
        plaats: "Nieuwerkerk aan den IJssel",
        website: "https://lkliefdeenvertrouwen.nl/",
        beschrijving: "Lactatiekundige praktijk uit Nieuwerkerk aan den IJssel met een avondcursus borstvoeding en consulten aan huis in gemeente Zuidplas en omliggende gemeenten; tijdens het huidige zwangerschapsverlof wordt waargenomen door Samen Sterk Lactatie en Coaching.",
        tags: ["aan-huis", "groepslessen", "partner-welkom", "avond-weekend", "vergoeding"],
      },
      {
        naam: "Nultien Borstvoeding",
        plaats: "Rotterdam (aan huis in o.a. Nieuwerkerk aan den IJssel)",
        website: "https://www.nultienborstvoeding.nl/",
        beschrijving: "Lactatiekundige praktijk (IBCLC) van Caroline Kruger die aan huis borstvoedingsconsulten geeft in de regio Rotterdam, waaronder Nieuwerkerk aan den IJssel en Capelle aan den IJssel, met daarnaast digitale consulten op afstand.",
        tags: ["aan-huis", "online"],
      },
      {
        naam: "Nathalie Lactatiekundige Begeleiding",
        plaats: "Waddinxveen",
        website: "https://nathalielactatiekundigebegeleiding.nl/",
        beschrijving: "Lactatiekundige IBCLC uit Waddinxveen die aan huis komt in onder meer Nieuwerkerk aan den IJssel, Moordrecht, Zevenhuizen en Moerkapelle en daarnaast videoconsulten aanbiedt.",
        tags: ["aan-huis", "online", "vergoeding"],
      },
      {
        naam: "Borstvoeding Gouda",
        plaats: "Gouda",
        website: "https://www.borstvoedinggouda.nl/",
        beschrijving: "Lactatiekundige praktijk in Gouda met consulten in de praktijk, aan huis en op afstand, waarvan het werkgebied onder meer Nieuwerkerk aan den IJssel, Moordrecht, Zevenhuizen en Moerkapelle omvat.",
        tags: ["aan-huis", "op-locatie", "online", "avond-weekend"],
      },
      {
        naam: "Lactatiekundigen Kraamzorg de Waarden",
        plaats: "regionale organisatie",
        website: "https://www.kraamzorgdewaarden.nl/voeding/lactatiekundigen",
        beschrijving: "Lactatiekundige dienst van kraamzorgorganisatie Kraamzorg de Waarden met twee lactatiekundigen IBCLC die huisconsulten geven in een werkgebied dat onder meer Nieuwerkerk aan den IJssel, Moordrecht, Zevenhuizen en Moerkapelle omvat.",
        tags: ["aan-huis"],
      },
      {
        naam: "Samen Sterk Lactatie en Coaching",
        plaats: "regio Gouda en Krimpenerwaard",
        website: "https://samen-sterk-lactatie-en-coaching.nl/",
        beschrijving: "Praktijk van een lactatiekundige IBCLC in de regio Gouda, Krimpenerwaard en Krimpen aan den IJssel die consulten aan huis en in de praktijk geeft en momenteel waarneemt voor de praktijk in Nieuwerkerk aan den IJssel.",
        tags: ["aan-huis", "op-locatie", "vergoeding"],
      },
    ],
  },
  {
    id: "sporten",
    titel: "Zwanger en mama sporten",
    intro: "In beweging blijven tijdens je zwangerschap en daarna weer opbouwen, van zwangerschapszwemmen tot buitentraining met andere moeders.",
    zoektermen: "zwanger sporten zwangerfit mamafit zwangerschapszwemmen bootcamp fitness zwemmen training",
    aanbieders: [
      {
        naam: "Spirit for Two",
        plaats: "Nieuwerkerk aan den IJssel (ook Rotterdam-Nesselande)",
        website: "https://www.spiritfortwo.nl/",
        beschrijving: "Zwanger/Mamafit groepslessen op woensdagavond in Nieuwerkerk aan den IJssel (Raadhuisplein 34) en Rotterdam-Nesselande, gegeven door een fysiotherapeut en ZwangerFit-trainer, daarnaast zwangerschaps- en babymassage.",
        tags: ["op-locatie", "groepslessen", "avond-weekend", "1-op-1"],
      },
      {
        naam: "Mom in Balance Rotterdam",
        plaats: "Rotterdam-Nesselande (Zevenhuizerplas) en Capelle aan den IJssel (Vuykpark)",
        website: "https://mominbalance.com/workouts/locaties/rotterdam",
        beschrijving: "Outdoor groepstrainingen voor vrouwen met een Zwanger-programma en Back in Shape herstel na de bevalling, onder andere op de trainingslocaties Nesselande/Zevenhuizerplas en Vuykpark in Capelle aan den IJssel.",
        tags: ["op-locatie", "groepslessen", "avond-weekend"],
      },
      {
        naam: "SPORT•GOUDA, Zwanger & Fit",
        plaats: "Gouda",
        website: "https://www.sportpuntgouda.nl/zwanger-en-fit",
        beschrijving: "Zwanger & Fit is een groepsles in warm water in het Groenhovenbad waarin zwangeren onder begeleiding werken aan conditie en ontspanning, met losse toegang of een badenkaart.",
        tags: ["op-locatie", "groepslessen"],
      },
      {
        naam: "Gezond Gouds, Zwanger en Mama Bootcamp",
        plaats: "Gouda",
        website: "https://gezondgouds.nl/aanbod/bootcamp/gezond-zwanger-mama/",
        beschrijving: "Buitentraining in bewust kleine groepen voor zwangeren en moeders vanaf ongeveer zes tot acht weken na de bevalling, op woensdagavond en zaterdagochtend aan de Aderpolderweg in Gouda.",
        tags: ["op-locatie", "groepslessen", "avond-weekend"],
      },
      {
        naam: "Fysiotherapie Gezondheidscentrum Ommoord (Zovida)",
        plaats: "Rotterdam-Ommoord",
        website: "https://zovida.nl/ommoord/fysiotherapie/",
        beschrijving: "Fysiotherapiepraktijk aan de Briandplaats in Rotterdam-Ommoord waar een fysiotherapeut ZwangerFit en MamaFit lessen verzorgt voor aanstaande en pas bevallen moeders.",
        tags: ["op-locatie"],
      },
      {
        naam: "Zwembad Zevenkampse Ring (Sportfondsen)",
        plaats: "Rotterdam-Zevenkamp",
        website: "https://zevenkampsering.sportfondsen.nl/activiteiten/zwangerschapszwemmen",
        beschrijving: "Wekelijkse begeleide groepsles zwangerschapszwemmen op dinsdagochtend in warm water, met conditie-, adem- en ontspanningsoefeningen en een los ticket zonder voorinschrijving.",
        tags: ["op-locatie", "groepslessen"],
      },
      {
        naam: "Gouwebad De Sniep",
        plaats: "Waddinxveen",
        website: "https://www.gouwebaddesniep.nl/activiteiten/",
        beschrijving: "Het zwembad aan de Sniepweg in Waddinxveen biedt zwemmen voor zwangeren aan in het recreatiebad zonder andere vrijzwemmers erbij, gericht op veilig in conditie blijven tijdens de zwangerschap.",
        tags: ["op-locatie"],
      },
    ],
  },
  {
    id: "babymassage-babyspa",
    titel: "Babymassage en babyspa",
    intro: "Voor een cursus babymassage of een ontspannen floatsessie in een babyspa kun je in de regio bij deze aanbieders terecht.",
    zoektermen: "babymassage shantala babyconsulent babyspa baby spa floaten babyfloat",
    aanbieders: [
      {
        naam: "Baby Spa Gouda",
        plaats: "Gouda",
        website: "https://www.babyspa-gouda.nl/",
        beschrijving: "Babyspa in Gouda met floatsessies en optionele babymassage voor baby's van zes weken tot ongeveer twaalf maanden, alleen op afspraak; er zijn ook combisessies waarbij een broertje of zusje van twee tot vier jaar meebubbelt.",
        tags: ["op-locatie"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "Spirit for Two",
        plaats: "Nieuwerkerk aan den IJssel (ook Rotterdam-Nesselande)",
        website: "https://www.spiritfortwo.nl/",
        beschrijving: "Zwangerschaps- en babymassage in Nieuwerkerk aan den IJssel en Rotterdam-Nesselande, door dezelfde fysiotherapeut en ZwangerFit-trainer die ook de Zwanger/Mamafit-lessen geeft.",
        tags: ["op-locatie", "1-op-1"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "Bureau Babyzorg",
        plaats: "Waddinxveen (werkt o.a. in Zevenhuizen en Moerkapelle)",
        website: "https://bureaubabyzorg.nl/",
        beschrijving: "Verpleegkundig babyconsulent in Waddinxveen voor babyconsulten, Shantala babymassage en draagconsulten, met een werkgebied dat onder meer Zevenhuizen, Moerkapelle en Gouda omvat.",
        tags: ["1-op-1"],
      },
    ],
  },
  {
    id: "baby-dragen",
    titel: "Baby dragen",
    intro: "Voor hulp bij het dragen van je baby, van het kiezen van een draagdoek of draagzak tot een persoonlijk draagconsult, kun je in de regio bij deze aanbieders terecht.",
    zoektermen: "draagconsulent draagdoek draagzak dragen draagconsult",
    aanbieders: [
      {
        naam: "Draag me mee",
        plaats: "Capelle aan den IJssel",
        website: "https://www.draagmemee.nl/",
        beschrijving: "Draagconsulente in Capelle aan den IJssel voor draag- en pasconsulten en reparatie van draagdoeken en draagzakken, met drie weken nazorg na een consult.",
        tags: ["op-locatie", "1-op-1"],
      },
      {
        naam: "Bureau Babyzorg",
        plaats: "Waddinxveen (werkt o.a. in Zevenhuizen en Moerkapelle)",
        website: "https://bureaubabyzorg.nl/",
        beschrijving: "Verpleegkundig babyconsulent in Waddinxveen voor babyconsulten, Shantala babymassage en draagconsulten, met een werkgebied dat onder meer Zevenhuizen, Moerkapelle en Gouda omvat.",
        tags: ["1-op-1"],
      },
    ],
  },
  {
    id: "geboortefotografie",
    titel: "Geboortefotografie",
    intro: "Een geboortefotograaf legt de bevalling en de eerste momenten met je baby vast. Voor een zwangerschapsshoot, newbornshoot of gezinsshoot heeft de kaart een eigen categorie.",
    zoektermen: "geboortefotograaf newborn fotografie fotograaf bevallingsreportage",
    aanbieders: [
      {
        naam: "Lotte Aerssens Fotografie",
        plaats: "Gouda",
        website: "https://lotteaerssensfotografie.nl/",
        beschrijving: "Geboortefotograaf uit Gouda die bevallingen thuis en in het ziekenhuis in Zuid-Holland vastlegt en vanaf week 38 op afroep beschikbaar is.",
        tags: ["aan-huis", "avond-weekend"],
      },
      {
        naam: "Touched Photography",
        plaats: "Hendrik-Ido-Ambacht (werkgebied o.a. Gouda en Rotterdam)",
        website: "https://touched.photography/",
        beschrijving: "Geboortefotograaf die onder meer in Gouda en Rotterdam bevallingen fotografeert, inclusief keizersneden, en is aangesloten bij Stichting Keurmerk Geboortefotografie.",
        tags: [],
      },
      {
        naam: "Noa Fotografie",
        plaats: "Rotterdam (werkgebied heel Zuid-Holland)",
        website: "https://noafotografie.nl/",
        beschrijving: "Geboortefotograaf uit Rotterdam met ruim tien jaar ervaring en meer dan tweehonderd gefotografeerde bevallingen, die in heel Zuid-Holland fotografeert, in meerdere ziekenhuizen mee de operatiekamer op mag bij een keizersnede en is aangesloten bij de internationale beroepsvereniging voor geboortefotografen.",
        tags: ["aan-huis", "avond-weekend"],
        toegevoegd: "2026-08-30",
      },
    ],
  },
  {
    id: "zwangerschaps-newborn-gezinsfotografie",
    titel: "Zwangerschaps-, newborn- en gezinsfotografie",
    intro: "Een mooie herinnering aan je zwangerschap, de eerste weken met je baby of jullie samen als gezin: deze fotografen uit de regio leggen het vast, in de studio of gewoon bij je thuis. Wil je juist de bevalling zelf laten fotograferen, kijk dan bij geboortefotografie.",
    zoektermen: "zwangerschapsshoot zwangerschapsfotografie newbornshoot newborn babyshoot babyfotograaf gezinsfotograaf familiefotograaf gezinsshoot familieshoot fotoshoot cakesmash",
    aanbieders: [
      {
        naam: "I-AM Fotografie & Design",
        plaats: "Nieuwerkerk aan den IJssel",
        website: "https://www.i-am-foto-design.nl/",
        beschrijving: "Fotostudio aan de Eerste Tochtweg in Nieuwerkerk aan den IJssel voor zwangerschaps-, newborn-, kinder- en familiefotografie, op afspraak zodat er alle tijd en aandacht is.",
        tags: ["op-locatie"],
        toegevoegd: "2026-09-04",
      },
      {
        naam: "Memorii Photography",
        plaats: "Zevenhuizen",
        website: "https://memoriiphotography.nl/",
        beschrijving: "Fotograaf in Zevenhuizen voor zwangerschaps-, newborn- en familieshoots in Zevenhuizen en omgeving, met daarnaast de reportage In liefde gedragen voor gezinnen die een kindje verliezen.",
        tags: [],
        toegevoegd: "2026-09-04",
      },
      {
        naam: "Pure Newborn Fotografie",
        plaats: "Capelle aan den IJssel",
        website: "https://purenewborn.nl/",
        beschrijving: "Daglichtstudio aan de Mient in Capelle aan den IJssel, gespecialiseerd in zwangerschapsshoots rond 30 tot 34 weken, newbornshoots in de eerste drie weken en daarnaast gezins- en cakesmashshoots, met buitensessies van april tot oktober.",
        tags: ["op-locatie"],
        toegevoegd: "2026-09-04",
      },
      {
        naam: "Foto Renée",
        plaats: "Haastrecht (bij Gouda)",
        website: "https://www.fotorenee.nl/",
        beschrijving: "Fotograaf met eigen studio in Haastrecht bij Gouda voor zwangerschaps-, newborn-, gezins- en cakesmashshoots, waarbij een newbornshoot ook gewoon bij je thuis kan.",
        tags: ["op-locatie", "aan-huis"],
        toegevoegd: "2026-09-04",
      },
      {
        naam: "Lotte Aerssens Fotografie",
        plaats: "Gouda",
        website: "https://lotteaerssensfotografie.nl/",
        beschrijving: "Familie- en geboortefotograaf uit Gouda met Zuid-Holland als werkgebied, die naast bevallingen ook zwangerschapsshoots, newbornshoots en day in the life reportages van je gezin fotografeert.",
        tags: [],
        toegevoegd: "2026-09-04",
      },
    ],
  },
  {
    id: "steun-bij-verlies",
    titel: "Steun bij verlies",
    intro: "Voor wie een miskraam meemaakt of een kindje verliest is er in de regio begeleiding en steun.",
    zoektermen: "miskraam babyverlies stilgeboorte rouw verlies steun",
    aanbieders: [
      {
        naam: "Praktijk Rode Roos",
        plaats: "Capelle aan den IJssel",
        website: "https://praktijkroderoos.nl/",
        beschrijving: "Praktijk voor rouwtherapie in Capelle aan den IJssel die onder meer begeleiding biedt bij het verlies van een kind, op locatie of online.",
        tags: ["op-locatie", "1-op-1", "online", "vergoeding", "avond-weekend"],
      },
      {
        naam: "EC Coaching (Esther Cozijnsen)",
        plaats: "Delft (ook online)",
        website: "https://www.eccoachingdelft.nl/",
        beschrijving: "Psycholoog en coach gespecialiseerd in begeleiding na een miskraam of stilgeboorte, met individuele trajecten in Delft en online programma's.",
        tags: ["op-locatie", "1-op-1", "online"],
      },
      {
        naam: "Stichting Make a Memory",
        plaats: "Landelijk (ook in deze regio)",
        website: "https://www.makeamemory.nl/",
        beschrijving: "Landelijke stichting waarvan professionele fotografen kosteloos foto's maken voor ouders die hun kind verliezen of hebben verloren, vanaf 18 weken zwangerschap, aan te vragen via zorgprofessionals en 24 uur per dag bereikbaar.",
        tags: [],
      },
      {
        naam: "Groei naar de Toekomst (Marloes Lagendijk)",
        plaats: "Afspraken op een plek naar keuze in de regio",
        website: "https://www.groeinaardetoekomst.nl/",
        beschrijving: "Coachingspraktijk van een verloskundige met ruim zeventien jaar ervaring, opgeleid als specialist bevalverwerking, voor begeleiding bij babyverlies, bevallingstrauma en een volgende zwangerschap na verlies, met afspraken bij je thuis of op een andere plek waar jij je prettig voelt.",
        tags: ["1-op-1", "aan-huis"],
        toegevoegd: "2026-08-30",
      },
    ],
  },
  {
    id: "mentale-steun",
    titel: "Mentale steun bij zwangerschap en bevalling",
    intro: "Sombere gevoelens, angst voor de bevalling of een eerdere bevalling die nog naspeelt verdienen net zo goed zorg. Deze hulpverleners zijn gespecialiseerd in de periode rond zwangerschap en geboorte; bij acute nood bel je altijd je huisarts.",
    zoektermen: "psycholoog psychiater bevalangst bevallingstrauma postpartum depressie angst somber emdr mentaal therapie",
    aanbieders: [
      {
        naam: "Bureau Visser (Jantine Visser)",
        plaats: "Gouda",
        website: "https://www.bureauvisser.nl/",
        beschrijving: "Klinisch psycholoog en psychotherapeut in Gouda, gespecialiseerd in de periode rond zwangerschap en postpartum, met een praktijkruimte bij Verloskundigenpraktijk Gouda aan de Ronsseweg.",
        tags: ["op-locatie", "1-op-1"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "Praktijk voor Zwangerschap en Psychiatrie",
        plaats: "Rotterdam (bij Capelle aan den IJssel)",
        website: "https://praktijk-voor-zwangerschap-en-psychiatrie.com/",
        beschrijving: "Psychiaterspraktijk aan de oostrand van Rotterdam, gespecialiseerd in zwangerschapsgerelateerde psychiatrie, met individuele therapie, partnertherapie, traumabehandeling, groepstherapie na de bevalling en medicatieadvies.",
        tags: ["op-locatie", "1-op-1", "groepslessen"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "Groei naar de Toekomst (Marloes Lagendijk)",
        plaats: "Afspraken op een plek naar keuze in de regio",
        website: "https://www.groeinaardetoekomst.nl/",
        beschrijving: "Coachingspraktijk van een verloskundige met ruim zeventien jaar ervaring, opgeleid als specialist bevalverwerking, voor begeleiding bij babyverlies, bevallingstrauma en een volgende zwangerschap na verlies, met afspraken bij je thuis of op een andere plek waar jij je prettig voelt.",
        tags: ["1-op-1", "aan-huis"],
        toegevoegd: "2026-08-30",
      },
    ],
  },
  {
    id: "zwangerschapsmassage",
    titel: "Zwangerschapsmassage",
    intro: "Een massage die is afgestemd op je zwangerschap kan verlichting geven bij spanning en drukte. Zeg er altijd even bij hoe ver je bent, dan stemt de behandelaar de massage daarop af.",
    zoektermen: "zwangerschapsmassage massage wellness ontspanning",
    aanbieders: [
      {
        naam: "Wellnessmassage Nieuwerkerk",
        plaats: "Nieuwerkerk aan den IJssel",
        website: "https://www.massage-nieuwerkerk.nl/",
        beschrijving: "Massagepraktijk aan de Finsestraat in Nieuwerkerk aan den IJssel die zwangerschapsmassage geeft vanaf 12 weken, op een warmwaterkussen.",
        tags: ["op-locatie"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "Spirit for Two",
        plaats: "Nieuwerkerk aan den IJssel (ook Rotterdam-Nesselande)",
        website: "https://www.spiritfortwo.nl/",
        beschrijving: "Zwangerschaps- en babymassage in Nieuwerkerk aan den IJssel en Rotterdam-Nesselande, door dezelfde fysiotherapeut en ZwangerFit-trainer die ook de Zwanger/Mamafit-lessen geeft.",
        tags: ["op-locatie", "1-op-1"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "QoQo Massage Capelle",
        plaats: "Capelle aan den IJssel",
        website: "https://www.qoqomassageclinics.nl/pages/qoqo-massage-capelle-a-d-ijssel",
        beschrijving: "Massagekliniek aan het Hollandsch Diep in Capelle aan den IJssel met zwangerschapsmassage in het tweede trimester, dagelijks geopend tot in de late avond.",
        tags: ["op-locatie", "avond-weekend"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "Praktijk Proximaal",
        plaats: "Gouda",
        website: "https://massagegouda.nl/zwangerschapsmassage/",
        beschrijving: "Massagepraktijk in Gouda die zwangerschapsgerelateerde klachten aan rug, nek, schouders en bekken behandelt en afhankelijk van het verloop al vroeg in de zwangerschap kan masseren.",
        tags: ["op-locatie"],
        toegevoegd: "2026-08-30",
      },
    ],
  },
  {
    id: "osteopathie",
    titel: "Osteopathie voor zwangeren en baby's",
    intro: "Osteopathie kijkt naar de beweeglijkheid van het hele lijf en wordt rond de zwangerschap ingezet bij klachten als rug- en bekkenpijn, en bij baby's bijvoorbeeld bij onrust, darmkrampjes of reflux. Vergoeding loopt vaak gedeeltelijk via de aanvullende verzekering; check je eigen polis.",
    zoektermen: "osteopaat osteopathie kinderosteopathie baby reflux darmkrampjes onrust bekkenpijn rugpijn",
    aanbieders: [
      {
        naam: "Gavin Maduro Osteopathie",
        plaats: "Nieuwerkerk aan den IJssel (ook Rijswijk)",
        website: "https://www.gavinmaduro.nl/",
        beschrijving: "Osteopaat aan het Raadhuisplein in Nieuwerkerk aan den IJssel met een tweejarige aanvullende specialisatie kinderosteopathie, die baby's behandelt bij onder meer onrust en reflux en op de eigen site vermeldt dat behandeling tijdens de zwangerschap en postpartum helpend kan zijn.",
        tags: ["op-locatie"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "Osteonieuwerkerk (Ronald Terlouw)",
        plaats: "Nieuwerkerk aan den IJssel",
        website: "https://www.osteonieuwerkerk.nl/",
        beschrijving: "Osteopathiepraktijk aan het Raadhuisplein in Nieuwerkerk aan den IJssel met aparte behandelingen voor baby's en kinderen.",
        tags: ["op-locatie"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "Osteovisie",
        plaats: "Capelle aan den IJssel",
        website: "https://osteovisie.nl/",
        beschrijving: "Osteopathiepraktijk met een vestiging in Capelle aan den IJssel die zwangerschapsklachten zoals lage rug- en bekkenpijn behandelt en baby's en kinderen als eigen doelgroep heeft, met NRO-registratie en gehele of gedeeltelijke vergoeding vanuit de aanvullende verzekering.",
        tags: ["op-locatie", "vergoeding"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "Osteopathie Gouda (Jan Boom)",
        plaats: "Gouda",
        website: "https://www.osteopathiegouda.nl/",
        beschrijving: "Osteopathiepraktijk in Gouda die naast volwassenen ook kinderen en zuigelingen behandelt.",
        tags: ["op-locatie"],
        toegevoegd: "2026-08-30",
      },
    ],
  },
  {
    id: "matrescentie",
    titel: "Matrescentie",
    intro: "Matrescentie is de overgang naar het moederschap: net zoals de adolescentie een periode waarin je lichaam, je gevoel en je identiteit tegelijk veranderen, en die dus tijd en aandacht verdient. De term krijgt in Nederland langzaam bekendheid, onder meer via het boek Moederteit. In de regio Zuidplas is er op dit moment nog niemand die zich hier speciaal op richt; zodra dat verandert, krijgt het hier meteen een plek. Werk jij hiermee in de regio? Meld je dan via het formulier op de zorgkaart, want deze pagina staat voor je klaar.",
    zoektermen: "matrescentie moederteit moedercoach moederschap identiteit postpartum coaching overgang",
    aanbieders: [],
  },
  {
    id: "online",
    titel: "Online aanbod",
    intro: "Niet alle goede hulp zit om de hoek. Hier staat landelijk aanbod dat volledig online te volgen is; deze lijst groeit rustig mee.",
    zoektermen: "online landelijk digitaal beeldbellen thuis",
    aanbieders: [
      {
        naam: "Postpartum Centrum Nederland",
        plaats: "Online (praktijk in Utrecht)",
        website: "https://postpartumcentrumnederland.nl/",
        beschrijving: "Psychologenpraktijk binnen de basis-ggz voor postpartum depressie, bevallingstrauma, angst en stress, fysiek in Utrecht of volledig online, met vergoeding vanuit de basisverzekering.",
        tags: ["online", "1-op-1", "vergoeding"],
        toegevoegd: "2026-08-30",
      },
      {
        naam: "This is the Village",
        plaats: "Online (centrum in Rotterdam)",
        website: "https://thisisthevillage.nl/",
        beschrijving: "Platform en centrum rond matrescentie in Rotterdam, met trajecten, workshops, events en een online kennisbank die landelijk te volgen is.",
        tags: ["online", "1-op-1", "groepslessen"],
        toegevoegd: "2026-08-30",
      },
    ],
  },
];

/* ── Plaatsen in de gemeente Zuidplas ──────────────────────────────────────
 * Voor de vier plaatspagina's (/zwanger-in-...). Een aanbieder komt op de
 * pagina van een plaats als de eigen plaatsomschrijving die plaats noemt.
 * Daarnaast is er een tweede groep: aanbieders die een breder werkgebied
 * opgeven zonder een specifieke Zuidplas-plaats te noemen. Bij die groep
 * staat het werkgebied er letterlijk bij, zodat de bezoeker zelf ziet waar
 * de aanbieder werkt. We bedenken nergens dekking die de aanbieder zelf niet
 * opschrijft.
 */

export type Plaats = { slug: string; naam: string; korteNaam: string };

export const PLAATSEN: Plaats[] = [
  { slug: "nieuwerkerk-aan-den-ijssel", naam: "Nieuwerkerk aan den IJssel", korteNaam: "Nieuwerkerk" },
  { slug: "zevenhuizen", naam: "Zevenhuizen", korteNaam: "Zevenhuizen" },
  { slug: "moordrecht", naam: "Moordrecht", korteNaam: "Moordrecht" },
  { slug: "moerkapelle", naam: "Moerkapelle", korteNaam: "Moerkapelle" },
];

const BREED = /regio|regionale|landelijk|werkgebied/i;

/** Noemt deze plaatsomschrijving deze plaats? */
export function noemtPlaats(plaatsTekst: string, plaatsNaam: string): boolean {
  return plaatsTekst.toLowerCase().includes(plaatsNaam.toLowerCase());
}

/** Noemt deze plaatsomschrijving een van de vier Zuidplas-plaatsen? */
export function noemtEenZuidplasPlaats(plaatsTekst: string): boolean {
  return PLAATSEN.some((p) => noemtPlaats(plaatsTekst, p.naam));
}

/** Geeft een breder werkgebied op zonder een specifieke plaats te noemen. */
export function heeftBreedWerkgebied(plaatsTekst: string): boolean {
  return BREED.test(plaatsTekst) && !noemtEenZuidplasPlaats(plaatsTekst);
}

export type PlaatsCategorie = {
  categorie: ZorgCategorie;
  hier: Zorgverlener[];
  breed: Zorgverlener[];
};

/** De hele zorgkaart, gefilterd op een plaats en gegroepeerd per categorie. */
export function zorgkaartVoorPlaats(plaatsNaam: string): PlaatsCategorie[] {
  return ZORGKAART.map((categorie) => ({
    categorie,
    hier: categorie.aanbieders.filter((a) => noemtPlaats(a.plaats, plaatsNaam)),
    breed: categorie.aanbieders.filter(
      (a) => !noemtPlaats(a.plaats, plaatsNaam) && heeftBreedWerkgebied(a.plaats),
    ),
  })).filter((r) => r.hier.length + r.breed.length > 0);
}

/** Hoeveel aanbieders staan er in totaal op de pagina van deze plaats? */
export function aantalVoorPlaats(plaatsNaam: string): { hier: number; breed: number } {
  const rijen = zorgkaartVoorPlaats(plaatsNaam);
  const namen = (kies: (r: PlaatsCategorie) => Zorgverlener[]) =>
    new Set(rijen.flatMap((r) => kies(r).map((a) => a.naam))).size;
  return { hier: namen((r) => r.hier), breed: namen((r) => r.breed) };
}
