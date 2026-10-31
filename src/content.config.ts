/* ===========================================================================
 *  CDB — SITE CONTENT CONFIGURATION
 *  ---------------------------------------------------------------------
 *  This is the only file you need to edit to change the website.
 *  Text, images, projects, reviews, SEO, contact fields — all of it is here.
 *
 *  After editing: commit and push. The deploy rebuilds and the change is live.
 *
 *  Contents
 *    1. SITE          brand, navigation, contact details, service areas
 *    2. IMAGES        every photograph, in one place
 *    3. PROJECTS      the portfolio — add, remove and reorder here
 *    4. HOME          the landing page, section by section
 *    5. ABOUT         the studio page
 *    6. TESTIMONIALS  client reviews
 *    7. FAQ           questions, also used for Google's FAQ rich result
 *    8. CONTACT       contact page copy and the enquiry form fields
 *    9. SEO           page titles, meta descriptions, keyword targets
 *   10. ANALYTICS     visitor analytics provider
 *   11. ENQUIRY SHEET where form submissions are recorded
 * ======================================================================== */

/* ========================================================================
 * 1. SITE
 * Brand, navigation, contact details and the places you work.
 * Keep the address and phone identical to your Google Business Profile.
 * ======================================================================== */

export const site = {
  /** Short brand mark used in the header / footer. */
  name: "CDB",
  /** Full legal / display name used in titles and structured data. */
  legalName: "CDB Architecture",
  /** Appended to every page title: "Page — CDB Architecture". */
  tagline: "Architecture & Interiors",
  /** Production origin. Used for canonical URLs, sitemap and Open Graph. */
  url: "https://cdbarchitecture.com",
  /** One-line positioning statement. Shows in the footer and as OG description. */
  description:
    "CDB is an architecture and interior design studio designing modern custom homes and considered commercial spaces across the United States.",
  /** Year the studio was founded — used in the footer and About page. */
  founded: 2014,

  contact: {
    email: "studio@cdbarchitecture.com",
    /** E.164 format. Also used to build the WhatsApp deep link. */
    phone: "+1 (512) 555-0184",
    phoneE164: "+15125550184",
    /** Primary studio address. Keep identical to your Google Business Profile. */
    address: {
      street: "1103 E 5th Street, Suite 200",
      city: "Austin",
      state: "TX",
      zip: "78702",
      country: "US",
    },
    /** Used by the LocalBusiness structured data. Set to your real coordinates. */
    geo: { lat: 30.2639, lng: -97.7267 },
    hours: "Mon–Fri, 9am – 6pm CT",
  },

  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Pinterest", href: "https://pinterest.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
  ],

  nav: [
    { label: "Work", href: "/work" },
    { label: "Studio", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  /** Cities / regions you serve. Rendered on the site and fed to structured data. */
  serviceAreas: [
    "Austin, TX",
    "Dallas, TX",
    "Houston, TX",
    "Los Angeles, CA",
    "Seattle, WA",
    "Denver, CO",
    "New York, NY",
    "Nationwide (remote)",
  ],
} as const;

export type Site = typeof site;

/* ========================================================================
 * 2. IMAGES
 * Single source of truth for every photograph.
 * Replace a URL with your own: either a full remote URL, or a file
 * dropped into /public (e.g. '/img/hero.jpg'). Both work.
 * ======================================================================== */

const U = "https://images.unsplash.com/";

export const images = {
  // -- Canyon Ridge Residence (dark masonry volume, Austin TX) --------------
  canyon1: U + "photo-1600585153490-76fb20a32601",
  canyon2: U + "photo-1600585154340-be6161a56a0c",
  canyon3: U + "photo-1600585154363-67eb9e2e2099",
  canyon4: U + "photo-1600585154526-990dced4db0d",
  canyon5: U + "photo-1600573472592-401b489a3cdc",

  // -- Point Dume House (white villa + pool, Malibu CA) ---------------------
  dume1: U + "photo-1613490493576-7fde63acd811",
  dume2: U + "photo-1600596542815-ffad4c1539a9",
  dume3: U + "photo-1580587771525-78b9dba3b914",
  dume4: U + "photo-1512917774080-9991f1c4c750",

  // -- Mercer Courtyard House (black + cedar around a tree, Seattle WA) -----
  mercer1: U + "photo-1600607688969-a5bfcd646154",
  mercer2: U + "photo-1600607688960-e095ff83135c",
  mercer3: U + "photo-1600585154084-4e5fe7c39198",
  mercer4: U + "photo-1600573472550-8090b5e0745e",

  // -- Hudson Valley Retreat (timber + white massing, NY) ------------------
  hudson1: U + "photo-1600047509358-9dc75507daeb",
  hudson2: U + "photo-1600047509782-20d39509f26d",
  hudson3: U + "photo-1600047509807-ba8f99d2cdde",
  hudson4: U + "photo-1618221195710-dd6b41faaea6",
  hudson5: U + "photo-1600210492493-0946911123ea",

  // -- Foundry Works (adaptive-reuse workplace) ----------------------------
  foundry1: U + "photo-1487958449943-2429e8be8625",
  foundry2: U + "photo-1497366811353-6870744d04b2",
  foundry3: U + "photo-1497366754035-f200968a6e72",
  foundry4: U + "photo-1486406146926-c627a92ad1ab",

  // -- Nob Hill Residence (interior-led renovation, San Francisco CA) ------
  nobhill1: U + "photo-1600566752229-250ed79470f8",
  nobhill2: U + "photo-1600585152220-90363fe7e115",
  nobhill3: U + "photo-1600566752355-35792bedcfea",
  nobhill4: U + "photo-1600607688066-890987f18a86",
  nobhill5: U + "photo-1600607687920-4e2a09cf159d",
  nobhill6: U + "photo-1600607687939-ce8a6c25118c",

  // -- Studio / editorial ---------------------------------------------------
  studioInterior: U + "photo-1497366811353-6870744d04b2",
  studioDetail: U + "photo-1600573472592-401b489a3cdc",
  studioSite: U + "photo-1506744038136-46273834b3fb",
  studioLiving: U + "photo-1600566753086-00f18fb6b3ea",
} as const;

/* ========================================================================
 * 3. PROJECTS
 * The portfolio. Order here is the order shown on the site.
 * To add one: copy a block and change the slug — it becomes the URL
 * /work/your-slug. The index, the homepage carousel, the detail page
 * and the sitemap all read from this array.
 * ======================================================================== */

export type GalleryItem = {
  src: string;
  alt: string;
  /** Caption shown under the image on the project page. Optional. */
  caption?: string;
  /** 'wide' spans the full column, 'tall' is a portrait crop. Default 'wide'. */
  shape?: "wide" | "tall" | "square";
};

export type Project = {
  slug: string;
  title: string;
  /** Short label shown under the title, e.g. "Austin, Texas". */
  location: string;
  /** Appears in filters on the work index. */
  category: "Residential" | "Interiors" | "Commercial" | "Adaptive Reuse";
  year: number;
  status: "Completed" | "In Construction" | "In Design";
  /** One sentence. Used on cards and as the meta description for the page. */
  summary: string;
  /** Key / value rows in the project fact table. */
  facts: { label: string; value: string }[];
  /** Long-form narrative. Each string is a paragraph. */
  narrative: string[];
  /** Pull quote rendered large, mid-page. Optional. */
  quote?: { text: string; attribution: string };
  cover: string;
  gallery: GalleryItem[];
  credits?: { label: string; value: string }[];
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "canyon-ridge-residence",
    title: "Canyon Ridge Residence",
    location: "Austin, Texas",
    category: "Residential",
    year: 2024,
    status: "Completed",
    summary:
      "A charred-cedar and board-formed concrete house that steps down a limestone escarpment, trading height for a long view west.",
    facts: [
      { label: "Site", value: "1.4 acres, west-facing escarpment" },
      { label: "Area", value: "4,180 sq ft" },
      { label: "Program", value: "4 bed, 3.5 bath, studio" },
      { label: "Structure", value: "Board-formed concrete, steel frame" },
      { label: "Completion", value: "Spring 2024" },
    ],
    narrative: [
      "The site fell eleven feet across its width — enough that a conventional slab would have required a retaining wall taller than the house itself. Instead we split the plan into two plates, half a level apart, and let the grade do the work of separating public from private.",
      "The street elevation gives away almost nothing: a dark, quiet wall of charred cedar with four narrow slots of light. Everything opens to the west. Living, dining and kitchen share one eighty-foot run of glass, shaded by a two-foot concrete brow that cuts the summer sun and lets the winter sun reach the back of the room.",
      "Material was kept to three: concrete, cedar, white oak. We left the formwork grain visible on every poured surface, which meant the carpenters set the forms as finish work rather than as structure — slower, and the single best decision on the project.",
    ],
    quote: {
      text: "We asked for a house that disappeared from the road and opened entirely to the canyon. They gave us exactly that, and nothing we did not ask for.",
      attribution: "Owners, Canyon Ridge",
    },
    cover: images.canyon1,
    gallery: [
      {
        src: images.canyon1,
        alt: "Canyon Ridge Residence street elevation at dusk",
        caption:
          "West elevation at dusk. Four light slots are the only openings on the street side.",
      },
      {
        src: images.canyon2,
        alt: "Canyon Ridge Residence under the live oak",
        caption: "The existing live oak set the position of the entry court.",
        shape: "wide",
      },
      {
        src: images.canyon3,
        alt: "Approach and stepped entry to Canyon Ridge Residence",
        caption:
          "The approach steps down with the grade rather than cutting across it.",
        shape: "tall",
      },
      {
        src: images.canyon4,
        alt: "Detail of charred cedar cladding and timber entry",
        caption: "Charred cedar against the warm timber of the entry reveal.",
        shape: "tall",
      },
      {
        src: images.canyon5,
        alt: "Perforated screen and cedar cladding detail",
        caption:
          "The perforated screen filters afternoon light into the stair.",
      },
    ],
    credits: [
      { label: "Architecture", value: "CDB" },
      { label: "Interiors", value: "CDB" },
      { label: "Structure", value: "Verrill + Hahn" },
      { label: "Builder", value: "Thorn & Field" },
      { label: "Landscape", value: "Caliche Studio" },
    ],
    featured: true,
  },
  {
    slug: "point-dume-house",
    title: "Point Dume House",
    location: "Malibu, California",
    category: "Residential",
    year: 2023,
    status: "Completed",
    summary:
      "A white-plaster courtyard house on a coastal bluff, planned around a single lap pool that orders every room on the site.",
    facts: [
      { label: "Site", value: "0.6 acres, coastal bluff" },
      { label: "Area", value: "3,650 sq ft" },
      { label: "Program", value: "3 bed, 3 bath, guest house" },
      { label: "Structure", value: "Plaster over masonry, steel" },
      { label: "Completion", value: "Autumn 2023" },
    ],
    narrative: [
      "Coastal setbacks left a building envelope the shape of a flattened L. Rather than fight it, we treated the leftover ground as the main room: a walled court with a single lap pool running its full length, and the house wrapped around two of its sides.",
      "Every habitable room touches the court. The result is a plan with almost no corridor — you move through rooms, or outside along the water, and the distinction between the two is deliberately soft.",
      "The palette is almost entirely white: hand-troweled plaster inside and out, honed limestone underfoot, pale oak joinery. Against the Pacific light this reads less as minimalism than as a kind of neutrality — the building recedes and the weather becomes the decoration.",
    ],
    quote: {
      text: "They spent the first month doing nothing but watching how light moved across the lot. It shows in every room.",
      attribution: "Marisol Vance, Owner",
    },
    cover: images.dume1,
    gallery: [
      {
        src: images.dume1,
        alt: "Point Dume House pool court and double-height loggia",
        caption:
          "The loggia faces the court across the full length of the pool.",
      },
      {
        src: images.dume2,
        alt: "Point Dume House white plaster massing above the pool",
        caption:
          "Plaster massing stepped back to keep the bluff view line open.",
      },
      {
        src: images.dume3,
        alt: "Rear elevation of Point Dume House with infinity edge pool",
        caption:
          "The rear elevation opens entirely; glazing slides into the wall pockets.",
        shape: "wide",
      },
      {
        src: images.dume4,
        alt: "Guest house and terrace at Point Dume",
        caption: "The guest house closes the fourth side of the court.",
        shape: "tall",
      },
    ],
    credits: [
      { label: "Architecture", value: "CDB" },
      { label: "Interiors", value: "CDB with Oona Reyes" },
      { label: "Builder", value: "Hale Coastal" },
      { label: "Landscape", value: "Terrain West" },
    ],
    featured: true,
  },
  {
    slug: "mercer-courtyard-house",
    title: "Mercer Courtyard House",
    location: "Mercer Island, Washington",
    category: "Residential",
    year: 2024,
    status: "Completed",
    summary:
      "Two cedar-clad bars folded around a 90-year-old madrone, built so that not one root of it was cut.",
    facts: [
      { label: "Site", value: "0.9 acres, mature canopy" },
      { label: "Area", value: "3,900 sq ft" },
      { label: "Program", value: "4 bed, 3 bath, workshop" },
      { label: "Structure", value: "Timber frame, steel moment frames" },
      { label: "Completion", value: "Summer 2024" },
    ],
    narrative: [
      "An arborist surveyed the site before we drew anything. The madrone at its centre had a root zone of roughly thirty-two feet — which, once plotted, left an L-shaped buildable area and effectively designed the house.",
      "Two bars meet at the kitchen. One holds living space and faces the lawn; the other holds bedrooms and turns its back to the neighbour. The courtyard between them is the circulation: in Seattle, a covered outdoor route between rooms is used more of the year than people expect.",
      "Cedar was left to silver on three elevations and stained black on the fourth, where the house meets the street. Inside, exposed glulam beams carry the span over the living room so the glass wall could run uninterrupted.",
    ],
    quote: {
      text: "Three firms told us the tree had to come out. CDB started with the tree and worked outward.",
      attribution: "Dr. Ellis Nakamura, Owner",
    },
    cover: images.mercer1,
    gallery: [
      {
        src: images.mercer1,
        alt: "Mercer Courtyard House wrapping a mature madrone tree",
        caption:
          "The plan opens around the madrone; no roots inside the drip line were cut.",
      },
      {
        src: images.mercer2,
        alt: "Courtyard and covered outdoor dining at Mercer Courtyard House",
        caption: "The covered court is the main route between the two bars.",
      },
      {
        src: images.mercer3,
        alt: "Living room with stone hearth and sliding glass wall",
        caption:
          "Glulam beams carry the span so the glass wall runs uninterrupted.",
        shape: "wide",
      },
      {
        src: images.mercer4,
        alt: "Interior looking out across the terrace and pool",
        caption: "Looking back out across the terrace in late afternoon.",
        shape: "tall",
      },
    ],
    credits: [
      { label: "Architecture", value: "CDB" },
      { label: "Structure", value: "Puget Structural" },
      { label: "Builder", value: "Alder & Main" },
      { label: "Arborist", value: "Cascade Tree Consulting" },
    ],
    featured: true,
  },
  {
    slug: "hudson-valley-retreat",
    title: "Hudson Valley Retreat",
    location: "Columbia County, New York",
    category: "Residential",
    year: 2025,
    status: "In Construction",
    summary:
      "A weekend house of three linked volumes — white stucco, blackened steel and vertical cedar — sited along an old stone field wall.",
    facts: [
      { label: "Site", value: "18 acres, former pasture" },
      { label: "Area", value: "2,950 sq ft" },
      { label: "Program", value: "3 bed, 2.5 bath, barn" },
      { label: "Structure", value: "Timber frame, high-performance envelope" },
      { label: "Completion", value: "Expected 2026" },
    ],
    narrative: [
      "The clients wanted a house that looked like it had been added to over a century rather than delivered in one piece. We took the cue literally: three volumes of different height, material and roof pitch, set end to end along the line of an existing dry-stone wall.",
      "The envelope is where the real work went. Double-stud walls, continuous exterior insulation and triple glazing bring the house close to Passive House airtightness, which matters in a place that spends four months below freezing and has no gas line.",
      "Inside the move is simple — a single long spine of white oak joinery that runs the length of all three volumes, holding storage, the kitchen, a desk and a window seat, so the rooms themselves can stay empty.",
    ],
    cover: images.hudson1,
    gallery: [
      {
        src: images.hudson1,
        alt: "Hudson Valley Retreat entry elevation with timber volume",
        caption:
          "The cedar volume marks the entry; white stucco holds the bedrooms.",
      },
      {
        src: images.hudson2,
        alt: "Rear elevation and covered deck at Hudson Valley Retreat",
        caption: "The covered deck faces south-west across the old pasture.",
      },
      {
        src: images.hudson3,
        alt: "Street side massing of the three linked volumes",
        caption:
          "Three volumes of different height, read as additions over time.",
        shape: "tall",
      },
      {
        src: images.hudson4,
        alt: "Living room with clerestory window band",
        caption: "A clerestory band lifts light over the joinery spine.",
        shape: "wide",
      },
      {
        src: images.hudson5,
        alt: "Living area with hearth and arched windows",
        caption: "The hearth anchors the middle volume.",
        shape: "tall",
      },
    ],
    credits: [
      { label: "Architecture", value: "CDB" },
      { label: "Envelope consultant", value: "North Climate" },
      { label: "Builder", value: "Keeler Bros." },
    ],
    featured: true,
  },
  {
    slug: "foundry-works",
    title: "Foundry Works",
    location: "Austin, Texas",
    category: "Adaptive Reuse",
    year: 2023,
    status: "Completed",
    summary:
      "A 1940s metal foundry converted into a 22,000 sq ft workplace, keeping the crane rails and the scars that came with them.",
    facts: [
      { label: "Building", value: "1947 industrial shed" },
      { label: "Area", value: "22,400 sq ft" },
      { label: "Program", value: "Workplace, café, event hall" },
      { label: "Strategy", value: "Structural retention, new insert" },
      { label: "Completion", value: "Winter 2023" },
    ],
    narrative: [
      "The existing shed was structurally sound and architecturally generous — a 34-foot clear span with north-facing sawtooth glazing. What it lacked was any enclosure that met code, and any room smaller than enormous.",
      "We left the shell almost untouched and inserted a two-storey timber-and-glass building inside it, held off the original walls by four feet on every side. The gap is the circulation, the services route, and the acoustic break — and it means the old structure can still be read in full from inside.",
      "The crane rails stayed. So did the burn marks on the slab, which we sealed rather than ground away. New work is unambiguously new: blackened steel, pale birch ply, clear glass.",
    ],
    quote: {
      text: 'Our brief was "do not make it look like a renovation of a foundry." It looks like a foundry with a building in it, which is better.',
      attribution: "Priya Raghavan, Foundry Works",
    },
    cover: images.foundry1,
    gallery: [
      {
        src: images.foundry1,
        alt: "Foundry Works exterior with angular new entry volume",
        caption: "The new entry volume announces the insert from the street.",
      },
      {
        src: images.foundry2,
        alt: "Main hall at Foundry Works with exposed concrete ceiling",
        caption: "The main hall keeps the full 34-foot clear span.",
        shape: "wide",
      },
      {
        src: images.foundry3,
        alt: "Glazed meeting rooms along the circulation gap",
        caption:
          "Meeting rooms sit in the four-foot gap between insert and shell.",
        shape: "tall",
      },
      {
        src: images.foundry4,
        alt: "Foundry Works in its urban context",
        caption: "The shed in its changing context on the east side.",
        shape: "tall",
      },
    ],
    credits: [
      { label: "Architecture", value: "CDB" },
      { label: "Heritage", value: "Lowell Preservation" },
      { label: "Builder", value: "Thorn & Field" },
    ],
  },
  {
    slug: "nob-hill-residence",
    title: "Nob Hill Residence",
    location: "San Francisco, California",
    category: "Interiors",
    year: 2024,
    status: "Completed",
    summary:
      "A full interior reconstruction of a 1920s apartment — the plan opened up, the plasterwork kept, every service replaced.",
    facts: [
      { label: "Building", value: "1924 cooperative apartment" },
      { label: "Area", value: "2,240 sq ft" },
      { label: "Program", value: "3 bed, 2.5 bath" },
      { label: "Scope", value: "Interiors, joinery, MEP" },
      { label: "Completion", value: "Autumn 2024" },
    ],
    narrative: [
      "Nothing structural could move — it is a 1924 co-op, and the shear walls are the shear walls. The work was entirely in the plan: four small service rooms at the centre of the apartment were consolidated into one, which released enough floor area to turn a dark galley kitchen into the main room of the house.",
      "The original cornice and ceiling roses were catalogued, removed, repaired off site and reinstalled. Everything behind them — wiring, plumbing, ducting, insulation — is new.",
      "Material restraint carried the renovation: Carrara marble, lacquered white joinery, smoked oak floors and blackened brass. In the bathrooms we allowed a single departure into dark stone, which is the one room in the apartment that feels nothing like 1924.",
    ],
    quote: {
      text: "It is the same apartment. It is also completely unrecognisable. I still cannot explain how both are true.",
      attribution: "Gideon Marsh, Owner",
    },
    cover: images.nobhill1,
    gallery: [
      {
        src: images.nobhill1,
        alt: "Nob Hill Residence kitchen in marble and white lacquer",
        caption:
          "The consolidated core released enough area for a full kitchen.",
      },
      {
        src: images.nobhill2,
        alt: "Kitchen island with pendant lighting and oak joinery",
        caption:
          "Smoked oak and white lacquer against the original plasterwork.",
        shape: "wide",
      },
      {
        src: images.nobhill3,
        alt: "Principal bathroom in dark stone with freestanding tub",
        caption:
          "The principal bathroom is the single departure into dark stone.",
        shape: "tall",
      },
      {
        src: images.nobhill4,
        alt: "Second bathroom in Carrara marble with oak vanity",
        caption: "Carrara and oak in the second bathroom.",
        shape: "tall",
      },
      {
        src: images.nobhill5,
        alt: "Dining room looking toward the stair",
        caption: "The dining room, looking back toward the original stair.",
      },
      {
        src: images.nobhill6,
        alt: "Living room with timber feature wall",
        caption: "A timber wall conceals storage along the living room.",
        shape: "wide",
      },
    ],
    credits: [
      { label: "Interiors", value: "CDB" },
      { label: "Plaster restoration", value: "Cassaro & Sons" },
      { label: "Builder", value: "Pacific Heights Construction" },
    ],
    featured: true,
  },
];

