import { getApprovedEventById } from '../../../utils/db.js';

export const prerender = false;

export async function GET({ params }) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  try {
    const eventId = Number(params.id);
    if (!eventId) {
      return new Response(JSON.stringify({ success: false, error: 'gecersiz event id' }), { status: 400, headers });
    }

    const event = getApprovedEventById(eventId);
    if (!event) {
      return new Response(JSON.stringify({ success: false, error: 'Etkinlik bulunamadi' }), { status: 404, headers });
    }

    return new Response(JSON.stringify({ success: true, event }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
