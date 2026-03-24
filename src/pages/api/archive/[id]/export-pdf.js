import { getArchiveById } from '../../../../utils/db.js';
import { buildArchivePdfLines, createTextPdf } from '../../../../utils/simplePdf.js';
import { toEnglishArchiveItem } from '../../../../utils/contentI18n.js';

export const prerender = false;

function toSafeFilename(value) {
  return String(value || 'archive-record')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'archive-record';
}

export async function GET({ params, url }) {
  try {
    const archiveId = Number(params.id);
    if (!Number.isFinite(archiveId)) {
      return new Response(JSON.stringify({ success: false, error: 'Gecersiz arsiv kaydi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const item = getArchiveById(archiveId);
    if (!item || item.status !== 'approved') {
      return new Response(JSON.stringify({ success: false, error: 'Arsiv kaydi bulunamadi' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'tr';
    const localizedItem = lang === 'en' ? toEnglishArchiveItem(item) : item;
    const lines = buildArchivePdfLines(localizedItem, lang);
    const title = lang === 'en' ? `Archive Record - ${localizedItem.title || localizedItem.publication_name || localizedItem.id}` : `Arsiv Kaydi - ${localizedItem.title || localizedItem.publication_name || localizedItem.id}`;
    const pdf = createTextPdf({ title, lines, creator: 'Kampus Cadilari Archive Export' });

    const fileName = `${toSafeFilename(localizedItem.publication_name)}-${toSafeFilename(localizedItem.title)}-${localizedItem.publication_year || localizedItem.id}.pdf`;

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