/* ========================================================================
 * 4. HOME
 * Every piece of copy on the landing page.
 * ======================================================================== */

export const home = {
  hero: {
    /** Each string is one animated line. Keep to 2–4 lines. */
    headlines: ["Buildings that", "know where", "they stand."],
    subhead:
      "CDB is an architecture and interior design studio working on custom homes, renovations and considered commercial space across the United States.",
    /** Small label above the headline. */
    eyebrow: "Architecture & Interiors — Est. 2014",
    image: images.canyon1,
    imageAlt:
      "A dark-clad modern home at dusk with light spilling from narrow window slots",
    cta: { label: "See the work", href: "/work" },
    scrollCue: "Scroll",
  },

  /** Large statement block that reveals word by word. */
  manifesto: {
    label: "Our position",
    statement:
      "Good architecture is not a style. It is the result of taking a site, a budget and a way of living seriously enough to let them decide the form.",
    body: [
      "We are a small studio by choice. Every project is run by the person who designed it, from the first site visit to the last site visit, which is the only way we know to keep an idea intact through two years of construction.",
      "We build in the United States, mostly for people building once. That raises the stakes — so our process is deliberately slow at the start and deliberately boring at the end.",
    ],
    link: { label: "How we work", href: "/about" },
  },

  /** The measure of the studio. `value` is numeric so it can count up;
   *  put units in `suffix`, and `note` is the line of context beneath it. */
  stats: {
    label: "By the numbers",
    title: "Eleven years, measured honestly.",
    items: [
      {
        value: 11,
        suffix: "",
        label: "Years in practice",
        note: "Founded in Austin in 2014. Same principal, same approach.",
      },
      {
        value: 64,
        suffix: "",
        label: "Projects delivered",
        note: "Houses, renovations and workplace, all the way to close-out.",
      },
      {
        value: 9,
        suffix: "",
        label: "States worked in",
        note: "Licensed in Texas, California and New York.",
      },
      {
        value: 97,
        suffix: "%",
        label: "Clients who refer us",
        note: "Most of our work arrives through someone we built for.",
      },
    ],
  },

  /** Scroll-driven 3D section. The five steps map one-to-one onto the five
   *  stages of the model beside them, so edit them together:
   *  design → foundation → structure → exterior → interior. */
  method: {
    label: "The method",
    title: "Watch a house get drawn, then built.",
    intro:
      "Most projects come apart in the gap between a drawing and a decision. Ours are built the way a building is built — on the drawing first, then on the ground, and nothing starts until the thing beneath it is settled.",
    steps: [
      {
        n: "01",
        title: "Design",
        stage: "Site, brief, drawings",
        body: "Two to four weeks on the land before a single line is drawn: survey, soil, sun path, zoning envelope, and a long conversation about how you actually live. Then it all goes onto the drawing — and stays there until it is right.",
      },
      {
        n: "02",
        title: "Foundation",
        stage: "Groundworks and slab",
        body: "Footings, drainage and slab, set out from the survey rather than the site fence. Everything above this stage inherits whatever we get wrong here, so it is the one stage we never compress.",
      },
      {
        n: "03",
        title: "Structure",
        stage: "Frame and floor plates",
        body: "The frame goes up and the site comes with it — levels, driveway, planting. Spans are set so the glass can run uninterrupted later. Changes after this stage start costing real money.",
      },
      {
        n: "04",
        title: "Exterior",
        stage: "Envelope, cladding, finish",
        body: "The skin does the heavy lifting: insulation, glazing, shading, then the cladding and the final colour. This is the stage where the drawing stops being a drawing.",
      },
      {
        n: "05",
        title: "Interior",
        stage: "Fit-out and handover",
        body: "Joinery, surfaces and lighting installed under weekly supervision, with one point of contact and a punch list we close ourselves. We do not hand a project over. We finish it, then turn the lights on.",
      },
    ],
  },

  work: {
    label: "Selected work",
    title: "Six projects that explain the studio.",
    link: { label: "All projects", href: "/work" },
  },

  /** Services. `deliverables` is what the client actually receives — it is the
   *  part people read, so keep it concrete. Images come from images.ts. */
  services: {
    label: "What we do",
    title: "Six ways we get hired. What each one actually buys you.",
    intro:
      "Architecture fees are opaque almost everywhere. Here is the scope behind each one, what lands in your hands at the end of it, and roughly how long it takes.",
    items: [
      {
        title: "New custom homes",
        body: "Ground-up single-family houses, from the first site visit to the final inspection. One principal leads it the whole way.",
        deliverables: [
          "Feasibility and zoning study",
          "Three costed massing options",
          "Full construction documents",
          "Weekly site supervision to close-out",
        ],
        duration: "24 – 36 months",
        image: images.hudson1,
        imageAlt:
          "A newly built modern home with timber and white rendered volumes",
      },
      {
        title: "Renovations & additions",
        body: "Whole-house reconstruction, extensions and structural reconfiguration — the work where what is already standing sets the rules.",
        deliverables: [
          "Existing-conditions survey",
          "Structural strategy with an engineer",
          "Permit and tender set",
          "Builder coordination through the build",
        ],
        duration: "12 – 20 months",
        image: images.nobhill5,
        imageAlt: "A renovated dining room looking toward the original stair",
      },
      {
        title: "Interior architecture",
        body: "Joinery, material, lighting and fit-out — specified and detailed to the millimetre, not decorated from a mood board.",
        deliverables: [
          "Joinery drawings at 1:5",
          "Material and finish schedule",
          "Lighting layout and specification",
          "Fixture and fitting selections",
        ],
        duration: "6 – 12 months",
        image: images.nobhill1,
        imageAlt: "A kitchen in marble and white lacquer with oak joinery",
      },
      {
        title: "Commercial & workplace",
        body: "Offices, hospitality and adaptive reuse, where the building matters as much as the fit-out and the programme never stops.",
        deliverables: [
          "Test fits and yield studies",
          "Base-build and landlord coordination",
          "Code and accessibility review",
          "Phased delivery plan",
        ],
        duration: "12 – 24 months",
        image: images.foundry2,
        imageAlt:
          "A converted industrial hall with its original clear span retained",
      },
      {
        title: "Feasibility & zoning",
        body: "Before you buy. A fixed-fee study that tells you what the site will carry, what it will cost, and whether to walk away.",
        deliverables: [
          "Site capacity and yield analysis",
          "Setback, height and overlay envelope",
          "Order-of-magnitude construction budget",
          "A written go or no-go recommendation",
        ],
        duration: "3 – 5 weeks",
        image: images.studioSite,
        imageAlt: "An undeveloped valley site at dawn",
      },
      {
        title: "Construction administration",
        body: "Taken on alone, for projects designed elsewhere that need someone on the client side of the table during the build.",
        deliverables: [
          "Tender review and bid levelling",
          "Shop drawing and submittal review",
          "Fortnightly site observation reports",
          "Punch list and project close-out",
        ],
        duration: "Duration of the build",
        image: images.canyon5,
        imageAlt:
          "A perforated metal screen and timber cladding detail under construction",
      },
    ],
    /** Words that scroll horizontally as a marquee between the two halves. */
    marquee: [
      "Residential",
      "Interiors",
      "Adaptive Reuse",
      "Workplace",
      "Feasibility",
      "Hospitality",
    ],
  },

  /** Final call to action above the footer. This is the section that has to
   *  earn the enquiry, so it carries the reassurance copy as well as the form. */
  cta: {
    label: "Start a project",
    title: "Tell us about the site.",
    body: "Send an address, a rough budget and one sentence about what you want to build. A principal reads it — not an assistant, not a form queue — and tells you honestly whether we are the right studio for it.",

    /** Three-step expectation setting. Removes the "what happens if I write?"
     *  hesitation that kills most enquiries. */
    steps: [
      {
        n: "01",
        title: "You write",
        body: "Three fields below. Sixty seconds. No brief required.",
      },
      {
        n: "02",
        title: "We reply in two business days",
        body: "With a straight answer on fit, fee range and timing.",
      },
      {
        n: "03",
        title: "A 45-minute call",
        body: "No charge, no pitch deck. You leave knowing where you stand.",
      },
    ],

    /** Shown as a row of hard facts under the form. */
    reassurance: [
      "Replies within 2 business days",
      "First call is free",
      "Licensed in TX, CA & NY",
      "No obligation to proceed",
    ],

    /** Which fields from contact.ts to show in the short form here. The full
     *  form lives on /contact. */
    quickFields: ["name", "email", "message"],
    submitLabel: "Send it to the studio",
    fullFormLink: { label: "Prefer the full enquiry form", href: "/contact" },

    image: images.canyon2,
    imageAlt: "A completed modern house at dusk, seen from its approach",
  },
} as const;

