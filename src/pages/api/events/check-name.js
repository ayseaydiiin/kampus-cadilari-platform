import { isEventProposalNameTaken } from '../../../utils/db.js';

export const prerender = false;

export async function POST({ request }) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  try {
    const { title } = await request.json();
    if (!title || !String(title).trim()) {
      return new Response(JSON.stringify({ exists: false, error: 'title gerekli' }), { status: 400, headers });
    }

    const exists = isEventProposalNameTaken(String(title));
    return new Response(
      JSON.stringify({
        exists,
        message: exists ? 'Bu etkinlik adi daha once kullanilmis' : 'Isim uygun',
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ exists: false, error: error.message }), { status: 500, headers });
  }
}
