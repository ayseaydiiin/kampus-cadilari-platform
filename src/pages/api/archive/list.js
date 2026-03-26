import { getApprovedArchiveEntries } from '../../../utils/db.js';
import { toEnglishArchiveItem } from '../../../utils/contentI18n.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function GET({ url }) {
  try {
    const decade = url.searchParams.get('decade');
    const search = url.searchParams.get('search');
    const focus = url.searchParams.get('focus');
    const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'tr';
    const limit = Number(url.searchParams.get('limit') || 0);

    const itemsRaw = getApprovedArchiveEntries();
    const allApprovedRaw = getApprovedArchiveEntries();
    const normalizedSearch = String(search || '').trim().toLowerCase();
    const localizedItems = lang === 'en' ? itemsRaw.map((item) => toEnglishArchiveItem(item)) : itemsRaw;
    const items = localizedItems.filter((item) => {
      if (decade && decade !== 'all' && item.decade !== decade) return false;
      if (focus && focus !== 'all' && item.focus_topic !== focus) return false;
      if (!normalizedSearch) return true;
      const haystack = `${item.publication_name || ''} ${item.title || ''} ${item.focus_topic || ''} ${item.summary || ''}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
    const allApproved = lang === 'en' ? allApprovedRaw.map((item) => toEnglishArchiveItem(item)) : allApprovedRaw;
    const limitedItems = limit > 0 ? items.slice(0, Math.min(limit, 200)) : items;

    const decades = [...new Set(allApproved.map((item) => item.decade).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, lang === 'en' ? 'en' : 'tr'));
    const focusTopics = [...new Set(allApproved.map((item) => item.focus_topic).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, lang === 'en' ? 'en' : 'tr'));

    return new Response(
      JSON.stringify({
        success: true,
        items: limitedItems,
        meta: {
          total: allApproved.length,
          filtered: items.length,
          decades,
          focusTopics,
        },
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

