// Dictionary loading for the localized site.
//
// en.json is the schema source: every other locale file must carry the
// exact same key structure (checked by tools/i18n/check_dicts.py). This
// module is imported by server components and by the locale route
// wrappers; client components receive their dictionary slices as props
// so no client bundle carries all 22 dictionaries.

import type { Locale } from "./config";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import nl from "./locales/nl.json";
import it from "./locales/it.json";
import pt from "./locales/pt.json";
import sv from "./locales/sv.json";
import da from "./locales/da.json";
import fi from "./locales/fi.json";
import pl from "./locales/pl.json";
import cs from "./locales/cs.json";
import sk from "./locales/sk.json";
import sl from "./locales/sl.json";
import hr from "./locales/hr.json";
import hu from "./locales/hu.json";
import ro from "./locales/ro.json";
import bg from "./locales/bg.json";
import el from "./locales/el.json";
import et from "./locales/et.json";
import lv from "./locales/lv.json";
import lt from "./locales/lt.json";
import mt from "./locales/mt.json";

export type Dict = typeof en;

const DICTS: Record<Locale, Dict> = {
  en: en as Dict,
  fr: fr as Dict,
  de: de as Dict,
  nl: nl as Dict,
  it: it as Dict,
  pt: pt as Dict,
  sv: sv as Dict,
  da: da as Dict,
  fi: fi as Dict,
  pl: pl as Dict,
  cs: cs as Dict,
  sk: sk as Dict,
  sl: sl as Dict,
  hr: hr as Dict,
  hu: hu as Dict,
  ro: ro as Dict,
  bg: bg as Dict,
  el: el as Dict,
  et: et as Dict,
  lv: lv as Dict,
  lt: lt as Dict,
  mt: mt as Dict,
};

export function getDictionary(locale: Locale): Dict {
  return DICTS[locale] ?? (en as Dict);
}

export const EN_DICT = en as Dict;
