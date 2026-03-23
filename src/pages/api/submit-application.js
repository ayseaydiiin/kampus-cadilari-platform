import { createApplication } from '../../utils/db.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Geçerli bir email adresi giriniz',
        }),
        { status: 400, headers }
      );
    }

    // Save to database
    const result = createApplication({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      province: data.province,
      organization: data.organization,
      skills: data.skills, // Array
      social_media: data.social_media,
      message: data.message,
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
