import { createEventProposal, isEventProposalNameTaken } from '../../../utils/db.js';

export const prerender = false;

export async function POST({ request }) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  try {
    const {
      title,
      category,
      regionId,
      provinceName,
      description,
      email,
      phone,
      organizerName,
    } = await request.json();

    const hasRegion = Number(regionId) > 0;
    if (!title || !category || !hasRegion || !description || !email || !organizerName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Zorunlu alanlar eksik (title, category, city, description, email, organizerName)' }),
        { status: 400, headers }
      );
    }

    if (String(description).trim().length < 50) {
      return new Response(
        JSON.stringify({ success: false, error: 'Aciklama en az 50 karakter olmali' }),
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
      email: String(email).trim(),
      province: provinceName ? String(provinceName).trim() : String(regionId),
      category: String(category).trim(),
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
