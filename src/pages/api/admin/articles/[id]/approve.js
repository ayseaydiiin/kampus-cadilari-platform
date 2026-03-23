import { recordArticleDecision, getArticleApprovals, getArticleById } from '../../../../../utils/db.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function POST({ params, request }) {
  try {
    const articleId = Number(params.id);
    const { adminEmail, comment } = await request.json();

    if (!articleId || !adminEmail) {
      return new Response(
        JSON.stringify({ success: false, error: 'id ve adminEmail zorunlu' }),
        { status: 400, headers }
      );
    }

    const decision = recordArticleDecision({
      articleId,
      adminEmail: String(adminEmail).trim(),
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
