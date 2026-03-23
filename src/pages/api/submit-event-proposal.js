import { createEventProposal } from '../../utils/db.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    const data = await request.json();

    // Validation
    if (!data.title || !data.proposed_by || !data.email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Başlık, adınız ve email zorunludur',
        }),
        { status: 400, headers }
      );
    }

    // Email validation
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
    const result = createEventProposal({
      title: data.title,
      description: data.description,
      proposed_by: data.proposed_by,
      email: data.email,
      province: data.province,
      category: data.category,
      date_suggested: data.date_suggested,
      organizer_phone: data.phone || data.organizer_phone,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Etkinlik önerisi kaydedilemedi: ' + result.error,
        }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Etkinlik öneriniz başarıyla kaydedildi',
        proposalId: result.id,
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
      { status: 500, headers }
    );
  }
}
