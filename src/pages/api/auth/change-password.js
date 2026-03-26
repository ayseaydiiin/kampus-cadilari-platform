import { requireAdmin } from '../../../utils/adminAuth.js';
import { checkRateLimit, rateLimitResponse } from '../../../utils/security.js';
import { updateUserPassword, verifyUserCredentials } from '../../../utils/db.js';

export const prerender = false;

const headers = { 'Content-Type': 'application/json' };

export async function POST(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { request } = context;
  try {
    const rateLimit = checkRateLimit(request, 'auth-change-password', { limit: 6, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimitResponse('Cok fazla deneme yapildi', rateLimit.retryAfter);
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');
    const confirmPassword = String(body.confirmPassword || '');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return new Response(JSON.stringify({ success: false, error: 'Tum alanlar zorunlu' }), { status: 400, headers });
    }

    if (newPassword.length < 8) {
      return new Response(JSON.stringify({ success: false, error: 'Yeni parola en az 8 karakter olmali' }), { status: 400, headers });
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    if (!hasUpper || !hasNumber || !hasSpecial) {
      return new Response(JSON.stringify({ success: false, error: 'Yeni parola en az 1 buyuk harf, 1 rakam ve 1 ozel karakter icermeli' }), { status: 400, headers });
    }

    if (newPassword !== confirmPassword) {
      return new Response(JSON.stringify({ success: false, error: 'Yeni parolalar uyusmuyor' }), { status: 400, headers });
    }

    if (newPassword === currentPassword) {
      return new Response(JSON.stringify({ success: false, error: 'Eski parola tekrar kullanilamaz' }), { status: 400, headers });
    }

    const verified = await verifyUserCredentials(auth.admin.email, currentPassword);
    if (!verified.success) {
      return new Response(JSON.stringify({ success: false, error: 'Mevcut parola dogrulanamadi' }), { status: 401, headers });
    }

    const result = await updateUserPassword(auth.admin.email, newPassword);
    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400, headers });
    }

    return new Response(JSON.stringify({ success: true, message: 'Parola guncellendi' }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
