import type { CategoryConfig } from "@/components/CategorySection";
import { SERUM_CARD, ADHD_CARD, LABS_CARD } from "@/lib/heroMedia";

/*
 * Category configs for the reusable CategorySection component.
 * One config per category: skincare, peptides, mental health, biomarkers.
 * Add a category by adding a config here; the /category/[slug] route
 * picks it up automatically. Prices and product facts come from the
 * live store records, never from memory.
 */

export const SKINCARE: CategoryConfig = {
  slug: "skincare",
  seoTitle: "Skincare | PDRN Brightening Serum and More | Tava Labs",
  seoDescription:
    "Tava Labs skincare: the PDRN Brightening Serum plus the moisturizer, eye cream and firming cream on the way. Skincare for the ambitious.",
  eyebrow: "SKINCARE",
  heroTitleLead: "Your next meeting",
  heroTitleAccent: "starts with you.",
  heroCopy:
    "One daily serum, built around PDRN, for skin that has to look sharp and rested on camera and in the room.",
  heroImage: "/assets/IMG_3365.jpeg",
  heroFinePrint:
    "Cosmetic skincare. Not intended to diagnose, treat, cure or prevent any disease.",
  stamp: "SKINCARE FOR THE AMBITIOUS",
  primaryCta: { label: "Add to routine", href: "/glow-brightening-serum" },
  secondaryCta: { label: "See the ingredients", href: "/ingredients" },
  optionsEyebrow: "THE LINEUP",
  optionsTitleLead: "One serum.",
  optionsTitleAccent: "No shelf of guesswork.",
  optionsCopy: "Start with the serum. The rest of the line is on its way.",
  products: [
    {
      title: "PDRN Brightening Serum",
      subtitle: "PDRN, peptides and sodium hyaluronate",
      price: "$49",
      unit: "one time",
      image: SERUM_CARD,
      imageAlt: "Tava Labs PDRN Brightening Serum bottle",
      badges: ["Bestseller"],
      highlightBadge: "Bestseller",
      description:
        "The daily serum for radiant, hydrated, healthy looking skin. $39 per month on Subscribe and Save.",
      href: "/glow-brightening-serum",
      linkLabel: "See the serum",
    },
    {
      title: "Peptide Moisturizer",
      subtitle: "1.7 fl oz (50ml)",
      image: "/assets/products/IMG_3380.jpeg",
      imageAlt: "Tava Labs Peptide Moisturizer white tube with a pink splash",
      badges: ["Coming soon"],
      highlightBadge: "Coming soon",
      description:
        "A peptide moisturizer that targets wrinkles and hydrates, made for skin that has to look composed all day.",
    },
    {
      title: "Peptide Eye Cream",
      subtitle: "1 fl oz (30ml)",
      image: "/assets/products/IMG_3381.jpeg",
      imageAlt: "Tava Labs Peptide Eye Cream white tube with a champagne drop",
      badges: ["Coming soon"],
      highlightBadge: "Coming soon",
      description:
        "Reduces the appearance of eye puffiness and targets wrinkles in the eye area, for a rested look on camera.",
    },
    {
      title: "Skin Firming Cream",
      subtitle: "2 oz (56g)",
      image: "/assets/products/IMG_3382.jpeg",
      imageAlt: "Tava Labs Skin Firming Cream white jar with a gold wave backdrop",
      badges: ["Coming soon"],
      highlightBadge: "Coming soon",
      description:
        "Hyaluronic acid and CoQ10 in a rich cream that leaves skin looking firm and cared for.",
    },
  ],
  disclaimerLead:
    "Tava Labs skincare products are cosmetics. They are not intended to diagnose, treat, cure or prevent any disease.",
  disclaimerMore: [
    "Individual results vary. Use only as directed: 2 to 4 drops of the PDRN Brightening Serum, twice daily, on clean skin.",
    "If irritation occurs, stop use and consult a professional. Prices on this page were accurate when published and may change.",
  ],
  protocolEyebrow: "THE ROUTINE",
  protocolTitleLead: "Two minutes, twice a day.",
  protocolTitleAccent: "That is the whole routine.",
  protocolCopy: "A routine built around one serum and your actual schedule.",
  protocolCta: { label: "Add to routine", href: "/glow-brightening-serum" },
  steps: [
    {
      number: "01",
      title: "Assess",
      lead: "with the skin quiz",
      body: "Answer a few quick questions about your skin, sleep and schedule so your plan starts from where you actually are.",
    },
    {
      number: "02",
      title: "Apply",
      lead: "2 to 4 drops, twice daily",
      body: "Morning and night, on clean skin. One serum, one step, no ten step routine to maintain.",
    },
    {
      number: "03",
      title: "Track",
      lead: "your plan in the app",
      body: "Your purchase connects to the Tava app with a claim code, where your plan, orders and routine stay in one place.",
    },
  ],
  legalLines: ["Cosmetic products only. Nothing on this page is medical advice."],
};

