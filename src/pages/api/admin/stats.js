import {
  getApplicationStats,
  getEventProposalStats,
  getParticipationStats,
  getArticleCount,
  getArchiveStats,
} from '../../../utils/db.js';
import { requireAdmin } from '../../../utils/adminAuth.js';

export const prerender = false;

export async function GET(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const headers = { 'Content-Type': 'application/json' };
  try {
    const applications = getApplicationStats();
    const proposals = getEventProposalStats();
    const participations = getParticipationStats();
    const articles = getArticleCount();
    const archive = getArchiveStats();
    return new Response(JSON.stringify({ success: true, applications, proposals, participations, articles, archive }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
