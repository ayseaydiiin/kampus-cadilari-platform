import { getParticipations, getParticipationStats } from '../../../utils/db.js';

export const prerender = false;

const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export async function GET() {
  try {
    const data = getParticipations();
    const stats = getParticipationStats();
    return new Response(JSON.stringify({ success: true, data, stats }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
