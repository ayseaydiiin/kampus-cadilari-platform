import { getArticleBySlug } from '../../../utils/db.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function GET({ params }) {
  try {
    const slug = String(params.slug || '').trim();
    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: 'slug gerekli' }), { status: 400, headers });
    }

    const article = getArticleBySlug(slug, { publishedOnly: true });
    if (!article) {
      return new Response(JSON.stringify({ success: false, error: 'Yazi bulunamadi' }), { status: 404, headers });
    }

    return new Response(JSON.stringify({ success: true, data: article }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
