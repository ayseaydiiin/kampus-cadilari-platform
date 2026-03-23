import { getApprovedArchiveEntries } from '../../../utils/db.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function GET({ url }) {
  try {
    const decade = url.searchParams.get('decade');
    const search = url.searchParams.get('search');
    const focus = url.searchParams.get('focus');
    const limit = Number(url.searchParams.get('limit') || 0);

    const filters = {};
    if (decade && decade !== 'all') filters.decade = decade;
    if (search) filters.search = search;
    if (focus && focus !== 'all') filters.focus = focus;
    if (limit > 0) filters.limit = limit;

    const items = getApprovedArchiveEntries(filters);
    const allApproved = getApprovedArchiveEntries();

    const decades = [...new Set(allApproved.map((item) => item.decade).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'tr'));
    const focusTopics = [...new Set(allApproved.map((item) => item.focus_topic).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'tr'));

    return new Response(
      JSON.stringify({
        success: true,
        items,
        meta: {
          total: allApproved.length,
          filtered: items.length,
          decades,
          focusTopics,
        },
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

