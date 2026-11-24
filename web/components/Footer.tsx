import Link from "next/link";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "./SocialIcons";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";

const SOCIALS = [
  { href: "https://www.instagram.com/tava_labs", label: "Instagram", Icon: InstagramIcon },
  { href: "https://www.facebook.com/61583775537815", label: "Facebook", Icon: FacebookIcon },
  { href: "https://www.youtube.com/@tavalabsapp", label: "YouTube", Icon: YoutubeIcon },
];

export default function Footer({
  locale = "en",
  dict,
}: {
  locale?: Locale;
  dict: Dict;
}) {
  const c = dict.chrome;
  const lh = (href: string) => localizeHref(href, locale);
  const CONTACT_LINKS = [
    { href: "/contact#general", label: c.contactLinks.general },
    { href: "/contact#wholesale", label: c.contactLinks.wholesale },
    { href: "/contact#sales-support", label: c.contactLinks.salesSupport },
    { href: "/contact#product-support", label: c.contactLinks.productSupport },
    { href: "/contact#pr", label: c.contactLinks.pr },
  ];
  const INFO_LINKS = [
    { href: "/about", label: c.infoLinks.about },
    { href: "/partners", label: c.infoLinks.partners },
    { href: "/ingredients", label: c.infoLinks.ingredients },
    { href: "/faq", label: c.infoLinks.faqs },
    { href: "/blog", label: c.infoLinks.blog },
    { href: "/research", label: c.infoLinks.research },
  ];
  const LEGAL_LINKS = [
    { href: "/terms", label: c.legalLinks.terms },
    { href: "/privacy", label: c.legalLinks.privacy },
    { href: "/returns", label: c.legalLinks.returns },
    { href: "/cookies", label: c.legalLinks.cookies },
    { href: "/shipping", label: c.legalLinks.shipping },
  ];
  return (
    <footer className="bg-forest text-[#fafaf9]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo className="h-8 w-auto" />
            <p className="mt-5 max-w-xs gold-word text-xl">
              {c.tagline}
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

          <nav aria-label={c.shopHeading}>
            <h3 className="text-sm font-semibold tracking-wide gold-metal-text">
              {c.shopHeading}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href={lh("/glow-brightening-serum")} className="text-[#fafaf9]/85 hover:text-white">
                  {c.footerSerum}
                </Link>
              </li>
              <li>
                <Link href={lh("/glow-brightening-serum")} className="text-[#fafaf9]/85 hover:text-white">
                  {c.addToRoutine}
                </Link>
              </li>
              <li>
                <Link href={lh("/ingredients")} className="text-[#fafaf9]/85 hover:text-white">
                  {c.footerIngredients}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={c.contactHeading}>
            <h3 className="text-sm font-semibold tracking-wide gold-metal-text">
              {c.contactHeading}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {CONTACT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={lh(item.href)} className="text-[#fafaf9]/85 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={c.infoHeading}>
            <h3 className="text-sm font-semibold tracking-wide gold-metal-text">
              {c.infoHeading}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {INFO_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={lh(item.href)} className="text-[#fafaf9]/85 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={c.legalHeading}>
            <h3 className="text-sm font-semibold tracking-wide gold-metal-text">
              {c.legalHeading}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={lh(item.href)} className="text-[#fafaf9]/85 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10">
          <h3 className="font-display text-2xl font-semibold">
            {c.newsletterHeading}
          </h3>
          <div className="mt-4">
            <NewsletterForm dict={dict} />
          </div>
        </div>

        <div className="mt-12 space-y-3 border-t border-white/10 pt-8 text-xs leading-relaxed text-[#fafaf9]/60">
          <p>{c.disclaimer1}</p>
          <p>{c.disclaimer2}</p>
          <p>{c.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