/* ========================================================================
 * 5. ABOUT
 * The studio page: positions, timeline, team, recognition.
 * ======================================================================== */

export const about = {
  hero: {
    eyebrow: "The studio",
    title: "A small practice, deliberately.",
    lede: "CDB was founded in Austin in 2014 on a simple arrangement: the person who designs your building is the person who stands on the site while it is built. Eleven years on, we have grown slowly enough to keep that true.",
    image: images.studioInterior,
    imageAlt: "The CDB studio interior with glazed meeting rooms",
  },

  /** Beliefs. Rendered as a numbered list that reveals on scroll. */
  principles: [
    {
      title: "The site decides",
      body: "Before we draw, we measure, survey and sit on the land at different hours. Orientation, grade, prevailing wind, the neighbour’s roofline and the one tree worth keeping will shape the building more than any reference image ever will.",
    },
    {
      title: "Budget is a design input",
      body: "A number on the brief is not a constraint on quality, it is a constraint on area and complexity. We cost options at concept stage so you can make the trade honestly, rather than discovering it at tender.",
    },
    {
      title: "Fewer materials, better used",
      body: "Most of our projects use three materials and no more. Restraint ages better than variety, costs less to build well, and makes the detailing that holds a building together actually visible.",
    },
    {
      title: "Detail is where it is won",
      body: "A beautiful concept badly detailed becomes an ordinary building. We draw junctions at 1:5, specify what matters, and review shop drawings ourselves.",
    },
    {
      title: "Build for the next forty years",
      body: "High-performance envelopes, durable material, passive strategies before mechanical ones. Operating cost and comfort are design decisions, not an upgrade package.",
    },
    {
      title: "Finish what we start",
      body: "We stay on site weekly through construction and close the punch list ourselves. A project is complete when it is actually complete.",
    },
  ],

  /** Short studio timeline. */
  timeline: [
    {
      year: "2014",
      text: "Founded in a converted warehouse on Austin’s east side with two people and one house.",
    },
    {
      year: "2017",
      text: "First commercial commission; the studio grows to six.",
    },
    {
      year: "2020",
      text: "Begin working outside Texas — first projects in California and Washington.",
    },
    {
      year: "2023",
      text: "Foundry Works completes; the studio formalises its performance-envelope standard.",
    },
    {
      year: "2026",
      text: "Eleven people, work in nine states, and still one principal per project.",
    },
  ],

  /** Team. Replace `photo` with headshots when you have them. */
  team: [
    {
      name: "Camille Dubois-Brandt",
      role: "Founding Principal",
      bio: "Twenty years in practice across Chicago, Copenhagen and Austin. Licensed in TX, CA and NY. Leads design on every residential commission.",
    },
    {
      name: "Arun Sethi",
      role: "Principal, Technical",
      bio: "Envelope and construction detailing. Certified Passive House Designer. Runs documentation and site administration.",
    },
    {
      name: "Nora Whitlock",
      role: "Associate, Interiors",
      bio: "Joinery, material and lighting. Trained as a furniture maker, which shows in the drawings.",
    },
    {
      name: "Felix Oyelaran",
      role: "Associate",
      bio: "Commercial and adaptive reuse. Leads feasibility, zoning analysis and entitlement.",
    },
  ],

  /** Recognition / press. Shown as a quiet list. */
  recognition: [
    { year: "2025", text: "AIA Austin Design Award — Canyon Ridge Residence" },
    { year: "2024", text: "Dwell 24: Studios to Watch" },
    { year: "2024", text: "Architectural Record, Record Houses (longlist)" },
    { year: "2023", text: "AIA Texas Honor Award — Foundry Works" },
    { year: "2022", text: "Interior Design Best of Year, Finalist" },
  ],

  closing: {
    title: "We answer every enquiry ourselves.",
    body: "No account managers, no intake forms that go nowhere. Write to the studio and a principal reads it.",
    image: images.studioDetail,
    imageAlt: "Facade detail of perforated screen and timber cladding",
  },
} as const;

