import { recordArticleDecision, getArticleApprovals, getArticleById } from '../../../../../utils/db.js';
import { requireAdmin } from '../../../../../utils/adminAuth.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
};

export async function POST(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { params, request } = context;
  try {
    const articleId = Number(params.id);
    const { comment } = await request.json();

    if (!articleId) {
      return new Response(
        JSON.stringify({ success: false, error: 'id zorunlu' }),
        { status: 400, headers }
      );
    }

    const decision = recordArticleDecision({
      articleId,
      adminEmail: auth.admin.email,
      decision: 'approved',
      comment: comment ? String(comment).trim() : null,
    });

    if (!decision.success) {
      return new Response(JSON.stringify(decision), { status: 400, headers });
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: decision.status,
        approvals: getArticleApprovals(articleId),
        article: getArticleById(articleId),
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
