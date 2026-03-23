import { joinApprovedEvent } from '../../../../utils/db.js';

export const prerender = false;

export async function POST({ params, request }) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  try {
    const eventId = Number(params.id);
    const { email, name, message } = await request.json();

    if (!eventId || !email || !name) {
      return new Response(
        JSON.stringify({ success: false, error: 'event id, email ve name gerekli' }),
        { status: 400, headers }
      );
    }

    const result = joinApprovedEvent({
      eventId,
      email: String(email).trim(),
      name: String(name).trim(),
      message: message ? String(message).trim() : null,
    });

    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400, headers });
    }

    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