export const MENTAL_HEALTH: CategoryConfig = {
  slug: "mental-health",
  seoTitle: "Mental Health and Focus Support | Tava Labs",
  seoDescription:
    "Focus and attention support on Tava that starts with a clinician review. In development now.",
  eyebrow: "MENTAL HEALTH",
  heroTitleLead: "Focus better,",
  heroTitleAccent: "on Tava.",
  heroCopy:
    "Support for focus and attention that starts with a clinician review, not a checkout button.",
  heroImage: ADHD_CARD,
  heroFinePrint:
    "After clinician review. This program is in development and is not yet open for enrollment.",
  stamp: "CLINICIAN REVIEWED CARE",
  primaryCta: { label: "See how it works", href: "#protocol" },
  optionsEyebrow: "THE PROGRAM",
  optionsTitleLead: "Care that starts",
  optionsTitleAccent: "with a review.",
  optionsCopy: "",
  products: [],
  disclaimerLead:
    "Mental health support on Tava begins with a clinician review. Nothing here is a diagnosis or a treatment recommendation.",
  disclaimerMore: [
    "If you are in crisis or thinking about harming yourself, call or text 988 in the United States. In an emergency, call 911.",
  ],
  protocolEyebrow: "HOW IT WORKS",
  protocolTitleLead: "Review first.",
  protocolTitleAccent: "Then a plan.",
  protocolCopy: "A careful path, in the open, at your pace.",
  steps: [
    {
      number: "01",
      title: "Review",
      lead: "with a clinician",
      body: "Share your history and what you are dealing with, and a clinician reviews whether support here is a fit.",
    },
    {
      number: "02",
      title: "Plan",
      lead: "built around you",
      body: "If it is a fit, your plan is built around your goals and your schedule.",
    },
    {
      number: "03",
      title: "Support",
      lead: "as you go",
      body: "Check ins keep the plan honest as things change.",
    },
  ],
  legalLines: [
    "Mental health offerings on Tava are in development and are not yet open for enrollment.",
  ],
};

export const BIOMARKERS: CategoryConfig = {
  slug: "biomarkers",
  seoTitle: "Lab Biomarkers | Know Your Data | Tava Labs",
  seoDescription:
    "Biomarker tracking in the Tava app: brain, hormones, heart, metabolism, gut and longevity in one clear picture. Coming soon.",
  eyebrow: "LAB BIOMARKERS",
  heroTitleLead: "Know your data,",
  heroTitleAccent: "on Tava.",
  heroCopy:
    "A clearer picture of your health is coming soon: your key biomarkers, tracked over time, in the Tava app.",
  heroImage: LABS_CARD,
  heroFinePrint:
    "Coming soon in the Tava app. Insights are for information only and do not diagnose any condition.",
  stamp: "YOUR DATA IN ONE PLACE",
  primaryCta: { label: "See what is tracked", href: "#programs" },
  secondaryCta: { label: "How it will work", href: "#protocol" },
  optionsEyebrow: "WHAT GETS TRACKED",
  optionsTitleLead: "Six areas.",
  optionsTitleAccent: "One clear picture.",
  optionsCopy: "The biomarker areas in the Tava app Preview, being built now.",
  products: [
    {
      title: "Brain",
      subtitle: "Focus and clarity",
      badges: ["Coming soon"],
      highlightBadge: "Coming soon",
      description:
        "The markers behind focus, clarity and cognitive pace, gathered in one view.",
    },
    {
      title: "Hormones",
      subtitle: "Balance",
      badges: ["Coming soon"],
      highlightBadge: "Coming soon",
      description:
        "Your hormone picture over time, so changes are visible instead of guessed.",
    },
    {
      title: "Heart",
      subtitle: "Cardiovascular markers",
      badges: ["Coming soon"],
      highlightBadge: "Coming soon",
      description:
        "The heart markers that matter, tracked as a trend rather than a one off reading.",
    },
    {
      title: "Metabolism",
      subtitle: "Energy and burn",
      badges: ["Coming soon"],
      highlightBadge: "Coming soon",
      description:
        "How your body uses energy, in numbers you can actually follow.",
    },
    {
      title: "Gut",
      subtitle: "Digestive health",
      badges: ["Coming soon"],
      highlightBadge: "Coming soon",
      description:
        "Gut health signals that connect to energy, mood and recovery.",
    },
    {
      title: "Longevity",
      subtitle: "Biological age",
      badges: ["Coming soon"],
      highlightBadge: "Coming soon",
      description:
        "The long view: how your markers add up to a biological age picture.",
    },
  ],
  disclaimerLead:
    "Biomarker insights in the Tava app are for information only. They do not diagnose, treat or prevent any condition.",
  disclaimerMore: [
    "Talk to your own provider about any result that concerns you. In an emergency, call 911.",
  ],
  protocolEyebrow: "HOW IT WILL WORK",
  protocolTitleLead: "Test, review,",
  protocolTitleAccent: "track the trend.",
  protocolCopy: "Built to sit beside your serum plan in the same app.",
  steps: [
    {
      number: "01",
      title: "Test",
      lead: "through a lab partner",
      body: "Your sample is collected and processed, and the results land in your Tava app.",
    },
    {
      number: "02",
      title: "Review",
      lead: "area by area",
      body: "Brain, hormones, heart, metabolism, gut and longevity, each with its own view.",
    },
    {
      number: "03",
      title: "Track",
      lead: "the trend over time",
      body: "One reading is a snapshot. The value is the trend, and the app keeps it for you.",
    },
  ],
  legalLines: ["Lab biomarker tracking is coming soon and is not yet open for orders."],
};

