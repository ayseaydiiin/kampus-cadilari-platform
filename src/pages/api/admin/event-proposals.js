import {
  getEventProposals,
  updateEventProposalStatus,
  getEventProposalById,
  getProposalApprovals,
  getActiveAdmins,
} from '../../../utils/db.js';
import { sendEmail } from '../../../utils/mailer.js';
import { requireAdmin } from '../../../utils/adminAuth.js';

export const prerender = false;

export async function GET(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { url } = context;
  try {
    const headers = { 'Content-Type': 'application/json' };

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
    const requiredCount = 1;
    const withApprovals = proposals.map((proposal) => {
      const approvals = getProposalApprovals(proposal.id);
      const approvedCount = approvals.filter((item) => item.decision === 'approved').length;
      const rejectedCount = approvals.filter((item) => item.decision === 'rejected').length;
      return {
        ...proposal,
        approval_summary: {
          adminCount,
          requiredCount,
          approvedCount,
          rejectedCount,
          pendingCount: Math.max(requiredCount - approvedCount - rejectedCount, 0),
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

export async function PUT(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { request } = context;
  try {
    const headers = { 'Content-Type': 'application/json' };

    const data = await request.json();
    const { id, notes } = data;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID gerekli' }),
        { status: 400, headers }
      );
    }

    const result = updateEventProposalStatus(id, 'reviewed', auth.admin.email, notes);

    // Send email if configured
    const proposal = getEventProposalById(id);
    if (proposal?.email) {
      const statusLabel = 'REVIEWED';
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
