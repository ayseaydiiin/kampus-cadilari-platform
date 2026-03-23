import { getArchiveApprovals, getArchiveById, recordArchiveDecision } from '../../../../../utils/db.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function POST({ params, request }) {
  try {
    const archiveId = Number(params.id);
    const { adminEmail, comment } = await request.json();

    if (!archiveId || !adminEmail) {
      return new Response(
        JSON.stringify({ success: false, error: 'archive id ve adminEmail zorunlu' }),
        { status: 400, headers }
      );
    }

    const decision = recordArchiveDecision({
      archiveId,
      adminEmail,
      decision: 'rejected',
      comment,
    });

    if (!decision.success) {
      return new Response(JSON.stringify(decision), { status: 400, headers });
    }

    const archive = getArchiveById(archiveId);
    const approvals = getArchiveApprovals(archiveId);

    return new Response(
      JSON.stringify({
        success: true,
        status: decision.status,
        archive,
        approvals,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

