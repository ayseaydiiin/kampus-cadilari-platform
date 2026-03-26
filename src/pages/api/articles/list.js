import { getPublishedArticles } from '../../../utils/db.js';
import { getCategoryDefinitions, getCategoryLabel, getCategorySlug } from '../../../utils/articleCategories.ts';
import { toEnglishArticle } from '../../../utils/contentI18n.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

function normalizeSearch(value) {
  return String(value || '').trim().toLowerCase();
}

export async function GET({ url }) {
  try {
    const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'tr';
    const category = String(url.searchParams.get('category') || '').trim();
    const search = normalizeSearch(url.searchParams.get('search'));
    const limit = Number(url.searchParams.get('limit') || 0);

    const baseItems = getPublishedArticles();
    const itemsByLang = lang === 'en' ? baseItems.map((article) => toEnglishArticle(article)) : baseItems;

    const filtered = itemsByLang.filter((article) => {
      const articleCategorySlug = getCategorySlug(article.category || 'Gundem ve Politika');
      const categoryMatch = !category || category === 'all' || articleCategorySlug === category;
      if (!categoryMatch) return false;

      if (!search) return true;
      const haystack = `${article.title || ''} ${article.excerpt || ''} ${article.body || ''}`.toLowerCase();
      return haystack.includes(search);
    });

    const limited = limit > 0 ? filtered.slice(0, Math.min(limit, 200)) : filtered;
    const allCategories = getCategoryDefinitions().map((item) => ({
      slug: item.slug,
      name: lang === 'en' ? item.en : item.tr,
    }));

    const categories = allCategories.map((categoryItem) => ({
      ...categoryItem,
      count: itemsByLang.filter(
        (article) => getCategorySlug(article.category || 'Gundem ve Politika') === categoryItem.slug
      ).length,
      label: getCategoryLabel(categoryItem.name, lang),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        items: limited,
        meta: {
          total: itemsByLang.length,
          filtered: filtered.length,
          lang,
          categories,
        },
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, items: [], error: error.message }), {
      status: 500,
      headers,
    });
  }
}
