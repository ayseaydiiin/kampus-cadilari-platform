import {
  createArchiveEntry,
  getArchiveApprovals,
  getArchiveEntries,
  getActiveAdmins,
} from '../../../utils/db.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function GET({ url }) {
  try {
    const status = url.searchParams.get('status');
    const decade = url.searchParams.get('decade');
    const search = url.searchParams.get('search');

    const filters = {};
    if (status && status !== 'all') filters.status = status;
    if (decade && decade !== 'all') filters.decade = decade;
    if (search) filters.search = search;

    const entries = getArchiveEntries(filters).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const adminCount = getActiveAdmins().length;

    const data = entries.map((entry) => {
      const approvals = getArchiveApprovals(entry.id);
      const approvedCount = approvals.filter((item) => item.decision === 'approved').length;
      const rejectedCount = approvals.filter((item) => item.decision === 'rejected').length;
      return {
        ...entry,
        approvals,
        approval_summary: {
          adminCount,
          approvedCount,
          rejectedCount,
          pendingCount: Math.max(adminCount - approvedCount - rejectedCount, 0),
        },
      };
    });

    return new Response(JSON.stringify({ success: true, data }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json();

    if (!body.publication_name || !body.title || !body.publication_year) {
      return new Response(
        JSON.stringify({ success: false, error: 'publication_name, title ve publication_year zorunlu' }),
        { status: 400, headers }
      );
    }

    const result = createArchiveEntry({
      publication_name: String(body.publication_name).trim(),
      title: String(body.title).trim(),
      publication_year: Number(body.publication_year),
      decade: body.decade || null,
      focus_topic: body.focus_topic || null,
      summary: body.summary || null,
      quote_text: body.quote_text || null,
      cover_image_url: body.cover_image_url || null,
      pdf_url: body.pdf_url || null,
      source_url: body.source_url || null,
      submitted_by: body.submitted_by || 'Admin',
      submitted_email: body.submitted_email || null,
      status: body.status || 'pending',
      reviewed_by: body.reviewed_by || null,
    });

    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400, headers });
    }

    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

