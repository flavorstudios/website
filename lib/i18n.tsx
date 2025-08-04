import { SITE_NAME, SITE_DESCRIPTION } from './constants';

export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const messages: Record<Locale, any> = {
  en: {
    site: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    blog: {
      notFoundTitle: 'Post Not Found – {siteName}',
      notFoundDescription:
        'Sorry, this blog post could not be found. Explore more inspiring anime blog posts at {siteName}.',
    },
    watch: {
      notFoundTitle: 'Video Not Found – {siteName}',
      notFoundDescription:
        'Sorry, this video could not be found. Explore more inspiring anime videos at {siteName}.',
    },
  },
  es: {
    site: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    blog: {
      notFoundTitle: 'Artículo no encontrado – {siteName}',
      notFoundDescription:
        'Lo sentimos, no pudimos encontrar este artículo. Explora más publicaciones inspiradoras en {siteName}.',
    },
    watch: {
      notFoundTitle: 'Video no encontrado – {siteName}',
      notFoundDescription:
        'Lo sentimos, no pudimos encontrar este video. Explora más videos inspiradores en {siteName}.',
    },
  },
};

function translate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

export function getTranslator(locale: string = defaultLocale, namespace: string) {
  const l: Locale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  return function t(key: string, vars: Record<string, string> = {}) {
    const ns = messages[l][namespace] || {};
    const fallbackNs = messages[defaultLocale][namespace] || {};
    const template = ns[key] || fallbackNs[key] || '';
    return translate(template, vars);
  };
}

export function useTranslations(locale: string, namespace: string) {
  return getTranslator(locale, namespace);
}