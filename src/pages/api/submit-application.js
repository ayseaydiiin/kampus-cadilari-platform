import { createApplication } from '../../utils/db.js';
import { checkRateLimit, isValidEmail, rateLimitResponse } from '../../utils/security.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const rateLimit = checkRateLimit(request, 'submit-application', { limit: 8, windowMs: 60 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimitResponse('Basvuru gonderim limiti asildi', rateLimit.retryAfter);
    }

    const data = await request.json();

    // Validation
    if (!data.full_name || !data.email || !data.province) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Ad, email ve il zorunludur',
        }),
        { status: 400, headers }
      );
    }

    // Email format validation
    if (!isValidEmail(data.email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Geçerli bir email adresi giriniz',
        }),
        { status: 400, headers }
      );
    }

    if (String(data.full_name || '').trim().length < 2 || String(data.full_name || '').trim().length > 120) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Ad alani 2-120 karakter olmali',
        }),
        { status: 400, headers }
      );
    }

    // Save to database
    const result = createApplication({
      full_name: String(data.full_name).trim(),
      email: String(data.email).trim().toLowerCase(),
      phone: data.phone ? String(data.phone).trim() : null,
      province: String(data.province).trim(),
      organization: data.organization ? String(data.organization).trim() : null,
      skills: data.skills, // Array
      social_media: data.social_media ? String(data.social_media).trim() : null,
      message: data.message ? String(data.message).trim().slice(0, 5000) : null,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Başvuru kaydedilemedi: ' + result.error,
        }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Başvurunuz başarıyla kaydedildi',
        applicationId: result.id,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Sunucu hatası: ' + error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
