// src/utils/i18n.ts
export const languages = {
  tr: 'Türkçe',
  en: 'English'
} as const;

export type Language = keyof typeof languages;

export const translations = {
  tr: {
    // Navigation
    nav: {
      home: 'Ana Sayfa',
      articles: 'Yazılar',
      events: 'Etkinlikler',
      join: 'Bize Katıl',
      about: 'Hakkında',
      admin: 'Admin',
    },
    // Home
    hero: {
      title: 'Güçlü Kadınlar, Güçlü Gelecek',
      subtitle: 'Kampüslerden sokaklara feminist direnişin sesi',
      cta1: 'Yazıları Oku',
      cta2: 'Bize Katıl',
    },
    // Values
    values: {
      title: 'DEĞERLERİMİZ',
      freedom: 'ÖZGÜRLÜK',
      freedom_desc: 'Bedenimiz, emeğimiz ve kimliğimiz üzerindeki her türlü tahakküme karşı çıkıyoruz.',
      solidarity: 'DAYANIŞMA',
      solidarity_desc: 'Kızkardeşlik sınır tanımaz. Birimizin sesi kısıldığında diğerimiz çığlık oluruz.',
      struggle: 'MÜCADELE',
      struggle_desc: 'Eşit, özgür ve sömürüsüz bir dünya için kampüslerden sokaklara.',
    },
    // Breaking News
    breaking: {
      title: 'SON GÜNDEM',
      viewMore: 'Devamını Oku',
    },
    // Join
    join: {
      title: 'BİZE KATIL',
      subtitle: 'Haftalık bültenimize abone ol, gündemi kaçırma.',
      subscribe: 'Abone Ol',
    },
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      articles: 'Articles',
      events: 'Events',
      join: 'Join Us',
      about: 'About',
      admin: 'Admin',
    },
    // Home
    hero: {
      title: 'Strong Women, Strong Future',
      subtitle: 'The voice of feminist resistance from campuses to streets',
      cta1: 'Read Articles',
      cta2: 'Join Us',
    },
    // Values
    values: {
      title: 'OUR VALUES',
      freedom: 'FREEDOM',
      freedom_desc: 'We stand against any form of oppression over our bodies, labor, and identity.',
      solidarity: 'SOLIDARITY',
      solidarity_desc: 'Sisterhood knows no borders. When one of us is silenced, we all scream.',
      struggle: 'STRUGGLE',
      struggle_desc: 'For an equal, free and exploitation-free world from campuses to streets.',
    },
    // Breaking News
    breaking: {
      title: 'BREAKING NEWS',
      viewMore: 'Read More',
    },
    // Join
    join: {
      title: 'JOIN US',
      subtitle: 'Subscribe to our weekly bulletin, don\'t miss the news.',
      subscribe: 'Subscribe',
    },
  }
} as const;

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}