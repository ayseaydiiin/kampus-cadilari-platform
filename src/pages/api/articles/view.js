import { getDatabase } from '../../../utils/db.js';
import { checkRateLimit, rateLimitResponse } from '../../../utils/security.js';
import { requireAdmin } from '../../../utils/adminAuth.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
};

export async function POST({ request }) {
  try {
    const rateLimit = checkRateLimit(request, 'article-view', { limit: 120, windowMs: 10 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimitResponse('Goruntuleme limiti asildi', rateLimit.retryAfter);
    }

    const { slug, articleId } = await request.json();
    const resolvedSlug = String(slug || articleId || '').trim();

    if (!resolvedSlug) {
      return new Response(JSON.stringify({ success: false, error: 'slug veya articleId gerekli' }), { status: 400, headers });
    }

    const db = getDatabase();
    try {
      db.prepare(`
        INSERT INTO article_view_stats (slug, view_count, updated_at)
        VALUES (?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(slug) DO UPDATE SET
          view_count = view_count + 1,
          updated_at = CURRENT_TIMESTAMP
      `).run(resolvedSlug);

      return new Response(JSON.stringify({ success: true, slug: resolvedSlug }), {
        status: 200,
        headers,
      });
    } finally {
      db.close();
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

export async function GET(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { url } = context;
  try {
    const slug = String(url.searchParams.get('slug') || '').trim();
    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: 'slug gerekli' }), { status: 400, headers });
    }

    const db = getDatabase();
    try {
      const row = db.prepare('SELECT view_count FROM article_view_stats WHERE slug = ?').get(slug);
      return new Response(JSON.stringify({ success: true, slug, view_count: row?.view_count || 0 }), { status: 200, headers });
    } finally {
      db.close();
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
