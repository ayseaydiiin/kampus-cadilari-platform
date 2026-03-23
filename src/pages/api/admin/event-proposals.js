import {
  getEventProposals,
  updateEventProposalStatus,
  getEventProposalById,
  getProposalApprovals,
  getActiveAdmins,
} from '../../../utils/db.js';
import { sendEmail } from '../../../utils/mailer.js';

export const prerender = false;

export async function GET({ url }) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    // Get filter parameters
    const status = url.searchParams.get('status');
    const province = url.searchParams.get('province');
    const search = url.searchParams.get('search');
    const id = url.searchParams.get('id');

    const filters = {};
    if (id) {
      const single = getEventProposalById(id);
      return new Response(JSON.stringify(single ? [single] : []), { status: 200, headers });
    }
    if (status && status !== 'all') filters.status = status;
    if (province && province !== 'all') filters.province = province;
    if (search) filters.search = search;

    const proposals = getEventProposals(filters);
    const adminCount = getActiveAdmins().length;
    const withApprovals = proposals.map((proposal) => {
      const approvals = getProposalApprovals(proposal.id);
      const approvedCount = approvals.filter((item) => item.decision === 'approved').length;
      const rejectedCount = approvals.filter((item) => item.decision === 'rejected').length;
      return {
        ...proposal,
        approval_summary: {
          adminCount,
          approvedCount,
          rejectedCount,
          pendingCount: Math.max(adminCount - approvedCount - rejectedCount, 0),
        },
        approvals,
      };
    });

    return new Response(JSON.stringify(withApprovals), { status: 200, headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT({ request }) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    const data = await request.json();
    const { id, status, notes, reviewedBy } = data;

    if (!id || !status) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID ve durum gerekli' }),
        { status: 400, headers }
      );
    }

    const result = updateEventProposalStatus(id, status, reviewedBy, notes);

    // Send email if configured
    const proposal = getEventProposalById(id);
    if (proposal?.email) {
      const statusLabel = status.toUpperCase();
      sendEmail({
        to: proposal.email,
        subject: `Event Proposal ${statusLabel} - Kampüs Cadıları`,
        text: `Merhaba ${proposal.proposed_by || ''}, etkinlik önerinizin durumu: ${statusLabel}. Not: ${notes || '—'}`,
      });
    }

    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers }
    );
  }
}