/* ========================================================================
 * 6. TESTIMONIALS
 * Client quotes. `rating` and `date` feed the review rich result,
 * so only publish reviews you actually have.
 * ======================================================================== */

export type Testimonial = {
  quote: string;
  name: string;
  /** Shown under the name, e.g. "Canyon Ridge Residence — Austin, TX". */
  context: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** ISO date. Used in structured data. */
  date: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "We interviewed five firms. CDB was the only one that asked to see the soil report before showing us a single image. Two years later the house sits on that hill like it grew there, and we came in four percent under the budget we set at concept.",
    name: "Marisol & Tobias Vance",
    context: "Point Dume House — Malibu, CA",
    rating: 5,
    date: "2024-02-18",
  },
  {
    quote:
      "Three architects told us the madrone had to come out. Camille started with the tree and worked outward. The courtyard that came out of that constraint is the part of the house we use every single day.",
    name: "Dr. Ellis Nakamura",
    context: "Mercer Courtyard House — Mercer Island, WA",
    rating: 5,
    date: "2024-09-04",
  },
  {
    quote:
      "What I did not expect was how boring construction was. Arun was on site every Thursday, the builder had answers before he had questions, and we had eleven change orders on a 4,000 square foot house. Eleven.",
    name: "Jonah Reinhardt",
    context: "Canyon Ridge Residence — Austin, TX",
    rating: 5,
    date: "2024-06-11",
  },
  {
    quote:
      "They talked us out of a second storey in the first meeting. It would have been a bigger fee for them and a worse building for us. That is the whole reason we kept working with them.",
    name: "Priya Raghavan",
    context: "Foundry Works — Austin, TX",
    rating: 5,
    date: "2023-12-02",
  },
  {
    quote:
      "A 1924 co-op with a board that says no to everything. CDB got every approval on the first submission because the documentation left nothing to argue with. The apartment is unrecognisable and the cornices are original.",
    name: "Gideon Marsh",
    context: "Nob Hill Residence — San Francisco, CA",
    rating: 5,
    date: "2024-11-21",
  },
  {
    quote:
      "We were building from 1,800 miles away. Weekly photo sets, a shared decision log, and a principal who picked up the phone. I never once felt like I was guessing.",
    name: "Hélène Carver",
    context: "Hudson Valley Retreat — Columbia County, NY",
    rating: 5,
    date: "2025-07-09",
  },
];

