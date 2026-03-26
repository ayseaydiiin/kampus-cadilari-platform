import { joinApprovedEvent } from '../../../../utils/db.js';
import { checkRateLimit, isValidEmail, rateLimitResponse } from '../../../../utils/security.js';

export const prerender = false;

export async function POST({ params, request }) {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const rateLimit = checkRateLimit(request, 'events-join', { limit: 12, windowMs: 60 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimitResponse('Katilim gonderim limiti asildi', rateLimit.retryAfter);
    }

    const eventId = Number(params.id);
    const { email, name, message } = await request.json();

    if (!eventId || !email || !name) {
      return new Response(
        JSON.stringify({ success: false, error: 'event id, email ve name gerekli' }),
        { status: 400, headers }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Gecerli bir email girin' }),
        { status: 400, headers }
      );
    }

    const result = joinApprovedEvent({
      eventId,
      email: String(email).trim().toLowerCase(),
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
