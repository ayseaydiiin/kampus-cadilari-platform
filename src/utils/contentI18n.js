function normalizeKey(value) {
  return String(value || '')
    .replace(/[İIı]/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const TR_EN_PHRASE_MAP = [
  ['kadın', 'woman'],
  ['kadınlar', 'women'],
  ['feminist', 'feminist'],
  ['arşiv', 'archive'],
  ['arsiv', 'archive'],
  ['dayanışma', 'solidarity'],
  ['dayanisma', 'solidarity'],
  ['görünmeyen emek', 'invisible labor'],
  ['gundem', 'agenda'],
  ['gündem', 'agenda'],
  ['hak', 'right'],
  ['haklar', 'rights'],
  ['yayın', 'publication'],
  ['yayin', 'publication'],
  ['yazı', 'article'],
  ['yazi', 'article'],
  ['haber', 'news'],
  ['içerik', 'content'],
  ['icerik', 'content'],
  ['özet', 'summary'],
  ['ozet', 'summary'],
  ['detaylı', 'detailed'],
  ['detayli', 'detailed'],
  ['kampüs', 'campus'],
  ['kampus', 'campus'],
  ['mücadele', 'struggle'],
  ['mucadele', 'struggle'],
  ['özgürlük', 'freedom'],
  ['ozgurluk', 'freedom'],
];

function autoTranslateTrToEn(value) {
  const text = String(value || '').trim();
  if (!text) return text;

  let output = text;
  for (const [tr, en] of TR_EN_PHRASE_MAP) {
    const pattern = new RegExp(tr, 'gi');
    output = output.replace(pattern, (match) => {
      const first = match.charAt(0);
      if (first === first.toUpperCase()) {
        return en.charAt(0).toUpperCase() + en.slice(1);
      }
      return en;
    });
  }

  return output;
}

const ARTICLE_OVERRIDES_BY_ID = {
  6: {
    title: "Women's Identity in Feminist Discourse: Being a Woman in a Male-Dominated Society",
    excerpt:
      "This research article examines women's identity formation across social structures and discusses how feminist discourse strengthens autonomy against patriarchal norms.",
    body: [
      "This research article examines women's identity across different social structures and cultural definitions, and it underlines the role of feminist discourse in social and personal identity formation.",
      "A key focus is how much autonomy women can build against dominant patriarchal structures. The text also discusses this question through different feminist debates and highlights the direct link between household dynamics and identity construction.",
      "The home is framed as a space that can reproduce gender inequality. Within family life, role assignments for girls and boys can normalize unequal expectations early in life. For this reason, the article argues that deep social change for women must begin in private space as well as in public space.",
    ].join('\n\n'),
  },
  5: {
    title: 'Test Article Workflow',
    excerpt: 'Short draft content used for workflow checks.',
    body: 'Long text paragraph 1\n\nParagraph 2',
  },
  2: {
    title: 'Legal Notes',
    excerpt: 'Sample legal content record.',
    body: 'Sample legal content record.',
  },
};

const ARTICLE_OVERRIDES_BY_SLUG = {
  'kadin kimligi': ARTICLE_OVERRIDES_BY_ID[6],
  'test-yazi-1774289817795': ARTICLE_OVERRIDES_BY_ID[5],
  'flsalaos.com': ARTICLE_OVERRIDES_BY_ID[2],
};

const ARCHIVE_OVERRIDES_BY_ID = {
  1: {
    title: "Women's World - Special Issue on Equal Citizenship",
    publication_name: "Women's World",
    focus_topic: 'Right to vote and to be elected',
    summary:
      "An early publication that systematically documented women's demands and centered equal public representation.",
  },
  2: {
    title: 'Feminist - Solidarity and Labor Rights File',
    publication_name: 'Feminist',
    focus_topic: 'Labor rights and union organizing',
    summary:
      "A file that increases the visibility of women's labor and builds a shared political language between campuses and working-class neighborhoods.",
  },
  3: {
    title: 'Amargi - Campus, City and Media Analyses',
    publication_name: 'Amargi',
    focus_topic: 'Sexist language in media',
    summary:
      'A curated selection that analyzes news language and representation politics to strengthen collective feminist media literacy.',
  },
};

const ARCHIVE_OVERRIDES_BY_TITLE = {
  'kadinlar dunyasi - esit yurttaslik ozel sayisi': ARCHIVE_OVERRIDES_BY_ID[1],
  'feminist - dayanisma ve isci haklari dosyasi': ARCHIVE_OVERRIDES_BY_ID[2],
  'amargi - kampus, kent ve medya analizleri': ARCHIVE_OVERRIDES_BY_ID[3],
};

function resolveArticleOverride(article) {
  if (!article) return null;
  const byId = ARTICLE_OVERRIDES_BY_ID[Number(article.id)];
  if (byId) return byId;

  const slugKey = normalizeKey(article.slug);
  if (slugKey && ARTICLE_OVERRIDES_BY_SLUG[slugKey]) {
    return ARTICLE_OVERRIDES_BY_SLUG[slugKey];
  }

  const titleKey = normalizeKey(article.title);
  return ARTICLE_OVERRIDES_BY_SLUG[titleKey] || null;
}

function resolveArchiveOverride(item) {
  if (!item) return null;
  const byId = ARCHIVE_OVERRIDES_BY_ID[Number(item.id)];
  if (byId) return byId;

  const titleKey = normalizeKey(item.title);
  if (titleKey && ARCHIVE_OVERRIDES_BY_TITLE[titleKey]) {
    return ARCHIVE_OVERRIDES_BY_TITLE[titleKey];
  }

  return ARCHIVE_OVERRIDES_BY_TITLE[normalizeKey(item.publication_name)] || null;
}

export function toEnglishArticle(article) {
  if (!article) return article;
  const override = resolveArticleOverride(article);

  return {
    ...article,
    title: article.title_en || override?.title || autoTranslateTrToEn(article.title),
    excerpt: article.excerpt_en || override?.excerpt || autoTranslateTrToEn(article.excerpt),
    body: article.body_en || override?.body || autoTranslateTrToEn(article.body),
  };
}

export function toEnglishArchiveItem(item) {
  if (!item) return item;
  const override = resolveArchiveOverride(item);

  return {
    ...item,
    title: item.title_en || override?.title || autoTranslateTrToEn(item.title),
    publication_name: item.publication_name_en || override?.publication_name || autoTranslateTrToEn(item.publication_name),
    focus_topic: item.focus_topic_en || override?.focus_topic || autoTranslateTrToEn(item.focus_topic),
    summary: item.summary_en || override?.summary || autoTranslateTrToEn(item.summary),
    quote_text: item.quote_text_en || override?.quote_text || autoTranslateTrToEn(item.quote_text),
  };
}
