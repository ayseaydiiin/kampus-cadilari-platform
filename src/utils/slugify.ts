export function slugify(text: string): string {
  if (!text) return '';

  return String(text)
    .replace(/[ıİ]/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateArticleSlug(title: string, fallbackId?: string): string {
  const slug = slugify(title);
  return slug || fallbackId || `article-${Date.now()}`;
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value);
}

export function unslugify(value: string): string {
  return String(value || '')
    .split('-')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}
