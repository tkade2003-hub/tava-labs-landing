// Locale configuration for the tavalabs.app translations.
//
// English is the source and stays at the root. Every other locale is
// served from a locale prefixed tree (/fr/..., /de/...) that renders the
// same pages with a translated dictionary. The language map follows the
// delivery countries: French covers France, Belgium, and Luxembourg;
// Dutch covers the Netherlands and Belgium; Greek covers Greece and
// Cyprus; German covers Luxembourg; the United States, the United
// Kingdom, and Ireland stay English.

export const LOCALES = [
  { code: "en", native: "English", english: "English" },
  { code: "fr", native: "Français", english: "French" },
  { code: "de", native: "Deutsch", english: "German" },
  { code: "nl", native: "Nederlands", english: "Dutch" },
  { code: "it", native: "Italiano", english: "Italian" },
  { code: "pt", native: "Português", english: "Portuguese" },
  { code: "sv", native: "Svenska", english: "Swedish" },
  { code: "da", native: "Dansk", english: "Danish" },
  { code: "fi", native: "Suomi", english: "Finnish" },
  { code: "pl", native: "Polski", english: "Polish" },
  { code: "cs", native: "Čeština", english: "Czech" },
  { code: "sk", native: "Slovenčina", english: "Slovak" },
  { code: "sl", native: "Slovenščina", english: "Slovenian" },
  { code: "hr", native: "Hrvatski", english: "Croatian" },
  { code: "hu", native: "Magyar", english: "Hungarian" },
  { code: "ro", native: "Română", english: "Romanian" },
  { code: "bg", native: "Български", english: "Bulgarian" },
  { code: "el", native: "Ελληνικά", english: "Greek" },
  { code: "et", native: "Eesti", english: "Estonian" },
  { code: "lv", native: "Latviešu", english: "Latvian" },
  { code: "lt", native: "Lietuvių", english: "Lithuanian" },
  { code: "mt", native: "Malti", english: "Maltese" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const NON_EN_LOCALES = LOCALES.filter((l) => l.code !== "en").map(
  (l) => l.code,
) as Exclude<Locale, "en">[];

export function isLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

export function localePrefix(locale: Locale): string {
  return locale === "en" ? "" : `/${locale}`;
}

/** Prefix an internal absolute path for a locale. External URLs, mailto,
 * tel, hash only links, and asset paths are returned unchanged. */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === "en") return href;
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  let path = href;
  // Normalize legacy oddities such as "/../quiz".
  while (path.startsWith("/../")) path = path.slice(3);
  if (path === "/..") path = "/";
  const [pathname, ...rest] = path.split(/(?=[?#])/);
  if (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/page-scripts") ||
    pathname === "/favicon.ico"
  ) {
    return href;
  }
  if (pathname === "/") return `/${locale}${rest.join("")}`;
  return `/${locale}${pathname}${rest.join("")}`;
}

/** Fill {name} placeholders in a template string. */
export function fmt(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

const SITE_URL = "https://tavalabs.app";

/** hreflang language map for a root relative path, covering every locale
 * plus x-default pointing at the English original. */
export function languageAlternates(path: string): Record<string, string> {
  const clean = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l.code] = SITE_URL + localePrefix(l.code) + clean;
  }
  languages["x-default"] = SITE_URL + clean;
  return languages;
}

export function localizedCanonical(path: string, locale: Locale): string {
  const clean = path === "/" ? "" : path;
  return SITE_URL + localePrefix(locale) + clean;
}
