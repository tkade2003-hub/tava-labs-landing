import Link from "next/link";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "./SocialIcons";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";

const CONTACT_LINKS = [
  { href: "/contact#general", label: "General" },
  { href: "/contact#wholesale", label: "Wholesale" },
  { href: "/contact#sales-support", label: "Sales Support" },
  { href: "/contact#product-support", label: "Product Support" },
  { href: "/contact#pr", label: "PR" },
];

const INFO_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/partners", label: "Partners" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/faq", label: "FAQs" },
  { href: "/blog", label: "Blog" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/returns", label: "Returns Policy" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/shipping", label: "Shipping Policy" },
];

const SOCIALS = [
  { href: "https://www.instagram.com/tava_labs", label: "Instagram", Icon: InstagramIcon },
  { href: "https://www.facebook.com/61583775537815", label: "Facebook", Icon: FacebookIcon },
  { href: "https://www.youtube.com/@tavalabsapp", label: "YouTube", Icon: YoutubeIcon },
];

export default function Footer() {
  return (
    <footer className="bg-forest-deep text-[#fafaf9]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo className="h-8 w-auto" />
            <p className="mt-5 max-w-xs gold-word text-2xl">
              The Science of Attractive Health
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-[#fafaf9]/85 transition-colors hover:border-gold hover:text-gold-metal"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Shop">
            <h3 className="text-sm font-semibold tracking-wide text-gold-metal">
              Shop
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/glow-brightening-serum" className="text-[#fafaf9]/85 hover:text-white">
                  PDRN Brightening Serum
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-[#fafaf9]/85 hover:text-white">
                  Take the Quiz
                </Link>
              </li>
              <li>
                <Link href="/ingredients" className="text-[#fafaf9]/85 hover:text-white">
                  Ingredients
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Contact us">
            <h3 className="text-sm font-semibold tracking-wide text-gold-metal">
              Contact us
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {CONTACT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[#fafaf9]/85 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Info">
            <h3 className="text-sm font-semibold tracking-wide text-gold-metal">
              Info
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {INFO_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-[#fafaf9]/85 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10">
          <h3 className="font-display text-2xl font-semibold">
            Keep up to date with all things Tava
          </h3>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 space-y-3 border-t border-white/10 pt-8 text-xs leading-relaxed text-[#fafaf9]/60">
          <p>
            PDRN Brightening Serum is a cosmetic product. It is not intended to
            diagnose, treat, cure, or prevent any disease. Individual results
            may vary.
          </p>
          <p>
            All sales are final. Please see our Returns policy before
            ordering.
          </p>
          <p>&copy; 2026 Tava Labs &middot; The Science of Attractive Health</p>
        </div>
      </div>
    </footer>
  );
}
