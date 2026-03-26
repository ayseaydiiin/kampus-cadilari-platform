import { recordProposalDecision, getProposalApprovals, getEventProposalById } from '../../../../../utils/db.js';
import { requireAdmin } from '../../../../../utils/adminAuth.js';

export const prerender = false;

export async function POST(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { params, request } = context;
  const headers = { 'Content-Type': 'application/json' };

  try {
    const { id } = params;
    const { comment } = await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'id zorunlu' }),
        { status: 400, headers }
      );
    }

    const decision = recordProposalDecision({
      proposalId: Number(id),
      adminEmail: auth.admin.email,
      decision: 'rejected',
      comment,
    });

    if (!decision.success) {
      return new Response(JSON.stringify(decision), { status: 400, headers });
    }

    const approvals = getProposalApprovals(Number(id));
    const proposal = getEventProposalById(Number(id));

    return new Response(
      JSON.stringify({
        success: true,
        status: decision.status,
        approvals,
        proposal,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers }
    );
  }
}