/* ========================================================================
 * 7. FAQ
 * Shown on the contact page and emitted as FAQPage structured data,
 * which is what earns the expandable answers in Google results.
 * ======================================================================== */

export const faq = [
  {
    q: "How much does it cost to hire an architect for a custom home?",
    a: "For ground-up custom homes we work on a percentage of construction cost, typically 10–14% depending on scope and complexity, or a fixed fee once the brief is settled. Feasibility studies are a flat fee and are credited against the full fee if you proceed.",
  },
  {
    q: "How long does a custom home take from first meeting to move-in?",
    a: "Plan on 24–36 months. Roughly 8–12 months of design and documentation, 2–6 months for permitting depending on jurisdiction, and 12–18 months of construction. Renovations are shorter; anything in a coastal or historic overlay is longer.",
  },
  {
    q: "Which states do you work in?",
    a: "We are licensed in Texas, California and New York, and have delivered projects in nine states. Outside those three we partner with a local architect of record, which is normal practice and adds no cost to you.",
  },
  {
    q: "Do you take on renovations, or only new builds?",
    a: "Both. Roughly a third of our work is whole-house renovation and addition. We do not take on cosmetic-only projects where there is no architectural or structural scope.",
  },
  {
    q: "What is the minimum project size you take on?",
    a: "Around $750,000 of construction cost for residential work. Below that, the fee required to do the job properly stops being good value for the client, and we will say so and refer you on.",
  },
  {
    q: "Can you work with a builder we have already chosen?",
    a: "Yes, and we often prefer it. Bringing a builder in early for pricing input during design produces better results than a blind tender. We will still review the contract and administer construction.",
  },
  {
    q: "Do you design the interiors as well?",
    a: "Yes. Interior architecture — joinery, material, lighting, fit-out — is included in most of our residential commissions rather than handed to a separate decorator. Furniture procurement is an optional add-on.",
  },
  {
    q: "What happens in the first conversation?",
    a: "A 45-minute call, no charge. We want the address, your rough budget range, your timeline, and what you are trying to get out of the project. By the end of it we will tell you whether we are the right studio for it.",
  },
] as const;

