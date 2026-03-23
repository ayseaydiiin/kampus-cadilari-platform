import { createParticipation } from '../../utils/db.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    const data = await request.json();
    if (!data.event_title) {
      return new Response(JSON.stringify({ success: false, error: 'event_title zorunlu' }), { status: 400, headers });
    }
    const result = createParticipation(data);
    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 500, headers });
    }
    return new Response(JSON.stringify({ success: true, id: result.id }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
