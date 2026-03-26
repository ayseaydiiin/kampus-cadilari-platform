import { getApplications, updateApplicationStatus, getApplicationById } from '../../../utils/db.js';
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
    const province = url.searchParams.get('province');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const id = url.searchParams.get('id');

    const filters = {};
    if (id) {
      const single = getApplicationById(id);
      return new Response(JSON.stringify(single ? [single] : []), { status: 200, headers });
    }
    if (province && province !== 'all') filters.province = province;
    if (status && status !== 'all') filters.status = status;
    if (search) filters.search = search;

    const applications = getApplications(filters);

    return new Response(JSON.stringify(applications), { status: 200, headers });
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
    const { id, status, notes } = data;

    if (!id || !status) {
      return new Response(
        JSON.stringify({ success: false, error: 'ID ve durum gerekli' }),
        { status: 400, headers }
      );
    }

    const result = updateApplicationStatus(id, status, auth.admin.email, notes);

    // Send email if configured
    const application = getApplicationById(id);
    if (application?.email) {
      const statusLabel = status.toUpperCase();
      sendEmail({
        to: application.email,
        subject: `Application ${statusLabel} - Kampüs Cadıları`,
        text: `Hello ${application.full_name || ''}, your application status is updated to: ${statusLabel}. Notes: ${notes || '—'}`,
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