/* ========================================================================
 * 8. CONTACT
 * Contact page copy and the enquiry form.
 * Add a field to `fields` and it appears in the form, is validated, and
 * is included in the WhatsApp and email notifications automatically.
 * ======================================================================== */

export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  /** Only for type 'select'. */
  options?: string[];
  /** Half-width on desktop. */
  half?: boolean;
};

export const contact = {
  eyebrow: "Contact",
  title: "Start a project.",
  lede: "Send us the address, a rough budget range and a sentence about what you want to build. A principal reads every enquiry and replies within two business days.",

  /**
   * Shown beside the form. Built from SITE above rather than retyped, so
   * changing the studio's email or phone in one place changes it everywhere —
   * these used to be a second copy that quietly went stale.
   */
  details: [
    {
      label: "New projects",
      value: site.contact.email,
      href: `mailto:${site.contact.email}`,
    },
    {
      label: "Telephone",
      value: site.contact.phone,
      href: `tel:${site.contact.phoneE164}`,
    },
    {
      label: "Studio",
      value: `${site.contact.address.street}\n${site.contact.address.city}, ${site.contact.address.state} ${site.contact.address.zip}`,
    },
    { label: "Hours", value: site.contact.hours },
  ] as { label: string; value: string; href?: string }[],

  fields: [
    { name: "name", label: "Name", type: "text", required: true, half: true },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      half: true,
    },
    {
      name: "phone",
      label: "Phone",
      type: "tel",
      half: true,
      placeholder: "Optional",
    },
    {
      name: "location",
      label: "Project location",
      type: "text",
      half: true,
      placeholder: "City, State",
    },
    {
      name: "projectType",
      label: "Project type",
      type: "select",
      half: true,
      options: [
        "New custom home",
        "Renovation or addition",
        "Interior architecture",
        "Commercial or workplace",
        "Feasibility study",
        "Something else",
      ],
    },
    {
      name: "budget",
      label: "Construction budget",
      type: "select",
      half: true,
      options: [
        "Under $750k",
        "$750k – $1.5M",
        "$1.5M – $3M",
        "$3M – $6M",
        "Over $6M",
        "Not sure yet",
      ],
    },
    {
      name: "message",
      label: "About the project",
      type: "textarea",
      required: true,
      placeholder:
        "The site, what you want to build, and when you would like to start.",
    },
  ] satisfies Field[],

  submitLabel: "Send enquiry",
  successTitle: "Thank you — that came through.",
  successBody:
    "We have your enquiry and a principal will reply within two business days.",
  errorBody:
    `Something went wrong sending that. Email ${site.contact.email} and we will pick it up there.`,
  consent: "We use what you send only to reply to your enquiry.",

  faqTitle: "Before you write",
} as const;

