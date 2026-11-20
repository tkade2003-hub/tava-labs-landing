export interface PageScript {
  src: string;
  type?: string;
}

export interface PageData {
  route: string;
  slug: string;
  family: string;
  title: string;
  description: string;
  canonical: string | null;
  cssLinks: string[];
  preconnects: string[];
  metaRaw: string[];
  styles: string[];
  ldjson: string[];
  scripts: PageScript[];
  bodyClass: string;
  htmlAttrs: Record<string, string>;
  contentHtml: string;
  headerHtml?: string;
  footerHtml?: string;
}
