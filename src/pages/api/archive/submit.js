import { createArchiveEntry } from '../../../utils/db.js';

export const prerender = false;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function POST({ request }) {
  try {
    const data = await request.json();

    if (!data.publication_name || !data.title || !data.publication_year) {
      return new Response(
        JSON.stringify({ success: false, error: 'publication_name, title ve publication_year zorunlu' }),
        { status: 400, headers }
      );
    }

    const result = createArchiveEntry({
      publication_name: String(data.publication_name).trim(),
      title: String(data.title).trim(),
      publication_year: Number(data.publication_year),
      focus_topic: data.focus_topic || null,
      summary: data.summary || null,
      quote_text: data.quote_text || null,
      cover_image_url: data.cover_image_url || null,
      pdf_url: data.pdf_url || null,
      source_url: data.source_url || null,
      submitted_by: data.submitted_by || 'Anonim',
      submitted_email: data.submitted_email || null,
    });

    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400, headers });
    }

    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

