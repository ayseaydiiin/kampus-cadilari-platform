import { slugify } from './slugify';

export type AppLang = 'tr' | 'en';

export type ArticleCategory = {
  key: string;
  tr: string;
  en: string;
  slug: string;
  aliases?: string[];
};

const CATEGORY_DEFINITIONS: ArticleCategory[] = [
  {
    key: 'history-memory',
    tr: 'Tarih ve Bellek',
    en: 'History and Memory',
    slug: 'history-memory',
    aliases: ['tarih-bellek'],
  },
  {
    key: 'culture-art',
    tr: 'Kultur ve Sanat',
    en: 'Culture and Art',
    slug: 'culture-art',
    aliases: ['kultur-sanat'],
  },
  {
    key: 'labor-economy',
    tr: 'Emek ve Ekonomi',
    en: 'Labor and Economy',
    slug: 'labor-economy',
    aliases: ['emek-ekonomi'],
  },
  {
    key: 'body-politics',
    tr: 'Beden Politikalari',
    en: 'Body Politics',
    slug: 'body-politics',
    aliases: ['beden-politikalari'],
  },
  {
    key: 'ecological-feminism',
    tr: 'Ekolojik Feminizm',
    en: 'Ecological Feminism',
    slug: 'ecological-feminism',
    aliases: ['eko-feminizm'],
  },
  {
    key: 'agenda-politics',
    tr: 'Gundem ve Politika',
    en: 'Agenda and Politics',
    slug: 'agenda-politics',
    aliases: ['gundem-politika'],
  },
];

const LEGACY_NAME_MAP: Record<string, { tr: string; en: string; slug: string }> = {
  hukuk: { tr: 'Gundem ve Politika', en: 'Agenda and Politics', slug: 'agenda-politics' },
  roportaj: { tr: 'Gundem ve Politika', en: 'Agenda and Politics', slug: 'agenda-politics' },
  roportajlar: { tr: 'Gundem ve Politika', en: 'Agenda and Politics', slug: 'agenda-politics' },
  'gorunmeyen kadinlar': { tr: 'Emek ve Ekonomi', en: 'Labor and Economy', slug: 'labor-economy' },
  'kultur sanat': { tr: 'Kultur ve Sanat', en: 'Culture and Art', slug: 'culture-art' },
  psikoloji: { tr: 'Beden Politikalari', en: 'Body Politics', slug: 'body-politics' },
  'cadi medya kolektifi': { tr: 'Gundem ve Politika', en: 'Agenda and Politics', slug: 'agenda-politics' },
  'legal analysis': { tr: 'Gundem ve Politika', en: 'Agenda and Politics', slug: 'agenda-politics' },
  interviews: { tr: 'Gundem ve Politika', en: 'Agenda and Politics', slug: 'agenda-politics' },
  'invisible women': { tr: 'Emek ve Ekonomi', en: 'Labor and Economy', slug: 'labor-economy' },
  'culture and art': { tr: 'Kultur ve Sanat', en: 'Culture and Art', slug: 'culture-art' },
  psychology: { tr: 'Beden Politikalari', en: 'Body Politics', slug: 'body-politics' },
  'media collective': { tr: 'Gundem ve Politika', en: 'Agenda and Politics', slug: 'agenda-politics' },
};

function normalize(value: string) {
  return String(value || '')
    .replace(/[İIı]/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function findCategoryByName(name: string) {
  const normalized = normalize(name);

  for (const category of CATEGORY_DEFINITIONS) {
    const names = [category.tr, category.en, category.key, ...(category.aliases || [])];
    if (names.some((candidate) => normalize(candidate) === normalized)) {
      return category;
    }
  }

  return null;
}

export function getCategoryDefinitions() {
  return CATEGORY_DEFINITIONS;
}

export function getCategoryInfo(name: string) {
  const category = findCategoryByName(name);
  if (category) {
    return {
      tr: category.tr,
      en: category.en,
      slug: category.slug,
    };
  }

  const legacy = LEGACY_NAME_MAP[normalize(name)];
  if (legacy) {
    return legacy;
  }

  const safeName = String(name || '').trim() || 'Gundem ve Politika';
  return {
    tr: safeName,
    en: safeName,
    slug: slugify(safeName) || 'agenda-politics',
  };
}

export function getCategoryLabel(name: string, lang: AppLang) {
  const info = getCategoryInfo(name);
  return lang === 'en' ? info.en : info.tr;
}

export function getCategorySlug(name: string) {
  return getCategoryInfo(name).slug;
}

export function getCategoryLabelBySlug(slug: string, lang: AppLang) {
  const found = CATEGORY_DEFINITIONS.find((category) => category.slug === String(slug || '').trim());
  if (!found) {
    return String(slug || '').trim();
  }
  return lang === 'en' ? found.en : found.tr;
}
