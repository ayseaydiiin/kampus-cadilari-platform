import { getApprovedEvents } from '../../../utils/db.js';

export const prerender = false;

export async function GET({ url }) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  try {
    const filters = {};
    const category = url.searchParams.get('category');
    const province = url.searchParams.get('province');
    const search = url.searchParams.get('search');

    if (category && category !== 'all') filters.category = category;
    if (province && province !== 'all') filters.province = province;
    if (search) filters.search = search;

    const events = getApprovedEvents(filters);
    return new Response(JSON.stringify({ success: true, events }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, events: [], error: error.message }), { status: 500, headers });
  }
}