/* ========================================================================
 * 9. SEO
 * Titles ~55 characters, descriptions 140–160, each one carrying the
 * primary keyword and a location. Project pages build their own.
 * ======================================================================== */

export const seo = {
  /** Fallback OG image. 1200x630. Put your own in /public and point here. */
  ogImage: "/og.jpg",
  twitterHandle: "",

  pages: {
    "/": {
      title: "CDB — Architecture Firm for Custom Homes in the US",
      description:
        "CDB is a US architecture firm designing modern custom homes, renovations and commercial spaces. Licensed in TX, CA and NY. See the work and start a project.",
      keywords: [
        "architecture firm",
        "custom home architects",
        "modern home design",
        "residential architect USA",
        "build a new house architect",
      ],
    },
    "/work": {
      title: "Projects — Custom Homes & Interiors | CDB Architecture",
      description:
        "Completed houses, renovations and workplace projects across Texas, California, Washington and New York. Photographs, plans and the thinking behind each one.",
      keywords: [
        "modern house architecture portfolio",
        "custom home projects",
        "architecture firm portfolio USA",
      ],
    },
    "/about": {
      title: "Studio & Process — CDB Architecture",
      description:
        "How we work: site-first design, costed concept options, and a principal on site every week. Meet the studio behind CDB and read our five-stage process.",
      keywords: [
        "architecture firm process",
        "how architects work",
        "custom home design process",
      ],
    },
    "/contact": {
      title: "Contact — Start a Project | CDB Architecture",
      description:
        "Tell us about your site, budget and timeline. A principal reads every enquiry and replies within two business days. Austin, TX — working nationwide.",
      keywords: [
        "hire an architect",
        "architect near me",
        "architecture firm Austin TX",
        "residential architect consultation",
      ],
    },
    "/404": {
      title: "Page not found — CDB Architecture",
      description:
        "That page does not exist. Browse the work or get in touch with the studio.",
      keywords: [],
    },
  },
} satisfies {
  ogImage: string;
  twitterHandle: string;
  pages: Record<
    string,
    { title: string; description: string; keywords: string[] }
  >;
};

