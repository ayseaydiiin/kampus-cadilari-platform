import { getPublishedArticles } from '../../../utils/db.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

function toCategorySlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET({ url }) {
  try {
    const category = String(url.searchParams.get('category') || '').trim();
    const search = String(url.searchParams.get('search') || '').trim();

    const all = getPublishedArticles({ search: search || null });
    const categories = Array.from(
      new Map(
        all
          .filter((item) => item.category)
          .map((item) => [item.category, { name: item.category, slug: toCategorySlug(item.category) }])
      ).values()
    ).sort((a, b) => String(a.name).localeCompare(String(b.name), 'tr'));

    const filtered = category
      ? all.filter((item) => toCategorySlug(item.category || '') === category)
      : all;

    return new Response(
      JSON.stringify({
        success: true,
        data: filtered,
        categories,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
