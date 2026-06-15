import type { Locale } from './types';

export const LOCALES = ['pt', 'en', 'es', 'de'] as const;
export const LOCALE_LABELS: Record<Locale, string> = { pt: 'PT', en: 'EN', es: 'ES', de: 'DE' };
export const LOCALE_HTMLLANG: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en',
  es: 'es',
  de: 'de',
};

export const ROUTES = {
  home:        { pt: '',                       en: '',                    es: '',                      de: '' },
  servicos:    { pt: 'servicos',               en: 'services',            es: 'servicios',             de: 'leistungen' },
  pecas:       { pt: 'pecas-de-reposicao',     en: 'spare-parts',         es: 'piezas-de-repuesto',    de: 'ersatzteile' },
  sistemas:    { pt: 'sistemas-roboticos',     en: 'robotic-systems',     es: 'sistemas-roboticos',    de: 'robotersysteme' },
  pushcorp:    { pt: 'solucoes-pushcorp',      en: 'pushcorp',            es: 'pushcorp',              de: 'pushcorp' },
  sobre:       { pt: 'sobre-nos',              en: 'about-us',            es: 'sobre-nosotros',        de: 'ueber-uns' },
  carreiras:   { pt: 'trabalhe-conosco',       en: 'careers',             es: 'trabaja-con-nosotros',  de: 'karriere' },
  contato:     { pt: 'contato',                en: 'contact',             es: 'contacto',              de: 'kontakt' },
  privacidade: { pt: 'politica-de-privacidade', en: 'privacy-policy',     es: 'politica-de-privacidad', de: 'datenschutz' },
  cookies:     { pt: 'politica-de-cookies',    en: 'cookie-policy',       es: 'politica-de-cookies',   de: 'cookie-richtlinie' },
  blog:        { pt: 'blog',                   en: 'blog',                es: 'blog',                  de: 'blog' },
  celulaPaletizacao1: { pt: 'celula-de-paletizacao-1', en: 'palletizing-cell-1', es: 'celula-de-paletizado-1', de: 'palettierzelle-1' },
  celulaPaletizacao2: { pt: 'celula-de-paletizacao-2', en: 'palletizing-cell-2', es: 'celula-de-paletizado-2', de: 'palettierzelle-2' },
  celulasManipulacao: { pt: 'celulas-de-manipulacao',  en: 'handling-cells',    es: 'celulas-de-manipulacion', de: 'handhabungszellen' },
} as const;

export type PageKey = keyof typeof ROUTES;

/**
 * Returns the localized path for a page, always with trailing slash.
 *
 * Rules:
 *   pt  + home       → /
 *   pt  + other      → /<slug>/
 *   en/es/de + home  → /<locale>/
 *   en/es/de + other → /<locale>/<slug>/
 */
export function localizedPath(pageKey: PageKey, locale: Locale): string {
  const slug = ROUTES[pageKey][locale];

  if (locale === 'pt') {
    // PT default locale — no locale prefix
    return slug === '' ? '/' : `/${slug}/`;
  }

  // Non-default locales — always prefixed
  return slug === '' ? `/${locale}/` : `/${locale}/${slug}/`;
}
