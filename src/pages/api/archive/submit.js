import { createArchiveEntry } from '../../../utils/db.js';
import { checkRateLimit, isValidEmail, rateLimitResponse } from '../../../utils/security.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
};

export async function POST({ request }) {
  try {
    const rateLimit = checkRateLimit(request, 'archive-submit', { limit: 6, windowMs: 60 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimitResponse('Arsiv onerisi limiti asildi', rateLimit.retryAfter);
    }

    const data = await request.json();

    if (!data.publication_name || !data.title || !data.publication_year) {
      return new Response(
        JSON.stringify({ success: false, error: 'publication_name, title ve publication_year zorunlu' }),
        { status: 400, headers }
      );
    }

    if (data.submitted_email && !isValidEmail(data.submitted_email)) {
      return new Response(JSON.stringify({ success: false, error: 'Gecerli bir email girin' }), { status: 400, headers });
    }

    const result = createArchiveEntry({
      publication_name: String(data.publication_name).trim(),
      title: String(data.title).trim(),
      publication_year: Number(data.publication_year),
      focus_topic: data.focus_topic || null,
      summary: data.summary || null,
      quote_text: data.quote_text || null,
      cover_image_url: data.cover_image_url || null,
      pdf_url: data.pdf_url || null,
      source_url: data.source_url || null,
      submitted_by: data.submitted_by ? String(data.submitted_by).trim() : 'Anonim',
      submitted_email: data.submitted_email ? String(data.submitted_email).trim().toLowerCase() : null,
    });

    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400, headers });
    }

    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

