import { createUser } from '../../../utils/db.js';
import { checkRateLimit, isValidEmail, rateLimitResponse } from '../../../utils/security.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const rateLimit = checkRateLimit(request, 'auth-register', { limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimitResponse('Kayit denemesi limiti asildi', rateLimit.retryAfter);
    }

    const body = await request.json();
    const { action, email, password, fullName, username } = body;

    if (action === 'register') {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const normalizedUsername = String(username || '').trim();
      const normalizedFullName = String(fullName || '').trim();

      if (!normalizedEmail || !password || !normalizedUsername) {
        return new Response(JSON.stringify({ success: false, error: 'email, password ve username zorunlu' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!isValidEmail(normalizedEmail)) {
        return new Response(JSON.stringify({ success: false, error: 'Gecerli bir email girin' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (String(password).length < 10) {
        return new Response(JSON.stringify({ success: false, error: 'Sifre en az 10 karakter olmali' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (normalizedUsername.length < 3 || normalizedUsername.length > 40) {
        return new Response(JSON.stringify({ success: false, error: 'Username 3-40 karakter olmali' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Registration endpoint
      const result = await createUser(normalizedEmail, password, normalizedFullName || null, normalizedUsername);
      
      if (!result.success) {
        return new Response(JSON.stringify({ success: false, error: result.error }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, message: 'User registered successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
