import type { Faq } from "@/catalogue";

/**
 * Store-wide FAQs. Each answer describes what the code actually does (see
 * docs/QA.md) or says plainly that a policy isn't published yet.
 */
export const storeFaqs: Faq[] = [
  {
    q: "What exactly do I get?",
    a: "A digital guide (PDF). Straight after checkout, a private library page opens with your download, and we email you the link so you can come back to it on any device.",
  },
  {
    q: "Are the guides interactive?",
    a: "Every guide has clickable links to official sites, bookings and maps. Some have pages you can type into: New to Austin has 284 fillable fields, 10 Best Dinner Spots has 71, and 10 Most Exclusive Experiences has a fillable access planner. Each guide's page lists exactly what's inside.",
  },
  {
    q: "What device do I need?",
    a: "Anything that opens a PDF: phone, tablet or computer. For the fill-in pages, the guides recommend the free Adobe Acrobat Reader app, so your answers save with the file.",
  },
  {
    q: "How current is the information?",
    a: "Each guide shows its edition and when its details were checked (October 2026 for this collection). Austin changes fast, so anything time-sensitive (prices, hours, reservation windows, swim access) links straight to the official source to confirm.",
  },
  {
    q: "Will I get updated editions?",
    a: "Our policy on future editions hasn't been published yet. It will be on the site before the shop opens.",
  },
  {
    q: "I lost my email. How do I get my guides back?",
    a: "Use “Resend my downloads” on the Help page with the email you used at checkout, and we'll send fresh links to your library.",
  },
  {
    q: "Can I get a refund?",
    a: "The refund policy will be published before the shop opens, on the Refunds page and at checkout.",
  },
  {
    q: "Does buying a guide get me reservations or access anywhere?",
    a: "No. The guides are research and planning help. Restaurants, clubs and venues make their own decisions; the guides show you exactly how each one books or admits people.",
  },
];
