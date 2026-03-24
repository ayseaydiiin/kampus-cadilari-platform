const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const MARGIN_X = 48;
const MARGIN_TOP = 794;
const FONT_SIZE = 11;
const LINE_HEIGHT = 14;
const MAX_LINES_PER_PAGE = 50;
const CHARS_PER_LINE = 92;

function normalizeText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '  ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E\n]/g, '?');
}

function escapePdfText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapLine(line, maxChars = CHARS_PER_LINE) {
  const normalized = normalizeText(line).trim();
  if (!normalized) return [''];

  const words = normalized.split(/\s+/);
  const result = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    const next = `${current} ${word}`;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    result.push(current);
    current = word;
  }

  if (current) result.push(current);
  return result;
}

function textToLines(text) {
  const raw = normalizeText(text);
  const blocks = raw.split('\n');
  const lines = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) {
      lines.push('');
      continue;
    }
    lines.push(...wrapLine(trimmed));
  }

  return lines;
}

function buildPages(lines) {
  const safeLines = Array.isArray(lines) && lines.length ? lines : ['No content'];
  const pages = [];

  for (let i = 0; i < safeLines.length; i += MAX_LINES_PER_PAGE) {
    pages.push(safeLines.slice(i, i + MAX_LINES_PER_PAGE));
  }

  if (!pages.length) {
    pages.push(['No content']);
  }

  return pages;
}

function buildContentStream(lines) {
  const commands = [];
  commands.push('BT');
  commands.push(`/F1 ${FONT_SIZE} Tf`);
  commands.push(`${LINE_HEIGHT} TL`);
  commands.push(`${MARGIN_X} ${MARGIN_TOP} Td`);

  lines.forEach((line, index) => {
    commands.push(`(${escapePdfText(line)}) Tj`);
    if (index < lines.length - 1) {
      commands.push('T*');
    }
  });

  commands.push('ET');
  return commands.join('\n');
}

function createObjectTable(objects, rootId, infoId) {
  let output = '%PDF-1.4\n';
  const offsets = [0];

  for (let i = 1; i < objects.length; i += 1) {
    offsets[i] = Buffer.byteLength(output, 'utf8');
    output += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(output, 'utf8');
  output += `xref\n0 ${objects.length}\n`;
  output += '0000000000 65535 f \n';

  for (let i = 1; i < objects.length; i += 1) {
    output += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  output += 'trailer\n';
  output += `<< /Size ${objects.length} /Root ${rootId} 0 R /Info ${infoId} 0 R >>\n`;
  output += 'startxref\n';
  output += `${xrefOffset}\n`;
  output += '%%EOF';

  return Buffer.from(output, 'utf8');
}

export function createTextPdf({ title = 'Archive Export', lines = [], creator = 'Kampus Cadilari' } = {}) {
  const objects = [null];

  const addObject = (value) => {
    objects.push(value);
    return objects.length - 1;
  };

  const pagesId = addObject('');
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  const pageIds = [];
  const pages = buildPages(lines);

  pages.forEach((pageLines) => {
    const stream = buildContentStream(pageLines);
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${A4_WIDTH} ${A4_HEIGHT}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  });

  objects[pagesId] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  const infoId = addObject(`<< /Title (${escapePdfText(normalizeText(title))}) /Creator (${escapePdfText(normalizeText(creator))}) /Producer (${escapePdfText(normalizeText(creator))}) >>`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  return createObjectTable(objects, catalogId, infoId);
}

export function buildArchivePdfLines(item, lang = 'tr') {
  const isEn = lang === 'en';
  const createdAt = item?.created_at ? new Date(item.created_at) : null;
  const generatedAt = new Date();

  const lines = [
    isEn ? 'Campus Witches - Archive Record Export' : 'Kampus Cadilari - Arsiv Kaydi PDF Ciktisi',
    isEn ? `Generated: ${generatedAt.toISOString()}` : `Olusturma: ${generatedAt.toISOString()}`,
    '',
    `${isEn ? 'Title' : 'Baslik'}: ${item?.title || '-'}`,
    `${isEn ? 'Publication' : 'Yayin'}: ${item?.publication_name || '-'}`,
    `${isEn ? 'Publication Year' : 'Yayin Yili'}: ${item?.publication_year || '-'}`,
    `${isEn ? 'Period' : 'Donem'}: ${item?.decade || '-'}`,
    `${isEn ? 'Focus Topic' : 'Odak Noktasi'}: ${item?.focus_topic || (isEn ? 'General feminist agenda' : 'Genel feminist gundem')}`,
    `${isEn ? 'Status' : 'Durum'}: ${item?.status || '-'}`,
    `${isEn ? 'Source URL' : 'Kaynak URL'}: ${item?.source_url || '-'}`,
    `${isEn ? 'Record Created At' : 'Kayit Olusturma'}: ${createdAt ? createdAt.toISOString() : '-'}`,
    '',
    isEn ? 'Summary:' : 'Ozet:',
    ...(textToLines(item?.summary || (isEn ? 'No summary provided.' : 'Ozet bilgisi girilmedi.'))),
    '',
    isEn ? 'Quote / Highlight:' : 'Alinti / Not:',
    ...(textToLines(item?.quote_text || (isEn ? 'No quote provided.' : 'Alinti bilgisi girilmedi.'))),
    '',
    isEn ? 'Additional Notes:' : 'Ek Notlar:',
    ...(textToLines(
      isEn
        ? 'This PDF is generated directly by the system as a downloadable file from the full archive record content.'
        : 'Bu PDF, arsiv kaydinin tam govde iceriginden sistem tarafindan dogrudan indirilebilir dosya olarak olusturulmustur.'
    )),
  ];

  return lines;
}
