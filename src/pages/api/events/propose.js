import { createEventProposal, isEventProposalNameTaken } from '../../../utils/db.js';
import { checkRateLimit, isValidEmail, rateLimitResponse } from '../../../utils/security.js';

export const prerender = false;

export async function POST({ request }) {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const rateLimit = checkRateLimit(request, 'events-propose', { limit: 8, windowMs: 60 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimitResponse('Etkinlik onerisi limiti asildi', rateLimit.retryAfter);
    }

    const {
      title,
      category,
      regionId,
      provinceName,
      eventDate,
      description,
      email,
      phone,
      organizerName,
    } = await request.json();

    const hasRegion = Number(regionId) > 0;
    const hasDate = typeof eventDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(eventDate);
    if (!title || !category || !hasRegion || !hasDate || !description || !email || !organizerName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Zorunlu alanlar eksik (title, category, city, eventDate, description, email, organizerName)' }),
        { status: 400, headers }
      );
    }

    if (String(description).trim().length < 50) {
      return new Response(
        JSON.stringify({ success: false, error: 'Aciklama en az 50 karakter olmali' }),
        { status: 400, headers }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Gecerli bir email girin' }),
        { status: 400, headers }
      );
    }

    if (isEventProposalNameTaken(String(title))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bu etkinlik adi daha once kullanilmis' }),
        { status: 409, headers }
      );
    }

    const result = createEventProposal({
      title: String(title).trim(),
      description: String(description).trim(),
      proposed_by: String(organizerName).trim(),
      email: String(email).trim().toLowerCase(),
      province: provinceName ? String(provinceName).trim() : String(regionId),
      category: String(category).trim(),
      date_suggested: String(eventDate),
      organizer_phone: phone ? String(phone).trim() : null,
    });

    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 500, headers });
    }

    return new Response(
      JSON.stringify({
        success: true,
        proposalId: result.id,
        message: 'Etkinlik onerisi basariyla gonderildi',
      }),
      { status: 201, headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
