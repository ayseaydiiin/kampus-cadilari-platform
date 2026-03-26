import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  addArticleComment,
} from '../../../utils/db.js';
import { requireAdmin } from '../../../utils/adminAuth.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
};

export async function GET(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { url } = context;
  try {
    const id = Number(url.searchParams.get('id') || '0');
    if (id > 0) {
      const article = getArticleById(id);
      return new Response(JSON.stringify({ success: true, data: article }), { status: 200, headers });
    }

    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const articles = getArticles({ status, category, search });
    return new Response(JSON.stringify({ success: true, data: articles }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

export async function POST(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { request } = context;
  try {
    const data = await request.json();
    const action = data.action || 'save';

    if (action === 'comment') {
      const { articleId, comment } = data;
      if (!articleId || !comment) {
        return new Response(
          JSON.stringify({ success: false, error: 'articleId ve comment zorunlu' }),
          { status: 400, headers }
        );
      }

      const result = addArticleComment({
        articleId: Number(articleId),
        adminEmail: auth.admin.email,
        comment: String(comment).trim(),
      });

      if (!result.success) {
        return new Response(JSON.stringify(result), { status: 400, headers });
      }

      return new Response(JSON.stringify({ success: true, id: result.id }), { status: 200, headers });
    }

    const { id, title, slug, body, category, status, excerpt, image_url } = data;
    if (!title || !slug || !body) {
      return new Response(JSON.stringify({ success: false, error: 'title, slug ve body zorunlu' }), { status: 400, headers });
    }

    const payload = {
      title: String(title).trim(),
      slug: String(slug).trim(),
      body: String(body).trim(),
      category: category ? String(category).trim() : null,
      status: status ? String(status).trim() : 'pending_approval',
      excerpt: excerpt ? String(excerpt).trim() : null,
      image_url: image_url ? String(image_url).trim() : null,
    };

    const result = id
      ? updateArticle({ id: Number(id), ...payload, updated_by: auth.admin.email })
      : createArticle({ ...payload, created_by: auth.admin.email });

    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400, headers });
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id || Number(id), status: result.status }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

export async function DELETE(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { request } = context;
  try {
    const data = await request.json();
    const { id, reason } = data;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'id zorunlu' }), { status: 400, headers });
    }
    const result = deleteArticle(Number(id), { reason: reason ? String(reason).trim() : null, adminEmail: auth.admin.email });
    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 500, headers });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
