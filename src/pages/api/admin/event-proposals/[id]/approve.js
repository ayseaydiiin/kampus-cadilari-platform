import { recordProposalDecision, getProposalApprovals, getEventProposalById } from '../../../../../utils/db.js';

export const prerender = false;

export async function POST({ params, request }) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const { id } = params;
    const { adminEmail, comment } = await request.json();

    if (!id || !adminEmail) {
      return new Response(
        JSON.stringify({ success: false, error: 'id ve adminEmail zorunlu' }),
        { status: 400, headers }
      );
    }

    const decision = recordProposalDecision({
      proposalId: Number(id),
      adminEmail,
      decision: 'approved',
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