export const PEPTIDES: CategoryConfig = {
  slug: "peptides",
  seoTitle: "Peptide Programs | Tava Labs on MyDose",
  seoDescription: "Thirteen peptide programs through Tava on MyDose, each starting with a consultation and provider review. Prices from $178.80 per month.",
  eyebrow: "PEPTIDE PROGRAMS",
  heroTitleLead: "Peptides,",
  heroTitleAccent: "with a provider in your corner.",
  heroCopy: "Thirteen peptide programs through Tava on MyDose, each starting with an online consultation and provider review.",
  heroImage: "https://tava.mydose.store/_next/static/media/art-2.3xvvp8ha5z5hj.webp",
  heroFinePrint: "Prescription required. A licensed provider decides eligibility after consultation.",
  stamp: "PROVIDER GUIDED PROGRAMS",
  primaryCta: { label: "Start a consultation", href: "https://tava.mydose.store" },
  secondaryCta: { label: "How it works", href: "#protocol" },
  optionsEyebrow: "THE PROGRAMS",
  optionsTitleLead: "Thirteen programs.",
  optionsTitleAccent: "One consultation starts any of them.",
  optionsCopy: "Every program includes a $20 consultation. Most include lab tests. Prices are the monthly program prices on the Tava store.",
  products: [
    {
      title: "BPC-157",
      subtitle: "Recovery",
      price: "$226.88",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "BPC-157 program vial art",
      badges: ["Recovery", "Gut Health", "Lab tests included"],
      description: "BPC-157 through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/bpc-157",
      linkLabel: "View program",
    },
    {
      title: "CJC-1295 + Ipamorelin",
      subtitle: "Gut Health",
      price: "$298.97",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "CJC-1295 + Ipamorelin program vial art",
      badges: ["Gut Health", "Sleep", "Recovery", "Longevity", "Lab tests included"],
      description: "CJC-1295 + Ipamorelin through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/cjc-1295-ipamorelin",
      linkLabel: "View program",
    },
    {
      title: "GHK-Cu",
      subtitle: "Longevity",
      price: "$226.88",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "GHK-Cu program vial art",
      badges: ["Longevity", "Lab tests included"],
      description: "GHK-Cu through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/ghk-cu",
      linkLabel: "View program",
    },
    {
      title: "GLOW Injection",
      subtitle: "Recovery",
      price: "$226.88",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "GLOW Injection program vial art",
      badges: ["Recovery", "Lab tests included"],
      description: "GLOW Injection through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/glow-injection",
      linkLabel: "View program",
    },
    {
      title: "MOTS-C",
      subtitle: "Weight Loss",
      price: "$340.16",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "MOTS-C program vial art",
      badges: ["Weight Loss", "Energy", "Performance", "Lab tests included"],
      description: "MOTS-C through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/mots-c",
      linkLabel: "View program",
    },
    {
      title: "NAD+ Injectable",
      subtitle: "Longevity",
      price: "$214.27",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "NAD+ Injectable program vial art",
      badges: ["Longevity", "Energy", "Recovery", "Focus"],
      description: "NAD+ Injectable through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/nad-injectable",
      linkLabel: "View program",
    },
    {
      title: "PT-141",
      subtitle: "Sexual Health",
      price: "$237.18",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "PT-141 program vial art",
      badges: ["Sexual Health", "Lab tests included"],
      description: "PT-141 through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/pt-141",
      linkLabel: "View program",
    },
    {
      title: "Semaglutide + B12 (Cyanocobalamin)",
      subtitle: "Weight Loss",
      price: "$178.80",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "Semaglutide + B12 (Cyanocobalamin) program vial art",
      badges: ["Weight Loss", "Lab tests included"],
      description: "Semaglutide + B12 (Cyanocobalamin) through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/semaglutide-b12-cyanocobalamin",
      linkLabel: "View program",
    },
    {
      title: "Sermorelin",
      subtitle: "Longevity",
      price: "$232.03",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "Sermorelin program vial art",
      badges: ["Longevity", "Recovery", "Performance", "Lab tests included"],
      description: "Sermorelin through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/sermorelin",
      linkLabel: "View program",
    },
    {
      title: "TB-500",
      subtitle: "Performance",
      price: "$221.73",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "TB-500 program vial art",
      badges: ["Performance", "Recovery", "Lab tests included"],
      description: "TB-500 through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/tb-500",
      linkLabel: "View program",
    },
    {
      title: "Tesamorelin",
      subtitle: "Longevity",
      price: "$247.48",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "Tesamorelin program vial art",
      badges: ["Longevity", "Recovery", "Performance", "Lab tests included"],
      description: "Tesamorelin through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/tesamorelin",
      linkLabel: "View program",
    },
    {
      title: "Tirzepatide + B12 (Cyanocobalamin)",
      subtitle: "Weight Loss",
      price: "$192.78",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "Tirzepatide + B12 (Cyanocobalamin) program vial art",
      badges: ["Weight Loss", "Lab tests included"],
      description: "Tirzepatide + B12 (Cyanocobalamin) through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/tirzepatide-b12-cyanocobalamin",
      linkLabel: "View program",
    },
    {
      title: "Wolverine Injection",
      subtitle: "Recovery",
      price: "$221.73",
      unit: "/mo",
      image: "https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp",
      imageAlt: "Wolverine Injection program vial art",
      badges: ["Recovery", "Lab tests included"],
      description: "Wolverine Injection through the Tava store on MyDose. Provider review and follow up are part of the program.",
      href: "https://tava.mydose.store/products/wolverine-injection",
      linkLabel: "View program",
    },
  ],
  disclaimerLead: "Compounded medications are prepared by licensed pharmacies for individual patients. They are not FDA-approved, and the FDA does not review compounded drugs for safety, effectiveness or quality.",
  disclaimerMore: [
    "Medical care is provided by independent, licensed providers in the MyDose network. Providers decide independently whether a treatment is right for you; purchase does not guarantee a prescription.",
    "A licensed provider reviews your information and decides independently whether a treatment is right for you. Purchase does not guarantee a prescription.",
    "For emergencies call 911.",
  ],
  protocolEyebrow: "HOW IT WORKS",
  protocolTitleLead: "Consult, review,",
  protocolTitleAccent: "then begin.",
  protocolCopy: "Every program runs through licensed providers in the MyDose network.",
  protocolCta: { label: "Start a consultation", href: "https://tava.mydose.store" },
  steps: [
    { number: "01", title: "Consult", lead: "online, on your schedule", body: "Complete the online consultation for the program you chose. The consultation is $20." },
    { number: "02", title: "Review", lead: "by a licensed provider", body: "A provider reviews your information and your labs, and decides independently whether the treatment is right for you." },
    { number: "03", title: "Begin", lead: "if prescribed", body: "Your medication ships from a licensed pharmacy, and your provider follows up as your program continues." },
  ],
  legalLines: [
    "The Tava store on MyDose is currently in test mode, so programs are shown for review and are not yet open for real orders.",
    "For emergencies call 911.",
  ],
};

export const CATEGORIES: Record<string, CategoryConfig> = {
  [SKINCARE.slug]: SKINCARE,
  [PEPTIDES.slug]: PEPTIDES,
  [MENTAL_HEALTH.slug]: MENTAL_HEALTH,
  [BIOMARKERS.slug]: BIOMARKERS,
};

export function getCategory(slug: string): CategoryConfig | undefined {
  return CATEGORIES[slug];
}