export type SeoPath = keyof typeof seo.pages;


/* ========================================================================
 * 10. ANALYTICS
 * Visitor numbers, traffic sources and form-submission counts.
 *
 * Umami Cloud's free plan covers this comfortably: 100,000 events a month,
 * one website, six months of history, no card required. A page view is one
 * event and each form submission is one more, so a site at a few thousand
 * visits a month uses a fraction of it.
 *
 * Setup — about two minutes:
 *   1. Sign up at https://cloud.umami.is and add your domain as a website.
 *   2. Copy the "Website ID" it gives you (a UUID) into `websiteId` below.
 *   3. Deploy. The dashboard starts filling immediately.
 *
 * Leave `websiteId` empty and no script loads and nothing is tracked, so
 * local development never pollutes the numbers.
 * ======================================================================== */

export const analytics = {
  /** Paste the Website ID from the Umami dashboard here. */
  websiteId: '',

  /** Umami Cloud's tracker. Change only if you self-host Umami. */
  scriptUrl: 'https://cloud.umami.is/script.js',

  /**
   * Hostnames that should never be tracked, so your own visits and preview
   * deploys stay out of the figures.
   */
  ignoreHosts: ['localhost', '127.0.0.1'],

  /** Event names, kept here so the dashboard and the code cannot drift apart. */
  events: {
    enquirySent: 'enquiry-sent',
    enquiryFailed: 'enquiry-failed',
    enquiryStarted: 'enquiry-started',
  },
} as const


/* ========================================================================
 * 11. ENQUIRY SHEET
 * Every submitted enquiry is appended as a row in your Google Sheet through
 * SheetDB, timestamped, and flagged `pending` so you can work it as a call
 * list.
 *
 * The browser posts to this endpoint directly — SheetDB allows that — so the
 * form needs no server of its own and works the same locally and in
 * production.
 *
 * ---- One-time setup -----------------------------------------------------
 * 1. In the Google Sheet, paste these as row 1, one per column, spelled
 *    exactly like this. SheetDB matches by column name and silently drops
 *    anything it cannot match:
 *
 *      submitted_at | name | email | phone | location | project_type |
 *      budget | message | call_status | notes | source
 *
 * 2. Optional but recommended: select the call_status column and use
 *    Data → Data validation → Dropdown, with the four values in
 *    `callStatuses` below, so the tracker stays consistent.
 *
 * ---- Worth knowing ------------------------------------------------------
 * Because the endpoint ships inside the public JavaScript bundle, anyone who
 * views source can read it and append rows themselves. Two settings in the
 * SheetDB dashboard limit the damage:
 *   - Permissions tab: allow only "create". The endpoint then cannot be used
 *     to read, edit or delete what is already in the sheet.
 *   - CORS tab: restrict to your own domain. This stops it being called from
 *     another website, though not from a script or terminal.
 * The free plan allows 500 writes a month, so also keep an eye on the usage
 * figure in the dashboard.
 * ======================================================================== */

const CALL_STATUSES = ["pending", "called", "confirmed", "not confirmed"] as const;
type CallStatus = (typeof CALL_STATUSES)[number];

export const sheet = {
  /** SheetDB endpoint for the enquiries sheet. */
  endpoint: 'https://sheetdb.io/api/v1/xav8oig506g1o',

  /**
   * Use these as the dropdown values on the call_status column. Listing them
   * here also type-checks `initialCallStatus` below, so a typo that would not
   * match the dropdown fails the build instead of reaching the sheet.
   */
  callStatuses: CALL_STATUSES,

  /** Every new enquiry lands as this; the rest you set by hand. */
  initialCallStatus: "pending" satisfies CallStatus,

  /** Timestamps are written in the studio's timezone, not the visitor's. */
  timezone: 'America/Chicago',
  timezoneLabel: 'CT',
} as const
