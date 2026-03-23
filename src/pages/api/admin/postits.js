import {
  getPostits,
  getPostitById,
  getPostitComments,
  getPostitRevisions,
  createPostit,
  updatePostit,
  addPostitComment,
  deletePostit,
} from '../../../utils/db.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function GET({ url }) {
  try {
    const id = Number(url.searchParams.get('id'));
    const postitId = Number(url.searchParams.get('postitId'));
    const view = url.searchParams.get('view');

    if (id) {
      const postit = getPostitById(id);
      return new Response(JSON.stringify({ success: true, data: postit }), { status: 200, headers });
    }

    if (postitId && view === 'comments') {
      const comments = getPostitComments(postitId);
      return new Response(JSON.stringify({ success: true, data: comments }), { status: 200, headers });
    }

    if (postitId && view === 'revisions') {
      const revisions = getPostitRevisions(postitId);
      return new Response(JSON.stringify({ success: true, data: revisions }), { status: 200, headers });
    }

    const postits = getPostits();
    return new Response(JSON.stringify({ success: true, data: postits }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

export async function POST({ request }) {
  try {
    const data = await request.json();
    const action = data.action || 'create';

    if (action === 'comment') {
      const { postitId, comment, author } = data;
      if (!postitId || !comment) {
        return new Response(JSON.stringify({ success: false, error: 'postitId ve comment zorunlu' }), { status: 400, headers });
      }
      const commentResult = addPostitComment({ postitId: Number(postitId), comment, author });
      if (!commentResult.success) {
        return new Response(JSON.stringify(commentResult), { status: 400, headers });
      }
      return new Response(JSON.stringify({ success: true, id: commentResult.id }), { status: 200, headers });
    }

    const { title, text, color, author, status } = data;
    if (!title || !text) {
      return new Response(JSON.stringify({ success: false, error: 'title ve text zorunlu' }), { status: 400, headers });
    }
    const result = createPostit({ title, text, color, author, status });
    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 500, headers });
    }
    return new Response(JSON.stringify({ success: true, id: result.id }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

export async function PUT({ request }) {
  try {
    const data = await request.json();
    const { id, title, text, color, status, editor, reason } = data;
    if (!id || !title || !text) {
      return new Response(JSON.stringify({ success: false, error: 'id, title ve text zorunlu' }), { status: 400, headers });
    }
    const result = updatePostit({ id, title, text, color, status, editor, reason });
    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400, headers });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

export async function DELETE({ request }) {
  try {
    const data = await request.json();
    const { id } = data;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'id zorunlu' }), { status: 400, headers });
    }
    const result = deletePostit(id);
    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 500, headers });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
