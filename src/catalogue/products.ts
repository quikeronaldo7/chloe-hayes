import type { Product } from "./types";

/**
 * CHLOE IN AUSTIN: THE SEVEN GUIDES
 *
 * Every fact here comes from the FINAL customer PDF in Drive folder
 * 1fc92emvOWwEM6SNvsbTo8h4MLBGjWDAO (titles, page counts, editions, contents,
 * interactive features and caveats). Where a PDF doesn't state something, the
 * site doesn't either. Source files and checks: docs/CATALOGUE.md.
 *
 * Stripe: each guide has its own TEST-mode Product in the shared QR DIGITAL account
 * (metadata storefront=chloe-in-austin). Live Products are created at launch.
 *
 * Prices: none approved yet (18 Oct 2026). Every price is `pending`, which means
 * "Price coming soon" on the site and no real checkout. Never type a number in
 * here without a recorded owner approval in readiness.ts.
 */

const PENDING = { amount: null, status: "pending", source: "Awaiting owner pricing approval (18 Oct 2026)." } as const;

const CHECK_LIVE =
  "Prices, hours, reservation rules and access change. Every listing links to the official source: confirm there before you plan around a detail.";

export const products: Product[] = [
  // -------------------------------------------------------------------------
  {
    id: "cia-new-to-austin",
    slug: "new-to-austin",
    title: "New to Austin: The Ultimate Guide to Living, Exploring & Belonging in Austin",
    shortTitle: "New to Austin",
    subtitle: "The friend you call when you're choosing a neighborhood, planning week one, or looking for your people.",
    collection: "start-here",
    price: PENDING,
    stripe: { testProductId: "prod_VSjpsLrbCLnmCz" },
    cover: {
      kind: "typeset",
      tone: "forest",
      count: "12",
      countLabel: "chapters",
      lines: ["New to", "Austin"],
      // "APPROVED — Franklin Chloe Hero" (Drive, Revision Round 2, 18 Oct 2026). Focus keeps her face in the upper third.
      photo: { src: "/images/chloe/chloe-bbq-table.jpg", alt: "Chloe at a table loaded with barbecue, mid-bite", focus: "45% 17%" },
    },
    hero: { src: "/images/chloe/chloe-bbq-table.jpg", alt: "Chloe at a table loaded with barbecue, mid-bite", focus: "45% 17%" },
    lede: "Moving somewhere new gives you a lot to look forward to, and about a thousand questions. This is the guide for all of them: where to live, what it really costs, whether you need a car, and how to actually meet people once the boxes are unpacked.",
    summary:
      "Twelve chapters on living in Austin: neighborhoods and real costs, settling in, making friends, eating well and your first 90 days, with worksheets you can fill in on screen.",
    promise:
      "Choose a neighborhood that fits your real life, get the admin done in the right order, and build a social life faster than “I'll figure it out eventually.”",
    bestFor: [
      "Anyone moving to Austin, or seriously thinking about it",
      "Newcomers in their first few months who want a plan, not a pile of tabs",
      "Couples and families comparing neighborhoods and routines",
      "People who've moved here and want to stop eating at the same three places",
    ],
    notFor: [
      "A directory of every business in Austin. It's a thoughtful starting point with real places and links",
      "Legal, tax or financial advice. Rent and cost figures are dated reference points, not quotes",
      "A replacement for touring an apartment or checking a commute at the exact address",
    ],
    contents: [
      { title: "Welcome to Austin", detail: "How to use the guide, fast-start routes and a priorities worksheet" },
      { title: "Austin 101", detail: "What it really costs (with a budget worksheet), weather and seasons, and whether you actually need a car" },
      { title: "Where Should You Live?", detail: "Twelve profiled neighborhoods, a central-Austin map, suburbs, a shortlist worksheet and a 1–5 fit scorecard" },
      { title: "Moving & Settling In", detail: "The first 48 hours, admin life, lease and move-in costs, and a realistic first-30-days checklist" },
      { title: "How to Make Friends", detail: "Active, creative and volunteer routes in, plus a 30-day friendship challenge" },
      { title: "Single in Austin", detail: "Actual ways to meet people and a low-pressure plan" },
      { title: "Where to Eat & Drink", detail: "Tacos and barbecue, dinners worth planning, and finding your everyday favorites" },
      { title: "Dating & Relationships", detail: "Date ideas with personality and how to keep having fun together" },
      { title: "Explore Austin & Beyond", detail: "Swim-access realities, your first Hill Country day trip, making exploring a habit" },
      { title: "Austin for Couples & Families", detail: "Family days without a giant itinerary and the practical family reset" },
      { title: "How to Stay in the Know", detail: "Who to follow and Austin through the year" },
      { title: "Your First 90 Days", detail: "A 30/60/90-day plan to make Austin yours" },
    ],
    chips: ["51 pages", "12 chapters", "2 maps", "284 fillable fields"],
    specs: {
      pages: 51,
      edition: "2026–27 edition",
      checked: "Details checked 17 October 2026",
      format: "Interactive PDF (US Letter)",
      interactive: [
        "284 fillable form fields: budgets, shortlists, a fit scorecard, checklists and a 30/60/90-day plan",
        "101 clickable official links",
        "Clickable contents, chapter tabs on every page and PDF bookmarks",
        "Two original maps: central Austin's 12 profiled neighborhoods, and metro and suburbs",
      ],
    },
    caveats: [
      "Rent figures are dated averages from named sources (Apartment List and Apartments.com, October 2026), not quotes for a specific apartment.",
      "Transit fares, ordinances and swim access change; the guide says when and links to the live source.",
      "The guide recommends Adobe Acrobat Reader for filling in the worksheets.",
    ],
    previews: [
      {
        image: { src: "/images/previews/new-to-austin-pages-02-13.jpg", alt: "Thumbnails of pages 2 to 13 of New to Austin: contents, welcome, Austin 101 and neighborhood pages" },
        caption: "Pages 2–13 at a glance: contents, welcome, Austin 101 and the neighborhood chapter.",
        ratio: 2603 / 293,
      },
      {
        image: { src: "/images/previews/new-to-austin-pages-14-26.jpg", alt: "Thumbnails of pages 14 to 26: suburbs, shortlist worksheet, settling in and making friends" },
        caption: "Pages 14–26: suburbs, the shortlist worksheet, settling in and making friends.",
        ratio: 2820 / 293,
      },
      {
        image: { src: "/images/previews/new-to-austin-pages-27-39.jpg", alt: "Thumbnails of pages 27 to 39: single in Austin, eating and drinking, dating and exploring" },
        caption: "Pages 27–39: single life, eating and drinking, dating and exploring.",
        ratio: 2820 / 293,
      },
    ],
    related: [
      { id: "cia-being-single", why: "Chapter 6 gives you the starting points; this is the full, checked list of where to meet people IRL." },
      { id: "cia-dinner-spots", why: "When your first “we should go somewhere nice” night comes around." },
      { id: "cia-hill-country", why: "Your first Hill Country day trip, planned five different ways." },
    ],
    faqs: [
      { q: "I haven't moved yet. Is it still useful?", a: "Yes. The neighborhood, cost and car chapters are written for people still deciding, and the worksheets help you compare real addresses before you sign anything." },
      { q: "Can I type into the worksheets?", a: "Yes. The PDF has 284 real form fields. Fill them in, save the file, and your answers stay with it. Adobe Acrobat Reader is the app the guide recommends." },
      { q: "How current is it?", a: "It's the 2026–27 edition, with details checked on 17 October 2026. Anything that changes often (fares, rent, access rules) is dated and linked to its official source." },
    ],
    accent: "forest",
    seo: {
      title: "New to Austin: The Ultimate Guide to Living, Exploring & Belonging",
      description:
        "A 51-page interactive guide for moving to Austin: neighborhoods and real costs, settling in, making friends and your first 90 days, with 284 fillable fields and two maps.",
    },
  },

  // -------------------------------------------------------------------------
  {
    id: "cia-dinner-spots",
    slug: "10-best-dinner-spots",
    title: "Chloe's 10 Best Dinner Spots in Austin",
    shortTitle: "10 Best Dinner Spots",
    subtitle: "The ten dinners I'd plan a whole night around, and exactly how to get the table.",
    collection: "eat-and-drink",
    price: PENDING,
    stripe: { testProductId: "prod_VSjpiXtGJpFKPI" },
    cover: { kind: "typeset", tone: "terracotta", count: "10", countLabel: "dinners", lines: ["Chloe's 10 Best", "Dinner Spots", "in Austin"] },
    hero: { src: "/images/chloe/chloe-bbq-table.jpg", alt: "Chloe at a table loaded with barbecue, mid-bite", focus: "50% 40%" },
    lede: "Not the ten most expensive restaurants in Austin. The ten dinners worth planning a night around, judged on food, service, atmosphere, Austin significance and how memorable the whole evening feels.",
    summary:
      "Ten Austin dinners, one page each: what to order, what to spend, how hard the table is to get and the booking trick that actually works.",
    promise: "Pick the right restaurant for the night you want, order well, and actually get the reservation.",
    bestFor: [
      "Birthdays, anniversaries and “we should do something nice” nights",
      "Food people who want the tasting-menu rooms and the fun ones",
      "Visitors with one big dinner to plan",
      "Anyone tired of losing reservation drops",
    ],
    notFor: [
      "A cheap-eats or taco list. These are occasion dinners",
      "A guarantee of a table: the guide tells you how booking works, the restaurant decides",
      "Paid placements. The guide is independent and no restaurant paid to be included",
    ],
    contents: [
      { title: "The ten at a glance", detail: "Hestia, Red Ash, Uchi, Barley Swine, Canje, Lutie's, Craft Omakase, Jeffrey's, Kappo Kappo and Fabrik" },
      { title: "How I chose the ten", detail: "The criteria, plus a key for the badges and the reservation-difficulty scale" },
      { title: "Ten restaurant pages", detail: "Best for, neighborhood, what to spend, vibe, why it made the list, Chloe's perfect order, know-before-you-go and a tip" },
      { title: "The best of it, by mood", detail: "The full experience, the fun night out, the sushi splurge, the surprise…" },
      { title: "Plan ahead", detail: "Release windows, deposits, dietary limits and fallbacks like bar seats and day-of calls" },
      { title: "Quick planner", detail: "All ten side by side, with booking links, a date field and a Done box" },
      { title: "My dinner notes + wishlist", detail: "Fill-in cards for what you ordered and whether you'd go back" },
    ],
    chips: ["19 pages", "10 restaurants", "71 fillable fields"],
    specs: {
      pages: 19,
      edition: "2026 edition",
      checked: "Research checked October 2026",
      format: "Interactive PDF (US Letter)",
      interactive: [
        "Live Book, Website, Instagram, Directions and Michelin links for each restaurant",
        "71 fillable fields: planner dates, Done boxes, dinner-notes cards and a wishlist",
        "Tap any restaurant on the overview pages to jump to it",
      ],
    },
    caveats: [
      "Spend figures marked “estimate” are per-person planning numbers; fixed-menu prices are as published in October 2026.",
      "Menus change constantly. A Perfect Order is a map, not a promise every dish will be on.",
      "Awards are date-stamped to the 2026 MICHELIN Guide Texas and other named sources.",
      "Photographs combine restaurant photography with approved AI-assisted refinements, as the guide itself notes.",
    ],
    related: [
      { id: "cia-date-ideas", why: "Dinner's sorted. Here's what to do before, after, or on the nights you don't want a tasting menu." },
      { id: "cia-exclusive", why: "For the omakase counters and members-only rooms that work on release days and applications." },
    ],
    faqs: [
      { q: "Are these all expensive?", a: "Most are occasion restaurants, but not all. Spend ranges from about $60–100 a person (Canje, estimated) up to the bigger tasting menus, and each page tells you what to plan for." },
      { q: "Does it help me actually get a reservation?", a: "That's half the point. Every page says how the restaurant books (OpenTable, Tock, SevenRooms or phone), when tables release and what the fallbacks are." },
      { q: "Is any restaurant sponsored?", a: "No. The guide is independent and no restaurant paid to be included." },
    ],
    accent: "terracotta",
    seo: {
      title: "Chloe's 10 Best Dinner Spots in Austin",
      description:
        "Ten Austin dinners worth planning a night around, with what to order, what to spend and how to get the reservation. 19-page interactive PDF, research checked October 2026.",
    },
  },

  // -------------------------------------------------------------------------
  {
    id: "cia-being-single",
    slug: "guide-to-being-single",
    title: "Chloe's Guide to Being Single in Austin",
    shortTitle: "Guide to Being Single",
    subtitle: "Where to actually meet people IRL, and whether you can walk in alone.",
    collection: "date-and-connect",
    price: PENDING,
    stripe: { testProductId: "prod_VSjp6hIedheOr8" },
    cover: {
      kind: "typeset",
      tone: "sage",
      count: "IRL",
      countLabel: "meet people",
      lines: ["Chloe's Guide to", "Being Single", "in Austin"],
      // Brand portrait from Drive "01 — Brand Assets" (Revision Round 2, 18 Oct 2026), cropped to head and shoulders.
      photo: { src: "/images/chloe/chloe-rooftop-portrait.jpg", alt: "Chloe smiling on a rooftop with the Austin skyline behind", focus: "50% 24%" },
    },
    hero: { src: "/images/chloe/chloe-rooftop-portrait.jpg", alt: "Chloe smiling on a rooftop with the Austin skyline behind", focus: "50% 24%" },
    lede: "This isn't a list of bars where singles supposedly hang out. It's the clubs, classes, nights and communities in Austin that are actually running, with what to expect, who each one suits and whether you can show up on your own.",
    summary:
      "Singles nights, run clubs, two-step, dinners with strangers and the communities worth joining, each with who it suits and whether you can go solo.",
    promise: "Get out of the apps and into rooms where meeting people is the point, whether you want a date, a friend group or just a fuller calendar.",
    bestFor: [
      "Singles who want to meet people in real life",
      "Newcomers building a social circle from scratch",
      "Anyone who hates walking into a room alone",
      "Sober-curious, LGBTQ+ and 30+ crowds: each has its own picks",
    ],
    notFor: [
      "Exclusively a dating guide: most picks are about meeting people, full stop",
      "Dating-app advice or coaching",
      "A guarantee that any event is still on: one-off dates are labeled and linked",
    ],
    contents: [
      { title: "Pick your way in", detail: "Start from what you're thinking: “I want to date”, “I just moved here”, “I'd rather not drink”…" },
      { title: "Actual singles events", detail: "CitySwoon, Jigsaw Dating, Pitch-A-Friend and smaller series, with ages, cost and format" },
      { title: "Meet people naturally", detail: "The Board Walks, two-step at Sagebrush, Timeleft, Skip the Small Talk and more" },
      { title: "Get active", detail: "Joining a sports league as a free agent, and Austin's run clubs decoded" },
      { title: "Build your circle", detail: "Newcomer groups, women's socials, 30+ and sober-friendly communities" },
      { title: "Chloe's picks + a sample social week", detail: "The best option for each goal, then a week built from recurring events" },
      { title: "Stay in the loop", detail: "The calendars, newsletters and accounts that keep up, plus a quick planner" },
    ],
    chips: ["13 pages", "Come-alone ratings", "Live event links"],
    specs: {
      pages: 13,
      edition: "2026 edition",
      checked: "Checked October 2026",
      format: "PDF with live links (US Letter)",
      interactive: ["Live links to every organizer, event page and calendar", "A quick planner comparing the featured picks side by side"],
    },
    caveats: [
      "“Come alone” is marked two ways: when the organizer says so in writing, and when it's the guide's read of the format.",
      "Ages appear only where organizers publish them.",
      "Current events are one-off dates (October 2026). Evergreen series repeat, but schedules shift, so tap through before you go.",
    ],
    related: [
      { id: "cia-date-ideas", why: "For when one of those conversations turns into “so, are you free Thursday?”" },
      { id: "cia-new-to-austin", why: "If you're new in town, it covers the rest of settling in, from neighborhoods to your first 90 days." },
    ],
    faqs: [
      { q: "Is it only about dating?", a: "No. There's a dating section, but most of the guide is about meeting people: run clubs, dance lessons, volunteering, book clubs and newcomer groups." },
      { q: "I'm going to be on my own. Will I be okay?", a: "Every featured pick says whether you can come alone, and whether that's the organizer's own word or our read of the format." },
      { q: "What if an event has already happened?", a: "One-off events are labeled as current events with their date, and each links to the organizer so you can see the next edition." },
    ],
    accent: "plum",
    seo: {
      title: "Chloe's Guide to Being Single in Austin",
      description:
        "Where to meet people in real life in Austin: singles nights, run clubs, two-step, dinners with strangers and communities, with who each suits and whether you can go alone.",
    },
  },

  // -------------------------------------------------------------------------
  {
    id: "cia-date-ideas",
    slug: "12-best-date-ideas",
    title: "Chloe's 12 Best Date Ideas in Austin",
    shortTitle: "12 Best Date Ideas",
    subtitle: "Lake days, rooftops, games, galleries and brunch, each with a plan.",
    collection: "date-and-connect",
    price: PENDING,
    stripe: { testProductId: "prod_VSjqLgJ3VftHWg" },
    cover: { kind: "approved", image: { src: "/images/covers/12-best-date-ideas.jpg", alt: "Cover of Chloe's 12 Best Date Ideas in Austin: Chloe at a picnic on Zilker's lawn with the skyline behind" } },
    hero: { src: "/images/covers/12-best-date-ideas.jpg", alt: "Chloe at a picnic on Zilker's lawn with the Austin skyline behind", focus: "70% 45%" },
    lede: "Twelve Austin dates with a plan attached: where it is, how to book, what to know before you go and one small move that makes it yours. Plus a bonus date, a gallery of seasonal events and a planner.",
    summary:
      "Twelve dates from swan boats to rooftop sunsets, each with an ideal plan, booking details and Chloe's date move, plus seasonal events and a planner.",
    promise: "Stop defaulting to dinner-and-a-drink: pick a date that fits the mood, book it in a minute and have something to talk about.",
    bestFor: [
      "First dates and fifteenth anniversaries",
      "Couples in a “what should we do this weekend” rut",
      "Anyone planning a date for someone new to Austin",
      "Budget dates and big-occasion dates alike",
    ],
    notFor: [
      "A restaurant guide (that's the 10 Best Dinner Spots)",
      "A promise that seasonal extras happen: bat flights and sunsets are bonuses, never guaranteed",
    ],
    contents: [
      { title: "Find your perfect date", detail: "By mood: romantic, playful, cultural, outdoors, brunch, creative" },
      { title: "The twelve dates", detail: "Swan Boats & Retro Boats, a Zilker picnic, the Blanton + B Scene, Esther's Follies, The Roosevelt Room, Upstairs at Caroline, Bouldin Acres, Alamo Drafthouse + The Highball, P6 at The LINE, Aba, Taverna and Museum of Illusions" },
      { title: "Bonus date", detail: "Upstairs Circus: make something together, drink in hand" },
      { title: "What's happening in Austin", detail: "Spring, summer, fall and winter events worth planning a date around" },
      { title: "Plan your next date", detail: "A planner page and a checklist of all twelve" },
    ],
    chips: ["24 pages", "12 dates + bonus", "Seasonal events"],
    specs: {
      pages: 24,
      edition: "First edition, October 2026",
      format: "PDF with live links (US Letter)",
      interactive: ["Clickable contents and mood index", "Official booking and info links on every chapter", "A date planner and a checklist of all twelve"],
    },
    caveats: [
      "Prices, hours, bookings and event dates change; every chapter links to the official site.",
      "Seasonal events are “seasons, not promises”: dates, venues and prices change each year.",
      "Bat flights and sunset color are seasonal and never guaranteed.",
    ],
    related: [
      { id: "cia-dinner-spots", why: "When the date is dinner, these are the ten worth dressing up for." },
      { id: "cia-being-single", why: "Still looking for someone to take on these? Start here." },
    ],
    faqs: [
      { q: "Are the dates expensive?", a: "They range from free (a Zilker picnic, Free Tuesdays at the Blanton) to splurges like a sunset retro-boat rental. Each chapter lists current pricing with a link to check it." },
      { q: "Do I need to book everything?", a: "Not everything. Each chapter says whether it's walk-in only (Upstairs at Caroline), reservation-recommended or ticketed." },
      { q: "Does it work for a first date?", a: "Yes. The mood index points to the easy, low-pressure ones, and each chapter says who it's best for." },
    ],
    accent: "plum",
    seo: {
      title: "Chloe's 12 Best Date Ideas in Austin",
      description:
        "Twelve Austin date ideas with a plan for each: swan boats, a Zilker picnic, galleries, rooftops, games and brunch, plus a bonus date, seasonal events and a planner.",
    },
  },

  // -------------------------------------------------------------------------
  {
    id: "cia-natural-gems",
    slug: "5-natural-gems",
    title: "Chloe's 5 Natural Gems Around Austin",
    shortTitle: "5 Natural Gems",
    subtitle: "Swimming holes, waterfalls and Hill Country escapes worth the drive.",
    collection: "explore-and-escape",
    price: PENDING,
    stripe: { testProductId: "prod_VSjqC5iDU1X4ln" },
    cover: { kind: "typeset", tone: "sage", count: "5", countLabel: "gems", lines: ["Chloe's 5", "Natural Gems", "around Austin"] },
    lede: "One of the best things about Austin is how quickly you can trade the city for cypress trees, turquoise water and Hill Country views. This mini-guide rounds up five natural escapes that are genuinely worth the drive, and what to check before you leave.",
    summary:
      "Five natural escapes near Austin, from Jacob's Well to Westcave Preserve, with reservation rules, swim status and Chloe's tip for each.",
    promise: "Spend the day at the water, not refreshing a park website: know which spots need a reservation and what to check before you go.",
    bestFor: ["Weekend day-trippers", "Visitors who want a day out of the city", "Families, couples and nature lovers", "Anyone planning a summer swim day"],
    notFor: [
      "A guarantee you can swim: water access changes with conditions, and the guide says so",
      "A hiking or safety manual",
    ],
    contents: [
      { title: "How to use this guide", detail: "The five spots, what to check before you go and Chloe's picks" },
      { title: "Jacob's Well", detail: "Wimberley: the artesian spring and cave system" },
      { title: "Hamilton Pool Preserve", detail: "Dripping Springs: the waterfall and limestone grotto" },
      { title: "Krause Springs", detail: "Spicewood: family-owned springs and waterfalls" },
      { title: "Blue Hole Regional Park", detail: "Wimberley: a shaded, spring-fed swimming hole" },
      { title: "Westcave Preserve", detail: "Dripping Springs: the guided grotto" },
      { title: "Quick planner", detail: "Reservations, swimming and best-for, side by side, with official links" },
    ],
    chips: ["8 pages", "5 spots", "Official links"],
    specs: {
      pages: 8,
      edition: "Mini-guide",
      format: "PDF with official links (US Letter)",
      interactive: ["Official links for current conditions and reservations at each spot"],
    },
    caveats: [
      "Water access can change quickly, and some spots require reservations. Check the official site before leaving Austin.",
      "Swimming status in the guide reflects when it was written (for example, Jacob's Well swimming was paused for low water). It is never guaranteed.",
    ],
    related: [
      { id: "cia-hill-country", why: "Turn a swim stop into a whole day: Wimberley and Dripping Springs both feature, with lunch and tastings." },
      { id: "cia-new-to-austin", why: "If you've just moved, it covers what “beautiful doesn't mean always swimmable” means all year." },
    ],
    faqs: [
      { q: "Can I swim at all five?", a: "Not always. Access changes with water levels and weather, and the guide flags it: when it was written, swimming at Jacob's Well was paused. Each spot links to its official status page." },
      { q: "Do I need reservations?", a: "Some spots require them, especially on weekends and in summer. The quick planner shows which, with links." },
      { q: "How far are they from Austin?", a: "They're in Wimberley, Dripping Springs and Spicewood, all common day trips from the city." },
    ],
    accent: "sky",
    seo: {
      title: "Chloe's 5 Natural Gems Around Austin",
      description:
        "Five natural escapes near Austin: Jacob's Well, Hamilton Pool, Krause Springs, Blue Hole and Westcave, with reservation rules, swim status and official links.",
    },
  },

  // -------------------------------------------------------------------------
  {
    id: "cia-hill-country",
    slug: "hill-country-escapes",
    title: "Chloe's Perfect Hill Country Escapes",
    shortTitle: "Hill Country Escapes",
    subtitle: "Where to stay, sip, float, wander and eat, all within about an hour of the city.",
    collection: "explore-and-escape",
    price: PENDING,
    stripe: { testProductId: "prod_VSjnlLNyhC9zGx" },
    cover: {
      kind: "pdf",
      image: { src: "/images/covers/hill-country-escapes.jpg", alt: "Cover of Chloe's Perfect Hill Country Escapes: Chloe by a yurt and hot tub in the Hill Country" },
    },
    hero: { src: "/images/covers/hill-country-escapes.jpg", alt: "Chloe relaxing by a private hot tub beside a yurt", focus: "50% 30%" },
    lede: "Five very different days, all within about an hour of Austin: an overnight yurt with its own hot tub, wine country and barbecue, a river float, a slow small-town wander and a bit of everything. Each one comes with Chloe's perfect order for the day.",
    summary:
      "Five Hill Country days out, each with the perfect order for the day, what to book and where to click next: The Yurtopian, Driftwood, Gruene, Wimberley and Dripping Springs.",
    promise: "Pick the escape that fits your mood and do it in the right order, without turning a day off into a research project.",
    bestFor: ["Couples planning a getaway", "Friends and groups", "Food and wine lovers", "Anyone who needs a day out of the city"],
    notFor: ["A swimming-access guarantee: pool and spring access, river flow and tasting hours all change", "A long road-trip itinerary: these are day trips and one easy overnight"],
    contents: [
      { title: "Choose your escape", detail: "The five at a glance: best for, how long, and which page" },
      { title: "The Yurtopian", detail: "The spectacular overnight: private hot tub, stars, slow mornings" },
      { title: "Driftwood", detail: "Wine country + Texas barbecue" },
      { title: "Gruene", detail: "River float + a historic Texas town and its dance hall" },
      { title: "Wimberley", detail: "The slow small-town day" },
      { title: "Dripping Springs", detail: "Nature + downtown charm + tastings" },
      { title: "Quick planner", detail: "Choose by mood and compare all five at a glance" },
    ],
    chips: ["8 pages", "5 escapes", "Plan + book links"],
    specs: {
      pages: 8,
      edition: "2026 edition",
      checked: "Details checked October 2026",
      format: "PDF with live links (US Letter)",
      interactive: ["Plan + book links on every escape: availability, reservations, status pages and maps"],
    },
    caveats: [
      "Hamilton Pool and Jacob's Well swimming, river flow, reservations and tasting-room hours all change. The links go straight to the official source.",
      "Pick a designated driver for tastings.",
    ],
    previews: [
      {
        image: { src: "/images/previews/hill-country-p02.jpg", alt: "Page 2 of Hill Country Escapes: Choose your escape, the five days at a glance" },
        caption: "Page 2: choose your escape.",
        ratio: 1100 / 1424,
      },
      {
        image: { src: "/images/previews/hill-country-p03.jpg", alt: "Page 3 of Hill Country Escapes: The Yurtopian, with Chloe's perfect order and booking links" },
        caption: "Page 3: The Yurtopian, with the perfect order for the stay.",
        ratio: 1100 / 1424,
      },
    ],
    related: [
      { id: "cia-natural-gems", why: "The swimming holes and waterfalls: Jacob's Well, Hamilton Pool and three more, with reservation rules." },
      { id: "cia-dinner-spots", why: "Back in the city for a big dinner? Ten worth planning a night around." },
    ],
    faqs: [
      { q: "Do I need a car?", a: "Realistically, yes. All five are about 40 minutes to an hour from Austin." },
      { q: "Is it all wineries?", a: "No. There's a wine-and-barbecue day, but also a river float, an antiques-and-boutiques wander, a natural landmark and an overnight stay." },
      { q: "When was it checked?", a: "Details were checked in October 2026. Hours, access and river conditions change, so each page links to the live source." },
    ],
    accent: "gold",
    seo: {
      title: "Chloe's Perfect Hill Country Escapes",
      description:
        "Five Hill Country day trips within about an hour of Austin: The Yurtopian, Driftwood, Gruene, Wimberley and Dripping Springs, each with the perfect order for the day.",
    },
  },

  // -------------------------------------------------------------------------
  {
    id: "cia-exclusive",
    slug: "10-most-exclusive-experiences",
    title: "Chloe's 10 Most Exclusive Experiences in Austin",
    shortTitle: "10 Most Exclusive Experiences",
    subtitle: "Private clubs, hidden doors and hard-to-get reservations, and how access actually works.",
    collection: "explore-and-escape",
    price: PENDING,
    stripe: { testProductId: "prod_VSjq33WGpB5oG1" },
    cover: {
      kind: "typeset",
      tone: "night",
      count: "10",
      countLabel: "experiences",
      lines: ["Chloe's 10 Most", "Exclusive", "Experiences"],
      photo: { src: "/images/chloe/chloe-private-doorway.jpg", alt: "Chloe stepping through a dark doorway into a candlelit room at night", focus: "47% 0%" },
    },
    hero: { src: "/images/chloe/chloe-private-doorway.jpg", alt: "Chloe stepping through a dark doorway into a candlelit room at night", focus: "35% 30%" },
    lede: "Austin has places you can walk into, and places you need to know how to approach: private members' clubs, counters with six or eight seats, bars with no sign on the door. This guide explains how access to each one actually works, and the exact next step to take.",
    summary:
      "Ten private clubs, tiny omakase counters and hidden bars, with how access works for each (apply, release day or venue process) and the official link to take the next step.",
    promise: "Stop guessing which form, app or release day matters, so your effort goes to the right place.",
    bestFor: ["Food and cocktail people who like a challenge", "Anyone considering a members' club", "Celebrations that deserve a hard-to-get seat", "The curious"],
    notFor: [
      "Membership, reservations, guaranteed admission or special privileges. Buying the guide gets you research and a plan, not a way past anyone's door",
      "Secret entry codes: the guide sends you to each venue's current process, never an old code",
    ],
    contents: [
      { title: "Your access cheat sheet", detail: "Membership / apply, reservation / release, or hidden bar / venue process" },
      { title: "Private members' clubs", detail: "Soho House Austin, Pershing House, Driftwood Downtown, Gevity and Frank's Social Club" },
      { title: "Tiny counters", detail: "Tsuke Edomae (eight seats), Toshokan (six) and Ling Kitchen's chef's table" },
      { title: "Hidden bars", detail: "Here Nor There and Red Headed Stepchild" },
      { title: "Bonus pick", detail: "Midnight Cowboy, with a little history" },
      { title: "The playbooks", detail: "The private-club playbook and the hard-to-get reservation playbook, with a release-day routine" },
      { title: "My Austin access plan", detail: "A fillable planner and a tick-box checklist" },
    ],
    chips: ["19 pages", "10 + bonus", "Fillable planner"],
    specs: {
      pages: 19,
      edition: "2026",
      format: "Interactive PDF (US Letter)",
      interactive: ["Official application, booking and reservation links for every place", "A fillable access planner and a tick-box checklist", "Clickable contents"],
    },
    caveats: [
      "Nothing in the guide gets you in automatically. Clubs decide applications; restaurants release their own seats.",
      "Policies, prices and release dates change. The linked official page always has the final word.",
      "The order reflects how much approval and planning each place asks of you: an editorial call, not measured admission odds.",
    ],
    related: [
      { id: "cia-dinner-spots", why: "Ten big dinners that are hard to book, but open to everyone." },
      { id: "cia-date-ideas", why: "For the nights that don't need an application: twelve dates with a plan." },
    ],
    faqs: [
      { q: "Does buying this get me into any of these places?", a: "No, and it can't. It explains how access works at each place (an application, a release day or a venue's own process) and links to the official next step. The clubs and restaurants make their own decisions." },
      { q: "Are there entry codes in it?", a: "No. Codes change; the guide tells you how to get the current one from the venue." },
      { q: "Can I keep track of what I've applied for?", a: "Yes. There's a fillable access planner (priority, links, status, next release date) and a tick-box checklist of all ten plus the bonus." },
    ],
    accent: "terracotta",
    seo: {
      title: "Chloe's 10 Most Exclusive Experiences in Austin",
      description:
        "How access actually works at Austin's private clubs, tiny omakase counters and hidden bars, with the official next step for each. Research and guidance, not membership.",
    },
  },
];

export const GUIDE_CAVEAT = CHECK_LIVE;
